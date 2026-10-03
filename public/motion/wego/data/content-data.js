export const panoramaData = {
  duration: 16,
  focus: {
    entityId: "document-demo-01",
    selector: "#entity-docgo",
    scale: 1.68,
    targetY: 620,
    approachStart: 3,
    approachDuration: 1.5,
    holdUntil: 7,
    returnDuration: 1.5,
  },
  modules: [
    { id: "docgo", label: "DocGo", entityId: "document-demo-01", object: "Documento DEMO 01", artwork: "document", state: "Rascunho documental", details: ["Pasta DEMO", "Estado: rascunho"] },
    { id: "signgo", label: "SignGo", entityId: "file-demo-02", object: "Arquivo DEMO 02", artwork: "signing-file", state: "Preparação da etapa de assinadores", details: ["arquivo-demo.pdf", "Etapa: Assinadores"] },
    { id: "sgors", label: "SGORS", entityId: "mtr-demo-03", object: "MTR DEMO 03", artwork: "waste-record", state: "Registro de resíduos · etapa de transporte", details: ["Resíduo genérico", "120 kg · DEMO"] },
    { id: "licenciamento", label: "Licenciamento", entityId: "request-demo-04", object: "Requerimento DEMO 04", artwork: "application-folder", state: "Documentos e acompanhamento", details: ["REQ · DEMO-042", "Consulta de anexos"] },
    { id: "sistema-ima", label: "Sistema IMA", entityId: "registry-demo-05", object: "Cadastro Técnico DEMO 05", artwork: "registry-ledger", state: "Registro salvo para consulta", details: ["Categoria: DEMO", "Cadastro Técnico"] },
  ],
};
