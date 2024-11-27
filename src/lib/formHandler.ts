import emailjs from "emailjs-com";

// Inicializa EmailJS
emailjs.init("kMxl9GUIW4TrqNfQ6");

/**
 * Maneja el envío del formulario usando EmailJS.
 * @param event - El evento de formulario que se dispara al enviar.
 */
export const handleSubmit = async (event: SubmitEvent): Promise<void> => {
  event.preventDefault(); // Evita que la página se recargue

  const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
  if (submitButton) {
    submitButton.textContent = "Enviando...";
    submitButton.disabled = true;
  }

  const serviceID = "service_etppj3q";
  const templateID = "template_tlh3lu7";

  try {
    const form = event.target as HTMLFormElement;
    await emailjs.sendForm(serviceID, templateID, form);
    alert("¡Mensaje enviado con éxito!");
    form.reset(); // Limpia el formulario después de enviarlo
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    alert("Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.");
  } finally {
    if (submitButton) {
      submitButton.textContent = "Enviar";
      submitButton.disabled = false;
    }
  }
};
