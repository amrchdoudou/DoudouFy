import { useState, FormEvent } from 'react';
import { Customer, Language } from '../types';
import { translations } from '../i18n';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, MapPin, Users } from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  language: Language;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomerManager({
  customers,
  language,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerManagerProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setEditingCustomer(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setShowModal(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    if (editingCustomer) {
      onUpdateCustomer({ ...data, id: editingCustomer.id });
    } else {
      onAddCustomer(data);
    }
    setShowModal(false);
    resetForm();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            {t.customers} ({customers.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérer la clientèle pour attribuer des commandes personnalisées
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          id="btn-add-cust"
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
        >
          <UserPlus className="w-5 h-5" />
          {t.addCustomer}
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            id="search-cust-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className={`w-full py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>
      </div>

      {/* Customers List Card Layout */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 text-center py-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t.noMatchingCustomers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              id={`customer-card-${c.id}`}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-150 dark:border-gray-750 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-md uppercase">
                    {c.name.slice(0, 2)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      id={`edit-cust-btn-${c.id}`}
                      className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                      title={t.editCustomer}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (deleteConfirmId === c.id) {
                          onDeleteCustomer(c.id);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(c.id);
                          setTimeout(() => setDeleteConfirmId(null), 4000);
                        }
                      }}
                      id={`delete-cust-btn-${c.id}`}
                      className={`w-12 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${
                        deleteConfirmId === c.id
                          ? 'bg-red-650 text-white animate-pulse'
                          : 'bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-rose-950/50'
                      }`}
                      title={deleteConfirmId === c.id ? "Confirmer ?" : t.deleteCustomer}
                    >
                      {deleteConfirmId === c.id ? "Sûr?" : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight uppercase">
                    {c.name}
                  </h3>
                </div>

                <div className="space-y-2 pt-2 text-sm text-gray-600 dark:text-gray-400">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 max-w-full overflow-hidden text-ellipsis">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Customer modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingCustomer ? t.editCustomer : t.addCustomer}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-indigo-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  id="cust-name-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salim Boumedienne"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.phone}
                </label>
                <input
                  type="text"
                  id="cust-phone-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0550 11 22 33"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.email}
                </label>
                <input
                  type="email"
                  id="cust-email-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@gmail.com"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  {t.address}
                </label>
                <textarea
                  id="cust-address-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Bab Ezzouar, Alger"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

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
                  id="cust-submit-btn"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm"
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
