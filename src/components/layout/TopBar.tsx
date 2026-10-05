import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Plus, 
  ShoppingCart, 
  Truck, 
  PackagePlus, 
  Languages, 
  Store,
  X,
  ArrowRight
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    settings, 
    language, 
    setLanguage, 
    t, 
    setActiveTab, 
    openItemModal,
    items,
    sales,
    suppliers,
    setSelectedItemForDetail,
    setPrintableSale
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts (Alt+S for search, F2 for billing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Filter items, bills, suppliers for global search dropdown
  const queryLower = searchQuery.toLowerCase().trim();
  const matchedItems = queryLower
    ? items.filter(
        (i) =>
          i.short_name.toLowerCase().includes(queryLower) ||
          i.tamil_name.toLowerCase().includes(queryLower) ||
          (i.barcode && i.barcode.toLowerCase().includes(queryLower))
      ).slice(0, 5)
    : [];

  const matchedSales = queryLower
    ? sales.filter(
        (s) =>
          s.invoice_no.toLowerCase().includes(queryLower) ||
          s.customer_name.toLowerCase().includes(queryLower)
      ).slice(0, 3)
    : [];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
      {/* Store Identity */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">
              {language === 'ta' ? settings.store_name_ta : settings.store_name}
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              GST: {settings.gstin}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'ta' ? settings.store_name : settings.store_name_ta} • {settings.tagline}
          </span>
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('quick_search_placeholder')}
            className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded font-mono font-semibold">
                Alt+S
              </span>
            )}
          </div>
        </div>

        {/* Global Search Results Dropdown */}
        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {/* Products */}
            {matchedItems.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Products ({matchedItems.length})
                </div>
                {matchedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItemForDetail(item);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600">
                        {item.short_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.tamil_name} • Barcode: {item.barcode || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-num font-bold text-emerald-600">₹{item.sales_price}</div>
                      <div className="text-[10px] text-slate-400">Stock: {item.current_stock}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Invoices */}
            {matchedSales.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Invoices ({matchedSales.length})
                </div>
                {matchedSales.map((sale) => (
                  <button
                    key={sale.id}
                    onClick={() => {
                      setPrintableSale(sale);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 font-mono-num group-hover:text-blue-600">
                        {sale.invoice_no}
                      </div>
                      <div className="text-[11px] text-slate-500">{sale.customer_name} • {sale.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-num font-bold text-slate-900">₹{sale.total}</div>
                      <div className="text-[10px] text-blue-600 font-medium">View Receipt →</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {matchedItems.length === 0 && matchedSales.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching items or bills found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons & Controls */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              language === 'en'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              language === 'ta'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Primary Action 1: Add Sale / New Bill (Red/Rose accent like Vyapar POS) */}
        <button
          onClick={() => setActiveTab('billing')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-sm shadow-rose-600/30 transition cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t('btn_new_bill')}</span>
          <span className="text-[10px] bg-rose-700/80 px-1 py-0.2 rounded font-mono font-medium ml-0.5">F2</span>
        </button>

        {/* Primary Action 2: Add Purchase (Blue accent) */}
        <button
          onClick={() => setActiveTab('new_purchase')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{t('btn_new_purchase')}</span>
        </button>

        {/* Primary Action 3: Add Item */}
        <button
          onClick={() => openItemModal('create')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('btn_add_item')}</span>
        </button>
      </div>
    </header>
  );
};
