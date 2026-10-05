import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Item, Category, Brand, Unit, Supplier, Sale, Purchase, StockTransaction, 
  Expense, StoreSettings, UserSession, Language, ActiveTab 
} from '../types';
import { 
  initialItems, initialCategories, initialBrands, initialUnits, 
  initialSuppliers, initialSales, initialPurchases, initialExpenses, 
  initialStockTransactions, initialSettings 
} from '../utils/initialData';
import { translations } from '../utils/translations';

interface ToastState {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ItemModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  item?: Item;
  initialBarcode?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserSession;
  setUser: (user: UserSession) => void;
  items: Item[];
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  suppliers: Supplier[];
  sales: Sale[];
  heldBills: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  stockTransactions: StockTransaction[];
  settings: StoreSettings;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  itemModalState: ItemModalState;
  openItemModal: (mode: 'create' | 'edit', item?: Item, initialBarcode?: string) => void;
  closeItemModal: () => void;
  selectedItemForDetail: Item | null;
  setSelectedItemForDetail: (item: Item | null) => void;
  printableSale: Sale | null;
  setPrintableSale: (sale: Sale | null) => void;
  activeHeldBillToResume: Sale | null;
  setActiveHeldBillToResume: (sale: Sale | null) => void;
  quickSearchQuery: string;
  setQuickSearchQuery: (query: string) => void;
  
  // CRUD & Transactions
  addItem: (itemData: Omit<Item, 'id' | 'current_stock'>) => Item;
  updateItem: (item: Item) => void;
  deleteItem: (itemId: string) => void;
  addCategory: (name: string, tamil_name?: string) => Category;
  addBrand: (name: string) => Brand;
  addUnit: (name: string, short_code: string, quantity_type: 'integer' | 'decimal') => Unit;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  saveSale: (saleData: Omit<Sale, 'id' | 'invoice_no'>) => Sale;
  holdCurrentBill: (saleData: Omit<Sale, 'id' | 'invoice_no'>) => Sale;
  resumeHeldBill: (heldSaleId: string) => Sale | null;
  deleteHeldBill: (heldSaleId: string) => void;
  cancelSale: (saleId: string) => void;
  savePurchase: (purchaseData: Omit<Purchase, 'id'>) => Purchase;
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'vyapar_pos_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading localStorage key ${key}:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error setting localStorage key ${key}:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getStored<Language>('lang', 'en'));
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<UserSession>({
    user_id: 'usr_cashier1',
    username: 'biller',
    display_name: 'Murugan Biller 1',
    role: 'Cashier',
    is_logged_in: true,
  });

