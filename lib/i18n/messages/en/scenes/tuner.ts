// TEXTO DA CENA: TUNER (EN)
// en-US, adapted from pt-BR with the glossary of the copy round. Text of components/scene-kit/scenes/tuner-carousel.tsx;
// `channels`, `moreChannels` and `frames` are tuples read by position, with the length of pt-BR. Channels by category,
// never by vendor.
import type { SceneMessages } from "../../../types";

export const tuner: SceneMessages<"tuner"> = {
  product: "Tuner",
  title: "Channels",
  label:
    "Tuner: one message goes out on every channel at once, the read status comes back per channel and the reply lands in the right conversation",
  magneto: { title: "Magneto", meta: "requests the send" },
  tuner: { title: "Tuner", meta: "channel hub" },
  message: {
    eyebrow: "One message · 5:03 PM",
    figure: "Proposal 905",
    note: "to Contact 4821, wherever they are",
  },
  inFlight: "1 send",
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  readNow: "Read just now",
  read: "Read",
  stat: { figure: "3", note: "channels in one send" },
  replyFrom: { title: "Message", meta: "day 4 · 11:20 AM" },
  reply: {
    eyebrow: "Reply received",
    figure: "Accepted",
    note: "back to the right conversation, wherever it comes from",
  },
  relloo: { title: "Relloo", meta: "Conversation 2210" },
  more: "And more channels",
  ask: "How many channels does your company still integrate one by one?",
  channels: ["Email", "Message", "Integration"],
  moreChannels: ["Voice", "Video call", "Community", "Website chat"],
  frames: [
    { name: "Message", caption: "Sending Proposal 905" },
    { name: "Send", caption: "Sending Proposal 905" },
    { name: "Read", caption: "Sending Proposal 905" },
    { name: "Reply", caption: "Receiving" },
  ],
};
