import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { 
  Receipt, 
  Search, 
  Printer, 
  RotateCcw, 
  Filter, 
  Eye, 
  Calendar, 
  CreditCard,
  User,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const BillHistoryView: React.FC = () => {
  const { sales, cancelSale, setPrintableSale, t, user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchInv = sale.invoice_no.toLowerCase().includes(q);
        const matchCust = sale.customer_name.toLowerCase().includes(q);
        const matchPhone = sale.customer_phone ? sale.customer_phone.includes(q) : false;
        if (!matchInv && !matchCust && !matchPhone) return false;
      }

      if (filterPayment !== 'all' && sale.payment_method !== filterPayment) {
        return false;
      }

      if (filterStatus !== 'all' && sale.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [sales, searchQuery, filterPayment, filterStatus]);

  const totalFilteredRevenue = filteredSales
    .filter((s) => s.status === 'Completed')
    .reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span>{t('bill_history_title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono-num">
              {filteredSales.length} bills
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit invoices, reprint customer receipts, or process stock-restoring cancellations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
          <span className="text-emerald-700 font-medium">Completed Revenue:</span>
          <strong className="font-mono-num font-bold text-emerald-900 text-sm">
            ₹{totalFilteredRevenue.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_invoice_placeholder')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-medium"
            >
              <option value="all">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / QR</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed Invoices</option>
              <option value="Cancelled">Cancelled / Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('col_invoice')}</th>
                <th className="py-3 px-3">{t('col_customer')}</th>
                <th className="py-3 px-3">{t('col_date')}</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">{t('col_payment')}</th>
                <th className="py-3 px-3 text-right">{t('subtotal')}</th>
                <th className="py-3 px-3 text-right">{t('tax_amount')}</th>
                <th className="py-3 px-3 text-right font-black">{t('col_total_amount')}</th>
                <th className="py-3 px-3 text-center">{t('col_status')}</th>
                <th className="py-3 px-4 text-center">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-600">No invoices found</div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isCancelled = sale.status === 'Cancelled';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/80 transition ${isCancelled ? 'opacity-60 bg-slate-50/40' : ''}`}
                    >
                      {/* Invoice No */}
                      <td className="py-3 px-4 font-mono-num font-extrabold text-blue-600">
                        {sale.invoice_no}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{sale.customer_name}</div>
                        {sale.customer_phone && (
                          <div className="text-[10px] text-slate-400 font-mono-num">{sale.customer_phone}</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {sale.date}
                      </td>

                      {/* Items Count */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono-num text-[11px]">
                          {sale.lines.length} items
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">
                          {sale.payment_method}
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3 px-3 text-right font-mono-num text-slate-600">
                        ₹{sale.subtotal.toFixed(2)}
                      </td>

                      {/* Tax */}
                      <td className="py-3 px-3 text-right font-mono-num text-slate-500">
                        ₹{sale.tax.toFixed(2)}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono-num font-black text-slate-900 text-xs">
                        ₹{sale.total.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            <XCircle className="w-3 h-3" />
                            {t('sale_cancelled')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintableSale(sale)}
                            title={t('btn_view_receipt')}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-bold transition"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to cancel invoice ${sale.invoice_no}? This will automatically restore sold stock back to inventory.`
                                  )
                                ) {
                                  cancelSale(sale.id);
                                }
                              }}
                              title={t('btn_cancel_sale')}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
