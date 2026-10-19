import type { SupabaseClient } from "@supabase/supabase-js"
import type { Room, RoomInput } from "@/types"

// Todas las funciones reciben el cliente: en admin, el de la petición (con la sesión
// del usuario, necesario para las políticas RLS de escritura).

// Obtener todas las habitaciones con info de piso
export async function getAllRooms(db: SupabaseClient) {
	return await db
		.from("rooms")
		.select("*, flats(title, street, available)")
		.order("id", { ascending: true })
}

// Obtener habitación por ID con detalles de piso
export async function getRoomById(db: SupabaseClient, id: number) {
	return await db.from("rooms").select("*, flats(title, street, mapImage)").eq("id", id).single()
}

// Obtener habitación por SLUG con detalles de piso
export async function getRoomBySlug(db: SupabaseClient, slug: string) {
	return await db.from("rooms").select("*, flats(title, street)").eq("slug", slug).single()
}

// Crear nueva habitación (el id lo asigna Postgres)
export async function createRoom(
	db: SupabaseClient,
	roomData: RoomInput
): Promise<{ data: Room | null; error: any }> {
	const { data, error } = await db.from("rooms").insert(roomData).select().single()
	if (error) console.error("Error creating room:", error)
	return { data: (data as Room) ?? null, error }
}

// Actualizar habitación existente
export async function updateRoom(
	db: SupabaseClient,
	id: number,
	updates: Partial<Room>
): Promise<{ error: any }> {
	const { error } = await db.from("rooms").update(updates).eq("id", id)
	if (error) console.error("Error updating room:", error)
	return { error }
}

// Estadísticas para dashboard
export async function getRoomsStats(db: SupabaseClient) {
	const count = (table: string, onlyAvailable = false) => {
		const q = db.from(table).select("*", { count: "exact", head: true })
		return onlyAvailable ? q.eq("available", true) : q
	}
	const [rooms, availableRooms, flats, availableFlats] = await Promise.all([
		count("rooms"),
		count("rooms", true),
		count("flats"),
		count("flats", true),
	])
	return {
		roomsCount: rooms.count,
		availableRoomsCount: availableRooms.count,
		flatsCount: flats.count,
		availableFlatsCount: availableFlats.count,
	}
}

// Pisos disponibles para selects
export async function getAvailableFlats(db: SupabaseClient) {
	return await db
		.from("flats")
		.select("flat_id, title")
		.eq("available", true)
		.order("title", { ascending: true })
}
