import type { Database } from "@/db/database.types"

export type Flat = Database["public"]["Tables"]["flats"]["Row"]
export type Room = Database["public"]["Tables"]["rooms"]["Row"]
export type Lead = Database["public"]["Tables"]["leads"]["Row"]
export type LeadStatus = Lead["status"]
export type RoomImage = Database["public"]["Tables"]["room_images"]["Row"]

// Listados: sin los textos SEO, que solo hacen falta en la ficha
export type RoomListItem = Omit<
	Room,
	"metaTitle" | "metaDescription" | "metaTitle_en" | "metaDescription_en" | "imageAlt_en"
>

export type RoomInput = Omit<Room, "id">
export type FlatOption = Pick<Flat, "flat_id" | "title">
