---
name: welabs-site-scenes
description: Como criar ou alterar uma cena de produto do site Welabs (welabs-website, kit components/scene-kit) com consistência e sem retrabalho - fluxo ficha de conceito, canvas de design, aprovação do operador, cena do kit e specs; modelo da ficha em 8 partes; catálogo de arquétipos (um por produto, nunca duas cenas iguais); carrossel de 3 a 4 quadros leves; regra do aperitivo (efeito, nunca mecanismo) que fecha em pergunta mais "Agendar uma demonstração"; regras visuais (paleta neutra, primária preta, orçamento de âmbar, controles da lib a 40 px com ícone, conectores grossos, números grandes); lib primeiro; contrato de continuidade do kit; método de teste (geometria, paridade com a lib, specs do kit, verde 3 vezes); política de evidência. Use antes de conceber, desenhar, implementar, revisar ou testar qualquer cena, carrossel, play ou palco de produto neste repositório, e ao escrever spec de movimento.
---

# Cenas de produto do site Welabs

Uma skill só para cena. Tokens, primitivas e a fronteira da lib estão em `welabs-site-ui`; texto visível, em `welabs-site-copy` (fonte única `lib/content/copy-rules.json`). Onde esta skill e uma ficha, um brief ou um ADR divergirem do **código**, vale o código (`app/lib.css`, `components/scene-kit/`); registre a divergência, não a esconda.

## 1. Fluxo, nesta ordem

Cada etapa só começa depois de a anterior fechar. Quando o operador nomeia um piloto, faça **só** o piloto e espere a validação antes de estender às outras cenas.

1. **Ficha de conceito** (8 partes, `references/concept-brief.md`). Nada se desenha antes dela: quadros tirados direto de ficha ensinaram o "como" e foram descartados.
2. **Canvas de design.** O conceito é desenhado como quadros estáticos (um arquivo por quadro, 1120 x 700, mesma paleta da §5) no canvas do projeto, com as duas ou três direções do **mesmo** arquétipo quando houver dúvida. O endereço do canvas vigente fica fora do repo, no registro de orquestração do redesenho (`site-redesign/v3-plan/orchestration.md` da pasta de controle do portfólio). Valide o conceito novo aqui, nunca em código.
3. **Aprovação do operador** sobre o canvas. Sem "sim" explícito, não se escreve cena.
4. **Cena do kit.** Copie `components/scene-kit/TEMPLATE.tsx` para `components/scene-kit/scenes/<produto>-<ideia>.tsx`, registre em `registry.ts` e `LabStage.tsx`, aprove sozinha em `/lab/scenes/<id>` (1440 e 390), e só então monte no site com uma linha. Id do carrossel: `<produto>-carousel`.
5. **Specs** (§8), escritas **antes** do estilo. Pronto = verdes 3 vezes seguidas.

Itere um componente por vez e pare para validação a cada bloco; a cena lê o canvas, o canvas não se improvisa em código.

## 2. Ficha de conceito

Oito partes, nesta ordem (modelo completo, com as perguntas de cada parte, em `references/concept-brief.md`): **1 problema e para quem; 2 cenário de operação; 3 visão completa; 4 papel no ecossistema; 5 o assistente no produto; 6 categoria e diferenciação; 7 cena (quadros); 8 vocabulário**.

- A ficha é **interna e pode ser detalhada**. O que vai para a tela é só o filtrado pela §4.
- O conceito é a **visão do produto no ecossistema**; o código é evidência, não limite. Não corte da ficha o que o operador define como parte do produto, e não use "só o que o código sustenta" para encolhê-lo. Mas texto em tela só promete o que `welabs-site-copy` permite.
- Parte 3 e parte 6 citam `arquivo:linha` com repositório e SHA; essas citações viram o comentário `file:line` das strings da cena.
- Os cinco produtos contam **o mesmo fio**: Contato 4821, Conversa 2210, Oportunidade 562, Vistoria 318, Proposta 905, Contrato 52, Pedido 1234, Chamado 140, Fatura 7710, NFS-e 3391. Quando uma cena mostra outro produto, é a marca dele recebendo o conector, com o registro do fio.

## 3. Arquétipos: um por produto, nunca duas cenas iguais

O que fez as cenas parecerem "tudo chat" foi o mesmo cabeçalho com lista vertical embaixo. Cada produto tem objeto central, tipo de tela e movimento próprios (tabela completa e anti-padrões em `references/archetypes.md`).

| Produto | Tipo de tela exclusivo | Movimento |
|---|---|---|
| Domus | mapa de módulos com o construtor (lista de campos tipados) | o campo nasce, a tela se forma, os outros produtos acendem |
| Relloo | caixa de entrada, pessoa e funil: única com bolha e histórico vertical | a conversa vira oportunidade e muda de etapa |
| Magneto | trilha da execução em grafo (passos, espera, ramos) | passos acendem um a um; um espera, outro se refaz |
| Tuner | leque de um envio para N canais, com a situação de cada um | o envio se abre e os selos avançam |
| Knowly | linha do tempo horizontal de um assunto | fontes chegam, o fato se funde, o trecho-prova aparece |

