import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Layers, Award, Scale } from 'lucide-react';

interface InlineCreateProps {
  type: 'category' | 'brand' | 'unit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newId: string) => void;
}

export const InlineCreateModal: React.FC<InlineCreateProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addCategory, addBrand, addUnit } = useApp();

  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [qtyType, setQtyType] = useState<'integer' | 'decimal'>('integer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === 'category') {
      const created = addCategory(name, tamilName);
      onSuccess(created.id);
    } else if (type === 'brand') {
      const created = addBrand(name);
      onSuccess(created.id);
    } else if (type === 'unit') {
      const created = addUnit(name, unitCode || name, qtyType);
      onSuccess(created.id);
    }

    setName('');
    setTamilName('');
    setUnitCode('');
    onClose();
  };

  const titles = {
    category: 'Create New Category (புதிய பிரிவு)',
    brand: 'Create New Brand (புதிய பிராண்ட்)',
    unit: 'Create New Unit (புதிய அலகு)',
  };

  const icons = {
    category: <Layers className="w-5 h-5 text-blue-600" />,
    brand: <Award className="w-5 h-5 text-purple-600" />,
    unit: <Scale className="w-5 h-5 text-emerald-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            {icons[type]}
            <h3 className="text-sm font-bold text-slate-800">{titles[type]}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'category' ? 'Category Name (English)' : type === 'brand' ? 'Brand Name' : 'Unit Full Name (e.g. Bundle)'} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'category' ? 'e.g. Dry Fruits' : type === 'brand' ? 'e.g. Cadbury' : 'e.g. Bundle'}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {type === 'category' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name in Tamil (பிரிவு பெயர்)
              </label>
              <input
                type="text"
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder="எ.கா: உலர் பழங்கள்"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
              />
            </div>
          )}

          {type === 'unit' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Short Code (e.g. BDL) *
                </label>
                <input
                  type="text"
                  required
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                  placeholder="BDL"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Measurement Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="qtyType"
                      checked={qtyType === 'integer'}
                      onChange={() => setQtyType('integer')}
                      className="text-blue-600"
                    />
                    <span>Integer (Whole numbers like 1, 2)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="qtyType"
                      checked={qtyType === 'decimal'}
                      onChange={() => setQtyType('decimal')}
                      className="text-blue-600"
                    />
                    <span>Decimal (Weights like 0.250)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save & Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
