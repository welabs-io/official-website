// BRAND OPENING TEXT
// en-US, adapted from pt-BR with the glossary of the copy round (control/portfolio/site-redesign/i18n/glossario.md):
// the same positions and list lengths, channel categories in the words of the Tuner scene ("Website chat").
import type { OpeningsMessages } from "../../types";

export const openings: OpeningsMessages = {
  domus: {
    rooms: ["Finance", "Tax", "Inventory", "Sales", "People", "Projects"],
  },
  relloo: {
    records: ["Contact 4821", "Contact 4822", "Contact 4823", "Contact 4824"],
    channels: ["Message", "Website chat", "Voice", "Email"],
  },
  magneto: {
    nodes: [
      "Trigger",
      "Spreadsheet",
      "Condition",
      "Approval",
      "Email",
      "Integration",
      "Condition",
      "Wait",
      "Reminder",
      "Done",
    ],
  },
  tuner: {
    channels: ["Message", "Voice", "Website chat", "Email", "Community"],
  },
  knowly: {
    cards: [
      { label: "Document", sub: "Deadlines" },
      { label: "Meeting", sub: "9/12" },
      { label: "Ticket", sub: "ATL-142" },
      { label: "Code", sub: "Proposals" },
      { label: "Manual", sub: "Sales" },
    ],
  },
};
