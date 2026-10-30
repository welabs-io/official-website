// TEXTO DA HOME E DAS TELAS DOS PRODUTOS (EN)
// en-US, adapted from pt-BR with the glossary of the copy round (control/portfolio/site-redesign/i18n/glossario.md):
// sentence case, 12-hour times, month/day dates. The records of the single thread keep their numbers (Contact 4821,
// Conversation 2210, Proposal 905, Inspection 318, Order 1234). The keys, the length of every list and the placeholders
// ({order}, {name}) stay as in pt-BR; lib/content/home.ts builds the structures the components read from this text.
import type { HomeMessages } from "../../types";

export const home: HomeMessages = {
  intro: {
    before: "Solutions for",
    after: "across your company.",
    words: {
      domus: "management",
      relloo: "relationships",
      magneto: "processes",
      tuner: "channels",
      knowly: "knowledge",
    },
    lead: "All integrated in a single workspace, with an assistant that works in the interface for you.",
    stage: "The five products tied to Welabs Domus",
    stamps: {
      domus: "Order 1234 recorded",
      relloo: "With the right owner",
      magneto: "Approved at 5:02 PM",
      tuner: "Read on 3 channels",
      knowly: "Deadline, with its source",
    },
    record: {
      lines: {
        tuner: "Came in as a message",
        relloo: "Right owner, on time",
        knowly: "What was agreed, with its source",
        magneto: "Approved and signed",
      },
      domus: "Invoices and billing up to date",
    },
  },

  hero: {
    caption: "One frame from each product",
    see: "See the products",
    seals: {
      domus: { title: "Inspection 318", line: "reached the other four" },
      relloo: { title: "Conversation 2210", line: "with the right owner" },
      magneto: { title: "Proposal 905", line: "approved at 5:02 PM" },
      tuner: { title: "New message", line: "came in on its channel" },
      knowly: { title: "New link", line: "memory only grows" },
    },
  },

  domus: {
    standard: "Standard",
    custom: "Made to measure",
    add: "New module",
    addLabel: "Create a new module",
    born: "Inspections",
    bornTag: "New module",
    bornFields: [
      { label: "Location", value: "Dock 3" },
      { label: "Date", value: "10/21/2026" },
      { label: "Photo", value: "3 photos" },
    ],
    modules: {
      sales: "Sales",
      purchasing: "Purchasing",
      inventory: "Inventory",
      production: "Production",
      finance: "Finance",
      contracts: "Contracts",
      projects: "Projects",
      people: "People",
      assets: "Assets",
      quality: "Quality",
      tax: "Tax",
      banks: "Banks",
      legal: "Legal",
      tickets: "Tickets",
      requests: "Requests",
      approvals: "Approvals",
      privacy: "Privacy",
      import: "Data import",
    },
    tags: { tax: "On time", banks: "24/7" },
  },

  frames: {
    domus: {
      title: "Modules",
      sub: "of your company",
      newModule: "Inspections",
      uses: {
        relloo: "opportunity moves",
        magneto: "flow starts",
        tuner: "technician notified",
        knowly: "remembered",
      },
      usesLine: "The other four use the new type right away",
    },
    relloo: {
      title: "Conversation 2210",
      linked: "Linked to management",
      owner: "Owner",
      agent: "Service agent",
      incoming: "I need monthly maintenance for 3 units in building B.",
      time: "8:12 AM",
      answer:
        "Which model are the units? I'll get everything ready for the proposal.",
      typing: "Service agent · typing",
      stages: ["Conversation", "Qualification", "Inspection", "Won"],
    },
    magneto: {
      title: "Proposal 905",
      state: "Awaiting approval",
      doneState: "Approved",
      now: "now",
      next: "next",
      steps: [
        { name: "Proposal sent", at: "8:40 AM" },
        { name: "Management approval", at: "5:02 PM" },
        { name: "Contract signature", at: "5:08 PM" },
        { name: "Order in Welabs Domus", at: "5:09 PM" },
      ],
    },
    tuner: {
      title: "Channels",
      channels: [
        { name: "Message", line: "I need monthly maintenance…" },
        { name: "Call", line: "3 min, recorded" },
        { name: "Email", line: "Proposal 905" },
      ],
      thread: {
        title: "Conversation 2210",
        lines: [
          "1 channel, one history",
          "2 channels, one history",
          "3 channels, one history",
        ],
      },
    },
    knowly: {
      title: "Memory",
    },
  },

  chain: {
    title: "One message, your whole operation",
    lead: "From the channel to the order recorded in Welabs Domus, as you scroll.",
    bubbleChannel: "Message",
    stations: {
      tuner: {
        label: "Arrived",
        next: "next",
        now: "now",
        done: "by message",
        caption: ["The message comes in on its channel."],
        chip: "Message 8:12 AM",
      },
      relloo: {
        label: "With the right owner",
        next: "next",
        now: "Conversation 2210",
        done: "Conversation 2210",
        caption: [
          "The conversation finds who takes care of it",
          "and becomes an opportunity.",
        ],
        chip: "Opportunity 562",
      },
      knowly: {
        label: "With its source",
        next: "next",
        now: "48-hour deadline",
        done: "48-hour deadline",
        caption: ["What was agreed comes back,", "with its source."],
        chip: "48-hour deadline, with its source",
      },
      magneto: {
        label: "Approved",
        next: "next",
        now: "Proposal 905",
        done: "and signed",
        caption: [
          "The proposal goes through approval",
          "and the contract through signature.",
        ],
        chip: "Contract signed",
      },
      domus: {
        label: "Recorded",
        next: "next",
        now: "{order}",
        done: "{order}",
        caption: [
          "The order, the invoice and the billing",
          "stay in management.",
        ],
        chip: "{order}",
      },
    },
    closing: "From first contact to payment.",
    record: {
      tag: "Recurring",
      lines: {
        tuner: "Came in as a message",
        relloo: "Right owner, on time",
        knowly: "What was agreed, with its source",
        magneto: "Approved and signed",
      },
    },
  },

  accordion: {
    title: "Five products, all integrated",
    lead: "Each one runs a part of your operations. Open one to see it at work.",
    openLabel: "Open {name}",
    closeLabel: "Close {name}",
    panels: {
      domus: {
        area: "Management",
        title: "All of management, plus what only your operations have.",
        lead: "Finance, tax, contracts and people in one place. The other four work on top of it.",
        points: [
          "Standard and made to measure",
          "An assistant with real data",
          "Tax, finance and accounting",
        ],
        question: "How much of your operations fits in Welabs Domus?",
      },
      relloo: {
        area: "Relationships",
        title: "Every contact, every conversation.",
        lead: "A message comes in, finds who takes care of it and becomes an opportunity, with no copy and paste.",
        points: [
          "One inbox",
          "AI that hands off",
          "A pipeline that moves itself",
        ],
        question: "How much gets lost between the message and the proposal?",
      },
      magneto: {
        area: "Processes",
        title: "Every approval on the right path.",
        lead: "The flow takes the proposal to whoever approves it and on to signature, and flags the next step.",
        points: [
          "Nothing done twice",
          "One-tap approval",
          "Deadlines with alerts",
        ],
        question: "How many approvals are waiting in an inbox?",
      },
      tuner: {
        area: "Channels",
        title: "One send, every channel.",
        lead: "A message goes out on any channel, and the reply comes back in the same format, wherever it comes from.",
        points: ["Any channel", "Status of every send", "Same rules for all"],
        question: "How many phones is today's conversation spread across?",
      },
      knowly: {
        area: "Knowledge",
        title: "What your company learns, it remembers.",
        lead: "Every contract, ticket and meeting links to what your company already learned, with the source of each fact.",
        points: [
          "Answers with sources",
          "Memory that grows",
          "Nothing gets erased",
        ],
        question: "How much of what was agreed lives only in someone's head?",
      },
    },
  },

  contact: {
    title: "Tell us what your company needs",
    asks: [
      "What is scattered today across systems and spreadsheets?",
      "What happens to the systems you use today?",
      "Can you start with one product?",
      "Where do we start?",
    ],
    asksLabel: "Questions for the conversation",
    more: "See the products",
  },
};
