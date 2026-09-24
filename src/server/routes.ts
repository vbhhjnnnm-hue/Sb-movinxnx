/**
 * Express API Router for Obsidian Cinema
 */

import { Router } from 'express';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { store } from './store.ts';
import { searchTMDB } from './tmdb.ts';
import {
  requireAuth,
  requireAdmin,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  AuthenticatedRequest,
} from './auth.ts';

export const apiRouter = Router();

// ============================================================================
// 1. AUTHENTICATION ENDPOINTS
// ============================================================================

// POST /api/auth/register
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const user = await store.registerUser(name, email, password);
    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account successfully registered.',
      user,
      token,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await store.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    // Audit log for admin logins
    if (user.role === 'ADMIN') {
      store.addAuditLog(user.id, 'ADMIN_LOGIN', 'AUTH', user.id, `Admin logged in: ${user.email}`);
    }

    return res.json({
      message: 'Successfully logged in.',
      user,
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Login process error. Please try again.' });
  }
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Successfully logged out.' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

// POST /api/auth/change-password
apiRouter.post('/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    await store.changePassword(req.user!.id, currentPassword, newPassword);
    return res.json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to change password.' });
  }
});

// ============================================================================
// 2. PUBLIC & USER MOVIE CATALOG ENDPOINTS
// ============================================================================

// GET /api/movies
apiRouter.get('/movies', (req, res) => {
  try {
    const { genre, search, featured } = req.query;
    const movies = store.getMovies({
      publishedOnly: true,
      genre: typeof genre === 'string' ? genre : undefined,
      search: typeof search === 'string' ? search : undefined,
      featured: featured === 'true' ? true : undefined,
    });

    return res.json({ movies });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve movies.' });
  }
});

// GET /api/movies/:id
apiRouter.get('/movies/:id', (req, res) => {
  const movie = store.getMovieById(req.params.id);
  if (!movie || !movie.published) {
    return res.status(404).json({ error: 'Movie not found.' });
  }
  return res.json({ movie });
});

// GET /api/stream - Resilient proxy for external media streams with HTTP Range request forwarding
apiRouter.get('/stream', (req, res) => {
  const targetUrl = req.query.url;
  if (typeof targetUrl !== 'string' || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return res.status(400).send('Invalid or missing stream url parameter.');
  }

  try {
    const parsed = new URL(targetUrl);
    // Security check: restrict localhost / loopback addresses
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1' ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.startsWith('192.168.')
    ) {
      return res.status(403).send('Forbidden stream target destination.');
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const reqHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ObsidianCinema/1.0',
      Accept: '*/*',
    };

    if (req.headers.range) {
      reqHeaders['Range'] = req.headers.range;
    }

    const proxyReq = client.get(targetUrl, { headers: reqHeaders }, (proxyRes) => {
      res.status(proxyRes.statusCode || 200);

      const forwardHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'last-modified',
        'etag',
      ];
      forwardHeaders.forEach((key) => {
        const val = proxyRes.headers[key];
        if (val) {
          res.setHeader(key, val);
        }
      });

      if (!proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', 'video/mp4');
      }
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[StreamProxy Error]:', err.message);
      if (!res.headersSent) {
        res.status(502).send('Unable to stream upstream media.');
      }
    });

    req.on('close', () => {
      proxyReq.destroy();
    });
  } catch (err: any) {
    return res.status(400).send('Malformed stream url.');
  }
});

// ============================================================================
// 3. USER PERSONAL SETTINGS & WATCHLIST (COMPLETELY SEPARATE FROM ADMIN)
// ============================================================================

// GET /api/user/profile
apiRouter.get('/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({ profile: req.user });
});

// PATCH /api/user/profile
apiRouter.patch('/user/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const updated = await store.updateUserProfile(req.user!.id, { name, avatarUrl });
    return res.json({ profile: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Profile update failed.' });
  }
});

