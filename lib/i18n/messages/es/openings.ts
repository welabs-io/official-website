// TEXTO DE LAS APERTURAS DE MARCA
// es (neutral, "tú"), adapted from pt-BR with the glossary of the copy round (control/portfolio/site-redesign/i18n/
// glossario.md): the same positions and list lengths, channel categories in the words of the Tuner scene.
import type { OpeningsMessages } from "../../types";

export const openings: OpeningsMessages = {
  domus: {
    rooms: [
      "Finanzas",
      "Fiscal",
      "Inventario",
      "Ventas",
      "Personas",
      "Proyectos",
    ],
  },
  relloo: {
    records: [
      "Contacto 4821",
      "Contacto 4822",
      "Contacto 4823",
      "Contacto 4824",
    ],
    channels: ["Mensaje", "Chat del sitio", "Voz", "Correo"],
  },
  magneto: {
    nodes: [
      "Disparador",
      "Hoja de cálculo",
      "Condición",
      "Aprobación",
      "Correo",
      "Integración",
      "Condición",
      "Espera",
      "Recordatorio",
      "Completado",
    ],
  },
  tuner: {
    channels: ["Mensaje", "Voz", "Chat del sitio", "Correo", "Comunidad"],
  },
  knowly: {
    cards: [
      { label: "Documento", sub: "Plazos" },
      { label: "Reunión", sub: "12/09" },
      { label: "Ticket", sub: "ATL-142" },
      { label: "Código", sub: "Propuestas" },
      { label: "Manual", sub: "Ventas" },
    ],
  },
};
