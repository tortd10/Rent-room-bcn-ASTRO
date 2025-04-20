import { supabase } from "@/db/supabase"

// Tipos TypeScript para tus tablas
type Room = {
  id: number
  slug: string
  name: string
  imageSrc?: string | null
  imageAlt?: string | null
  flat_id: string
  available: boolean
  status?: string
}

type Flat = {
  flat_id: string
  title: string
  street?: string | null
  mapImage?: string | null
  available: boolean
}

// Obtener todas las habitaciones con info de piso
export async function getAllRooms() {
  return await supabase
    .from("rooms")
    .select("*, flats(title, street, available)")
}

// Obtener habitación por ID con detalles de piso
export async function getRoomById(id: number) {
  return await supabase
    .from("rooms")
    .select("*, flats(title, street, mapImage)")
    .eq("id", id)
    .single()
}

// Obtener habitación por SLUG con detalles de piso
export async function getRoomBySlug(id: string) {
	return await supabase
  .from("rooms")
  .select("*, flats(title, street)")
  .eq("slug", id)
  .single()
}
// Crear nueva habitación
export async function createRoom(roomData: {
	name: string;
	slug: string;
	flat_id: string;
	available: boolean;
	status: string;
	imageSrc?: string | null;
	imageAlt?: string | null;
  }): Promise<{ data: Room | null, error: any }> {
	try {
	  // Generar ID incremental (como en tu solución anterior)
	  const { data: maxIdData } = await supabase
		.from('rooms')
		.select('id')
		.order('id', { ascending: false })
		.limit(1)
		.single();
  
	  const newId = maxIdData?.id ? maxIdData.id + 1 : 1;
  
	  
	  // Insertar la nueva habitación
	  const { data, error } = await supabase
		.from('rooms')
		.insert({
		  id: newId,
		  ...roomData
		})
		.select()
		.single();
  
	  if (error) throw error;
	  
	  return { data: data as Room, error: null };
	} catch (error) {
	  console.error('Error creating room:', error);
	  return { data: null, error };
	}
  }

// Actualizar habitación existente
export async function updateRoom(
	id: number,
	updates: Partial<Room>
  ): Promise<{ error: any }> {
	try {  
	  const { error } = await supabase
		.from('rooms')
		.update(updates)
		.eq('id', id);
  
	  if (error) {
		console.error('Error de Supabase:', {
		  message: error.message,
		  details: error.details,
		  hint: error.hint,
		  code: error.code
		});
		return { error };
	  }
  	  return { error: null };
	} catch (err) {
	  console.error('Error inesperado:', err);
	  return { error: err };
	}
  }
// Estadísticas para dashboard
export async function getRoomsStats() {
  const { count: total } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })

  const { count: available } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("available", true)

  const { count: activeFlats } = await supabase
    .from("flats")
    .select("*", { count: "exact", head: true })
    .eq("available", true)

  return { 
    totalRooms: total, 
    availableRooms: available,
    activeFlats
  }
}

// Últimas habitaciones añadidas
export async function getRecentRooms(limit = 5) {
  return await supabase
    .from("rooms")
    .select("id, name, available, flat_id, flats(title)")
    .limit(limit)
}

// Obtener pisos disponibles para selects
export async function getAvailableFlats() {
  return await supabase
    .from("flats")
    .select("flat_id, title")
    .eq("available", true)
    .order("title", { ascending: true })
}
