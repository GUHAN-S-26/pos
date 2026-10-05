import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  Receipt, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, purchases, items, expenses, units, settings, t, showToast } = useApp();

  type ReportTab = 'sales' | 'purchases' | 'pl' | 'stock' | 'low_stock' | 'expiry' | 'gst';
  const [activeReport, setActiveReport] = useState<ReportTab>('sales');

  const completedSales = sales.filter((s) => s.status === 'Completed');

  // Calculations for Sales Report
  const totalSalesRevenue = completedSales.reduce((a, c) => a + c.total, 0);
  const totalSalesCost = completedSales.reduce((a, c) => a + c.total_cost, 0);
  const totalGrossProfit = completedSales.reduce((a, c) => a + (c.gross_profit || 0), 0);

  // Calculations for Purchases
  const totalPurchaseValue = purchases.reduce((a, c) => a + c.total, 0);

  // Calculations for Expenses
  const totalExpenses = expenses.reduce((a, c) => a + c.amount, 0);

  // Net Operating Profit
  const netOperatingProfit = totalGrossProfit - totalExpenses;

  // Inventory valuation
  const inventoryValue = items.reduce((a, c) => a + Math.max(0, c.current_stock) * c.purchase_price, 0);

  // Low stock
  const lowStockItems = items.filter((i) => i.current_stock <= i.min_stock);

  // Expiry items
  const now = new Date();
  const expiringBatchList: {
    item_id: string;
    item_name: string;
    batch_no: string;
    qty: number;
    expiry_date: string;
    daysLeft: number;
  }[] = [];

  items.forEach((item) => {
    if (item.batch_enabled && item.batches) {
      item.batches.forEach((b) => {
        if (b.expiry_date) {
          const exp = new Date(b.expiry_date);
          const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 60) {
            expiringBatchList.push({
              item_id: item.id,
              item_name: item.short_name,
              batch_no: b.batch_no,
              qty: b.quantity,
              expiry_date: b.expiry_date,
              daysLeft: diffDays,
            });
          }
        }
      });
    }
  });

  // GST calculations
  const totalSalesTax = completedSales.reduce((a, c) => a + c.tax, 0);
  const totalPurchaseTax = purchases.reduce((a, c) => a + c.tax, 0);
  const netGstPayable = Math.max(0, totalSalesTax - totalPurchaseTax);

  // CSV Export utility
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeReport === 'sales') {
      csvContent += "Invoice,Customer,Date,Payment,Total,GrossProfit\n";
      completedSales.forEach((s) => {
        csvContent += `"${s.invoice_no}","${s.customer_name}","${s.date}","${s.payment_method}",${s.total},${s.gross_profit}\n`;
      });
    } else if (activeReport === 'stock') {
      csvContent += "Item,TamilName,CurrentStock,MinStock,PurchasePrice,SalesPrice,Valuation\n";
      items.forEach((i) => {
        csvContent += `"${i.short_name}","${i.tamil_name}",${i.current_stock},${i.min_stock},${i.purchase_price},${i.sales_price},${i.current_stock * i.purchase_price}\n`;
      });
    } else {
      csvContent += "Metric,Value\n";
      csvContent += `"Total Sales Revenue",${totalSalesRevenue}\n`;
      csvContent += `"Cost of Goods Sold",${totalSalesCost}\n`;
      csvContent += `"Gross Profit",${totalGrossProfit}\n`;
      csvContent += `"Operating Expenses",${totalExpenses}\n`;
      csvContent += `"Net Operating Profit",${netOperatingProfit}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport}_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${activeReport.toUpperCase()} report as CSV!`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>{t('reports_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit sales, stock valuations, gross margins, GST and expiring inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('btn_export_csv')}</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('btn_print_report')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-slate-200/60 p-1 rounded-xl">
        {[
          { id: 'sales', label: t('tab_sales_report') },
          { id: 'purchases', label: t('tab_purchase_report') },
          { id: 'pl', label: t('tab_pl_report') },
          { id: 'stock', label: t('tab_stock_report') },
          { id: 'low_stock', label: `${t('tab_low_stock')} (${lowStockItems.length})` },
          { id: 'expiry', label: `${t('tab_expiry_report')} (${expiringBatchList.length})` },
          { id: 'gst', label: t('tab_gst_report') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              activeReport === tab.id
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report 1: Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
              <div className="text-2xl font-black text-slate-900 font-mono-num mt-1">₹{totalSalesRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500">{completedSales.length} invoices generated</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Cost of Goods Sold (COGS)</span>
              <div className="text-2xl font-black text-slate-700 font-mono-num mt-1">₹{totalSalesCost.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500">Inventory purchase cost</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Profit (Margin)</span>
              <div className="text-2xl font-black text-purple-700 font-mono-num mt-1">₹{totalGrossProfit.toFixed(2)}</div>
              <span className="text-[11px] text-purple-600 font-bold">
                {totalSalesRevenue > 0 ? `${((totalGrossProfit / totalSalesRevenue) * 100).toFixed(1)}% Margin` : '0%'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Items Total</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">GST</th>
                  <th className="py-2.5 px-4 text-right font-black">Net Total</th>
                  <th className="py-2.5 px-4 text-right font-black text-purple-700">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {completedSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-blue-600">{s.invoice_no}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">{s.date}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-sans font-semibold">{s.customer_name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{s.payment_method}</td>
                    <td className="py-2.5 px-3 text-right font-sans">₹{s.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">₹{s.discount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">₹{s.tax.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{s.total.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-purple-700">+₹{s.gross_profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Purchases Report */}
      {activeReport === 'purchases' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Inward Inventory Purchased</span>
              <div className="text-2xl font-black text-slate-900 font-mono-num mt-1">₹{totalPurchaseValue.toFixed(2)}</div>
            </div>
            <div className="text-right text-xs text-slate-500">
              {purchases.length} vendor invoices
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Vendor Inv #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Inward Qty</th>
                  <th className="py-2.5 px-4 text-right font-black">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-blue-600">{p.invoice_no}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">{p.date}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-sans font-semibold">{p.supplier_name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{p.payment_method}</td>
                    <td className="py-2.5 px-3 text-right">{p.lines.reduce((a, c) => a + c.quantity, 0)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Profit & Loss Statement */}
      {activeReport === 'pl' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="border-b border-slate-200 pb-3 text-center">
            <h3 className="text-base font-extrabold text-slate-900">Trading & Profit / Loss Statement</h3>
            <p className="text-xs text-slate-500">Financial Period: Month-to-date Summary</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Sales Revenue */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <span>1. Operating Revenue</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between pl-4 py-1 text-slate-600 border-b border-slate-100">
                <span>Gross Billing Sales:</span>
                <span className="font-mono-num font-bold">₹{totalSalesRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-4 py-1 text-slate-600 border-b border-slate-100">
                <span>Inventory Purchase Cost of Sold Goods:</span>
                <span className="font-mono-num font-bold text-rose-600">-₹{totalSalesCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Gross Profit Bar */}
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center text-sm font-black text-purple-900">
              <span>GROSS PROFIT (Trading Margin):</span>
              <span className="font-mono-num text-base">₹{totalGrossProfit.toFixed(2)}</span>
            </div>

            {/* Operating Overheads */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <span>3. Operating Overheads & Store Expenses</span>
                <span></span>
              </div>
              {expenses.map((exp) => (
                <div key={exp.id} className="flex justify-between pl-4 py-1 text-slate-600 border-b border-slate-100">
                  <span>{exp.category}: {exp.description}</span>
                  <span className="font-mono-num text-rose-600">-₹{exp.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pl-4 py-1 font-bold text-slate-800">
                <span>Total Expenses:</span>
                <span className="font-mono-num text-rose-700">-₹{totalExpenses.toFixed(2)}</span>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex justify-between items-center text-sm font-black text-emerald-950">
              <div>
                <span>ESTIMATED NET OPERATING PROFIT:</span>
                <div className="text-[10px] text-emerald-700 font-normal">Gross Profit minus recorded store expenses</div>
              </div>
              <span className="font-mono-num text-lg font-black text-emerald-800">
                ₹{netOperatingProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Stock Report */}
      {activeReport === 'stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Valuation (Cost Basis)</span>
              <div className="text-2xl font-black text-slate-900 font-mono-num mt-1">₹{inventoryValue.toFixed(2)}</div>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total {items.length} managed SKUs
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Opening</th>
                  <th className="py-2.5 px-3 text-right font-black">Current Stock</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Sales Price</th>
                  <th className="py-2.5 px-4 text-right font-black">Stock Valuation (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {items.map((i) => {
                  const val = i.current_stock * i.purchase_price;
                  const unit = units.find((u) => u.id === i.unit_id);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                        {i.short_name} <span className="text-[11px] font-normal text-slate-500 block">{i.tamil_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{unit?.short_code}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{i.opening_stock}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{i.current_stock}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">₹{i.purchase_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">₹{i.sales_price.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{val.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 5: Low Stock Alert Report */}
      {activeReport === 'low_stock' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Item Name</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-right font-black text-rose-600">Current In Stock</th>
                <th className="py-2.5 px-3 text-right font-bold">Minimum Threshold</th>
                <th className="py-2.5 px-3 text-right">Suggested Restock Qty</th>
                <th className="py-2.5 px-4 text-right">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-num">
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    All store items are stocked above their minimum thresholds.
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => {
                  const unit = units.find((u) => u.id === item.unit_id);
                  const deficit = Math.max(0, item.min_stock * 2 - item.current_stock);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                        {item.short_name}
                        <span className="text-[11px] font-normal text-slate-500 block">{item.tamil_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{unit?.short_code}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600">
                        {item.current_stock}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                        {item.min_stock}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                        +{deficit} {unit?.short_code}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        ₹{(deficit * item.purchase_price).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 6: Expiry Audit Report */}
      {activeReport === 'expiry' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Item Name</th>
                <th className="py-2.5 px-3 font-mono">Batch #</th>
                <th className="py-2.5 px-3 text-center">Batch Quantity</th>
                <th className="py-2.5 px-3 text-center">Expiry Date</th>
                <th className="py-2.5 px-4 text-right">Days Remaining / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-num">
              {expiringBatchList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    No items expiring within the next 60 days.
                  </td>
                </tr>
              ) : (
                expiringBatchList.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-800">{b.item_name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-bold">{b.batch_no}</td>
                    <td className="py-2.5 px-3 text-center">{b.qty}</td>
                    <td className="py-2.5 px-3 text-center">{b.expiry_date}</td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      {b.daysLeft < 0 ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-700">
                          EXPIRED {Math.abs(b.daysLeft)} days ago
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                          Expires in {b.daysLeft} days
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 7: GST Report */}
      {activeReport === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Output Tax (Sales GST)</span>
              <div className="text-2xl font-black text-slate-900 font-mono-num mt-1">₹{totalSalesTax.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500">Collected from customers</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Input Tax Credit (ITC)</span>
              <div className="text-2xl font-black text-slate-700 font-mono-num mt-1">₹{totalPurchaseTax.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500">Paid on vendor purchases</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Net GST Payable</span>
              <div className="text-2xl font-black text-blue-700 font-mono-num mt-1">₹{netGstPayable.toFixed(2)}</div>
              <span className="text-[11px] text-blue-600 font-bold">GSTR-1 Liability</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
