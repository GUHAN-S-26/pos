import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseLine, Item } from '../../types';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Calendar, 
  Building2, 
  Hash, 
  Save, 
  Search, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const NewPurchaseView: React.FC = () => {
  const { 
    suppliers, 
    items, 
    units, 
    savePurchase, 
    addSupplier, 
    setActiveTab, 
    t, 
    showToast 
  } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNo, setInvoiceNo] = useState(`PUR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'UPI' | 'Credit'>('Bank Transfer');
  const [notes, setNotes] = useState('');

  // Purchase line items
  const [lines, setLines] = useState<PurchaseLine[]>([]);

  // Item search to add
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // New Supplier Inline Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupGstin, setNewSupGstin] = useState('');

  // Filter products for inward search
  const filteredProducts = searchItemQuery.trim()
    ? items.filter(
        (i) =>
          i.short_name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
          i.tamil_name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
          (i.barcode && i.barcode.includes(searchItemQuery.trim()))
      ).slice(0, 6)
    : [];

  const handleAddProductToPurchase = (item: Item) => {
    const unit = units.find((u) => u.id === item.unit_id);
    const existingIndex = lines.findIndex((l) => l.item_id === item.id);

    if (existingIndex > -1) {
      setLines((prev) => {
        const updated = [...prev];
        const cur = updated[existingIndex];
        const newQty = cur.quantity + 10;
        const taxAmt = newQty * cur.purchase_price * (cur.gst_rate / 100);
        updated[existingIndex] = {
          ...cur,
          quantity: newQty,
          tax_amount: taxAmt,
          amount: newQty * cur.purchase_price + taxAmt,
        };
        return updated;
      });
    } else {
      const initialQty = 10;
      const taxAmt = initialQty * item.purchase_price * (item.gst_rate / 100);
      const newLine: PurchaseLine = {
        id: `pline_${Date.now()}_${Math.random()}`,
        purchase_id: '',
        item_id: item.id,
        item_name_en: item.short_name,
        item_name_ta: item.tamil_name,
        unit: unit?.short_code || 'PCS',
        quantity: initialQty,
        purchase_price: item.purchase_price,
        gst_rate: item.gst_rate,
        tax_amount: taxAmt,
        amount: initialQty * item.purchase_price + taxAmt,
        batch_no: item.batch_enabled ? `BATCH-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}` : undefined,
      };
      setLines((prev) => [...prev, newLine]);
    }

    setSearchItemQuery('');
    setSearchOpen(false);
  };

  const handleUpdateLine = (index: number, updates: Partial<PurchaseLine>) => {
    setLines((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index], ...updates };
      const taxAmt = cur.quantity * cur.purchase_price * (cur.gst_rate / 100);
      cur.tax_amount = taxAmt;
      cur.amount = cur.quantity * cur.purchase_price + taxAmt;
      updated[index] = cur;
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lines.reduce((acc, curr) => acc + curr.quantity * curr.purchase_price, 0);
  const totalTax = lines.reduce((acc, curr) => acc + curr.tax_amount, 0);
  const grandTotal = subtotal + totalTax;

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      showToast('Please add items to inward purchase bill', 'warning');
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId);

    savePurchase({
      invoice_no: invoiceNo.trim(),
      supplier_id: selectedSupplierId,
      supplier_name: sup?.name || 'Wholesale Vendor',
      date: `${purchaseDate} 10:00`,
      subtotal,
      discount: 0,
      tax: totalTax,
      total: grandTotal,
      payment_method: paymentMethod,
      lines,
      notes,
    });

    setActiveTab('purchases');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const created = addSupplier({
      name: newSupName.trim(),
      phone: newSupPhone.trim(),
      address: newSupAddress.trim(),
      gstin: newSupGstin.trim(),
    });

    setSelectedSupplierId(created.id);
    setIsSupplierModalOpen(false);
    setNewSupName('');
    setNewSupPhone('');
    setNewSupAddress('');
    setNewSupGstin('');
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>{t('purchase_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Log inward vendor purchases to automatically increment item stocks and update cost prices
          </p>
        </div>

        <button
          onClick={() => setActiveTab('purchases')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          View Inward History
        </button>
      </div>

      <form onSubmit={handleSavePurchase} className="space-y-4">
        {/* Supplier & Invoice Metadata Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Supplier */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">{t('supplier')} *</label>
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  {t('btn_add_supplier')}
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Invoice Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('supplier_inv_no')} *
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. INV-9081"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('supplier_inv_date')} *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payment Type
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Credit">Credit / Payable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Search & Inward Items Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Inward Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchItemQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchItemQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder={t('add_purchase_item')}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold bg-white"
              />
            </div>

            {/* Dropdown */}
            {searchOpen && searchItemQuery.trim() && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl border border-slate-300 shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddProductToPurchase(p)}
                    className="w-full text-left p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{p.short_name}</div>
                      <div className="text-[11px] text-slate-500">{p.tamil_name}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-num font-bold text-slate-700">Cost: ₹{p.purchase_price}</span>
                      <div className="text-[10px] text-slate-400">Current Stock: {p.current_stock}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Inward Qty</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Cost Price (₹)</th>
                  <th className="py-2.5 px-3 text-center">Batch #</th>
                  <th className="py-2.5 px-3 text-center">Expiry Date</th>
                  <th className="py-2.5 px-3 text-right">GST</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No products added to this inward purchase yet. Search above to add items.
                    </td>
                  </tr>
                ) : (
                  lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        <div>{line.item_name_en}</div>
                        <div className="text-[11px] text-slate-500">{line.item_name_ta}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={line.quantity}
                          onChange={(e) => handleUpdateLine(idx, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-center font-mono-num font-bold border border-slate-300 rounded text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono-num text-slate-600 font-bold">
                        {line.unit}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.purchase_price}
                          onChange={(e) => handleUpdateLine(idx, { purchase_price: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 text-right font-mono-num font-bold border border-slate-300 rounded text-xs text-blue-700"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          value={line.batch_no || ''}
                          onChange={(e) => handleUpdateLine(idx, { batch_no: e.target.value })}
                          placeholder="Optional"
                          className="w-28 px-2 py-1 text-center font-mono-num border border-slate-300 rounded text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="date"
                          value={line.expiry_date || ''}
                          onChange={(e) => handleUpdateLine(idx, { expiry_date: e.target.value })}
                          className="w-28 px-1 py-1 text-xs border border-slate-300 rounded"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono-num text-slate-500">
                        ₹{line.tax_amount.toFixed(2)} ({line.gst_rate}%)
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900">
                        ₹{line.amount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Totals & Submit */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Saving this purchase entry will automatically increase available stock for each line item.
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right text-xs">
                <span className="text-slate-500">Total Purchase Value: </span>
                <span className="text-lg font-black font-mono-num text-slate-900 ml-1">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={lines.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('btn_save_purchase')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Add New Supplier / Vendor</h3>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Business Name *</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Coimbatore Agri Mills"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="e.g. 98421 12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Office / Godown Address</label>
                <input
                  type="text"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={newSupGstin}
                  onChange={(e) => setNewSupGstin(e.target.value)}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
