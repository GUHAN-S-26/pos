import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreSettings, Language } from '../../types';
import { 
  Settings, 
  Store, 
  Receipt, 
  Printer, 
  Percent, 
  Database, 
  Languages, 
  Save, 
  RotateCcw,
  Download
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    language, 
    setLanguage, 
    resetToSampleData, 
    t, 
    showToast,
    items,
    sales,
    purchases
  } = useApp();

  const [form, setForm] = useState<StoreSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleBackupDownload = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: form,
      items,
      sales,
      purchases,
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `retail_pos_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    showToast('Database backup downloaded successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>{t('settings_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure store metadata, billing parameters, thermal printer layouts and language preference
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Preference Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Languages className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">UI Language / மொழி தேர்வு</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-sm">English</div>
                <div className="text-[11px] text-slate-500">Default interface language</div>
              </div>
              {language === 'en' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                language === 'ta'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-sm">தமிழ் (Tamil)</div>
                <div className="text-[11px] text-slate-500">முழுமையான தமிழ் இடைமுகம்</div>
              </div>
              {language === 'ta' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
            </button>
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">{t('tab_store_profile')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('store_name_en')} *</label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('store_name_ta')} *</label>
              <input
                type="text"
                required
                value={form.store_name_ta}
                onChange={(e) => setForm({ ...form, store_name_ta: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('store_tagline')}</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('store_gstin')}</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">{t('store_address')} *</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('store_phone')} *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Billing & Printer Settings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">{t('tab_billing_config')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('invoice_prefix')}</label>
              <input
                type="text"
                value={form.invoice_prefix}
                onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('default_payment')}</label>
              <select
                value={form.default_payment_method}
                onChange={(e) => setForm({ ...form, default_payment_method: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="Cash">Cash (ரொக்கம்)</option>
                <option value="UPI">UPI / GPay / QR</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('printer_type_label')}</label>
              <select
                value={form.printer_type}
                onChange={(e) => setForm({ ...form, printer_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="thermal_80mm">3-inch (80mm) Thermal Roll POS</option>
                <option value="a4">Standard A4 Tax Invoice</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">{t('receipt_footer')}</label>
              <input
                type="text"
                value={form.receipt_footer_note}
                onChange={(e) => setForm({ ...form, receipt_footer_note: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-600/30 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('btn_save_settings')}</span>
          </button>
        </div>

        {/* Data & Backup Management */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Database className="w-5 h-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">{t('tab_data_management')}</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-800">Database JSON Export</div>
              <p className="text-slate-500">Download complete catalog, stock transactions and bills as a JSON file.</p>
            </div>

            <button
              type="button"
              onClick={handleBackupDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{t('btn_download_backup')}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-800">Demo Store Dataset Reset</div>
              <p className="text-slate-500">Reload realistic Tamil grocery & provision catalog items with initial stock.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset store database to default Tamil & English sample inventory?')) {
                  resetToSampleData();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('btn_reset_sample')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
