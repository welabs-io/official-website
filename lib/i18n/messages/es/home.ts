// TEXTO DA HOME E DAS TELAS DOS PRODUTOS (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round
// (control/portfolio/site-redesign/i18n/glossario.md): 24-hour times, day/month dates. The records of the single thread
// keep their numbers (Contacto 4821, Conversación 2210, Propuesta 905, Inspección 318, Pedido 1234). The keys, the
// length of every list and the placeholders ({order}, {name}) stay as in pt-BR; lib/content/home.ts builds the
// structures the components read from this text.
import type { HomeMessages } from "../../types";

export const home: HomeMessages = {
  intro: {
    before: "Soluciones para",
    after: "de tu empresa.",
    words: {
      domus: "la gestión",
      relloo: "las relaciones",
      magneto: "los procesos",
      tuner: "los canales",
      knowly: "el conocimiento",
    },
    lead: "Todo integrado en un único espacio de trabajo, con un asistente que actúa en la interfaz por ti.",
    stage: "Los cinco productos ligados al Domus",
    stamps: {
      domus: "Pedido 1234 registrado",
      relloo: "Con el responsable correcto",
      magneto: "Aprobado a las 17:02",
      tuner: "Leído en 3 canales",
      knowly: "Plazo con su fuente",
    },
    record: {
      lines: {
        tuner: "Llegó por mensaje",
        relloo: "Responsable correcto, a tiempo",
        knowly: "Lo acordado, con su fuente",
        magneto: "Aprobado y firmado",
      },
      domus: "Facturas y cobros al día",
    },
  },

  hero: {
    caption: "Un cuadro de cada producto",
    see: "Ver los productos",
    seals: {
      domus: { title: "Inspección 318", line: "llegó a los otros cuatro" },
      relloo: {
        title: "Conversación 2210",
        line: "con el responsable correcto",
      },
      magneto: { title: "Propuesta 905", line: "aprobada a las 17:02" },
      tuner: { title: "Mensaje nuevo", line: "llegó por su canal" },
      knowly: { title: "Vínculo nuevo", line: "la memoria solo crece" },
    },
  },

  domus: {
    standard: "Estándar",
    custom: "A la medida",
    add: "Nuevo módulo",
    addLabel: "Crear un módulo nuevo",
    born: "Inspecciones",
    bornTag: "Nuevo módulo",
    bornFields: [
      { label: "Lugar", value: "Muelle 3" },
      { label: "Fecha", value: "21/10/2026" },
      { label: "Foto", value: "3 fotos" },
    ],
    modules: {
      sales: "Ventas",
      purchasing: "Compras",
      inventory: "Inventario",
      production: "Producción",
      finance: "Finanzas",
      contracts: "Contratos",
      projects: "Proyectos",
      people: "Personas",
      assets: "Activos",
      quality: "Calidad",
      tax: "Fiscal",
      banks: "Bancos",
      legal: "Legal",
      tickets: "Tickets",
      requests: "Solicitudes",
      approvals: "Aprobación",
      privacy: "Privacidad",
      import: "Importación",
    },
    tags: { tax: "Al día", banks: "24h" },
  },

  frames: {
    domus: {
      title: "Módulos",
      sub: "de tu empresa",
      newModule: "Inspecciones",
      uses: {
        relloo: "la oportunidad avanza",
        magneto: "el flujo empieza",
        tuner: "técnico avisado",
        knowly: "queda recordado",
      },
      usesLine: "Los otros cuatro usan el tipo nuevo al instante",
    },
    relloo: {
      title: "Conversación 2210",
      linked: "Ligada a la gestión",
      owner: "Responsable",
      agent: "Agente de atención",
      incoming: "Necesito mantenimiento mensual para 3 equipos del bloque B.",
      time: "08:12",
      answer: "¿Qué modelo son los equipos? Dejo todo listo para la propuesta.",
      typing: "Agente de atención · escribiendo",
      stages: ["Conversación", "Calificación", "Inspección", "Ganada"],
    },
    magneto: {
      title: "Propuesta 905",
      state: "En aprobación",
      doneState: "Aprobada",
      now: "ahora",
      next: "después",
      steps: [
        { name: "Propuesta enviada", at: "08:40" },
        { name: "Aprobación de la gerencia", at: "17:02" },
        { name: "Firma del contrato", at: "17:08" },
        { name: "Pedido en el Domus", at: "17:09" },
      ],
    },
    tuner: {
      title: "Canales",
      channels: [
        { name: "Mensaje", line: "Necesito mantenimiento mensual…" },
        { name: "Llamada", line: "3 min, grabada" },
        { name: "Correo", line: "Propuesta 905" },
      ],
      thread: {
        title: "Conversación 2210",
        lines: [
          "1 canal, un historial",
          "2 canales, un historial",
          "3 canales, un historial",
        ],
      },
    },
    knowly: {
      title: "Memoria",
    },
  },

  chain: {
    title: "Un mensaje, toda la operación",
    lead: "Del canal al pedido registrado en el Domus, mientras te desplazas.",
    bubbleChannel: "Mensaje",
    stations: {
      tuner: {
        label: "Llegó",
        next: "después",
        now: "ahora",
        done: "por mensaje",
        caption: ["El mensaje llega por su canal."],
        chip: "Mensaje 08:12",
      },
      relloo: {
        label: "Con el responsable correcto",
        next: "después",
        now: "Conversación 2210",
        done: "Conversación 2210",
        caption: [
          "La conversación encuentra quién se ocupa",
          "y se vuelve oportunidad.",
        ],
        chip: "Oportunidad 562",
      },
      knowly: {
        label: "Con su fuente",
        next: "después",
        now: "plazo de 48 h",
        done: "plazo de 48 h",
        caption: ["Lo acordado vuelve recordado,", "con su fuente."],
        chip: "Plazo de 48 h, con su fuente",
      },
      magneto: {
        label: "Aprobado",
        next: "después",
        now: "Propuesta 905",
        done: "y firmado",
        caption: [
          "La propuesta pasa por la aprobación",
          "y el contrato por la firma.",
        ],
        chip: "Contrato firmado",
      },
      domus: {
        label: "Registrado",
        next: "después",
        now: "{order}",
        done: "{order}",
        caption: ["El pedido, la factura y el cobro", "quedan en la gestión."],
        chip: "{order}",
      },
    },
    closing: "Del primer contacto al pago.",
    record: {
      tag: "Recurrente",
      lines: {
        tuner: "Llegó por mensaje",
        relloo: "Responsable correcto, a tiempo",
        knowly: "Lo acordado, con su fuente",
        magneto: "Aprobado y firmado",
      },
    },
  },

  accordion: {
    title: "Cinco productos, todo integrado",
    lead: "Cada uno se ocupa de una parte de la operación. Abre uno para verlo en acción.",
    openLabel: "Abrir {name}",
    closeLabel: "Cerrar {name}",
    panels: {
      domus: {
        area: "Gestión",
        title: "Toda la gestión, con lo que solo tu operación tiene.",
        lead: "Finanzas, fiscal, contratos y personas en el mismo lugar. Los otros cuatro trabajan sobre él.",
        points: [
          "Estándar y a la medida",
          "Asistente con el dato real",
          "Fiscal, finanzas y contabilidad",
        ],
        question: "¿Cuánto de tu operación cabe en el Domus?",
      },
      relloo: {
        area: "Relaciones",
        title: "Cada contacto, todas las conversaciones.",
        lead: "El mensaje llega, encuentra quién se ocupa de él y se vuelve oportunidad, sin que nadie copie nada.",
        points: [
          "Bandeja de entrada única",
          "IA que pasa el turno",
          "Embudo que avanza solo",
        ],
        question: "¿Cuánto se pierde entre el mensaje y la propuesta?",
      },
      magneto: {
        area: "Procesos",
        title: "Cada aprobación por el camino correcto.",
        lead: "El flujo lleva la propuesta por quien aprueba y por la firma, y avisa el siguiente paso.",
        points: [
          "Nada dos veces",
          "Aprobación en un toque",
          "Plazos con aviso",
        ],
        question: "¿Cuántas aprobaciones esperan en una bandeja de correo?",
      },
      tuner: {
        area: "Canales",
        title: "Un envío, todos los canales.",
        lead: "El mensaje sale por cualquier canal, y la respuesta vuelve en el mismo formato, venga de donde venga.",
        points: [
          "Cualquier canal",
          "Estado de cada envío",
          "La misma regla para todos",
        ],
        question: "¿En cuántos teléfonos está la conversación de hoy?",
      },
      knowly: {
        area: "Conocimiento",
        title: "Lo que tu empresa aprende queda recordado.",
        lead: "Cada contrato, ticket y reunión se vincula a lo que tu empresa ya aprendió, con la fuente de cada hecho.",
        points: [
          "Respuesta con su fuente",
          "Memoria que crece",
          "Nada se borra",
        ],
        question: "¿Cuánto de lo acordado solo existe en la cabeza de alguien?",
      },
    },
  },

  contact: {
    title: "Cuéntanos qué necesita tu empresa",
    asks: [
      "¿Qué está disperso hoy entre sistemas y hojas de cálculo?",
      "¿Qué pasa con los sistemas que usas hoy?",
      "¿Se puede empezar por un producto?",
      "¿Por dónde empezamos?",
    ],
    asksLabel: "Preguntas para la conversación",
    more: "Ver los productos",
  },
};
