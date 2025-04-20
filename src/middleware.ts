// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { supabase } from "./db/supabase";

const SUPPORTED_LANGS = ['es', 'en'];
const EXCLUDED_PATHS = ['404', 'api', '_astro', 'favicon.ico'];
const ADMIN_PREFIX = '/admin';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  // 1. Permitir todas las rutas admin sin verificación de idioma
  if (url.pathname.startsWith(ADMIN_PREFIX)) {
    // Opcional: Añadir verificación de autenticación solo para admin
  const { data: { session } } = await supabase.auth.getSession();
    if (!session && !url.pathname.startsWith('/admin')) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/admin' }
      });
    }
    context.locals.user = session?.user || null;
    return next();
  }

  // 2. Excluir rutas técnicas
  if (EXCLUDED_PATHS.some(path => url.pathname.includes(path))) {
    return next();
  }

  // 3. Verificar idiomas para rutas no-admin
  if (pathSegments.length > 0 && !SUPPORTED_LANGS.includes(pathSegments[0])) {
    if (!url.pathname.startsWith('/404')) {
      return new Response(null, {
        status: 307,
        headers: { 'Location': '/404' }
      });
    }
  }

  // 4. Autenticación para rutas principales
  const { data: { session } } = await supabase.auth.getSession();
  context.locals.user = session?.user || null;

  if (session?.access_token) {
    context.cookies.set("sb-access-token", session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
    });
  }

  return next();
});