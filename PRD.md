# Product Requirements Document (PRD)

## Billing & Inventory Management System
**Web Prototype / Desktop-Oriented POS UI**  
**Version:** 1.0 • October 2026  
**Status:** Prototype-ready requirements  

---

## 1. Document Control

| Field | Value |
| :--- | :--- |
| **Product** | Billing & Inventory Management System |
| **Document** | Product Requirements Document (PRD) |
| **Version** | 1.0 |
| **Platform – Phase 1** | Responsive web application, optimized for desktop/laptop POS use |
| **Future Platforms** | Flutter Android/iOS and Windows desktop |
| **Primary Business** | Grocery, vegetable, fruit, provision and mixed-item retail stores |
| **Primary Languages** | English and Tamil (தமிழ்) |
| **Status** | Prototype-ready requirements |

---

## 2. Product Vision
Build a simple, fast and practical retail billing and inventory system for small and medium stores. The first implementation is a web prototype used to validate information architecture, workflows and UI. The validated design will later guide a Flutter/Windows desktop implementation.

---

## 3. Goals
- **Fast Billing:** Create bills quickly using barcode scanning or product search.
- **Product Management:** Manage products, pricing, stock, units, categories, brands and optional batch/expiry data.
- **Bilingual Support:** Support Tamil and English product naming and search.
- **Inward Stock Tracking:** Track purchases and expenses, updating inventory automatically from purchase entries.
- **Comprehensive Reports:** Show sales, purchase, stock ledger, profit & loss, and GST-related information through reports.
- **Profit Check Tool:** Give the billing operator a small profit-check tool to understand gross margin and discount impact before checkout.
- **Ease of Use:** Keep the interface simple enough for daily shop use with minimal clicks and keyboard shortcuts.

---

## 4. Non-Goals for V1
- Do not reproduce unnecessary promotional/marketing features shown in generic reference software.
- No social/marketing integrations, WhatsApp marketing, Google business tools, or unrelated growth modules.
- No advanced accounting ledger system unless added in a later PRD.
- No multi-warehouse/godown complexity in the initial prototype.
- **No Basic Price or Self Value fields** in the product catalog.

---

## 5. Design Principles
- **Desktop-first POS layout** with a persistent left sidebar (Vyapar-inspired aesthetic).
- **Clean white/light workspace** with compact cards, dense tables and clear primary actions.
- **Fast keyboard/mouse workflow** for billing operators (`Alt+S` for search, `F2` for billing, `F8` to hold bills).
- **Visible primary actions:** New Bill (`+ Add Sale`), Add Item (`+ Add Item`), and Add Purchase (`+ Add Purchase`) remain visible.
- **Confirmations and validation** where incorrect data could affect stock or billing (e.g. duplicate barcode warning).
- **Portable Architecture:** UI and business logic designed to map cleanly to Flutter/Windows implementation.

---

## 6. Information Architecture / Sitemap

```
├── 1. Login / Shift Operator Switcher (AUTH-01)
├── 2. Dashboard (DASH-01)
├── 3. Items
│   ├── Item List (ITEM-01)
│   ├── New Item (ITEM-02)
│   └── Edit Item / Item Details (ITEM-03)
├── 4. Billing / POS
│   ├── New Bill / POS (BILL-01)
│   ├── Hold Bills (BILL-02)
│   └── Bill History (BILL-03)
├── 5. Purchases & Expenses
│   ├── New Purchase (PUR-01)
│   ├── Purchase History (PUR-02)
│   ├── Suppliers (PUR-03)
│   └── Expenses
├── 6. Reports (REP-01)
└── 7. Settings (SET-01)
```

---

## 7. Global Application Layout

