// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
// @ts-ignore
import i18next from 'astro-i18next';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    i18next({
      default: 'es', // Idioma por defecto
      locales: ['en', 'es'], // Idiomas soportados
    }),
  ],
});
