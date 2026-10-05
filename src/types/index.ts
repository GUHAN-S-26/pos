export type Language = 'en' | 'ta';

export type UnitCode = 'PCS' | 'KG' | 'G' | 'MG' | 'L' | 'ML' | 'BOX' | 'PACK' | 'PKT' | 'BAG' | 'BOTTLE' | 'CAN' | 'TIN' | 'DOZEN' | 'PAIR' | string;

export interface Unit {
  id: string;
  name: string;
  short_code: string;
  quantity_type: 'integer' | 'decimal'; // KG, L, G allow decimal, PCS allow integer
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  tamil_name?: string;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  active: boolean;
}

export interface ItemBatch {
  id: string;
  item_id: string;
  batch_no: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity: number;
  purchase_price: number;
}

export interface Item {
  id: string;
  tamil_name: string;
  short_name: string; // English
  category_id: string;
  brand_id?: string;
  unit_id: string;
  barcode?: string;
  purchase_price: number;
  sales_price: number;
  mrp: number;
  opening_stock: number;
  current_stock: number;
  min_stock: number;
  tax_group_id?: string; // 'none' | 'gst_0' | 'gst_5' | 'gst_12' | 'gst_18' | 'gst_28'
  gst_rate: number; // 0, 5, 12, 18, 28
  hsn_code?: string;
  batch_enabled: boolean;
  batches?: ItemBatch[];
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
}

export interface SaleLine {
  id: string;
  sale_id: string;
  item_id: string;
  item_name_en: string;
  item_name_ta: string;
  unit: string;
  quantity_type: 'integer' | 'decimal';
  quantity: number;
  unit_price: number;
  cost_price: number; // Purchase price for profit calculation
  discount: number; // Line discount in currency
  gst_rate: number;
  tax_amount: number;
  amount: number; // (qty * unit_price) - discount + tax
  batch_no?: string;
}

export interface Sale {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  date: string;
  subtotal: number;
  discount: number; // Bill-level discount
  tax: number; // Total GST
  round_off: number;
  total: number;
  total_cost: number; // For gross profit
  gross_profit: number; // (total - tax) - total_cost
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Credit';
  received: number;
  balance: number;
  status: 'Completed' | 'Held' | 'Cancelled';
  lines: SaleLine[];
  notes?: string;
}

export interface PurchaseLine {
  id: string;
  purchase_id: string;
  item_id: string;
  item_name_en: string;
  item_name_ta: string;
  unit: string;
  quantity: number;
  purchase_price: number;
  gst_rate: number;
  tax_amount: number;
  amount: number;
  batch_no?: string;
  manufacturing_date?: string;
  expiry_date?: string;
}

export interface Purchase {
  id: string;
  invoice_no: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit';
  lines: PurchaseLine[];
  notes?: string;
}

export interface StockTransaction {
  id: string;
  item_id: string;
  type: 'OPENING' | 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT';
  reference_id: string; // Sale invoice or Purchase invoice
  quantity_delta: number; // +ve for incoming, -ve for outgoing
  unit_cost: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Electricity' | 'Staff Salary' | 'Tea & Snacks' | 'Maintenance' | 'Transport' | 'Other';
  description: string;
  amount: number;
  date: string;
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer';
}

export interface StoreSettings {
  store_name: string;
  store_name_ta: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  invoice_prefix: string;
  next_invoice_number: number;
  default_payment_method: 'Cash' | 'UPI' | 'Card';
  enable_round_off: boolean;
  printer_type: 'thermal_80mm' | 'a4';
  receipt_footer_note: string;
  currency_symbol: string;
}

export interface UserSession {
  user_id: string;
  username: string;
  display_name: string;
  role: 'Admin' | 'Cashier';
  is_logged_in: boolean;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'items' 
  | 'new_item' 
  | 'billing' 
  | 'hold_bills' 
  | 'bill_history' 
  | 'purchases' 
  | 'new_purchase' 
  | 'purchase_history' 
  | 'suppliers' 
  | 'expenses' 
  | 'reports' 
  | 'settings';
