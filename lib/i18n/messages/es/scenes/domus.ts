// TEXTO DA CENA: DOMUS (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round. The words of the
// Domus carousel (components/scene-kit/scenes/domus-carousel.tsx), four frames. Lists read by position (frames,
// frameNames, typeFields, list.cols, list.visits, recordLines) keep the length of pt-BR. Placeholders: `{count}` is the
// number of areas not named in the frame, `{names}` the first three of them (the component lowercases them and
// capitalises the sentence).
import type { SceneMessages } from "../../../types";

export const domus: SceneMessages<"domus"> = {
  label:
    "Domus: toda la gestión en un solo lugar, un tipo de registro nuevo que nace con su pantalla, y el registro que liga los otros productos",
  frames: [
    { title: "Módulos", label: "Las áreas de la empresa" },
    { title: "Tipo de registro", label: "El tipo nuevo se vuelve pantalla" },
    { title: "Inspecciones", label: "El asistente propone, tú confirmas" },
    { title: "Inspección 318", label: "El registro liga los otros productos" },
  ],
  frameNames: ["Áreas", "Tipo nuevo", "Asistente", "Todo ligado"],

  countText: "áreas de la empresa, en un solo lugar",
  rest: "+ {count} áreas",
  restLine: "{names} y más",
  newType: "Nuevo tipo de registro",

  type: "Inspección",
  typeFields: ["Dirección", "Fecha y hora", "Contacto"],
  screen: "Inspecciones",
  ready: "Lista para usar",

  list: {
    cols: ["Inspección", "Fecha y hora", "Estado"],
    visits: ["mañana, 09:00", "ayer, 14:00", "20/10, 10:30"],
  },
  assistant: "Asistente",
  context: "Oportunidad 562",
  ask: "agenda la inspección del Contacto 4821 para mañana a las 9",
  proposalHead: "Propuesta",
  record: "Inspección 318",
  recordLine: "mañana, 09:00 · Contacto 4821",
  confirm: "Confirmar",
  created: "Inspección 318 creada",
  undo: "Deshacer",
  scheduled: "Agendada",
  done: "Hecha",

  recordLines: [
    { label: "Contacto", value: "Contacto 4821" },
    { label: "Fecha y hora", value: "mañana, 09:00" },
  ],
  neighbours: {
    magneto: "el flujo sigue solo",
    tuner: "avisa al técnico",
    relloo: "la oportunidad avanza",
    knowly: "lo guarda en la memoria",
  },
  question: "¿Qué módulo necesita tu operación?",
};
