// TEXTO DA CENA: RELLOO (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round. Text of the
// four-frame carousel (components/scene-kit/scenes/relloo-carousel.tsx); `frameNames` and `past` are read by position,
// so they keep the length of pt-BR. The pace of the clock follows the length of the typed phrases (`rellooSteps`).
import type { SceneMessages } from "../../../types";

export const relloo: SceneMessages<"relloo"> = {
  label:
    "Relloo: un mensaje se vuelve oportunidad y avanza en el embudo, en cuatro momentos",
  conversation: "Conversación 2210",
  contact: "Contacto 4821",
  linked: "Ligada a la gestión",
  before: "+ 2 canales usados antes",
  owner: "Responsable",
  agent: "Agente de atención",
  team: "Equipo comercial",
  today: "Hoy",
  message: "Mensaje",
  asked: "Necesito mantenimiento mensual para 3 equipos del bloque B.",
  askedAt: "08:12",
  reply: "Escribir a Contacto 4821",
  send: "Enviar",
  previous: "Antes",
  now: "Responsable ahora",
  why: "pidió propuesta",
  agentSaid: "¿Qué modelo son los equipos? Dejo todo listo para la propuesta.",
  agentAt: "08:12",
  answer: "Son 3 equipos de 12.000 BTU. Quiero una propuesta.",
  answerAt: "08:19",
  summaryReady: "Resumen listo para el equipo",
  summaryLong:
    "Mantenimiento mensual, 3 equipos de 12.000 BTU en el bloque B. Pidió propuesta.",
  summary: "Resumen",
  summaryShort:
    "Mantenimiento mensual, 3 equipos en el bloque B. Pidió propuesta.",
  history: "3 canales · un solo historial",
  deals: "Oportunidades",
  born: "Nueva oportunidad",
  bornAt: "ahora",
  deal: "Oportunidad",
  dealNumber: "562",
  bornFrom: "Nació de la Conversación 2210, con el resumen incluido",
  moves: "avanza en el embudo y lo demás pasa solo",
  funnel: "Embudo",
  domus: "Welabs Domus",
  visit: "Inspección 318 agendada",
  question: "¿Quién responde primero en tu empresa?",
  inbox: "Bandeja de entrada",
  service: "Atención",
  person: "Contactos",
  frameNames: ["Llega", "Pasa el turno", "Es oportunidad", "Avanza"],
  past: [
    { date: "12/08", text: "Correo · cotización de limpieza de ductos" },
    { date: "03/09", text: "Voz · llamada transcrita" },
  ],
};
