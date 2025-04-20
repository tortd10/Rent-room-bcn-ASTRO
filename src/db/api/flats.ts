import { supabase } from "@/db/supabase"

// Obtener todos los pisos
export async function getAllFlats() {
  return await supabase
    .from("flats")
    .select("*")
}
