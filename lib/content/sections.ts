// CONTEÚDO DAS SEÇÕES DE LEITURA DA HOME
// The reading sections of the home, between the visual ones (the chain, the product ring, the connector block): the
// order from start to end, what changes in the operation, who it is for, integrations, questions and the contact. Every
// claim comes from the films of the motion round, the product dossiers and the Domus synthesis of 2026-10-08. No
// company, no metric, no case: the people of the scenes (Marina, the order 1234) are the fictional story of the chain.
import type {
  Audience,
  Benefit,
  Faq,
  IntegrationGroup,
  JourneyStep,
} from "./types";

// Headings and supporting lines of the sections (and of the navigation anchors)
export const HOME_SECTIONS = {
  journey: {
    title: "Um pedido, do começo ao fim",
    lead: "Os mesmos sete passos do carrossel, para ler com calma.",
  },
  benefits: {
    title: "O que muda na operação",
    lead: "Cada mudança aparece numa tela dos produtos.",
  },
  audience: {
    title: "Para quem",
    lead: "Quatro situações em que os produtos se encaixam.",
  },
  integrations: {
    title: "Integrações e infraestrutura",
    lead: "Por onde a conversa chega, onde o dado fica, onde rodamos e o que a IA faz.",
  },
  faq: {
    title: "Perguntas frequentes",
  },
  contact: {
    title: "Contato",
    // Operator decision of 2026-10-09 for the closing
    lead: "Conte o que sua empresa precisa. A gente mostra como os produtos se encaixam.",
  },
} as const;

// The seven steps of the chain, in the order of the story of the scenes (lib/scenes/story.ts)
export const JOURNEY: readonly JourneyStep[] = [
  {
    products: ["domus", "relloo"],
    text: "O Domus guarda os cadastros e as regras, e o Relloo se encaixa nele. Os dois formam o núcleo.",
  },
  {
    products: ["tuner"],
    text: "Marina liga e manda uma mensagem no WhatsApp. O Tuner junta a ligação e a mensagem numa conversa só.",
  },
  {
    products: ["relloo"],
    text: "O Relloo abre o cartão do Pedido 1234, com responsável e prazo.",
  },
  {
    products: ["domus"],
    text: "O Domus passa ao cartão o endereço e o pedido. Ninguém digita de novo.",
  },
  {
    products: ["knowly"],
    text: "O Knowly consulta a política de entregas, responde sobre o sábado e mostra a fonte.",
  },
  {
    products: ["magneto"],
    text: "O Magneto leva a regra até a gestora, que só precisa aprovar a alteração de entrega.",
  },
  {
    products: ["domus", "tuner"],
    text: "O pedido volta atualizado ao Domus, e o Tuner avisa a Marina sem ela perguntar.",
  },
];

// What changes in the operation: concrete, each with the settled frame of the scene that shows it
export const BENEFITS: readonly Benefit[] = [
  {
    scene: "s3",
    title: "O mesmo dado não é digitado duas vezes",
    text: "O Relloo abre o cartão com o endereço e o pedido que o Domus já guarda.",
  },
  {
    scene: "s5",
    title: "A regra roda sozinha e a pessoa só aprova",
    text: "O Magneto cumpre a regra do Domus e chama a gestora só na hora de aprovar.",
  },
  {
    scene: "s4",
    title: "A resposta sai com a fonte",
    text: "O Knowly mostra de qual fonte veio cada resposta e avisa quando não encontra.",
  },
  {
    scene: "s1",
    title: "WhatsApp, voz e chat numa conversa",
    text: "O Tuner junta a ligação, o número oficial do WhatsApp e o chat do site.",
  },
  {
    scene: "s2",
    title: "Cada pedido tem dono e prazo",
    text: "O cartão do Relloo traz o responsável, o prazo e o histórico de cada pessoa.",
  },
  {
    scene: "s6",
    title: "Tudo volta registrado",
    text: "O pedido atualizado fica no Domus, e a pessoa recebe a confirmação sem perguntar.",
  },
];

