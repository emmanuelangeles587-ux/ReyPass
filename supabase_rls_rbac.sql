-- =========================================================================
-- REYWALLET — Granular RBAC & Multi-Tenant RLS Database Architecture Script
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'America/Mexico_City',
    tax_id TEXT,
    plan TEXT DEFAULT 'ENTERPRISE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Roles Enum
CREATE TYPE user_role AS ENUM (
    'OWNER', 
    'ADMIN', 
    'MANAGER', 
    'ACCOUNTANT', 
    'SALES', 
    'VIEWER', 
    'CUSTOMER', 
    'CREDIT_MANAGER'
);

-- 4. Organization Memberships Table (User -> Organization -> Role)
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. Enable Row Level Security (RLS) on all business tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function: Check if current authenticated user belongs to organization
CREATE OR REPLACE FUNCTION auth.user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_memberships
        WHERE organization_memberships.organization_id = org_id
          AND organization_memberships.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies for Multi-Tenant Isolation
-- Invoices Policy
CREATE POLICY invoices_isolation_policy ON invoices
    FOR ALL
    USING (auth.user_belongs_to_org(organization_id))
    WITH CHECK (auth.user_belongs_to_org(organization_id));

-- Payments Policy
CREATE POLICY payments_isolation_policy ON payments
    FOR ALL
    USING (auth.user_belongs_to_org(organization_id))
    WITH CHECK (auth.user_belongs_to_org(organization_id));

-- Receipts Policy
CREATE POLICY receipts_isolation_policy ON receipts
    FOR ALL
    USING (auth.user_belongs_to_org(organization_id))
    WITH CHECK (auth.user_belongs_to_org(organization_id));

-- Ledger Policy
CREATE POLICY ledger_isolation_policy ON ledger
    FOR ALL
    USING (auth.user_belongs_to_org(organization_id))
    WITH CHECK (auth.user_belongs_to_org(organization_id));

-- Audit Logs Policy
CREATE POLICY audit_logs_isolation_policy ON audit_logs
    FOR ALL
    USING (auth.user_belongs_to_org(organization_id))
    WITH CHECK (auth.user_belongs_to_org(organization_id));

-- =========================================================================
-- End of Script
-- =========================================================================
