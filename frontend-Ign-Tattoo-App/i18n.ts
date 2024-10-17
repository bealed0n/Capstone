import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Inicializar i18next
i18n
    .use(HttpBackend) // Cargar archivos de traducción desde un servidor
    .use(LanguageDetector) // Detectar el idioma del navegador/dispositivo
    .use(initReactI18next) // Integración con React
    .init({
        fallbackLng: 'en', // Idioma por defecto si no se detecta uno
        debug: true, // Para ver mensajes de consola
        interpolation: {
            escapeValue: false, // React ya maneja el escape de valores
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json', // Ruta a los archivos de traducción
        },
    });

export default i18n;
