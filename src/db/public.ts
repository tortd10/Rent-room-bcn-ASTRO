import { supabase } from "@/db/supabase"
import { FLATS as LOCAL_FLATS } from "@/data/flats"
import { ROOMS as LOCAL_ROOMS } from "@/data/rooms"
import { ROOMS_EN } from "@/data/rooms.en"
import { publicImageUrl } from "@/lib/images"
import type { Flat, Room, RoomListItem } from "@/types"

// Lecturas públicas con respaldo: si Supabase falla (caída, red, proyecto pausado),
// se sirve la copia local de src/data para que la web no se quede sin contenido.

const fallbackFlats = (): Flat[] => LOCAL_FLATS.map((f) => ({ ...f, available: true, approved: true }))

const fallbackRooms = (): Room[] =>
	LOCAL_ROOMS.map(({ roomFlat, ...r }, i) => ({
		...r,
		id: i + 1,
		approved: true,
		flat_id: roomFlat,
		status: r.status as Room["status"],
		imageAlt_en: ROOMS_EN[r.slug]?.imageAlt ?? null,
		metaTitle_en: ROOMS_EN[r.slug]?.metaTitle ?? null,
		metaDescription_en: ROOMS_EN[r.slug]?.metaDescription ?? null,
	}))

// Los listados no necesitan metaTitle/metaDescription (solo la ficha de la habitación)
const ROOM_LIST_COLUMNS = "id, slug, name, imageSrc, imageAlt, flat_id, available, status"

async function withFallback<T>(
	label: string,
	query: () => PromiseLike<{ data: T | null; error: unknown }>,
	fallback: () => T
): Promise<T> {
	try {
		const { data, error } = await query()
		if (error || !data) throw error ?? new Error("sin datos")
		return data
	} catch (err) {
		console.error(`[supabase] ${label} falló, usando datos locales:`, err)
		return fallback()
	}
}

export function getFlats({ availableOnly = false } = {}): Promise<Flat[]> {
	return withFallback(
		"flats",
		() => {
			const q = supabase.from("flats").select("*").order("flat_id", { ascending: true })
			return availableOnly ? q.eq("available", true) : q
		},
		fallbackFlats
	)
}

export function getRooms({ availableOnly = false } = {}): Promise<RoomListItem[]> {
	return withFallback(
		"rooms",
		() => {
			const q = supabase.from("rooms").select(ROOM_LIST_COLUMNS).order("id", { ascending: true })
			return availableOnly ? q.eq("available", true) : q
		},
		fallbackRooms
	)
}

export type RoomMedia = { images: string[]; videos: string[] }
export type RoomPageData = { room: Room; flat: Flat | undefined; media: RoomMedia }

type MediaRow = { path: string; kind: "image" | "video" }

// Todo lo que necesita la ficha de una habitación en UNA sola ronda de consultas (en paralelo):
//  · la habitación con sus fotos y vídeos propios
//  · los pisos con sus fotos y vídeos de zonas comunes (room_id nulo)
// Antes eran tres consultas encadenadas y cada una cuesta un viaje a la base de datos.
// Si Supabase falla, se usa la copia local (sin medios de Storage: la ficha usa /public).
// Devuelve null si la habitación no existe.
export async function getRoomPage(slug: string): Promise<RoomPageData | null> {
	try {
		const [roomRes, flatsRes] = await Promise.all([
			supabase
				.from("rooms")
				.select("*, room_images(path, kind, position)")
				.eq("slug", slug)
				.order("position", { referencedTable: "room_images", ascending: true })
				.maybeSingle(),
			supabase
				.from("flats")
				.select("*, room_images(path, kind, position)")
				.is("room_images.room_id", null)
				.order("position", { referencedTable: "room_images", ascending: true }),
		])
		if (roomRes.error) throw roomRes.error
		if (flatsRes.error) throw flatsRes.error
		if (!roomRes.data) return null

		const { room_images: ownMedia, ...room } = roomRes.data
		const flatRow = flatsRes.data.find((f) => f.flat_id === room.flat_id)
		const { room_images: commonMedia = [], ...flat } = flatRow ?? ({} as never)

		const urls = (rows: MediaRow[], kind: MediaRow["kind"]) =>
			rows.filter((r) => r.kind === kind).map((r) => publicImageUrl(r.path))

		// Sin fotos propias subidas, la galería no usa Storage y la ficha cae a las de /public
		const hasOwnImages = ownMedia.some((m) => m.kind === "image")
		return {
			room: room as Room,
			flat: flatRow ? (flat as Flat) : undefined,
			media: {
				images: hasOwnImages ? [...urls(ownMedia, "image"), ...urls(commonMedia, "image")] : [],
				videos: [...urls(ownMedia, "video"), ...urls(commonMedia, "video")],
			},
		}
	} catch (err) {
		console.error("[supabase] ficha de habitación falló, usando datos locales:", err)
		const room = fallbackRooms().find((r) => r.slug === slug)
		if (!room) return null
		return {
			room,
			flat: fallbackFlats().find((f) => f.flat_id === room.flat_id),
			media: { images: [], videos: [] },
		}
	}
}
