import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { CustomerDetailView } from './components/CustomerDetailView';
import { ReyShopView } from './components/ReyShopView';
import { QuotesView } from './components/QuotesView';
import { InvoicesView } from './components/InvoicesView';
import { PaymentsView } from './components/PaymentsView';
import { ReceiptsView } from './components/ReceiptsView';
import { LedgerView } from './components/LedgerView';
import { BankingView } from './components/BankingView';
import { AiAssistantView } from './components/AiAssistantView';
import { WorkflowsView } from './components/WorkflowsView';
import { CreditView } from './components/CreditView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminView } from './components/AdminView';
import { Web3View } from './components/Web3View';
import { VerificationView } from './components/VerificationView';
import { EmmanAiGovernanceView } from './components/EmmanAiGovernanceView';
import { LoyaltyRewardsView } from './components/LoyaltyRewardsView';
import { ReyplaceShopPosView } from './components/ReyplaceShopPosView';
import { AuthModal } from './components/AuthModal';

import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { Customer } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeOrgId, setActiveOrgId] = useState('org_1');
  const isOnline = useOnlineStatus();
  
  // Real-time Supabase Session Management
  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useSupabaseAuth();



  // Check for public QR/NFC verification route (/verify/...)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  if (pathname.startsWith('/verify/')) {
    const credId = pathname.replace('/verify/', '');
    return <VerificationView credentialId={credId} onBackToApp={() => { window.location.href = '/'; }} />;
  }
  const [dbData, setDbData] = useState<any>({
    organizations: [
      { id: 'org_1', name: 'Rey Fintech Corp S.A. de C.V.', currency: 'USD' },
      { id: 'org_2', name: 'Latam Digital Payments S.A.', currency: 'MXN' },
      { id: 'org_3', name: 'Global Asset Holdings LLC', currency: 'EUR' }
    ],
    customers: [],
    quotes: [],
    invoices: [],
    payments: [],
    receipts: [],
    ledger: [],
    bank_accounts: [],
    workflows: [],
    notifications: [],
    credit_applications: []
  });
  const [loading, setLoading] = useState(true);

  const checkConnection = () => {
    if (!isOnline) {
      alert('Operación financiera bloqueada: No tienes conexión a internet.');
      return false;
    }
    return true;
  };

  // Fetch full state from server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data && data.organizations && data.organizations.length > 0) {
        // Ensure multiple orgs if only 1 returned
        if (data.organizations.length === 1) {
          data.organizations = [
            data.organizations[0],
            { id: 'org_2', name: 'Latam Digital Payments S.A.', currency: 'MXN' },
            { id: 'org_3', name: 'Global Asset Holdings LLC', currency: 'EUR' }
          ];
        }
      }
      setDbData(data);
    } catch (e) {
      console.error('Failed to fetch state:', e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchState();
  }, []);

  // Action handlers calling backend APIs
  const handleAddCustomer = async (custData: any) => {
    if (!checkConnection()) return;
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData)
    });
    fetchState();
  };

  const handleUpdateCustomer = async (id: string, updatedData: any) => {
    if (!checkConnection()) return;
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const handleArchiveCustomer = async (id: string) => {
    if (!checkConnection()) return;
    await fetch(`/api/customers/${id}/archive`, { method: 'PATCH' });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(prev => prev ? { ...prev, status: 'ARCHIVED' } : null);
    }
  };

  const handleRestoreCustomer = async (id: string) => {
    if (!checkConnection()) return;
    await fetch(`/api/customers/${id}/restore`, { method: 'PATCH' });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
    }
  };

  const handleAddDocument = async (customerId: string, docData: any) => {
    if (!checkConnection()) return;
    await fetch(`/api/customers/${customerId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === customerId) {
      const updatedDocs = [...(selectedCustomer.documents || []), { ...docData, id: 'doc_' + Date.now() }];
      setSelectedCustomer({ ...selectedCustomer, documents: updatedDocs });
    }
  };

  const handleDeleteDocument = async (customerId: string, docId: string) => {
    if (!checkConnection()) return;
    await fetch(`/api/customers/${customerId}/documents/${docId}`, { method: 'DELETE' });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === customerId) {
      const updatedDocs = (selectedCustomer.documents || []).filter(d => d.id !== docId);
      setSelectedCustomer({ ...selectedCustomer, documents: updatedDocs });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    fetchState();
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(null);
    }
  };


  const handleAddQuote = async (quoteData: any) => {
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    fetchState();
  };

  const handleUpdateQuoteStatus = async (id: string, status: string) => {
    await fetch(`/api/quotes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchState();
  };

  const handleAddInvoice = async (invoiceData: any) => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });
    fetchState();
  };

  const handleRegisterPayment = async (payData: any) => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payData)
    });
    fetchState();
  };

  const handleRegisterPaymentFromInvoice = async (invoiceId: string, amount: number) => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, amount, method: 'TRANSFER', provider: 'STRIPE' })
    });
    fetchState();
  };

  const handleAddWorkflow = async (wfData: any) => {
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wfData)
    });
    fetchState();
  };

  const handleAddCreditApp = async (appData: any) => {
    await fetch('/api/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    fetchState();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    fetchState();
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new_invoice') {
      setCurrentView('invoices');
    } else if (action === 'new_payment') {
      setCurrentView('payments');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center font-mono">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-lime-400 animate-ping"></span>
          <span>Iniciando REYWALLET Enterprise Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal onSuccess={() => { fetchState(); }} />;
  }

  const currentOrg = dbData.organizations.find((o: any) => o.id === activeOrgId) || dbData.organizations[0] || { name: 'Rey Fintech Corp' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          if (view === 'customers') setSelectedCustomer(null);
          setCurrentView(view);
        }} 
        unreadCount={dbData.notifications.filter((n: any) => !n.read).length}
        userProfile={userProfile}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Topbar 
          organization={currentOrg}
          organizations={dbData.organizations}
          activeOrganizationId={activeOrgId}
          onSwitchOrganization={setActiveOrgId}
          notifications={dbData.notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onQuickAction={handleQuickAction}
          userProfile={userProfile}
          onSignOut={signOut}
        />


        <main className="flex-1">
          {currentView === 'dashboard' && (
            <DashboardView 
              customers={dbData.customers}
              invoices={dbData.invoices}
              payments={dbData.payments}
              quotes={dbData.quotes}
              notifications={dbData.notifications}
              onNavigate={setCurrentView}
              onQuickAction={handleQuickAction}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          )}
          {currentView === 'customers' && (
            selectedCustomer ? (
              <CustomerDetailView 
                customer={selectedCustomer}
                invoices={dbData.invoices}
                quotes={dbData.quotes}
                payments={dbData.payments}
                receipts={dbData.receipts}
                onBack={() => setSelectedCustomer(null)}
                onUpdateCustomer={handleUpdateCustomer}
                onArchiveCustomer={handleArchiveCustomer}
                onRestoreCustomer={handleRestoreCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
                onQuickInvoice={(custId) => {
                  setCurrentView('invoices');
                }}
                onQuickQuote={(custId) => {
                  setCurrentView('quotes');
                }}
              />
            ) : (
              <CustomersView 
                customers={dbData.customers}
                invoices={dbData.invoices}
                quotes={dbData.quotes}
                payments={dbData.payments}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onArchiveCustomer={handleArchiveCustomer}
                onRestoreCustomer={handleRestoreCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onSelectCustomer={(c) => setSelectedCustomer(c)}
              />
            )
          )}
          {currentView === 'reyplace_pos' && (
            <ReyplaceShopPosView />
          )}
          {currentView === 'shop' && (
            <ReyShopView 
              products={dbData.products || []}
              customers={dbData.customers || []}
              onOrderCompleted={fetchState}
            />
          )}

          {currentView === 'quotes' && (
            <QuotesView 
              quotes={dbData.quotes}
              customers={dbData.customers}
              onAddQuote={handleAddQuote}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
            />
          )}
          {currentView === 'invoices' && (
            <InvoicesView 
              invoices={dbData.invoices}
              customers={dbData.customers}
              onAddInvoice={handleAddInvoice}
              onRegisterPaymentFromInvoice={handleRegisterPaymentFromInvoice}
            />
          )}
          {currentView === 'payments' && (
            <PaymentsView 
              payments={dbData.payments}
              invoices={dbData.invoices}
              customers={dbData.customers}
              onRegisterPayment={handleRegisterPayment}
            />
          )}
          {currentView === 'web3' && (
            <Web3View 
              organizationId={activeOrgId}
              invoices={dbData.invoices}
              onPaymentProcessed={fetchState}
            />
          )}
          {currentView === 'receipts' && (
            <ReceiptsView 
              receipts={dbData.receipts}
              customers={dbData.customers}
            />
          )}
          {currentView === 'ledger' && (
            <LedgerView 
              ledger={dbData.ledger}
            />
          )}
          {currentView === 'banking' && (
            <BankingView 
              banking={dbData.bank_accounts}
            />
          )}
          {currentView === 'ai' && (
            <AiAssistantView />
          )}
          {currentView === 'emman_ai' && (
            <EmmanAiGovernanceView />
          )}
          {currentView === 'loyalty' && (
            <LoyaltyRewardsView />
          )}
          {currentView === 'workflows' && (
            <WorkflowsView 
              workflows={dbData.workflows}
              onAddWorkflow={handleAddWorkflow}
            />
          )}
          {currentView === 'credit' && (
            <CreditView 
              creditApps={dbData.credit_applications}
              customers={dbData.customers}
              onAddCreditApp={handleAddCreditApp}
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsView 
              payments={dbData.payments}
              invoices={dbData.invoices}
            />
          )}
          {currentView === 'admin' && (
            <AdminView 
              organization={currentOrg}
            />
          )}
        </main>
      </div>
    </div>
  );
}
