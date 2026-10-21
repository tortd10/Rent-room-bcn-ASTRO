/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		supabase: import("@/db/supabase").Db
		// Datos mínimos del admin, sacados del JWT verificado (ver middleware.ts)
		user: { id: string; email: string | null } | null
		// true si el usuario es de solo lectura (ver lib/roles.ts)
		isViewer: boolean
	}
}

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_URL: string
	readonly PUBLIC_SUPABASE_ANON_KEY: string
}
