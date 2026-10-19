import type { SupabaseClient } from "@supabase/supabase-js"

// Obtener todos los pisos
export async function getAllFlats(db: SupabaseClient) {
	return await db.from("flats").select("*").order("flat_id", { ascending: true })
}
