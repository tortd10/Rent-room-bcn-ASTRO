// src/pages/api/auth/logout.ts
import { supabase } from "@/db/supabase"
import type { APIRoute } from "astro"

export const POST: APIRoute = async () => {
	// 1. Cerrar sesión en Supabase
	const { error } = await supabase.auth.signOut()

	if (error) {
		return new Response(JSON.stringify({ error: "Logout failed" }), {
			status: 500,
		})
	}

	// 2. Borrar cookie y redirigir
	return new Response(null, {
		status: 302,
		headers: new Headers({
			"Location": "/admin",
			"Set-Cookie":
				"sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure",
		}),
	})
}
