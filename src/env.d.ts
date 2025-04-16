/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		supabase: SupabaseClient
		user: import("@supabase/supabase-js").User | null
	}

	interface ImportMetaEnv {
		readonly PUBLIC_SUPABASE_URL: string
		readonly PUBLIC_SUPABASE_ANON_KEY: string
	}
}
