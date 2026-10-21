import type { FlatInput } from "@/types"

const text = (v: FormDataEntryValue | undefined) => v?.toString().trim() ?? ""
const optional = (v: FormDataEntryValue | undefined) => text(v) || null

// Convierte el FormData del admin en los campos de un piso.
export function parseFlatForm(formData: FormData): FlatInput {
	const f = Object.fromEntries(formData.entries())
	return {
		flat_id: text(f.flat_id),
		title: text(f.title),
		street: optional(f.street),
		neighborhood: optional(f.neighborhood),
		city: optional(f.city),
		postalCode: optional(f.postalCode),
		mapImage: optional(f.mapImage),
		available: f.available === "on",
	}
}

// Devuelve los errores de validación por campo ({} si todo está bien).
export function validateFlat(flat: FlatInput, { checkId }: { checkId: boolean }) {
	const errors: Record<string, string> = {}
	if (checkId && !/^[A-Za-z0-9]+$/.test(flat.flat_id))
		errors.flat_id = "El ID solo puede llevar letras y números (ej. FFCC71)"
	if (!flat.title) errors.title = "El título es requerido"
	// El mapa se incrusta en un iframe: solo se admiten URLs https
	if (flat.mapImage && !/^https:\/\//.test(flat.mapImage))
		errors.mapImage = "La URL del mapa debe empezar por https://"
	return errors
}
