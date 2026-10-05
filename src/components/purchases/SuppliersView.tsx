import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Phone, MapPin, Building2, Plus, ShoppingBag, Search } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, purchases, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSupplier({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstin: gstin.trim(),
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setGstin('');
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>{t('suppliers_title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono-num">
              {suppliers.length} vendors
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage wholesale distributors, millers and farm vendors
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btn_add_supplier')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supplier by name or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => {
          const supPurchases = purchases.filter((p) => p.supplier_id === sup.id);
          const totalSpent = supPurchases.reduce((acc, curr) => acc + curr.total, 0);

          return (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm uppercase">
                    {sup.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">
                      {sup.name}
                    </h3>
                    <div className="text-[11px] font-mono-num text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{sup.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {sup.address && (
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                  )}
                  {sup.gstin && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">GSTIN:</span>
                      <span className="font-mono-num font-bold text-slate-700">{sup.gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Inward</span>
                  <span className="font-mono-num font-bold text-slate-800">
                    ₹{totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Bills</span>
                  <span className="font-mono-num font-bold text-blue-600">
                    {supPurchases.length} invoices
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add New Supplier / Vendor</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Trichy Rice Millers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98421 98765"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="33AAACG1234F1Z8"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
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
