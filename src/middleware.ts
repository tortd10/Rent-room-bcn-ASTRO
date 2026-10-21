import { defineMiddleware } from "astro:middleware"
import { createSupabaseServer } from "./db/supabase"
import { isViewer } from "./lib/roles"

const LOGIN_PATH = "/admin"
const ELEVATE_PATH = "/admin/elevate"

const isAdminArea = (pathname: string) => pathname === LOGIN_PATH || pathname.startsWith("/admin/")

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url

	// Solo las rutas de admin y auth necesitan sesión; la web pública no.
	// /api/admin/* son endpoints de estado personal del usuario (p. ej. avisos leídos): llevan sesión, y los valida el propio endpoint
	if (!isAdminArea(pathname) && !pathname.startsWith("/api/auth/") && !pathname.startsWith("/api/admin/")) {
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

	context.locals.isViewer = isViewer(claims)

	// Todo /admin/* exige sesión; /admin (login) es público.
	if (pathname.startsWith("/admin/") && !context.locals.user) {
		return context.redirect(LOGIN_PATH)
	}

	// Usuario de solo lectura: puede navegar y ver todo, pero cualquier escritura (POST)
	// pide antes las credenciales de un administrador. Se bloquea aquí, antes de que la
	// página ejecute nada, para que ningún formulario existente o futuro se salte la restricción.
	if (context.locals.isViewer && pathname.startsWith("/admin/") && pathname !== ELEVATE_PATH) {
		const isWrite = context.request.method !== "GET" && context.request.method !== "HEAD"
		if (isWrite) {
			let next = pathname
			const referer = context.request.headers.get("Referer")
			if (isWrite && referer) {
				try {
					const url = new URL(referer)
					if (url.origin === context.url.origin) next = url.pathname + url.search
				} catch {
					// Referer mal formado: se vuelve a la ruta actual
				}
			}
			return context.redirect(`${ELEVATE_PATH}?next=${encodeURIComponent(next)}`)
		}
	}

	return next()
})
