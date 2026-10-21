import type { Db } from "@/db/supabase"
import type { LeadStatus } from "@/types"

export type LeadFilters = {
	status?: LeadStatus | LeadStatus[]
	search?: string
	room?: string
	roomSlugs?: string[] // habitaciones de un piso
	from?: string // YYYY-MM-DD
	to?: string // YYYY-MM-DD
}

// Consultas recibidas por los formularios (solo admins pueden leerlas: RLS).
// Devuelve solo un índice ligero (id, estado y fecha): con él la página cuenta, ordena y pagina sin descargar
// todos los mensajes; las consultas completas de cada página se piden con getLeadsByIds.
export async function getLeads(db: Db, filters: LeadFilters = {}) {
	let q = db.from("leads").select("id, status, created_at").order("created_at", { ascending: false }).limit(1000)

	if (Array.isArray(filters.status)) q = q.in("status", filters.status)
	else if (filters.status) q = q.eq("status", filters.status)
	if (filters.room) q = q.eq("room_slug", filters.room)
	if (filters.roomSlugs) q = q.in("room_slug", filters.roomSlugs)
	if (filters.from) q = q.gte("created_at", filters.from)
	if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59`)

	// Los caracteres propios de la sintaxis de filtros se quitan para que el texto buscado no los rompa
	const term = filters.search?.replace(/[,()"\\%*]/g, " ").trim()
	if (term) {
		q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%,message.ilike.%${term}%,room_slug.ilike.%${term}%`)
	}
	return await q
}

export async function getLeadsByIds(db: Db, ids: number[]) {
	return await db.from("leads").select("*").in("id", ids)
}

export async function getLeadStatus(db: Db, id: number) {
	return await db.from("leads").select("status").eq("id", id).maybeSingle()
}

export async function updateLeadStatus(db: Db, id: number, status: LeadStatus) {
	return await db.from("leads").update({ status }).eq("id", id)
}

export async function updateLeadNotes(db: Db, id: number, notes: string | null) {
	return await db.from("leads").update({ notes }).eq("id", id)
}
