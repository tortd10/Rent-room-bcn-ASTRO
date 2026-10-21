import type { Db } from "@/db/supabase"
import { IMAGES_BUCKET } from "@/lib/images"
import type { Flat, FlatInput } from "@/types"

// Obtener todos los pisos
export async function getAllFlats(db: Db) {
	return await db.from("flats").select("*").order("flat_id", { ascending: true })
}

// Obtener un piso por su ID (flat_id); data es null si no existe
export async function getFlatById(db: Db, flatId: string) {
	return await db.from("flats").select("*").eq("flat_id", flatId).maybeSingle()
}

// Crear un piso
// Los pisos nuevos nacen pendientes de aprobación: no se publican hasta aprobarlos
export async function createFlat(db: Db, flat: FlatInput): Promise<{ error: any }> {
	const { error } = await db.from("flats").insert({ ...flat, approved: false })
	if (error) console.error("Error creating flat:", error)
	return { error }
}

// Aprobar un piso pendiente: a partir de aquí la web pública lo muestra
export async function approveFlat(db: Db, flatId: string): Promise<{ error: any }> {
	const { error } = await db.from("flats").update({ approved: true }).eq("flat_id", flatId)
	if (error) console.error("Error approving flat:", error)
	return { error }
}

// Actualizar un piso (el ID no se cambia: lo usan habitaciones, fotos y carpetas de Storage)
export async function updateFlat(
	db: Db,
	flatId: string,
	updates: Partial<Omit<Flat, "flat_id">>
): Promise<{ error: any }> {
	const { error } = await db.from("flats").update(updates).eq("flat_id", flatId)
	if (error) console.error("Error updating flat:", error)
	return { error }
}

// Eliminar un piso. Solo si no tiene habitaciones: así nunca se borran habitaciones por accidente.
// Sus fotos y vídeos de zonas comunes se borran en cascada (filas) y aquí los archivos de Storage.
export async function deleteFlat(
	db: Db,
	flatId: string
): Promise<{ error: any; blockedByRooms?: number }> {
	const { count } = await db
		.from("rooms")
		.select("*", { count: "exact", head: true })
		.eq("flat_id", flatId)
	if (count) return { error: null, blockedByRooms: count }

	const { data: media } = await db.from("room_images").select("path").eq("flat_id", flatId)

	const { error } = await db.from("flats").delete().eq("flat_id", flatId)
	if (error) {
		console.error("Error deleting flat:", error)
		return { error }
	}

	const paths = (media ?? []).map((m) => m.path)
	if (paths.length) {
		const { error: storageError } = await db.storage.from(IMAGES_BUCKET).remove(paths)
		if (storageError) console.error("Error removing flat media from storage:", storageError)
	}
	return { error: null }
}
