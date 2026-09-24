/**
 * Admin Panel - Policy-Compliant Google AdSense Management
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import { AdSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminAds: React.FC = () => {
  const [ads, setAds] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [enabled, setEnabled] = useState(true);
  const [publisherId, setPublisherId] = useState('');
  const [homepageSlot, setHomepageSlot] = useState('');
  const [movieListingSlot, setMovieListingSlot] = useState('');
  const [movieDetailsSlot, setMovieDetailsSlot] = useState('');
  const [footerSlot, setFooterSlot] = useState('');

  useEffect(() => {
    api.admin.getSettings().then((res) => {
      const a = res.settings.ads;
      setAds(a);
      setEnabled(a.enabled);
      setPublisherId(a.publisherId);
      setHomepageSlot(a.homepageSlot || '');
      setMovieListingSlot(a.movieListingSlot || '');
      setMovieDetailsSlot(a.movieDetailsSlot || '');
      setFooterSlot(a.footerSlot || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await api.admin.updateSettings({
        ads: {
          enabled,
          publisherId: publisherId.trim(),
          homepageSlot: homepageSlot.trim(),
          movieListingSlot: movieListingSlot.trim(),
          movieDetailsSlot: movieDetailsSlot.trim(),
          footerSlot: footerSlot.trim(),
        },
      });
      setAds(res.ads);
      setSuccessMsg('Google AdSense placements updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update advertising settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
          Google AdSense Monetization
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Policy-compliant banner slots, publisher verification, and layout placement controls
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Policy Compliance Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
        <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Google AdSense Policy Standard</p>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            All advertising units are wrapped in explicit "Advertisement" headers with fixed dimension containers to prevent Cumulative Layout Shift (CLS) and accidental clicks. Deceptive navigation triggers or click aggregators are prohibited.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Switch & Publisher ID */}
        <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Global Ad Delivery Status</h3>
              <p className="text-xs text-zinc-400">Master enable or disable all ads site-wide</p>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="flex items-center space-x-2 text-xs font-semibold focus:outline-none"
            >
              {enabled ? (
                <>
                  <span className="text-emerald-400">Monetization Active</span>
                  <ToggleRight className="h-8 w-8 text-emerald-500" />
                </>
              ) : (
                <>
                  <span className="text-zinc-500">Disabled</span>
                  <ToggleLeft className="h-8 w-8 text-zinc-600" />
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              AdSense Publisher ID
            </label>
            <input
              type="text"
              required
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              placeholder="ca-pub-1234567890123456"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Your unique Google AdSense identifier (Format: ca-pub-XXXXXXXXXXXXXXXX)
            </p>
          </div>
        </div>

        {/* Individual Placement Slots */}
        <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 space-y-5">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800/80 pb-3">
            Configurable Ad Placement Slots
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Homepage Banner Slot ID
              </label>
              <input
                type="text"
                value={homepageSlot}
                onChange={(e) => setHomepageSlot(e.target.value)}
                placeholder="1122334455"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Shown between featured rows on homepage</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Movie Listing Slot ID
              </label>
              <input
                type="text"
                value={movieListingSlot}
                onChange={(e) => setMovieListingSlot(e.target.value)}
                placeholder="2233445566"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Integrated into the all-movies grid</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Movie Details Modal Slot ID
              </label>
              <input
                type="text"
                value={movieDetailsSlot}
                onChange={(e) => setMovieDetailsSlot(e.target.value)}
                placeholder="3344556677"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Shown alongside film synopsis</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Footer Banner Slot ID
              </label>
              <input
                type="text"
                value={footerSlot}
                onChange={(e) => setFooterSlot(e.target.value)}
                placeholder="4455667788"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Positioned directly above the website footer</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Ad Placements'}
        </button>
      </form>
    </div>
  );
};
