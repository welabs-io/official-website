// TEXTO DE CADA PRODUTO (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR with the glossary of the copy round
// (control/portfolio/site-redesign/i18n/glossario.md). Each product as its concept in the whole of the five; no vendor
// and no Brazil-only citation, not even in the metadata. The keys, the length of every list and the placeholders
// ({name}, {title}) stay as in pt-BR; `category` and `keywords` live in the page metadata only. Which `details` sit
// under which difference is structure (lib/content/products.ts, DIFFER_DETAILS), so each detail keeps its position.
import type { ProductsMessages } from "../../types";

export const products: ProductsMessages = {
  headings: {
    areas: "Todas las áreas de la empresa",
    areasLead: "Y las que solo tu operación tiene.",
    details: "Por qué es diferente",
    contact: "¿Quieres ver {name} con tu operación?",
    differOpen: "Abrir: {title}",
    differClose: "Cerrar: {title}",
  },
  domus: {
    line: "La gestión de toda la empresa",
    category: "ERP",
    keywords: [
      "ERP",
      "sistema de gestión empresarial",
      "ventas",
      "inventario",
      "finanzas",
      "fiscal",
    ],
    short: "Toda la empresa en un único espacio de trabajo.",
    centerTitle: "El Relloo en el registro del Domus",
    details: [
      "Control fiscal",
      "Conciliación bancaria",
      "Cobros",
      "Firma electrónica",
      "Importación de datos",
      "Un asistente que actúa por ti",
    ],
    asks: [
      "¿Qué áreas usaría tu empresa?",
      "¿Cómo traer lo que está en tu sistema actual?",
      "¿Qué se puede adaptar sin programar?",
    ],
    differs: [
      {
        title: "A la medida de tu operación",
        body: "Un tipo de registro nuevo nace con su pantalla y sus permisos.",
      },
      {
        title: "Fiscal, finanzas y contabilidad",
        body: "Facturas, conciliación y cobros vienen listos.",
      },
      {
        title: "La base de los otros productos",
        body: "Conversaciones, flujos y respuestas usan los mismos registros y accesos.",
      },
    ],
  },
  relloo: {
    line: "Relación con cada contacto",
    category: "CRM",
    keywords: ["CRM", "gestión de relaciones", "atención multicanal"],
    short:
      "Cada contacto con todas sus conversaciones, y un embudo que avanza solo.",
    centerTitle: "Las conversaciones en el registro del Domus",
    details: [
      "Llamadas grabadas en la conversación",
      "Chat en el sitio",
      "Agentes de IA con fuente",
      "Plazo de respuesta",
      "Respuestas listas",
      "Oportunidades por etapa",
    ],
    asks: [
      "¿Por qué canales llegan hoy las conversaciones?",
      "¿Cuánto resolvería solo un agente de IA?",
      "¿Cómo reparte tu equipo las conversaciones?",
    ],
    differs: [
      {
        title: "El contacto al centro",
        body: "Mensajes, llamadas y correos se vuelven un solo historial, que se queda en tu empresa.",
      },
      {
        title: "IA con límites",
        body: "El agente responde solo lo que puede y pasa el turno con el resumen listo.",
      },
      {
        title: "Un embudo que avanza solo",
        body: "Cada etapa tiene su regla y su plazo, y la oportunidad avanza hasta volverse pedido en el Domus.",
      },
    ],
  },
  magneto: {
    line: "Flujos con aprobación",
    category: "Automatización de procesos y workflow",
    keywords: ["automatización de procesos", "workflow", "BPM", "aprobaciones"],
    short: "Flujos que esperan la aprobación y retoman donde quedaron.",
    centerTitle: "Las aprobaciones en el registro del Domus",
    details: [
      "Espera y aprobación",
      "Validación antes de publicar",
      "Reintento cuando otro sistema falla",
      "Registro de quién cambió qué",
      "Editor dentro del Domus",
    ],
    asks: [
      "¿Qué aprobaciones frenan tu operación?",
      "¿Qué funciona hoy con hojas de cálculo y recordatorios?",
      "¿Quién tiene que decidir, y cuándo?",
    ],
    differs: [
      {
        title: "Cerrado por defecto",
        body: "El flujo solo llama a lo que tu empresa habilitó, y nada sale sin validación.",
      },
      {
        title: "Nada dos veces",
        body: "Cuando otro sistema falla, el paso lo intenta de nuevo sin repetir el efecto.",
      },
      {
        title: "Espera lo que haga falta",
        body: "Una aprobación puede tardar días; el flujo retoma donde quedó, con el registro de cada cambio.",
      },
    ],
  },
  tuner: {
    line: "Cualquier canal, un envío",
    category: "Canales de comunicación",
    keywords: ["canales de mensajería", "comunicación multicanal", "omnicanal"],
    short:
      "Un mensaje sale por cualquier canal, y la respuesta vuelve al lugar correcto.",
    centerTitle: "Los envíos en el registro del Domus",
    details: [
      "Mensajes, correo y SMS",
      "Menú de opciones en la llamada",
      "Distribución a tu equipo",
      "Grabación y transcripción",
      "Llamadas y videollamadas",
      "Comunidades y chat corporativo",
    ],
    asks: [
      "¿Cuántos números y líneas tiene tu empresa?",
      "¿A dónde debería ir cada llamada?",
      "¿Qué conversaciones tienen que quedar grabadas?",
    ],
    differs: [
      {
        title: "Un envío, todos los canales",
        body: "Un mensaje sale por todos los canales a la vez, con la misma regla de envío.",
      },
      {
        title: "La respuesta vuelve igual",
        body: "Venga de donde venga, la respuesta llega en el mismo formato y a la conversación correcta.",
      },
      {
        title: "La voz también cuenta",
        body: "Cada llamada pasa por el menú, queda grabada y se vuelve texto para tu equipo.",
      },
    ],
  },
  knowly: {
    line: "Conocimiento que crece",
    category: "Memoria organizacional y base de conocimiento",
    keywords: ["base de conocimiento", "IA", "búsqueda semántica"],
    short:
      "La memoria de tu empresa crece con cada fuente, con el origen de cada hecho.",
    centerTitle: "La memoria en el registro del Domus",
    details: [
      "La fuente de cada frase",
      "Acceso por perfil y grupo",
      "Permisos que no se filtran",
      "Documentos, tickets y actas",
      "Registros del Domus",
    ],
    asks: [
      "¿Dónde está hoy el conocimiento de tu equipo?",
      "¿Quién puede ver qué?",
      "¿Qué preguntas se repiten?",
    ],
    differs: [
      {
        title: "Cada frase con su fuente",
        body: "La respuesta muestra de dónde vino cada parte, y dice lo que falta cuando no hay prueba.",
      },
      {
        title: "Dentro del acceso",
        body: "Cada perfil solo ve lo que ya podía ver, ni siquiera en un resumen.",
      },
      {
        title: "Memoria que crece",
        body: "Cada documento, acta y registro del Domus se vincula a lo que tu empresa ya aprendió.",
      },
    ],
  },
};
