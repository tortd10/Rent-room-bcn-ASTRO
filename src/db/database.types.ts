// Tipos del esquema de Supabase (ver supabase/schema.sql).
// Si cambias las tablas, regenera con: npx supabase gen types typescript --project-id grvodidhwrypmpuiqhey
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type FlatRow = {
	flat_id: string
	title: string
	street: string | null
	mapImage: string | null
	neighborhood: string | null
	city: string | null
	postalCode: string | null
	available: boolean
}

type LeadRow = {
	id: number
	created_at: string
	room_slug: string | null
	name: string
	email: string
	phone: string | null
	delivery_date: string | null
	message: string
	lang: string
	status: "new" | "contacted" | "closed"
	notes: string | null
}

type RoomImageRow = {
	id: number
	room_id: number | null // null = foto de zona común del piso
	flat_id: string // siempre el piso (lo rellena un trigger a partir de la habitación)
	path: string
	position: number
	kind: "image" | "video"
	created_at: string
}

type RoomRow = {
	id: number
	slug: string
	name: string
	imageSrc: string | null
	imageAlt: string | null
	flat_id: string
	available: boolean
	status: "available" | "soon"
	metaTitle: string | null
	metaDescription: string | null
	imageAlt_en: string | null
	metaTitle_en: string | null
	metaDescription_en: string | null
}

export type Database = {
	public: {
		Tables: {
			flats: {
				Row: FlatRow
				Insert: Partial<FlatRow> & Pick<FlatRow, "flat_id" | "title">
				Update: Partial<FlatRow>
				Relationships: []
			}
			rooms: {
				Row: RoomRow
				Insert: Partial<Omit<RoomRow, "id">> & Pick<RoomRow, "slug" | "name" | "flat_id">
				Update: Partial<Omit<RoomRow, "id">>
				Relationships: [
					{
						foreignKeyName: "rooms_flat_id_fkey"
						columns: ["flat_id"]
						isOneToOne: false
						referencedRelation: "flats"
						referencedColumns: ["flat_id"]
					},
				]
			}
			leads: {
				Row: LeadRow
				Insert: Partial<Omit<LeadRow, "id" | "created_at">> &
					Pick<LeadRow, "name" | "email" | "message">
				Update: Partial<Omit<LeadRow, "id" | "created_at">>
				Relationships: [
					{
						foreignKeyName: "leads_room_slug_fkey"
						columns: ["room_slug"]
						isOneToOne: false
						referencedRelation: "rooms"
						referencedColumns: ["slug"]
					},
				]
			}
			room_images: {
				Row: RoomImageRow
				Insert: Partial<Omit<RoomImageRow, "id" | "created_at">> & Pick<RoomImageRow, "path">
				Update: Partial<Omit<RoomImageRow, "id" | "created_at">>
				Relationships: []
			}
		}
		Views: { [_ in never]: never }
		Functions: { [_ in never]: never }
		Enums: { [_ in never]: never }
		CompositeTypes: { [_ in never]: never }
	}
}
