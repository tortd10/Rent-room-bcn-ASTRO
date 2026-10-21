import type { Lead, LeadStatus } from "@/types"

// Estados de una consulta y su aspecto
export const LEAD_STATUS: Record<LeadStatus, { label: string; badge: string }> = {
	new: { label: "Nuevo", badge: "bg-purple-100 text-purple-800" },
	open: { label: "Abierto", badge: "bg-teal-100 text-teal-800" },
	contacted: { label: "Contactado", badge: "bg-blue-100 text-blue-800" },
	closed: { label: "Cerrado", badge: "bg-gray-100 text-gray-700" },
}

// Orden en las listas: nuevas, luego abiertas y después el resto; dentro de cada grupo, por fecha
export const LEAD_ORDER: Record<LeadStatus, number> = { new: 0, open: 1, contacted: 2, closed: 2 }

// Flujo: Nueva → Abierta (sola, al abrir la consulta) → Contactada o Cerrada. Contactada → Cerrada.
// Una cerrada se puede reabrir. Estos son los únicos botones que ofrece cada estado; no hay forma de saltarse pasos.
export const FLOW_ACTIONS: Partial<Record<LeadStatus, { next: LeadStatus; label: string }[]>> = {
	open: [
		{ next: "contacted", label: "Marcar como contactado" },
		{ next: "closed", label: "Cerrar mensaje" },
	],
	contacted: [{ next: "closed", label: "Cerrar mensaje" }],
	closed: [{ next: "open", label: "Reabrir mensaje" }],
}

export const canMoveTo = (from: LeadStatus, to: LeadStatus) =>
	(from === "new" && to === "open") || !!FLOW_ACTIONS[from]?.some((action) => action.next === to)

// Datos que necesita el quickview de una consulta
export type QuickLead = {
	id: number
	name: string
	email: string
	phone: string | null
	deliveryDate: string | null
	lang: string
	message: string
	notes: string | null
	roomSlug: string | null
	date: string
	status: LeadStatus
}

type LeadSource = Pick<
	Lead,
	"id" | "name" | "email" | "phone" | "delivery_date" | "lang" | "message" | "notes" | "room_slug" | "created_at" | "status"
>

export const toQuickLead = (l: LeadSource, fmt: Intl.DateTimeFormat): QuickLead => ({
	id: l.id,
	name: l.name,
	email: l.email,
	phone: l.phone,
	deliveryDate: l.delivery_date,
	lang: l.lang,
	message: l.message,
	notes: l.notes,
	roomSlug: l.room_slug,
	date: fmt.format(new Date(l.created_at)),
	status: l.status,
})
