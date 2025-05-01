// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { supabase } from "./db/supabase";

const SUPPORTED_LANGS = ['es', 'en'];
const EXCLUDED_PATHS = ['404', 'api', '_astro', 'favicon.ico', 'utils'];
const LOGIN_PATH = '/admin';
const PUBLIC_PATHS = [LOGIN_PATH];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  const isSecure = url.protocol === 'https:';
  const domain = url.hostname === 'localhost' ? undefined : `.${url.hostname}`;

  // 1. Excluir rutas técnicas y assets
  if (EXCLUDED_PATHS.some(path => pathname.includes(path))) {
    return next();
  }

  // 2. Manejo de sesión
  const { data: { session } } = await supabase.auth.getSession();
  context.locals.user = session?.user || null;

  // 3. Manejo de cookies
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    domain,
    maxAge: 604800 // 1 semana
  };

  const deleteOptions = {
    path: "/",
    domain
  };

  if (session?.access_token) {
    context.cookies.set("sb-access-token", session.access_token, cookieOptions);
    
    // Cookie adicional para compatibilidad
    context.cookies.set("sb-token-fallback", session.access_token, {
      ...cookieOptions,
      sameSite: 'lax'
    });
  } else {
    context.cookies.delete("sb-access-token", deleteOptions);
    context.cookies.delete("sb-token-fallback", deleteOptions);
  }

  // 4. Permitir rutas públicas
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return next();
  }

// 5. Proteger TODAS las rutas bajo /admin (excepto el login)
if (pathname.startsWith('/admin/') && pathname !== LOGIN_PATH) {
	if (!session) {
	  return new Response(null, {
		status: 302,
		headers: { 'Location': LOGIN_PATH }
	  });
	}
	return next();
  }

  // 6. Verificación de idiomas para rutas principales
  if (pathSegments.length > 0 && pathSegments[0] === 'lang') {
    const lang = pathSegments[1];
    if (!SUPPORTED_LANGS.includes(lang)) {
      return new Response(null, {
        status: 307,
        headers: { 'Location': '/404' }
      });
    }
  }

  return next();
});