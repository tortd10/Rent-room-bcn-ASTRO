import type { Db } from "@/db/supabase"
import { IMAGES_BUCKET } from "@/lib/images"
import type { Room, RoomInput } from "@/types"

// Todas las funciones reciben el cliente: en admin, el de la petición (con la sesión
// del usuario, necesario para las políticas RLS de escritura).

// Obtener todas las habitaciones con info de piso
export async function getAllRooms(db: Db) {
	return await db
		.from("rooms")
		.select("id, slug, name, imageSrc, imageAlt, flat_id, available, status, flats(title, street, available)")
		.order("id", { ascending: true })
}

// Obtener habitación por ID con detalles de piso
export async function getRoomById(db: Db, id: number) {
	return await db.from("rooms").select("*, flats(title, street, mapImage)").eq("id", id).single()
}

// Obtener habitación por SLUG con todos los datos de su piso (maybeSingle: null si no existe)
export async function getRoomBySlug(db: Db, slug: string) {
	return await db.from("rooms").select("*, flats(*)").eq("slug", slug).maybeSingle()
}

// Crear nueva habitación (el id lo asigna Postgres)
export async function createRoom(
	db: Db,
	roomData: RoomInput
): Promise<{ data: Room | null; error: any }> {
	const { data, error } = await db.from("rooms").insert(roomData).select().single()
	if (error) console.error("Error creating room:", error)
	return { data: (data as Room) ?? null, error }
}

// Actualizar habitación existente
export async function updateRoom(
	db: Db,
	id: number,
	updates: Partial<Omit<Room, "id">>
): Promise<{ error: any }> {
	const { error } = await db.from("rooms").update(updates).eq("id", id)
	if (error) console.error("Error updating room:", error)
	return { error }
}

// Pisos disponibles para selects
export async function getAvailableFlats(db: Db) {
	return await db
		.from("flats")
		.select("flat_id, title")
		.eq("available", true)
		.order("title", { ascending: true })
}

// Eliminar una habitación junto con sus fotos y vídeos propios (los de zonas comunes del piso se conservan).
// Las filas de room_images se borran en cascada; los archivos de Storage hay que quitarlos aparte.
export async function deleteRoom(db: Db, id: number): Promise<{ error: any }> {
	const { data: media } = await db.from("room_images").select("path").eq("room_id", id)

	const { error } = await db.from("rooms").delete().eq("id", id)
	if (error) {
		console.error("Error deleting room:", error)
		return { error }
	}

	// Si falla la limpieza de Storage, la habitación ya está borrada: solo se avisa en el log
	const paths = (media ?? []).map((m) => m.path)
	if (paths.length) {
		const { error: storageError } = await db.storage.from(IMAGES_BUCKET).remove(paths)
		if (storageError) console.error("Error removing room media from storage:", storageError)
	}
	return { error: null }
}
