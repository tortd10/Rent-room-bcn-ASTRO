export type Flat = {
	flat_id: string
	title: string
	street?: string | null
	mapImage?: string | null
	neighborhood?: string | null
	city?: string | null
	postalCode?: string | null
	available: boolean
}

export type Room = {
	id: number
	slug: string
	name: string
	flat_id: string
	available: boolean
	status: "available" | "soon"
	imageSrc?: string | null
	imageAlt?: string | null
	metaTitle?: string | null
	metaDescription?: string | null
}

export type RoomInput = Omit<Room, "id" | "metaTitle" | "metaDescription">

export type FlatOption = Pick<Flat, "flat_id" | "title">
