// CONTEÚDO PÚBLICO DOS PRODUTOS
// Public capabilities follow the product dossiers and accepted demonstrations; no deployment or performance claim is implied.
import type { ProductSlug } from "./products";

type Capability = {
  title: string;
  description: string;
  points: readonly string[];
  note?: string;
};

export type ProductDetailContent = {
  headline: string;
  benefits: readonly [string, string];
  overviewTitle: string;
  overview: string;
  audience: string;
  capabilitiesTitle: string;
  capabilitiesIntro: string;
  capabilities: readonly Capability[];
  demonstrationTitle: string;
  demonstrationDescription: string;
  relatedTitle: string;
  relatedDescription: string;
};

export const PRODUCT_DETAILS: Record<ProductSlug, ProductDetailContent> = {
  domus: {
    headline: "Toda a gestão, na mesma base.",
    benefits: [
      "Reúna as informações financeiras, comerciais e operacionais para acompanhar a empresa como um todo.",
      "Organize também os cadastros, as telas e as regras que dão forma ao seu negócio.",
    ],
    overviewTitle: "As áreas trabalham juntas. A gestão também.",
    overview:
      "Uma compra movimenta estoque e financeiro. Uma venda envolve contrato, cobrança e serviço. O Domus reúne essas frentes e a definição dos dados do negócio para que cada área trabalhe a partir da mesma base.",
    audience:
      "Para equipes de gestão, finanças e operação que precisam conectar a rotina da empresa.",
    capabilitiesTitle: "Da rotina financeira à organização do negócio.",
    capabilitiesIntro:
      "O Domus cobre as frentes de gestão da empresa e permite organizar os dados que cada uma precisa.",
    capabilities: [
      {
        title: "Finanças, contratos e fiscal de serviços",
        description:
          "Acompanhe recebimentos, pagamentos e bancos, com contratos e obrigações fiscais no mesmo contexto de gestão.",
        points: [
          "Contas a pagar e a receber",
          "Bancos e conciliação financeira",
          "Contratos e assinaturas",
          "Emissão de NFS-e e integrações financeiras",
        ],
      },
      {
        title: "Compras, estoque, vendas e produção",
        description:
          "A gestão reúne o caminho dos materiais, dos pedidos e da produção, da aquisição até a venda.",
        points: [
          "Compras e fornecedores",
          "Estoque e movimentações",
          "Vendas e pedidos",
          "Planejamento e acompanhamento da produção",
        ],
      },
      {
        title: "Pessoas, projetos e patrimônio",
        description:
          "Organize as pessoas, os trabalhos em andamento e os recursos que sustentam a operação.",
        points: [
          "Gestão de pessoas",
          "Projetos e atividades",
          "Ativos e patrimônio",
          "Controle de qualidade",
        ],
      },
      {
        title: "Cadastros, telas e regras próprias",
        description:
          "Defina como as informações do seu negócio são organizadas e como elas aparecem para cada equipe.",
        points: [
          "Cadastros e campos do negócio",
          "Telas a partir dos cadastros",
          "Definição de fluxos de trabalho",
          "Perfis e direitos de uso",
        ],
      },
    ],
    demonstrationTitle: "Veja a gestão ganhar forma.",
    demonstrationDescription:
      "As demonstrações percorrem a definição de uma regra, seu fluxo de trabalho e a criação de cadastros e telas.",
    relatedTitle: "A gestão é o ponto de partida.",
    relatedDescription:
      "Conheça também os produtos para relacionamento, processos, canais e conhecimento. Cada um cuida de uma parte do trabalho.",
  },
  relloo: {
    headline: "Cada conversa, no contexto certo.",
    benefits: [
      "Reúna contatos, conversas e oportunidades para que a equipe acompanhe o relacionamento inteiro.",
      "Mantenha o histórico por perto ao responder, encaminhar um atendimento ou seguir uma venda.",
    ],
    overviewTitle: "O contato muda de canal. A história continua.",
    overview:
      "Uma pessoa pede um orçamento, tira uma dúvida e volta para comprar. O Relloo organiza esse percurso: a ficha do contato, as conversas, os responsáveis e as etapas comerciais ficam no mesmo contexto.",
    audience:
      "Para equipes de vendas, atendimento e relacionamento com clientes.",
    capabilitiesTitle: "Relacionamento com continuidade.",
    capabilitiesIntro:
      "Da primeira mensagem às campanhas de fidelização, a equipe tem os dados e os caminhos para acompanhar cada pessoa.",
    capabilities: [
      {
        title: "Contatos e oportunidades",
        description:
          "Organize quem está em contato com a empresa e em que ponto cada oportunidade se encontra.",
        points: [
          "Ficha do contato com campos e etiquetas",
          "Histórico de conversas e ligações",
          "Negócios e etapas do funil comercial",
          "Organização dos dados por empresa",
        ],
      },
      {
        title: "Atendimento em equipe",
        description:
          "Receba as conversas em uma caixa de entrada e encaminhe cada atendimento com seu histórico.",
        points: [
          "WhatsApp, chat do site e telefone",
          "Filas, responsáveis e distribuição por equipe",
          "Respostas prontas e mensagens aprovadas",
          "Transferência de ligações e acompanhamento do atendimento",
        ],
      },
      {
        title: "Agentes e caminhos de conversa",
        description:
          "Prepare agentes de IA com o conhecimento da empresa e desenhe o que acontece em cada caminho do atendimento.",
        points: [
          "Bases de conhecimento e respostas com fonte",
          "Simulador para testar o agente antes de ativar",
          "Fluxos visuais com menus, condições e ações",
          "Encaminhamento para pessoas e histórico das execuções",
        ],
      },
      {
        title: "Campanhas e fidelização",
        description:
          "Conecte a coleta de informações, os benefícios de uma campanha e o acompanhamento da venda.",
        note: "Recursos avançados",
        points: [
          "Formulários com perguntas e condições",
          "Campanhas, roletas e cupons",
          "Pré-venda e vendas no ponto de atendimento",
          "Programas de fidelidade e cashback",
        ],
      },
    ],
    demonstrationTitle: "Explore os caminhos do relacionamento.",
    demonstrationDescription:
      "Veja como preparar um agente, desenhar uma conversa em blocos e acompanhar uma campanha até a fidelização.",
    relatedTitle: "O relacionamento faz parte de uma operação maior.",
    relatedDescription:
      "Conheça a gestão do Domus e os produtos para processos, canais e conhecimento que compõem a família Welabs.",
  },
  magneto: {
    headline: "Seu processo, visível do início ao fim.",
    benefits: [
      "Desenhe etapas, decisões e aprovações em blocos que mostram como o trabalho deve seguir.",
      "Acompanhe cada execução, ajuste as regras e mantenha o histórico das mudanças.",
    ],
    overviewTitle: "O caminho do trabalho fica explícito.",
    overview:
      "Um pedido chega, alguém decide e outra equipe precisa receber o aviso. O Magneto organiza esse percurso em um workflow visual, com os caminhos, as esperas e os responsáveis pelo processo.",
    audience:
      "Para equipes que conhecem seus processos e precisam organizar o trabalho entre pessoas e sistemas.",
    capabilitiesTitle: "Do desenho à rotina do processo.",
    capabilitiesIntro:
      "Monte o caminho, teste uma nova versão e acompanhe o que aconteceu em cada etapa.",
    capabilities: [
      {
        title: "Workflow visual em blocos",
        description:
          "Transforme o processo em etapas conectadas. Deixe claro o que inicia o trabalho, quem decide e para onde ele segue.",
        points: [
          "Etapas e ações conectadas no desenho",
          "Condições com caminhos alternativos",
          "Aprovações feitas por pessoas",
          "Avisos e ações em outros sistemas",
        ],
      },
      {
        title: "Copiloto para começar o desenho",
        description:
          "Descreva o processo em palavras e use os blocos sugeridos como ponto de partida para a revisão.",
        points: [
          "Descrição do processo em linguagem natural",
          "Sugestões de etapas e conexões",
          "Revisão e ajuste antes da ativação",
        ],
      },
      {
        title: "Esperas e retomadas",
        description:
          "O processo pode esperar uma decisão e continuar do ponto em que parou quando a resposta chegar.",
        points: [
          "Espera pela aprovação ou resposta",
          "Retomada após uma interrupção",
          "Acompanhamento das etapas já concluídas",
        ],
      },
      {
        title: "Versões, testes e histórico",
        description:
          "Prepare uma mudança ao lado da regra em uso, experimente e escolha quando colocar a nova versão em funcionamento.",
        points: [
          "Rascunhos e versões do fluxo",
          "Execução com um pedido de teste",
          "Ativação e retorno à versão anterior",
          "Registro de quem mudou o quê",
        ],
      },
    ],
    demonstrationTitle: "Acompanhe o processo em movimento.",
    demonstrationDescription:
      "Veja uma execução esperar e retomar, uma regra mudar de versão e uma descrição virar um desenho revisável.",
    relatedTitle: "Processos atravessam áreas diferentes.",
    relatedDescription:
      "Conheça os produtos de gestão, relacionamento, canais e conhecimento para as outras partes da sua operação.",
  },
  tuner: {
    headline: "Os canais se encontram aqui.",
    benefits: [
      "Reúna WhatsApp, voz e chat do site para organizar a chegada das conversas.",
      "Preserve o contexto ao responder ou transferir uma ligação, sem pedir que a pessoa comece de novo.",
    ],
    overviewTitle: "Uma conversa pode passar por vários canais.",
    overview:
      "O cliente manda uma mensagem, compartilha uma foto e depois liga. O Tuner conecta os canais e organiza esse percurso para que a equipe tenha o contexto da conversa ao continuar o atendimento.",
    audience:
      "Para equipes de atendimento e produtos que precisam conversar com as pessoas em canais diferentes.",
    capabilitiesTitle: "Mensagens e ligações com contexto.",
    capabilitiesIntro:
      "Os canais compartilham a organização da conversa e preservam o formato de cada interação.",
    capabilities: [
      {
        title: "Canais conectados",
        description:
          "Organize a chegada de mensagens e ligações e adapte as respostas ao canal usado pela pessoa.",
        points: [
          "WhatsApp, voz e chat do site",
          "Conversas com seu contexto",
          "Respostas com listas e botões conforme o canal",
          "Conexão dos canais com outros produtos",
        ],
      },
      {
        title: "Central de ligações",
        description:
          "Receba a chamada, encaminhe para a fila adequada e transfira o atendimento com a história da conversa.",
        points: [
          "Boas-vindas e escolha do atendimento",
          "Filas de chamadas e disponibilidade da equipe",
          "Atendimento e transferência de ligações",
          "Contexto da conversa para quem recebe a transferência",
        ],
      },
      {
        title: "WhatsApp oficial",
        description:
          "Conecte o número da empresa e acompanhe as mensagens, os anexos e a continuidade da conversa.",
        points: [
          "Conexão do número da empresa",
          "Fotos e localização na conversa",
          "Mensagens aprovadas para retomar o contato",
          "Estados de envio, recebimento e leitura",
        ],
      },
    ],
    demonstrationTitle: "Veja a conversa continuar.",
    demonstrationDescription:
      "As demonstrações mostram uma ligação passar entre pessoas e uma conversa continuar no WhatsApp oficial.",
    relatedTitle: "O canal é parte do relacionamento.",
    relatedDescription:
      "Explore o Relloo para acompanhar contatos e oportunidades, e conheça a gestão, os processos e o conhecimento da família Welabs.",
  },
  knowly: {
    headline: "Encontre a resposta e sua fonte.",
    benefits: [
      "Consulte o conhecimento da empresa em uma pergunta e confira de onde veio cada resposta.",
      "Reúna as fontes da equipe respeitando o que cada pessoa pode acessar.",
    ],
    overviewTitle: "O conhecimento da equipe fica ao alcance.",
    overview:
      "Uma decisão está em uma reunião, outra em um documento e outra em um ticket. O Knowly reúne essas fontes para encontrar o contexto da pergunta e apresentar uma resposta que pode ser conferida.",
    audience:
      "Para equipes que precisam consultar documentos, decisões e procedimentos da empresa.",
    capabilitiesTitle: "Conhecimento que pode ser conferido.",
    capabilitiesIntro:
      "Reúna as fontes, encontre o trecho relevante e mantenha os limites de acesso de cada área.",
    capabilities: [
      {
        title: "Perguntas e respostas com fonte",
        description:
          "Pergunte em suas palavras e siga as referências para conferir o contexto usado na resposta.",
        points: [
          "Perguntas em linguagem natural",
          "Busca nas fontes de conhecimento",
          "Referências e trechos para conferência",
          "Indicação quando falta informação",
        ],
      },
      {
        title: "Fontes reunidas e atualizadas",
        description:
          "Traga o conhecimento que está espalhado entre documentos e sistemas e acompanhe as mudanças na origem.",
        points: [
          "Documentos e registros de reuniões",
          "Tickets e conteúdo de código",
          "Atualização a partir das fontes conectadas",
          "Tratamento de dados pessoais no conteúdo",
        ],
      },
      {
        title: "Acesso por pessoa e equipe",
        description:
          "Cada consulta respeita os limites de acesso de quem pergunta, inclusive quando a pessoa muda de equipe.",
        points: [
          "Conhecimento organizado por área",
          "Permissões para consultar cada fonte",
          "Respostas de acordo com o acesso da pessoa",
          "Registro das consultas",
        ],
      },
    ],
    demonstrationTitle: "Explore as fontes e seus limites.",
    demonstrationDescription:
      "Veja como fontes diferentes se tornam conhecimento consultável e como cada resposta respeita quem pergunta.",
    relatedTitle: "Conhecimento acompanha o trabalho.",
    relatedDescription:
      "Conheça os produtos para gestão, relacionamento, processos e canais, as outras partes da família Welabs.",
  },
};
