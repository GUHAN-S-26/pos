# Retail POS & Billing Inventory Management System

A high-performance, desktop-oriented retail Point of Sale (POS) and inventory management web application inspired by modern desktop business software (Vyapar-style UI). Built specifically for grocery, provision, supermarket, vegetable, fruit, and mixed-retail stores with bilingual support for **English** and **Tamil (தமிழ்)**.

---

## 🚀 Key Features

### 1. Fast POS Billing Counter
- **Bilingual Product Search:** Instant search matching Tamil item names, English short names, barcodes, and HSN codes.
- **Barcode Scanner Integration:** Works with handheld USB/Bluetooth barcode scanners and includes a barcode simulation tool.
- **Decimal & Integer Quantities:** Supports whole pieces (`PCS`, `PACK`) and decimal quantities for weighted items (`0.5 KG`, `1.250 KG`, `L`).
- **Dynamic Cash Handling & Balance:**
  - Input the amount received from the customer (e.g. customer gives ₹200 for a ₹150 bill).
  - Automatically calculates and highlights the exact **Balance** to return with quick tender shortcut buttons (`Exact`, `₹100`, `₹200`, `₹500`).
- **Missing Item Shortcut:** Add a new item to catalog directly from the billing screen (`+ Add Missing Item`) without losing the active cart.
- **Bill-Level Discounts & Tax:** Flat ₹ or percentage discount, automated GST calculations (CGST/SGST), and round-off control.
- **Profit Check Tool (Biller Quick Audit):** Non-blocking tool calculating `Gross Profit = Sales Revenue - Purchase Cost` and discount impact before saving.
- **Hold Bills (Parked Carts):** Temporarily save unfinished bills (`F8`) and resume them anytime.
- **80mm Thermal Receipt Printing:** Realistic 3-inch POS slip with Tamil/English store details, GSTIN, itemized rows, UPI QR code, print view (`window.print()`), and WhatsApp sharing.

### 2. Items & Inventory Management
- **Bilingual Catalog:** Tamil Item Name (பொருள் பெயர்) and English Short Name.
- **Pricing & Units:** Purchase Price, Sales Price, and MRP *(no Basic Price or Self Value fields)*.
- **Inline Entity Modals:** Create Categories, Brands, or Custom Units on the fly without leaving the product form.
- **Barcode Validation:** Uniqueness check that alerts the user and offers existing item details instead of creating duplicates.
- **Batch & Expiry Tracking:** Optional batch number, manufacturing date, and expiry date.
- **Stock Movement History:** Detailed transaction timeline (sales, inward purchases, opening stock, returns) for every SKU.
- **Status Chips:** Visual badges for *In Stock*, *Low Stock*, *Out of Stock*, *Expiring Soon*, and *Expired*.

### 3. Purchases & Supplier Management
- **Stock Inward:** Log vendor purchases to automatically increment available stock and update cost prices.
- **Supplier Directory:** Manage suppliers with contact numbers, addresses, GSTIN, and purchase history.
- **Purchase History:** Complete record of inward invoices and item quantities.

### 4. Daily Store Expenses
- Fast expense logging for shop overheads (Rent, Electricity, Wages, Tea/Snacks, Transport, Maintenance).

### 5. Business & GST Reports
- **Sales Report:** Filterable by date, invoice, payment method, and gross margins.
- **Purchase Report:** Inward purchases by date, vendor, and items.
- **Trading Profit & Loss:** Gross revenue, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses, and Net Operating Profit.
- **Stock Ledger & Valuation:** Opening stock, inward stock, outward sales, and total stock valuation (cost basis).
- **Low Stock Report:** Threshold alert list with suggested restock quantities.
- **Expiry Audit:** Batches expiring within 60 days or already expired.
- **GST Report:** Output Tax, Input Tax Credit (ITC), and Net GST Liability (GSTR-1 format).
- **Export & Print:** 1-click CSV download and print support for all reports.

### 6. Settings & Data Management
- **Store Profile:** Bilingual store names, address, phone, GSTIN, and custom receipt greetings.
- **Billing Presets:** Invoice numbering prefix, default payment mode, round-off defaults, printer size (80mm vs A4).
- **Bilingual Interface:** Switch between English and தமிழ் (Tamil) across the entire UI.
- **Backup & Reset:** Export full database JSON backup, or restore realistic demo grocery store data.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + S` | Focus global quick search (products, invoices, vendors) |
| `F2` | Open POS Billing Counter |
| `F8` | Hold / Park active bill |
| `Enter` | Save & Print receipt (from billing counter) |
| `Ctrl + S` | Save active bill |

---

## 🛠️ Tech Stack

- **Framework:** React 19 (TypeScript)
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion
- **Fonts:** Plus Jakarta Sans, Noto Sans Tamil, JetBrains Mono
- **Print:** Native `@media print` 80mm thermal receipt and tax invoice layout

---

## 📁 Project Structure

```
├── PRD.md                         # Full Product Requirements Document (PRD v1.0)
├── README.md                      # Project documentation and guide
├── index.html                     # HTML entry point with Tamil Google fonts & print styles
├── package.json                   # Dependencies and npm scripts
├── src/
│   ├── App.tsx                    # Main layout and screen router
│   ├── main.tsx                   # React root entry point
│   ├── index.css                  # Tailwind styles and print CSS
│   ├── types/
│   │   └── index.ts               # Complete TypeScript data model
│   ├── context/
│   │   └── AppContext.tsx         # Central state store with localStorage persistence
│   ├── utils/
│   │   ├── initialData.ts         # Realistic bilingual retail grocery seed data
│   │   └── translations.ts        # English & Tamil dictionaries
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx        # Persistent desktop sidebar navigation
│       │   └── TopBar.tsx         # Store header, global search, and quick action buttons
│       ├── common/
│       │   └── Toast.tsx          # Non-blocking notification banner
│       ├── dashboard/
│       │   └── DashboardView.tsx  # Sales cards, sales trend chart, recent activities
│       ├── items/
│       │   ├── ItemList.tsx       # Dense desktop item list with filters
│       │   ├── ItemFormModal.tsx  # New/Edit item dialog with barcode & batch tracking
│       │   ├── ItemDetailsModal.tsx # Item summary and stock movement history
│       │   └── InlineCreateModals.tsx # Quick category, brand, and unit creators
│       ├── billing/
│       │   ├── NewBillView.tsx    # Fast POS billing with tender & Balance calculation
│       │   ├── ProfitCheckModal.tsx # Non-blocking pre-checkout gross profit audit
│       │   ├── HoldBillsView.tsx  # Parked cart management
│       │   ├── BillHistoryView.tsx # Invoice audit and stock-restoring cancellations
│       │   └── ReceiptPrintModal.tsx # 80mm thermal receipt preview & print
│       ├── purchases/
│       │   ├── NewPurchaseView.tsx # Inward stock entry with auto inventory update
│       │   ├── PurchaseHistoryView.tsx # Inward purchase history
│       │   ├── SuppliersView.tsx  # Vendor directory with GSTIN
│       │   └── ExpensesView.tsx   # Daily store expense tracker
│       ├── reports/
│       │   └── ReportsView.tsx    # 7 financial, inventory, and GST reports with CSV export
│       └── settings/
│           └── SettingsView.tsx   # Store profile, printer, language, and JSON backup
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build

# 4. Run TypeScript checks
npm run lint
```

The application runs on `http://localhost:3000`.

---

## 📄 Documentation
For the complete product specification, workflow diagrams, and data models, refer to [PRD.md](./PRD.md).
