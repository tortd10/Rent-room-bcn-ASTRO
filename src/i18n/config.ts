import i18next from 'i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';

i18next.init({
    lng: 'en', // Idioma por defecto
    fallbackLng: 'en', // Idioma alternativo si no se encuentra traducción
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false, // No escapar valores
    },
  });
  
  export default i18next;