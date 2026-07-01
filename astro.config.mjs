import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

/**
 * Astro config for kidmapr-guides
 *
 * Deployment: Static HTML on Netlify, proxied under clovermap.com/guides/*
 * via Vercel rewrite. base: '/guides' ensures all internal links and asset
 * paths include the /guides prefix so the proxy works transparently.
 *
 * Proxy rule in vercel.json (base44_export):
 *   { "source": "/guides/:path*", "destination": "https://kidmapr-guides.netlify.app/guides/:path*" }
 *
 * Note: @astrojs/sitemap is omitted — it crashes with base: '/guides' in this
 * version. Guide URLs are already included in the main clovermap.com sitemap.xml.
 */
export default defineConfig({
  site: 'https://www.clovermap.com',
  base: '/guides',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
    mdx(),
  ],
});
