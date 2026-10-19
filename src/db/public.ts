import { supabase } from "@/db/supabase"
import { FLATS as LOCAL_FLATS } from "@/data/flats"
import { ROOMS as LOCAL_ROOMS } from "@/data/rooms"
import type { Flat, Room } from "@/types"

// Lecturas públicas con respaldo: si Supabase falla (caída, red, proyecto pausado),
// se sirve la copia local de src/data para que la web no se quede sin contenido.

const fallbackFlats = (): Flat[] => LOCAL_FLATS.map((f) => ({ ...f, available: true }))

const fallbackRooms = (): Room[] =>
	LOCAL_ROOMS.map(({ roomFlat, ...r }, i) => ({
		...r,
		id: i + 1,
		flat_id: roomFlat,
		status: r.status as Room["status"],
	}))

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

export function getRooms({ availableOnly = false } = {}): Promise<Room[]> {
	return withFallback(
		"rooms",
		() => {
			const q = supabase.from("rooms").select("*").order("id", { ascending: true })
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
