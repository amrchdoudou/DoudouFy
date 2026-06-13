import { useState } from 'react';
import { Transaction, Language } from '../types';
import { translations } from '../i18n';
import { History, TrendingUp, TrendingDown, RefreshCcw, ClipboardList } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  language: Language;
}

export default function TransactionHistory({ transactions, language }: TransactionHistoryProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter((tr) => {
    if (filterType === 'all') return true;
    return tr.type === filterType;
  });

  // Calculate sum of transactions
  const totalInflow = transactions
    .filter((tr) => tr.amount > 0)
    .reduce((sum, tr) => sum + tr.amount, 0);
  const totalOutflow = transactions
    .filter((tr) => tr.amount < 0)
    .reduce((sum, tr) => sum + Math.abs(tr.amount), 0);
  const totalProfitSum = transactions.reduce((sum, tr) => sum + tr.profit, 0);

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <History className="w-6 h-6 text-amber-500" />
          {t.transactions}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Historique des ventes, des coûts d'acquisition et de la rentabilité réelle
        </p>
      </div>

      {/* Mini financial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-medium">Flux Entrants (Recettes)</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-sans">
              +{totalInflow.toLocaleString()} DA
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-500">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-medium font-sans">Flux Sortants (Achats/Dépenses)</p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-sans">
              -{totalOutflow.toLocaleString()} DA
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-medium font-sans">Bénéfice Net Cash</p>
            <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-sans">
              +{totalProfitSum.toLocaleString()} DA
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-gray-100 dark:border-gray-700 font-sans">
        <button
          onClick={() => setFilterType('all')}
          id="btn-filter-trans-all"
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
            filterType === 'all'
              ? 'bg-gray-900 text-white dark:bg-gray-105'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {t.all}
        </button>
        <button
          onClick={() => setFilterType('sale')}
          id="btn-filter-trans-sale"
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
            filterType === 'sale'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Ventes
        </button>
        <button
          onClick={() => setFilterType('purchase')}
          id="btn-filter-trans-purchase"
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
            filterType === 'purchase'
              ? 'bg-rose-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Achats Grossistes
        </button>
        <button
          onClick={() => setFilterType('stock_adjustment')}
          id="btn-filter-trans-adjust"
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
            filterType === 'stock_adjustment'
              ? 'bg-amber-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Ajustements Stock
        </button>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 text-center py-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune transaction trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tr) => {
            const isIncome = tr.amount >= 0;

            let iconColor = 'text-emerald-505 bg-emerald-50 dark:bg-emerald-950/20';
            let icon = <TrendingUp className="w-5 h-5 text-emerald-600" />;

            if (tr.type === 'purchase') {
              iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/20';
              icon = <TrendingDown className="w-5 h-5 text-rose-500" />;
            } else if (tr.type === 'stock_adjustment') {
              iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
              icon = <RefreshCcw className="w-5 h-5 text-amber-500" />;
            } else if (tr.type === 'refund') {
              iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
              icon = <RefreshCcw className="w-5 h-5 text-blue-500" />;
            }

            return (
              <div
                key={tr.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-3xs hover:border-gray-200 dark:hover:border-gray-650 transition-all font-sans"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-150">
                      {tr.description}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tr.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-650'}`}>
                    {isIncome ? '+' : ''}
                    {tr.amount.toLocaleString()} DA
                  </p>
                  {tr.profit > 0 && (
                    <p className="text-2xs text-indigo-505 font-mono">
                      Prof: +{tr.profit.toLocaleString()} DA
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
