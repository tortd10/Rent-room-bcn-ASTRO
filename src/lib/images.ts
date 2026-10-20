// URL pública de una imagen en el bucket de Supabase Storage.
export const IMAGES_BUCKET = "room-images"

export function publicImageUrl(path: string): string {
	return `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/${path}`
}

const SITE = "https://www.rentroombcn.com"

// Las imágenes pueden ser rutas locales (/Flats/...) o URLs absolutas de Storage.
export const absoluteUrl = (src?: string | null) =>
	!src ? "" : /^https?:\/\//.test(src) ? src : `${SITE}${src}`