| Area | Requirement |
| :--- | :--- |
| **Top bar** | Store name (bilingual: English + Tamil), global search (`Alt+S`), quick action buttons (`+ Add Sale`, `+ Add Purchase`, `+ Add Item`), and language toggle (EN/தமிழ்). |
| **Left sidebar** | Persistent dark/neutral navigation: Dashboard, Items, Billing (POS), Hold Bills (with badge count), Bill History, Purchases & Expenses, Suppliers, Expenses, Reports, Settings. Operator shift switcher at bottom. |
| **Main content** | Page title, filters/search, primary actions, dense cards, data tables, and input forms. |
| **Primary action** | Prominent colored buttons (`+ Add Sale` in rose, `+ Add Purchase` in blue, `+ Add Item` in slate). |
| **Feedback** | Non-blocking toast notifications, inline validations, confirmation dialogs, status chips (In Stock, Low Stock, Out of Stock, Expiring Soon, Expired). |

---

## 8. Module Requirements

### 8.1 Login (AUTH-01)
- Operator shift identification (Cashier vs Store Admin).
- Role toggling without data loss for quick cashier changeover.
- Ready for future multi-user authentication and permissions.

### 8.2 Dashboard (DASH-01)
- **Sales Card:** Today's sales and selectable period summary (Today, This Week, This Month).
- **Purchase Card:** Today's/period purchase amount and inward count.
- **Profit Card:** Estimated gross profit for selected period (Gross Margin = Sales - COGS).
- **Stock Value Card:** Current inventory valuation (Sum of current stock × purchase price).
- **Low Stock Card:** Real-time count of items at or below minimum threshold with 1-click restock purchase trigger.
- **Central Sales Chart:** Daily/weekly billing velocity trend.
- **Recent Transactions:** Combined sales and purchases list with quick receipt preview.
- **Reports Shortcuts:** Direct links to Sales, Purchases, Stock Ledger, and Profit & Loss reports.

### 8.3 Items Module (ITEM-01, ITEM-02, ITEM-03)

#### 8.3.1 Item List (ITEM-01)
- Search by Tamil item name, English short name, barcode, and HSN code.
- Filter by Category, Brand, Stock Status (In Stock, Low Stock, Out of Stock), and Expiry Status (All, Expiring Soon, Expired).
- Dense desktop table displaying: Item Name (Bilingual), Category, Barcode, Unit, Current Stock with status chip, Purchase Price, Sales Price, MRP, and Actions.
- Selecting an item opens its summary and chronological Stock Movement History.
- Primary Action: `+ Add Item`.

#### 8.3.2 New / Edit Item (ITEM-02 / ITEM-03)
- **Basic:** Item Name (Tamil), Short Name (English), Category, Brand, Primary Unit.
- **Category:** Dropdown of existing categories + inline `Create New Category` modal.
- **Brand:** Dropdown of existing brands + inline `Create New Brand` modal.
- **Unit:** Predefined units (`PCS`, `KG`, `G`, `MG`, `L`, `ML`, `BOX`, `PACK`, `PKT`, `BAG`, `BOTTLE`, `CAN`, `TIN`, `DOZEN`, `PAIR`) + inline `Create Custom Unit` modal. Supports quantity types: Integer vs Decimal.
- **Barcode:** Manual entry + barcode scan simulation. **Duplicate barcode behavior:** warn user and offer the existing item instead of silently creating a duplicate.
- **Pricing:** Purchase Price, Sales Price, MRP. *(No Basic Price or Self Value fields).*
- **Stock:** Opening Stock and Minimum Alert Stock.
- **Batch Tracking:** Optional toggle. When enabled: Batch Number, Manufacturing Date, Expiry Date.
- **Tax:** Non-GST / Taxable, GST Rates (0%, 5%, 12%, 18%, 28%) and HSN Code.

### 8.4 Billing / POS (BILL-01, BILL-02, BILL-03)

