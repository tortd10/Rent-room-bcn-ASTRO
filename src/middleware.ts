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
	// getClaims() verifica la firma del JWT en local con las claves públicas del proyecto (JWKS,
	// que se cachean), sin llamar a Supabase Auth en cada petición como hacía getUser(). Renueva
	// la sesión si el token ha caducado. Si el proyecto usara claves simétricas, hace de respaldo
	// una llamada a Auth.
	const { data } = await supabase.auth.getClaims()
	const claims = data?.claims

	context.locals.supabase = supabase
	context.locals.user = claims ? { id: claims.sub, email: claims.email ?? null } : null

	// Todo /admin/* exige sesión; /admin (login) es público.
	if (pathname.startsWith("/admin/") && !context.locals.user) {
		return context.redirect(LOGIN_PATH)
	}

	return next()
})
