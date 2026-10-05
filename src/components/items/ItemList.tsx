import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Item } from '../../types';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Eye, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Barcode, 
  ArrowUpDown,
  Tag,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const ItemList: React.FC = () => {
  const { 
    items, 
    categories, 
    brands, 
    units, 
    t, 
    openItemModal, 
    setSelectedItemForDetail, 
    deleteItem 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [batchFilter, setBatchFilter] = useState<'all' | 'expiring_soon' | 'expired'>('all');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'stock' | 'sales_price'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtered Items logic matching PRD: Tamil, English, Barcode
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTamil = item.tamil_name.toLowerCase().includes(q);
        const matchEnglish = item.short_name.toLowerCase().includes(q);
        const matchBarcode = item.barcode ? item.barcode.toLowerCase().includes(q) : false;
        const matchHsn = item.hsn_code ? item.hsn_code.toLowerCase().includes(q) : false;
        if (!matchTamil && !matchEnglish && !matchBarcode && !matchHsn) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }

      // 3. Brand filter
      if (selectedBrand !== 'all' && item.brand_id !== selectedBrand) {
        return false;
      }

      // 4. Stock status filter
      if (stockStatusFilter === 'in_stock' && item.current_stock <= item.min_stock) return false;
      if (stockStatusFilter === 'low_stock' && (item.current_stock > item.min_stock || item.current_stock <= 0)) return false;
      if (stockStatusFilter === 'out_of_stock' && item.current_stock > 0) return false;

      // 5. Expiry status
      if (batchFilter !== 'all') {
        if (!item.batch_enabled || !item.batches || item.batches.length === 0) return false;
        const now = new Date();
        const hasMatchingBatch = item.batches.some((b) => {
          if (!b.expiry_date) return false;
          const exp = new Date(b.expiry_date);
          const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (batchFilter === 'expired') return diffDays < 0;
          if (batchFilter === 'expiring_soon') return diffDays >= 0 && diffDays <= 45;
          return true;
        });
        if (!hasMatchingBatch) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.short_name.localeCompare(b.short_name);
      } else if (sortField === 'stock') {
        comparison = a.current_stock - b.current_stock;
      } else if (sortField === 'sales_price') {
        comparison = a.sales_price - b.sales_price;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [items, searchTerm, selectedCategory, selectedBrand, stockStatusFilter, batchFilter, sortField, sortAsc]);

  const toggleSort = (field: 'name' | 'stock' | 'sales_price') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>{t('items_title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono-num">
              {filteredItems.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('items_subtitle')}
          </p>
        </div>

        <button
          onClick={() => openItemModal('create')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btn_add_item')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_item_placeholder')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-medium"
            >
              <option value="all">{t('all_categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.tamil_name})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-medium"
            >
              <option value="all">{t('all_stock_status')}</option>
              <option value="in_stock">{t('in_stock')}</option>
              <option value="low_stock">⚠️ {t('low_stock')} (≤ min)</option>
              <option value="out_of_stock">❌ {t('out_of_stock')} (0)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Quick Filter:
            </span>

            <button
              onClick={() => {
                setStockStatusFilter('low_stock');
                setBatchFilter('all');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                stockStatusFilter === 'low_stock'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Low Stock Alert ({items.filter((i) => i.current_stock <= i.min_stock).length})
            </button>

            <button
              onClick={() => {
                setBatchFilter(batchFilter === 'expiring_soon' ? 'all' : 'expiring_soon');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                batchFilter === 'expiring_soon'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Expiring Batches (within 45 days)
            </button>

            {(selectedCategory !== 'all' || stockStatusFilter !== 'all' || batchFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setStockStatusFilter('all');
                  setBatchFilter('all');
                  setSearchTerm('');
                }}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold underline px-1"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="text-slate-400 text-[11px]">
            Showing <strong className="text-slate-700">{filteredItems.length}</strong> of {items.length} items
          </div>
        </div>
      </div>

      {/* Main Items Data Table (Desktop High-Density) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th 
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('col_item_name')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">{t('col_category')}</th>
                <th className="py-3 px-3">{t('col_barcode')}</th>
                <th className="py-3 px-3">{t('col_unit')}</th>
                <th 
                  onClick={() => toggleSort('stock')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 transition select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('col_current_stock')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">{t('col_purchase_price')}</th>
                <th 
                  onClick={() => toggleSort('sales_price')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 transition select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('col_sales_price')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">{t('col_mrp')}</th>
                <th className="py-3 px-3 text-center">{t('col_status')}</th>
                <th className="py-3 px-4 text-center">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-600">{t('no_items_found')}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search keywords or filter settings.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  const unit = units.find((u) => u.id === item.unit_id);
                  const isLow = item.current_stock <= item.min_stock;
                  const isOut = item.current_stock <= 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Product Name (Bilingual) */}
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => setSelectedItemForDetail(item)}
                          className="cursor-pointer group-hover:text-blue-600"
                        >
                          <div className="font-bold text-slate-800 text-xs">
                            {item.short_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {item.tamil_name}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                          {cat?.name || 'General'}
                        </span>
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-3 font-mono-num font-semibold text-slate-700 whitespace-nowrap">
                        {item.barcode ? (
                          <span className="flex items-center gap-1 text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {item.barcode}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 font-mono-num font-bold text-slate-700 whitespace-nowrap">
                        {unit?.short_code || 'PCS'}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-mono-num font-bold text-xs ${
                            isOut
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.current_stock}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            {unit?.short_code}
                          </span>
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Min: {item.min_stock}
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 text-right font-mono-num text-slate-600 whitespace-nowrap">
                        ₹{item.purchase_price.toFixed(2)}
                      </td>

                      {/* Sales Price */}
                      <td className="py-3 px-3 text-right font-mono-num font-extrabold text-emerald-700 whitespace-nowrap">
                        ₹{item.sales_price.toFixed(2)}
                      </td>

                      {/* MRP */}
                      <td className="py-3 px-3 text-right font-mono-num text-slate-500 whitespace-nowrap">
                        ₹{item.mrp.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            <XCircle className="w-3 h-3" />
                            {t('out_of_stock')}
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            {t('low_stock')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('in_stock')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedItemForDetail(item)}
                            title={t('btn_details')}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openItemModal('edit', item)}
                            title={t('btn_edit')}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.short_name}"?`)) {
                                deleteItem(item.id);
                              }
                            }}
                            title="Delete"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
