import type { Room } from "@/types"

// Textos SEO de una habitación en el idioma pedido (EN con respaldo en ES).
export function localizeRoom(room: Room, lang: string) {
	const en = lang === "en"
	return {
		metaTitle: (en && room.metaTitle_en) || room.metaTitle || room.name,
		metaDescription: (en && room.metaDescription_en) || room.metaDescription || undefined,
		imageAlt: (en && room.imageAlt_en) || room.imageAlt || room.name,
	}
}
