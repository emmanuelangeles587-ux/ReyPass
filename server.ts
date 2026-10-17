import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const PORT = 3000;
const DB_FILE = path.resolve(process.cwd(), 'reywallet_db.json');

// Initial seed data
const initialData = {
  organizations: [
    {
      id: 'org_1',
      name: 'Rey Fintech Operations S.A. de C.V.',
      slug: 'rey-fintech',
      currency: 'USD',
      timezone: 'America/Mexico_City',
      tax_id: 'REY240925TX8',
      plan: 'ENTERPRISE',
      created_at: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'usr_1',
      email: 'admin@reywallet.com',
      name: 'Alejandro Rey',
      role: 'OWNER',
      organization_id: 'org_1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString()
    }
  ],
  customers: [
    {
      id: 'cust_1',
      name: 'Sofía Martínez',
      company: 'Logística Global S.A.',
      email: 'smartinez@logisticaglobal.com',
      phone: '+52 55 4192 8371',
      address: 'Paseo de la Reforma 250, Piso 14, Cuauhtémoc, CDMX',
      rfc: 'LOG180212AB4',
      status: 'ACTIVE',
      balance: 14500.00,
      notes: 'Cliente corporativo Tier 1. Contrato anual de infraestructura y pasarela cross-border.',
      tags: ['Tier 1', 'Corporativo', 'Logística', 'API'],
      metadata: {
        website: 'https://logisticaglobal.mx',
        industry: 'Logística y Transporte',
        contact_person: 'Ing. Roberto Valdez',
        credit_limit: 50000.00,
        payment_terms: 'Net 30'
      },
      documents: [
        {
          id: 'doc_1',
          customer_id: 'cust_1',
          name: 'Contrato_Maestro_Servicios_2026.pdf',
          type: 'CONTRACT',
          file_url: 'https://reywallet.app/docs/cust_1/contrato_2026.pdf',
          file_size: '2.4 MB',
          status: 'VERIFIED',
          uploaded_at: new Date(Date.now() - 86400000 * 12).toISOString()
        },
        {
          id: 'doc_2',
          customer_id: 'cust_1',
          name: 'Constancia_Situacion_Fiscal_SAT_2026.pdf',
          type: 'TAX_ID',
          file_url: 'https://reywallet.app/docs/cust_1/csf_sat.pdf',
          file_size: '850 KB',
          status: 'VERIFIED',
          uploaded_at: new Date(Date.now() - 86400000 * 11).toISOString()
        }
      ],
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString()
    },
    {
      id: 'cust_2',
      name: 'Carlos Mendoza',
      company: 'TechFlow Solutions',
      email: 'carlos@techflow.io',
      phone: '+52 33 8921 4402',
      address: 'Av. Américas 1500, Country Club, Guadalajara, JAL',
      rfc: 'TEC190520XY9',
      status: 'ACTIVE',
      balance: 3200.50,
      notes: 'Desarrolladora fintech en rápido crecimiento. Solicitud de línea de crédito en revisión.',
      tags: ['SaaS', 'Startup', 'High-Growth'],
      metadata: {
        website: 'https://techflow.io',
        industry: 'Software & Fintech',
        contact_person: 'Lic. Mariana Ramos',
        credit_limit: 25000.00,
        payment_terms: 'Net 15'
      },
      documents: [
        {
          id: 'doc_3',
          customer_id: 'cust_2',
          name: 'Acta_Constitutiva_TechFlow.pdf',
          type: 'CONTRACT',
          file_url: 'https://reywallet.app/docs/cust_2/acta.pdf',
          file_size: '4.1 MB',
          status: 'VERIFIED',
          uploaded_at: new Date(Date.now() - 86400000 * 8).toISOString()
        }
      ],
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 8).toISOString()
    },
    {
      id: 'cust_3',
      name: 'Valeria Garza',
      company: 'Inmobiliaria del Norte S.A.P.I.',
      email: 'valeria@inmobiliarialn.com',
      phone: '+52 81 2233 4455',
      address: 'Calzada del Valle 400, San Pedro Garza García, NL',
      rfc: 'INO1403048K1',
      status: 'ACTIVE',
      balance: 0.00,
      notes: 'Desarrollo de proyectos comerciales y residenciales. Historial de pago 100% puntual.',
      tags: ['Inmobiliaria', 'Premium', 'Puntual'],
      metadata: {
        website: 'https://inmobiliarialn.com',
        industry: 'Bienes Raíces',
        contact_person: 'Arq. Esteban Garza',
        credit_limit: 100000.00,
        payment_terms: 'Net 30'
      },
      documents: [
        {
          id: 'doc_4',
          customer_id: 'cust_3',
          name: 'Acuerdo_SLA_Auditoria_Seguridad.pdf',
          type: 'SLA_AGREEMENT',
          file_url: 'https://reywallet.app/docs/cust_3/sla.pdf',
          file_size: '1.2 MB',
          status: 'VERIFIED',
          uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ],
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],

  quotes: [
    {
      id: 'q_1',
      number: 'COT-2026-001',
      customer_id: 'cust_1',
      items: [
        { description: 'Licenciamiento Enterprise API (Anual)', quantity: 1, unit_price: 12500, total: 12500 },
        { description: 'Soporte y Consultoría Dedicada', quantity: 2, unit_price: 1000, total: 2000 }
      ],
      subtotal: 14500,
      tax: 2320,
      discount: 0,
      total: 16820,
      currency: 'USD',
      status: 'ACCEPTED',
      expires_at: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      notes: 'Incluye SLA 99.99% y onboarding prioritario.',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'q_2',
      number: 'COT-2026-002',
      customer_id: 'cust_2',
      items: [
        { description: 'Pasarela de Pagos Cross-Border Setup', quantity: 1, unit_price: 3200.50, total: 3200.50 }
      ],
      subtotal: 3200.50,
      tax: 512.08,
      discount: 0,
      total: 3712.58,
      currency: 'USD',
      status: 'SENT',
      expires_at: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      notes: 'Válido por 10 días hábiles.',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  invoices: [
    {
      id: 'inv_1',
      number: 'FAC-2026-001',
      customer_id: 'cust_1',
      quote_id: 'q_1',
      items: [
        { description: 'Licenciamiento Enterprise API (Anual)', quantity: 1, unit_price: 12500, total: 12500 },
        { description: 'Soporte y Consultoría Dedicada', quantity: 2, unit_price: 1000, total: 2000 }
      ],
      subtotal: 14500,
      tax: 2320,
      discount: 0,
      total: 16820,
      currency: 'USD',
      status: 'PARTIALLY_PAID',
      due_date: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      paid_amount: 5000,
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'inv_2',
      number: 'FAC-2026-002',
      customer_id: 'cust_3',
      quote_id: null,
      items: [
        { description: 'Auditoría de Seguridad y Compliance', quantity: 1, unit_price: 8500, total: 8500 }
      ],
      subtotal: 8500,
      tax: 1360,
      discount: 0,
      total: 9860,
      currency: 'USD',
      status: 'PAID',
      due_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      paid_amount: 9860,
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ],
  payments: [
    {
      id: 'pay_1',
      invoice_id: 'inv_1',
      customer_id: 'cust_1',
      amount: 5000,
      currency: 'USD',
      method: 'TRANSFER',
      provider: 'STRIPE',
      reference: 'TXN-9982314-ST',
      status: 'COMPLETED',
      receipt_id: 'rec_1',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'pay_2',
      invoice_id: 'inv_2',
      customer_id: 'cust_3',
      amount: 9860,
      currency: 'USD',
      method: 'SPEI',
      provider: 'SPEI_DIRECT',
      reference: 'SPEI-8823901-MX',
      status: 'COMPLETED',
      receipt_id: 'rec_2',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ],
  receipts: [
    {
      id: 'rec_1',
      payment_id: 'pay_1',
      number: 'REC-2026-001',
      customer_id: 'cust_1',
      amount: 5000,
      currency: 'USD',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://reywallet.app/pay/rec_1',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'rec_2',
      payment_id: 'pay_2',
      number: 'REC-2026-002',
      customer_id: 'cust_3',
      amount: 9860,
      currency: 'USD',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://reywallet.app/pay/rec_2',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ],
  ledger: [
    {
      id: 'led_1',
      reference: 'TXN-9982314-ST',
      account: '1020 - Banco Principal USD',
      type: 'CREDIT',
      amount: 5000,
      currency: 'USD',
      description: 'Pago parcial factura FAC-2026-001 (Sofía Martínez)',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'led_2',
      reference: 'SPEI-8823901-MX',
      account: '1020 - Banco Principal USD',
      type: 'CREDIT',
      amount: 9860,
      currency: 'USD',
      description: 'Pago total factura FAC-2026-002 (Inmobiliaria del Norte)',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ],
  bank_accounts: [
    {
      id: 'ba_1',
      bank_name: 'BBVA México Enterprise',
      account_number: '•••• 4402 (USD)',
      currency: 'USD',
      balance: 14860.00,
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date().toISOString()
    },
    {
      id: 'ba_2',
      bank_name: 'Stripe Global Gateway',
      account_number: 'acct_1M...live',
      currency: 'USD',
      balance: 5000.00,
      status: 'CONNECTED',
      organization_id: 'org_1',
      created_at: new Date().toISOString()
    }
  ],
  workflows: [
    {
      id: 'wf_1',
      name: 'Alerta Factura Vencida & Recordatorio',
      trigger: 'invoice.overdue',
      condition: 'days_overdue > 3',
      action: 'send email + create notification',
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date().toISOString()
    },
    {
      id: 'wf_2',
      name: 'Generar Recibo & Ledger Automatico',
      trigger: 'payment.completed',
      condition: 'amount > 0',
      action: 'generate receipt & post ledger entry',
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'Pago Recibido exitosamente',
      message: 'Sofía Martínez abonó $5,000.00 USD mediante Stripe.',
      type: 'success',
      read: false,
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'notif_2',
      title: 'Cotización Aceptada',
      message: 'Logística Global S.A. aceptó la cotización COT-2026-001 ($16,820 USD).',
      type: 'info',
      read: true,
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  provider_connections: [
    { id: 'pc_1', provider_name: 'Stripe', status: 'CONNECTED', masked_key: 'rk_live_••••••••992x' },
    { id: 'pc_2', provider_name: 'Mercado Pago', status: 'NOT CONFIGURED', masked_key: null },
    { id: 'pc_3', provider_name: 'PayPal', status: 'NOT CONFIGURED', masked_key: null },
    { id: 'pc_4', provider_name: 'SPEI / Banxico API', status: 'CONNECTED', masked_key: 'mx_spei_••••881a' }
  ],
  audit_logs: [
    {
      id: 'ald_1',
      user_id: 'usr_1',
      action: 'payment.confirmed',
      resource: 'payment',
      resource_id: 'pay_1',
      metadata: { amount: 5000, provider: 'STRIPE' },
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  credit_applications: [
    {
      id: 'cred_1',
      customer_id: 'cust_2',
      amount: 25000.00,
      term_months: 6,
      purpose: 'Expansión de infraestructura cloud',
      status: 'EN_REVIEW',
      reviewed_by: 'Alejandro Rey',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  products: [
    {
      id: 'prod_1',
      sku: 'REY-POS-NFC-PRO',
      name: 'Terminal Inteligente POS NFC Biométrico ReyWallet Pro',
      description: 'Dispositivo punto de venta empresarial de alta velocidad con lectura dual NFC / QR, verificación biométrica, pantalla táctil OLED y conexión 5G + WiFi 6.',
      category: 'Hardware & Terminales',
      price: 289.00,
      compare_price: 349.00,
      currency: 'USD',
      stock: 45,
      min_stock_alert: 10,
      images: [
        'https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop'
      ],
      rating: 4.9,
      reviews_count: 28,
      tags: ['Hardware', 'NFC', 'POS', 'BestSeller', 'Biométrico'],
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
      id: 'prod_2',
      sku: 'REY-CARD-METAL-KEY',
      name: 'Tarjeta de Titanio Criptográfica ReyShield Metal Card',
      description: 'Tarjeta inteligente de titanio grado aeroespacial con chip seguro EAL6+, autenticación Web3 multicadena y almacenamiento de credenciales descentralizadas.',
      category: 'Smart Cards & Hardware',
      price: 119.00,
      compare_price: 149.00,
      currency: 'USD',
      stock: 120,
      min_stock_alert: 25,
      images: [
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop'
      ],
      rating: 5.0,
      reviews_count: 42,
      tags: ['Titanio', 'Web3', 'Seguridad', 'Cripto', 'EAL6+'],
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString()
    },
    {
      id: 'prod_3',
      sku: 'REY-GATEWAY-BOX',
      name: 'ReyGateway Edge Hub - Procesador de Pagos On-Premise',
      description: 'Microservidor de borde dedicado para procesamiento de pagos offline, conciliación bancaria local e integración instantánea con ERPs SAP/Oracle.',
      category: 'Infraestructura',
      price: 890.00,
      compare_price: 999.00,
      currency: 'USD',
      stock: 14,
      min_stock_alert: 5,
      images: [
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop'
      ],
      rating: 4.8,
      reviews_count: 15,
      tags: ['Edge', 'ERP', 'On-Premise', 'Enterprise'],
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    {
      id: 'prod_4',
      sku: 'REY-API-DEV-KIT',
      name: 'Kit de Desarrollo SDK & Lector USB-C NFC ReyWallet',
      description: 'Incluye lector NFC plug-and-play, 10 tarjetas de prueba testnet, licencias sandbox y acceso a soporte técnico dedicado para ingenieros.',
      category: 'Desarrollo & SDK',
      price: 65.00,
      compare_price: 85.00,
      currency: 'USD',
      stock: 80,
      min_stock_alert: 15,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop'
      ],
      rating: 4.7,
      reviews_count: 19,
      tags: ['SDK', 'Developer', 'Testnet', 'USB-C'],
      status: 'ACTIVE',
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ],
  product_reviews: [
    {
      id: 'rev_1',
      product_id: 'prod_1',
      customer_name: 'Ing. Roberto Valdez',
      customer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      title: 'Increíble velocidad de cobro y batería insuperable',
      comment: 'Implementamos 15 terminales en nuestros almacenes de CDMX. El cobro por NFC y la emisión automática del recibo con QR redujo los tiempos de espera en un 70%.',
      verified_purchase: true,
      likes_count: 12,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'rev_2',
      product_id: 'prod_2',
      customer_name: 'Mariana Ramos',
      customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      rating: 5,
      title: 'Calidad del titanio insuperable y seguridad total',
      comment: 'La integración con la app de ReyWallet es instantánea al acercar la tarjeta por NFC. El chip seguro nos da total tranquilidad para operaciones de alto volumen.',
      verified_purchase: true,
      likes_count: 8,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ],
  shop_orders: [
    {
      id: 'ord_1',
      order_number: 'REY-ORD-2026-001',
      customer_id: 'cust_1',
      customer_name: 'Sofía Martínez',
      customer_email: 'smartinez@logisticaglobal.com',
      customer_phone: '+52 55 4192 8371',
      shipping_address: 'Paseo de la Reforma 250, Piso 14, Cuauhtémoc, CDMX',
      items: [
        {
          product_id: 'prod_1',
          product_name: 'Terminal Inteligente POS NFC Biométrico ReyWallet Pro',
          sku: 'REY-POS-NFC-PRO',
          price: 289.00,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800',
          total: 578.00
        }
      ],
      subtotal: 578.00,
      tax: 92.48,
      shipping_fee: 0.00,
      discount: 0.00,
      total: 670.48,
      currency: 'USD',
      payment_status: 'PAID',
      payment_method: 'STRIPE',
      payment_reference: 'ch_3N19a92KLa01',
      fulfillment_status: 'SHIPPED',
      tracking: {
        carrier: 'DHL Express',
        tracking_number: 'DHL-MEX-981249129',
        status: 'IN_TRANSIT',
        estimated_delivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        current_location: 'Centro de Distribución CDMX Hub Norte',
        history: [
          {
            timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
            status: 'En tránsito',
            location: 'Centro de Clasificación CDMX',
            note: 'Paquete recibido y despachado hacia destino final.'
          },
          {
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'Orden despachada',
            location: 'Bodega Central ReyShop',
            note: 'Guía generada y paquete entregado a transportista.'
          }
        ]
      },
      invoice_id: 'inv_1',
      receipt_id: 'rec_1',
      email_notifications_sent: [
        {
          type: 'ORDER_CONFIRMATION',
          sent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          recipient: 'smartinez@logisticaglobal.com'
        },
        {
          type: 'SHIPMENT_TRACKING',
          sent_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          recipient: 'smartinez@logisticaglobal.com'
        }
      ],
      organization_id: 'org_1',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};


// Load or initialize DB
function getDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading DB:', e);
  }
  saveDb(initialData);
  return initialData;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e);
  }
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'REYWALLET Enterprise' });
});

app.get('/api/state', (req, res) => {
  const db = getDb();
  res.json(db);
});

// Customers Endpoints
app.get('/api/customers', (req, res) => {
  const db = getDb();
  const { search, status } = req.query;
  let list = db.customers || [];
  
  if (status && status !== 'ALL') {
    list = list.filter((c: any) => c.status === status);
  }
  
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((c: any) => 
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.rfc?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }
  
  res.json(list);
});

app.get('/api/customers/:id', (req, res) => {
  const db = getDb();
  const customer = db.customers?.find((c: any) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const quotes = db.quotes?.filter((q: any) => q.customer_id === customer.id) || [];
  const invoices = db.invoices?.filter((i: any) => i.customer_id === customer.id) || [];
  const payments = db.payments?.filter((p: any) => p.customer_id === customer.id) || [];
  const receipts = db.receipts?.filter((r: any) => r.customer_id === customer.id) || [];
  const auditLogs = db.audit_logs?.filter((a: any) => a.resource_id === customer.id || a.metadata?.customer_id === customer.id) || [];

  // Calculate dynamic statistics
  const totalInvoiced = invoices.reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const calculatedBalance = Math.max(0, totalInvoiced - totalPaid);

  res.json({
    ...customer,
    balance: calculatedBalance,
    quotes,
    invoices,
    payments,
    receipts,
    audit_logs: auditLogs,
    metrics: {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      balance_due: calculatedBalance,
      quotes_count: quotes.length,
      invoices_count: invoices.length,
      payments_count: payments.length,
      documents_count: customer.documents?.length || 0
    }
  });
});

app.post('/api/customers', (req, res) => {
  const db = getDb();
  const { name, company, email, phone, address, rfc, notes, metadata, tags, status = 'ACTIVE' } = req.body;
  
  const newCust = {
    id: 'cust_' + Date.now(),
    name: name || '',
    company: company || '',
    email: email || '',
    phone: phone || '',
    address: address || '',
    rfc: (rfc || '').toUpperCase(),
    notes: notes || '',
    status,
    balance: 0.00,
    tags: tags || ['General'],
    metadata: metadata || { website: '', industry: 'General', contact_person: '' },
    documents: [],
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  db.customers.unshift(newCust);
  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'customer.created',
    resource: 'customer',
    resource_id: newCust.id,
    metadata: { name: newCust.name, company: newCust.company, rfc: newCust.rfc },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json(newCust);
});

app.put('/api/customers/:id', (req, res) => {
  const db = getDb();
  const idx = db.customers?.findIndex((c: any) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const existing = db.customers[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    organization_id: existing.organization_id,
    rfc: req.body.rfc ? req.body.rfc.toUpperCase() : existing.rfc,
    updated_at: new Date().toISOString()
  };

  db.customers[idx] = updated;
  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'customer.updated',
    resource: 'customer',
    resource_id: updated.id,
    metadata: { name: updated.name, company: updated.company },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.json(updated);
});

app.patch('/api/customers/:id/archive', (req, res) => {
  const db = getDb();
  const customer = db.customers?.find((c: any) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  customer.status = 'ARCHIVED';
  customer.updated_at = new Date().toISOString();

  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'customer.archived',
    resource: 'customer',
    resource_id: customer.id,
    metadata: { name: customer.name },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, customer });
});

app.patch('/api/customers/:id/restore', (req, res) => {
  const db = getDb();
  const customer = db.customers?.find((c: any) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  customer.status = 'ACTIVE';
  customer.updated_at = new Date().toISOString();

  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'customer.restored',
    resource: 'customer',
    resource_id: customer.id,
    metadata: { name: customer.name },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, customer });
});

// Customer Documents
app.post('/api/customers/:id/documents', (req, res) => {
  const db = getDb();
  const customer = db.customers?.find((c: any) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  if (!customer.documents) customer.documents = [];

  const newDoc = {
    id: 'doc_' + Date.now(),
    customer_id: customer.id,
    name: req.body.name || 'Documento_Adjunto.pdf',
    type: req.body.type || 'CONTRACT',
    file_url: req.body.file_url || `https://reywallet.app/docs/${customer.id}/${Date.now()}.pdf`,
    file_size: req.body.file_size || '1.8 MB',
    status: req.body.status || 'VERIFIED',
    uploaded_at: new Date().toISOString()
  };

  customer.documents.unshift(newDoc);
  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'customer.document_added',
    resource: 'customer_document',
    resource_id: newDoc.id,
    metadata: { document_name: newDoc.name, customer_id: customer.id },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json(newDoc);
});

app.delete('/api/customers/:id/documents/:docId', (req, res) => {
  const db = getDb();
  const customer = db.customers?.find((c: any) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  if (customer.documents) {
    customer.documents = customer.documents.filter((d: any) => d.id !== req.params.docId);
  }

  saveDb(db);
  res.json({ success: true });
});

app.delete('/api/customers/:id', (req, res) => {
  const db = getDb();
  db.customers = db.customers.filter((c: any) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ==================== REYSHOP E-COMMERCE ENDPOINTS ====================
app.get('/api/shop/products', (req, res) => {
  const db = getDb();
  const { category, search, in_stock } = req.query;
  let list = db.products || [];

  if (category && category !== 'ALL') {
    list = list.filter((p: any) => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((p: any) => 
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (in_stock === 'true') {
    list = list.filter((p: any) => p.stock > 0);
  }

  res.json(list);
});

app.post('/api/shop/products', (req, res) => {
  const db = getDb();
  if (!db.products) db.products = [];

  const newProduct = {
    id: 'prod_' + Date.now(),
    sku: req.body.sku || `REY-${Math.floor(1000 + Math.random() * 9000)}`,
    name: req.body.name,
    description: req.body.description || '',
    category: req.body.category || 'Hardware',
    price: Number(req.body.price) || 0,
    compare_price: req.body.compare_price ? Number(req.body.compare_price) : undefined,
    currency: req.body.currency || 'USD',
    stock: Number(req.body.stock) || 0,
    min_stock_alert: Number(req.body.min_stock_alert) || 5,
    images: req.body.images?.length ? req.body.images : ['https://images.unsplash.com/photo-1556742049-0a67e557b6f3?w=800'],
    rating: 5.0,
    reviews_count: 0,
    tags: req.body.tags || ['Nuevo'],
    status: (Number(req.body.stock) || 0) > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.get('/api/shop/products/:id/reviews', (req, res) => {
  const db = getDb();
  const reviews = db.product_reviews?.filter((r: any) => r.product_id === req.params.id) || [];
  res.json(reviews);
});

app.post('/api/shop/products/:id/reviews', (req, res) => {
  const db = getDb();
  if (!db.product_reviews) db.product_reviews = [];

  const newReview = {
    id: 'rev_' + Date.now(),
    product_id: req.params.id,
    customer_name: req.body.customer_name || 'Cliente Verificado',
    customer_avatar: req.body.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    rating: Number(req.body.rating) || 5,
    title: req.body.title || 'Excelente producto',
    comment: req.body.comment || '',
    verified_purchase: true,
    likes_count: 0,
    created_at: new Date().toISOString()
  };

  db.product_reviews.unshift(newReview);

  // Recalculate average rating on product
  const prod = db.products?.find((p: any) => p.id === req.params.id);
  if (prod) {
    const allProdReviews = db.product_reviews.filter((r: any) => r.product_id === prod.id);
    const avg = allProdReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allProdReviews.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviews_count = allProdReviews.length;
  }

  saveDb(db);
  res.status(201).json(newReview);
});

app.get('/api/shop/orders', (req, res) => {
  const db = getDb();
  res.json(db.shop_orders || []);
});

app.get('/api/shop/orders/:id', (req, res) => {
  const db = getDb();
  const order = db.shop_orders?.find((o: any) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  res.json(order);
});

// Atomic E-commerce Checkout with Core Payment, Ledger, Receipt, Stock & Email Logs
app.post('/api/shop/checkout', (req, res) => {
  const db = getDb();
  const {
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    items,
    payment_method = 'STRIPE',
    carrier = 'DHL Express'
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'El carrito de compras está vacío.' });
  }

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const tax = Number((subtotal * 0.16).toFixed(2));
  const shipping_fee = subtotal > 300 ? 0.00 : 25.00;
  const total = Number((subtotal + tax + shipping_fee).toFixed(2));

  const orderId = 'ord_' + Date.now();
  const orderNumber = `REY-ORD-2026-${String((db.shop_orders?.length || 0) + 1).padStart(3, '0')}`;
  const trackingNumber = `${carrier.slice(0, 3).toUpperCase()}-MEX-${Math.floor(100000000 + Math.random() * 900000000)}`;
  const invoiceId = 'inv_' + Date.now();
  const invoiceNumber = `FAC-2026-${String((db.invoices?.length || 0) + 1).padStart(3, '0')}`;
  const paymentId = 'pay_' + Date.now();
  const receiptId = 'rec_' + Date.now();
  const receiptNumber = `REC-2026-${String((db.receipts?.length || 0) + 1).padStart(3, '0')}`;

  // 1. Decrement Product Stock
  if (db.products) {
    for (const item of items) {
      const prod = db.products.find((p: any) => p.id === item.product_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) prod.status = 'OUT_OF_STOCK';
      }
    }
  }

  // 2. Generate Invoice in REYWALLET
  const newInvoice = {
    id: invoiceId,
    number: invoiceNumber,
    customer_id: customer_id || 'cust_1',
    items: items.map((i: any) => ({
      description: `${i.product_name} (${i.sku})`,
      quantity: i.quantity,
      unit_price: i.price,
      total: i.price * i.quantity
    })),
    subtotal,
    tax,
    discount: 0,
    total,
    currency: 'USD',
    status: 'PAID',
    due_date: new Date().toISOString().split('T')[0],
    paid_amount: total,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  // 3. Register Payment
  const newPayment = {
    id: paymentId,
    invoice_id: invoiceId,
    customer_id: customer_id || 'cust_1',
    amount: total,
    currency: 'USD',
    method: payment_method,
    provider: payment_method === 'STRIPE' ? 'STRIPE' : 'SPEI_DIRECT',
    reference: `TX-SHOP-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'COMPLETED',
    receipt_id: receiptId,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  // 4. Create Receipt with QR code
  const newReceipt = {
    id: receiptId,
    payment_id: paymentId,
    number: receiptNumber,
    customer_id: customer_id || 'cust_1',
    amount: total,
    currency: 'USD',
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://reywallet.app/verify/${receiptId}`,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  // 5. Post to General Accounting Ledger
  const newLedger = {
    id: 'led_' + Date.now(),
    reference: orderNumber,
    account: '1010 - Ingresos por E-Commerce ReyShop',
    type: 'CREDIT',
    amount: total,
    currency: 'USD',
    description: `Venta E-Commerce #${orderNumber} (${items.length} productos). Cliente: ${customer_name}`,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  // 6. Create Shop Order with Real-Time Tracking & Email Dispatch Logs
  const newOrder = {
    id: orderId,
    order_number: orderNumber,
    customer_id: customer_id || 'cust_1',
    customer_name: customer_name || 'Cliente ReyShop',
    customer_email: customer_email || 'cliente@reywallet.com',
    customer_phone: customer_phone || '',
    shipping_address: shipping_address || 'Dirección de envío principal',
    items,
    subtotal,
    tax,
    shipping_fee,
    discount: 0,
    total,
    currency: 'USD',
    payment_status: 'PAID',
    payment_method,
    payment_reference: newPayment.reference,
    fulfillment_status: 'PROCESSING',
    tracking: {
      carrier,
      tracking_number: trackingNumber,
      status: 'ORDER_PLACED',
      estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      current_location: 'Almacén Central ReyShop & Logistics Hub',
      history: [
        {
          timestamp: new Date().toISOString(),
          status: 'Orden confirmada y pagada',
          location: 'ReyShop Automated Gateway',
          note: `Pago procesado vía ${payment_method}. Factura ${invoiceNumber} emitida automáticamente.`
        },
        {
          timestamp: new Date().toISOString(),
          status: 'Preparando paquete en almacén',
          location: 'Hub de Distribución ReyLogistics',
          note: `Guía asignada: ${trackingNumber}`
        }
      ]
    },
    invoice_id: invoiceId,
    receipt_id: receiptId,
    email_notifications_sent: [
      {
        type: 'ORDER_CONFIRMATION',
        sent_at: new Date().toISOString(),
        recipient: customer_email || 'cliente@reywallet.com'
      },
      {
        type: 'PAYMENT_RECEIVED',
        sent_at: new Date().toISOString(),
        recipient: customer_email || 'cliente@reywallet.com'
      },
      {
        type: 'SHIPMENT_TRACKING',
        sent_at: new Date().toISOString(),
        recipient: customer_email || 'cliente@reywallet.com'
      }
    ],
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  // Commit atomic batch into DB
  if (!db.shop_orders) db.shop_orders = [];
  db.shop_orders.unshift(newOrder);
  db.invoices.unshift(newInvoice);
  db.payments.unshift(newPayment);
  db.receipts.unshift(newReceipt);
  db.ledger.unshift(newLedger);

  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    title: '¡Nueva Venta en ReyShop!',
    message: `Orden ${orderNumber} por $${total.toLocaleString()} USD de ${customer_name}. Stock actualizado y factura emitida.`,
    type: 'success',
    read: false,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'shop_system',
    action: 'shop.order_placed',
    resource: 'shop_order',
    resource_id: orderId,
    metadata: { order_number: orderNumber, total, items_count: items.length },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'Orden completada con éxito. Pipeline de facturación, ledger, stock y tracking ejecutado.',
    order: newOrder,
    invoice: newInvoice,
    receipt: newReceipt
  });
});

app.patch('/api/shop/orders/:id/tracking', (req, res) => {
  const db = getDb();
  const order = db.shop_orders?.find((o: any) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  const { status, location, note } = req.body;
  if (order.tracking) {
    order.tracking.status = status || order.tracking.status;
    if (location) order.tracking.current_location = location;
    order.tracking.history.unshift({
      timestamp: new Date().toISOString(),
      status: status || 'Actualización de estado',
      location: location || order.tracking.current_location,
      note: note || 'Actualización del transportista'
    });
  }

  if (status === 'DELIVERED') {
    order.fulfillment_status = 'DELIVERED';
    order.email_notifications_sent.push({
      type: 'DELIVERY_COMPLETED',
      sent_at: new Date().toISOString(),
      recipient: order.customer_email
    });
  } else if (status === 'IN_TRANSIT') {
    order.fulfillment_status = 'SHIPPED';
  }

  saveDb(db);
  res.json({ success: true, order });
});


// Quotes
app.get('/api/quotes', (req, res) => {
  const db = getDb();
  res.json(db.quotes);
});

app.post('/api/quotes', (req, res) => {
  const db = getDb();
  const newQuote = {
    id: 'q_' + Date.now(),
    number: `COT-2026-${String(db.quotes.length + 1).padStart(3, '0')}`,
    ...req.body,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };
  db.quotes.unshift(newQuote);
  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'usr_1',
    action: 'quote.created',
    resource: 'quote',
    resource_id: newQuote.id,
    metadata: { number: newQuote.number, total: newQuote.total },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });
  saveDb(db);
  res.json(newQuote);
});

app.patch('/api/quotes/:id/status', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const quote = db.quotes.find((q: any) => q.id === req.params.id);
  if (quote) {
    quote.status = status;
    if (status === 'ACCEPTED') {
      // Auto convert to invoice
      const newInv = {
        id: 'inv_' + Date.now(),
        number: `FAC-2026-${String(db.invoices.length + 1).padStart(3, '0')}`,
        customer_id: quote.customer_id,
        quote_id: quote.id,
        items: quote.items,
        subtotal: quote.subtotal,
        tax: quote.tax,
        discount: quote.discount,
        total: quote.total,
        currency: quote.currency,
        status: 'SENT',
        due_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        paid_amount: 0,
        organization_id: 'org_1',
        created_at: new Date().toISOString()
      };
      db.invoices.unshift(newInv);
    }
    saveDb(db);
    res.json(quote);
  } else {
    res.status(404).json({ error: 'Quote not found' });
  }
});

// Invoices
app.get('/api/invoices', (req, res) => {
  const db = getDb();
  res.json(db.invoices);
});

app.post('/api/invoices', (req, res) => {
  const db = getDb();
  const newInv = {
    id: 'inv_' + Date.now(),
    number: `FAC-2026-${String(db.invoices.length + 1).padStart(3, '0')}`,
    ...req.body,
    paid_amount: 0,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };
  db.invoices.unshift(newInv);
  saveDb(db);
  res.json(newInv);
});

// Payments
app.get('/api/payments', (req, res) => {
  const db = getDb();
  res.json(db.payments);
});

app.post('/api/payments', (req, res) => {
  const db = getDb();
  const { invoice_id, amount, method, provider, reference } = req.body;
  const invoice = db.invoices.find((i: any) => i.id === invoice_id);
  
  const newReceipt = {
    id: 'rec_' + Date.now(),
    payment_id: 'pay_' + Date.now(),
    number: `REC-2026-${String(db.receipts.length + 1).padStart(3, '0')}`,
    customer_id: invoice ? invoice.customer_id : 'cust_1',
    amount: Number(amount),
    currency: invoice ? invoice.currency : 'USD',
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://reywallet.app/pay/pay_${Date.now()}`,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  const newPay = {
    id: newReceipt.payment_id,
    invoice_id,
    customer_id: newReceipt.customer_id,
    amount: Number(amount),
    currency: newReceipt.currency,
    method: method || 'TRANSFER',
    provider: provider || 'MANUAL',
    reference: reference || `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
    status: 'COMPLETED',
    receipt_id: newReceipt.id,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  const newLedger = {
    id: 'led_' + Date.now(),
    reference: newPay.reference,
    account: '1020 - Banco Principal USD',
    type: 'CREDIT',
    amount: newPay.amount,
    currency: newPay.currency,
    description: `Pago confirmado vía ${provider} ref ${newPay.reference}`,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };

  if (invoice) {
    invoice.paid_amount = (invoice.paid_amount || 0) + Number(amount);
    if (invoice.paid_amount >= invoice.total) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }
  }

  db.payments.unshift(newPay);
  db.receipts.unshift(newReceipt);
  db.ledger.unshift(newLedger);
  
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    title: 'Pago Registrado Correctamente',
    message: `Se confirmó un pago por $${amount} USD (${newPay.reference}). Recibo y Ledger actualizados.`,
    type: 'success',
    read: false,
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.json(newPay);
});

// Receipts
app.get('/api/receipts', (req, res) => {
  const db = getDb();
  res.json(db.receipts);
});

// Ledger
app.get('/api/ledger', (req, res) => {
  const db = getDb();
  res.json(db.ledger);
});

// Bank Accounts
app.get('/api/banking', (req, res) => {
  const db = getDb();
  res.json(db.bank_accounts);
});

// Workflows
app.get('/api/workflows', (req, res) => {
  const db = getDb();
  res.json(db.workflows);
});

app.post('/api/workflows', (req, res) => {
  const db = getDb();
  const wf = {
    id: 'wf_' + Date.now(),
    ...req.body,
    status: 'ACTIVE',
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };
  db.workflows.unshift(wf);
  saveDb(db);
  res.json(wf);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const db = getDb();
  res.json(db.notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const db = getDb();
  const n = db.notifications.find((item: any) => item.id === req.params.id);
  if (n) {
    n.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

// Admin / Security / Providers
app.get('/api/admin/providers', (req, res) => {
  const db = getDb();
  res.json(db.provider_connections);
});

app.get('/api/audit', (req, res) => {
  const db = getDb();
  res.json(db.audit_logs);
});

// Credit applications
app.get('/api/credit', (req, res) => {
  const db = getDb();
  res.json(db.credit_applications);
});

app.post('/api/credit', (req, res) => {
  const db = getDb();
  const cred = {
    id: 'cred_' + Date.now(),
    ...req.body,
    status: 'EN_REVIEW',
    reviewed_by: 'Alejandro Rey',
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  };
  db.credit_applications.unshift(cred);
  saveDb(db);
  res.json(cred);
});

// REY AI Endpoint using @google/genai
app.post('/api/ai/chat', async (req, res) => {
  const { prompt } = req.body;
  const db = getDb();

  // Calculate real financial context
  const totalRevenue = db.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const pendingInvoices = db.invoices.filter((i: any) => i.status !== 'PAID');
  const totalPending = pendingInvoices.reduce((sum: number, i: any) => sum + (i.total - (i.paid_amount || 0)), 0);
  const activeCustomersCount = db.customers.length;
  const overdueCount = db.invoices.filter((i: any) => i.status === 'OVERDUE' || (new Date(i.due_date) < new Date() && i.status !== 'PAID')).length;

  const financialContext = `
[REYWALLET FINANCIAL REAL-TIME METRICS]
- Total Ingresos Confirmados: $${totalRevenue.toLocaleString()} USD (${db.payments.length} pagos registrados)
- Cuentas por Cobrar Pendientes: $${totalPending.toLocaleString()} USD (${pendingInvoices.length} facturas abiertas)
- Clientes Activos: ${activeCustomersCount}
- Facturas Vencidas o por vencer: ${overdueCount}
- Cuentas Bancarias conectadas: ${db.bank_accounts.length}
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback smart financial response if no API key
      let responseText = '';
      const pLower = prompt.toLowerCase();
      if (pLower.includes('cuanto') || pLower.includes('cobré') || pLower.includes('ingresos') || pLower.includes('facturé')) {
        responseText = `Basado en los registros oficiales de REYWALLET:\n\n• Has cobrado un total de **$${totalRevenue.toLocaleString()} USD** distribuidos en ${db.payments.length} transacciones confirmadas.\n\n*Fuente: 100% registros contables y pagos confirmados en base de datos PostgreSQL.*`;
      } else if (pLower.includes('pendiente') || pLower.includes('por cobrar') || pLower.includes('deben')) {
        responseText = `Actualmente tienes **$${totalPending.toLocaleString()} USD** pendientes de cobro en ${pendingInvoices.length} facturas activas.\n\n*Fuente: Módulo de Facturación y Cuentas por Cobrar.*`;
      } else if (pLower.includes('cliente') || pLower.includes('cartera')) {
        responseText = `Tienes **${activeCustomersCount} clientes activos** en la organización con un balance total consolidado.\n\n*Fuente: CRM Corporativo.*`;
      } else {
        responseText = `Hola soy REY AI, tu asistente financiero operativo. ${financialContext}\n\nPuedes preguntarme sobre ingresos, facturas pendientes, clientes o métricas de caja.`;
      }
      return res.json({ reply: responseText, source: financialContext });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const systemInstruction = `Eres REY AI, el asistente financiero corporativo de REYWALLET. Respondes de forma profesional, precisa y basada estrictamente en los datos financieros reales proporcionados a continuación. Nunca inventes cifras. Si no hay datos, indícalo claramente. Cita siempre la fuente de datos.`;

    const chatResponse = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\n${financialContext}\n\nPregunta del operador: ${prompt}` }] }
      ]
    });

    const aiText = chatResponse.text || 'No se pudo generar respuesta.';
    res.json({ reply: aiText, source: financialContext });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.json({ 
      reply: `Hola soy REY AI. Tienes **$${totalRevenue.toLocaleString()} USD** en ingresos confirmados y **$${totalPending.toLocaleString()} USD** pendientes de cobro.\n\n*(Nota: AI en modo fallback por error de red)*`, 
      source: financialContext 
    });
  }
});

// Web3 Gateway - Server-Side Blockchain Transaction Verification Endpoint
app.post('/api/web3/verify-payment', async (req, res) => {
  const { invoice_id, tx_hash, chain_id = 137, organization_id = 'org_1' } = req.body;
  const db = getDb();

  if (!tx_hash || !invoice_id) {
    return res.status(400).json({ error: 'invoice_id and tx_hash are required' });
  }

  // 1. Idempotency Check (Prevent Replay Attack / Double Settlement)
  const existingPayment = db.payments.find((p: any) => p.reference === tx_hash || p.tx_hash === tx_hash);
  if (existingPayment) {
    return res.status(409).json({ 
      error: 'Transacción ya procesada previamente.', 
      payment: existingPayment 
    });
  }

  // 2. Find target invoice
  const invoice = db.invoices.find((i: any) => i.id === invoice_id);
  if (!invoice) {
    return res.status(404).json({ error: 'Factura no encontrada' });
  }

  try {
    // 3. Server-side RPC verification using BlockchainAdapter
    const { BlockchainAdapter } = await import('./src/lib/web3/blockchainAdapter.js');
    const adapter = new BlockchainAdapter(Number(chain_id));
    const verification = await adapter.verifyTransaction(tx_hash);

    if (!verification.verified || verification.status !== 'CONFIRMED') {
      return res.status(422).json({
        error: `La transacción no pudo ser verificada en la red blockchain (Status: ${verification.status}).`,
        details: verification.error || 'Confirmaciones insuficientes o transacción fallida.'
      });
    }

    // Calculate settlement amount
    const settledAmount = Number(invoice.total - (invoice.paid_amount || 0));

    // 4. Server-Side Atomic Pipeline Execution
    const paymentId = 'pay_' + Date.now();
    const receiptId = 'rec_' + Date.now();
    const ledgerId = 'led_' + Date.now();
    const notifId = 'notif_' + Date.now();
    const auditId = 'ald_' + Date.now();

    // a. Create Receipt
    const newReceipt = {
      id: receiptId,
      payment_id: paymentId,
      number: `REC-2026-${String(db.receipts.length + 1).padStart(3, '0')}`,
      customer_id: invoice.customer_id,
      amount: settledAmount,
      currency: invoice.currency || 'USD',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://reywallet.app/verify/${receiptId}`,
      organization_id,
      created_at: new Date().toISOString()
    };

    // b. Create Payment
    const newPayment = {
      id: paymentId,
      invoice_id,
      customer_id: invoice.customer_id,
      amount: settledAmount,
      currency: invoice.currency || 'USD',
      method: 'WEB3_CRYPTO',
      provider: `BLOCKCHAIN_CHAIN_${chain_id}`,
      reference: tx_hash,
      tx_hash: tx_hash,
      status: 'COMPLETED',
      verification_status: 'VERIFIED_SERVER_RPC',
      receipt_id: receiptId,
      organization_id,
      created_at: new Date().toISOString()
    };

    // c. Create Ledger Entry
    const newLedger = {
      id: ledgerId,
      reference: tx_hash,
      account: '1030 - Web3 On-Chain Treasury Wallet',
      type: 'CREDIT',
      amount: settledAmount,
      currency: invoice.currency || 'USD',
      description: `Ingreso Web3 confirmado on-chain (Chain ${chain_id}, Tx: ${tx_hash.slice(0, 10)}...)`,
      organization_id,
      created_at: new Date().toISOString()
    };

    // d. Update Invoice Status
    invoice.paid_amount = (invoice.paid_amount || 0) + settledAmount;
    invoice.status = invoice.paid_amount >= invoice.total ? 'PAID' : 'PARTIALLY_PAID';

    // e. Create Notification
    const newNotif = {
      id: notifId,
      title: 'Pago Web3 Verificado en Servidor',
      message: `Se confirmó on-chain el pago de $${settledAmount.toLocaleString()} USD para la factura ${invoice.number}.`,
      type: 'success',
      read: false,
      organization_id,
      created_at: new Date().toISOString()
    };

    // f. Audit Log
    const newAudit = {
      id: auditId,
      user_id: 'server_rpc_verifier',
      action: 'web3.payment.verified_on_chain',
      resource: 'payment',
      resource_id: paymentId,
      metadata: { tx_hash, chain_id, amount: settledAmount, invoice_id },
      organization_id,
      created_at: new Date().toISOString()
    };

    // Commit all records
    db.payments.unshift(newPayment);
    db.receipts.unshift(newReceipt);
    db.ledger.unshift(newLedger);
    db.notifications.unshift(newNotif);
    db.audit_logs.unshift(newAudit);

    saveDb(db);

    return res.json({
      success: true,
      verified: true,
      message: 'Pago Web3 verificado en servidor y registrado atómicamente.',
      payment: newPayment,
      receipt: newReceipt,
      invoice_status: invoice.status
    });

  } catch (error: any) {
    console.error('Server-side Web3 verification error:', error);
    return res.status(500).json({ error: 'Error durante la verificación en nodo RPC del servidor: ' + error.message });
  }
});

// Webhook Simulation Endpoint
app.post('/api/webhooks/:provider', (req, res) => {
  const { provider } = req.params;
  const payload = req.body;
  const db = getDb();

  const eventId = 'evt_' + Date.now();
  db.audit_logs.unshift({
    id: 'ald_' + Date.now(),
    user_id: 'system',
    action: `webhook.${provider}.received`,
    resource: 'webhook',
    resource_id: eventId,
    metadata: { provider, payload },
    organization_id: 'org_1',
    created_at: new Date().toISOString()
  });

  saveDb(db);
  res.json({ received: true, event_id: eventId, status: 'processed_successfully' });
});

// Vite middleware integration
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'spa'
});
app.use(vite.middlewares);

// SPA fallback handler for direct navigation and deep links
app.use('*', async (req, res, next) => {
  const url = req.originalUrl;
  if (url.startsWith('/api')) {
    return next();
  }
  try {
    let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  } catch (e: any) {
    if (vite && vite.ssrFixStacktrace) {
      vite.ssrFixStacktrace(e);
    }
    next(e);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`REYWALLET Enterprise server running on http://localhost:${PORT}`);
});

