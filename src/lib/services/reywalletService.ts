import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { BlockchainAdapter } from '../web3/blockchainAdapter';
import { CredentialService } from './credentialService';

export class ReywalletService {
  // Fetch full organization state from Firestore with fallback defaults if new
  public static async fetchState(orgId: string = 'org_1') {
    try {
      const customersSnap = await getDocs(query(collection(db, 'customers'), where('organizationId', '==', orgId)));
      const invoicesSnap = await getDocs(query(collection(db, 'invoices'), where('organizationId', '==', orgId)));
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('organizationId', '==', orgId)));
      const quotesSnap = await getDocs(query(collection(db, 'quotes'), where('organizationId', '==', orgId)));
      const ledgerSnap = await getDocs(query(collection(db, 'ledger'), where('organizationId', '==', orgId)));
      const walletsSnap = await getDocs(query(collection(db, 'web3_wallets'), where('organizationId', '==', orgId)));
      const credsSnap = await getDocs(query(collection(db, 'digital_credentials'), where('organizationId', '==', orgId)));

      const customers = customersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const invoices = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const quotes = quotesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const ledger = ledgerSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const web3Wallets = walletsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const digitalCredentials = credsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      return {
        customers,
        invoices,
        payments,
        quotes,
        ledger,
        web3Wallets,
        digitalCredentials
      };
    } catch (error) {
      console.warn('Firestore fetch failed or initializing local context:', error);
      return null;
    }
  }

  // Atomic Financial Payment Registration in Firestore
  public static async registerPaymentAtomic(
    orgId: string,
    invoiceId: string,
    amount: number,
    sourceType: 'MANUAL' | 'PROVIDER' | 'BLOCKCHAIN',
    providerOrMethod: string,
    txHash?: string,
    walletAddress?: string
  ) {
    const batch = writeBatch(db);

    // 1. Create Payment Record
    const paymentRef = doc(collection(db, 'payments'));
    const paymentData = {
      organizationId: orgId,
      invoiceId,
      amount,
      currency: 'USD',
      sourceType,
      provider: providerOrMethod,
      transactionHash: txHash || null,
      walletAddress: walletAddress || null,
      status: 'CONFIRMED',
      verificationStatus: sourceType === 'BLOCKCHAIN' ? 'VERIFIED_ON_CHAIN' : 'VERIFIED_BY_SYSTEM',
      createdAt: new Date().toISOString()
    };
    batch.set(paymentRef, paymentData);

    // 2. Fetch and Update Invoice
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    if (invoiceSnap.exists()) {
      const inv = invoiceSnap.data();
      const currentPaid = Number(inv.paidAmount || 0);
      const total = Number(inv.total || 0);
      const newPaid = currentPaid + amount;
      const newStatus = newPaid >= total ? 'PAID' : 'PARTIALLY_PAID';

      batch.update(invoiceRef, {
        paidAmount: newPaid,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Create Ledger Journal Entry
    const ledgerRef = doc(collection(db, 'ledger'));
    batch.set(ledgerRef, {
      organizationId: orgId,
      referenceId: invoiceId,
      description: `Ingreso por Pago (${providerOrMethod}) Factura ID: ${invoiceId.slice(0,8)}`,
      amount,
      currency: 'USD',
      type: 'CREDIT',
      category: 'CUENTAS_POR_COBRAR',
      source: sourceType,
      createdAt: new Date().toISOString()
    });

    // 4. Create Audit Log Entry
    const auditRef = doc(collection(db, 'audit_logs'));
    batch.set(auditRef, {
      organizationId: orgId,
      action: 'PAYMENT_REGISTERED',
      details: `Registrado pago de $${amount} USD vía ${providerOrMethod}. Invoice: ${invoiceId}`,
      createdAt: new Date().toISOString()
    });

    // Execute atomic batch
    await batch.commit();
    return { success: true, paymentId: paymentRef.id };
  }

  // Real Web3 On-Chain Verification & Atomic Settlement
  public static async verifyAndProcessWeb3Payment(
    orgId: string,
    invoiceId: string,
    txHash: string,
    chainId: number = 137,
    expectedAmountUsd: number
  ) {
    const adapter = new BlockchainAdapter(chainId);
    const verification = await adapter.verifyTransaction(txHash);

    if (!verification.verified || verification.status !== 'CONFIRMED') {
      throw new Error(`La transacción en blockchain no pudo ser verificada. Estado: ${verification.status}. ${verification.error || ''}`);
    }

    // Process atomic payment registration upon verified blockchain tx
    return await this.registerPaymentAtomic(
      orgId,
      invoiceId,
      expectedAmountUsd,
      'BLOCKCHAIN',
      `Web3_${SUPPORTED_NETWORKS_NAME[chainId] || 'EVM'}`,
      txHash,
      verification.from
    );
  }
}

const SUPPORTED_NETWORKS_NAME: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  11155111: 'Sepolia'
};