#### 8.4.1 New Bill (BILL-01)
- **Customer:** Walk-in Customer by default; editable name and mobile number.
- **Invoice Number:** Auto-generated invoice number (`INV-2026-XXXX`) and current date/time.
- **Item Entry:** Search product by Tamil/English name or barcode scanner with instant dropdown showing matching item, sales price, current stock, and unit.
- **Quantities:** Integer defaults for PCS/PACK, decimal quantities for weighted items like KG and L (e.g. `0.5 KG`, `1.250 KG`).
- **Cart Rows:** Item, Quantity (+/- buttons and direct input), Unit, Unit Price, Tax, Total Amount, Remove button.
- **Missing Product Shortcut:** `+ Add Missing Item` button directly on the POS screen without abandoning the active bill.
- **Discounts:** Bill-level discount (Flat ₹ or %) with instant calculation.
- **Tax Calculation:** Automatic GST breakdown (CGST + SGST).
- **Payment Modes:** Cash, UPI (with QR preview simulator), and Card.
- **Tender & Balance:**
  - Input field for Amount Received from customer (e.g. customer gives ₹200 for ₹150 bill).
  - Automatically calculates and displays the exact **"Balance"** amount to return (e.g. ₹50.00 Return) with high-visibility styling and quick currency presets (Exact, ₹100, ₹200, ₹500).
- **Round-off Control:** Optional round-off checkbox (e.g. ₹240.40 -> ₹240.00).
- **Profit Check Tool (8.4.2):** Non-blocking bottom drawer/modal calculating:
  - `Gross Profit = Sales Revenue - Purchase Cost`
  - Current discount impact and margin percentage.
  - Clear disclaimer: Gross profit only; store operating overheads are not included.
- **Actions:** Hold Bill (`F8`), Save Bill (`Ctrl+S`), Save & Print (`Enter`), Share via WhatsApp.
- **Inventory Update:** Automatically decreases item stock and creates stock transaction records upon save.

#### 8.4.2 Hold Bills (BILL-02)
- Temporarily park/hold unfinished bills.
- Lists held bills with customer reference, timestamp, line items, and total.
- Resume held bill directly into active POS checkout, or delete.

#### 8.4.3 Bill History (BILL-03)
- Search and filter invoices by date, invoice number, customer, and payment method.
- View invoice details and print 80mm thermal receipts.
- **Cancel Sale / Stock Reversal:** Cancelling an invoice marks it cancelled and automatically restores the inventory stock.

#### 8.4.4 Thermal Receipt Printing
- 80mm 3-inch POS layout with bilingual store header, address, phone, GSTIN, itemized rows, tax breakdown, round-off, payment mode, tendered amount, Balance, UPI QR code, and greeting message.

### 8.5 Purchases & Expenses (PUR-01, PUR-02, PUR-03)

#### 8.5.1 New Purchase (PUR-01)
- Select existing vendor or create new Supplier inline.
- Supplier invoice number and date.
- Add products, inward quantity, purchase cost price, batch number, and expiry date.
- Subtotal, GST tax, and total purchase value.
- Automatically increments inventory stock and updates item purchase price.

#### 8.5.2 Purchase History (PUR-02)
- Filter by date, supplier, invoice number, and amount.
- View purchased items, batch numbers, and stock impact.

#### 8.5.3 Suppliers (PUR-03)
- Supplier directory with business name, contact phone, address, and GSTIN.
- View total inward purchase amount and past invoices per supplier.

#### 8.5.4 Expenses
- Quick expense entries for shop operating costs: Rent, Electricity, Staff Wages, Tea & Snacks, Transport, Maintenance.

### 8.6 Reports Module (REP-01)

| Report | Purpose |
| :--- | :--- |
| **Sales Report** | Sales revenue by date, invoice, payment method, and gross margins. |
| **Purchase Report** | Inward purchases by date, supplier, items, and cost. |
| **Profit & Loss** | Trading statement showing Gross Revenue, COGS, Gross Profit, Operating Expenses, and Net Operating Profit. |
| **Stock Ledger** | Opening stock, inward purchases, sales, current stock, and total valuation (Cost Basis). |
| **Low Stock Report** | Items at or below minimum threshold with reorder quantity suggestions and estimated costs. |
| **Expiry Audit** | Batch items approaching expiry within 60 days or already expired. |
| **GST Report** | Output Tax (Sales GST), Input Tax Credit (ITC on purchases), and Net GST Liability (GSTR-1 compliant). |

