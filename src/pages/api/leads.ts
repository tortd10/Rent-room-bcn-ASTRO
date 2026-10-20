import { supabase } from "@/db/supabase"
import { LeadSchema } from "@/lib/leadSchema"
import type { APIRoute } from "astro"
import * as v from "valibot"

export const prerender = false

const json = (body: object, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

export const POST: APIRoute = async ({ request }) => {
	let payload: unknown
	try {
		payload = await request.json()
	} catch {
		return json({ error: "Petición no válida" }, 400)
	}

	const parsed = v.safeParse(LeadSchema, payload)
	if (!parsed.success) return json({ error: "Datos no válidos" }, 422)

	const { website, delivery_date, phone, room_slug, ...lead } = parsed.output

	// Honeypot: respondemos OK sin guardar para no dar pistas al bot
	if (website) return json({ ok: true })

	const { error } = await supabase.from("leads").insert({
		...lead,
		phone: phone || null,
		delivery_date: delivery_date || null,
		room_slug: room_slug || null,
	})

	if (error) {
		console.error("[leads] no se pudo guardar:", error)
		return json({ error: "No se pudo guardar la consulta" }, 500)
	}
	return json({ ok: true })
}
