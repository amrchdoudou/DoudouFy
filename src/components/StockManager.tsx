import { useState, FormEvent } from 'react';
import { Product, UnitType, Language } from '../types';
import { translations } from '../i18n';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, AlertTriangle, AlertCircle, ShoppingBag, Truck } from 'lucide-react';

interface StockManagerProps {
  products: Product[];
  language: Language;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function StockManager({
  products,
  language,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: StockManagerProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [unitType, setUnitType] = useState<UnitType>('unit');
  const [quantity, setQuantity] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [minStockAlert, setMinStockAlert] = useState(5);

  const resetForm = () => {
    setName('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setUnitType('unit');
    setQuantity(0);
    setSupplier('');
    setMinStockAlert(5);
    setEditingProduct(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setUnitType(p.unitType);
    setQuantity(p.quantity);
    setSupplier(p.supplier);
    setMinStockAlert(p.minStockAlert);
    setShowModal(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      unitType,
      quantity: Number(quantity),
      supplier: supplier.trim() || t.anonymous,
      minStockAlert: Number(minStockAlert),
    };

    if (editingProduct) {
      onUpdateProduct({ ...data, id: editingProduct.id });
    } else {
      onAddProduct(data);
    }
    setShowModal(false);
    resetForm();
  };

  const handleQuickAdjustQty = (p: Product, change: number) => {
    const newQty = Math.max(0, p.quantity + change);
    onUpdateProduct({ ...p, quantity: newQty });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const isLow = p.quantity <= p.minStockAlert;
    return filterLowStock ? matchesSearch && isLow : matchesSearch;
  });

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            {t.stock} ({products.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t.totalProducts}: {products.length}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          id="btn-add-product"
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" />
          {t.addProduct}
        </button>
      </div>

      {/* Search, filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 items-stretch justify-between">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className={`w-full py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-sm ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            id="btn-filter-low"
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl border transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
              filterLowStock
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400'
                : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.lowStockAlerts}</span>
            {products.filter((p) => p.quantity <= p.minStockAlert).length > 0 && (
              <span className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-xs px-2 py-0.5 rounded-full font-bold">
                {products.filter((p) => p.quantity <= p.minStockAlert).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grid representation (Exceptional Mobile experience with direct +/- editing keys) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 text-center py-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t.noMatchingProducts}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.quantity <= p.minStockAlert;
            return (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className={`flex flex-col justify-between bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-xs transition-all hover:shadow-md ${
                  isLow
                    ? 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/10 dark:from-gray-800 dark:to-rose-950/5'
                    : 'border-gray-150 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-md text-xs font-mono font-medium">
                      {p.supplier}
                    </span>
                    {isLow && (
                      <span className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs px-2.5 py-0.5 rounded-md font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t.lowStockAlert}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug">
                    {p.name}
                  </h3>

                  {/* Prices display */}
                  <div className="grid grid-cols-2 gap-4 mt-3 py-2 border-y border-gray-50 dark:border-gray-700/50">
                    <div>
                      <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.purchasePrice}</p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{p.purchasePrice.toLocaleString()} DA</p>
                    </div>
                    <div>
                      <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.sellingPrice}</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.sellingPrice.toLocaleString()} DA</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Optimized Direct Tapper controls */}
                <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-2xs text-gray-400 uppercase tracking-wider">{t.currentQty}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {p.quantity} <span className="text-xs font-normal text-gray-500">({t[p.unitType]})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickAdjustQty(p, -1)}
                      id={`quant-sub-${p.id}`}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 rounded-lg text-sm font-bold transition-colors"
                      title="-1 Quantity"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleQuickAdjustQty(p, 1)}
                      id={`quant-add-${p.id}`}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/40 rounded-lg text-sm font-bold transition-colors"
                      title="+1 Quantity"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      id={`btn-edit-prod-${p.id}`}
                      className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition-colors ml-1"
                      title={t.editProduct}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (deleteConfirmId === p.id) {
                          onDeleteProduct(p.id);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(p.id);
                          setTimeout(() => setDeleteConfirmId(null), 4000);
                        }
                      }}
                      id={`btn-delete-prod-${p.id}`}
                      className={`w-12 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${
                        deleteConfirmId === p.id
                          ? 'bg-red-650 text-white animate-pulse'
                          : 'bg-rose-55 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100'
                      }`}
                      title={deleteConfirmId === p.id ? "Confirmer la suppression" : t.deleteProduct}
                    >
                      {deleteConfirmId === p.id ? "Supprimer?" : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingProduct ? t.editProduct : t.addProduct}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-emerald-200 font-bold text-lg p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.name} *
                </label>
                <input
                  type="text"
                  required
                  id="prod-name-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Café Lavazza"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Purchase price and selling price grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.purchasePrice} (DA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="prod-purchase-field"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.sellingPrice} (DA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="prod-selling-field"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.supplier}
                </label>
                <input
                  type="text"
                  id="prod-supplier-field"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Grossiste Algiers"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Stock and units grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.quantity} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="prod-qty-field"
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {t.unitType} *
                  </label>
                  <select
                    value={unitType}
                    id="prod-unittype-field"
                    onChange={(e) => setUnitType(e.target.value as UnitType)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="unit">{t.unit}</option>
                    <option value="kg">{t.kg}</option>
                    <option value="l">{t.l}</option>
                    <option value="g">{t.g}</option>
                    <option value="box">{t.box}</option>
                    <option value="carton">{t.carton}</option>
                  </select>
                </div>
              </div>

              {/* Min alert stock */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.minStockAlert}
                </label>
                <input
                  type="number"
                  min="0"
                  id="prod-alert-field"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700/60 font-sans">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 text-sm font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="prod-submit-btn"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
