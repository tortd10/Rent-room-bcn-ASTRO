import * as v from "valibot"

// Validación de las consultas del formulario (se usa en /api/leads).
export const LeadSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(120)),
	email: v.pipe(v.string(), v.trim(), v.email(), v.maxLength(200)),
	phone: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(40))),
	delivery_date: v.optional(v.pipe(v.string(), v.isoDate())),
	message: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(3000)),
	room_slug: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
	lang: v.optional(v.picklist(["es", "en"])),
	// Honeypot: los bots lo rellenan, las personas no lo ven
	website: v.optional(v.string()),
})
