/**
 * Admin Panel - Global System & TMDB Gateway Settings
 * Protected strictly for administrators
 */

import React, { useState, useEffect } from 'react';
import { Sliders, Key, Shield, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';
import { SystemSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminSettings: React.FC = () => {
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [tmdbInfo, setTmdbInfo] = useState<{ isConfigured: boolean; maskedKey: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [websiteName, setWebsiteName] = useState('Obsidian Cinema');
  const [logoText, setLogoText] = useState('OBSIDIAN');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    api.admin.getSettings().then((res) => {
      setSystem(res.settings.system);
      setTmdbInfo(res.settings.tmdb);
      setWebsiteName(res.settings.system.websiteName);
      setLogoText(res.settings.system.logoText);
      setMaintenanceMode(res.settings.system.maintenanceMode);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await api.admin.updateSettings({
        system: {
          websiteName: websiteName.trim(),
          logoText: logoText.trim(),
          maintenanceMode,
        },
      });
      setSystem(res.system);
      setSuccessMsg('System branding & gateway settings saved.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
          System & TMDB Configuration
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Server-side API status, platform branding, and maintenance operational state
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TMDB Gateway Status Card */}
      <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">TMDB Server Ingestion Gateway</h3>
            <p className="text-xs text-zinc-400">
              API key securely isolated in server environment (never exposed to browser JavaScript)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Gateway Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                tmdbInfo?.isConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {tmdbInfo?.isConfigured ? 'LIVE TMDB API CONNECTED' : 'CURATED HIGH-FIDELITY PREVIEW LIBRARY'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Masked Server Secret:</span>
            <span className="font-mono text-zinc-300">{tmdbInfo?.maskedKey || '••••••••'}</span>
          </div>
        </div>
      </div>

      {/* Website Branding & Maintenance Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 space-y-5">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800/80 pb-3">
            Platform Branding & Operations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Header Logo Text
              </label>
              <input
                type="text"
                required
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0 h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-zinc-200">
                  Enable Maintenance Mode
                </span>
                <p className="text-[11px] text-zinc-500">
                  When enabled, non-admin visitors see a maintenance screen
                </p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save System Settings'}
        </button>
      </form>
    </div>
  );
};
