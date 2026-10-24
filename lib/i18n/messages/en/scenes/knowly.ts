// TEXTO DA CENA: KNOWLY (EN)
// en-US, adapted from pt-BR with the glossary of the copy round. Copy of the Knowly memory-graph carousel
// (components/scene-kit/scenes/knowly-carousel.tsx). Generic subjects only (Contact 4821, Proposal 905, Order 1234...),
// no person and no vendor. `frames` and `zoom` are read by frame; `labels` by the key each label names; `legend` by the
// id of each swatch.
import type { SceneMessages } from "../../../types";

export const knowly: SceneMessages<"knowly"> = {
  title: "Memory",
  label:
    "Knowly: the company's memory as a graph that grows, from one topic to the whole constellation, with the newest link highlighted",
  frames: [
    "A topic is born",
    "The links grow",
    "Other topics link in",
    "The whole memory",
  ],
  zoom: ["Zoom 100%", "Zoom 60%", "Zoom 30%", "Zoom 8%"],
  close: "What has your company already decided, and forgotten?",
  closeNote:
    "Every new source links to what already exists. Nothing gets erased, and every answer shows where it came from.",
  legend: {
    subject: "Topic",
    fact: "Fact",
    link: "Link",
    newest: "Most recent",
  },
  labels: {
    subjectChip: "Contact 4821 · maintenance",
    talk: "Conversation",
    visit: "Inspection",
    proposal: "Proposal 905",
    meeting: "Meeting",
    policy: "Service policy",
    warranty: "Warranty",
    ticket: "Ticket 140",
    contract: "Contract 52",
    invoice: "Invoice 7710",
    order: "Order 1234",
    decision: "Decision · 2 proofs",
    subject: "Contact 4821",
    billing: "Billing",
    rules: "Standards",
    block: "Building B",
    purchases: "Purchasing",
    newest: "New link · now",
  },
};
