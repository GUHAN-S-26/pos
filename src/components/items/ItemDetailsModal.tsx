import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Package, 
  Barcode, 
  TrendingUp, 
  Clock, 
  Layers, 
  Edit3, 
  AlertTriangle, 
  Calendar,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const ItemDetailsModal: React.FC = () => {
  const { 
    selectedItemForDetail, 
    setSelectedItemForDetail, 
    openItemModal, 
    stockTransactions, 
    categories, 
    brands, 
    units, 
    t 
  } = useApp();

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const category = categories.find((c) => c.id === item.category_id);
  const brand = brands.find((b) => b.id === item.brand_id);
  const unit = units.find((u) => u.id === item.unit_id);

  // Filter transactions for this specific item
  const itemTxs = stockTransactions.filter((tx) => tx.item_id === item.id);

  const isLowStock = item.current_stock <= item.min_stock;
  const isOutOfStock = item.current_stock <= 0;

  // Margin calculation
  const marginPerUnit = item.sales_price - item.purchase_price;
  const marginPercentage = item.purchase_price > 0 ? (marginPerUnit / item.purchase_price) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {item.short_name}
                </h2>
                {isOutOfStock ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    {t('out_of_stock')}
                  </span>
                ) : isLowStock ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    {t('low_stock')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {t('in_stock')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {item.tamil_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItemForDetail(null);
                openItemModal('edit', item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('btn_edit')}</span>
            </button>
            <button
              onClick={() => setSelectedItemForDetail(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('col_current_stock')}
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-mono-num">
                {item.current_stock} <span className="text-xs font-normal text-slate-500">{unit?.short_code}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Min threshold: {item.min_stock} {unit?.short_code}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('col_sales_price')}
              </span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono-num">
                ₹{item.sales_price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                MRP: ₹{item.mrp.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('col_purchase_price')}
              </span>
              <span className="text-xl font-extrabold text-slate-800 font-mono-num">
                ₹{item.purchase_price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Inventory Cost
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Margin / Unit
              </span>
              <span className="text-xl font-extrabold text-purple-700 font-mono-num">
                +₹{marginPerUnit.toFixed(2)}
              </span>
              <span className="text-[10px] text-purple-600 font-bold block mt-0.5">
                {marginPercentage.toFixed(1)}% Markup
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Classification & Codes
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{category?.name} ({category?.tamil_name})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Brand:</span>
                <span className="font-bold text-slate-800">{brand?.name || 'Local / Generic'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Barcode / EAN:</span>
                <span className="font-mono-num font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {item.barcode || 'Not assigned'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">GST Rate & HSN:</span>
                <span className="font-bold text-slate-800">
                  {item.gst_rate}% GST {item.hsn_code ? `(HSN: ${item.hsn_code})` : ''}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Batch & Expiry Info
              </div>
              {item.batch_enabled && item.batches && item.batches.length > 0 ? (
                item.batches.map((batch) => (
                  <div key={batch.id} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between font-mono-num font-bold text-slate-900">
                      <span>Batch: {batch.batch_no}</span>
                      <span>Qty: {batch.quantity}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Mfg: {batch.manufacturing_date || 'N/A'}</span>
                      <span className="font-semibold text-rose-600">Exp: {batch.expiry_date || 'N/A'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 py-3 text-center">
                  Batch tracking is not enabled for this standard fast-moving grocery product.
                </div>
              )}
            </div>
          </div>

          {/* Section: Stock Movement History (PRD 8.3.1 requirement) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{t('item_details_history')}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Audit log of sales, inward purchases and adjustments
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemTxs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No recorded transactions for this product yet.
                      </td>
                    </tr>
                  ) : (
                    itemTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'SALE'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : tx.type === 'PURCHASE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono-num font-bold text-slate-800">
                          {tx.reference_id}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {tx.date}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[200px]">
                          {tx.notes || '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-num font-bold">
                          <span
                            className={
                              tx.quantity_delta > 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }
                          >
                            {tx.quantity_delta > 0 ? `+${tx.quantity_delta}` : tx.quantity_delta}{' '}
                            {unit?.short_code}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedItemForDetail(null)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
