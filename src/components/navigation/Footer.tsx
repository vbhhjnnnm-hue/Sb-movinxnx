/**
 * Obsidian Cinema - Footer Component
 */

import React from 'react';
import { Film, Shield, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdSenseBanner } from '../ads/AdSenseBanner.tsx';
import { AdSettings } from '../../types/index.ts';

interface FooterProps {
  onNavigate: (tab: string) => void;
  adSettings?: AdSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, adSettings }) => {
  const { isAdmin } = useAuth();

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-[#06070a] pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-zinc-400 text-xs">
      {/* Optional Policy-Compliant Footer Ad Banner */}
      {adSettings?.enabled && adSettings.footerSlot && (
        <AdSenseBanner
          placement="footer"
          enabled={adSettings.enabled}
          publisherId={adSettings.publisherId}
          slotId={adSettings.footerSlot}
          className="mb-8"
        />
      )}

      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Attribution */}
        <div className="space-y-3 max-w-md">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black">
              <Film className="h-4 w-4" />
            </div>
            <span className="font-serif font-extrabold text-base tracking-wider text-white">
              OBSIDIAN CINEMA
            </span>
          </div>
          <p className="text-zinc-500 text-[11px] leading-relaxed">
            High-fidelity dark cinematic streaming platform. Movie information and posters sourced via TMDB API. Authorized open video streams for demonstration. Google AdSense policy compliant.
          </p>
          <p className="text-[10px] text-zinc-600">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-8 text-xs font-medium">
          <div className="space-y-2">
            <h4 className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('movies')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Movies Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('watchlist')}
                  className="hover:text-amber-400 transition-colors"
                >
                  My List
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Viewer
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('user-settings')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Account Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('user-settings')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Stream Preferences
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="text-amber-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Shield className="h-3 w-3" />
                    <span>Admin Studio</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-zinc-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-3">
        <p>&copy; {new Date().getFullYear()} Obsidian Cinema. All rights reserved.</p>
        <p className="flex items-center space-x-1">
          <span>Engineered for dark cinematic immersion</span>
        </p>
      </div>
    </footer>
  );
};
