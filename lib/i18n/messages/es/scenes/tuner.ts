// TEXTO DA CENA: TUNER (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round. Text of
// components/scene-kit/scenes/tuner-carousel.tsx; `channels`, `moreChannels` and `frames` are tuples read by position,
// with the length of pt-BR. Channels by category, never by vendor.
import type { SceneMessages } from "../../../types";

export const tuner: SceneMessages<"tuner"> = {
  product: "Tuner",
  title: "Canales",
  label:
    "Tuner: un mensaje sale por todos los canales a la vez, la lectura vuelve por canal y la respuesta llega a la conversación correcta",
  magneto: { title: "Magneto", meta: "pide el envío" },
  tuner: { title: "Tuner", meta: "central de canales" },
  message: {
    eyebrow: "Un mensaje · 17:03",
    figure: "Propuesta 905",
    note: "para el Contacto 4821, donde esté",
  },
  inFlight: "1 envío",
  sending: "Enviando",
  sent: "Enviado",
  delivered: "Entregado",
  readNow: "Leído ahora",
  read: "Leído",
  stat: { figure: "3", note: "canales en el mismo envío" },
  replyFrom: { title: "Mensaje", meta: "día 4 · 11:20" },
  reply: {
    eyebrow: "Respuesta recibida",
    figure: "Aceptado",
    note: "vuelve a la conversación correcta, venga de donde venga",
  },
  relloo: { title: "Relloo", meta: "Conversación 2210" },
  more: "Y más canales",
  ask: "¿Cuántos canales sigue integrando tu empresa uno por uno?",
  channels: ["Correo", "Mensaje", "Integración"],
  moreChannels: ["Voz", "Videollamada", "Comunidad", "Chat del sitio"],
  frames: [
    { name: "Mensaje", caption: "Envío de la Propuesta 905" },
    { name: "Envío", caption: "Envío de la Propuesta 905" },
    { name: "Lectura", caption: "Envío de la Propuesta 905" },
    { name: "Respuesta", caption: "Recepción" },
  ],
};
