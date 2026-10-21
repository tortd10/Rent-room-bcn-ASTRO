// Marca los cambios que hace esta misma pestaña para que el refresco en directo (LiveRefresh) no recargue
// la página por un cambio que ya está pintado: solo recarga por lo que hacen otras personas.
const IGNORE_MS = 4000

type Marked = Window & { __lastLocalChange?: number }

export const markLocalChange = () => {
	;(window as Marked).__lastLocalChange = Date.now()
}

export const isRecentLocalChange = () => Date.now() - ((window as Marked).__lastLocalChange ?? 0) < IGNORE_MS
