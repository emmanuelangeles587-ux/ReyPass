export interface DigitalCredential {
  id: string;
  organizationId: string;
  credentialId: string;
  type: 'BUSINESS_VERIFIED' | 'MEMBERSHIP' | 'CERTIFICATE' | 'VIP_PASS';
  title: string;
  recipientName: string;
  recipientTaxId?: string;
  issuer: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
  issuedAt: string;
  expiresAt?: string;
  verificationUrl: string;
  onChainRef?: {
    network: string;
    txHash: string;
    contractAddress: string;
  };
  metadata?: Record<string, any>;
}

export class CredentialService {
  public static generateVerificationUrl(credentialId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://reywallet.app';
    return `${origin}/verify/${credentialId}`;
  }

  public static async createBusinessCredential(
    organizationId: string,
    orgName: string,
    legalTaxId: string
  ): Promise<DigitalCredential> {
    const credentialId = `REY-BIZ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
    const verificationUrl = this.generateVerificationUrl(credentialId);

    return {
      id: credentialId,
      organizationId,
      credentialId,
      type: 'BUSINESS_VERIFIED',
      title: 'REYPLACE Verified Enterprise Badge',
      recipientName: orgName,
      recipientTaxId: legalTaxId,
      issuer: 'REYPLACE Trust Network Authority',
      status: 'VALID',
      issuedAt: new Date().toISOString(),
      verificationUrl,
      onChainRef: {
        network: 'Polygon PoS',
        txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        contractAddress: '0x8F3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
      },
      metadata: {
        kycLevel: 'Tier 3 Enterprise Verified',
        nfcEnabled: true,
        qrCompatible: true
      }
    };
  }
}
