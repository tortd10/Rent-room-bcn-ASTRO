// Guarda la consulta en Supabase (tabla leads) a través de /api/leads.
export async function saveLead(form: HTMLFormElement): Promise<boolean> {
	const f = new FormData(form)
	const get = (name: string) => f.get(name)?.toString() ?? ""
	const lang = location.pathname.split("/")[1] === "en" ? "en" : "es"

	try {
		const res = await fetch("/api/leads", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: get("from_name"),
				email: get("to_name"), // en las plantillas de EmailJS el campo "to_name" es el email
				phone: get("phone") || undefined,
				delivery_date: get("delivery_date") || undefined,
				message: get("message"),
				room_slug: get("room_slug") || undefined,
				website: get("website"),
				lang,
			}),
		})
		return res.ok
	} catch (err) {
		console.error("Error al guardar la consulta:", err)
		return false
	}
}
