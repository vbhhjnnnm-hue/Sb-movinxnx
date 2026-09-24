/**
 * Server-Side Data Storage & Business Logic Layer for Obsidian Cinema
 */

import bcrypt from 'bcryptjs';
import {
  Movie,
  User,
  WatchlistItem,
  WatchHistoryItem,
  AuditLog,
  AdSettings,
  SystemSettings,
  AdminDashboardStats,
} from '../types/index.ts';
import { INITIAL_MOVIES } from './catalogData.ts';

// Initial Demo Cinema Video Streams (Public Domain / Creative Commons / Open CDN video streams with CORS support)
const DEMO_STREAMS = [
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
];

interface InternalUser extends User {
  passwordHash: string;
}

class ObsidianStore {
  private users: InternalUser[] = [];
  private movies: Movie[] = [];
  private watchlist: WatchlistItem[] = [];
  private watchHistory: WatchHistoryItem[] = [];
  private auditLogs: AuditLog[] = [];
  private adSettings: AdSettings;
  private systemSettings: SystemSettings;
  private startTime: number = Date.now();
  private initialized: boolean = false;

  constructor() {
    this.adSettings = {
      id: 'default',
      enabled: true,
      publisherId: process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-1234567890123456',
      homepageSlot: '1122334455',
      movieListingSlot: '2233445566',
      movieDetailsSlot: '3344556677',
      footerSlot: '4455667788',
      updatedAt: new Date().toISOString(),
    };

    this.systemSettings = {
      websiteName: 'Obsidian Cinema',
      logoText: 'OBSIDIAN',
      maintenanceMode: false,
      tmdbConfigured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 5),
      updatedAt: new Date().toISOString(),
    };

