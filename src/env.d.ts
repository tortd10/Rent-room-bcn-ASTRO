/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		supabase: SupabaseClient
		user: import("@supabase/supabase-js").User | null
	}
}
