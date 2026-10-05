import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Item, SaleLine, Sale } from '../../types';
import { ProfitCheckModal } from './ProfitCheckModal';
import { 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  PauseCircle, 
  Printer, 
  Save, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  Phone, 
  Calendar, 
  PackagePlus, 
  AlertCircle,
  Percent,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const NewBillView: React.FC = () => {
  const { 
    items, 
    units, 
    settings, 
    t, 
    saveSale, 
    holdCurrentBill, 
    openItemModal, 
    setPrintableSale,
    activeHeldBillToResume,
    setActiveHeldBillToResume,
    showToast
  } = useApp();

  // Customer state
  const [customerName, setCustomerName] = useState('Walk-in Customer (சில்லறை)');
  const [customerPhone, setCustomerPhone] = useState('');

  // Cart / Bill Lines
  const [lines, setLines] = useState<SaleLine[]>([]);

  // Search & Barcode input state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Discount & Round-off
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [enableRoundOff, setEnableRoundOff] = useState(settings.enable_round_off);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');

  // Profit Check Modal
  const [isProfitCheckOpen, setIsProfitCheckOpen] = useState(false);

  // Restore held bill if resumed
  useEffect(() => {
    if (activeHeldBillToResume) {
      setCustomerName(activeHeldBillToResume.customer_name);
      setCustomerPhone(activeHeldBillToResume.customer_phone || '');
      setLines(activeHeldBillToResume.lines);
      setDiscountValue(activeHeldBillToResume.discount);
      setPaymentMethod(activeHeldBillToResume.payment_method as any);
      setActiveHeldBillToResume(null);
    }
  }, [activeHeldBillToResume, setActiveHeldBillToResume]);

  // Focus search input on mount and handle POS shortcuts
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        e.preventDefault();
        handleHoldBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lines, customerName]);

  // Filter items for product search dropdown
  const queryTrim = searchQuery.toLowerCase().trim();
  const searchResults = queryTrim
    ? items.filter(
        (i) =>
          i.short_name.toLowerCase().includes(queryTrim) ||
          i.tamil_name.toLowerCase().includes(queryTrim) ||
          (i.barcode && i.barcode.toLowerCase().includes(queryTrim))
      ).slice(0, 8)
    : [];

  // Add Item to Bill
  const handleAddItemToBill = (item: Item, explicitQty?: number) => {
    const unit = units.find((u) => u.id === item.unit_id);
    const isDecimal = unit?.quantity_type === 'decimal';
    const qtyToAdd = explicitQty !== undefined ? explicitQty : 1;

    setLines((prevLines) => {
      const existingIndex = prevLines.findIndex((l) => l.item_id === item.id);
      if (existingIndex > -1) {
        // Increment quantity
        const updated = [...prevLines];
        const currentLine = updated[existingIndex];
        const newQty = isDecimal ? Math.round((currentLine.quantity + qtyToAdd) * 1000) / 1000 : currentLine.quantity + qtyToAdd;
        const lineTax = (newQty * currentLine.unit_price * (currentLine.gst_rate / 100));
        const lineAmount = (newQty * currentLine.unit_price) - currentLine.discount + lineTax;

        updated[existingIndex] = {
          ...currentLine,
          quantity: newQty,
          tax_amount: lineTax,
          amount: lineAmount,
        };
        return updated;
      } else {
        // Add new line
        const lineTax = (qtyToAdd * item.sales_price * (item.gst_rate / 100));
        const lineAmount = (qtyToAdd * item.sales_price) + lineTax;

        const newLine: SaleLine = {
          id: `line_${Date.now()}_${Math.random()}`,
          sale_id: '',
          item_id: item.id,
          item_name_en: item.short_name,
          item_name_ta: item.tamil_name,
          unit: unit?.short_code || 'PCS',
          quantity_type: isDecimal ? 'decimal' : 'integer',
          quantity: qtyToAdd,
          unit_price: item.sales_price,
          cost_price: item.purchase_price,
          discount: 0,
          gst_rate: item.gst_rate,
          tax_amount: lineTax,
          amount: lineAmount,
          batch_no: item.batches?.[0]?.batch_no,
        };
        return [newLine, ...prevLines];
      }
    });

    setSearchQuery('');
    setSearchDropdownOpen(false);
    searchInputRef.current?.focus();
  };

  // Barcode enter submit
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Match exact barcode or top result
      const exactBarcode = items.find((i) => i.barcode === searchQuery.trim());
      if (exactBarcode) {
        handleAddItemToBill(exactBarcode);
      } else if (searchResults.length > 0) {
        handleAddItemToBill(searchResults[0]);
      } else if (searchQuery.trim()) {
        showToast(`Item not found for "${searchQuery}". Use "+ Add Missing Item" to create it.`, 'warning');
      }
    }
  };

  // Update line quantity
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveLine(index);
      return;
    }
    setLines((prev) => {
      const updated = [...prev];
      const line = updated[index];
      const lineTax = (newQty * line.unit_price * (line.gst_rate / 100));
      const lineAmount = (newQty * line.unit_price) - line.discount + lineTax;

      updated[index] = {
        ...line,
        quantity: line.quantity_type === 'decimal' ? Math.round(newQty * 1000) / 1000 : Math.round(newQty),
        tax_amount: lineTax,
        amount: lineAmount,
      };
      return updated;
    });
  };

  // Update line unit price
  const handleUpdatePrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    setLines((prev) => {
      const updated = [...prev];
      const line = updated[index];
      const lineTax = (line.quantity * newPrice * (line.gst_rate / 100));
      const lineAmount = (line.quantity * newPrice) - line.discount + lineTax;

      updated[index] = {
        ...line,
        unit_price: newPrice,
        tax_amount: lineTax,
        amount: lineAmount,
      };
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = lines.reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0);
  const totalCost = lines.reduce((acc, curr) => acc + curr.quantity * curr.cost_price, 0);
  const totalTax = lines.reduce((acc, curr) => acc + curr.tax_amount, 0);

  // Discount calculation
  const calculatedDiscount = 
    discountType === 'percent' 
      ? (subtotal * (discountValue / 100)) 
      : Math.min(subtotal, discountValue);

  const preRoundTotal = Math.max(0, subtotal - calculatedDiscount + totalTax);

  let roundOffAmount = 0;
  let finalPayable = preRoundTotal;

  if (enableRoundOff) {
    finalPayable = Math.round(preRoundTotal);
    roundOffAmount = Math.round((finalPayable - preRoundTotal) * 100) / 100;
  }

  // Balance calculation
  const numericReceived = receivedAmount === '' ? finalPayable : Number(receivedAmount);
  const rawBalance = numericReceived - finalPayable;
  const changeDue = Math.max(0, rawBalance);

  // Profit estimation for profit check tool
  const grossProfit = Math.max(0, subtotal - calculatedDiscount) - totalCost;

  // Save Sale Handler
  const handleSaveSale = (andPrint: boolean = false) => {
    if (lines.length === 0) {
      showToast('Please add items to the bill first', 'warning');
      return;
    }

    const salePayload = {
      customer_id: 'cust_walkin',
      customer_name: customerName.trim() || 'Walk-in Customer (சில்லறை)',
      customer_phone: customerPhone.trim() || undefined,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      subtotal,
      discount: calculatedDiscount,
      tax: totalTax,
      round_off: roundOffAmount,
      total: finalPayable,
      total_cost: totalCost,
      gross_profit: grossProfit,
      payment_method: paymentMethod,
      received: numericReceived,
      balance: changeDue,
      status: 'Completed' as const,
      lines,
    };

    const saved = saveSale(salePayload);

    // Reset bill state for next customer
    setLines([]);
    setCustomerName('Walk-in Customer (சில்லறை)');
    setCustomerPhone('');
    setDiscountValue(0);
    setReceivedAmount('');
    searchInputRef.current?.focus();

    if (andPrint) {
      setPrintableSale(saved);
    }
  };

  // Hold Bill Handler (PRD 8.4.3)
  const handleHoldBill = () => {
    if (lines.length === 0) {
      showToast('Cannot hold an empty bill', 'warning');
      return;
    }

    holdCurrentBill({
      customer_id: 'cust_held',
      customer_name: customerName.trim() || 'Walk-in Customer (சில்லறை)',
      customer_phone: customerPhone.trim() || undefined,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      subtotal,
      discount: calculatedDiscount,
      tax: totalTax,
      round_off: roundOffAmount,
      total: finalPayable,
      total_cost: totalCost,
      gross_profit: grossProfit,
      payment_method: paymentMethod,
      received: 0,
      balance: 0,
      status: 'Held',
      lines,
    });

    setLines([]);
    setCustomerName('Walk-in Customer (சில்லறை)');
    setCustomerPhone('');
    setDiscountValue(0);
    setReceivedAmount('');
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Top POS Information Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-800">{t('invoice_number')}:</span>
            <span className="font-mono-num font-bold text-xs bg-slate-100 text-blue-700 px-2 py-0.5 rounded border border-slate-200">
              {settings.invoice_prefix}{String(settings.next_invoice_number).padStart(4, '0')}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Customer Info Inline */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('select_or_add_customer')}
              className="pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 w-44 font-semibold text-slate-800"
            />
          </div>

          <div className="relative hidden md:block">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Mobile #"
              className="pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 w-32 font-mono-num"
            />
          </div>
        </div>
      </div>

      {/* Main Billing Grid: Left Items Entry & Cart Table | Right Payment & Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column (8 cols): Product Search & Dense Items Cart */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          {/* Fast Product Entry Bar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 relative shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={t('product_search_pos')}
                className="w-full pl-9 pr-14 py-2 bg-white text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold placeholder:text-slate-400 shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Scan/F2
              </span>
            </div>

            {/* Shortcut: Add Missing Item without abandoning bill (PRD requirement) */}
            <button
              onClick={() => openItemModal('create')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
              title="Add a new item to system catalog without clearing bill"
            >
              <PackagePlus className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">{t('btn_shortcut_new_item')}</span>
            </button>

            {/* Search Dropdown Results */}
            {searchDropdownOpen && searchQuery.trim() && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl border border-slate-300 shadow-2xl z-40 max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No items match "{searchQuery}". Click "+ Add Missing Item" to register it immediately.
                  </div>
                ) : (
                  searchResults.map((item) => {
                    const unit = units.find((u) => u.id === item.unit_id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddItemToBill(item)}
                        className="w-full text-left p-2.5 hover:bg-blue-50/70 flex items-center justify-between transition text-xs group"
                      >
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-blue-600">
                            {item.short_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.tamil_name} {item.barcode ? `• Barcode: ${item.barcode}` : ''}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono-num font-black text-emerald-700 text-sm">
                            ₹{item.sales_price.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Stock: {item.current_stock} {unit?.short_code}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product (English / தமிழ்)</th>
                  <th className="py-2.5 px-2 text-center">{t('col_qty')}</th>
                  <th className="py-2.5 px-2 text-center">{t('col_unit')}</th>
                  <th className="py-2.5 px-2 text-right">{t('col_price')}</th>
                  <th className="py-2.5 px-2 text-right">{t('col_tax')}</th>
                  <th className="py-2.5 px-3 text-right">{t('col_total')}</th>
                  <th className="py-2.5 px-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Barcode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <div className="font-bold text-slate-600 text-sm">Bill is Empty</div>
                      <p className="text-xs text-slate-400 mt-1">
                        Scan item barcode or search above to add items to cart.
                      </p>
                    </td>
                  </tr>
                ) : (
                  lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3 font-mono-num text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Product Name */}
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {line.item_name_en}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {line.item_name_ta} {line.batch_no ? `• Batch: ${line.batch_no}` : ''}
                        </div>
                      </td>

                      {/* Quantity Controls (with Decimal Support for KG/L) */}
                      <td className="py-2 px-2 text-center">
                        <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, line.quantity - (line.quantity_type === 'decimal' ? 0.25 : 1))}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            step={line.quantity_type === 'decimal' ? '0.01' : '1'}
                            min="0.01"
                            value={line.quantity}
                            onChange={(e) => handleUpdateQty(idx, parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-xs font-mono-num font-bold text-slate-900 border-none outline-none p-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, line.quantity + (line.quantity_type === 'decimal' ? 0.25 : 1))}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-2 px-2 text-center font-mono-num font-semibold text-slate-600">
                        {line.unit}
                      </td>

                      {/* Unit Price */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => handleUpdatePrice(idx, parseFloat(e.target.value) || 0)}
                          className="w-16 text-right text-xs font-mono-num font-semibold text-slate-800 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-0.5"
                        />
                      </td>

                      {/* Tax */}
                      <td className="py-2 px-2 text-right text-[11px] font-mono-num text-slate-500">
                        {line.gst_rate > 0 ? (
                          <span>₹{line.tax_amount.toFixed(1)} <span className="text-[10px]">({line.gst_rate}%)</span></span>
                        ) : (
                          <span className="text-slate-400">0%</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-2 px-3 text-right font-mono-num font-extrabold text-slate-900 text-xs">
                        ₹{line.amount.toFixed(2)}
                      </td>

                      {/* Remove Line */}
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Remove item"
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

          {/* Cart Bottom Summary Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <div className="flex items-center gap-4">
              <span>Total Items: <strong className="text-slate-800 font-mono-num">{lines.length}</strong></span>
              <span>Total Quantity: <strong className="text-slate-800 font-mono-num">{lines.reduce((a, c) => a + c.quantity, 0).toFixed(2)}</strong></span>
            </div>

            {/* Profit Check Trigger (PRD Section 8.4.2 requirement) */}
            <button
              onClick={() => setIsProfitCheckOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-xs border border-purple-200 transition cursor-pointer"
              title="Check Gross Margin and Discount Impact before saving bill"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('btn_profit_check')}</span>
              <span className="text-[10px] bg-purple-200 px-1 py-0.2 rounded font-mono-num">
                {lines.length > 0 ? `+₹${grossProfit.toFixed(0)}` : '₹0'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Payment, Discounts, Checkout & Print Actions */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Payment & Checkout Summary
            </div>

            {/* Pricing Totals Box */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>{t('subtotal')}:</span>
                <span className="font-mono-num font-bold text-slate-800">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Bill Discount Input */}
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1">
                  <span>{t('bill_discount')}:</span>
                  <button
                    onClick={() => setDiscountType(discountType === 'flat' ? 'percent' : 'flat')}
                    className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.2 rounded"
                  >
                    {discountType === 'flat' ? '₹ Flat' : '% Pct'}
                  </button>
                </span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 text-right text-xs font-mono-num font-bold border border-slate-300 rounded outline-none focus:border-blue-500 text-rose-600"
                  />
                </div>
              </div>

              {/* GST Total */}
              <div className="flex justify-between items-center text-slate-600">
                <span>{t('tax_amount')}:</span>
                <span className="font-mono-num font-bold text-slate-800">
                  +₹{totalTax.toFixed(2)}
                </span>
              </div>

              {/* Round-off Toggle */}
              <div className="flex justify-between items-center text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRoundOff}
                    onChange={(e) => setEnableRoundOff(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span>{t('round_off')}:</span>
                </label>
                <span className="font-mono-num text-[11px] text-slate-500">
                  {roundOffAmount >= 0 ? `+₹${roundOffAmount.toFixed(2)}` : `-₹${Math.abs(roundOffAmount).toFixed(2)}`}
                </span>
              </div>

              {/* Grand Total Big Display */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                    {t('grand_total')}
                  </span>
                  <span className="text-2xl font-black font-mono-num">
                    ₹{finalPayable.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-blue-100">
                  {lines.length} items
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                {t('payment_method')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t('pay_cash')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t('pay_upi')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMethod === 'Card'
                      ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('pay_card')}</span>
                </button>
              </div>
            </div>

            {/* Cash Tendered & Change Balance */}
            {paymentMethod === 'Cash' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {t('received_amount')}
                    </label>
                    {receivedAmount !== '' && (
                      <button
                        type="button"
                        onClick={() => setReceivedAmount('')}
                        className="text-[10px] text-blue-600 font-semibold hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder={finalPayable.toString()}
                    className="w-full px-2 py-1.5 text-xs font-mono-num font-bold text-slate-900 border border-slate-300 rounded outline-none focus:border-blue-500 bg-white"
                  />
                  {/* Quick currency presets */}
                  <div className="flex items-center gap-1 mt-1.5 overflow-x-auto">
                    {[
                      finalPayable,
                      finalPayable <= 50 ? 50 : finalPayable <= 100 ? 100 : finalPayable <= 200 ? 200 : finalPayable <= 500 ? 500 : 1000,
                      Math.ceil(finalPayable / 100) * 100 > finalPayable ? Math.ceil(finalPayable / 100) * 100 : undefined,
                      500 > finalPayable ? 500 : undefined
                    ]
                      .filter((v, i, a): v is number => typeof v === 'number' && v > 0 && a.indexOf(v) === i)
                      .slice(0, 3)
                      .map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReceivedAmount(val)}
                          className={`text-[10px] font-mono-num px-1.5 py-0.5 rounded border transition ${
                            Number(receivedAmount) === val
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 mb-1 tracking-wide uppercase flex items-center justify-between">
                    <span>{t('change_balance')}</span>
                    {receivedAmount !== '' && rawBalance > 0 && (
                      <span className="text-[9px] font-sans font-bold text-emerald-700 bg-emerald-100/90 px-1 py-0.2 rounded normal-case">
                        To Return
                      </span>
                    )}
                  </label>
                  <div
                    className={`px-2.5 py-1.5 text-xs font-mono-num font-black rounded-lg border transition-all flex items-center justify-between shadow-2xs ${
                      receivedAmount !== '' && rawBalance > 0
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                        : receivedAmount !== '' && rawBalance < 0
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-white text-emerald-700 border-slate-200'
                    }`}
                  >
                    <span>
                      {rawBalance < 0 ? `-₹${Math.abs(rawBalance).toFixed(2)}` : `₹${changeDue.toFixed(2)}`}
                    </span>
                    {receivedAmount !== '' && rawBalance > 0 && (
                      <span className="text-[10px] font-sans font-bold text-emerald-700">
                        Return
                      </span>
                    )}
                    {receivedAmount !== '' && rawBalance < 0 && (
                      <span className="text-[10px] font-sans font-bold text-rose-600">
                        Due
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary POS Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-200 mt-4">
            {/* Save & Print (Top Action) */}
            <button
              onClick={() => handleSaveSale(true)}
              disabled={lines.length === 0}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btn_save_print')}</span>
            </button>

            {/* Save Bill Only */}
            <button
              onClick={() => handleSaveSale(false)}
              disabled={lines.length === 0}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('btn_save_bill')}</span>
            </button>

            {/* Hold Bill Button */}
            <button
              onClick={handleHoldBill}
              disabled={lines.length === 0}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <PauseCircle className="w-4 h-4 text-amber-600" />
              <span>{t('btn_hold_bill')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profit Check Non-blocking Modal */}
      <ProfitCheckModal
        isOpen={isProfitCheckOpen}
        onClose={() => setIsProfitCheckOpen(false)}
        subtotal={subtotal}
        totalCost={totalCost}
        discount={calculatedDiscount}
        tax={totalTax}
        total={finalPayable}
      />
    </div>
  );
};
