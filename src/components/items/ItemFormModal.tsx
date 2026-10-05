import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Item, ItemBatch } from '../../types';
import { InlineCreateModal } from './InlineCreateModals';
import { 
  X, 
  Barcode, 
  Scan, 
  AlertTriangle, 
  Plus, 
  Check, 
  Tag, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';

export const ItemFormModal: React.FC = () => {
  const { 
    itemModalState, 
    closeItemModal, 
    addItem, 
    updateItem, 
    items, 
    categories, 
    brands, 
    units, 
    t, 
    showToast,
    setSelectedItemForDetail
  } = useApp();

  const { isOpen, mode, item, initialBarcode } = itemModalState;

  // Form states
  const [tamilName, setTamilName] = useState('');
  const [shortName, setShortName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unitId, setUnitId] = useState('u_pcs');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [salesPrice, setSalesPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [openingStock, setOpeningStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(10);
  const [isTaxable, setIsTaxable] = useState(false);
  const [gstRate, setGstRate] = useState<number>(5);
  const [hsnCode, setHSNCode] = useState('');
  
  // Batch Tracking
  const [batchEnabled, setBatchEnabled] = useState(false);
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Barcode conflict state
  const [barcodeWarningItem, setBarcodeWarningItem] = useState<Item | null>(null);

  // Inline creation modals
  const [inlineModal, setInlineModal] = useState<'category' | 'brand' | 'unit' | null>(null);

  // Populate form if editing or prefilled
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && item) {
        setTamilName(item.tamil_name || '');
        setShortName(item.short_name || '');
        setCategoryId(item.category_id || (categories[0]?.id || ''));
        setBrandId(item.brand_id || '');
        setUnitId(item.unit_id || 'u_pcs');
        setBarcode(item.barcode || '');
        setPurchasePrice(item.purchase_price || 0);
        setSalesPrice(item.sales_price || 0);
        setMrp(item.mrp || 0);
        setOpeningStock(item.opening_stock || 0);
        setMinStock(item.min_stock || 5);
        setIsTaxable((item.gst_rate || 0) > 0);
        setGstRate(item.gst_rate || 0);
        setHSNCode(item.hsn_code || '');
        setBatchEnabled(item.batch_enabled || false);
        if (item.batches && item.batches.length > 0) {
          const firstB = item.batches[0];
          setBatchNo(firstB.batch_no || '');
          setMfgDate(firstB.manufacturing_date || '');
          setExpiryDate(firstB.expiry_date || '');
        } else {
          setBatchNo('');
          setMfgDate('');
          setExpiryDate('');
        }
      } else {
        // Create new item
        setTamilName('');
        setShortName('');
        setCategoryId(categories[0]?.id || '');
        setBrandId(brands[0]?.id || '');
        setUnitId('u_pcs');
        setBarcode(initialBarcode || '');
        setPurchasePrice('');
        setSalesPrice('');
        setMrp('');
        setOpeningStock(10);
        setMinStock(5);
        setIsTaxable(false);
        setGstRate(0);
        setHSNCode('');
        setBatchEnabled(false);
        setBatchNo('');
        setMfgDate('');
        setExpiryDate('');
      }
      setBarcodeWarningItem(null);
    }
  }, [isOpen, mode, item, initialBarcode, categories, brands]);

  // Barcode duplicate validation
  useEffect(() => {
    const trimmed = barcode.trim();
    if (!trimmed) {
      setBarcodeWarningItem(null);
      return;
    }

    const existing = items.find((i) => i.barcode === trimmed && (mode !== 'edit' || i.id !== item?.id));
    if (existing) {
      setBarcodeWarningItem(existing);
    } else {
      setBarcodeWarningItem(null);
    }
  }, [barcode, items, mode, item]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    // Generate an authentic EAN-13 style demo barcode
    const randomBarcode = `890103${Math.floor(100000 + Math.random() * 900000)}`;
    setBarcode(randomBarcode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shortName.trim() || !tamilName.trim()) {
      showToast('Please enter both English and Tamil names', 'warning');
      return;
    }

    const pPrice = Number(purchasePrice) || 0;
    const sPrice = Number(salesPrice) || 0;
    const mPrice = Number(mrp) || sPrice;

    if (sPrice < pPrice) {
      showToast('Notice: Sales price is lower than purchase cost.', 'warning');
    }

    const batches: ItemBatch[] = [];
    if (batchEnabled && batchNo.trim()) {
      batches.push({
        id: `batch_${Date.now()}`,
        item_id: item?.id || '',
        batch_no: batchNo.trim(),
        manufacturing_date: mfgDate,
        expiry_date: expiryDate,
        quantity: Number(openingStock) || 0,
        purchase_price: pPrice,
      });
    }

    const itemPayload = {
      tamil_name: tamilName.trim(),
      short_name: shortName.trim(),
      category_id: categoryId || categories[0]?.id || 'cat_grains',
      brand_id: brandId || undefined,
      unit_id: unitId || 'u_pcs',
      barcode: barcode.trim() || undefined,
      purchase_price: pPrice,
      sales_price: sPrice,
      mrp: mPrice,
      opening_stock: Number(openingStock) || 0,
      min_stock: Number(minStock) || 0,
      gst_rate: isTaxable ? gstRate : 0,
      hsn_code: hsnCode.trim() || undefined,
      batch_enabled: batchEnabled,
      batches: batchEnabled ? batches : undefined,
      active: true,
    };

    if (mode === 'edit' && item) {
      updateItem({
        ...item,
        ...itemPayload,
        current_stock: item.current_stock, // Preserve live current stock on edit
      });
    } else {
      addItem(itemPayload);
    }

    closeItemModal();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                {mode === 'edit' ? t('modal_edit_item_title') : t('modal_add_item_title')}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure bilingual labels, unit, unique barcode, pricing and inventory levels
              </p>
            </div>
            <button
              onClick={closeItemModal}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Duplicate Barcode Alert Warning */}
            {barcodeWarningItem && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 block font-bold">
                      {t('duplicate_barcode_warning')}
                    </strong>
                    <span className="text-amber-800">
                      Already assigned to: <strong>{barcodeWarningItem.short_name}</strong> ({barcodeWarningItem.tamil_name})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeItemModal();
                    setSelectedItemForDetail(barcodeWarningItem);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shrink-0"
                >
                  View Existing Item
                </button>
              </div>
            )}

            {/* Section 1: Basic & Dual Language Names */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Product Identification (Bilingual)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('field_tamil_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={tamilName}
                    onChange={(e) => setTamilName(e.target.value)}
                    placeholder="எ.கா: பொன்னி புழுங்கல் அரிசி"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('field_short_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. Ponni Boiled Rice 1kg"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Category, Brand & Unit with Inline Creators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">{t('field_category')} *</label>
                  <button
                    type="button"
                    onClick={() => setInlineModal('category')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    + New
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.tamil_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">{t('field_brand')}</label>
                  <button
                    type="button"
                    onClick={() => setInlineModal('brand')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    + New
                  </button>
                </div>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">None / Generic Local</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Unit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">{t('field_primary_unit')} *</label>
                  <button
                    type="button"
                    onClick={() => setInlineModal('unit')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    + Custom
                  </button>
                </div>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-mono-num font-bold"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.short_code} ({u.name} - {u.quantity_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 3: Barcode Scanning */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t('field_barcode')} (EAN / UPC / Custom)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan with handheld scanner or enter barcode"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                  title="Simulate barcode scanner entry"
                >
                  <Scan className="w-4 h-4 text-blue-600" />
                  <span>Scan</span>
                </button>
              </div>
            </div>

            {/* Section 4: Pricing (Purchase Price, Sales Price, MRP - Explicitly NO basic/self value) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pricing Structure
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('field_purchase_price')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('field_sales_price')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold text-emerald-700 bg-emerald-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('field_mrp')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Inventory Levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('field_opening_stock')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('field_min_stock')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="5"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-semibold"
                />
              </div>
            </div>

            {/* Section 6: Maintain Batch Tracking Toggle */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{t('field_maintain_batch')}</div>
                  <div className="text-[11px] text-slate-500">Record batch numbers and manufacturing / expiry dates</div>
                </div>
                <input
                  type="checkbox"
                  checked={batchEnabled}
                  onChange={(e) => setBatchEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {batchEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('field_batch_no')} *
                    </label>
                    <input
                      type="text"
                      value={batchNo}
                      onChange={(e) => setBatchNo(e.target.value)}
                      placeholder="e.g. BATCH-2026-X"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('field_mfg_date')}
                    </label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('field_expiry_date')}
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Tax & HSN */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{t('field_tax_status')}</div>
                  <div className="text-[11px] text-slate-500">Enable GST rate calculations for billing invoices</div>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxable"
                      checked={!isTaxable}
                      onChange={() => setIsTaxable(false)}
                      className="text-blue-600"
                    />
                    <span>Non-GST (0%)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxable"
                      checked={isTaxable}
                      onChange={() => setIsTaxable(true)}
                      className="text-blue-600"
                    />
                    <span>Taxable GST</span>
                  </label>
                </div>
              </div>

              {isTaxable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('field_gst_rate')}
                    </label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-mono-num font-bold"
                    >
                      <option value={0}>0% GST</option>
                      <option value={5}>5% GST (Essential Groceries/Grains)</option>
                      <option value={12}>12% GST (Processed Foods/Spices)</option>
                      <option value={18}>18% GST (Standard Branded Goods)</option>
                      <option value={28}>28% GST (Luxury Items)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('field_hsn_code')}
                    </label>
                    <input
                      type="text"
                      value={hsnCode}
                      onChange={(e) => setHSNCode(e.target.value)}
                      placeholder="e.g. 1006 or 0702"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeItemModal}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {t('btn_cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition"
              >
                {t('btn_save_item')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline Creation Modals */}
      {inlineModal && (
        <InlineCreateModal
          type={inlineModal}
          isOpen={true}
          onClose={() => setInlineModal(null)}
          onSuccess={(newId) => {
            if (inlineModal === 'category') setCategoryId(newId);
            if (inlineModal === 'brand') setBrandId(newId);
            if (inlineModal === 'unit') setUnitId(newId);
            setInlineModal(null);
          }}
        />
      )}
    </>
  );
};
