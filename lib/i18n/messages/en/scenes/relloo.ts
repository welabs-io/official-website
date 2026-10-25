// TEXTO DA CENA: RELLOO (EN)
// en-US, adapted from pt-BR with the glossary of the copy round. Text of the four-frame carousel
// (components/scene-kit/scenes/relloo-carousel.tsx); `frameNames` and `past` are read by position, so they keep the
// length of pt-BR. The pace of the clock follows the length of the typed phrases (`rellooSteps`).
import type { SceneMessages } from "../../../types";

export const relloo: SceneMessages<"relloo"> = {
  label:
    "Relloo: a message becomes an opportunity and moves down the pipeline, in four moments",
  conversation: "Conversation 2210",
  contact: "Contact 4821",
  linked: "Linked to management",
  before: "+ 2 channels used before",
  owner: "Owner",
  agent: "Service agent",
  team: "Sales team",
  today: "Today",
  message: "Message",
  asked: "I need monthly maintenance for 3 units in building B.",
  askedAt: "8:12 AM",
  reply: "Write to Contact 4821",
  send: "Send",
  previous: "Before",
  now: "Owner now",
  why: "asked for a proposal",
  agentSaid:
    "Which model are the units? I'll get everything ready for the proposal.",
  agentAt: "8:12 AM",
  answer: "They're 3 units of 12,000 BTU. I'd like a proposal.",
  answerAt: "8:19 AM",
  summaryReady: "Summary ready for the team",
  summaryLong:
    "Monthly maintenance, 3 units of 12,000 BTU in building B. Asked for a proposal.",
  summary: "Summary",
  summaryShort:
    "Monthly maintenance, 3 units in building B. Asked for a proposal.",
  history: "3 channels · one history",
  deals: "Opportunities",
  born: "New opportunity",
  bornAt: "now",
  deal: "Opportunity",
  dealNumber: "562",
  bornFrom: "Born from Conversation 2210, with the summary attached",
  moves: "moves down the pipeline and the rest happens on its own",
  funnel: "Pipeline",
  domus: "Domus",
  visit: "Inspection 318 scheduled",
  question: "Who replies first at your company?",
  inbox: "Inbox",
  service: "Service",
  person: "Contacts",
  frameNames: ["Arrives", "Hands off", "Becomes a deal", "Moves ahead"],
  past: [
    { date: "Aug 12", text: "Email · duct cleaning quote" },
    { date: "Sep 3", text: "Voice · call transcribed" },
  ],
};
