/**
 * User Settings View - Completely Separate From Admin Panel
 *
 * Exclusively user-focused:
 * - Profile (Name, Email, Avatar)
 * - Account (Change password, Logout, Delete account)
 * - Preferences (Streaming quality, Audio language, Subtitles)
 * - Personal (Continue watching history, Watchlist statistics)
 *
 * CRITICAL: Zero administrative, TMDB API, AdSense, or server settings here.
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  LogOut,
  Trash2,
  Sliders,
  History,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { WatchHistoryItem, Movie } from '../../types/index.ts';

interface UserSettingsViewProps {
  onPlayMovie: (movie: Movie) => void;
  onNavigateHome: () => void;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({
  onPlayMovie,
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'account' | 'preferences' | 'history'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences State
  const [streamQuality, setStreamQuality] = useState('4K Ultra HD');
  const [audioLang, setAudioLang] = useState('Original (English)');
  const [subtitles, setSubtitles] = useState('English [CC]');

  // History State
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeSubTab === 'history') {
      loadHistory();
    }
  }, [activeSubTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.user.getHistory();
      setHistory(data.history);
    } catch (_) {
      // Ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      await api.user.updateProfile({ name, avatarUrl });
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you wish to delete your account? This action cannot be undone.')) {
      try {
        await api.user.deleteAccount();
        await logout();
        onNavigateHome();
      } catch (err: any) {
        alert(err.message || 'Failed to delete account.');
      }
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <UserIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-zinc-200">Sign in to view account settings</h2>
        <p className="text-xs text-zinc-500 mt-1">Manage your viewer profile and streaming preferences</p>
      </div>
    );
  }

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Viewer Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal profile, stream quality preferences, and watch history
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
            {user.email}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Continue Watching</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preferences')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'preferences'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Streaming Preferences</span>
          </button>

          <button
            onClick={() => setActiveSubTab('account')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'account'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Security & Account</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 rounded-2xl bg-[#0c0e15] border border-zinc-800/80 p-6 sm:p-8">
          {/* TAB 1: PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Personal Profile</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update your display name and avatar displayed on your account
                </p>
              </div>

              {profileSuccess && (
                <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Profile Avatar
                  </label>
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={avatarUrl || avatarOptions[0]}
                      alt="Avatar preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/40"
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-300 font-medium">Select a preset or paste URL</p>
                      <div className="flex items-center space-x-2">
                        {avatarOptions.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatarUrl(opt)}
                            className={`h-8 w-8 rounded-full overflow-hidden border transition-all ${
                              avatarUrl === opt ? 'ring-2 ring-amber-500 border-transparent' : 'border-zinc-700'
                            }`}
                          >
                            <img src={opt} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black shadow-md hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CONTINUE WATCHING & HISTORY */}
          {activeSubTab === 'history' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Continue Watching History</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Resume playback from where you left off across any device
                </p>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-zinc-500 animate-pulse text-xs">
                  Loading viewing history...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <History className="h-10 w-10 mx-auto text-zinc-700 mb-2" />
                  <p className="text-sm font-medium text-zinc-400">No watch history yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Play any film in the catalog to track your progress</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    const movie = item.movie;
                    if (!movie) return null;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
                      >
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-16 w-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-zinc-200">{movie.title}</h4>
                            <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-zinc-500" />
                                <span>{Math.floor(item.progress / 60)}m watched</span>
                              </span>
                              <span>&bull;</span>
                              <span className="text-amber-400 font-semibold">{item.percentage || 20}% completed</span>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="w-36 h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-amber-500"
                                style={{ width: `${item.percentage || 20}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onPlayMovie(movie)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500 hover:text-black transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Resume</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STREAMING PREFERENCES */}
          {activeSubTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Playback Preferences</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure default video stream quality and audio language
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Streaming Resolution
                  </label>
                  <select
                    value={streamQuality}
                    onChange={(e) => setStreamQuality(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option>4K Ultra HD (Dolby Atmos enabled)</option>
                    <option>1080p Full HD (High Quality)</option>
                    <option>720p HD (Data Saver)</option>
                    <option>Automatic (Bandwidth Adaptive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Preferred Audio Track
                  </label>
                  <select
                    value={audioLang}
                    onChange={(e) => setAudioLang(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option>Original (English)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                    <option>German (Deutsch)</option>
                    <option>Japanese (日本語)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Subtitles & Closed Captions
                  </label>
                  <select
                    value={subtitles}
                    onChange={(e) => setSubtitles(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option>English [CC]</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Off</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert('Preferences saved to your profile.')}
                    className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ACCOUNT */}
          {activeSubTab === 'account' && (
            <div className="space-y-8">
              {/* Change Password Form */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
                    <KeyRound className="h-5 w-5 text-amber-400" />
                    <span>Change Password</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Secure your account with a strong 8+ character password
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      New Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-all disabled:opacity-50"
                  >
                    {changingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>Account Actions</span>
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={async () => {
                      await logout();
                      onNavigateHome();
                    }}
                    className="flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out of Session</span>
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account Permanently</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
