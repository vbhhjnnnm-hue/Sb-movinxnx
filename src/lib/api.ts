/**
 * Frontend API Client for Obsidian Cinema
 * Automatically passes HTTP-only cookies with credentials: 'include'
 */

import {
  User,
  Movie,
  WatchlistItem,
  WatchHistoryItem,
  AuditLog,
  AdSettings,
  SystemSettings,
  AdminDashboardStats,
  TMDBMovieResult,
} from '../types/index.ts';

// In-memory auth token backup in case client environment doesn't allow cookies in cross-origin preview
let inMemoryToken: string | null = null;

export function setClientToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    try {
      localStorage.setItem('obsidian_token', token);
    } catch (_) {}
  } else {
    try {
      localStorage.removeItem('obsidian_token');
    } catch (_) {}
  }
}

export function getClientToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    return localStorage.getItem('obsidian_token');
  } catch (_) {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getClientToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: User }>('/api/auth/me'),
    login: async (email: string, password: string) => {
      const res = await request<{ user: User; token: string; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setClientToken(res.token);
      return res;
    },
    register: async (name: string, email: string, password: string) => {
      const res = await request<{ user: User; token: string; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (res.token) setClientToken(res.token);
      return res;
    },
    logout: async () => {
      setClientToken(null);
      return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
    },
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  movies: {
    list: (params?: { genre?: string; search?: string; featured?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.genre && params.genre !== 'All') query.set('genre', params.genre);
      if (params?.search) query.set('search', params.search);
      if (params?.featured !== undefined) query.set('featured', String(params.featured));
      const qs = query.toString();
      return request<{ movies: Movie[] }>(`/api/movies${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<{ movie: Movie }>(`/api/movies/${id}`),
  },

  user: {
    getProfile: () => request<{ profile: User }>('/api/user/profile'),
    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
      request<{ profile: User }>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteAccount: () => {
      setClientToken(null);
      return request<{ success: boolean; message: string }>('/api/user/account', {
        method: 'DELETE',
      });
    },
    getWatchlist: () => request<{ watchlist: WatchlistItem[] }>('/api/user/watchlist'),
    addToWatchlist: (movieId: string) =>
      request<{ item: WatchlistItem }>('/api/user/watchlist', {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      }),
    removeFromWatchlist: (movieId: string) =>
      request<{ success: boolean }>(`/api/user/watchlist/${movieId}`, {
        method: 'DELETE',
      }),
    getHistory: () => request<{ history: WatchHistoryItem[] }>('/api/user/history'),
    recordHistory: (movieId: string, progress: number, duration: number) =>
      request<{ item: WatchHistoryItem }>('/api/user/history', {
        method: 'POST',
        body: JSON.stringify({ movieId, progress, duration }),
      }),
  },

  admin: {
    getDashboard: () => request<{ stats: AdminDashboardStats }>('/api/admin/dashboard'),
    getUsers: () => request<{ users: User[] }>('/api/admin/users'),
    updateUserRole: (userId: string, role: 'USER' | 'ADMIN') =>
      request<{ user: User }>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    getMovies: (params?: { search?: string; genre?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.genre && params.genre !== 'All') query.set('genre', params.genre);
      const qs = query.toString();
      return request<{ movies: Movie[] }>(`/api/admin/movies${qs ? `?${qs}` : ''}`);
    },
    addMovie: (movieData: Partial<Movie>) =>
      request<{ message: string; movie: Movie }>('/api/admin/movies', {
        method: 'POST',
        body: JSON.stringify(movieData),
      }),
    updateMovie: (id: string, movieData: Partial<Movie>) =>
      request<{ movie: Movie }>(`/api/admin/movies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(movieData),
      }),
    deleteMovie: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/admin/movies/${id}`, {
        method: 'DELETE',
      }),
    bulkDeleteMovies: (ids: string[]) =>
      request<{ success: boolean; deletedCount: number }>('/api/admin/movies/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    togglePublish: (id: string) =>
      request<{ movie: Movie }>(`/api/admin/movies/${id}/toggle-publish`, {
        method: 'POST',
      }),
    searchTMDB: (query: string) =>
      request<{ results: TMDBMovieResult[] }>(`/api/admin/tmdb/search?q=${encodeURIComponent(query)}`),
    getAuditLogs: () => request<{ logs: AuditLog[] }>('/api/admin/audit-logs'),
    getSettings: () =>
      request<{
        settings: {
          ads: AdSettings;
          system: SystemSettings;
          tmdb: { isConfigured: boolean; maskedKey: string };
        };
      }>('/api/admin/settings'),
    updateSettings: (data: { ads?: Partial<AdSettings>; system?: Partial<SystemSettings> }) =>
      request<{ message: string; ads: AdSettings; system: SystemSettings }>('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  settings: {
    getAds: () => request<AdSettings>('/api/settings/ads'),
    getSystem: () => request<SystemSettings>('/api/settings/system'),
  },
};
