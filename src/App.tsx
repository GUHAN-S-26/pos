/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Toast } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { ItemList } from './components/items/ItemList';
import { ItemFormModal } from './components/items/ItemFormModal';
import { ItemDetailsModal } from './components/items/ItemDetailsModal';
import { NewBillView } from './components/billing/NewBillView';
import { HoldBillsView } from './components/billing/HoldBillsView';
import { BillHistoryView } from './components/billing/BillHistoryView';
import { ReceiptPrintModal } from './components/billing/ReceiptPrintModal';
import { NewPurchaseView } from './components/purchases/NewPurchaseView';
import { PurchaseHistoryView } from './components/purchases/PurchaseHistoryView';
import { SuppliersView } from './components/purchases/SuppliersView';
import { ExpensesView } from './components/purchases/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    itemModalState, 
    selectedItemForDetail, 
    printableSale, 
    setPrintableSale 
  } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {(activeTab === 'items' || activeTab === 'new_item') && <ItemList />}
          {activeTab === 'billing' && <NewBillView />}
          {activeTab === 'hold_bills' && <HoldBillsView />}
          {activeTab === 'bill_history' && <BillHistoryView />}
          {activeTab === 'purchases' && <PurchaseHistoryView />}
          {activeTab === 'new_purchase' && <NewPurchaseView />}
          {activeTab === 'suppliers' && <SuppliersView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      {itemModalState.isOpen && <ItemFormModal />}
      {selectedItemForDetail && <ItemDetailsModal />}
      {printableSale && (
        <ReceiptPrintModal
          sale={printableSale}
          onClose={() => setPrintableSale(null)}
        />
      )}

      {/* Toast Feedback */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
