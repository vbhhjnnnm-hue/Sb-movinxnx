/**
 * Obsidian Cinema - Root Application Component
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/navigation/Header.tsx';
import { MobileBottomNav } from './components/navigation/MobileBottomNav.tsx';
import { Footer } from './components/navigation/Footer.tsx';
import { HomeView } from './components/home/HomeView.tsx';
import { MoviesView } from './components/movies/MoviesView.tsx';
import { WatchlistView } from './components/movies/WatchlistView.tsx';
import { UserSettingsView } from './components/user/UserSettingsView.tsx';
import { MoviePlayerModal } from './components/movies/MoviePlayerModal.tsx';
import { SearchModal } from './components/movies/SearchModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

// Admin Subcomponents
import { AdminLayout, AdminTab } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminMovies } from './components/admin/AdminMovies.tsx';
import { AdminUsers } from './components/admin/AdminUsers.tsx';
import { AdminGenres } from './components/admin/AdminGenres.tsx';
import { AdminAds } from './components/admin/AdminAds.tsx';
import { AdminSettings } from './components/admin/AdminSettings.tsx';
import { AdminSecurity } from './components/admin/AdminSecurity.tsx';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs.tsx';

import { Movie, WatchlistItem, WatchHistoryItem, AdSettings, SystemSettings } from './types/index.ts';
import { api } from './lib/api.ts';

function MainApp() {
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'watchlist' | 'user-settings' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Core Data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  // Modals
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Detect URL parameter or path for /admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setActiveTab('admin');
    }
  }, []);

  // Fetch Public Catalog & Settings
  const refreshCatalog = async () => {
    try {
      const [moviesRes, adsRes, sysRes] = await Promise.all([
        api.movies.list(),
        api.settings.getAds().catch(() => null),
        api.settings.getSystem().catch(() => null),
      ]);
      setMovies(moviesRes.movies);
      if (adsRes) setAdSettings(adsRes);
      if (sysRes) setSystemSettings(sysRes);
    } catch (e) {
      console.error('Failed to load initial catalog:', e);
    }
  };

  // Fetch User-Specific Data when authenticated
  const refreshUserData = async () => {
    if (!user) {
      setWatchlist([]);
      setHistory([]);
      return;
    }
    try {
      const [wlRes, histRes] = await Promise.all([
        api.user.getWatchlist().catch(() => ({ watchlist: [] })),
        api.user.getHistory().catch(() => ({ history: [] })),
      ]);
      setWatchlist(wlRes.watchlist);
      setHistory(histRes.history);
    } catch (_) {}
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [user]);

  // Keyboard shortcut listener for quick search ('/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && activeTab !== 'admin' && !isSearchOpen && !isAuthOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isSearchOpen, isAuthOpen]);

  // Watchlist Actions
  const handleToggleWatchlist = async (movie: Movie) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const inList = watchlist.some((item) => item.movieId === movie.id);
    try {
      if (inList) {
        await api.user.removeFromWatchlist(movie.id);
        setWatchlist((prev) => prev.filter((item) => item.movieId !== movie.id));
      } else {
        const res = await api.user.addToWatchlist(movie.id);
        setWatchlist((prev) => [res.item, ...prev]);
      }
    } catch (err: any) {
      alert(err.message || 'Could not update watchlist.');
    }
  };

  const handleRemoveFromWatchlist = async (movieId: string) => {
    try {
      await api.user.removeFromWatchlist(movieId);
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err: any) {
      alert(err.message || 'Could not remove movie.');
    }
  };

  const watchlistIds = watchlist.map((item) => item.movieId);

  // If Maintenance Mode is active and user is not admin
  if (systemSettings?.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
            !
          </div>
          <h1 className="text-2xl font-serif font-bold">Maintenance in Progress</h1>
          <p className="text-xs text-zinc-400">
            Obsidian Cinema is currently undergoing scheduled platform upgrades. Please check back shortly.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="text-xs text-amber-400 underline"
          >
            Staff Administrator Access
          </button>
        </div>
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as any);
  };

  // 1. ADMIN AREA (COMPLETELY SEPARATE)
  if (activeTab === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        setCurrentTab={setAdminTab}
        onExitAdmin={() => setActiveTab('home')}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => setAdminTab(tab)}
            onOpenAddMovie={() => setAdminTab('movies')}
          />
        )}
        {adminTab === 'movies' && (
          <AdminMovies onOpenPlayerPreview={(m) => setPlayingMovie(m)} />
        )}
        {adminTab === 'users' && <AdminUsers />}
        {adminTab === 'genres' && <AdminGenres />}
        {adminTab === 'ads' && <AdminAds />}
        {adminTab === 'settings' && <AdminSettings />}
        {adminTab === 'security' && <AdminSecurity />}
        {adminTab === 'audit-logs' && <AdminAuditLogs />}
      </AdminLayout>
    );
  }

  // 2. USER WEBSITE AREA
  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'home' && (
          <HomeView
            featuredMovie={movies.find((m) => m.featured) || movies[0]}
            movies={movies}
            continueWatching={history}
            watchlistIds={watchlistIds}
            onSelectMovie={(m) => setPlayingMovie(m)}
            onPlayMovie={(m) => setPlayingMovie(m)}
            onToggleWatchlist={handleToggleWatchlist}
            onViewAllMovies={() => setActiveTab('movies')}
            adSettings={adSettings}
          />
        )}

        {activeTab === 'movies' && (
          <MoviesView
            movies={movies}
            watchlistIds={watchlistIds}
            onSelectMovie={(m) => setPlayingMovie(m)}
            onPlayMovie={(m) => setPlayingMovie(m)}
            onToggleWatchlist={handleToggleWatchlist}
            adSettings={adSettings}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onSelectMovie={(m) => setPlayingMovie(m)}
            onPlayMovie={(m) => setPlayingMovie(m)}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onExploreMovies={() => setActiveTab('movies')}
          />
        )}

        {activeTab === 'user-settings' && (
          <UserSettingsView
            onPlayMovie={(m) => setPlayingMovie(m)}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Mobile-First Bottom Nav Bar for iPhone / Android */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} adSettings={adSettings} />

      {/* Overlays / Modals */}
      <MoviePlayerModal
        movie={playingMovie}
        onClose={() => {
          setPlayingMovie(null);
          refreshUserData();
        }}
        inWatchlist={playingMovie ? watchlistIds.includes(playingMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        movies={movies}
        onSelectMovie={(m) => setPlayingMovie(m)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          refreshUserData();
          refreshCatalog();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
