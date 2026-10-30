// TEXTO DA CENA: MAGNETO
// pt-BR. The text of the approved frames V3Magneto-1..4, word for word (the scene is components/scene-kit/scenes/magneto-carousel.tsx).
// Text only. What is NOT here: the step ids, the icons, the tones and the data-* keys of each piece, which stay in the
// component; it reads the text by key (`f1..f4` are the four frames, `frameNames` is read by position, one per frame).
export const magneto = {
  product: "Magneto",
  title: "Fluxos",
  label:
    "Magneto: a proposta começa o fluxo sozinha, ele divide o trabalho, espera a aprovação e conclui sem nada em dobro",
  flow: "Aprovação de proposta",
  active: "Ativo",
  domus: "Welabs Domus",
  tuner: "Tuner",
  proposal: "Proposta 905",
  // v4 (Stage.dc.html): the name of each moment, on the stage tabs of the chrome (one per frame, in order)
  frameNames: ["Começa sozinho", "Divide", "Espera", "Conclui"],
  f1: {
    source: "proposta revisada",
    started: "Começou sozinho",
    nobody: "ninguém precisou apertar nada",
    nextLabel: "Próximo passo",
    nextStep: "Conferir proposta",
  },
  f2: {
    trigger: "Gatilho",
    approval: "Aprovação da gerência",
    now: "agora",
    contract: "Preparar contrato",
    same: "ao mesmo tempo",
  },
  f3: {
    waiting: "Aguardando a gerência",
    warned: "avisou a gerência",
    ready: "contrato pronto",
    afterLabel: "Depois da aprovação",
    afterStep: "Enviar para assinatura",
  },
  f4: {
    approved: "Aprovado",
    by: "pela gerência",
    sign: "Enviar para assinatura",
    failure: "Uma falha no meio",
    concluded: "Concluído, sem nada em dobro",
    order: "Pedido 1234 criado",
    sent: "contrato enviado",
    // v3 (2026-10-23): no personification ("Como ele sabe...": copy-rules.json `words`), the effect as the question
    question: "Quanto trabalho é refeito na sua empresa?",
  },
} as const;
