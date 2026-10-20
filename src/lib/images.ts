// URL pública de una imagen en el bucket de Supabase Storage.
export const IMAGES_BUCKET = "room-images"

export function publicImageUrl(path: string): string {
	return `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/${path}`
}

const SITE = "https://www.rentroombcn.com"

// Las imágenes pueden ser rutas locales (/Flats/...) o URLs absolutas de Storage.
export const absoluteUrl = (src?: string | null) =>
	!src ? "" : /^https?:\/\//.test(src) ? src : `${SITE}${src}`

// En producción las fotos de Storage y las de /public (jpg, png, webp) pasan por el optimizador de
// Vercel, que las sirve redimensionadas y en AVIF/WebP. En local, los SVG y otras rutas se devuelve
// la URL tal cual. Los anchos deben estar en imagesConfig.sizes de astro.config.mjs.
const RASTER = /\.(jpe?g|png|webp)$/i

export function optimizedImage(src: string | null | undefined, width: number): string {
	if (!src) return ""
	if (import.meta.env.DEV) return src
	const isStorage = src.startsWith(import.meta.env.PUBLIC_SUPABASE_URL)
	const isLocalRaster = src.startsWith("/") && !src.startsWith("/_") && RASTER.test(src)
	if (!isStorage && !isLocalRaster) return src
	return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}
