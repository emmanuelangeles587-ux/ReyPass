import { pgTable, serial, text, decimal, timestamp, uuid } from 'drizzle-orm/pg-core';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey(),
  organization_id: uuid('organization_id'),
  number: text('number').notNull(),
  customer_id: uuid('customer_id').notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
  tax: decimal('tax', { precision: 12, scale: 2 }),
  discount: decimal('discount', { precision: 12, scale: 2 }),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  paid_amount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
  currency: text('currency').default('USD'),
  status: text('status').default('SENT'),
  due_date: timestamp('due_date').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const invoice_items = pgTable('invoice_items', {
  id: uuid('id').primaryKey(),
  invoice_id: uuid('invoice_id').references(() => invoices.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unit_price: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey(),
  organization_id: uuid('organization_id'),
  invoice_id: uuid('invoice_id').references(() => invoices.id),
  customer_id: uuid('customer_id'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  method: text('method').notNull(), // 'NFC', 'QR', 'SPEI', 'CARD', 'WEB3'
  provider: text('provider'),
  reference: text('reference'),
  status: text('status').default('COMPLETED'),
  created_at: timestamp('created_at').defaultNow(),
});

export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey(),
  organization_id: uuid('organization_id'),
  payment_id: uuid('payment_id').references(() => payments.id),
  number: text('number').notNull(),
  customer_id: uuid('customer_id'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  qr_code_url: text('qr_code_url'),
  created_at: timestamp('created_at').defaultNow(),
});

export const ledger = pgTable('ledger', {
  id: uuid('id').primaryKey(),
  organization_id: uuid('organization_id'),
  reference: text('reference'),
  account: text('account'),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  type: text('type').notNull(), // 'CREDIT' or 'DEBIT'
  created_at: timestamp('created_at').defaultNow(),
});

export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey(),
  organization_id: uuid('organization_id'),
  action: text('action').notNull(),
  details: text('details'),
  created_at: timestamp('created_at').defaultNow(),
});
