import { defineMiddleware } from "astro:middleware"
import { createSupabaseServer } from "./db/supabase"

const LOGIN_PATH = "/admin"

const isAdminArea = (pathname: string) => pathname === LOGIN_PATH || pathname.startsWith("/admin/")

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url

	// Solo las rutas de admin y auth necesitan sesión; la web pública no.
	if (!isAdminArea(pathname) && !pathname.startsWith("/api/auth/")) {
		return next()
	}

	const supabase = createSupabaseServer(context.request, context.cookies)
	// getUser() valida el JWT contra Supabase Auth (getSession() solo lee la cookie).
	const {
		data: { user },
	} = await supabase.auth.getUser()

	context.locals.supabase = supabase
	context.locals.user = user

	// Todo /admin/* exige sesión; /admin (login) es público.
	if (pathname.startsWith("/admin/") && !user) {
		return context.redirect(LOGIN_PATH)
	}

	return next()
})
