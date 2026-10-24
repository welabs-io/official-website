// TEXTO DA CENA: KNOWLY (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round. Copy of the Knowly
// memory-graph carousel (components/scene-kit/scenes/knowly-carousel.tsx). Generic subjects only (Contacto 4821,
// Propuesta 905, Pedido 1234...), no person and no vendor. `frames` and `zoom` are read by frame; `labels` by the key
// each label names; `legend` by the id of each swatch.
import type { SceneMessages } from "../../../types";

export const knowly: SceneMessages<"knowly"> = {
  title: "Memoria",
  label:
    "Knowly: la memoria de la empresa como un grafo que crece, de un tema a la constelación entera, con el vínculo más nuevo destacado",
  frames: [
    "Nace un tema",
    "Los vínculos crecen",
    "Otros temas se vinculan",
    "Toda la memoria",
  ],
  zoom: ["Zoom 100 %", "Zoom 60 %", "Zoom 30 %", "Zoom 8 %"],
  close: "¿Qué decidió tu empresa y ya olvidó?",
  closeNote:
    "Cada fuente nueva se vincula a lo que ya existe. Nada se borra, y cada respuesta muestra de dónde vino.",
  legend: {
    subject: "Tema",
    fact: "Hecho",
    link: "Vínculo",
    newest: "Más reciente",
  },
  labels: {
    subjectChip: "Contacto 4821 · mantenimiento",
    talk: "Conversación",
    visit: "Inspección",
    proposal: "Propuesta 905",
    meeting: "Reunión",
    policy: "Política de servicio",
    warranty: "Garantía",
    ticket: "Ticket 140",
    contract: "Contrato 52",
    invoice: "Factura 7710",
    order: "Pedido 1234",
    decision: "Decisión · 2 pruebas",
    subject: "Contacto 4821",
    billing: "Facturación",
    rules: "Normas",
    block: "Bloque B",
    purchases: "Compras",
    newest: "Vínculo nuevo · ahora",
  },
};
