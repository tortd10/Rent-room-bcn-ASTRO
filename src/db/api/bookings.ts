
// Tipos TypeScript para tus tablas
type Room = {
  id: number
  slug: string
  name: string
  imageSrc?: string | null
  imageAlt?: string | null
  flat_id: string
  available: boolean
  status?: string
}

type Flat = {
  flat_id: string
  title: string
  street?: string | null
  mapImage?: string | null
  available: boolean
}


