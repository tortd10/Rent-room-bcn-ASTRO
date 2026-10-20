import type { Room, RoomInput } from "@/types"

const text = (v: FormDataEntryValue | undefined) => v?.toString().trim() ?? ""
const optional = (v: FormDataEntryValue | undefined) => text(v) || null

// Convierte el FormData del admin en los campos de una habitación.
export function parseRoomForm(formData: FormData): RoomInput {
	const f = Object.fromEntries(formData.entries())
	return {
		name: text(f.name),
		slug: text(f.slug),
		flat_id: text(f.flat_id),
		available: f.available === "on",
		status: (text(f.status) === "soon" ? "soon" : "available") as Room["status"],
		imageSrc: optional(f.imageSrc),
		imageAlt: optional(f.imageAlt),
		imageAlt_en: optional(f.imageAlt_en),
		metaTitle: optional(f.metaTitle),
		metaTitle_en: optional(f.metaTitle_en),
		metaDescription: optional(f.metaDescription),
		metaDescription_en: optional(f.metaDescription_en),
	}
}