Regras: o elemento exclusivo de um produto **não aparece** na cena de outro; nenhuma cena abre com o mesmo cabeçalho e uma lista embaixo; o painel do assistente é o único elemento comum, de propósito (mesma forma nos cinco, até 1/3 da largura, um momento por cena). Cada cena declara o arquétipo na ficha. (Hoje essa regra é cobrada por revisão; o `data-archetype` por cena e a spec que barra o elemento fora da exclusividade são proposta ainda não implementada. Regra só em texto não mudou comportamento: implemente a spec quando for a segunda cena.)

## 4. Carrossel e aperitivo

**Carrossel.** Cada produto mostra **3 a 4 quadros leves, um conceito cada**, percorridos como passos de uma cena do kit. Nunca um quadro denso com tudo: foi julgado confuso, pesado e cansativo. Régua do quadro: **um objeto central, uma ideia, um conector, no máximo 1 a 2 peças em âmbar**.
- Transição fluida entre quadros, com as 3 curvas do site (`SCENE_EASE`), nunca corte seco. O indicador de quadro (1 a N) fica no cabeçalho.
- Assenta no último quadro; é ele que o servidor e o movimento reduzido mostram.

**Aperitivo: efeito, nunca mecanismo.** O site existe para a pessoa agendar uma demonstração: mostra impacto e deixa a dúvida nos "detalhes".
- Mostre o **efeito**. Número vira escala ou resultado; nada de valor de negócio, regra interna, chamada de código, tipo de campo, prazo interno, "releitura", regra de etapa ou passo de merge.
- **Teste de cópia**, em todo quadro: "isto ensina alguém a copiar?". Se sim, corte.
- O último quadro fecha com **uma pergunta de curiosidade** curta e o botão primário da lib **"Agendar uma demonstração"** (ícone de calendário), que leva a `#contact` da home.
- A ficha pode ser detalhada; a tela, não.

## 5. Regras visuais (valem para o canvas e para o código)

Fonte de verdade: `app/lib.css`, blocos PAPÉIS DE COR e CONTROLES. Se o canvas e o arquivo divergirem, vale o arquivo.

- **Paleta neutra (Welabs UI v3):** canvas `#f7f7f5`; superfície branca; cromo `#efefeb` (barra da janela, trilho, chip neutro); borda/linha `#e5e5e1`, só entre painéis; tinta `#121212`; texto secundário `#55565b` (só texto e ícone, nunca fundo nem preenchimento). **Nunca** creme, areia nem grafite quente (a paleta anterior foi rejeitada).
- **Primária preta** (`--primary` `#121212`, texto branco): botão, âncora-botão, badge, chip, segmento ativo, dia escolhido. Âmbar **nunca** é ação.
- **Orçamento de âmbar** (`--signal` `#ffb020`): só no que está vivo agora, no máximo **1 a 2 peças por quadro** (teto de 3 por tela assentada), sempre como **área**, nunca texto nem traço fino. Linha selecionada ou chegando: `--signal-soft`. O fim é **verde** (`--success`), nunca âmbar. Estado como minidot ao lado do título.
- **Controles da lib** (primitivas `ActionButton`, `IconButton`, `RowButton`, `TextField` de `components/lib/ui.tsx`): **40 px de altura, 14 px de raio** (o da lib, `--control-height-md`/`--control-radius`), **sempre com ícone** (lucide), borda de campo clara (`--input` = `--border`), a ação principal preta. Sem override de cor, raio ou borda por chamada: a cena só pinta **estado**.
- **Conectores** (`components/scene-kit/Connector.tsx`): sólidos, **2 a 3,5 px**, com seta, passando **por fora** das peças, nunca transparentes nem em âmbar; o do Relloo (ponto percorrendo) é o padrão. Engrosse onde estiver fino.
- **Números de destaque** em negrito, 22 a 28 px. Tipografia 20/16/14/12, sem rótulo em caixa alta. Sombra real na janela.
- Sem pessoa, rosto, inicial, nome, fornecedor ou marca de canal; sem "ERP"/"Cliente"; sem marcador de fase. Categorias no lugar das marcas (Mensagem, Chat corporativo, Videochamada, Comunidade, Integração).

## 6. Lib primeiro

Toda peça vem de `@imagineapps-team/react` pela fronteira; escrever à mão é a exceção justificada. Detalhes, tabela de componentes de movimento e o de/para em `references/lib-first.md`.

