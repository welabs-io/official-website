// CONTEÚDO EM PROFUNDIDADE DE CADA PRODUTO
// What a product page adds to lib/content/products.ts: the six capabilities in groups with one sentence each, three
// profiles of who the product is for and the questions people ask. Every claim comes from the films of the motion round
// (manifest `proves`), the Domus synthesis of 2026-10-08 or the product dossiers: no client, no metric, no feature that
// is not there. `cap` indexes the capabilities of ProductContent (same order as in products.ts).
import type { ProductDepthMap } from "./types";

export const PRODUCT_DEPTH: ProductDepthMap = {
  domus: {
    groups: [
      {
        title: "Dinheiro e notas",
        items: [
          {
            cap: 0,
            detail:
              "A fatura sai com os impostos certos, e o PIX recebido dá baixa sozinho.",
          },
          {
            cap: 5,
            detail: "A nota de serviço é emitida quando você confirma.",
          },
        ],
      },
      {
        title: "Contratos e pessoas",
        items: [
          {
            cap: 3,
            detail:
              "Contratos e assinaturas ficam no mesmo sistema do financeiro.",
          },
          {
            cap: 4,
            detail:
              "A gestão de pessoas fica ao lado dos cadastros e dos contratos.",
          },
        ],
      },
      {
        title: "Cadastros e regras",
        items: [
          {
            cap: 1,
            detail:
              "Você desenha o cadastro e a tela nasce pronta, sem refazer o sistema.",
          },
          {
            cap: 2,
            detail: "As regras moram no Domus e rodam como fluxo no Magneto.",
          },
        ],
      },
    ],
    audience: [
      {
        title: "Empresa com a gestão espalhada",
        text: "Quer cadastros, financeiro e contratos num sistema só, e não em um lugar para cada área.",
        products: ["domus"],
      },
      {
        title: "Equipe que muda de cadastro",
        text: "Precisa criar um cadastro novo sem abrir um projeto de programação.",
        products: ["domus"],
      },
      {
        title: "Operação com regra no papel",
        text: "Quer que as regras da empresa rodem de verdade, com o Magneto.",
        products: ["domus", "magneto"],
      },
    ],
    faq: [
      {
        q: "O que o Domus reúne?",
        a: "Financeiro e bancos, contratos e assinaturas, gestão de pessoas e nota fiscal de serviço, no mesmo sistema.",
      },
      {
        q: "Como o cadastro vira tela?",
        a: "Você desenha o cadastro, e a tela nasce pronta, sem refazer o sistema.",
      },
      {
        q: "Onde as regras da empresa rodam?",
        a: "As regras moram dentro do Domus e rodam como fluxo no Magneto, com a pessoa só onde precisa aprovar.",
      },
      {
        q: "O Domus emite nota fiscal?",
        a: "Emite a nota fiscal de serviço, quando você confirma.",
      },
    ],
  },
  relloo: {
    groups: [
      {
        title: "Atendimento",
        items: [
          {
            cap: 0,
            detail:
              "Cada pedido vira um cartão com responsável, prazo e histórico.",
          },
          {
            cap: 1,
            detail:
              "O cartão traz as conversas e os pedidos anteriores, e os dados que o Domus guarda.",
          },
          {
            cap: 5,
            detail:
              "O agente responde com o conhecimento do Knowly, com a fonte, e passa a vez à equipe na hora certa.",
          },
        ],
      },
      {
        title: "Vendas e campanhas",
        items: [
          {
            cap: 3,
            detail: "O cartão anda por etapas, de Novo até Resolvido.",
          },
          {
            cap: 2,
            detail: "Do formulário ao cupom no WhatsApp.",
          },
          {
            cap: 4,
            detail: "Da venda no caixa ao cashback.",
          },
        ],
      },
    ],
    audience: [
      {
        title: "Equipe que recebe pedido por vários canais",
        text: "Quer juntar tudo num cartão com dono e prazo, e não perder nenhum.",
        products: ["relloo", "tuner"],
      },
      {
        title: "Quem faz campanha e quer fechar a venda",
        text: "Acompanha do formulário e do cupom no WhatsApp até a venda no caixa e o cashback.",
        products: ["relloo"],
      },
      {
        title: "Atendimento com agente",
        text: "Precisa de um agente que responde com o conhecimento da empresa e passa a vez à equipe.",
        products: ["relloo", "knowly"],
      },
    ],
    faq: [
      {
        q: "O que fica em cada cartão?",
        a: "Responsável, prazo, histórico, as conversas e os pedidos anteriores, e os dados que o Domus guarda.",
      },
      {
        q: "O Relloo faz campanha?",
        a: "Faz: do formulário e do cupom no WhatsApp até a venda no caixa e o cashback.",
      },
      {
        q: "O agente decide sozinho?",
        a: "Ele responde com o conhecimento da empresa, com a fonte, e passa a vez à equipe na hora certa.",
      },
    ],
  },
  magneto: {
    groups: [
      {
        title: "Do desenho ao fluxo",
        items: [
          {
            cap: 3,
            detail:
              "Você descreve o processo numa frase, e ele vira blocos para revisar.",
          },
          {
            cap: 0,
            detail:
              "O processo espalhado em planilha, e-mail e lembrete vira um desenho que anda.",
          },
          {
            cap: 1,
            detail:
              "A regra roda sozinha, e a pessoa decide só onde precisa aprovar.",
          },
        ],
      },
      {
        title: "Mudar com segurança",
        items: [
          {
            cap: 2,
            detail:
              "A nova versão fica ao lado e passa por teste antes de valer.",
          },
          {
            cap: 4,
            detail: "Se algo sai errado, a versão anterior volta num toque.",
          },
          {
            cap: 5,
            detail: "Fica registrado quem mudou cada regra.",
          },
        ],
      },
    ],
    audience: [
      {
        title: "Operação que vive em planilha e lembrete",
        text: "Quer transformar o processo espalhado num desenho que anda.",
        products: ["magneto"],
      },
      {
        title: "Equipe com aprovação em pontos certos",
        text: "A regra roda sozinha, e a pessoa decide só onde precisa.",
        products: ["magneto", "domus"],
      },
      {
        title: "Quem muda regra com frequência",
        text: "Testa a nova versão ao lado e volta à anterior num toque, se precisar.",
        products: ["magneto"],
      },
    ],
    faq: [
      {
        q: "Como eu crio um fluxo?",
        a: "Você descreve o processo numa frase, revisa os blocos e ele roda.",
      },
      {
        q: "E se a nova regra der errado?",
        a: "A versão anterior volta num toque, e o registro mostra quem mudou.",
      },
      {
        q: "De onde vêm as regras?",
        a: "As regras que o Domus guarda rodam como fluxo no Magneto.",
      },
    ],
  },
  tuner: {
    groups: [
      {
        title: "Canais",
        items: [
          {
            cap: 0,
            detail:
              "O número oficial do WhatsApp recebe e responde pelo Tuner.",
          },
          {
            cap: 1,
            detail: "A ligação vai para a equipe certa.",
          },
          {
            cap: 2,
            detail:
              "O chat do site chega do mesmo jeito que o WhatsApp e a voz.",
          },
        ],
      },
      {
        title: "Dentro da conversa",
        items: [
          {
            cap: 3,
            detail: "Foto e localização chegam inteiras ao número oficial.",
          },
          {
            cap: 4,
            detail: "A ligação passa adiante sem a pessoa repetir nada.",
          },
          {
            cap: 5,
            detail: "A conversa retoma no dia seguinte.",
          },
        ],
      },
    ],
    audience: [
      {
        title: "Empresa com mais de um canal de atendimento",
        text: "Recebe WhatsApp, ligação e chat do site e quer tudo numa conversa só.",
        products: ["tuner", "relloo"],
      },
      {
        title: "Central que transfere ligações",
        text: "A ligação vai para a equipe certa e passa adiante sem repetir nada.",
        products: ["tuner"],
      },
      {
        title: "Quem recebe foto e localização",
        text: "No número oficial do WhatsApp elas chegam inteiras, e a conversa retoma depois.",
        products: ["tuner"],
      },
    ],
    faq: [
      {
        q: "O WhatsApp é o número oficial?",
        a: "Sim. O Tuner usa o número oficial do WhatsApp.",
      },
      {
        q: "A ligação pode ser transferida?",
        a: "Pode: ela vai para a equipe certa e passa adiante sem a pessoa repetir nada.",
      },
      {
        q: "O que acontece no dia seguinte?",
        a: "A conversa retoma depois, e a foto e a localização continuam inteiras.",
      },
    ],
  },
  knowly: {
    groups: [
      {
        title: "Respostas",
        items: [
          {
            cap: 0,
            detail: "Cada frase da resposta traz a origem.",
          },
          {
            cap: 5,
            detail: "Quando não encontra, ele diz que não encontrou.",
          },
          {
            cap: 2,
            detail:
              "Cada pessoa vê só o que pode, e a resposta respeita quem pergunta.",
          },
        ],
      },
      {
        title: "Fontes",
        items: [
          {
            cap: 1,
            detail: "O que a equipe guarda, espalhado, vira um lugar só.",
          },
          {
            cap: 3,
            detail: "O conteúdo é atualizado na fonte.",
          },
          {
            cap: 4,
            detail: "A base é montada sem dado pessoal.",
          },
        ],
      },
    ],
    audience: [
      {
        title: "Equipe com conhecimento espalhado",
        text: "Quer reunir as fontes num lugar só, atualizado na origem.",
        products: ["knowly"],
      },
      {
        title: "Operação em que nem todos veem tudo",
        text: "Cada pessoa vê só o que pode, e a resposta respeita quem pergunta.",
        products: ["knowly"],
      },
      {
        title: "Atendimento que responde com a fonte",
        text: "O Relloo responde com o texto do Knowly e mostra de onde veio.",
        products: ["knowly", "relloo"],
      },
    ],
    faq: [
      {
        q: "E se ele não encontrar a resposta?",
        a: "Ele avisa que não encontrou.",
      },
      {
        q: "Como ele respeita quem pergunta?",
        a: "Cada pessoa vê só o que pode, e a resposta respeita essa regra.",
      },
      {
        q: "O conteúdo fica atualizado?",
        a: "Sim: o que a equipe guarda é atualizado na fonte.",
      },
    ],
  },
};
