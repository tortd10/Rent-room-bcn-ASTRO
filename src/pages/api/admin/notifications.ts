import type { APIRoute } from "astro"
import { loadAttention } from "@/lib/attention"

export const prerender = false

// Avisos de la campana de la cabecera: la lista de avisos y cuáles ha marcado como leídos el usuario con sesión
export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: "Sin sesión" }), { status: 401, headers: { "Content-Type": "application/json" } })
	}
	const data = await loadAttention(locals.supabase)
	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
	})
}
