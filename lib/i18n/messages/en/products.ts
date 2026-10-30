// TEXTO DE CADA PRODUTO (EN)
// en-US, adapted from pt-BR with the glossary of the copy round (control/portfolio/site-redesign/i18n/glossario.md).
// Each product as its concept in the whole of the five; no vendor and no Brazil-only citation, not even in the metadata.
// The keys, the length of every list and the placeholders ({name}, {title}) stay as in pt-BR; `category` and
// `keywords` live in the page metadata only. Which `details` sit under which difference is structure
// (lib/content/products.ts, DIFFER_DETAILS), so each detail keeps its position.
import type { ProductsMessages } from "../../types";

export const products: ProductsMessages = {
  headings: {
    areas: "Every area of the company",
    areasLead: "And the ones only your operations have.",
    details: "Why it's different",
    contact: "Want to see {name} with your operations?",
    differOpen: "Open: {title}",
    differClose: "Close: {title}",
  },
  domus: {
    line: "Your whole company, managed",
    category: "ERP",
    keywords: [
      "ERP",
      "business management system",
      "sales",
      "inventory",
      "finance",
      "tax",
    ],
    short: "Your whole company in a single workspace.",
    centerTitle: "Relloo on the Welabs Domus record",
    details: [
      "Tax control",
      "Bank reconciliation",
      "Billing",
      "E-signature",
      "Data import",
      "An assistant that acts for you",
    ],
    asks: [
      "Which areas would your company use?",
      "How do we bring over what's in your current system?",
      "What can you shape without code?",
    ],
    differs: [
      {
        title: "Shaped to your operations",
        body: "A new record type is born with its own screen and permissions.",
      },
      {
        title: "Tax, finance and accounting",
        body: "Invoices, reconciliation and billing come ready.",
      },
      {
        title: "The base of the other products",
        body: "Conversations, flows and answers use the same records and access.",
      },
    ],
  },
  relloo: {
    line: "Every contact, every conversation",
    category: "CRM",
    keywords: ["CRM", "relationship management", "omnichannel service"],
    short:
      "Every contact with all of their conversations, and a pipeline that moves on its own.",
    centerTitle: "Conversations on the Welabs Domus record",
    details: [
      "Calls recorded in the conversation",
      "Website chat",
      "AI agents that cite sources",
      "Response time",
      "Saved replies",
      "Opportunities by stage",
    ],
    asks: [
      "Which channels do your conversations come through today?",
      "How much could an AI agent solve on its own?",
      "How does your team split the conversations?",
    ],
    differs: [
      {
        title: "The contact at the center",
        body: "Messages, calls and email become a single history that stays with your company.",
      },
      {
        title: "AI with limits",
        body: "The agent answers only what it may, then hands off with the summary ready.",
      },
      {
        title: "A pipeline that moves on its own",
        body: "Each stage has its rule and deadline, and the opportunity moves until it becomes an order in Welabs Domus.",
      },
    ],
  },
  magneto: {
    line: "Flows with approvals",
    category: "Process automation and workflow",
    keywords: ["process automation", "workflow", "BPM", "approvals"],
    short: "Flows that wait for approval and pick up where they left off.",
    centerTitle: "Approvals on the Welabs Domus record",
    details: [
      "Waits and approvals",
      "Validation before publishing",
      "Retry when another system fails",
      "Log of who changed what",
      "Editor inside Welabs Domus",
    ],
    asks: [
      "Which approvals hold up your operations?",
      "What runs on spreadsheets and reminders today?",
      "Who needs to decide, and when?",
    ],
    differs: [
      {
        title: "Closed by default",
        body: "A flow only calls what your company allowed, and nothing goes live without validation.",
      },
      {
        title: "Nothing done twice",
        body: "When another system fails, the step tries again without repeating its effect.",
      },
      {
        title: "Waits as long as it takes",
        body: "An approval can take days; the flow picks up where it stopped, with a log of every change.",
      },
    ],
  },
  tuner: {
    line: "Any channel, one send",
    category: "Communication channels",
    keywords: [
      "messaging channels",
      "multichannel communication",
      "omnichannel",
    ],
    short:
      "A message goes out on any channel, and the reply comes back to the right place.",
    centerTitle: "Sends on the Welabs Domus record",
    details: [
      "Messages, email and SMS",
      "Call menu options",
      "Routing to your team",
      "Recording and transcription",
      "Calls and video calls",
      "Communities and team chat",
    ],
    asks: [
      "How many numbers and lines does your company have?",
      "Where should each call go?",
      "Which conversations need to be recorded?",
    ],
    differs: [
      {
        title: "One send, every channel",
        body: "A message goes out on every channel at once, with the same sending rules.",
      },
      {
        title: "Replies come back the same",
        body: "Wherever it comes from, the reply arrives in the same format and in the right conversation.",
      },
      {
        title: "Voice counts too",
        body: "Every call goes through the menu, gets recorded and turns into text for your team.",
      },
    ],
  },
  knowly: {
    line: "Knowledge that grows",
    category: "Organizational memory and knowledge base",
    keywords: ["knowledge base", "AI", "semantic search"],
    short:
      "Your company's memory grows with every source, and every fact shows where it came from.",
    centerTitle: "Memory on the Welabs Domus record",
    details: [
      "A source for every sentence",
      "Access by profile and group",
      "Access that never leaks",
      "Documents, tickets and minutes",
      "Welabs Domus records",
    ],
    asks: [
      "Where does your team's knowledge live today?",
      "Who can see what?",
      "Which questions keep coming back?",
    ],
    differs: [
      {
        title: "Every sentence with its source",
        body: "The answer shows where each part came from, and says what's missing when there's no proof.",
      },
      {
        title: "Within access",
        body: "Each profile sees only what it could already see, not even through a summary.",
      },
      {
        title: "Memory that grows",
        body: "Every document, meeting note and Welabs Domus record links to what your company already learned.",
      },
    ],
  },
};
