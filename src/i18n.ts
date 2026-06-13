export const translations = {
  en: {
    dashboard: 'Dashboard',
    stock: 'Stock',
    orders: 'Orders',
    customers: 'Customers',
    transactions: 'Transactions',
    settings: 'Settings & Supabase',
    
    // Stats
    totalSales: 'Total Sales',
    totalPurchase: 'Purchase Cost',
    totalProfit: 'Estimated Profit',
    lowStockAlerts: 'Low Stock Alerts',
    activeOrders: 'Active Orders',
    totalProducts: 'Total Products',
    profitMargin: 'Profit Margin',
    stockValue: 'Current Stock Value',
    unpaidAmount: 'Unpaid Receivables',
    
    // Actions
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    createOrder: 'Create New Order',
    editOrder: 'Edit Order',
    deleteOrder: 'Delete Order',
    printInvoice: 'Print Receipt',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search...',
    all: 'All',
    filterStatus: 'Status Filter',
    
    // Product fields
    name: 'Product Name',
    purchasePrice: 'Purchase Price',
    sellingPrice: 'Selling Price',
    unitType: 'Unit Type',
    quantity: 'Quantity',
    supplier: 'Supplier',
    minStockAlert: 'Low Stock Alert Threshold',
    currentQty: 'Current Qty',
    actions: 'Actions',
    
    // Customer fields
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email',
    address: 'Address',
    selectCustomer: 'Select Customer',
    anonymous: 'Walk-in Customer',
    
    // Order fields
    orderNo: 'Order No',
    date: 'Date',
    customer: 'Customer',
    items: 'Items',
    total: 'Total',
    status: 'Order Status',
    paymentStatus: 'Payment Status',
    notes: 'Internal Notes',
    addOrderItem: 'Add Selected Items',
    itemQuantity: 'Quantity to order',
    emptyOrderItems: 'No items in this order yet.',
    confirmOrderDetails: 'Order Summary',
    
    // Units
    kg: 'Kilogram (kg)',
    l: 'Liter (l)',
    g: 'Gram (g)',
    box: 'Box',
    carton: 'Carton',
    unit: 'Unit / Piece',
    
    // Statuses label
    pending: 'Pending',
    confirmed: 'Confirmed',
    delivery: 'In Delivery',
    cancelled: 'Cancelled',
    paid: 'Paid',
    unpaid: 'Unpaid',
    
    // Alerts
    lowStockAlert: 'Low Stock Warning',
    noMatchingProducts: 'No products found',
    noMatchingCustomers: 'No customers found',
    noMatchingOrders: 'No orders found',
    outOfStock: 'Out of Stock!',
    onlyQtyAvailable: 'Only {qty} units available',
    
    // Dashboard analytics labels
    revenueTrend: 'Sales & Profits Over Time',
    topSellingProducts: 'Top Selling Products',
    recentTransactions: 'Recent Transactions',
    noTransactionsYet: 'No transactions recorded yet.',
    
    // Translation languages
    fr: 'French / Français',
    en: 'English / English',
    ar: 'Arabic / العربية',
    language: 'Language',
    
    // Supabase
    supabaseIntegration: 'Supabase Postgres Setup & Sync',
    supabaseInstructions: 'This application stores data in high-performance local memory. You can easily connect it with your Supabase database. Copy the schema statement below to your SQL editor in Supabase:',
    exportJson: 'Export Data (JSON)',
    importJson: 'Import Data (JSON)',
    copySql: 'Copy SQL Schema Code',
    sqlCopied: 'SQL Copied to clipboard!',
    clearData: 'Clear All Local Data',
    clearConfirm: 'Are you sure you want to delete all local products, orders, and sales? This cannot be undone.'
  },
  fr: {
    dashboard: 'Tableau de Bord',
    stock: 'Gestion Stock',
    orders: 'Commandes',
    customers: 'Clients',
    transactions: 'Transactions',
    settings: 'Configuration & Supabase',
    
    // Stats
    totalSales: 'Ventes Totales',
    totalPurchase: 'Coût d\'Achat',
    totalProfit: 'Bénéfice Restant',
    lowStockAlerts: 'Alertes Stock Bas',
    activeOrders: 'Commandes Actives',
    totalProducts: 'Produits Totaux',
    profitMargin: 'Marge Bénéficiaire',
    stockValue: 'Valeur du Stock',
    unpaidAmount: 'Créances Non Payées',
    
    // Actions
    addProduct: 'Ajouter Produit',
    editProduct: 'Modifier Produit',
    deleteProduct: 'Supprimer Produit',
    addCustomer: 'Ajouter Client',
    editCustomer: 'Modifier Client',
    deleteCustomer: 'Supprimer Client',
    createOrder: 'Nouvelle Commande',
    editOrder: 'Modifier Commande',
    deleteOrder: 'Supprimer Commande',
    printInvoice: 'Imprimer Ticket',
    save: 'Enregistrer',
    cancel: 'Annuler',
    search: 'Rechercher...',
    all: 'Tous',
    filterStatus: 'Filtrer par statut',
    
    // Product fields
    name: 'Nom de l\'article',
    purchasePrice: 'Prix d\'achat',
    sellingPrice: 'Prix de vente',
    unitType: 'Unité',
    quantity: 'Quantité',
    supplier: 'Fournisseur / Grossiste',
    minStockAlert: 'Seuil minimum d\'alerte',
    currentQty: 'Qté en Stock',
    actions: 'Actions',
    
    // Customer fields
    fullName: 'Nom Complet Client',
    phone: 'N° de Téléphone',
    email: 'Email',
    address: 'Adresse',
    selectCustomer: 'Choisir un Client',
    anonymous: 'Client de passage',
    
    // Order fields
    orderNo: 'N° Commande',
    date: 'Date',
    customer: 'Client',
    items: 'Articles',
    total: 'Total',
    status: 'Statut de Commande',
    paymentStatus: 'Paiement',
    notes: 'Notes Internes',
    addOrderItem: 'Ajouter les Produits',
    itemQuantity: 'Quantité à commander',
    emptyOrderItems: 'Aucun produit sélectionné pour l\'instant.',
    confirmOrderDetails: 'Récapitulatif de Commande',
    
    // Units
    kg: 'Kilogramme (kg)',
    l: 'Litre (l)',
    g: 'Gramme (g)',
    box: 'Boîte',
    carton: 'Carton',
    unit: 'Unité / Unitaire',
    
    // Statuses label
    pending: 'En attente',
    confirmed: 'Confirmé',
    delivery: 'En livraison',
    cancelled: 'Annulé',
    paid: 'Payé',
    unpaid: 'Non payé',
    
    // Alerts
    lowStockAlert: 'Attention stock bas !',
    noMatchingProducts: 'Aucun produit trouvé',
    noMatchingCustomers: 'Aucun client trouvé',
    noMatchingOrders: 'Aucune commande trouvée',
    outOfStock: 'Rupture de Stock!',
    onlyQtyAvailable: 'Seulement {qty} unités disponibles',
    
    // Dashboard analytics labels
    revenueTrend: 'Évolution Ventes & Bénéfices',
    topSellingProducts: 'Articles Les Plus Vendus',
    recentTransactions: 'Historique Récent',
    noTransactionsYet: 'Aucune transaction enregistrée.',
    
    // Translation languages
    fr: 'French / Français',
    en: 'English / English',
    ar: 'Arabic / العربية',
    language: 'Langue',
    
    // Supabase
    supabaseIntegration: 'Intégration Base Supabase SQL',
    supabaseInstructions: 'Cette application stocke les données localement dans votre navigateur. Pour connecter votre base Postgres Supabase et déployer facilement sur Vercel, copiez le code SQL suivant dans l\'éditeur de requêtes Supabase :',
    exportJson: 'Exporter en JSON',
    importJson: 'Importer du JSON',
    copySql: 'Copier Code SQL',
    sqlCopied: 'Code SQL copié !',
    clearData: 'Réinitialiser Données locales',
    clearConfirm: 'Êtes-vous sûr de vouloir supprimer tous les produits, commandes et clients ? Cette modification est irréversible.'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    stock: 'إدارة المخزون',
    orders: 'الطلبات والمبيعات',
    customers: 'الزبائن',
    transactions: 'سجل العمليات',
    settings: 'الإعدادات وقواعد البيانات',
    
    // Stats
    totalSales: 'إجمالي المبيعات',
    totalPurchase: 'تكلفة المشتريات',
    totalProfit: 'الأرباح التقديرية',
    lowStockAlerts: 'تنبيهات المخزون المنخفض',
    activeOrders: 'الطلبات النشطة',
    totalProducts: 'إجمالي السلع',
    profitMargin: 'هامش الربح',
    stockValue: 'قيمة المخزون الحالي',
    unpaidAmount: 'الديون غير المحصلة',
    
    // Actions
    addProduct: 'إضافة سلعة',
    editProduct: 'تعديل السلعة',
    deleteProduct: 'حذف السلعة',
    addCustomer: 'إضافة زبون',
    editCustomer: 'تعديل زبون',
    deleteCustomer: 'حذف زبون',
    createOrder: 'إنشاء طلبية جديدة',
    editOrder: 'تعديل الطلبية',
    deleteOrder: 'حذف الطلبية',
    printInvoice: 'طباعة الوصل',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث...',
    all: 'الكل',
    filterStatus: 'تصفية الحالة',
    
    // Product fields
    name: 'اسم السلعة',
    purchasePrice: 'سعر الشراء',
    sellingPrice: 'سعر البيع',
    unitType: 'الوحدة',
    quantity: 'الكمية',
    supplier: 'المورد / التاجر',
    minStockAlert: 'حد التنبيه للمخزون',
    currentQty: 'الكمية المتوفرة',
    actions: 'الإجراءات',
    
    // Customer fields
    fullName: 'الاسم الكامل للزبون',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    selectCustomer: 'اختر زبوناً',
    anonymous: 'زبون عابر',
    
    // Order fields
    orderNo: 'رقم الطلب',
    date: 'التاريخ',
    customer: 'الزبون',
    items: 'السلع',
    total: 'الإجمالي',
    status: 'حالة الطلبية',
    paymentStatus: 'حالة الدفع',
    notes: 'ملاحظات داخلية',
    addOrderItem: 'إضافة السلع المحددة',
    itemQuantity: 'الكمية المطلوبة',
    emptyOrderItems: 'لا توجد سلع مضافة للطلب بعد.',
    confirmOrderDetails: 'ملخص الطلبية',
    
    // Units
    kg: 'كيلوغرام (كيلو)',
    l: 'لتر (ل)',
    g: 'غرام (غ)',
    box: 'علبة (Boîte)',
    carton: 'كرتون',
    unit: 'قطعة / وحدة',
    
    // Statuses label
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    delivery: 'قيد التوصيل',
    cancelled: 'ملغي',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    
    // Alerts
    lowStockAlert: 'تحذير مخزون منخفض!',
    noMatchingProducts: 'لم يتم العثور على سلع',
    noMatchingCustomers: 'لم يتم العثور على زبائن',
    noMatchingOrders: 'لم يتم العثور على طلبيات',
    outOfStock: 'نفذت الكمية!',
    onlyQtyAvailable: 'الكمية المتاحة فقط {qty}',
    
    // Dashboard analytics labels
    revenueTrend: 'تطور المبيعات والأرباح',
    topSellingProducts: 'السلع الأكثر مبيعاً',
    recentTransactions: 'آخر الحركات المالية',
    noTransactionsYet: 'لا توجد حركات مالية مسجلة بعد.',
    
    // Translation languages
    fr: 'الفرنسية / Français',
    en: 'الإنجليزية / English',
    ar: 'العربية / العربية',
    language: 'اللغة',
    
    // Supabase
    supabaseIntegration: 'ربط قاعدة بيانات Supabase SQL',
    supabaseInstructions: 'يقوم هذا التطبيق بحفظ البيانات محلياً على المتصفح. لتسهيل ربطها بـ Supabase والاستعداد للرفع على Vercel، انسخ الكود التالي في محرر SQL في Supabase:',
    exportJson: 'تصدير البيانات (JSON)',
    importJson: 'استيراد البيانات (JSON)',
    copySql: 'نسخ كود SQL لإنشاء الجدول',
    sqlCopied: 'تم نسخ SQL للحافظة!',
    clearData: 'مسح البيانات المحلية',
    clearConfirm: 'هل أنت متأكد من رغبتك في حذف جميع السلع، الزبائن والطلبات محلياً؟ لا يمكن التراجع عن هذا الإجراء.'
  }
};
