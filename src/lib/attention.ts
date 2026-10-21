import type { Db } from "@/db/supabase"

// Avisos que requieren atención (tarjeta "Requiere atención" del dashboard y campana de la cabecera).
// Un aviso por cada elemento afectado, con su ID; el texto del aviso es también su clave para marcarlo como leído.

export type AttentionItem = { text: string; href: string; tone: string }

type FlatInfo = { flat_id: string; approved: boolean }
type RoomInfo = {
	id: number
	slug: string
	flat_id: string
	approved: boolean
	metaTitle_en: string | null
	metaDescription_en: string | null
}

// "5 nuevos · 2 abiertos"
export const leadsBreakdown = (fresh: number, open: number) =>
	[fresh > 0 && `${fresh} nuevo${fresh === 1 ? "" : "s"}`, open > 0 && `${open} abierto${open === 1 ? "" : "s"}`]
		.filter(Boolean)
		.join(" · ")

export function buildAttention({
	flats,
	rooms,
	roomsWithImages,
	freshLeads,
	openLeads,
}: {
	flats: FlatInfo[]
	rooms: RoomInfo[]
	roomsWithImages: Set<number>
	freshLeads: number
	openLeads: number
}): AttentionItem[] {
	// Sin atender = nuevos + abiertos: los abiertos siguen esperando una acción
	const pendingLeads = freshLeads + openLeads
	const items: AttentionItem[] = []

	if (pendingLeads > 0) {
		items.push({
			text: `${pendingLeads} mensaje${pendingLeads === 1 ? "" : "s"} sin atender (${leadsBreakdown(freshLeads, openLeads)})`,
			href: "/admin/mensajes?status=pending",
			tone: "bg-purple-100 text-purple-800",
		})
	}
	for (const f of flats.filter((f) => !f.approved)) {
		items.push({
			text: `Piso pendiente de aprobación · ID: ${f.flat_id}`,
			href: `/admin/flats/view/${f.flat_id}`,
			tone: "bg-orange-100 text-orange-800",
		})
	}
	for (const r of rooms.filter((r) => !r.approved)) {
		items.push({
			text: `Habitación pendiente de aprobación · ID: ${r.slug}`,
			href: `/admin/rooms/view/${r.slug}`,
			tone: "bg-orange-100 text-orange-800",
		})
	}
	for (const r of rooms.filter((r) => !roomsWithImages.has(r.id))) {
		items.push({
			text: `Habitación sin fotos en Supabase · ID: ${r.slug}`,
			href: `/admin/rooms/view/${r.slug}`,
			tone: "bg-yellow-100 text-yellow-800",
		})
	}
	for (const r of rooms.filter((r) => !r.metaTitle_en || !r.metaDescription_en)) {
		items.push({
			text: `Habitación sin SEO en inglés · ID: ${r.slug}`,
			href: `/admin/rooms/view/${r.slug}`,
			tone: "bg-yellow-100 text-yellow-800",
		})
	}
	for (const f of flats.filter((f) => !rooms.some((r) => r.flat_id === f.flat_id))) {
		items.push({
			text: `Piso sin habitaciones · ID: ${f.flat_id}`,
			href: `/admin/flats/view/${f.flat_id}`,
			tone: "bg-yellow-100 text-yellow-800",
		})
	}
	return items
}

// Avisos y avisos leídos del usuario con sesión, para la campana de la cabecera (se pide desde el navegador
// con la página ya pintada, así no se retrasa ninguna pantalla)
export async function loadAttention(db: Db) {
	const [flatsRes, roomsRes, imagesRes, freshRes, openRes, readRes] = await Promise.all([
		db.from("flats").select("flat_id, approved"),
		db.from("rooms").select("id, slug, flat_id, approved, metaTitle_en, metaDescription_en"),
		db
			.from("rooms")
			.select("id, room_images!inner(id)")
			.eq("room_images.kind", "image")
			.limit(1, { referencedTable: "room_images" }),
		db.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
		db.from("leads").select("*", { count: "exact", head: true }).eq("status", "open"),
		db.from("notification_reads").select("key"),
	])

	const items = buildAttention({
		flats: flatsRes.data ?? [],
		rooms: roomsRes.data ?? [],
		roomsWithImages: new Set((imagesRes.data ?? []).map((r) => r.id)),
		freshLeads: freshRes.count ?? 0,
		openLeads: openRes.count ?? 0,
	})
	return { items, readKeys: (readRes.data ?? []).map((r) => r.key) }
}
