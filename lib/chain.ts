// CADEIA DOS PRODUTOS
// The seven steps of the chain the site tells (Marina's order 1234, from the call to the confirmation), as typed data of
// the site itself. Each step names the products its scene is about, the sentence that names the scene for a screen
// reader, the connection it makes between two products (with the short label the connector block and the overview
// draw) and what the overview above the stage shows while it plays (the lit nodes, the walk of the token and the
// caption). The time of each step is not here: it is the script of the native scenes (lib/scenes/script.ts), one scene
// per step. Until 2026-10-13 these fields came from the motion manifest of the video round; the site is now 100% native
// and keeps only what it draws (lib/chain.test.ts holds the rules the manifest reader used to check).
import { PRODUCTS, type ProductSlug } from "./products";

// End of the token: a product, or "outcome" (the end of the chain, everything closes at Domus)
export type TokenEnd = ProductSlug | "outcome";

export type Connection = {
  from: ProductSlug;
  to: ProductSlug | "outcome";
  // Short value the site displays: pt-BR, sentence case, at most 3 words and 24 characters
  label: string;
};

// Top block of a step, drawn by the site in SVG and CSS
export type Overview = {
  // Nodes lit while the step is on screen
  nodes: ProductSlug[];
  token: { from: TokenEnd; to: TokenEnd };
  // Caption of the top block: pt-BR, sentence case, at most 6 words and 48 characters
  label: string;
};

export type ChainStep = {
  step: number;
  // Products the scene of the step shows
  products: ProductSlug[];
  // One sentence for screen readers: the accessible name of the scene of the step
  srLabel: string;
  connection: Connection;
  overview: Overview;
};

export const CHAIN_STEPS: readonly ChainStep[] = [
  {
    step: 0,
    products: ["domus", "relloo"],
    srLabel:
      "O Domus mostra a casa cheia, com os oito cômodos, e o funil do Relloo encaixa colado à parede.",
    connection: { from: "domus", to: "relloo", label: "Dados no cartão" },
    overview: {
      nodes: ["domus", "relloo"],
      token: { from: "domus", to: "relloo" },
      label: "Domus e Relloo formam o núcleo",
    },
  },
  {
    step: 1,
    products: ["tuner"],
    srLabel:
      'No Tuner, a ligação e a mensagem "Dá para entregar sábado?" da Marina caem na mesma conversa.',
    connection: { from: "tuner", to: "relloo", label: "Canais juntos" },
    overview: {
      nodes: ["tuner"],
      token: { from: "tuner", to: "relloo" },
      label: "Voz e WhatsApp viram uma conversa",
    },
  },
  {
    step: 2,
    products: ["relloo"],
    srLabel:
      "No Relloo, o cartão do pedido 1234, com a troca de data, nasce em Novo, ganha responsável, prazo, histórico e retorno e vai para Em análise.",
    connection: { from: "relloo", to: "domus", label: "Dados no cartão" },
    overview: {
      nodes: ["relloo"],
      token: { from: "relloo", to: "domus" },
      label: "Relloo abre o cartão do pedido",
    },
  },
  {
    step: 3,
    products: ["domus"],
    srLabel:
      "Os cômodos Pessoas, Pedidos e Entregas do Domus mandam endereço, pedido e janela de sábado para o cartão.",
    connection: { from: "domus", to: "relloo", label: "Dados no cartão" },
    overview: {
      nodes: ["domus"],
      token: { from: "domus", to: "relloo" },
      label: "Domus passa endereço e pedido",
    },
  },
  {
    step: 4,
    products: ["knowly"],
    srLabel:
      'No Knowly, a linha "Sábado: entregas até 12h" da política vira a resposta, com a pílula da fonte.',
    connection: { from: "knowly", to: "relloo", label: "Fonte no cartão" },
    overview: {
      nodes: ["knowly"],
      token: { from: "knowly", to: "relloo" },
      label: "Knowly traz a política, com fonte",
    },
  },
  {
    step: 5,
    products: ["magneto"],
    srLabel:
      "No Magneto, a regra vira três passos, a gestora aprova a alteração e o cartão vai para Resolvido.",
    connection: { from: "domus", to: "magneto", label: "Regra que roda" },
    overview: {
      nodes: ["magneto"],
      token: { from: "domus", to: "magneto" },
      label: "Magneto leva a regra à gestora",
    },
  },
  {
    step: 6,
    products: ["domus", "tuner"],
    srLabel:
      'O pedido atualizado volta ao cômodo Pedidos do Domus e o Tuner avisa a Marina com a confirmação "Confirmado: sábado".',
    connection: { from: "domus", to: "outcome", label: "Tudo ligado" },
    overview: {
      nodes: ["domus", "tuner"],
      token: { from: "domus", to: "outcome" },
      label: "Pedido atualizado, Marina avisada",
    },
  },
];

// SELETORES DA CADEIA
// The order of the nodes of the overview line and the four ties of the connector block (the seam of the core and the
// three rails) with the label of each.

// Order of the nodes of the overview line: the products in the order the plot first uses them (the lit nodes and the
// ends of the token, step by step), then the ones the plot never touches in weight order. "outcome" closes the line when
// a token ends there.
export function overviewOrder(): TokenEnd[] {
  const seen: TokenEnd[] = [];
  let outcome = false;
  const add = (end: TokenEnd) => {
    if (end === "outcome") outcome = true;
    else if (!seen.includes(end)) seen.push(end);
  };
  for (const { overview } of CHAIN_STEPS) {
    overview.nodes.forEach(add);
    add(overview.token.from);
    add(overview.token.to);
  }
  for (const { slug } of PRODUCTS) add(slug);
  return outcome ? [...seen, "outcome"] : seen;
}

export type Tie = {
  a: ProductSlug;
  b: ProductSlug;
  label: string;
  // The seam joins the two products of the core; a rail joins a rail product to the core
  place: "seam" | "rail";
};

const CORE: readonly ProductSlug[] = ["domus", "relloo"];
const RAILS: readonly ProductSlug[] = ["magneto", "tuner", "knowly"];

// The label of the connection between two products (the same unordered pair always carries the same one)
function labelOf(a: ProductSlug, b: ProductSlug): string | undefined {
  return CHAIN_STEPS.find(
    (s) =>
      (s.connection.from === a && s.connection.to === b) ||
      (s.connection.from === b && s.connection.to === a),
  )?.connection.label;
}

// The seam and one tie per rail product, to the core product the chain connects it to
export function ties(): Tie[] {
  const result: Tie[] = [];
  const seam = labelOf("domus", "relloo");
  if (seam)
    result.push({ a: "domus", b: "relloo", label: seam, place: "seam" });
  for (const rail of RAILS) {
    for (const core of CORE) {
      const label = labelOf(rail, core);
      if (label) {
        result.push({ a: rail, b: core, label, place: "rail" });
        break;
      }
    }
  }
  return result;
}
