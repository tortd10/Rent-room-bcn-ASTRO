// @ts-check
import { defineConfig } from "astro/config"

import tailwind from "@astrojs/tailwind"
// @ts-ignore
import i18next from "astro-i18next"

import partytown from "@astrojs/partytown"

import vercel from "@astrojs/vercel"

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
	redirects: {
	},
	integrations: [
		tailwind(),
		i18next({
			default: "es", // Idioma por defecto
			locales: ["en", "es"], // Idiomas soportados
		}),
		partytown(),
	],
	output: "server",
	adapter: vercel({
		skewProtection: true,
		// Optimizador de imágenes de Vercel para las fotos de Supabase Storage (ver optimizedImage)
		imageService: true,
		imagesConfig: {
			sizes: [224, 640, 800, 1200],
			domains: [],
			formats: ["image/avif", "image/webp"],
			minimumCacheTTL: 31536000,
			remotePatterns: [
				{
					protocol: "https",
					hostname: "*.supabase.co",
					pathname: "/storage/v1/object/public/room-images/**",
				},
			],
		},
	  }),
	vite: {
		ssr: {
			noExternal: ["@supabase/supabase-js"], // ← Essential for Supabase
		},
		server: {
			fs: {
			  strict: false
			}
		  },
	},
})
