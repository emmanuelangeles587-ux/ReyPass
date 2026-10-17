export type PaymentProviderStatus = 'NOT_CONFIGURED' | 'CONFIGURED' | 'CONNECTED' | 'ERROR' | 'DISABLED';

export interface PaymentProviderConfig {
  id: string;
  name: string;
  type: 'FIAT' | 'CRYPTO' | 'MANUAL';
  status: PaymentProviderStatus;
  publicKey?: string;
  sandboxMode: boolean;
  supportedCurrencies: string[];
}

export const PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    type: 'FIAT',
    status: 'NOT_CONFIGURED',
    sandboxMode: true,
    supportedCurrencies: ['USD', 'MXN', 'EUR', 'GBP']
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago Latam',
    type: 'FIAT',
    status: 'NOT_CONFIGURED',
    sandboxMode: true,
    supportedCurrencies: ['MXN', 'BRL', 'ARS', 'CLP', 'COP']
  },
  {
    id: 'paypal',
    name: 'PayPal Commerce',
    type: 'FIAT',
    status: 'NOT_CONFIGURED',
    sandboxMode: true,
    supportedCurrencies: ['USD', 'EUR', 'MXN']
  },
  {
    id: 'web3_polygon',
    name: 'Web3 On-Chain (Polygon / EVM)',
    type: 'CRYPTO',
    status: 'CONNECTED',
    publicKey: '0x3F91A088e85F5c531bA0B426B93721Eb7a73e5C0',
    sandboxMode: false,
    supportedCurrencies: ['USDT', 'USDC', 'ETH', 'POL']
  },
  {
    id: 'spei_qr',
    name: 'SPEI / CoDi QR Directo',
    type: 'MANUAL',
    status: 'CONNECTED',
    sandboxMode: false,
    supportedCurrencies: ['MXN']
  }
];

export class PaymentAdapterRegistry {
  public static getProviders(): PaymentProviderConfig[] {
    return PAYMENT_PROVIDERS;
  }

  public static getProvider(id: string): PaymentProviderConfig | undefined {
    return PAYMENT_PROVIDERS.find(p => p.id === id);
  }
}