// DELETE /api/user/account
apiRouter.delete('/user/account', requireAuth, (req: AuthenticatedRequest, res) => {
  const deleted = store.deleteUser(req.user!.id);
  clearAuthCookie(res);
  return res.json({ success: deleted, message: 'Account deleted.' });
});

// GET /api/user/watchlist
apiRouter.get('/user/watchlist', requireAuth, (req: AuthenticatedRequest, res) => {
  const watchlist = store.getWatchlist(req.user!.id);
  return res.json({ watchlist });
});

// POST /api/user/watchlist
apiRouter.post('/api/user/watchlist', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required.' });
    }
    const item = store.addToWatchlist(req.user!.id, movieId);
    return res.json({ item });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Could not add to watchlist.' });
  }
});
// Also support route without leading /api if router is mounted at /api
apiRouter.post('/user/watchlist', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required.' });
    }
    const item = store.addToWatchlist(req.user!.id, movieId);
    return res.json({ item });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Could not add to watchlist.' });
  }
});

// DELETE /api/user/watchlist/:movieId
apiRouter.delete('/user/watchlist/:movieId', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = store.removeFromWatchlist(req.user!.id, req.params.movieId);
  return res.json({ success });
});

// GET /api/user/history
apiRouter.get('/user/history', requireAuth, (req: AuthenticatedRequest, res) => {
  const history = store.getWatchHistory(req.user!.id);
  return res.json({ history });
});

// POST /api/user/history
apiRouter.post('/user/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { movieId, progress, duration } = req.body;
    if (!movieId) return res.status(400).json({ error: 'movieId is required.' });

    const item = store.recordWatchProgress(
      req.user!.id,
      movieId,
      Number(progress) || 0,
      Number(duration) || 0
    );
    return res.json({ item });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Could not record history.' });
  }
});

// ============================================================================
// 4. ADMIN PANEL ENDPOINTS (PROTECTED STRICTLY BY requireAdmin)
// ============================================================================

// GET /api/admin/dashboard
apiRouter.get('/admin/dashboard', requireAdmin, (_req, res) => {
  const stats = store.getAdminStats();
  return res.json({ stats });
});

// GET /api/admin/users
apiRouter.get('/admin/users', requireAdmin, (_req, res) => {
  const users = store.getAllUsers();
  return res.json({ users });
});

// PATCH /api/admin/users/:id/role
apiRouter.patch('/admin/users/:id/role', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.body;
    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Role must be either USER or ADMIN.' });
    }

    const updated = await store.updateUserRole(req.user!.id, req.params.id, role);
    return res.json({ user: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Could not update user role.' });
  }
});

// GET /api/admin/movies
apiRouter.get('/admin/movies', requireAdmin, (req, res) => {
  const { search, genre } = req.query;
  const movies = store.getMovies({
    publishedOnly: false, // Admin sees both published and unpublished
    search: typeof search === 'string' ? search : undefined,
    genre: typeof genre === 'string' ? genre : undefined,
  });
  return res.json({ movies });
});

// POST /api/admin/movies (Add Movie from TMDB or Manual)
apiRouter.post('/admin/movies', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const {
      tmdbId,
      title,
      posterUrl,
      backdropUrl,
      overview,
      releaseDate,
      genre,
      rating,
      duration,
      videoUrl,
      published,
      featured,
    } = req.body;

    if (!tmdbId || !title || !posterUrl) {
      return res.status(400).json({
        error: 'TMDB ID, Movie Title, and Poster URL are required.',
      });
    }

    const newMovie = store.addMovie(req.user!.id, {
      tmdbId: Number(tmdbId),
      title,
      posterUrl,
      backdropUrl,
      overview,
      releaseDate,
      genre,
      rating: typeof rating === 'number' ? rating : 8.0,
      duration,
      videoUrl,
      published: published !== undefined ? published : true,
      featured: featured || false,
    });

    return res.status(201).json({
      message: 'Movie successfully added to catalog.',
      movie: newMovie,
    });
  } catch (error: any) {
    // Check if error is our duplicate constraint message
    if (error.message.includes('already been added')) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message || 'Failed to add movie.' });
  }
});

