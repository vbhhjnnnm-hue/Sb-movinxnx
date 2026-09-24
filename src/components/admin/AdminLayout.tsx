/**
 * Admin Panel Protected Layout
 * Strictly restricts access to role === ADMIN.
 * Shows 403 Forbidden with security banner if unauthorized.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Film,
  Users,
  Megaphone,
  Sliders,
  ShieldAlert,
  ClipboardList,
  Tags,
  ArrowLeft,
  Menu,
  X,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type AdminTab =
  | 'dashboard'
  | 'movies'
  | 'users'
  | 'genres'
  | 'ads'
  | 'settings'
  | 'security'
  | 'audit-logs';

interface AdminLayoutProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  onExitAdmin,
  children,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 403 FORBIDDEN GATE: If not logged in or not admin, show clean 403 page
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0d0f17] border border-rose-500/30 p-8 text-center shadow-2xl shadow-rose-950/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <span className="inline-block text-[11px] font-bold tracking-widest text-rose-400 uppercase bg-rose-500/10 px-3 py-1 rounded-full mb-3">
            403 Forbidden Access
          </span>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            Restricted Admin Area
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            You are not authorized to view the administrative studio. This area is reserved strictly for authenticated system administrators with verified server roles.
          </p>
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to User Website</span>
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies', label: 'Movies & TMDB', icon: Film },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'genres', label: 'Genres', icon: Tags },
    { id: 'ads', label: 'Advertisements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col md:flex-row text-zinc-100 antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#090b10]">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-xs">
            OP
          </div>
          <span className="font-serif font-bold text-sm text-zinc-100">Admin Studio</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExitAdmin}
            className="p-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-300"
          >
            Exit
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#090b10] border-r border-zinc-800/80 p-5 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm tracking-wider text-white">
                  OBSIDIAN
                </h2>
                <p className="text-[10px] tracking-widest font-semibold text-amber-400 uppercase">
                  Admin Studio
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/15'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin User Footer Card */}
        <div className="pt-6 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <img
              src={
                user.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              }
              alt=""
              className="h-8 w-8 rounded-full object-cover border border-amber-500/30"
            />
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-bold text-zinc-100 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExitAdmin}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>User Site</span>
            </button>
            <button
              onClick={async () => {
                await logout();
                onExitAdmin();
              }}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
