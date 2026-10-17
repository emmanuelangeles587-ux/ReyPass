import { db } from '../db';
import { invoices, invoice_items, audit_logs } from '../../db/schema';
import { RbacMiddleware, Role } from '../middleware/rbacMiddleware';
import { randomUUID } from 'crypto';

export interface CreateInvoiceParams {
  organizationId: string;
  customerId: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  taxRate?: number;
  discount?: number;
  dueDate: string;
  currency?: string;
  userRole?: Role;
}

export class InvoiceService {
  public static async emitirFactura(params: CreateInvoiceParams) {
    const userRole = params.userRole || 'ACCOUNTANT';
    RbacMiddleware.validateAccess(userRole, 'invoices:create');

    const subtotal = params.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (params.taxRate || 0.16);
    const discount = params.discount || 0;
    const total = subtotal + tax - discount;
    const invoiceId = randomUUID();
    const invoiceNumber = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return await db.transaction(async (tx) => {
      // 1. Insert Invoice Header
      await tx.insert(invoices).values({
        id: invoiceId,
        organization_id: params.organizationId,
        number: invoiceNumber,
        customer_id: params.customerId,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        discount: discount.toString(),
        total: total.toString(),
        paid_amount: '0.00',
        currency: params.currency || 'USD',
        status: 'SENT',
        due_date: new Date(params.dueDate),
      });

      // 2. Insert Invoice Items
      for (const item of params.items) {
        await tx.insert(invoice_items).values({
          id: randomUUID(),
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity.toString(),
          unit_price: item.unitPrice.toString(),
          total: (item.quantity * item.unitPrice).toString(),
        });
      }

      // 3. Create Audit Log
      await tx.insert(audit_logs).values({
        id: randomUUID(),
        organization_id: params.organizationId,
        action: 'EMITIR_FACTURA',
        details: `Factura ${invoiceNumber} emitida por $${total.toFixed(2)} USD para el cliente ${params.customerId}`,
      });

      return {
        id: invoiceId,
        number: invoiceNumber,
        total,
        subtotal,
        tax,
        status: 'SENT'
      };
    });
  }
}
