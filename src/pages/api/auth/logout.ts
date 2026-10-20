import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ locals, redirect }) => {
	// Invalida la sesión y limpia las cookies de Supabase
	await locals.supabase.auth.signOut()
	return redirect("/admin")
}
