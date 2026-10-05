import React from 'react';
import { useApp } from '../../context/AppContext';
import { PauseCircle, Play, Trash2, Clock, User, ShoppingBag } from 'lucide-react';

export const HoldBillsView: React.FC = () => {
  const { heldBills, resumeHeldBill, deleteHeldBill, t, setActiveTab } = useApp();

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PauseCircle className="w-6 h-6 text-amber-500" />
            <span>{t('hold_bills_title')}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {heldBills.length} held
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('hold_bills_desc')}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('billing')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          Go to POS Billing
        </button>
      </div>

      {/* Held Bills Grid / List */}
      {heldBills.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <PauseCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700 text-base">{t('no_held_bills')}</div>
          <p className="text-xs text-slate-400 mt-1">
            When a customer steps aside to pick another item, click "Hold Bill (F8)" to park their cart here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heldBills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800 text-xs truncate">
                      {bill.customer_name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-num font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {bill.invoice_no}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Held on: {bill.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{bill.lines.length} items in parked cart</span>
                  </div>

                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg max-h-24 overflow-y-auto divide-y divide-slate-100 text-[11px]">
                    {bill.lines.map((line, idx) => (
                      <div key={idx} className="py-1 flex justify-between">
                        <span className="truncate pr-2 font-medium text-slate-700">
                          {line.item_name_en}
                        </span>
                        <span className="font-mono-num text-slate-500 shrink-0">
                          {line.quantity} {line.unit} = ₹{line.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Payable Total</span>
                  <span className="text-lg font-black font-mono-num text-slate-900">
                    ₹{bill.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteHeldBill(bill.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete parked bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => resumeHeldBill(bill.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('resume_bill')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