// PATCH /api/admin/movies/:id
apiRouter.patch('/admin/movies/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = store.updateMovie(req.user!.id, req.params.id, req.body);
    return res.json({ movie: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update movie.' });
  }
});

// POST /api/admin/movies/:id/toggle-publish
apiRouter.post('/admin/movies/:id/toggle-publish', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = store.togglePublish(req.user!.id, req.params.id);
    return res.json({ movie: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to toggle status.' });
  }
});

// DELETE /api/admin/movies/:id
apiRouter.delete('/admin/movies/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const success = store.deleteMovie(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Movie not found.' });
  }
  return res.json({ success: true, message: 'Movie deleted.' });
});

// POST /api/admin/movies/bulk-delete
apiRouter.post('/admin/movies/bulk-delete', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array.' });
  }
  const count = store.bulkDeleteMovies(req.user!.id, ids);
  return res.json({ success: true, deletedCount: count });
});

// ============================================================================
// 5. TMDB ADMIN ENDPOINT (PROTECTED - NEVER LEAKS API KEY)
// ============================================================================

// GET /api/admin/tmdb/search?q=...
apiRouter.get('/admin/tmdb/search', requireAdmin, async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    const results = await searchTMDB(query);
    return res.json({ results });
  } catch (error: any) {
    return res.status(503).json({
      error: 'Movie service is temporarily unavailable.',
    });
  }
});

// ============================================================================
// 6. ADMIN AUDIT LOGS & SETTINGS (PROTECTED)
// ============================================================================

// GET /api/admin/audit-logs
apiRouter.get('/admin/audit-logs', requireAdmin, (_req, res) => {
  const logs = store.getAuditLogs();
  return res.json({ logs });
});

// GET /api/admin/settings
apiRouter.get('/admin/settings', requireAdmin, (_req, res) => {
  const ads = store.getAdSettings();
  const system = store.getSystemSettings();

  return res.json({
    settings: {
      ads,
      system,
      tmdb: {
        isConfigured: system.tmdbConfigured,
        maskedKey: process.env.TMDB_API_KEY
          ? `••••••••••••••••${process.env.TMDB_API_KEY.slice(-4)}`
          : 'Not configured (using high-fidelity curated library)',
      },
    },
  });
});

// PATCH /api/admin/settings
apiRouter.patch('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { ads, system } = req.body;

    let updatedAds = store.getAdSettings();
    let updatedSystem = store.getSystemSettings();

    if (ads) {
      updatedAds = store.updateAdSettings(req.user!.id, ads);
    }
    if (system) {
      updatedSystem = store.updateSystemSettings(req.user!.id, system);
    }

    return res.json({
      message: 'Settings updated successfully.',
      ads: updatedAds,
      system: updatedSystem,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update settings.' });
  }
});

// ============================================================================
// 7. PUBLIC SETTINGS (For frontend display: Ads, Website Branding)
// ============================================================================

// GET /api/settings/ads (Public, no sensitive admin credentials)
apiRouter.get('/settings/ads', (_req, res) => {
  const ads = store.getAdSettings();
  return res.json({
    enabled: ads.enabled,
    publisherId: ads.publisherId,
    homepageSlot: ads.homepageSlot,
    movieListingSlot: ads.movieListingSlot,
    movieDetailsSlot: ads.movieDetailsSlot,
    footerSlot: ads.footerSlot,
  });
});

// GET /api/settings/system
apiRouter.get('/settings/system', (_req, res) => {
  const system = store.getSystemSettings();
  return res.json({
    websiteName: system.websiteName,
    logoText: system.logoText,
    maintenanceMode: system.maintenanceMode,
  });
});