- **Arquivos de fronteira:** `components/lib/ui.tsx` (primitivas de controle, `Badge`, `Card`, `Table`) e `components/lib/scene.tsx` (`Alert`, `SegmentedControl`, `SplitView`, `Separator`, `Timeline`, `AnimatedList`, `TypingDots`, `useInView`, `useReducedMotion`). Só `components/lib/*.tsx` importa `@imagineapps-team/react/*`; nada de `<button>`, `<input>`, `<table>`, `<select>` nativo nem classe com nome de primitiva (`components/lib/ui-boundary.test.ts`). Entrada nova da lib = arquivo irmão com `"use client"`.
- **Procure antes de desenhar:** MCP `mcp__imagine-react-lib__search_component` e `get_component`; na dúvida, `node_modules/@imagineapps-team/react/dist/*.d.ts` (a verdade da versão instalada).
- **Padrões do ui-kit do Domus** (`/home/douglas/code/erpnext/front/src/ui-kit/components`, **só leitura**; a cena imita o padrão, não importa o código): linha de lista e células (`list-row`, `list-cells`), cabeçalho de registro e seções (`detail-header`, `detail-section`, `section-card`), `status-dot`, `activity-feed`, `count-chip-strip`, `side-panel`, `view-switch`. Ícones lucide com as escolhas do Domus.
- **Peças comuns** já prontas em `components/scene-kit/parts.module.css` (cabeça de painel, marca, estados de linha e chip, bolha, lista, selo): componha, não reescreva. A folha da cena guarda só o layout dela, com valores de token (`tokens.test.ts`); cor crua reprova (`scene-colour.test.ts`).
- Arquivos compartilhados (`app/lib.css`, `ui.tsx`, `scene.tsx`, `Scene.tsx`, `Connector.tsx`, `parts.module.css`, os specs): mudança **mínima**, explicada no relato.
- Efeitos proibidos e demais lacunas locais: `welabs-site-ui` §7 e §8.

## 7. Contrato de continuidade: do kit, não da cena

O contrato é código do kit (`components/scene-kit/timeline.ts`, coberto por `timeline.test.ts`). A cena **não reimplementa nada** dele: declara `steps` (`{ id, at?, hold?, gate? }`), renderiza **só** a partir de `scene` (`scene.reached(id)`, `scene.is(id)`, `scene.cycle`) e todo controle chama `scene.take(id)`. Sem `useState`, `useEffect` nem `setTimeout` próprios.

O kit garante: roda sozinho ao entrar na tela (`useInView`, limiar 0,4); faz loop com ~1 s de hold no último passo; o gesto assume e devolve (toca até o fim, ou 8 s parado, segura ~1 s, reseta e retoma); fora da tela nenhum timer nem animação CSS roda (`data-on="false"`); sob movimento reduzido mostra o último passo estático (é o que o servidor desenha); a janela tem a altura do quadro assentado; três curvas de easing em `SCENE_EASE`. Durações, tokens de easing e o contrato legado (`components/scenes`, `components/plays`, a casa do Domus) em `references/continuity.md`. Passo de 400 a 1200 ms, ciclo de 6 a 10 s.

## 8. Método de teste: "pronto" é medido

Pronto = **geometria + paridade com a lib + specs do kit**, verdes **3 rodadas seguidas**, mais `npm run lint`, `npm run typecheck` e `npm test` (vitest). Aprovar por olho já falhou: botão colado na borda, chip descentrado e borda escura passaram como "prontos".

1. **Geometria** (`e2e/scene-kit-geometry.spec.ts`): dentro de cada campo, filhos centrados na vertical e recuos iniciais e finais iguais (<= 1 px); cada ícone no eixo do seu texto (<= 1 px); colunas de cada lista com a mesma borda esquerda; piso de 40 px nos controles. Escreva as entradas da cena **antes** do estilo.
2. **Paridade com a lib** (`e2e/lib-parity.spec.ts`): estilos computados dos nossos controles contra o Storybook publicado (`react-lib.welabs.space/iframe.html?id=<story>&globals=brand:welabs`; precisa de rede). Desvio só por `ALLOWED` comentado, com o motivo.
3. **Specs do kit** (`e2e/scene-kit-scenes.spec.ts`, `e2e/scene-kit.spec.ts`): loop, retomada depois do gesto, movimento reduzido, todos os quadros alcançados, âmbar <= 2 por quadro, nenhum texto cortado, altura estável da janela, eixo ícone/texto. Cena nova ganha as suas entradas nesses arquivos (ou uma cópia de `scene-kit.spec.ts`); `scene-restart` e `scene-fit` seguem verdes.

Comando (suba um servidor próprio numa porta livre; não use a do preview do operador):

```
PORTFOLIO_PREVIEW_URL=http://localhost:<porta> PW_CHROMIUM_PATH=/home/douglas/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell node_modules/.bin/playwright test -c playwright.config.ts scene-kit-geometry lib-parity scene-kit-scenes scene-kit.spec
```

Rode-o 3 vezes; uma rodada vermelha zera a contagem. Lint, typecheck e vitest uma vez, antes do push. Falha se corrige no código, não no teste.

## 9. Política de evidência

O operador **assiste ao vivo** (o lab em HMR) e confirma de novo os pontos no fim. Não produza nem envie captura de tela, vídeo ou arquivo de evidência como entrega. O agente **mede para si** (alinhamento, contraste, contagens, a spec acima) e relata em texto, apontando a URL ao vivo. Antes de dizer que está pronto, meça a página viva; o relato diz o que foi medido e o resultado.

## Antes de entregar

Quadro de conceito aprovado; teste de cópia feito em cada quadro; spec de geometria e de paridade verdes 3 vezes; texto conferido em `welabs-site-copy` (`lib/content/rules.test.ts`); nenhuma cor crua, nenhum controle sem ícone; nenhuma outra cena tocada além do combinado.
