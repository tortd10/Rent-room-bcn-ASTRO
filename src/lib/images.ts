// URL pública de una imagen en el bucket de Supabase Storage.
export const IMAGES_BUCKET = "room-images"

export function publicImageUrl(path: string): string {
	return `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/${path}`
}

const SITE = "https://www.rentroombcn.com"

// Las imágenes pueden ser rutas locales (/Flats/...) o URLs absolutas de Storage.
export const absoluteUrl = (src?: string | null) =>
	!src ? "" : /^https?:\/\//.test(src) ? src : `${SITE}${src}`

// En producción las fotos de Storage (1600 px) pasan por el optimizador de Vercel, que las sirve
// redimensionadas y en WebP/AVIF. En local (y para rutas /public) se devuelve la URL tal cual.
// Los anchos deben estar en imagesConfig.sizes de astro.config.mjs.
export function optimizedImage(src: string | null | undefined, width: number): string {
	if (!src) return ""
	if (import.meta.env.DEV || !src.startsWith(import.meta.env.PUBLIC_SUPABASE_URL)) return src
	return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}
