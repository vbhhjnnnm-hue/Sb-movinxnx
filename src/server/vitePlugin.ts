/**
 * Vite Plugin to mount Express API in Dev Server
 */

import { Plugin } from 'vite';
import { app } from './app.ts';

export function apiServerPlugin(): Plugin {
  return {
    name: 'obsidian-api-server',
    configureServer(server) {
      server.middlewares.use(app);
    },
  };
}
