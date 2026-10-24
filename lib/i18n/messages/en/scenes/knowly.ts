// TEXTO DA CENA: KNOWLY (EN)
// TRADUÇÃO PENDENTE: cópia do pt-BR, a ser substituída pelo texto do idioma; chaves e placeholders ficam como estão.
import type { SceneMessages } from "../../../types";

// Copy of the Knowly memory-graph carousel (components/scene-kit/scenes/knowly-carousel.tsx): the accessible name
// of the window, the name and zoom of each of the 4 frames, the labels tied to the nodes of the graph, the closing
// question and the legend. Generic subjects only (Contato 4821, Proposta 905, Pedido 1234...), no person and no vendor.
// Text only. What is NOT here: the product name (a brand), the ids of the steps and of the nodes, the glyph of each chip,
// the tones and places of the labels and the order of the legend, which stay in the component. `frames` and `zoom` are
// read by frame (index 0 = frame 1); `labels` by the key each label names; `legend` by the id of each swatch.
export const knowly: SceneMessages<"knowly"> = {
  title: "Memória",
  label:
    "Knowly: a memória da empresa como um grafo que cresce, de um assunto até a constelação inteira, com a ligação mais nova em destaque",
  frames: [
    "Um assunto nasce",
    "As ligações crescem",
    "Outros assuntos se ligam",
    "A memória inteira",
  ],
  zoom: ["Zoom 100%", "Zoom 60%", "Zoom 30%", "Zoom 8%"],
  close: "O que a sua empresa já decidiu e esqueceu?",
  closeNote:
    "Cada fonte nova se liga ao que já existe. Nada se apaga, e cada resposta mostra de onde veio.",
  legend: {
    subject: "Assunto",
    fact: "Fato",
    link: "Ligação",
    newest: "Mais recente",
  },
  // The words written on the graph, one per label (a chip of frame 1 and the plain word of frame 2 share the text)
  labels: {
    subjectChip: "Contato 4821 · manutenção",
    talk: "Conversa",
    visit: "Vistoria",
    proposal: "Proposta 905",
    meeting: "Reunião",
    policy: "Política de serviço",
    warranty: "Garantia",
    ticket: "Chamado 140",
    contract: "Contrato 52",
    invoice: "Fatura 7710",
    order: "Pedido 1234",
    decision: "Decisão · 2 provas",
    subject: "Contato 4821",
    billing: "Faturamento",
    rules: "Normas",
    block: "Bloco B",
    purchases: "Compras",
    newest: "Ligação nova · agora",
  },
};
