import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { createServerClient, parseCookieHeader } from "@supabase/ssr"
import type { AstroCookies } from "astro"
import type { Database } from "./database.types"

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase environment variables")
}

// Cliente anónimo y sin sesión: solo para lecturas públicas (RLS: select público).
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
	},
})

// Cliente por petición: la sesión vive en cookies, nunca en memoria del servidor.
export type Db = SupabaseClient<Database>

export function createSupabaseServer(request: Request, cookies: AstroCookies) {
	return createServerClient<Database>(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
					({ name, value }) => ({ name, value: value ?? "" })
				)
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
			},
		},
	})
}
