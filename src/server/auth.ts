/**
 * Authentication and Security Middleware for Obsidian Cinema
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from './store.ts';
import { User } from '../types/index.ts';

const AUTH_SECRET = process.env.AUTH_SECRET || 'obsidian_secure_production_secret_key_cinema_2026';
const TOKEN_COOKIE_NAME = 'obsidian_auth_token';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function signToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // True in production HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Extracts and verifies token from HTTP-only Cookie or Authorization: Bearer header
 */
export function extractUser(req: Request): User | null {
  let token: string | undefined;

  // 1. Try Cookie
  if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
    token = req.cookies[TOKEN_COOKIE_NAME];
  }

  // 2. Try Authorization Header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, AUTH_SECRET) as { sub: string; role: string };
    const user = store.getUserById(payload.sub);
    return user || null;
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Requires any authenticated user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required to access this resource.',
    });
  }
  req.user = user;
  next();
}

/**
 * Middleware: Requires Administrator role
 * NEVER trusts client-side role assertions; verifies directly on server
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required.',
    });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'You are not authorized to perform this action. Administrator privileges required.',
    });
  }

  req.user = user;
  next();
}
