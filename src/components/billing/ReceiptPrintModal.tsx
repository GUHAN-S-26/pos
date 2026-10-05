import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { 
  Printer, 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Store,
  FileText
} from 'lucide-react';

interface ReceiptPrintModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ sale, onClose }) => {
  const { settings, t, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const textSummary = `
🧾 ${settings.store_name} / ${settings.store_name_ta}
Invoice: ${sale.invoice_no} | Date: ${sale.date}
Customer: ${sale.customer_name}
-----------------------------
${sale.lines.map((l) => `${l.item_name_en} x ${l.quantity} = ₹${l.amount.toFixed(2)}`).join('\n')}
-----------------------------
Total Amount: ₹${sale.total.toFixed(2)} (${sale.payment_method})
GSTIN: ${settings.gstin}
${settings.receipt_footer_note}
    `.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    showToast('Receipt text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${settings.store_name}*\nInvoice: ${sale.invoice_no}\nTotal: ₹${sale.total.toFixed(2)}\nThank you for visiting us!`
    );
    const phone = sale.customer_phone ? sale.customer_phone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Tax Invoice & Thermal Receipt Preview
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container (80mm width standard) */}
        <div className="p-6 bg-slate-100 flex justify-center max-h-[70vh] overflow-y-auto">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 font-mono text-slate-900 text-xs select-text leading-tight space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wide">
                {settings.store_name}
              </h2>
              <div className="text-[11px] font-semibold font-sans text-slate-700">
                {settings.store_name_ta}
              </div>
              <div className="text-[10px] text-slate-600 leading-snug">
                {settings.address}
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                Ph: {settings.phone}
              </div>
              <div className="text-[10px] font-bold text-slate-800">
                GSTIN: {settings.gstin}
              </div>
            </div>

            {/* Bill Meta */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Invoice: <strong>{sale.invoice_no}</strong></span>
                <span>Date: {sale.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer: <strong>{sale.customer_name}</strong></span>
                {sale.customer_phone && <span>Ph: {sale.customer_phone}</span>}
              </div>
              <div className="text-[10px] text-slate-500">
                Cashier: Operator 1 • POS-01
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200 pb-1">
                <span className="w-1/2">Item</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/6 text-right">Rate</span>
                <span className="w-1/6 text-right">Amt</span>
              </div>
              {sale.lines.map((line, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span className="w-1/2 truncate font-sans text-[11px]" title={line.item_name_en}>
                      {line.item_name_en}
                    </span>
                    <span className="w-1/6 text-center">
                      {line.quantity}
                    </span>
                    <span className="w-1/6 text-right">
                      {line.unit_price}
                    </span>
                    <span className="w-1/6 text-right font-bold">
                      {line.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] font-sans text-slate-500 pl-1">
                    {line.item_name_ta} {line.gst_rate > 0 ? `(GST ${line.gst_rate}%)` : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Totals */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>CGST:</span>
                    <span>₹{(sale.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>SGST:</span>
                    <span>₹{(sale.tax / 2).toFixed(2)}</span>
                  </div>
                </>
              )}
              {sale.round_off !== 0 && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Round Off:</span>
                  <span>{sale.round_off > 0 ? `+₹${sale.round_off.toFixed(2)}` : `-₹${Math.abs(sale.round_off).toFixed(2)}`}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300">
                <span>TOTAL PAYABLE:</span>
                <span>₹{sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-0.5 text-[10px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{sale.payment_method}</span>
              </div>
              {sale.payment_method === 'Cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>₹{sale.received.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Balance:</span>
                    <span>₹{sale.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* UPI QR Code simulator */}
            <div className="py-2 text-center flex flex-col items-center justify-center space-y-1 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <div className="w-16 h-16 bg-white p-1 rounded border border-slate-300 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-800" />
              </div>
              <span className="text-[9px] font-sans font-semibold text-slate-600">
                Scan UPI QR to Pay / Verify Bill
              </span>
            </div>

            {/* Footer Greeting */}
            <div className="text-center pt-1 font-sans space-y-1">
              <p className="text-[10px] font-bold text-slate-800">
                {settings.receipt_footer_note}
              </p>
              <p className="text-[9px] text-slate-500">
                Computer Generated Tax Invoice. No signature required.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons in Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold transition border border-emerald-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
