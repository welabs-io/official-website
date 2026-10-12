// CONTEÚDO DE CADA PRODUTO
// Problems, capabilities and film captions, one entry per product, in weight order. Every claim comes from the films
// of the motion round (manifest `proves`), the Domus synthesis of 2026-10-08 or the product dossiers of the portfolio:
// no client, no metric, no feature that is not there. The line under the logo stays in lib/products.ts.
import type { ProductContentMap } from "./types";

export const PRODUCT_CONTENT: ProductContentMap = {
  domus: {
    resolves: [
      {
        problem: "Cada área guarda os dados num lugar diferente.",
        does: "O Domus reúne cadastros, financeiro e contratos da empresa num sistema só.",
      },
      {
        problem: "Um cadastro novo vira um projeto de programação.",
        does: "Você desenha o cadastro e a tela nasce pronta, sem refazer o sistema.",
      },
      {
        problem: "As regras da empresa ficam só no papel.",
        does: "As regras moram dentro do Domus e rodam como fluxo no Magneto.",
      },
    ],
    capabilities: [
      { icon: "bank", text: "Financeiro e bancos" },
      { icon: "screen", text: "Cadastro que vira tela" },
      { icon: "flow", text: "Regras que rodam no Magneto" },
      { icon: "contract", text: "Contratos e assinaturas" },
      { icon: "people", text: "Gestão de pessoas" },
      { icon: "receipt", text: "Nota fiscal de serviço" },
    ],
    filmCaptions: [
      "O cadastro que você desenha vira tela, fluxo e regra.",
      "Cada andar da casa reúne uma frente da empresa, todas no mesmo sistema.",
    ],
  },
  relloo: {
    resolves: [
      {
        problem: "O pedido chega por canais diferentes e se perde.",
        does: "O Relloo junta tudo num cartão com responsável, prazo e histórico.",
      },
      {
        problem: "A pessoa conta o pedido de novo a cada contato.",
        does: "O cartão traz as conversas e os pedidos anteriores, e os dados que o Domus guarda.",
      },
      {
        problem: "Campanha e venda ficam em ferramentas separadas.",
        does: "O Relloo acompanha do formulário e do cupom no WhatsApp até a venda no caixa e o cashback.",
      },
    ],
    capabilities: [
      { icon: "card", text: "Cartão com dono e prazo" },
      { icon: "history", text: "Histórico de cada pessoa" },
      { icon: "megaphone", text: "Campanha e cupom no WhatsApp" },
      { icon: "funnel", text: "Funis e etapas de venda" },
      { icon: "cash", text: "Venda no caixa e cashback" },
      { icon: "bot", text: "Agente que passa a vez" },
    ],
    filmCaptions: [
      "O contato chega, é reconhecido e ganha cartão, prazo e responsável.",
      "Do formulário ao cupom no WhatsApp, da venda no caixa ao cashback.",
      "O agente responde com o conhecimento da empresa e passa a vez à equipe.",
    ],
  },
  magneto: {
    resolves: [
      {
        problem: "O processo vive em planilha, e-mail e lembrete.",
        does: "O Magneto desenha o processo em blocos, e ele passa a rodar.",
      },
      {
        problem: "Explicar o processo a quem programa leva semanas.",
        does: "Você descreve o processo numa frase, revisa os blocos e ele roda.",
      },
      {
        problem: "Mudar uma regra dá medo.",
        does: "A nova versão fica ao lado, passa por teste e volta à anterior num toque.",
      },
    ],
    capabilities: [
      { icon: "blocks", text: "Fluxo desenhado em blocos" },
      { icon: "approval", text: "Aprovação onde precisa" },
      { icon: "versions", text: "Versão testada ao lado" },
      { icon: "wand", text: "Processo descrito em frase" },
      { icon: "undo", text: "Volta atrás num toque" },
      { icon: "log", text: "Registro de quem mudou" },
    ],
    filmCaptions: [
      "Você descreve o processo numa frase e ele vira blocos para revisar.",
      "O processo espalhado em planilha, e-mail e lembrete vira um desenho que anda.",
      "A nova versão fica ao lado, passa por teste e volta atrás num toque.",
    ],
  },
  tuner: {
    resolves: [
      {
        problem: "Cada canal tem a sua própria caixa de entrada.",
        does: "Voz, WhatsApp e chat do site chegam do mesmo jeito, numa conversa só.",
      },
      {
        problem: "A pessoa repete tudo quando a ligação é transferida.",
        does: "A ligação vai para a equipe certa e passa adiante sem repetir nada.",
      },
      {
        problem: "Foto e localização se perdem pelo caminho.",
        does: "No número oficial do WhatsApp elas chegam inteiras e a conversa retoma no dia seguinte.",
      },
    ],
    capabilities: [
      { icon: "chat", text: "Número oficial no WhatsApp" },
      { icon: "phone", text: "Ligação para a equipe certa" },
      { icon: "globe", text: "Chat no site" },
      { icon: "pin", text: "Foto e localização inteiras" },
      { icon: "transfer", text: "Transferência sem repetir nada" },
      { icon: "history", text: "Conversa retomada no dia seguinte" },
    ],
    filmCaptions: [
      "Voz, WhatsApp e chat chegam do mesmo jeito, numa conversa só.",
      "A ligação vai para a equipe certa e é transferida sem repetir nada.",
      "No número oficial, foto e localização chegam inteiras e a conversa retoma depois.",
    ],
  },
  knowly: {
    resolves: [
      {
        problem: "O que a equipe guarda está espalhado.",
        does: "O Knowly reúne as fontes num lugar só e acompanha cada atualização.",
      },
      {
        problem: "Ninguém confere de onde veio a resposta.",
        does: "Cada frase da resposta traz a origem, e ele avisa quando não encontra.",
      },
      {
        problem: "Nem todo mundo deve ver tudo.",
        does: "Cada pessoa vê só o que pode, e a resposta respeita quem pergunta.",
      },
    ],
    capabilities: [
      { icon: "link", text: "Resposta com a fonte" },
      { icon: "folder", text: "Fontes num lugar só" },
      { icon: "lock", text: "Acesso por pessoa" },
      { icon: "refresh", text: "Atualizado na origem" },
      { icon: "shield", text: "Sem dado pessoal" },
      { icon: "question", text: "Avisa quando não encontra" },
    ],
    filmCaptions: [
      "Cada frase da resposta traz a origem, e ele avisa quando não encontrou.",
      "O que a equipe guarda, espalhado, vira um lugar só, atualizado na fonte.",
      "Cada pessoa vê só o que pode, e a resposta respeita quem pergunta.",
    ],
  },
};
