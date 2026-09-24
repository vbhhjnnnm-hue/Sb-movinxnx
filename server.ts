/**
 * Production Full-Stack Entry Server for Obsidian Cinema
 */

import path from 'path';
import express from 'express';
import { app } from './src/server/app.ts';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Serve frontend static files in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback for HTML5 routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[Obsidian Cinema Server] Live on http://${HOST}:${PORT}`);
});
