import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Purchase } from '../../types';
import { Truck, Search, Calendar, Eye, Building2, Plus, ArrowUpRight } from 'lucide-react';

export const PurchaseHistoryView: React.FC = () => {
  const { purchases, setActiveTab, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const filteredPurchases = purchases.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.invoice_no.toLowerCase().includes(q) ||
      p.supplier_name.toLowerCase().includes(q)
    );
  });

  const totalSpent = filteredPurchases.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>{t('nav_purchase_history')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono-num">
              {filteredPurchases.length} invoices
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit vendor bills, restocked inventory quantities and purchase rates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs">
            <span className="text-blue-700 font-medium">Total Purchase: </span>
            <strong className="font-mono-num font-bold text-blue-900 text-sm">
              ₹{totalSpent.toFixed(2)}
            </strong>
          </div>

          <button
            onClick={() => setActiveTab('new_purchase')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_new_purchase')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or vendor name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Inward Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-3">Supplier / Vendor</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Items Restocked</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">GST</th>
                <th className="py-3 px-3 text-right font-black">Total Inward</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No purchase history found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono-num font-extrabold text-blue-600">
                      {pur.invoice_no}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {pur.supplier_name}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {pur.date}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono-num">
                      {pur.lines.length} items ({pur.lines.reduce((a, c) => a + c.quantity, 0)} units)
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {pur.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-slate-600">
                      ₹{pur.subtotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-slate-500">
                      ₹{pur.tax.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-black text-slate-900 text-xs">
                      ₹{pur.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedPurchase(pur)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-bold transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Purchase Invoice: {selectedPurchase.invoice_no}
                </h3>
                <p className="text-xs text-slate-500">
                  Supplier: {selectedPurchase.supplier_name} • Date: {selectedPurchase.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty Inward</th>
                    <th className="py-2 px-3 text-right">Cost Rate</th>
                    <th className="py-2 px-3 text-center">Batch</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPurchase.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{l.item_name_en}</div>
                        <div className="text-[11px] text-slate-500">{l.item_name_ta}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono-num font-bold">
                        +{l.quantity} {l.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-num">
                        ₹{l.purchase_price.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono-num text-slate-500">
                        {l.batch_no || '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-num font-bold">
                        ₹{l.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <div className="text-right space-y-1">
                  <div>Subtotal: <span className="font-mono-num font-semibold">₹{selectedPurchase.subtotal.toFixed(2)}</span></div>
                  <div>GST Tax: <span className="font-mono-num font-semibold">₹{selectedPurchase.tax.toFixed(2)}</span></div>
                  <div className="text-sm font-black pt-1 border-t border-slate-200">
                    Grand Total: <span className="font-mono-num">₹{selectedPurchase.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
