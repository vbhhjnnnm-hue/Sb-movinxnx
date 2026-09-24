/**
 * Express Application Configuration for Obsidian Cinema
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes.ts';

export const app = express();

// Security & Parsing Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Root health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', brand: 'Obsidian Cinema', timestamp: new Date().toISOString() });
});
