// TEXTO DA CENA: DOMUS (EN)
// en-US, adapted from pt-BR with the glossary of the copy round. The words of the Domus carousel
// (components/scene-kit/scenes/domus-carousel.tsx), four frames. Lists read by position (frames, frameNames,
// typeFields, list.cols, list.visits, recordLines) keep the length of pt-BR. Placeholders: `{count}` is the number of
// areas not named in the frame, `{names}` the first three of them (the component lowercases them and capitalises the
// sentence).
import type { SceneMessages } from "../../../types";

export const domus: SceneMessages<"domus"> = {
  label:
    "Domus: all of management in one place, a new record type that is born with its screen, and the record that ties in the other products",
  frames: [
    { title: "Modules", label: "The areas of the company" },
    { title: "Record type", label: "The new type becomes a screen" },
    { title: "Inspections", label: "The assistant proposes, you confirm" },
    { title: "Inspection 318", label: "The record ties in the other products" },
  ],
  frameNames: ["Areas", "New type", "Assistant", "All tied in"],

  countText: "areas of the company, in one place",
  rest: "+ {count} areas",
  restLine: "{names} and more",
  newType: "New record type",

  type: "Inspection",
  typeFields: ["Address", "Date and time", "Contact"],
  screen: "Inspections",
  ready: "Ready to use",

  list: {
    cols: ["Inspection", "Date and time", "Status"],
    visits: ["tomorrow, 9:00 AM", "yesterday, 2:00 PM", "Oct 20, 10:30 AM"],
  },
  assistant: "Assistant",
  context: "Opportunity 562",
  ask: "schedule the inspection for Contact 4821 tomorrow at 9 AM",
  proposalHead: "Proposal",
  record: "Inspection 318",
  recordLine: "tomorrow, 9:00 AM · Contact 4821",
  confirm: "Confirm",
  created: "Inspection 318 created",
  undo: "Undo",
  scheduled: "Scheduled",
  done: "Done",

  recordLines: [
    { label: "Contact", value: "Contact 4821" },
    { label: "Date and time", value: "tomorrow, 9:00 AM" },
  ],
  neighbours: {
    magneto: "the flow carries on",
    tuner: "notifies the technician",
    relloo: "the opportunity moves",
    knowly: "keeps it in memory",
  },
  question: "Which module do your operations need?",
};
