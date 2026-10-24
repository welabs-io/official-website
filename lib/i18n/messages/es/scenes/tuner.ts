// TEXTO DA CENA: TUNER (ES)
// TRADUÇÃO PENDENTE: cópia do pt-BR, a ser substituída pelo texto do idioma; chaves e placeholders ficam como estão.
// Text of the Tuner carousel (components/scene-kit/scenes/tuner-carousel.tsx), from the approved canvas frames.
// Text only: the glyph of each channel, the step ids, the tones and the order of the frames live in the component, which
// reads the lists below by position (`channels`, `moreChannels` and `frames` are tuples of fixed size).
import type { SceneMessages } from "../../../types";

export const tuner: SceneMessages<"tuner"> = {
  product: "Tuner",
  title: "Canais",
  label:
    "Tuner: uma mensagem sai por todos os canais de uma vez, a leitura volta por canal e a resposta cai na conversa certa",
  magneto: { title: "Magneto", meta: "pede o envio" },
  tuner: { title: "Tuner", meta: "central de canais" },
  message: {
    eyebrow: "Uma mensagem · 17:03",
    figure: "Proposta 905",
    note: "para o Contato 4821, onde ele estiver",
  },
  inFlight: "1 envio",
  sending: "Enviando",
  sent: "Enviado",
  delivered: "Entregue",
  readNow: "Lido agora",
  read: "Lido",
  stat: { figure: "3", note: "canais no mesmo envio" },
  replyFrom: { title: "Mensagem", meta: "dia 4 · 11:20" },
  reply: {
    eyebrow: "Resposta recebida",
    figure: "Aceito",
    note: "volta para a conversa certa, venha de onde vier",
  },
  relloo: { title: "Relloo", meta: "Conversa 2210" },
  more: "E mais canais",
  ask: "Quais canais a sua empresa usaria?",
  // The three channels of the send (e-mail, message, integration), in the order of the component
  channels: ["E-mail", "Mensagem", "Integração"],
  // The other channels of the Tuner (voice, video call, community, site chat), in the order of the component
  moreChannels: ["Voz", "Videochamada", "Comunidade", "Chat do site"],
  // The four frames: the name on the stage tab and the caption of the chrome bar
  frames: [
    { name: "Mensagem", caption: "Envio da Proposta 905" },
    { name: "Envio", caption: "Envio da Proposta 905" },
    { name: "Leitura", caption: "Envio da Proposta 905" },
    { name: "Resposta", caption: "Recebimento" },
  ],
};
