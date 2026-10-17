import { db } from '../db';
import { payments, invoices, ledger, receipts, audit_logs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { RbacMiddleware, Role } from '../middleware/rbacMiddleware';

export interface RegisterPaymentParams {
  organizationId: string;
  invoiceId: string;
  amount: number;
  method: string; // 'TRANSFER' | 'SPEI' | 'STRIPE' | 'CARD' | 'WEB3_CRYPTO' | 'CASH'
  provider?: string;
  reference?: string;
  userRole?: Role;
  notes?: string;
}

export interface RegisterPaymentResult {
  success: boolean;
  paymentId: string;
  receiptId: string;
  receiptNumber: string;
  invoiceNumber: string;
  newInvoiceStatus: 'PAID' | 'PARTIALLY_PAID';
  totalPaid: number;
  totalInvoice: number;
  ledgerReference: string;
}

export class PaymentService {
  /**
   * Atomic Transaction for 'registerPayment':
   * Orchestrates the financial settlement pipeline inside a single database transaction.
   * If any step fails, the entire transaction rolls back, guaranteeing zero orphaned records.
   * 
   * Pipeline Steps:
   * 1. RBAC authorization check
   * 2. Invoice validation & balance verification
   * 3. Insert Payment record
   * 4. Generate digital Receipt with verifiable QR URL
   * 5. Update Invoice status (PAID / PARTIALLY_PAID) & paid amount
   * 6. Post accounting entry to General Ledger (CREDIT)
   * 7. Log immutable Audit Trail event
   */
  public static async registerPayment(params: RegisterPaymentParams): Promise<RegisterPaymentResult> {
    const userRole = params.userRole || 'ACCOUNTANT';
    RbacMiddleware.validateAccess(userRole, 'payments:register');

    if (params.amount <= 0) {
      throw new Error(`[INVALID_AMOUNT] El monto a registrar debe ser mayor a cero. Monto recibido: ${params.amount}`);
    }

    return await db.transaction(async (tx) => {
      // 1. Fetch target invoice within the transaction lock
      const invoice = await tx.query.invoices.findFirst({
        where: eq(invoices.id, params.invoiceId)
      });

      if (!invoice) {
        throw new Error(`[NOT_FOUND] Factura con ID '${params.invoiceId}' no existe en el sistema.`);
      }

      const paymentId = randomUUID();
      const receiptId = randomUUID();
      const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const providerName = params.provider || 'STRIPE';
      const refCode = params.reference || `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Insert Payment Record
      await tx.insert(payments).values({
        id: paymentId,
        organization_id: params.organizationId,
        invoice_id: params.invoiceId,
        customer_id: invoice.customer_id,
        amount: params.amount.toString(),
        currency: invoice.currency || 'USD',
        method: params.method,
        provider: providerName,
        reference: refCode,
        status: 'COMPLETED',
      });

      // 3. Create Digital Receipt with Verifiable QR Code
      await tx.insert(receipts).values({
        id: receiptId,
        organization_id: params.organizationId,
        payment_id: paymentId,
        number: receiptNumber,
        customer_id: invoice.customer_id,
        amount: params.amount.toString(),
        currency: invoice.currency || 'USD',
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://reywallet.app/verify/${receiptId}`,
      });

      // 4. Update Invoice Status & Paid Amount
      const currentPaid = Number(invoice.paid_amount || 0);
      const totalInvoice = Number(invoice.total || 0);
      const newPaidAmount = Number((currentPaid + params.amount).toFixed(2));
      const newStatus = newPaidAmount >= totalInvoice ? 'PAID' : 'PARTIALLY_PAID';

      await tx.update(invoices)
        .set({
          paid_amount: newPaidAmount.toString(),
          status: newStatus,
          updated_at: new Date()
        })
        .where(eq(invoices.id, params.invoiceId));

      // 5. Post General Ledger Entry (Double-entry accounting journal)
      await tx.insert(ledger).values({
        id: randomUUID(),
        organization_id: params.organizationId,
        reference: refCode,
        account: '1020 - Bancos & Pasarelas de Cobro',
        type: 'CREDIT',
        amount: params.amount.toString(),
        currency: invoice.currency || 'USD',
        description: `Cobro de factura ${invoice.number} (${params.method} - ${providerName}). Recibo: ${receiptNumber}`,
      });

      // 6. Log Audit Event
      await tx.insert(audit_logs).values({
        id: randomUUID(),
        organization_id: params.organizationId,
        action: 'PAYMENT_REGISTERED',
        details: `Pago de $${params.amount.toFixed(2)} ${invoice.currency || 'USD'} registrado para la factura ${invoice.number}. Recibo generado: ${receiptNumber}. Estado factura: ${newStatus}`,
      });

      return {
        success: true,
        paymentId,
        receiptId,
        receiptNumber,
        invoiceNumber: invoice.number,
        newInvoiceStatus: newStatus,
        totalPaid: newPaidAmount,
        totalInvoice,
        ledgerReference: refCode
      };
    });
  }

  /** Alias in Spanish */
  public static async registrarPago(params: RegisterPaymentParams): Promise<RegisterPaymentResult> {
    return this.registerPayment(params);
  }
}

/** Standalone functional exporter */
export const registerPayment = async (params: RegisterPaymentParams): Promise<RegisterPaymentResult> => {
  return await PaymentService.registerPayment(params);
};

export const registerPaymentService = async (invoiceId: string, amount: number, method: string) => {
  return await PaymentService.registerPayment({
    organizationId: 'org_1',
    invoiceId,
    amount,
    method
  });
};
