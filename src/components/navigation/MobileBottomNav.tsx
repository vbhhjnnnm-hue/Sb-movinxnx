/**
 * Mobile-First Bottom Navigation Bar (Optimized for Android & iPhone)
 */

import React from 'react';
import { Home, Film, Search, Bookmark, User as UserIcon } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  watchlistCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  watchlistCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === 'home' ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('movies')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === 'movies' ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Film className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Movies</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Search className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === 'watchlist' ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">My List</span>
          {watchlistCount > 0 && (
            <span className="absolute top-0.5 right-2 h-4 w-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
              {watchlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('user-settings')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === 'user-settings' ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserIcon className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
