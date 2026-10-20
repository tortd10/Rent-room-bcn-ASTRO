import type { Db } from "@/db/supabase"

// Obtener todos los pisos
export async function getAllFlats(db: Db) {
	return await db.from("flats").select("*").order("flat_id", { ascending: true })
}
