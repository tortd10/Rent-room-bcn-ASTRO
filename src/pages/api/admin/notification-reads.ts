import type { APIRoute } from "astro"

export const prerender = false

const json = (body: object, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

// Avisos leídos del usuario con sesión. Es estado personal (no datos del negocio), por eso lo pueden
// cambiar también los usuarios de solo lectura; RLS garantiza que cada uno solo toca sus propias filas.
export const POST: APIRoute = async ({ request, locals }) => {
	if (!locals.user) return json({ error: "Sin sesión" }, 401)

	let body: { action?: string; keys?: unknown }
	try {
		body = await request.json()
	} catch {
		return json({ error: "Petición no válida" }, 400)
	}

	const keys = Array.isArray(body.keys)
		? body.keys.filter((k): k is string => typeof k === "string" && k.length > 0 && k.length <= 300).slice(0, 200)
		: []
	if (keys.length === 0 || (body.action !== "add" && body.action !== "remove")) {
		return json({ error: "Datos no válidos" }, 422)
	}

	const table = locals.supabase.from("notification_reads")
	const { error } =
		body.action === "add"
			? await table.upsert(
					keys.map((key) => ({ key })),
					{ onConflict: "user_id,key", ignoreDuplicates: true }
				)
			: await table.delete().in("key", keys)

	if (error) {
		console.error("Error guardando avisos leídos:", error)
		return json({ error: "No se pudo guardar" }, 500)
	}
	return json({ ok: true })
}
