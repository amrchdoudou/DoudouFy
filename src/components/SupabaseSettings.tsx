import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { Container, Database, FileUp, FileDown, Copy, Check, Trash2, HelpCircle, Wifi, WifiOff, Link } from 'lucide-react';

interface SupabaseSettingsProps {
  language: Language;
  onImportData: (dataJson: string) => boolean;
  onExportData: () => string;
  onClearAllData: () => void;
  supabaseUrl: string;
  supabaseKey: string;
  onSaveSupabaseConfig: (url: string, key: string) => void;
  onDisconnectSupabase: () => void;
  isSupabaseConnected: boolean;
}

export default function SupabaseSettings({
  language,
  onImportData,
  onExportData,
  onClearAllData,
  supabaseUrl,
  supabaseKey,
  onSaveSupabaseConfig,
  onDisconnectSupabase,
  isSupabaseConnected,
}: SupabaseSettingsProps) {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<null | 'success' | 'error'>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Supabase dynamic state inputs
  const [localUrl, setLocalUrl] = useState(supabaseUrl);
  const [localKey, setLocalKey] = useState(supabaseKey);
  const [saveStatus, setSaveStatus] = useState<null | 'saved'>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSupabaseConfig(localUrl.trim(), localKey.trim());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDisconnect = () => {
    onDisconnectSupabase();
    setLocalUrl('');
    setLocalKey('');
  };

  const sqlSchema = `-- SQL SCHEMA FOR SUPABASE / POSTGRESQL
-- Copy and paste this code inside the Supabase SQL Editor to initialize tables!

-- 1. Create PRODUCTS table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit_type VARCHAR(50) NOT NULL, -- 'kg', 'l', 'g', 'box', 'carton', 'unit'
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  supplier VARCHAR(255),
  min_stock_alert NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create CUSTOMERS table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create ORDERS table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id VARCHAR(255) NOT NULL, -- can be uuid string or 'anonymous'
  customer_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ordered products/prices
  total_price NUMERIC(12, 2) NOT NULL,
  total_purchase_cost NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'confirmed', 'delivery', 'cancelled'
  payment_status VARCHAR(50) NOT NULL, -- 'paid', 'unpaid'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_date DATE DEFAULT CURRENT_DATE
);

-- 4. Create TRANSACTIONS history log TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ DEFAULT NOW(),
  type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'stock_adjustment'
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = onImportData(importText);
    if (success) {
      setImportStatus('success');
      setImportText('');
    } else {
      setImportStatus('error');
    }
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = onExportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-600" />
          {t.settings}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t.supabaseIntegration} & Configuration
        </p>
      </div>

      {/* Intro alert card */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-4 font-sans">
        <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
            Prêt pour le déploiement Cloud (Vercel, Supabase)
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
            {t.supabaseInstructions}
          </p>
        </div>
      </div>

      {/* Dynamic Supabase Live Cloud Integration Block */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isSupabaseConnected ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>
              {isSupabaseConnected ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-950 dark:text-white flex items-center gap-2">
                Base de données Supabase Cloud
                {isSupabaseConnected ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">LIVE ACTIF</span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">LOCAL STANDALONE</span>
                )}
              </h3>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">
                {isSupabaseConnected ? "Synchronisé directement avec vos tables PostgreSQL en ligne." : "Vos données sont sauvegardées en cache local (hors-ligne). Connectez Supabase ci-dessous."}
              </p>
            </div>
          </div>

          {isSupabaseConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Déconnecter
            </button>
          )}
        </div>

        {!isSupabaseConnected ? (
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block">Supabase Project URL</label>
              <input
                type="text"
                required
                placeholder="https://yourprojectid.supabase.co"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block">Supabase Anon Public KEY</label>
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-gray-400 leading-snug">
                L'application effectuera des requêtes sécurisées directement vers vos tables de base de données.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Activer la Connexion Cloud & Sync
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-55 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-400 space-y-1.5 leading-relaxed font-sans">
            <p className="font-bold">✓ Connexion active !</p>
            <p>Toutes vos actions sur les stocks, clients et commandes se répercutent en temps réel sur votre base Supabase.</p>
            <p className="text-[10px] font-mono text-gray-500">Project Endpoint: {supabaseUrl}</p>
          </div>
        )}

        {saveStatus === 'saved' && (
          <p className="text-xs text-emerald-600 font-semibold text-center animate-pulse pt-2">
            Configuration sauvegardée ! Initialisation de la connexion...
          </p>
        )}
      </div>

      {/* SQL block code */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            schema.sql
          </span>
          <button
            onClick={handleCopySql}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-250 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600">{t.sqlCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.copySql}</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto max-h-64">
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl leading-relaxed">
            {sqlSchema}
          </pre>
        </div>
      </div>

      {/* Backup and import panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        {/* Export Area */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Sauvegarde et Export</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Téléchargez l'intégralité de vos stocks actuels, fournisseurs, clients et historique des transactions dans un fichier JSON pour des sauvegardes régulières.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              {t.exportJson}
            </button>
          </div>
        </div>

        {/* Import Area */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Restauration et Import</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Collez le contenu d'un fichier de sauvegarde JSON précédemment exporté pour écraser et restaurer instantanément votre stock et vos transactions.
          </p>
          <div className="space-y-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Collez le JSON ici {"products": [], "orders": [], ...}'
              rows={2}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-mono"
            />
            <button
              onClick={handleImport}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileUp className="w-4 h-4" />
              {t.importJson}
            </button>

            {importStatus === 'success' && (
              <p className="text-xs font-semibold text-emerald-650 text-center animate-pulse">
                Données restaurées avec succès ! L'application se rafraîchit.
              </p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs font-semibold text-rose-650 text-center animate-pulse">
                Erreur de format JSON ! Veuillez vérifier le contenu copié.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 dark:bg-rose-950/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 font-sans space-y-3">
        <h4 className="font-bold text-rose-800 dark:text-rose-400">Zone de Danger</h4>
        <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
          Supprime l'intégralité du cache de la boutique. N'effectuez cette action que si vous souhaitez effacer les données de démonstration et lancer un inventaire de zéro.
        </p>
        <button
          onClick={() => {
            if (confirmClear) {
              onClearAllData();
              setConfirmClear(false);
            } else {
              setConfirmClear(true);
              setTimeout(() => setConfirmClear(false), 5000);
            }
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs ${
            confirmClear
              ? 'bg-red-700 animate-pulse text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          {confirmClear ? "Confirmer la suppression totale ?" : t.clearData}
        </button>
      </div>
    </div>
  );
}
