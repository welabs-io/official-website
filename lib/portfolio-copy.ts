import type { PortfolioProduct } from "./portfolio";

const english: Record<string, { sector: string; summary: string; challenge: string; audience: string; capabilities: readonly string[] }> = {
  "stant": {
    "sector": "Construction",
    "summary": "Site operations, from planning to field inspections.",
    "challenge": "Connect construction management with the work of teams carrying out and checking activities in the field.",
    "audience": "Site managers, engineers and inspection teams.",
    "capabilities": [
      "Site management",
      "Field inspections",
      "Meeting minutes and actions"
    ]
  },
  "tabela": {
    "sector": "Real estate",
    "summary": "Prices, units and reservations in one commercial journey.",
    "challenge": "Organize unit availability and commercial conditions for developers, managers and brokers.",
    "audience": "Real estate developers, sales managers and brokers.",
    "capabilities": [
      "Price tables",
      "Developments and units",
      "Reservations and approvals"
    ]
  },
  "central-esg": {
    "sector": "Corporate sustainability",
    "summary": "Sustainability data with context for decision-making.",
    "challenge": "Organize the collection, monitoring and communication of environmental, social and governance indicators.",
    "audience": "Sustainability teams and organizations.",
    "capabilities": [
      "Indicator collection",
      "ESG data management",
      "Public reporting portal"
    ]
  },
  "kiosk-brands": {
    "sector": "Sales and relationships",
    "summary": "A shared pre-sales view for different brands.",
    "challenge": "Connect forms, campaigns and commercial follow-up within each brand’s routines.",
    "audience": "Commercial and operational teams across brand networks.",
    "capabilities": [
      "Pre-sales",
      "Intake forms",
      "Campaigns"
    ]
  },
  "light-recicla": {
    "sector": "Energy and recycling",
    "summary": "Recycling connected to the energy journey.",
    "challenge": "Bring collection-point operations closer to participants tracking recycling records and energy credits.",
    "audience": "Program operators and participants.",
    "capabilities": [
      "Collection operations",
      "Recycling records",
      "Credit tracking"
    ]
  },
  "ecoenel": {
    "sector": "Energy and recycling",
    "summary": "Recycling operations with connected records.",
    "challenge": "Organize events, participants and recycling records across program operations.",
    "audience": "Operational teams and participants.",
    "capabilities": [
      "Operational management",
      "Events and participants",
      "Recycling records"
    ]
  },
  "neoenergia": {
    "sector": "Sustainability and communities",
    "summary": "A connected view of community operations.",
    "challenge": "Centralize projects, events and records for the sustainability and energy-efficiency programs served.",
    "audience": "Operational teams and program managers.",
    "capabilities": [
      "Program management",
      "Events",
      "Operational follow-up"
    ]
  },
  "wego": {
    "sector": "Environmental and document management",
    "summary": "Processes, documents and environmental management connected.",
    "challenge": "Digitize environmental and administrative journeys with modules supporting each operation.",
    "audience": "Environmental and document-management teams.",
    "capabilities": [
      "Waste and licensing",
      "Documents and processes",
      "Signatures and billing"
    ]
  },
  "autoinfracao": {
    "sector": "Environmental inspection",
    "summary": "Inspection records accompany field work.",
    "challenge": "Organize infraction records and the follow-up of environmental inspection activities.",
    "audience": "Inspectors and environmental inspection teams.",
    "capabilities": [
      "Infraction records",
      "Field journey",
      "Record follow-up"
    ]
  },
  "erp": {
    "sector": "Business management",
    "summary": "A domain foundation for management and integrations.",
    "challenge": "Compose business applications and integrations on Frappe and ERPNext with a custom presentation experience.",
    "audience": "Organizations and management teams.",
    "capabilities": [
      "Domain applications",
      "Custom SPA",
      "Business connectors"
    ]
  },
  "flow": {
    "sector": "Agent automation",
    "summary": "Flows connecting systems, agents and operations.",
    "challenge": "Organize definitions, execution and access for automations connected to domain systems.",
    "audience": "Teams designing and operating automations.",
    "capabilities": [
      "Flow definitions",
      "Automation execution",
      "Domain integrations"
    ]
  },
  "wekb": {
    "sector": "Corporate knowledge",
    "summary": "Connected context for people and agents.",
    "challenge": "Bring corporate sources together and retrieve knowledge with context and traceability.",
    "audience": "Teams and agents consulting corporate knowledge.",
    "capabilities": [
      "Source ingestion",
      "Hybrid search",
      "Agent queries"
    ]
  },
  "welabs-crm": {
    "sector": "Commercial relationships",
    "summary": "Contacts and opportunities organized by company.",
    "challenge": "Bring together commercial context and opportunity tracking across each organization’s stages.",
    "audience": "Commercial teams.",
    "capabilities": [
      "Contacts",
      "Opportunities",
      "Pipelines"
    ]
  },
  "malupe": {
    "sector": "Security operations",
    "summary": "Occurrences in context for operational follow-up.",
    "challenge": "Connect event ingestion and occurrence follow-up in the web central within the Alpha scope.",
    "audience": "Security operations teams.",
    "capabilities": [
      "Event ingestion",
      "Occurrence queries",
      "Operational queue"
    ]
  }
};
const surfaces: Record<string, string> = { "Plataforma web": "Web platform", "Aplicativo": "Mobile app", "Portal público": "Public portal", "Ecossistema": "Ecosystem", "Central web": "Web central", "Eventos": "Events", "Conhecimento": "Knowledge", "API": "API" };
export function getPortfolioCopy(product: PortfolioProduct, en: boolean) {
  if (!en) return { ...product };
  return { ...product, ...english[product.slug], surfaces: product.surfaces.map((surface) => surfaces[surface]), stage: product.stage === "Em validação" ? "Under validation" : product.stage };
}
