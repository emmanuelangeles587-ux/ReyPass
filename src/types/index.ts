export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  tax_id: string;
  plan: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SALES' | 'VIEWER' | 'CUSTOMER' | 'CREDIT_MANAGER';
  organization_id: string;
  avatar: string;
  created_at: string;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  name: string;
  type: 'CONTRACT' | 'TAX_ID' | 'PROPOSAL' | 'INVOICE_COPY' | 'SLA_AGREEMENT' | 'OTHER';
  file_url: string;
  file_size: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  uploaded_at: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  notes?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  balance: number;
  tags?: string[];
  metadata?: {
    website?: string;
    industry?: string;
    contact_person?: string;
    credit_limit?: number;
    payment_terms?: string;
    custom_notes?: string;
    [key: string]: any;
  };
  documents?: CustomerDocument[];
  organization_id: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified_purchase: boolean;
  likes_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compare_price?: number;
  currency: string;
  stock: number;
  min_stock_alert: number;
  images: string[];
  rating: number;
  reviews_count: number;
  tags: string[];
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DRAFT';
  organization_id: string;
  created_at: string;
}

export interface ShippingTracking {
  carrier: 'DHL Express' | 'FedEx' | 'Estafeta' | 'UPS' | 'ReyLogistics';
  tracking_number: string;
  status: 'ORDER_PLACED' | 'PROCESSING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  estimated_delivery: string;
  current_location: string;
  history: Array<{
    timestamp: string;
    status: string;
    location: string;
    note: string;
  }>;
}

export interface ShopOrderItem {
  product_id: string;
  product_name: string;
  sku: string;
  price: number;
  quantity: number;
  image_url: string;
  total: number;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: ShopOrderItem[];
  subtotal: number;
  tax: number;
  shipping_fee: number;
  discount: number;
  total: number;
  currency: string;
  payment_status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  payment_method: 'STRIPE' | 'SPEI' | 'WEB3_CRYPTO' | 'CARD';
  payment_reference?: string;
  fulfillment_status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  tracking?: ShippingTracking;
  invoice_id?: string;
  receipt_id?: string;
  email_notifications_sent: Array<{
    type: 'ORDER_CONFIRMATION' | 'PAYMENT_RECEIVED' | 'SHIPMENT_TRACKING' | 'DELIVERY_COMPLETED';
    sent_at: string;
    recipient: string;
  }>;
  organization_id: string;
  created_at: string;
}


export interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  customer_id: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expires_at: string;
  notes: string;
  organization_id: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer_id: string;
  quote_id?: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  due_date: string;
  paid_amount: number;
  organization_id: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  method: 'TRANSFER' | 'CASH' | 'SPEI' | 'CARD' | 'STRIPE';
  provider: 'STRIPE' | 'MERCADOPAGO' | 'PAYPAL' | 'SPEI_DIRECT' | 'MANUAL';
  reference: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  receipt_id: string;
  organization_id: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  payment_id: string;
  number: string;
  customer_id: string;
  amount: number;
  currency: string;
  qr_code_url: string;
  organization_id: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  reference: string;
  account: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: string;
  description: string;
  organization_id: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  currency: string;
  balance: number;
  status: 'ACTIVE' | 'CONNECTED' | 'INACTIVE';
  organization_id: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  status: 'ACTIVE' | 'PAUSED';
  organization_id: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  organization_id: string;
  created_at: string;
}

export interface ProviderConnection {
  id: string;
  provider_name: string;
  status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR';
  masked_key: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string;
  metadata: any;
  organization_id: string;
  created_at: string;
}

export interface CreditApplication {
  id: string;
  customer_id: string;
  amount: number;
  term_months: number;
  purpose: string;
  status: 'DRAFT' | 'EN_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewed_by: string;
  organization_id: string;
  created_at: string;
}
