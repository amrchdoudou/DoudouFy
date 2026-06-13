import { useState, FormEvent } from 'react';
import { Order, OrderItem, Product, Customer, OrderStatus, PaymentStatus, Language } from '../types';
import { translations } from '../i18n';
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, CheckCircle, Clock, Truck, XCircle,
  TrendingDown, FileSpreadsheet, User, ChevronDown, Check, AlertCircle, RefreshCw
} from 'lucide-react';

interface OrderManagerProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  language: Language;
  onCreateOrder: (order: Omit<Order, 'id' | 'orderNumber'>) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
}

export default function OrderManager({
  orders,
  products,
  customers,
  language,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
}: OrderManagerProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Creation/Edition state
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('anonymous');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('confirmed');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');

  // Active printer preview modal state
  const [printPreviewOrder, setPrintPreviewOrder] = useState<Order | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Selector products in form
  const [productSearch, setProductSearch] = useState('');
  const [addItemQty, setAddItemQty] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const resetForm = () => {
    setSelectedCustomerId('anonymous');
    setOrderItems([]);
    setOrderStatus('confirmed');
    setPaymentStatus('paid');
    setNotes('');
    setEditingOrder(null);
    setProductSearch('');
    setSelectedProductId('');
    setAddItemQty(1);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEditForm = (o: Order) => {
    setEditingOrder(o);
    setSelectedCustomerId(o.customerId);
    setOrderStatus(o.status);
    setPaymentStatus(o.paymentStatus);
    setNotes(o.notes || '');
    setOrderItems([...o.items]);
    setShowForm(true);
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // Check if product is already in the items list
    const existingIndex = orderItems.findIndex((it) => it.productId === prod.id);

    // Verify stock feasibility (combining product current stock page + old order item count if editing)
    const originalQtyInEditing = editingOrder
      ? editingOrder.items.find((it) => it.productId === prod.id)?.quantity || 0
      : 0;

    const availableStock = prod.quantity + originalQtyInEditing;

    const neededQty = existingIndex >= 0
      ? orderItems[existingIndex].quantity + addItemQty
      : addItemQty;

    if (neededQty > availableStock) {
      alert(t.onlyQtyAvailable.replace('{qty}', availableStock.toString()));
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity = neededQty;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: prod.id,
          name: prod.name,
          quantity: addItemQty,
          unitType: prod.unitType,
          purchasePrice: prod.purchasePrice,
          sellingPrice: prod.sellingPrice,
        },
      ]);
    }

    // Reset selection helper
    setSelectedProductId('');
    setAddItemQty(1);
  };

  const handleRemoveProductFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter((it) => it.productId !== productId));
  };

  const handleUpdateItemQty = (productId: string, qty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const originalQtyInEditing = editingOrder
      ? editingOrder.items.find((it) => it.productId === productId)?.quantity || 0
      : 0;
    const availableStock = prod.quantity + originalQtyInEditing;

    if (qty > availableStock) {
      alert(t.onlyQtyAvailable.replace('{qty}', availableStock.toString()));
      return;
    }

    if (qty <= 0) {
      handleRemoveProductFromOrder(productId);
      return;
    }

    setOrderItems(
      orderItems.map((it) => (it.productId === productId ? { ...it, quantity: qty } : it))
    );
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert(t.emptyOrderItems);
      return;
    }

    const matchedCust = customers.find((c) => c.id === selectedCustomerId);
    const customerName = matchedCust ? matchedCust.name : t.anonymous;

    // Sum calculation
    const totalPrice = orderItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
    const totalPurchaseCost = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0
    );

    const orderData = {
      date: editingOrder ? editingOrder.date : new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      customerName,
      items: orderItems,
      totalPrice,
      totalPurchaseCost,
      status: orderStatus,
      paymentStatus,
      notes,
    };

    if (editingOrder) {
      onUpdateOrder({
        ...orderData,
        id: editingOrder.id,
        orderNumber: editingOrder.orderNumber,
      });
    } else {
      onCreateOrder(orderData);
    }

    setShowForm(false);
    resetForm();
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const custSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const orderNoSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = custSearch || orderNoSearch;

    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || o.paymentStatus === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handlePrint = () => {
    // Basic printer trigger, styled below on overlay
    window.print();
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            {t.orders} ({orders.length})
          </h2>
          <p className="text-sm text-gray-505 mt-1">
            Créer, éditer, et suivre le cycle de vente et livraison de commandes
          </p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          id="btn-add-order"
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" />
          {t.createOrder}
        </button>
      </div>

      {/* FILTER SEARCH CRITERIA */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-150 dark:border-gray-700 shadow-3xs flex flex-col gap-3 font-sans">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            id="search-order"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className={`w-full py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-xs ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Status toggles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-2xs font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              Statut Livraison
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50 p-2 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-xs"
            >
              <option value="all">Filtre Global</option>
              <option value="confirmed">Confirmée / Validé</option>
              <option value="delivery">En cours de livraison</option>
              <option value="pending">Pris en compte / En attente</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div>
            <label className="text-2xs font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              Statut Paiement
            </label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full bg-gray-50 p-2 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-xs"
            >
              <option value="all">Tous Règlements</option>
              <option value="paid">{t.paid}</option>
              <option value="unpaid">{t.unpaid}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ORDERS ACCORDION / CARD VIEW */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 text-center py-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-505 font-medium">{t.noMatchingOrders}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const isUnpaid = o.paymentStatus === 'unpaid';

            // Icons selector for status
            let badgeStyle = 'bg-yellow-50 text-yellow-700 border-yellow-100';
            let badgeIcon = <Clock className="w-3.5 h-3.5" />;
            if (o.status === 'confirmed') {
              badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-110';
              badgeIcon = <CheckCircle className="w-3.5 h-3.5" />;
            } else if (o.status === 'delivery') {
              badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-110';
              badgeIcon = <Truck className="w-3.5 h-3.5" />;
            } else if (o.status === 'cancelled') {
              badgeStyle = 'bg-gray-50 text-gray-700 border-gray-110';
              badgeIcon = <XCircle className="w-3.5 h-3.5" />;
            }

            return (
              <div
                key={o.id}
                id={`order-card-${o.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 shadow-xs flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-indigo-200 duration-150 font-sans"
              >
                {/* Meta details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg text-xs font-mono">
                      {o.orderNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(o.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-200">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{o.customerName === t.anonymous ? t.anonymous : o.customerName}</span>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {o.items.map((it) => `${it.quantity} ${t[it.unitType]} × ${it.name}`).join(', ')}
                    </div>
                  </div>

                  {o.notes && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-dotted border-gray-200 dark:border-gray-700 text-2xs text-gray-500 italic block">
                      Note : {o.notes}
                    </div>
                  )}
                </div>

                {/* Status flags and total pricing layout */}
                <div className="flex flex-col justify-end items-end gap-3 text-right">
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {/* Status delivery widget */}
                    <span className={`px-2.5 py-1 rounded-lg text-2xs font-bold border flex items-center gap-1 ${badgeStyle}`}>
                      {badgeIcon}
                      {t[o.status]}
                    </span>

                    {/* Paid vs Not paid indicator */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold border flex items-center gap-1 ${
                        isUnpaid
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isUnpaid ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      {o.paymentStatus === 'paid' ? t.paid : t.unpaid}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xs text-gray-400 uppercase tracking-wider">{t.total}</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-sans">
                      {o.totalPrice.toLocaleString()} DA
                    </span>
                    <span className="text-4xs text-emerald-600 font-mono">
                      Bénéfice : +{(o.totalPrice - o.totalPurchaseCost).toLocaleString()} DA
                    </span>
                  </div>

                  {/* Actions (Print Invoice ticket, Edit command detail, Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPrintPreviewOrder(o)}
                      id={`btn-print-${o.id}`}
                      className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg text-gray-600 dark:text-gray-300 flex items-center gap-1 text-xs font-semibold select-none group transition-colors"
                      title="Afficher le ticket d'impression"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-600" />
                      <span>{t.printInvoice}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditForm(o)}
                      id={`btn-edit-ord-${o.id}`}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 rounded-lg transition-colors"
                      title={t.editOrder}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (deleteConfirmId === o.id) {
                          onDeleteOrder(o.id);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(o.id);
                          setTimeout(() => setDeleteConfirmId(null), 4000);
                        }
                      }}
                      id={`btn-delete-ord-${o.id}`}
                      className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                        deleteConfirmId === o.id
                          ? 'bg-red-650 text-white animate-pulse'
                          : 'p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-450 rounded-lg transition-colors'
                      }`}
                      title={deleteConfirmId === o.id ? "Confirmer la suppression" : t.deleteOrder}
                    >
                      {deleteConfirmId === o.id ? "Sûr?" : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL OVERLAY */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingOrder ? `${t.editOrder} ${editingOrder.orderNumber}` : t.createOrder}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:text-indigo-150 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Customer Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 block font-sans">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.customer} *
                  </label>
                  <select
                    value={selectedCustomerId}
                    id="order-form-customer"
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-indigo-505 focus:outline-none text-sm"
                  >
                    <option value="anonymous">{t.anonymous}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'Sans tel'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.status} / Paiement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none text-xs"
                    >
                      <option value="confirmed">Confirmé</option>
                      <option value="delivery">En livraison</option>
                      <option value="pending">En attente</option>
                      <option value="cancelled">Annulé</option>
                    </select>

                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none text-xs font-semibold text-indigo-700 dark:text-indigo-400"
                    >
                      <option value="paid">{t.paid}</option>
                      <option value="unpaid">{t.unpaid}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PRODUCTS SEARCH AND LIVE CHOOSE INVOICE ITEMS */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-700 rounded-xl space-y-3 font-sans">
                <h4 className="font-bold text-gray-800 dark:text-gray-300 text-sm flex items-center justify-between">
                  <span>Sélectionner des Sels</span>
                  <span className="text-4xs text-gray-450 uppercase tracking-wider">Ajuster la quantité</span>
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-sm"
                    >
                      <option value="">Sélectionner un produit stocké (Qté disponible)</option>
                      {products.map((p) => {
                        // Old editing order item compensation
                        const originalQty = editingOrder
                          ? editingOrder.items.find((it) => it.productId === p.id)?.quantity || 0
                          : 0;

                        return (
                          <option key={p.id} value={p.id} disabled={p.quantity + originalQty <= 0}>
                            {p.name} ({p.quantity + originalQty} {p.unitType} dispo) — {p.sellingPrice.toLocaleString()} DA
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={addItemQty}
                      onChange={(e) => setAddItemQty(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-center font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductToOrder}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold select-none shadow-xs"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS CURRENTLY ADDED TABLE */}
              <div className="space-y-2 font-sans">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Sels Sélectionnés f l'Commande ({orderItems.length})
                </label>

                {orderItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed">
                    {t.emptyOrderItems} Select products from selection box above.
                  </p>
                ) : (
                  <div className="border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {orderItems.map((it) => (
                      <div key={it.productId} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{it.name}</p>
                          <p className="text-3xs text-gray-400 font-sans">
                            Achat: {it.purchasePrice} DA | Vente: {it.sellingPrice} DA
                          </p>
                        </div>

                        {/* Qty incrementer */}
                        <div className="flex items-center gap-1.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(it.productId, it.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-gray-900 dark:text-gray-100 w-10 text-center">
                            {it.quantity} <span className="text-4xs font-normal text-gray-450">{it.unitType}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(it.productId, it.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Individual prices subtotals */}
                        <div className="text-right pl-3 font-semibold text-gray-900 dark:text-gray-200 w-24">
                          {(it.quantity * it.sellingPrice).toLocaleString()} DA
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromOrder(it.productId)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Total summary row */}
                    <div className="bg-gray-50 dark:bg-gray-900/60 p-4 text-right flex justify-between items-center font-sans">
                      <span className="text-xs font-bold text-gray-505 uppercase tracking-wide">
                        {t.confirmOrderDetails}
                      </span>
                      <div>
                        <span className="text-3xs text-gray-400 uppercase mr-2">{t.total}:</span>
                        <span className="text-lg font-black text-indigo-650 dark:text-indigo-400 font-sans">
                          {orderItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0).toLocaleString()} DA
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Internal order comments */}
              <div className="space-y-1 block font-sans">
                <label className="text-xs font-semibold text-gray-520 uppercase tracking-wider block">
                  {t.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. À livrer après 17h, adresse de stockage ..."
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-xs"
                />
              </div>

              {/* Action operations */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-705 font-sans">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-105 text-sm font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="checkout-confirm-btn"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  {editingOrder ? 'Confirmer la modification' : 'Finaliser la Commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT TICKET/INVOICE OVERLAY */}
      {printPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <div id="print-preview-receipt" className="bg-white dark:bg-gray-950 rounded-2xl w-full max-w-sm shadow-2xl p-6 border dark:border-gray-800 animate-in fade-in zoom-in-95 font-mono print:border-none print:shadow-none print:bg-white print:p-0 print:absolute print:inset-0 text-gray-900 text-xs text-left">
            {/* Action control bar (hidden when actually printing via CSS) */}
            <div className="flex justify-between items-center pb-4 border-b border-dashed print:hidden font-sans">
              <span className="font-bold text-gray-500 text-xs">Aperçu Facture / Ticket</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-indigo-655 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setPrintPreviewOrder(null)}
                  className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* REAL PRINTER TICKET CONTAINER */}
            <div className="space-y-4 pt-4 text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider">STOCK MANAGER</h3>
                <p className="text-3xs text-gray-450 leading-relaxed">
                  Zone d'Activité Amara, Cheraga, Alger<br />
                  Tél: 0550 00 11 22 / RC: 16/00-9876B
                </p>
              </div>

              <div className="border-t border-dashed pt-3 text-left space-y-1 text-2xs">
                <p><strong>N° Commande:</strong> {printPreviewOrder.orderNumber}</p>
                <p><strong>Date:</strong> {new Date(printPreviewOrder.date).toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Client:</strong> {printPreviewOrder.customerName === t.anonymous ? 'Client de Passage' : printPreviewOrder.customerName}</p>
                <p><strong>Reglement:</strong> {printPreviewOrder.paymentStatus === 'paid' ? 'PAYÉ (Espèces)' : 'NON PAYÉ (Crédit)'}</p>
              </div>

              {/* Items Table Receipts */}
              <table className="w-full text-left text-2xs border-y border-dashed py-2">
                <thead>
                  <tr className="font-bold">
                    <th className="pb-1">DESIGNATION</th>
                    <th className="pb-1 text-center">QTÉ</th>
                    <th className="pb-1 text-right">MONTANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900/40">
                  {printPreviewOrder.items.map((it, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1">
                        <div>{it.name}</div>
                        <div className="text-3xs text-gray-450">{it.sellingPrice.toLocaleString()} DA / {it.unitType}</div>
                      </td>
                      <td className="py-1 text-center font-bold">
                        {it.quantity}
                      </td>
                      <td className="py-1 text-right font-bold">
                        {(it.quantity * it.sellingPrice).toLocaleString()} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal metrics bottom code */}
              <div className="space-y-1.5 text-right font-semibold text-2xs pt-1">
                <div className="flex justify-between font-black text-xs pt-1 border-t">
                  <span>NET A PAYER :</span>
                  <span>{printPreviewOrder.totalPrice.toLocaleString()} DA</span>
                </div>
              </div>

              {/* Invoice footnotes receipt footer */}
              <div className="pt-4 border-t border-dashed space-y-1">
                <p className="text-2xs font-bold italic">Merci pour votre confiance ! / شكراً لثقتكم</p>
                <p className="text-3xs text-gray-400">Logiciel de gestion de Stock - Généré localement</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