  const [items, setItems] = useState<Item[]>(() => getStored<Item[]>('items', initialItems));
  const [categories, setCategories] = useState<Category[]>(() => getStored<Category[]>('categories', initialCategories));
  const [brands, setBrands] = useState<Brand[]>(() => getStored<Brand[]>('brands', initialBrands));
  const [units, setUnits] = useState<Unit[]>(() => getStored<Unit[]>('units', initialUnits));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored<Supplier[]>('suppliers', initialSuppliers));
  const [sales, setSales] = useState<Sale[]>(() => getStored<Sale[]>('sales', initialSales));
  const [heldBills, setHeldBills] = useState<Sale[]>(() => getStored<Sale[]>('held_bills', []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => getStored<Purchase[]>('purchases', initialPurchases));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored<Expense[]>('expenses', initialExpenses));
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => 
    getStored<StockTransaction[]>('stock_txs', initialStockTransactions)
  );
  const [settings, setSettings] = useState<StoreSettings>(() => getStored<StoreSettings>('settings', initialSettings));

  const [toast, setToast] = useState<ToastState | null>(null);
  const [itemModalState, setItemModalState] = useState<ItemModalState>({ isOpen: false, mode: 'create' });
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Item | null>(null);
  const [printableSale, setPrintableSale] = useState<Sale | null>(null);
  const [activeHeldBillToResume, setActiveHeldBillToResume] = useState<Sale | null>(null);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // Persist states
  useEffect(() => setStored('lang', language), [language]);
  useEffect(() => setStored('items', items), [items]);
  useEffect(() => setStored('categories', categories), [categories]);
  useEffect(() => setStored('brands', brands), [brands]);
  useEffect(() => setStored('units', units), [units]);
  useEffect(() => setStored('suppliers', suppliers), [suppliers]);
  useEffect(() => setStored('sales', sales), [sales]);
  useEffect(() => setStored('held_bills', heldBills), [heldBills]);
  useEffect(() => setStored('purchases', purchases), [purchases]);
  useEffect(() => setStored('expenses', expenses), [expenses]);
  useEffect(() => setStored('stock_txs', stockTransactions), [stockTransactions]);
  useEffect(() => setStored('settings', settings), [settings]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const openItemModal = (mode: 'create' | 'edit', item?: Item, initialBarcode?: string) => {
    setItemModalState({ isOpen: true, mode, item, initialBarcode });
  };

  const closeItemModal = () => {
    setItemModalState({ isOpen: false, mode: 'create' });
  };

  const addItem = (itemData: Omit<Item, 'id' | 'current_stock'>): Item => {
    const id = `item_${Date.now()}`;
    const newItem: Item = {
      ...itemData,
      id,
      current_stock: itemData.opening_stock || 0,
      active: true,
    };

    setItems((prev) => [newItem, ...prev]);

    // Record initial stock transaction if opening stock > 0
    if (newItem.opening_stock > 0) {
      const tx: StockTransaction = {
        id: `tx_${Date.now()}`,
        item_id: id,
        type: 'OPENING',
        reference_id: 'OPENING-STOCK',
        quantity_delta: newItem.opening_stock,
        unit_cost: newItem.purchase_price,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes: 'Initial opening stock entry',
      };
      setStockTransactions((prev) => [tx, ...prev]);
    }

    showToast(t('success_saved'));
    return newItem;
  };

  const updateItem = (updated: Item) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast(t('success_saved'));
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item deleted successfully', 'info');
  };

  const addCategory = (name: string, tamil_name?: string): Category => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      tamil_name: tamil_name?.trim() || name.trim(),
      active: true,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${name}" created!`);
    return newCat;
  };

  const addBrand = (name: string): Brand => {
    const newBrand: Brand = {
      id: `br_${Date.now()}`,
      name: name.trim(),
      active: true,
    };
    setBrands((prev) => [...prev, newBrand]);
    showToast(`Brand "${name}" created!`);
    return newBrand;
  };

  const addUnit = (name: string, short_code: string, quantity_type: 'integer' | 'decimal'): Unit => {
    const newUnit: Unit = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      short_code: short_code.trim().toUpperCase(),
      quantity_type,
      active: true,
    };
    setUnits((prev) => [...prev, newUnit]);
    showToast(`Unit "${short_code}" added!`);
    return newUnit;
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
    showToast(`Supplier "${newSup.name}" added!`);
    return newSup;
  };

  // Billing: Save Sale and decrement inventory
  const saveSale = (saleData: Omit<Sale, 'id' | 'invoice_no'>): Sale => {
    const invNum = settings.next_invoice_number;
    const invoice_no = `${settings.invoice_prefix}${String(invNum).padStart(4, '0')}`;
    const id = `sale_${Date.now()}`;

    const newSale: Sale = {
      ...saleData,
      id,
      invoice_no,
      status: 'Completed',
    };

    // 1. Decrement inventory stock
    setItems((prevItems) => {
      return prevItems.map((item) => {
        const line = newSale.lines.find((l) => l.item_id === item.id);
        if (line) {
          const updatedStock = Math.max(0, item.current_stock - line.quantity);
          return {
            ...item,
            current_stock: Math.round(updatedStock * 1000) / 1000,
          };
        }
        return item;
      });
    });

    // 2. Record stock transactions
    const newTxs: StockTransaction[] = newSale.lines.map((line, idx) => ({
      id: `tx_${Date.now()}_${idx}`,
      item_id: line.item_id,
      type: 'SALE',
      reference_id: invoice_no,
      quantity_delta: -line.quantity,
      unit_cost: line.cost_price,
      date: newSale.date,
      notes: `POS Bill to ${newSale.customer_name}`,
    }));

    setStockTransactions((prev) => [...newTxs, ...prev]);

    // 3. Save sale
    setSales((prev) => [newSale, ...prev]);

    // 4. Increment invoice number
    setSettings((prev) => ({
      ...prev,
      next_invoice_number: prev.next_invoice_number + 1,
    }));

    showToast(t('bill_saved_success'));
    return newSale;
  };

  // Hold current draft bill
  const holdCurrentBill = (saleData: Omit<Sale, 'id' | 'invoice_no'>): Sale => {
    const heldId = `held_${Date.now()}`;
    const heldSale: Sale = {
      ...saleData,
      id: heldId,
      invoice_no: `HOLD-${heldBills.length + 1}`,
      status: 'Held',
    };
    setHeldBills((prev) => [heldSale, ...prev]);
    showToast('Bill parked/held successfully!', 'info');
    return heldSale;
  };

  const resumeHeldBill = (heldSaleId: string): Sale | null => {
    const found = heldBills.find((b) => b.id === heldSaleId);
    if (found) {
      setHeldBills((prev) => prev.filter((b) => b.id !== heldSaleId));
      setActiveHeldBillToResume(found);
      setActiveTab('billing');
      showToast('Held bill resumed to checkout screen!', 'info');
      return found;
    }
    return null;
  };

  const deleteHeldBill = (heldSaleId: string) => {
    setHeldBills((prev) => prev.filter((b) => b.id !== heldSaleId));
    showToast('Held bill removed', 'info');
  };

  // Cancel sale and restore stock
  const cancelSale = (saleId: string) => {
    const saleToCancel = sales.find((s) => s.id === saleId);
    if (!saleToCancel || saleToCancel.status === 'Cancelled') return;

    // 1. Mark as cancelled
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'Cancelled' } : s))
    );

    // 2. Restore stock
    setItems((prevItems) => {
      return prevItems.map((item) => {
        const line = saleToCancel.lines.find((l) => l.item_id === item.id);
        if (line) {
          return {
            ...item,
            current_stock: Math.round((item.current_stock + line.quantity) * 1000) / 1000,
          };
        }
        return item;
      });
    });

    // 3. Record reversal transaction
    const reversalTxs: StockTransaction[] = saleToCancel.lines.map((line, idx) => ({
      id: `tx_rev_${Date.now()}_${idx}`,
      item_id: line.item_id,
      type: 'RETURN',
      reference_id: `CANCEL-${saleToCancel.invoice_no}`,
      quantity_delta: line.quantity,
      unit_cost: line.cost_price,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Restored stock from cancelled sale ${saleToCancel.invoice_no}`,
    }));

    setStockTransactions((prev) => [...reversalTxs, ...prev]);
    showToast(`Invoice ${saleToCancel.invoice_no} cancelled. Stock restored.`, 'warning');
  };

  // Purchases: Save purchase and increment stock
  const savePurchase = (purchaseData: Omit<Purchase, 'id'>): Purchase => {
    const id = `pur_${Date.now()}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id,
    };

    // 1. Increment item stock and update purchase price if newer
    setItems((prevItems) => {
      return prevItems.map((item) => {
        const line = newPurchase.lines.find((l) => l.item_id === item.id);
        if (line) {
          const updatedStock = item.current_stock + line.quantity;
          const updatedBatches = [...(item.batches || [])];
          if (line.batch_no) {
            updatedBatches.push({
              id: `b_${Date.now()}`,
              item_id: item.id,
              batch_no: line.batch_no,
              manufacturing_date: line.manufacturing_date,
              expiry_date: line.expiry_date,
              quantity: line.quantity,
              purchase_price: line.purchase_price,
            });
          }
          return {
            ...item,
            current_stock: Math.round(updatedStock * 1000) / 1000,
            purchase_price: line.purchase_price || item.purchase_price,
            batches: updatedBatches,
          };
        }
        return item;
      });
    });

    // 2. Record stock transactions
    const txs: StockTransaction[] = newPurchase.lines.map((line, idx) => ({
      id: `tx_pur_${Date.now()}_${idx}`,
      item_id: line.item_id,
      type: 'PURCHASE',
      reference_id: newPurchase.invoice_no,
      quantity_delta: line.quantity,
      unit_cost: line.purchase_price,
      date: newPurchase.date,
      notes: `Stock inward from supplier: ${newPurchase.supplier_name}`,
    }));

    setStockTransactions((prev) => [...txs, ...prev]);

    // 3. Save purchase entry
    setPurchases((prev) => [newPurchase, ...prev]);

    showToast('Purchase saved! Inventory updated.');
    return newPurchase;
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast('Expense recorded successfully!');
    return newExp;
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast(t('success_saved'));
  };

  const resetToSampleData = () => {
    setItems(initialItems);
    setCategories(initialCategories);
    setBrands(initialBrands);
    setUnits(initialUnits);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setHeldBills([]);
    setPurchases(initialPurchases);
    setExpenses(initialExpenses);
    setStockTransactions(initialStockTransactions);
    setSettings(initialSettings);
    showToast('Realistic demo store data reloaded!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        user,
        setUser,
        items,
        categories,
        brands,
        units,
        suppliers,
        sales,
        heldBills,
        purchases,
        expenses,
        stockTransactions,
        settings,
        toast,
        showToast,
        itemModalState,
        openItemModal,
        closeItemModal,
        selectedItemForDetail,
        setSelectedItemForDetail,
        printableSale,
        setPrintableSale,
        activeHeldBillToResume,
        setActiveHeldBillToResume,
        quickSearchQuery,
        setQuickSearchQuery,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        addBrand,
        addUnit,
        addSupplier,
        saveSale,
        holdCurrentBill,
        resumeHeldBill,
        deleteHeldBill,
        cancelSale,
        savePurchase,
        addExpense,
        updateSettings,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
