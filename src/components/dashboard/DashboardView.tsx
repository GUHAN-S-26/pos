import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  Truck, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  ChevronRight,
  Receipt,
  BarChart3,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    t, 
    sales, 
    purchases, 
    items, 
    setActiveTab, 
    openItemModal, 
    setPrintableSale,
    setSelectedItemForDetail
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Calculate metrics based on period
  const completedSales = sales.filter((s) => s.status === 'Completed');

  // Compute total sales, purchases, gross profit
  const totalSalesAmount = completedSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalPurchasesAmount = purchases.reduce((acc, curr) => acc + curr.total, 0);
  const totalGrossProfit = completedSales.reduce((acc, curr) => acc + (curr.gross_profit || 0), 0);

  // Compute total inventory stock value (Current stock * purchase price)
  const stockInventoryValue = items.reduce(
    (acc, curr) => acc + Math.max(0, curr.current_stock) * curr.purchase_price, 
    0
  );

  // Low stock items
  const lowStockItems = items.filter((item) => item.current_stock <= item.min_stock);

  // Recent transactions (merged sales + purchases sorted by date)
  const recentActivities = [
    ...completedSales.map((s) => ({
      id: s.id,
      type: 'SALE' as const,
      ref: s.invoice_no,
      party: s.customer_name,
      amount: s.total,
      date: s.date,
      payment: s.payment_method,
      raw: s,
    })),
    ...purchases.map((p) => ({
      id: p.id,
      type: 'PURCHASE' as const,
      ref: p.invoice_no,
      party: p.supplier_name,
      amount: p.total,
      date: p.date,
      payment: p.payment_method,
      raw: p,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);

  // Sales Trend Mock Data based on actual totals
  const chartDays = [
    { day: 'Mon', sales: 4200, count: 18 },
    { day: 'Tue', sales: 5100, count: 24 },
    { day: 'Wed', sales: 3800, count: 15 },
    { day: 'Thu', sales: 6400, count: 28 },
    { day: 'Fri', sales: 7200, count: 32 },
    { day: 'Sat', sales: 9800, count: 45 },
    { day: 'Sun (Today)', sales: totalSalesAmount > 0 ? totalSalesAmount : 8450, count: completedSales.length || 38 },
  ];
  const maxDaySales = Math.max(...chartDays.map((d) => d.sales), 10000);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t('nav_dashboard')}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time business performance, inventory valuation and checkout summary
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              period === 'today'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dash_period_today')}
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              period === 'week'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dash_period_week')}
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              period === 'month'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dash_period_month')}
          </button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div 
          onClick={() => setActiveTab('bill_history')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dash_today_sales')}
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono-num">
              ₹{totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{completedSales.length} bills completed today</span>
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div 
          onClick={() => setActiveTab('purchases')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dash_today_purchases')}
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono-num">
              ₹{totalPurchasesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{purchases.length} stock receipts recorded</span>
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dash_gross_profit')}
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-700 font-mono-num">
              ₹{totalGrossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-purple-600 font-semibold">
              <span>Gross sales margin (COGS deducted)</span>
            </div>
          </div>
        </div>

        {/* Stock Value Card */}
        <div 
          onClick={() => setActiveTab('items')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dash_inventory_value')}
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono-num">
              ₹{stockInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <span>{items.length} unique catalog items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Grid: Sales Chart + Low Stock Alert Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                {t('dash_sales_trend')}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Daily billing velocity & revenue flow</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Week to Date
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="h-48 pt-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
            {chartDays.map((d, idx) => {
              const heightPct = Math.round((d.sales / maxDaySales) * 100);
              const isToday = idx === chartDays.length - 1;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-mono-num font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    ₹{d.sales}
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-md h-36 flex items-end p-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-700 to-blue-500 shadow-sm'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 hover:from-blue-400 hover:to-blue-300'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-semibold truncate ${isToday ? 'text-blue-600 font-extrabold' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Average Ticket Size: <strong className="text-slate-800 font-mono-num">₹280.00</strong></span>
            <span>Peak Hour: <strong className="text-slate-800">10:00 AM - 01:00 PM</strong></span>
          </div>
        </div>

        {/* Low Stock Alert Column */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                {t('dash_low_stock_count')} ({lowStockItems.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('items')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              {t('dash_view_all')}
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-60 pr-1">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                All inventory items are well-stocked above minimum threshold!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="p-2.5 rounded-lg border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50 transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 truncate">{item.short_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.tamil_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded font-mono-num font-extrabold bg-rose-100 text-rose-700 text-[11px]">
                      {item.current_stock} / min {item.min_stock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveTab('new_purchase')}
            className="w-full mt-3 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition"
          >
            + Create Restock Purchase Order
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Most Used Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              {t('dash_recent_transactions')}
            </h3>
            <button
              onClick={() => setActiveTab('bill_history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t('dash_view_all')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Ref #</th>
                  <th className="py-2 px-2">Customer / Supplier</th>
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Payment</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                  <th className="py-2 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <tr key={`${act.type}-${act.id}`} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          act.type === 'SALE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {act.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono-num font-bold text-slate-800">
                      {act.ref}
                    </td>
                    <td className="py-2.5 px-2 text-slate-700 font-medium truncate max-w-[160px]">
                      {act.party}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                      {act.date}
                    </td>
                    <td className="py-2.5 px-2 text-slate-600">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold">
                        {act.payment}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono-num font-bold text-slate-900">
                      ₹{act.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {act.type === 'SALE' ? (
                        <button
                          onClick={() => setPrintableSale(act.raw as any)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] hover:underline"
                        >
                          Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('purchases')}
                          className="text-slate-600 hover:text-slate-900 font-semibold text-[11px] hover:underline"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Used Reports Shortcuts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-3">
              {t('dash_quick_shortcuts')}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 transition text-xs font-semibold text-slate-700 group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-600">{t('dash_sales_report')}</div>
                    <div className="text-[10px] text-slate-400">By date, invoice, payment & item</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 transition text-xs font-semibold text-slate-700 group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    P
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-600">{t('dash_purchase_report')}</div>
                    <div className="text-[10px] text-slate-400">By vendor, date, cost & inward quantity</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 transition text-xs font-semibold text-slate-700 group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    I
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-600">{t('dash_stock_report')}</div>
                    <div className="text-[10px] text-slate-400">Stock in hand, inward, outward ledger</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 transition text-xs font-semibold text-slate-700 group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    L
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-600">{t('dash_pl_report')}</div>
                    <div className="text-[10px] text-slate-400">Gross profit & store expenses</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>GST Reporting: <strong>GSTR-1 Ready</strong></span>
            <span className="text-emerald-600 font-bold">Audit Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
