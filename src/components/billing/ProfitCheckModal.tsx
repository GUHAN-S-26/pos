import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, AlertCircle, X, CheckCircle, Percent } from 'lucide-react';

interface ProfitCheckProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  totalCost: number;
  discount: number;
  tax: number;
  total: number;
}

export const ProfitCheckModal: React.FC<ProfitCheckProps> = ({
  isOpen,
  onClose,
  subtotal,
  totalCost,
  discount,
  tax,
  total,
}) => {
  const { t } = useApp();

  if (!isOpen) return null;

  // PRD Formula: Gross Profit = Sales Revenue - Purchase Cost
  // Net Gross Profit after discount = (Subtotal - discount) - totalCost
  const netSalesRevenue = Math.max(0, subtotal - discount);
  const grossProfit = netSalesRevenue - totalCost;
  const grossMarginPercent = netSalesRevenue > 0 ? (grossProfit / netSalesRevenue) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                {t('profit_check_title')}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Instant pre-checkout margin validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">{t('profit_sales_revenue')} (Pre-discount):</span>
              <span className="font-mono-num font-bold text-slate-800 text-sm">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">{t('profit_purchase_cost')} (COGS):</span>
              <span className="font-mono-num font-bold text-slate-700 text-sm">
                ₹{totalCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-rose-600">
              <span className="font-medium">{t('profit_discount_impact')} (Deducted):</span>
              <span className="font-mono-num font-bold text-sm">
                -₹{discount.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900 text-xs">
                  {t('profit_net_estimated')}:
                </span>
                <span className={`font-mono-num font-black text-lg ${grossProfit >= 0 ? 'text-purple-800' : 'text-rose-600'}`}>
                  {grossProfit >= 0 ? '+' : ''}₹{grossProfit.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-purple-700">
                <span>Gross Profit Margin:</span>
                <span className="font-bold font-mono-num">{grossMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* PRD Mandated Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {t('profit_disclaimer')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
          >
            Continue Billing
          </button>
        </div>
      </div>
    </div>
  );
};
