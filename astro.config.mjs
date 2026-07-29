// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static output is the default in Astro 7 (no adapter required); `astro build`
// emits a fully static `dist/` folder that is uploaded to S3 + CloudFront.
export default defineConfig({
  site: 'https://aitecxo.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
