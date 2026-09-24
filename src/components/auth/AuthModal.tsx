/**
 * Auth Modal Component for Obsidian Cinema
 * Seamless sign in and registration with one-click demo credentials
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setMode('login');
    setEmail('admin@obsidiancinema.com');
    setPassword('ObsidianAdmin2026!');
    setError(null);
  };

  const fillViewerDemo = () => {
    setMode('login');
    setEmail('viewer@obsidiancinema.com');
    setPassword('UserPass123!');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0d0e16] border border-zinc-800 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
            {mode === 'login' ? 'Access Obsidian Cinema' : 'Join Obsidian Cinema'}
          </h3>
          <p className="text-xs text-zinc-400">
            {mode === 'login'
              ? 'Enter your credentials to access your watchlist & personal stream'
              : 'Create your viewer account to unlock high-fidelity streaming'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="mb-5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px] font-medium">Quick Demo:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold text-[11px] hover:bg-amber-500/25 transition-colors flex items-center space-x-1"
            >
              <Shield className="h-3 w-3" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={fillViewerDemo}
              className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium text-[11px] hover:bg-zinc-700 transition-colors"
            >
              Viewer Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Christopher Nolan"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Stream' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
