// CONTEÚDO SINTÉTICO DA JORNADA IUS
export const iusContent = {
  workingName: "IUS",
  title: "Exame compartilhado antes do cadastro",
  entity: {
    id: "exam-demo-042",
    label: "EXAME DEMO · 042",
    metadata: "DADOS BÁSICOS",
  },
  phases: [
    {
      id: "invitation",
      label: "01 / CONVITE",
      description: "O profissional recebe o exame compartilhado.",
      recordState: "EXAME COMPARTILHADO",
    },
    {
      id: "limited-view",
      label: "02 / ACESSO LIMITADO",
      description: "Antes do cadastro, a visualização é limitada a dados básicos.",
      recordState: "VISUALIZAÇÃO LIMITADA",
    },
    {
      id: "registration",
      label: "03 / APÓS O CADASTRO",
      description: "O cadastro do profissional é concluído.",
      recordState: "CADASTRO CONCLUÍDO",
    },
    {
      id: "incorporated",
      label: "04 / INCORPORADO",
      description: "Após o cadastro, o exame é incorporado.",
      recordState: "EXAME INCORPORADO",
    },
  ],
  demoSeal: "DEMO",
};
