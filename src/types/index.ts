/**
 * Core Domain Models & API Types for Obsidian Cinema
 */

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Movie {
  id: string;
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
  published: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  movie?: Movie;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieId: string;
  movie?: Movie;
  progress: number; // in seconds
  duration: number; // in seconds
  percentage?: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: string;
  createdAt: string;
}

export interface AdSettings {
  id: string;
  enabled: boolean;
  publisherId: string;
  homepageSlot: string;
  movieListingSlot: string;
  movieDetailsSlot: string;
  footerSlot: string;
  updatedAt: string;
}

export interface SystemSettings {
  websiteName: string;
  logoText: string;
  maintenanceMode: boolean;
  tmdbConfigured: boolean;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalMovies: number;
  publishedMovies: number;
  totalUsers: number;
  adminUsers: number;
  totalWatchlistItems: number;
  totalViews: number;
  recentlyAddedMovies: Movie[];
  recentlyRegisteredUsers: User[];
  systemStatus: {
    database: string;
    serverUptime: number;
    nodeEnv: string;
    tmdbConfigured: boolean;
    adsenseEnabled: boolean;
  };
}

export interface TMDBMovieResult {
  id: number;
  tmdbId?: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  releaseDate?: string;
  vote_average?: number;
  rating?: number;
  genre?: string;
  genre_ids?: number[];
  posterUrl: string;
  backdropUrl?: string;
}
