import { Product, Order, Transaction, Language } from '../types';
import { translations } from '../i18n';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ClipboardList, Package, ArrowUpRight, BarChart3 } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  language: Language;
  onNavigateToTab: (tabName: 'stock' | 'orders' | 'customers' | 'transactions') => void;
}

export default function Dashboard({
  products,
  orders,
  transactions,
  language,
  onNavigateToTab,
}: DashboardProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  // --- STATS COMPUTATION ---
  // 1. Total Sales (only from confirmed orders, not cancelled)
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalSalesVal = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // 2. Total Purchase Cost for sold items to calculate real profit
  const totalPurchaseCostVal = activeOrders.reduce((sum, o) => sum + o.totalPurchaseCost, 0);

  // 3. Estimated Profit
  const estimatedProfitVal = totalSalesVal - totalPurchaseCostVal;

  // 4. Low stock count
  const lowStockItems = products.filter((p) => p.quantity <= p.minStockAlert);
  const lowStockCount = lowStockItems.length;

  // 5. Unpaid Receivables (total price of active unpaid orders)
  const unpaidSalesVal = activeOrders
    .filter((o) => o.paymentStatus === 'unpaid')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // 6. Current Stock Total Asset value (quantity * purchasePrice)
  const stockAssetVal = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);

  // 7. Profit Margin
  const profitMarginPercent = totalSalesVal > 0 ? (estimatedProfitVal / totalSalesVal) * 100 : 0;

  // --- TIMELINE DATA FOR CUSTOM SVG GRAPH ---
  // Group by date for last 7 active transaction dates
  const datesMap: { [date: string]: { sales: number; profit: number } } = {};
  
  // Sort transactions by date ascending
  const sortedTransactions = [...transactions]
    .filter((tr) => tr.type === 'sale')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedTransactions.forEach((tr) => {
    const dStr = tr.date.split('T')[0];
    if (!datesMap[dStr]) {
      datesMap[dStr] = { sales: 0, profit: 0 };
    }
    datesMap[dStr].sales += tr.amount;
    datesMap[dStr].profit += tr.profit;
  });

  const timelineDates = Object.keys(datesMap).slice(-5); // take last 5 days
  const chartHeight = 120;
  const chartWidth = 320;
  const paddingX = 40;
  const paddingY = 20;

  // Find max value for scaling the SVG chart
  const maxVal = timelineDates.reduce((max, d) => {
    return Math.max(max, datesMap[d].sales, datesMap[d].profit);
  }, 1000) || 1000;

  // --- TOP SELLING PRODUCTS ---
  // Aggregate quantities purchased
  const productSalesMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
  activeOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.quantity * item.sellingPrice;
    });
  });

  const topSellers = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  const maxSellerQty = topSellers[0]?.qty || 1;

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">
            {t.dashboard}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Tableau de gestion commerciale, analyse financière et d'inventaire
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Mise à jour directe locale
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div
          onClick={() => onNavigateToTab('transactions')}
          id="stat-sales"
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-3xs cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
              {t.totalSales}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-150 font-sans truncate">
            {totalSalesVal.toLocaleString()} DA
          </p>
          <p className="text-3xs text-gray-400 mt-1">Évolution cumulée</p>
        </div>

        {/* Profit Card */}
        <div
          onClick={() => onNavigateToTab('transactions')}
          id="stat-profit"
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-3xs cursor-pointer hover:border-indigo-500 transition-all bg-gradient-to-br from-white to-indigo-50/5 dark:from-gray-800 dark:to-indigo-950/5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
              {t.totalProfit}
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-sans truncate">
            +{estimatedProfitVal.toLocaleString()} DA
          </p>
          <p className="text-3xs text-gray-400 mt-1">
            {t.profitMargin}: {profitMarginPercent.toFixed(1)}%
          </p>
        </div>

        {/* Low Stock alerting card */}
        <div
          onClick={() => onNavigateToTab('stock')}
          id="stat-low-stock"
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-3xs ${
            lowStockCount > 0
              ? 'border-rose-220 bg-rose-50/20 dark:border-rose-900 dark:bg-rose-950/5 hover:border-rose-500'
              : 'border-gray-150 dark:border-gray-700 hover:border-yellow-500 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
              {t.lowStockAlerts}
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                lowStockCount > 0
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p
            className={`text-sm font-extrabold font-sans ${
              lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-905 dark:text-gray-100'
            }`}
          >
            {lowStockCount} Suffixes
          </p>
          <p className="text-3xs text-gray-400 mt-1">Seuils d'alertes atteints</p>
        </div>

        {/* Unpaid Card */}
        <div
          onClick={() => onNavigateToTab('orders')}
          id="stat-unpaid"
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-3xs cursor-pointer hover:border-amber-500 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
              {t.unpaidAmount}
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm font-extrabold text-amber-650 dark:text-amber-400 font-sans truncate">
            {unpaidSalesVal.toLocaleString()} DA
          </p>
          <p className="text-3xs text-gray-400 mt-1">Créances clients actifs</p>
        </div>
      </div>

      {/* Auxiliary inventory asset status */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-150 dark:border-gray-700 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-xs text-gray-505 dark:text-gray-400 font-sans">{t.stockValue}</span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-150 font-sans">
              {stockAssetVal.toLocaleString()} DA
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">Marge moyenne globale : <strong>{profitMarginPercent.toFixed(0)}%</strong></span>
        </div>
      </div>

      {/* Main Charts & Rankings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        {/* Timeline SVG Chart (Left - spans 7 cols on desktop) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm md:text-base">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {t.revenueTrend}
            </h3>
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-3xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ventes
              </span>
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Profits
              </span>
            </div>
          </div>

          {timelineDates.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">
              {t.noTransactionsYet}
            </div>
          ) : (
            <div className="pt-2">
              {/* Custom SVG Scalable Graph */}
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pRatio, idx) => {
                  const y = paddingY + (chartHeight - paddingY * 2) * pRatio;
                  return (
                    <line
                      key={idx}
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      className="dark:stroke-gray-700/50"
                    />
                  );
                })}

                {/* Vertical Bar logic */}
                {timelineDates.map((date, index) => {
                  const totalBars = timelineDates.length;
                  const sectionWidth = (chartWidth - paddingX * 2) / totalBars;
                  const x = paddingX + index * sectionWidth + sectionWidth / 2;

                  const sales = datesMap[date]?.sales || 0;
                  const profit = datesMap[date]?.profit || 0;

                  // Bar height computations
                  const contentH = chartHeight - paddingY * 2;
                  const salesH = (sales / maxVal) * contentH;
                  const profitH = (profit / maxVal) * contentH;

                  // Render double stacked or adjacent columns
                  const colW = sectionWidth * 0.3;

                  // Format simple date label
                  const formattedDate = date.slice(5);

                  return (
                    <g key={date}>
                      {/* Sales Bar */}
                      <rect
                        x={x - colW}
                        y={chartHeight - paddingY - salesH}
                        width={colW}
                        height={salesH}
                        rx="2"
                        className="fill-emerald-500/80 dark:fill-emerald-600 hover:opacity-100 transition-opacity"
                      />

                      {/* Profit Bar */}
                      <rect
                        x={x + 1}
                        y={chartHeight - paddingY - profitH}
                        width={colW}
                        height={profitH}
                        rx="2"
                        className="fill-indigo-500/80 dark:fill-indigo-600 hover:opacity-100 transition-opacity"
                      />

                      {/* X label date */}
                      <text
                        x={x}
                        y={chartHeight - paddingY + 12}
                        textAnchor="middle"
                        fontSize="8"
                        className="fill-gray-400 dark:fill-gray-500 font-mono"
                      >
                        {formattedDate}
                      </text>
                    </g>
                  );
                })}

                {/* Profit curve overlay link lines if necessary, we can keep simple bar charts for perfect aesthetics */}
              </svg>
            </div>
          )}
        </div>

        {/* Top selling products list (Right - spans 5 cols on desktop) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm lg:col-span-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm md:text-base">
            <ArrowUpRight className="w-5 h-5 text-indigo-500" />
            {t.topSellingProducts}
          </h3>

          {topSellers.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Rapport vide. Réalisez des ventes pour lister les meilleurs articles.
            </div>
          ) : (
            <div className="space-y-4">
              {topSellers.map((prod, index) => {
                const ratio = (prod.qty / maxSellerQty) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{prod.name}</span>
                      <span className="text-gray-900 dark:text-gray-100">{prod.qty} vendus</span>
                    </div>
                    {/* Visual Meter Bar */}
                    <div className="w-full h-1.5 bg-gray-105 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-3xs text-gray-400">
                      <span>Recettes générées</span>
                      <span>{prod.revenue.toLocaleString()} DA</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Critical Restock Alerts Quick Table */}
      {lowStockCount > 0 && (
        <div className="bg-rose-50/20 dark:bg-rose-950/5 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold text-sm md:text-base">{t.lowStockAlert} ({lowStockCount})</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900 shadow-3xs flex justify-between items-center"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                  <p className="text-3xs text-gray-450 mt-0.5">Fournisseur : {item.supplier}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg">
                    {item.quantity} restants (Seuil: {item.minStockAlert})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
