// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
// @ts-ignore
import i18next from 'astro-i18next';

import partytown from '@astrojs/partytown';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    build: {
        inlineStylesheets: "always",
    },
    compressHTML: true,
    prefetch: true,
    devToolbar: {
        enabled: false,
    },
  integrations: [tailwind(), i18next({
    default: 'es', // Idioma por defecto
    locales: ['en', 'es'], // Idiomas soportados
  }), partytown()],
  output: 'server',
  adapter: vercel({
    skewProtection: true,
  }),
});