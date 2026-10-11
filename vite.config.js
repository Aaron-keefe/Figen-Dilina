import fs from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SITE_URL is the public address of the invitation, ending in "/"
// (e.g. https://username.github.io/engagement/). Social previews need
// absolute URLs, so it is written into index.html at build time.
// GitHub Actions sets it automatically; locally it can go in a .env file.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.SITE_URL || 'http://localhost:5173/').replace(/\/?$/, '/');
  return {
    // Relative asset paths: works at a GitHub Pages sub-path or a custom domain.
    base: './',
    plugins: [
      react(),
      {
        name: 'site-url-and-favicon',
        transformIndexHtml: (html) => html
          .replaceAll('%SITE_URL%', siteUrl)
          // favicon inlined so it also works in the single offline file
          .replace('__FAVICON__', 'data:image/png;base64,' + fs.readFileSync('src/assets/logo/favicon.png').toString('base64')),
      },
      // `npm run build:single` → one self-contained HTML file for offline use on a phone.
      mode === 'single' && viteSingleFile(),
    ],
    build: mode === 'single'
      ? { outDir: 'dist-single', assetsInlineLimit: Infinity, cssCodeSplit: false }
      : undefined,
  };
});
