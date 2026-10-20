import emailjs from "emailjs-com"
import { saveLead } from "./leads"

// Inicializa EmailJS
emailjs.init("kMxl9GUIW4TrqNfQ6")

let lastSubmissionTime: number | null = null

/**
 * Maneja el envío del formulario usando EmailJS.
 * @param event - El evento de formulario que se dispara al enviar.
 */
export const handleSubmit = async (event: SubmitEvent): Promise<void> => {
	event.preventDefault() // Evita que la página se recargue

	const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null

	const currentTime = Date.now()

	// Comprueba si ha pasado un minuto desde el último envío
	if (lastSubmissionTime && currentTime - lastSubmissionTime < 60000) {
		alert("Por favor, espera un minuto antes de enviar otro mensaje.")
		return
	}

	if (submitButton) {
		submitButton.textContent = "Enviando..."
		submitButton.disabled = true
	}

	const serviceID = "service_etppj3q"
	const templateID = "template_tlh3lu7"

	try {
		const form = event.target as HTMLFormElement
		// Se guarda la consulta y se envía el email por separado: basta con que uno funcione
		const [saved, emailed] = await Promise.all([
			saveLead(form),
			emailjs.sendForm(serviceID, templateID, form).then(
				() => true,
				(error) => {
					console.error("Error al enviar el correo:", error)
					return false
				}
			),
		])
		if (!saved && !emailed) throw new Error("No se pudo guardar ni enviar la consulta")
		lastSubmissionTime = currentTime
		alert("¡Mensaje enviado con éxito!")
		form.reset() // Limpia el formulario después de enviarlo
	} catch (error) {
		console.error("Error al enviar el mensaje:", error)
		alert("Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.")
	} finally {
		if (submitButton) {
			submitButton.textContent = "Enviar"
			submitButton.disabled = false
		}
	}
}
