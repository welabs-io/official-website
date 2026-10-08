// DESTAQUES DA PÁGINA DE PRODUTO
// Optional blocks that follow "the challenge" on a product page. Domus uses them for the operator
// decision of 2026-10-08: every front of the business as a capability, and its builder role.
// Capability verbs only ("covers", "defines"): no usage claim, metric or named company.
type Pair = [pt: string, en: string];
export type HighlightGroup = {
  label: Pair;
  lead: Pair;
  // Short items shown as tags
  tags?: Pair[];
  // Items with a title and one sentence
  points?: { title: Pair; text: Pair }[];
};

export const PRODUCT_HIGHLIGHTS: Record<string, HighlightGroup[]> = {
  erp: [
    {
      label: [
        "A empresa inteira numa casa",
        "The whole company under one roof",
      ],
      lead: [
        "O Domus cobre cada frente do negócio, e cada uma ganha o seu cômodo.",
        "Domus covers every front of the business, and each one gets its own room.",
      ],
      tags: [
        ["Financeiro e bancos", "Finance and banking"],
        ["Fiscal", "Tax"],
        ["Contratos e assinaturas", "Contracts and subscriptions"],
        ["Estoque", "Inventory"],
        ["Compras", "Purchasing"],
        ["Vendas", "Sales"],
        ["Produção", "Manufacturing"],
        ["Projetos", "Projects"],
        ["Pessoas", "People"],
        ["Ativos", "Assets"],
        ["Qualidade", "Quality"],
      ],
    },
    {
      label: ["Desenhou, nasceu", "Sketch it, and it's there"],
      lead: [
        "O Domus também é o construtor: é nele que os sistemas ganham forma.",
        "Domus is also the builder: it is where systems take shape.",
      ],
      points: [
        {
          title: [
            "A tela nasce do modelo de dados.",
            "The screen grows from the data model.",
          ],
          text: [
            "Lista, ficha, busca e ligações aparecem a partir do que o negócio descreve.",
            "List, record, search and links appear from what the business describes.",
          ],
        },
        {
          title: [
            "Cadastro novo, sem programar.",
            "A new record type, no coding.",
          ],
          text: [
            "Um cômodo novo chega mobiliado: o cadastro nasce pelo próprio Domus, sem esperar uma versão nova.",
            "A new room arrives furnished: the record type is created in Domus itself, without waiting for a new release.",
          ],
        },
        {
          title: [
            "Os fluxos de qualquer produto se definem aqui.",
            "Every product's flows are defined here.",
          ],
          text: [
            "O Domus escreve a regra; o Magneto, o workflow, a conduz e devolve o recibo.",
            "Domus writes the rule; Magneto, the workflow, carries it through and hands back the receipt.",
          ],
        },
      ],
    },
  ],
};