*All reports support instant CSV export and native print views.*

### 8.7 Settings (SET-01)
- **Store Profile:** Store Name (English & Tamil), Tagline, Address, Phone, Email, GSTIN, Receipt Footer Note.
- **Billing Preferences:** Invoice number prefix, default payment method, default round-off behavior.
- **Printer Settings:** 80mm thermal roll vs A4 invoice format.
- **Language Selection:** English vs Tamil UI toggle.
- **Data Management:** Download full database JSON backup, and 1-click reset to realistic sample grocery dataset.

---

## 9. Core Business Rules

1. Every item must have a unique internal item ID.
2. Barcode, when provided, must be unique across the catalog.
3. An item must have a primary unit.
4. Purchase price, sales price, and MRP are separate values.
5. Basic Price and Self Value are explicitly not part of the product model.
6. Minimum stock triggers a Low Stock status when current stock is at or below the configured threshold.
7. Batch fields are required only when Maintain Batch tracking is enabled.
8. Saving a sale reduces available inventory stock.
9. Saving a purchase increases available inventory stock.
10. Deleting/cancelling a stock-affecting transaction must reverse its stock impact.
11. Gross profit for a bill is based on selling value versus purchase cost (`Sales Revenue - Cost of Goods Sold`), not operating expenses.
12. Decimal quantities are allowed for weight/volume units such as `KG`, `G`, and `L`.
13. `PCS`-type quantities default to whole numbers.

---

## 10. High-Level Data Model

### Item
```typescript
{
  id: string;
  tamil_name: string;
  short_name: string;
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
  gst_rate: number;
  hsn_code?: string;
  batch_enabled: boolean;
  batches?: ItemBatch[];
  active: boolean;
}
```

### Sale & SaleLine
```typescript
{
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  round_off: number;
  total: number;
  total_cost: number;
  gross_profit: number;
  payment_method: 'Cash' | 'UPI' | 'Card';
  received: number;
  balance: number;
  status: 'Completed' | 'Held' | 'Cancelled';
  lines: SaleLine[];
}
```

### Purchase & PurchaseLine
```typescript
{
  id: string;
  invoice_no: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'Bank Transfer' | 'Cash' | 'UPI' | 'Credit';
  lines: PurchaseLine[];
}
```

---

## 11. MVP Acceptance Criteria

| Area | Acceptance Criteria |
| :--- | :--- |
| **Navigation** | All seven main pages are accessible from the persistent sidebar with clear active states. |
| **Items** | User can create, search, edit, view and delete items with bilingual names. |
| **Category/Brand/Unit** | User can select existing values or create new ones inline via modal dialogs. |
| **Barcode** | User can manually enter or scan a barcode; duplicate barcodes trigger an existing item warning. |
| **Stock** | Opening stock and minimum threshold are stored and reflected in live status chips. |
| **Billing** | Fast checkout with Tamil/English product search, barcode scanning, decimal quantities, and automatic GST. |
| **Cash Handling** | Customer cash input recalculates Balance return accurately, with quick tender buttons. |
| **Profit Check** | Non-blocking modal displays gross profit and discount impact without impeding checkout. |
| **Hold Bills** | Unfinished bills can be held (`F8`) and resumed to POS. |
| **Purchases** | Inward purchase entries automatically increase inventory stock. |
| **Reports** | 7 core reports (Sales, Purchases, P&L, Stock Ledger, Low Stock, Expiry, GST) with CSV export and print. |
| **Language** | English and Tamil UI option and bilingual search work seamlessly. |

---
*End of PRD v1.0*
