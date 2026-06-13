import { useState, useEffect } from 'react';
import { Product, Customer, Order, Transaction, Language } from './types';
import {
  initialProducts,
  initialCustomers,
  initialOrders,
  initialTransactions,
} from './data';
import { translations } from './i18n';
import Dashboard from './components/Dashboard';
import StockManager from './components/StockManager';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';
import SupabaseSettings from './components/SupabaseSettings';
import TransactionHistory from './components/TransactionHistory';
import {
  LayoutDashboard, ShoppingBag, Users, FileSpreadsheet,
  Settings, Languages, Sun, Moon
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export default function App() {
  // Languange selector state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('sm_language') as Language) || 'fr';
  });
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Dark mode trigger
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('sm_dark_mode');
    return cached === null ? true : cached === 'true';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'orders' | 'customers' | 'settings'>('dashboard');

  // --- STATE ENGINES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- SUPABASE ENGINE ---
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('sm_sb_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('sm_sb_key') || '');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Dynamic Supabase Client Builder
  const getSupabase = () => {
    if (!supabaseUrl || !supabaseKey) return null;
    try {
      return createClient(supabaseUrl, supabaseKey);
    } catch {
      return null;
    }
  };

  // Mappers Product
  const mapProductToDb = (p: Product) => ({
    id: p.id,
    name: p.name,
    purchase_price: p.purchasePrice,
    selling_price: p.sellingPrice,
    unit_type: p.unitType,
    quantity: p.quantity,
    supplier: p.supplier,
    min_stock_alert: p.minStockAlert,
    image: p.image || ''
  });

  const mapProductFromDb = (row: any): Product => ({
    id: row.id,
    name: row.name,
    purchasePrice: Number(row.purchase_price || 0),
    sellingPrice: Number(row.selling_price || 0),
    unitType: row.unit_type || 'unit',
    quantity: Number(row.quantity || 0),
    supplier: row.supplier || 'Anonyme',
    minStockAlert: Number(row.min_stock_alert || 5),
    image: row.image || undefined
  });

  // Mappers Customer
  const mapCustomerToDb = (c: Customer) => ({
    id: c.id,
    name: c.name,
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || ''
  });

  const mapCustomerFromDb = (row: any): Customer => ({
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || ''
  });

  // Mappers Order
  const mapOrderToDb = (o: Order) => ({
    id: o.id,
    order_number: o.orderNumber,
    customer_id: o.customerId,
    customer_name: o.customerName,
    items: o.items,
    total_price: o.totalPrice,
    total_purchase_cost: o.totalPurchaseCost,
    status: o.status,
    payment_status: o.paymentStatus,
    notes: o.notes || '',
    order_date: o.date
  });

  const mapOrderFromDb = (row: any): Order => ({
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    items: Array.isArray(row.items) ? row.items : [],
    totalPrice: Number(row.total_price || 0),
    totalPurchaseCost: Number(row.total_purchase_cost || 0),
    status: row.status,
    paymentStatus: row.payment_status,
    notes: row.notes || '',
    date: row.order_date || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  });

  // Mappers Transaction
  const mapTransactionToDb = (t: Transaction) => ({
    id: t.id,
    date: t.date,
    type: t.type,
    description: t.description,
    amount: t.amount,
    profit: t.profit
  });

  const mapTransactionFromDb = (row: any): Transaction => ({
    id: row.id,
    date: row.date || new Date().toISOString(),
    type: row.type || 'sale',
    description: row.description || '',
    amount: Number(row.amount || 0),
    profit: Number(row.profit || 0)
  });

  // Page title dynamic header hook
  const t = translations[language];
  const isRtl = language === 'ar';

  const loadFromLocalStorage = () => {
    const cachedProducts = localStorage.getItem('sm_products');
    const cachedCustomers = localStorage.getItem('sm_customers');
    const cachedOrders = localStorage.getItem('sm_orders');
    const cachedTransactions = localStorage.getItem('sm_transactions');

    if (cachedProducts) setProducts(JSON.parse(cachedProducts));
    else {
      setProducts(initialProducts);
      localStorage.setItem('sm_products', JSON.stringify(initialProducts));
    }

    if (cachedCustomers) setCustomers(JSON.parse(cachedCustomers));
    else {
      setCustomers(initialCustomers);
      localStorage.setItem('sm_customers', JSON.stringify(initialCustomers));
    }

    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    else {
      setOrders(initialOrders);
      localStorage.setItem('sm_orders', JSON.stringify(initialOrders));
    }

    if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions));
    else {
      setTransactions(initialTransactions);
      localStorage.setItem('sm_transactions', JSON.stringify(initialTransactions));
    }
  };

  // --- PERSISTENCE LOADER HOOKS ---
  useEffect(() => {
    const loadFromSupabase = async () => {
      const sb = getSupabase();
      if (!sb) {
        setIsSupabaseConnected(false);
        loadFromLocalStorage();
        return;
      }

      try {
        setIsSupabaseConnected(true);
        // Fetch products
        const { data: prods, error: pErr } = await sb.from('products').select('*');
        if (prods && !pErr) {
          const mappedProds = prods.map(mapProductFromDb);
          setProducts(mappedProds);
          localStorage.setItem('sm_products', JSON.stringify(mappedProds));
        }

        // Fetch customers
        const { data: custs, error: cErr } = await sb.from('customers').select('*');
        if (custs && !cErr) {
          const mappedCusts = custs.map(mapCustomerFromDb);
          setCustomers(mappedCusts);
          localStorage.setItem('sm_customers', JSON.stringify(mappedCusts));
        }

        // Fetch orders
        const { data: ords, error: oErr } = await sb.from('orders').select('*');
        if (ords && !oErr) {
          const mappedOrds = ords.map(mapOrderFromDb);
          setOrders(mappedOrds);
          localStorage.setItem('sm_orders', JSON.stringify(mappedOrds));
        }

        // Fetch transactions
        const { data: trans, error: tErr } = await sb.from('transactions').select('*');
        if (trans && !tErr) {
          const mappedTrans = trans.map(mapTransactionFromDb);
          setTransactions(mappedTrans);
          localStorage.setItem('sm_transactions', JSON.stringify(mappedTrans));
        }
      } catch {
        loadFromLocalStorage();
      }
    };

    if (supabaseUrl && supabaseKey) {
      loadFromSupabase();
    } else {
      setIsSupabaseConnected(false);
      loadFromLocalStorage();
    }
  }, [supabaseUrl, supabaseKey]);

  // --- SAVEMASTER MIDDLEWARES ---
  const saveProducts = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem('sm_products', JSON.stringify(newProds));
  };

  const saveCustomers = (newCusts: Customer[]) => {
    setCustomers(newCusts);
    localStorage.setItem('sm_customers', JSON.stringify(newCusts));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('sm_orders', JSON.stringify(newOrders));
  };

  const saveTransactions = (newTrans: Transaction[]) => {
    setTransactions(newTrans);
    localStorage.setItem('sm_transactions', JSON.stringify(newTrans));
  };

  // --- STATE HANDLERS ---

  const handleSaveSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem('sm_sb_url', url);
    localStorage.setItem('sm_sb_key', key);
    setSupabaseUrl(url);
    setSupabaseKey(key);
  };

  const handleDisconnectSupabase = () => {
    localStorage.removeItem('sm_sb_url');
    localStorage.removeItem('sm_sb_key');
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsSupabaseConnected(false);
  };

  // 1. Products Actions
  const handleAddProduct = async (p: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...p,
      id: `p-${Date.now()}`,
    };
    saveProducts([...products, newProduct]);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').insert(mapProductToDb(newProduct));
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleUpdateProduct = async (p: Product) => {
    const updated = products.map((item) => (item.id === p.id ? p : item));
    saveProducts(updated);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').update(mapProductToDb(p)).eq('id', p.id);
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    saveProducts(products.filter((p) => p.id !== id));

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  // 2. Customers Actions
  const handleAddCustomer = async (c: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...c,
      id: `c-${Date.now()}`,
    };
    saveCustomers([...customers, newCust]);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('customers').insert(mapCustomerToDb(newCust));
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleUpdateCustomer = async (c: Customer) => {
    const updatedCusts = customers.map((item) => (item.id === c.id ? c : item));
    saveCustomers(updatedCusts);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('customers').update(mapCustomerToDb(c)).eq('id', c.id);
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    saveCustomers(customers.filter((c) => c.id !== id));

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('customers').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  // 3. Orders commercial transaction Engine (Stock reduction + transaction tracker)
  const handleCreateOrder = async (oData: Omit<Order, 'id' | 'orderNumber'>) => {
    // Generate order number CMD-X
    const maxVal = orders.reduce((max, ord) => {
      const num = parseInt(ord.orderNumber.replace('CMD-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 100);
    const orderNumber = `CMD-${maxVal + 1}`;
    const newOrderId = `o-${Date.now()}`;

    const newOrder: Order = {
      ...oData,
      id: newOrderId,
      orderNumber,
    };

    // 1. Deduct Product Quantities from stock
    const updatedProducts = [...products];
    newOrder.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        updatedProducts[pIdx].quantity = Math.max(0, updatedProducts[pIdx].quantity - item.quantity);
      }
    });
    saveProducts(updatedProducts);

    // 2. Create financial Transation log
    const trans: Transaction = {
      id: `t-${Date.now()}`,
      date: newOrder.date,
      type: 'sale',
      description: `Vente Commande ${orderNumber} - ${newOrder.customerName}`,
      amount: newOrder.totalPrice,
      profit: newOrder.totalPrice - newOrder.totalPurchaseCost,
    };

    saveOrders([newOrder, ...orders]);
    saveTransactions([trans, ...transactions]);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').upsert(updatedProducts.map(mapProductToDb));
        await sb.from('orders').insert(mapOrderToDb(newOrder));
        await sb.from('transactions').insert(mapTransactionToDb(trans));
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleUpdateOrder = async (updated: Order) => {
    // 1. Retrieve the original old order
    const oldOrder = orders.find((o) => o.id === updated.id);
    if (!oldOrder) return;

    // 2. Return old quantities back to database stock to balance edits
    let adjustedProducts = [...products];
    oldOrder.items.forEach((item) => {
      const pIdx = adjustedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        adjustedProducts[pIdx].quantity += item.quantity;
      }
    });

    // 3. Deduct new updated quantities from stock
    updated.items.forEach((item) => {
      const pIdx = adjustedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        adjustedProducts[pIdx].quantity = Math.max(0, adjustedProducts[pIdx].quantity - item.quantity);
      }
    });
    saveProducts(adjustedProducts);

    // 4. Update the Order history list
    const updatedOrdersList = orders.map((o) => (o.id === updated.id ? updated : o));
    saveOrders(updatedOrdersList);

    // 5. Update or recreate corresponding Transaction registry description
    const updatedTransactionsList = transactions.map((tr) => {
      if (tr.description.includes(updated.orderNumber)) {
        return {
          ...tr,
          amount: updated.totalPrice,
          profit: updated.totalPrice - updated.totalPurchaseCost,
          description: `Vente Commande ${updated.orderNumber} - ${updated.customerName}`,
        };
      }
      return tr;
    });
    saveTransactions(updatedTransactionsList);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').upsert(adjustedProducts.map(mapProductToDb));
        await sb.from('orders').update(mapOrderToDb(updated)).eq('id', updated.id);
        await sb.from('transactions').upsert(updatedTransactionsList.map(mapTransactionToDb));
      } catch (err) {
        console.error('Supabase write error', err);
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const orderToDelete = orders.find((o) => o.id === id);
    if (!orderToDelete) return;

    // Refund stock allocations
    const adjustedProducts = [...products];
    orderToDelete.items.forEach((item) => {
      const pIdx = adjustedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        adjustedProducts[pIdx].quantity += item.quantity;
      }
    });
    saveProducts(adjustedProducts);

    // Filter order & transaction logs
    saveOrders(orders.filter((o) => o.id !== id));
    
    const filteredTrans = transactions.filter((tr) => !tr.description.includes(orderToDelete.orderNumber));
    saveTransactions(filteredTrans);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('products').upsert(adjustedProducts.map(mapProductToDb));
        await sb.from('orders').delete().eq('id', id);
        await sb.from('transactions').delete().like('description', `%${orderToDelete.orderNumber}%`);
      } catch (err) {
        console.error('Supabase delete error', err);
      }
    }
  };

  // --- UTILS DATABASE BACKUP ---
  const handleImportData = (dataJson: string): boolean => {
    try {
      const parsed = JSON.parse(dataJson);
      if (
        Array.isArray(parsed.products) &&
        Array.isArray(parsed.orders) &&
        Array.isArray(parsed.customers) &&
        Array.isArray(parsed.transactions)
      ) {
        saveProducts(parsed.products);
        saveOrders(parsed.orders);
        saveCustomers(parsed.customers);
        saveTransactions(parsed.transactions);

        // Success full refresh
        setTimeout(() => window.location.reload(), 1500);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleExportData = (): string => {
    return JSON.stringify({
      products,
      orders,
      customers,
      transactions,
    });
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    setTransactions([]);
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sm_language', lang);
    setIsLangOpen(false);
  };

  // Active theme trigger
  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('sm_dark_mode', String(nextMode));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#09090b] text-zinc-400' : 'bg-gray-50 text-gray-900'}`}>
      {/* GLOBAL WRAPPER FOR ARABIC TRANSITIONS */}
      <div dir={isRtl ? 'rtl' : 'ltr'} className="pb-24 font-sans text-sm md:text-base selection:bg-emerald-100/30">
        
        {/* UPPER STATUS HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/80 dark:backdrop-blur-xl shadow-sm border-b border-gray-150 dark:border-zinc-800 print:hidden transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Title / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-base shadow-sm">
                S
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-gray-905 dark:text-white uppercase">
                  {isRtl ? 'إدارة التجارة' : 'StockManager Plus'}
                </h1>
                <p className="text-[10px] text-gray-400 font-mono">V_1.0.3 • Vercel Ready</p>
              </div>
            </div>

            {/* Quick configurations dropdown & toggle mode */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                id="btn-toggle-theme"
                className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg text-gray-550 dark:text-gray-300 transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  id="btn-lang-dropdown"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg text-gray-550 dark:text-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold focus:outline-none"
                  aria-expanded={isLangOpen}
                >
                  <Languages className="w-4 h-4" />
                  <span className="uppercase text-2xs">{language}</span>
                </button>
                {isLangOpen && (
                  <>
                    {/* Touch-safe click-away backdrop to dismiss list */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setIsLangOpen(false)}
                    />
                    <div className={`absolute top-full mt-1.5 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150 ${
                      isRtl ? 'left-0' : 'right-0'
                    }`}>
                      <button
                        onClick={() => handleLanguageChange('fr')}
                        className="w-full text-left font-sans block px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-750 font-bold"
                      >
                        Français
                      </button>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className="w-full text-left font-sans block px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-750 font-bold"
                      >
                        English
                      </button>
                      <button
                        onClick={() => handleLanguageChange('ar')}
                        className="w-full text-right font-sans block px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
                      >
                        العربية (Algeria)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              orders={orders}
              transactions={transactions}
              language={language}
              onNavigateToTab={(tab) => {
                if (tab === 'transactions') {
                  setActiveTab('settings'); // Settings includes backups/SQL helper
                } else {
                  setActiveTab(tab as any);
                }
              }}
            />
          )}

          {activeTab === 'stock' && (
            <StockManager
              products={products}
              language={language}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManager
              customers={customers}
              language={language}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManager
              orders={orders}
              products={products}
              customers={customers}
              language={language}
              onCreateOrder={handleCreateOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <SupabaseSettings
                language={language}
                onImportData={handleImportData}
                onExportData={handleExportData}
                onClearAllData={handleClearAllData}
                supabaseUrl={supabaseUrl}
                supabaseKey={supabaseKey}
                onSaveSupabaseConfig={handleSaveSupabaseConfig}
                onDisconnectSupabase={handleDisconnectSupabase}
                isSupabaseConnected={isSupabaseConnected}
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                  Historique Net des Flux
                </h3>
                {/* Embedded Transactions list inside settings for better flow */}
                <TransactionHistory transactions={transactions} language={language} />
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM MOBILE UTILITY STICKY NAVIGATION (True craftsmanship for mobile users) */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-900/95 border-t border-gray-200 dark:border-zinc-800 backdrop-blur-md py-2.5 px-4 flex justify-around items-center z-40 lg:max-w-md lg:mx-auto lg:rounded-t-3xl lg:shadow-2xl print:hidden transition-colors duration-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            id="nav-tab-dashboard"
            className={`flex flex-col items-center gap-1.5 transition-colors select-none ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            id="nav-tab-stock"
            className={`flex flex-col items-center gap-1.5 transition-colors select-none ${
              activeTab === 'stock'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.stock}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            id="nav-tab-orders"
            className={`flex flex-col items-center gap-1.5 transition-colors select-none ${
              activeTab === 'orders'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.orders}</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            id="nav-tab-customers"
            className={`flex flex-col items-center gap-1.5 transition-colors select-none ${
              activeTab === 'customers'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.customers}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            id="nav-tab-settings"
            className={`flex flex-col items-center gap-1.5 transition-colors select-none ${
              activeTab === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Postgres</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
