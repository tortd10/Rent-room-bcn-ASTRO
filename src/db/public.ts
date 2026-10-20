import { supabase } from "@/db/supabase"
import { FLATS as LOCAL_FLATS } from "@/data/flats"
import { ROOMS as LOCAL_ROOMS } from "@/data/rooms"
import { ROOMS_EN } from "@/data/rooms.en"
import { publicImageUrl } from "@/lib/images"
import type { Flat, Room, RoomListItem } from "@/types"

// Lecturas públicas con respaldo: si Supabase falla (caída, red, proyecto pausado),
// se sirve la copia local de src/data para que la web no se quede sin contenido.

const fallbackFlats = (): Flat[] => LOCAL_FLATS.map((f) => ({ ...f, available: true }))

const fallbackRooms = (): Room[] =>
	LOCAL_ROOMS.map(({ roomFlat, ...r }, i) => ({
		...r,
		id: i + 1,
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

// Devuelve null si la habitación no existe (no es un error de la BD).
export async function getRoomBySlug(slug: string): Promise<Room | null> {
	try {
		const { data, error } = await supabase.from("rooms").select("*").eq("slug", slug).maybeSingle()
		if (error) throw error
		return data as Room | null
	} catch (err) {
		console.error("[supabase] room falló, usando datos locales:", err)
		return fallbackRooms().find((r) => r.slug === slug) ?? null
	}
}

// Medios de la ficha desde Supabase Storage:
//  · images: las de la habitación y luego las de zonas comunes del piso (room_id nulo)
//  · videos: los de la habitación y luego los del piso
// Si la habitación aún no tiene fotos subidas, images es [] y la ficha usa /public.
export async function getRoomMedia(
	room: Pick<Room, "id" | "flat_id">
): Promise<{ images: string[]; videos: string[] }> {
	const empty = { images: [], videos: [] }
	try {
		const { data, error } = await supabase
			.from("room_images")
			.select("path, kind, room_id, position")
			.eq("flat_id", room.flat_id)
			.or(`room_id.eq.${room.id},room_id.is.null`)
			.order("position", { ascending: true })
		if (error) throw error

		const urls = (kind: "image" | "video") => {
			const rows = data.filter((r) => r.kind === kind)
			// Primero las de la habitación, luego las comunes del piso
			return [...rows.filter((r) => r.room_id !== null), ...rows.filter((r) => r.room_id === null)].map(
				(r) => publicImageUrl(r.path)
			)
		}
		const ownImages = data.some((r) => r.kind === "image" && r.room_id !== null)
		return { images: ownImages ? urls("image") : [], videos: urls("video") }
	} catch (err) {
		console.error("[supabase] room_images falló, usando medios locales:", err)
		return empty
	}
}
