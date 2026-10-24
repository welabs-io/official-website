// TEXTO DA CENA: DOMUS
// pt-BR. The words of the Domus carousel (components/scene-kit/scenes/domus-carousel.tsx), four frames. Text only: the ids
// of the steps, the glyphs, the tones and the order stay in the component. The names of the areas and of the two floors
// are not here, they are the home's (home.domus.*); the call to action is common.cta. Lists the component reads by
// position (frames, frameNames, typeFields, list.cols, list.visits) keep their size in every language. Placeholders:
// `{count}` is the number of areas not named in the frame, `{names}` the first three of them joined by ", " (the
// component lowercases them and capitalises the sentence).
export const domus = {
  // Accessible name of the whole scene
  label:
    "Domus: a gestão inteira num lugar só, um tipo de registro novo que já nasce com tela, e o registro que liga os outros produtos",
  // Chrome bar: the screen each frame shows in the breadcrumb and its accessible name, in the order of the frames.
  // "Tipo de registro", not the frame's "Novo tipo de registro": the chrome of a phone cuts the longer one
  frames: [
    { title: "Módulos", label: "As áreas da empresa" },
    { title: "Tipo de registro", label: "O tipo novo vira tela" },
    { title: "Vistorias", label: "O assistente cria o registro" },
    { title: "Vistoria 318", label: "O registro liga os outros produtos" },
  ],
  // The name of each moment, on the stage tabs of the chrome
  frameNames: ["Áreas", "Tipo novo", "Assistente", "Tudo ligado"],

  // Frame 1: the count, the sum of the areas not named and the tile that makes a new type
  countText: "áreas da empresa, num lugar só",
  rest: "+ {count} áreas",
  restLine: "{names} e mais",
  newType: "Novo tipo de registro",

  // Frame 2: the new type, its fields (each also a column of the new screen) and the screen it gets
  type: "Vistoria",
  typeFields: ["Endereço", "Data e hora", "Contato"],
  screen: "Vistorias",
  ready: "Pronta para usar",

  // Frame 3: the list of visits, the assistant and its proposal
  list: {
    cols: ["Vistoria", "Data e hora", "Situação"],
    // When of each visit, in the order of the list (the new record on top)
    visits: ["amanhã, 09:00", "ontem, 14:00", "20/10, 10:30"],
  },
  assistant: "Assistente",
  context: "Oportunidade 562",
  ask: "agende a vistoria do Contato 4821 para amanhã às 9h",
  proposalHead: "Proposta",
  record: "Vistoria 318",
  recordLine: "amanhã, 09:00 · Contato 4821",
  confirm: "Confirmar",
  created: "Vistoria 318 criada",
  undo: "Desfazer",
  scheduled: "Agendada",
  done: "Feita",

  // Frame 4: the lines of the record, what each neighbour product does with it, and the question over the call to action
  recordLines: [
    { label: "Contato", value: "Contato 4821" },
    { label: "Data e hora", value: "amanhã, 09:00" },
  ],
  neighbours: {
    magneto: "o fluxo segue sozinho",
    tuner: "avisa quem vai",
    relloo: "a oportunidade avança",
    knowly: "guarda na memória",
  },
  question: "Que módulo a sua operação precisa?",
} as const;
