// El rol vive en app_metadata.role del usuario de Supabase (solo editable con la service key,
// nunca desde el navegador). Sin rol, o con cualquier otro valor, es administrador: así los
// usuarios que ya existían siguen funcionando. Solo "viewer" queda en modo solo lectura.
export const VIEWER_ROLE = "viewer"

type WithAppMetadata = { app_metadata?: Record<string, unknown> | null }

export const isViewer = (source: WithAppMetadata | null | undefined) =>
	source?.app_metadata?.role === VIEWER_ROLE


// Solo se acepta una ruta interna del panel como destino tras elevar el rol
export const safeNext = (value: string | null | undefined) =>
	value && /^\/admin\/[^/\\]/.test(value) && !value.startsWith("//") ? value : "/admin/dashboard"