// Profiles of operation, without any company name
export const AUDIENCE: readonly Audience[] = [
  {
    title: "Empresa que vende e conversa pelo WhatsApp",
    text: "Voz, WhatsApp e chat chegam numa conversa só no Tuner, e o Relloo guarda o cartão, o prazo e o histórico.",
    products: ["tuner", "relloo"],
  },
  {
    title: "Operação com regra e aprovação",
    text: "As regras moram no Domus e rodam no Magneto, com a pessoa só onde precisa aprovar.",
    products: ["domus", "magneto"],
  },
  {
    title: "Equipe que precisa de uma base de conhecimento",
    text: "O Knowly reúne as fontes, responde com a origem e mostra a cada pessoa só o que ela pode ver.",
    products: ["knowly"],
  },
  {
    title: "Empresa que quer a gestão num sistema só",
    text: "O Domus reúne cadastros, financeiro e bancos, contratos e pessoas, com nota fiscal de serviço.",
    products: ["domus"],
  },
];

// Integrations and infrastructure; `marks` are names of lib/partners.ts (PLATFORM_LOGOS)
export const INTEGRATIONS: readonly IntegrationGroup[] = [
  {
    id: "channels",
    title: "Canais",
    text: "Por onde a conversa chega ao Tuner.",
    chips: [
      { icon: "chat", text: "WhatsApp oficial" },
      { icon: "phone", text: "Ligação de voz" },
      { icon: "globe", text: "Chat no site" },
    ],
    marks: [],
  },
  {
    id: "data",
    title: "Dados",
    text: "O que o Domus guarda e como o dado anda.",
    chips: [
      { icon: "bank", text: "Bancos e extratos" },
      { icon: "receipt", text: "Nota fiscal de serviço" },
      { icon: "contract", text: "Contratos e assinaturas" },
    ],
    marks: ["PostgreSQL", "Temporal"],
  },
  {
    id: "cloud",
    title: "Nuvem",
    text: "Onde os produtos rodam e como são publicados.",
    chips: [],
    marks: [
      "AWS",
      "DigitalOcean",
      "HostDime",
      "Google Cloud",
      "Cloudflare",
      "Kubernetes",
      "Docker",
      "Argo CD",
      "Vault",
      "Authentik",
      "GitHub",
    ],
  },
  {
    id: "ai",
    title: "IA",
    text: "O que a máquina faz e onde a pessoa decide.",
    chips: [
      { icon: "link", text: "Resposta com a fonte" },
      { icon: "bot", text: "Agente que passa a vez" },
      { icon: "wand", text: "Processo descrito em frase" },
    ],
    marks: [],
  },
];

// Questions of the home: facts of the portfolio only
export const HOME_FAQ: readonly Faq[] = [
  {
    q: "O que a Welabs desenvolve?",
    a: "Cinco produtos próprios de software: Domus para a gestão, Relloo para relacionamento e vendas, Magneto para fluxos de trabalho, Tuner para os canais de atendimento e Knowly para a base de conhecimento.",
  },
  {
    q: "Como os produtos se ligam?",
    a: "Domus e Relloo formam o núcleo. O Magneto roda as regras do Domus, o Tuner leva ligação, WhatsApp e chat ao Relloo, e o Knowly responde com o texto e a fonte.",
  },
  {
    q: "Que canais o Tuner cobre?",
    a: "O número oficial do WhatsApp, a ligação de voz e o chat do site. Foto e localização chegam inteiras, e a conversa retoma no dia seguinte.",
  },
  {
    q: "A resposta do Knowly mostra de onde veio?",
    a: "Sim. Cada frase da resposta traz a origem, e ele avisa quando não encontra. Cada pessoa vê só o que pode ver.",
  },
  {
    q: "Dá para mudar uma regra sem medo?",
    a: "No Magneto a nova versão fica ao lado, passa por teste e volta à anterior num toque. O registro mostra quem mudou.",
  },
  {
    q: "O que o Domus reúne?",
    a: "Financeiro e bancos, contratos e assinaturas, gestão de pessoas e nota fiscal de serviço. O cadastro que você desenha vira tela.",
  },
  {
    q: "Onde os produtos rodam?",
    a: "Em nuvem: usamos AWS, DigitalOcean, HostDime e Google Cloud, com Cloudflare, Kubernetes e Argo CD nas publicações.",
  },
  {
    q: "A Marina e o Pedido 1234 existem?",
    a: "Não. Eles são um exemplo para mostrar a cadeia, e os dados das cenas e dos filmes são fictícios.",
  },
];
