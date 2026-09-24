/**
 * Obsidian Cinema - Header Navigation Bar
 */

import React, { useState } from 'react';
import { Film, Search, Bookmark, User as UserIcon, Shield, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  watchlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenSearch,
  watchlistCount,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/60 bg-[#08090d]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40 group-hover:scale-105 transition-transform duration-200">
              <Film className="h-5 w-5 text-black" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#08090d]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-wider font-extrabold text-lg bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-200 bg-clip-text text-transparent">
                OBSIDIAN
              </span>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-amber-500/90 uppercase -mt-1">
                CINEMA
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'text-amber-400 bg-zinc-800/80 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'movies'
                  ? 'text-amber-400 bg-zinc-800/80 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'watchlist'
                  ? 'text-amber-400 bg-zinc-800/80 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>My List</span>
              {watchlistCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 rounded-full bg-zinc-900/90 border border-zinc-700/60 px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            title="Search catalog"
          >
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Search movies...</span>
            <kbd className="hidden lg:inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
              /
            </kbd>
          </button>

          {/* Admin Studio Quick Switch (Visible Only for ADMIN role) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all shadow-md ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-black shadow-amber-500/20'
                  : 'bg-zinc-900 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Studio</span>
            </button>
          )}

          {/* User Auth Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 rounded-full p-1 hover:ring-2 hover:ring-amber-500/50 transition-all focus:outline-none"
              >
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-zinc-700"
                />
                <span className="hidden xl:inline text-xs font-medium text-zinc-200">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-[#0d0f15] p-2 text-zinc-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-zinc-800/80 px-3 py-2.5">
                      <p className="text-sm font-semibold text-zinc-100">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      <span className="mt-1.5 inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-500/20">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('user-settings');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-zinc-400" />
                        <span>User Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('watchlist');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-zinc-400" />
                        <span>My Watchlist ({watchlistCount})</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-amber-400" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zinc-800/80 pt-1">
                      <button
                        onClick={async () => {
                          await logout();
                          setUserDropdownOpen(false);
                          setActiveTab('home');
                        }}
                        className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-semibold text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0a0c12] px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'home' ? 'text-amber-400 bg-zinc-800/80' : 'text-zinc-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('movies');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'movies' ? 'text-amber-400 bg-zinc-800/80' : 'text-zinc-300'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setActiveTab('watchlist');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'watchlist' ? 'text-amber-400 bg-zinc-800/80' : 'text-zinc-300'
            }`}
          >
            My List ({watchlistCount})
          </button>
          {user ? (
            <button
              onClick={() => {
                setActiveTab('user-settings');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-zinc-300"
            >
              User Settings
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-amber-400"
            >
              Sign In / Register
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30"
            >
              Admin Studio Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
