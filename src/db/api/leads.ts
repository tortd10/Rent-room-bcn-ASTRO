import type { Db } from "@/db/supabase"
import type { LeadStatus } from "@/types"

// Consultas recibidas por los formularios (solo admins pueden leerlas: RLS)
export async function getLeads(db: Db, status?: LeadStatus) {
	const q = db
		.from("leads")
		.select("*, rooms(name)")
		.order("created_at", { ascending: false })
		.limit(200)
	return await (status ? q.eq("status", status) : q)
}

export async function updateLeadStatus(db: Db, id: number, status: LeadStatus) {
	return await db.from("leads").update({ status }).eq("id", id)
}

export async function countNewLeads(db: Db) {
	const { count } = await db
		.from("leads")
		.select("*", { count: "exact", head: true })
		.eq("status", "new")
	return count ?? 0
}
