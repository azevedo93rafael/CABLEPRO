import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      globals: true,
      environment: 'node',
    },
    // ── Prevent Rollup from trying to bundle Node-only SDK internals ──────────
    // @anthropic-ai/sdk includes server-only sub-paths (agent-toolset, fs-util)
    // that reference node:crypto, node:fs, etc. Since we use the SDK via
    // dynamic import() only, we tell Rollup to treat the entire package as
    // external during the production build. The browser will never load these
    // sub-paths; only the Claude API call path is exercised at runtime.
    build: {
      rollupOptions: {
        external: (id) => {
          // Externalize any node: built-in that leaks through
          if (id.startsWith('node:')) return true;
          return false;
        },
      },
    },
    optimizeDeps: {
      // Exclude heavy Node-SDK packages from pre-bundling.
      // They are loaded lazily via dynamic import() at runtime.
      exclude: ['@anthropic-ai/sdk', 'exceljs'],
    },
  };
});
