// TEXTO DA CENA: MAGNETO (EN)
// en-US, adapted from pt-BR with the glossary of the copy round. The text of the four frames of
// components/scene-kit/scenes/magneto-carousel.tsx (`f1..f4`); `frameNames` is read by position, one per frame. The
// product names drawn as labels (`domus`, `tuner`) are brands and stay as they are.
import type { SceneMessages } from "../../../types";

export const magneto: SceneMessages<"magneto"> = {
  product: "Magneto",
  title: "Flows",
  label:
    "Magneto: the proposal starts the flow on its own, the work splits, waits for approval and finishes with nothing done twice",
  flow: "Proposal approval",
  active: "Active",
  domus: "Domus",
  tuner: "Tuner",
  proposal: "Proposal 905",
  frameNames: ["Starts itself", "Splits", "Waits", "Finishes"],
  f1: {
    source: "proposal revised",
    started: "Started on its own",
    nobody: "nobody had to press anything",
    nextLabel: "Next step",
    nextStep: "Review proposal",
  },
  f2: {
    trigger: "Trigger",
    approval: "Management approval",
    now: "now",
    contract: "Prepare contract",
    same: "at the same time",
  },
  f3: {
    waiting: "Waiting for management",
    warned: "management notified",
    ready: "contract ready",
    afterLabel: "After approval",
    afterStep: "Send for signature",
  },
  f4: {
    approved: "Approved",
    by: "by management",
    sign: "Send for signature",
    failure: "A failure midway",
    concluded: "Finished, nothing done twice",
    order: "Order 1234 created",
    sent: "contract sent",
    question: "How much work gets redone at your company?",
  },
};
