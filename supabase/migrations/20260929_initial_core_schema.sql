-- ==============================================================================
-- REYWALLET ENTERPRISE PLATFORM - INITIAL CORE SCHEMA & MULTI-TENANT RLS POLICIES
-- PostgreSQL / Supabase Migration
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TENANCY & AUTHENTICATION TABLES
-- ==============================================================================

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    legal_name VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    country VARCHAR(10) DEFAULT 'MX',
    plan VARCHAR(50) DEFAULT 'ENTERPRISE',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    default_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    job_title VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RBAC Roles Definition
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'OWNER', 'ADMIN', 'ACCOUNTANT', 'SALES', 'VIEWER'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_role_code UNIQUE (organization_id, code)
);

-- RBAC Permissions Master Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'invoices:create', 'payments:register', 'ledger:view'
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Role - Permission Association
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Organization Memberships (Multi-Tenant User Links)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    role_code VARCHAR(50) DEFAULT 'VIEWER' NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- ==============================================================================
-- 3. CRM & CUSTOMER PORTFOLIO
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50), -- RFC, CIF, EIN
    website VARCHAR(255),
    industry VARCHAR(100),
    payment_terms VARCHAR(50) DEFAULT 'NET_30',
    credit_limit NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'ARCHIVED'
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.customer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    size_bytes BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. FINANCIAL ENGINE: QUOTES, INVOICES, PAYMENTS & RECEIPTS
-- ==============================================================================

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    number VARCHAR(50) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    tax NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'INVOICED'
    valid_until TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_quote_num UNIQUE (organization_id, number)
);

CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    total NUMERIC(15, 2) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    number VARCHAR(50) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    tax NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    status VARCHAR(50) DEFAULT 'SENT' NOT NULL, -- 'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'
    due_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_invoice_num UNIQUE (organization_id, number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    total NUMERIC(15, 2) NOT NULL
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'SPEI', 'TRANSFER', 'STRIPE', 'CARD', 'WEB3_CRYPTO', 'NFC_POS'
    provider VARCHAR(50) DEFAULT 'STRIPE',
    reference VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Digital Receipts with Public QR Validation
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    number VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    qr_code_url TEXT,
    verification_hash VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_receipt_num UNIQUE (organization_id, number)
);

-- ==============================================================================
-- 5. GENERAL LEDGER & TREASURY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reference VARCHAR(100),
    account VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'CREDIT', 'DEBIT'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    clabe VARCHAR(50),
    iban VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 6. REYSHOP E-COMMERCE & POS INVENTORY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_product_sku UNIQUE (organization_id, sku)
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAID' NOT NULL,
    fulfillment_status VARCHAR(50) DEFAULT 'PROCESSING' NOT NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_order_num UNIQUE (organization_id, order_number)
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================

-- Check if current authenticated user belongs to the specified organization
CREATE OR REPLACE FUNCTION public.is_member_of_org(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members
    WHERE organization_id = target_org_id 
      AND user_id = auth.uid()
      AND status = 'ACTIVE'
  );
$$;

-- ==============================================================================
-- 8. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 9. STRICT MULTI-TENANT RLS POLICIES (BY organization_id)
-- ==============================================================================

-- Organizations
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (public.is_member_of_org(id));

-- Profiles
CREATE POLICY "Users can view and update their own profile"
  ON public.profiles FOR ALL
  USING (id = auth.uid());

-- Organization Members
CREATE POLICY "Members can view membership of their organizations"
  ON public.organization_members FOR SELECT
  USING (public.is_member_of_org(organization_id));

-- Customers
CREATE POLICY "Strict Tenant Isolation for Customers"
  ON public.customers FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Customer Documents
CREATE POLICY "Strict Tenant Isolation for Documents"
  ON public.customer_documents FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Quotes
CREATE POLICY "Strict Tenant Isolation for Quotes"
  ON public.quotes FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Quote Items
CREATE POLICY "Strict Tenant Isolation for Quote Items"
  ON public.quote_items FOR ALL
  USING (quote_id IN (SELECT id FROM public.quotes WHERE public.is_member_of_org(organization_id)))
  WITH CHECK (quote_id IN (SELECT id FROM public.quotes WHERE public.is_member_of_org(organization_id)));

-- Invoices
CREATE POLICY "Strict Tenant Isolation for Invoices"
  ON public.invoices FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Invoice Items
CREATE POLICY "Strict Tenant Isolation for Invoice Items"
  ON public.invoice_items FOR ALL
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE public.is_member_of_org(organization_id)))
  WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE public.is_member_of_org(organization_id)));

-- Payments
CREATE POLICY "Strict Tenant Isolation for Payments"
  ON public.payments FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Receipts (Tenants have full access, public verification by receipt ID)
CREATE POLICY "Tenant and Verification Access for Receipts"
  ON public.receipts FOR ALL
  USING (public.is_member_of_org(organization_id) OR auth.role() = 'anon');

-- Ledger
CREATE POLICY "Strict Tenant Isolation for Ledger"
  ON public.ledger FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Bank Accounts
CREATE POLICY "Strict Tenant Isolation for Bank Accounts"
  ON public.bank_accounts FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Audit Logs
CREATE POLICY "Strict Tenant Isolation for Audit Logs"
  ON public.audit_logs FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Products (Public can read active catalog, Members can manage)
CREATE POLICY "Public Read / Tenant Manage for Products"
  ON public.products FOR SELECT
  USING (status = 'ACTIVE' OR public.is_member_of_org(organization_id));

CREATE POLICY "Tenant Manage Products"
  ON public.products FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- Product Reviews
CREATE POLICY "Public Read Reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Public and Member Insert Reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (true);

-- Shop Orders
CREATE POLICY "Strict Tenant Isolation for Shop Orders"
  ON public.shop_orders FOR ALL
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- ==============================================================================
-- 10. INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_org ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment ON public.receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_ledger_org ON public.ledger(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_org ON public.shop_orders(organization_id);
