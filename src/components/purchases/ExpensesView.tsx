import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Plus, Calendar, Tag, Trash2, TrendingDown } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, t } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<'Rent' | 'Electricity' | 'Staff Salary' | 'Tea & Snacks' | 'Maintenance' | 'Transport' | 'Other'>('Tea & Snacks');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    addExpense({
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      payment_method: paymentMethod,
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-rose-600" />
            <span>{t('expenses_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Log shop overheads, utilities, staff refreshments and maintenance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-xs">
            <span className="text-rose-700 font-medium">Total Expenses: </span>
            <strong className="font-mono-num font-bold text-rose-900 text-sm">
              ₹{totalExpense.toFixed(2)}
            </strong>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_record_expense')}</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-4 text-right font-black">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {exp.payment_method}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-bold text-rose-700 text-xs">
                      -₹{exp.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Record Store Expense</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Tea & Snacks">Tea & Staff Refreshments</option>
                  <option value="Electricity">Electricity / TNEB Power</option>
                  <option value="Rent">Shop Room Rent</option>
                  <option value="Staff Salary">Staff Daily / Weekly Wages</option>
                  <option value="Transport">Delivery / Goods Auto Fare</option>
                  <option value="Maintenance">Shop Cleaning & Repairs</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Memo *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Evening tea for billing staff"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono-num font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Cash">Cash Drawer</option>
                  <option value="UPI">UPI / Google Pay</option>
                  <option value="Bank Transfer">Bank Account</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