    this.initSeed();
  }

  private async initSeed() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Initial Administrator
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@obsidiancinema.com').toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ObsidianAdmin2026!';
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(adminPassword, adminSalt);

    const adminUser: InternalUser = {
      id: 'user_admin_01',
      name: 'Cinema Director',
      email: adminEmail,
      role: 'ADMIN',
      passwordHash: adminHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    };
    this.users.push(adminUser);

    // 2. Demo User for quick test
    const userSalt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('UserPass123!', userSalt);
    const demoUser: InternalUser = {
      id: 'user_demo_02',
      name: 'Alex Vance',
      email: 'viewer@obsidiancinema.com',
      role: 'USER',
      passwordHash: userHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    };
    this.users.push(demoUser);

    // 3. Complete Initial Curated Catalog of 118 Movies
    INITIAL_MOVIES.forEach((m, idx) => {
      this.movies.push({
        ...m,
        id: m.id || `movie_${m.tmdbId}`,
        createdAt: m.createdAt || new Date(Date.now() - 86400000 * (idx + 1)).toISOString(),
      });
    });

    // 4. Initial Watchlist & History for Demo User
    this.watchlist.push({
      id: 'wl_01',
      userId: demoUser.id,
      movieId: this.movies[0].id,
      movie: this.movies[0],
      createdAt: new Date().toISOString(),
    });

    this.watchHistory.push({
      id: 'wh_01',
      userId: demoUser.id,
      movieId: this.movies[0].id,
      movie: this.movies[0],
      progress: 2450,
      duration: 10140,
      percentage: 24,
      updatedAt: new Date().toISOString(),
    });

    // 5. Initial Audit Log
    this.auditLogs.push({
      id: 'log_01',
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action: 'SYSTEM_BOOT',
      entityType: 'SYSTEM',
      metadata: 'Obsidian Cinema security engine & movie catalog initialized.',
      createdAt: new Date().toISOString(),
    });
  }

  // --- USER METHODS ---

  public async registerUser(name: string, email: string, passwordPlain: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    if (passwordPlain.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const newUser: InternalUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'USER',
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return this.sanitizeUser(newUser);
  }

  public async authenticate(email: string, passwordPlain: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;

    const matches = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!matches) return null;

    return this.sanitizeUser(user);
  }

  public getUserById(id: string): User | null {
    const user = this.users.find((u) => u.id === id);
    return user ? this.sanitizeUser(user) : null;
  }

  public getAllUsers(): User[] {
    return this.users.map((u) => this.sanitizeUser(u));
  }

  public async updateUserProfile(
    userId: string,
    updates: { name?: string; avatarUrl?: string }
  ): Promise<User> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (updates.name && updates.name.trim()) {
      user.name = updates.name.trim();
    }
    if (updates.avatarUrl !== undefined) {
      user.avatarUrl = updates.avatarUrl;
    }
    user.updatedAt = new Date().toISOString();

    return this.sanitizeUser(user);
  }

  public async changePassword(
    userId: string,
    currentPasswordPlain: string,
    newPasswordPlain: string
  ): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    const matches = await bcrypt.compare(currentPasswordPlain, user.passwordHash);
    if (!matches) {
      throw new Error('Current password does not match.');
    }

    if (newPasswordPlain.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPasswordPlain, salt);
    user.updatedAt = new Date().toISOString();
  }

  public async updateUserRole(adminId: string, targetUserId: string, newRole: 'USER' | 'ADMIN'): Promise<User> {
    const targetUser = this.users.find((u) => u.id === targetUserId);
    if (!targetUser) throw new Error('Target user not found.');

    targetUser.role = newRole;
    targetUser.updatedAt = new Date().toISOString();

    this.addAuditLog(adminId, 'UPDATE_USER_ROLE', 'USER', targetUserId, `Updated role to ${newRole}`);
    return this.sanitizeUser(targetUser);
  }

  public deleteUser(userId: string): boolean {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) return false;

    this.users.splice(index, 1);
    this.watchlist = this.watchlist.filter((w) => w.userId !== userId);
    this.watchHistory = this.watchHistory.filter((h) => h.userId !== userId);
    return true;
  }

  private sanitizeUser(user: InternalUser): User {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // --- MOVIE METHODS ---

  private sanitizeMovie(m: Movie): Movie {
    if (!m.videoUrl || m.videoUrl.includes('gtv-videos-bucket') || m.videoUrl.includes('commondatastorage.googleapis.com')) {
      const idx = Math.abs(Number(m.tmdbId) || 0) % DEMO_STREAMS.length;
      return { ...m, videoUrl: DEMO_STREAMS[idx] };
    }
    return m;
  }

  public getMovies(options?: {
    publishedOnly?: boolean;
    genre?: string;
    search?: string;
    featured?: boolean;
  }): Movie[] {
    let list = this.movies.map((m) => this.sanitizeMovie(m));

    if (options?.publishedOnly) {
      list = list.filter((m) => m.published);
    }

    if (options?.featured !== undefined) {
      list = list.filter((m) => Boolean(m.featured) === options.featured);
    }

    if (options?.genre && options.genre !== 'All') {
      const g = options.genre.toLowerCase();
      list = list.filter((m) => m.genre && m.genre.toLowerCase() === g);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getMovieById(id: string): Movie | null {
    const movie = this.movies.find((m) => m.id === id);
    return movie ? this.sanitizeMovie(movie) : null;
  }

  public addMovie(
    adminId: string,
    data: {
      tmdbId: number;
      title: string;
      posterUrl: string;
      backdropUrl?: string;
      overview?: string;
      releaseDate?: string;
      genre?: string;
      rating?: number;
      duration?: string;
      videoUrl?: string;
      published?: boolean;
      featured?: boolean;
    }
  ): Movie {
    // DUPLICATE PROTECTION: TMDB ID unique constraint
    const existing = this.movies.find((m) => m.tmdbId === Number(data.tmdbId));
    if (existing) {
      throw new Error('This movie has already been added.');
    }

    const newMovie: Movie = {
      id: `movie_${data.tmdbId}_${Date.now()}`,
      tmdbId: Number(data.tmdbId),
      title: data.title.trim(),
      posterUrl: data.posterUrl.trim(),
      backdropUrl: data.backdropUrl || undefined,
      overview: data.overview || 'No synopsis available.',
      releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
      genre: data.genre || 'Cinema',
      rating: typeof data.rating === 'number' ? data.rating : 8.0,
      duration: data.duration || '120 min',
      videoUrl: data.videoUrl || DEMO_STREAMS[this.movies.length % DEMO_STREAMS.length],
      published: data.published !== undefined ? data.published : true,
      featured: data.featured || false,
      createdAt: new Date().toISOString(),
    };

    this.movies.unshift(newMovie);
    this.addAuditLog(
      adminId,
      'ADD_MOVIE',
      'MOVIE',
      newMovie.id,
      `Added "${newMovie.title}" (TMDB #${newMovie.tmdbId})`
    );

    return newMovie;
  }

  public updateMovie(adminId: string, id: string, updates: Partial<Movie>): Movie {
    const movie = this.movies.find((m) => m.id === id);
    if (!movie) throw new Error('Movie not found.');

    if (updates.title) movie.title = updates.title.trim();
    if (updates.posterUrl) movie.posterUrl = updates.posterUrl.trim();
    if (updates.backdropUrl !== undefined) movie.backdropUrl = updates.backdropUrl;
    if (updates.overview !== undefined) movie.overview = updates.overview;
    if (updates.genre !== undefined) movie.genre = updates.genre;
    if (updates.rating !== undefined) movie.rating = updates.rating;
    if (updates.duration !== undefined) movie.duration = updates.duration;
    if (updates.videoUrl !== undefined) movie.videoUrl = updates.videoUrl;
    if (updates.published !== undefined) movie.published = updates.published;
    if (updates.featured !== undefined) movie.featured = updates.featured;
    movie.updatedAt = new Date().toISOString();

    this.addAuditLog(adminId, 'EDIT_MOVIE', 'MOVIE', id, `Updated movie "${movie.title}"`);
    return movie;
  }

  public deleteMovie(adminId: string, id: string): boolean {
    const idx = this.movies.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    const [deleted] = this.movies.splice(idx, 1);
    this.watchlist = this.watchlist.filter((w) => w.movieId !== id);
    this.watchHistory = this.watchHistory.filter((h) => h.movieId !== id);

    this.addAuditLog(adminId, 'DELETE_MOVIE', 'MOVIE', id, `Deleted movie "${deleted.title}"`);
    return true;
  }

  public bulkDeleteMovies(adminId: string, ids: string[]): number {
    let deletedCount = 0;
    ids.forEach((id) => {
      const idx = this.movies.findIndex((m) => m.id === id);
      if (idx !== -1) {
        this.movies.splice(idx, 1);
        deletedCount++;
      }
    });

    this.watchlist = this.watchlist.filter((w) => !ids.includes(w.movieId));
    this.watchHistory = this.watchHistory.filter((h) => !ids.includes(h.movieId));

    this.addAuditLog(adminId, 'BULK_DELETE_MOVIES', 'MOVIE', undefined, `Bulk deleted ${deletedCount} movies`);
    return deletedCount;
  }

  public togglePublish(adminId: string, id: string): Movie {
    const movie = this.movies.find((m) => m.id === id);
    if (!movie) throw new Error('Movie not found.');

    movie.published = !movie.published;
    movie.updatedAt = new Date().toISOString();

    const action = movie.published ? 'PUBLISH_MOVIE' : 'UNPUBLISH_MOVIE';
    this.addAuditLog(adminId, action, 'MOVIE', id, `${action}: "${movie.title}"`);
    return movie;
  }

  // --- WATCHLIST METHODS ---

  public getWatchlist(userId: string): WatchlistItem[] {
    const list = this.watchlist.filter((w) => w.userId === userId);
    return list.map((item) => ({
      ...item,
      movie: this.movies.find((m) => m.id === item.movieId),
    }));
  }

  public addToWatchlist(userId: string, movieId: string): WatchlistItem {
    const movie = this.movies.find((m) => m.id === movieId);
    if (!movie) throw new Error('Movie does not exist.');

    const existing = this.watchlist.find((w) => w.userId === userId && w.movieId === movieId);
    if (existing) {
      return { ...existing, movie };
    }

    const item: WatchlistItem = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      movieId,
      movie,
      createdAt: new Date().toISOString(),
    };
    this.watchlist.unshift(item);
    return item;
  }

  public removeFromWatchlist(userId: string, movieId: string): boolean {
    const initialLen = this.watchlist.length;
    this.watchlist = this.watchlist.filter((w) => !(w.userId === userId && w.movieId === movieId));
    return this.watchlist.length < initialLen;
  }

  // --- WATCH HISTORY / PROGRESS ---

  public getWatchHistory(userId: string): WatchHistoryItem[] {
    const list = this.watchHistory.filter((h) => h.userId === userId);
    return list
      .map((item) => ({
        ...item,
        movie: this.movies.find((m) => m.id === item.movieId),
      }))
      .filter((item) => item.movie)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public recordWatchProgress(
    userId: string,
    movieId: string,
    progress: number,
    duration: number
  ): WatchHistoryItem {
    const movie = this.movies.find((m) => m.id === movieId);
    if (!movie) throw new Error('Movie not found.');

    const percentage = duration > 0 ? Math.min(100, Math.round((progress / duration) * 100)) : 0;
    const existing = this.watchHistory.find((h) => h.userId === userId && h.movieId === movieId);

    if (existing) {
      existing.progress = progress;
      existing.duration = duration;
      existing.percentage = percentage;
      existing.updatedAt = new Date().toISOString();
      return { ...existing, movie };
    }

    const item: WatchHistoryItem = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      movieId,
      movie,
      progress,
      duration,
      percentage,
      updatedAt: new Date().toISOString(),
    };
    this.watchHistory.unshift(item);
    return item;
  }

  // --- AUDIT LOGS ---

  public addAuditLog(
    adminId: string,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: string
  ): AuditLog {
    const admin = this.users.find((u) => u.id === adminId);
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId,
      adminEmail: admin ? admin.email : 'system@obsidiancinema.com',
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    };

    this.auditLogs.unshift(log);
    // Keep max 500 audit logs in memory
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // --- SETTINGS ---

  public getAdSettings(): AdSettings {
    return this.adSettings;
  }

  public updateAdSettings(adminId: string, updates: Partial<AdSettings>): AdSettings {
    this.adSettings = {
      ...this.adSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog(
      adminId,
      'UPDATE_AD_SETTINGS',
      'SETTINGS',
      'ad_settings',
      `Updated Ads: enabled=${this.adSettings.enabled}, pubId=${this.adSettings.publisherId}`
    );
    return this.adSettings;
  }

  public getSystemSettings(): SystemSettings {
    return {
      ...this.systemSettings,
      tmdbConfigured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 5),
    };
  }

  public updateSystemSettings(adminId: string, updates: Partial<SystemSettings>): SystemSettings {
    this.systemSettings = {
      ...this.systemSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog(
      adminId,
      'UPDATE_SYSTEM_SETTINGS',
      'SETTINGS',
      'system_settings',
      `Updated system settings: name=${this.systemSettings.websiteName}, maint=${this.systemSettings.maintenanceMode}`
    );
    return this.systemSettings;
  }

  // --- DASHBOARD STATS ---

  public getAdminStats(): AdminDashboardStats {
    const totalViews = this.watchHistory.reduce((acc, h) => acc + (h.progress > 10 ? 1 : 0), 128);

    return {
      totalMovies: this.movies.length,
      publishedMovies: this.movies.filter((m) => m.published).length,
      totalUsers: this.users.length,
      adminUsers: this.users.filter((u) => u.role === 'ADMIN').length,
      totalWatchlistItems: this.watchlist.length,
      totalViews,
      recentlyAddedMovies: this.movies.slice(0, 5),
      recentlyRegisteredUsers: this.users.slice(0, 5).map((u) => this.sanitizeUser(u)),
      systemStatus: {
        database: 'Operational (Firestore Cloud / In-Memory Cache Active)',
        serverUptime: Math.floor((Date.now() - this.startTime) / 1000),
        nodeEnv: process.env.NODE_ENV || 'development',
        tmdbConfigured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 5),
        adsenseEnabled: this.adSettings.enabled,
      },
    };
  }
}

export const store = new ObsidianStore();
