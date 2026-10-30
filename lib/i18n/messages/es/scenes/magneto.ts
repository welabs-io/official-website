// TEXTO DA CENA: MAGNETO (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round. The text of the four
// frames of components/scene-kit/scenes/magneto-carousel.tsx (`f1..f4`); `frameNames` is read by position, one per
// frame. The product names drawn as labels (`domus`, `tuner`) are brands and stay as they are.
import type { SceneMessages } from "../../../types";

export const magneto: SceneMessages<"magneto"> = {
  product: "Magneto",
  title: "Flujos",
  label:
    "Magneto: la propuesta inicia el flujo sola, el trabajo se divide, espera la aprobación y termina sin nada dos veces",
  flow: "Aprobación de propuesta",
  active: "Activo",
  domus: "Welabs Domus",
  tuner: "Tuner",
  proposal: "Propuesta 905",
  frameNames: ["Empieza solo", "Divide", "Espera", "Termina"],
  f1: {
    source: "propuesta revisada",
    started: "Empezó solo",
    nobody: "nadie tuvo que presionar nada",
    nextLabel: "Siguiente paso",
    nextStep: "Revisar propuesta",
  },
  f2: {
    trigger: "Disparador",
    approval: "Aprobación de la gerencia",
    now: "ahora",
    contract: "Preparar contrato",
    same: "al mismo tiempo",
  },
  f3: {
    waiting: "Esperando a la gerencia",
    warned: "avisó a la gerencia",
    ready: "contrato listo",
    afterLabel: "Después de la aprobación",
    afterStep: "Enviar a firma",
  },
  f4: {
    approved: "Aprobado",
    by: "por la gerencia",
    sign: "Enviar a firma",
    failure: "Una falla a mitad de camino",
    concluded: "Terminado, sin nada dos veces",
    order: "Pedido 1234 creado",
    sent: "contrato enviado",
    question: "¿Cuánto trabajo se rehace en tu empresa?",
  },
};
