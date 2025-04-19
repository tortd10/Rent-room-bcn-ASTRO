// src/middleware.ts
import { defineMiddleware } from "astro:middleware"
import { supabase } from "./db/supabase"

export const onRequest = defineMiddleware(async (context, next) => {
	// 1. Obtiene la sesión del usuario desde Supabase
	const {
		data: { session },
	} = await supabase.auth.getSession()

	// 2. Inyecta el usuario en `Astro.locals` (accesible en todos los componentes)
	context.locals.user = session?.user || null

	// 3. Opcional: Añade cookies para SSR persistente
	context.cookies.set("sb-access-token", session?.access_token || "", {
		path: "/",
		httpOnly: true,
		secure: true,
	})

	return next()
})
