/**
 * Admin Panel - Overview Dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  Film,
  Users,
  Eye,
  Bookmark,
  CheckCircle,
  Activity,
  Plus,
  RefreshCw,
  Server,
  Key,
} from 'lucide-react';
import { AdminDashboardStats, Movie, User } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface AdminDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenAddMovie: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenAddMovie,
}) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getDashboard();
      setStats(data.stats);
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Studio Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry, movie catalog status, and active system operations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenAddMovie}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Movie (TMDB)</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Movies */}
        <div
          onClick={() => onNavigateTab('movies')}
          className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 hover:border-amber-500/40 cursor-pointer transition-all shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Catalog Titles
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Film className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalMovies ?? '--'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {stats?.publishedMovies ?? 0} published
            </span>
          </div>
        </div>

        {/* Total Registered Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 hover:border-amber-500/40 cursor-pointer transition-all shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalUsers ?? '--'}
            </span>
            <span className="text-xs text-zinc-400">
              {stats?.adminUsers ?? 1} staff admins
            </span>
          </div>
        </div>

        {/* Stream Sessions */}
        <div className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Playback Streams
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalViews ?? '--'}
            </span>
            <span className="text-xs text-zinc-400">active playback sessions</span>
          </div>
        </div>

        {/* Watchlist Saves */}
        <div className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Bookmarks / List
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bookmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalWatchlistItems ?? '--'}
            </span>
            <span className="text-xs text-zinc-400">saved by viewers</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Movies & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Movies */}
        <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
              <Film className="h-4 w-4 text-amber-400" />
              <span>Recently Added Movies</span>
            </h3>
            <button
              onClick={() => onNavigateTab('movies')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              View All &rarr;
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {stats?.recentlyAddedMovies?.map((m: Movie) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="h-12 w-9 rounded-md object-cover bg-zinc-950"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{m.title}</h4>
                    <p className="text-[11px] text-zinc-400">
                      TMDB #{m.tmdbId} &bull; {m.genre || 'Cinema'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.published
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {m.published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span>Recently Registered Users</span>
            </h3>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Manage Users &rarr;
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {stats?.recentlyRegisteredUsers?.map((u: User) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      u.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'
                    }
                    alt={u.name}
                    className="h-9 w-9 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{u.name}</h4>
                    <p className="text-[11px] text-zinc-400">{u.email}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    u.role === 'ADMIN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Status Matrix */}
      <div className="p-6 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>System Health & Service Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span>Database Engine</span>
            </div>
            <p className="text-xs font-bold text-zinc-100">
              {stats?.systemStatus?.database || 'Operational (Firestore Cloud Active)'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>TMDB Server Gateway</span>
            </div>
            <p className="text-xs font-bold text-zinc-100">
              {stats?.systemStatus?.tmdbConfigured ? 'Direct API Active' : 'Curated Precision Library'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
              <span>Google AdSense Policy</span>
            </div>
            <p className="text-xs font-bold text-zinc-100">
              {stats?.systemStatus?.adsenseEnabled ? 'Monetization Active' : 'Disabled'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Activity className="h-3.5 w-3.5 text-purple-400" />
              <span>Server Uptime</span>
            </div>
            <p className="text-xs font-bold text-zinc-100 font-mono">
              {stats?.systemStatus?.serverUptime ? `${stats.systemStatus.serverUptime}s online` : 'Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
