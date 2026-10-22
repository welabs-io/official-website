---
name: welabs-site-ui
description: Padrão de UI do site Welabs (welabs-website) - como montar qualquer bloco, cena, play ou seção com @imagineapps-team/react primeiro, pela fronteira components/lib/ui.tsx e pela camada única de tema app/lib.css, com a paleta creme, a escala tipográfica, alinhamento, aplicação de marca, as lacunas que ficam locais e os efeitos proibidos. Use antes de criar ou alterar qualquer componente em components/**, folha .module.css, cena, play, cabeçalho de seção, CTA ou token de cor/tipo deste repositório, e ao perguntar "a lib já tem isso?" aqui.
---

# UI do site Welabs

Toda necessidade de UI vai **primeiro** para `@imagineapps-team/react` (0.18.0, `package.json`). CSS à mão só para o que a lib não tem e que está na lista de lacunas abaixo. As regras daqui são cobradas por teste; se um teste reprovar, corrija o código, não o teste.

## 1. Procure na lib, nesta ordem

1. **MCP** `mcp__imagine-react-lib__search_component` → `get_component` (props, quando usar e quando não usar). Carregue com `ToolSearch` (`select:mcp__imagine-react-lib__search_component,mcp__imagine-react-lib__get_component`). É a busca mais barata.
2. **`https://react-lib.welabs.space/llms.txt`**, quando o MCP não responder.
3. **`node_modules/@imagineapps-team/react/dist/<entrada>.d.ts`**, que é a verdade da versão **instalada**. O MCP serve a publicada, e as duas podem divergir. APIs de tema não estão no registry: `get_api defineBrand` responde "não existe", mas `defineBrand` e `defineBrandInputSchema` existem em `dist/theme/brand.d.ts:1212`.

Nunca recomende símbolo de memória. Antes de citar uma prop, confira no MCP ou no `.d.ts`.

Peers: `recharts` e `@tanstack/react-table` **não estão instalados**. `KpiCard`+`Chart*` e `DataTable` exigem instalar antes, enquanto `Table`, `Timeline` e `Badge` não exigem. `motion` e `lucide-react` já estão.

## 2. Fronteira de import (teste: `components/lib/ui-boundary.test.ts`)

- O pacote não traz `"use client"` (0 ocorrências em `dist/ui/index.js` e `dist/ui/effects.js`). Por isso **só `components/lib/*.tsx` importa `@imagineapps-team/react/*`**, e o resto do site importa de `@/components/lib/ui`.
- Para precisar de outra entrada (`ui/effects`, `ui/surfaces`, `charts`, `ui/data-table`), crie um irmão com `"use client"` (por exemplo `components/lib/effects.tsx`) e reexporte só os nomes usados. Deep import não resolve (`exports` sem wildcard).
- Primitiva de UI (botão, input, select, textarea, tabela, badge/chip/pill/tag, card) **não se escreve à mão** em `components/**`:
  - nenhum `<button>`, `<table>`, `<select>`, `<textarea>` ou `<input>` de texto nativo;
  - nenhuma classe CSS com nome de primitiva (`.badge`, `.chip`, `.pill`, `.tag`, `.card`, `.button`, `.btn`, `.input`, `.field`, `.table`, ou um sufixo como `noteCard`), a não ser quando a classe só posiciona um componente da lib (`<Badge className={house.tag}>`).
- **Exceção permanente:** `<input type="checkbox|radio">` com `<label htmlFor>` como máquina de estado CSS dos plays e da casa (`components/plays/parts.tsx:70-98`, `components/template/Home.tsx:248`). `scripts/check-portfolio.mjs:243-247` exige esse controle nativo.
- O que já existe fora da regra está numa lista **explícita** de falhas conhecidas no próprio teste, cada item com a fase que o remove. Item corrigido sai da lista, e o teste reprova se a lista citar algo que não existe mais.

## 3. Uma camada de tema só

- **`app/lib.css` é o único lugar** que liga os tokens de papel da lib às cores do site. O bloco "SUPERFÍCIES CREME DO DOMUS" (`app/lib.css:57-85`, decisão do operador de 22/10) sobrescreve o preset `welabs` da 0.18.0, que tem superfícies brancas e cinzas neutros (`dist/theme/brands/welabs.css`), com estes valores:
  - `--background` e `--popover`: creme 50;
  - `--card`: areia 100;
  - `--muted`, `--accent` e `--border`: areia 200;
  - `--edge-subtle`: `var(--border)`, a linha da própria lib (Separator e anel do Card);
  - `--input` e `--indicator-muted`: areia 600;
  - `--muted-foreground`: areia 700.

  Tinta, âmbar (`--primary`, `--primary-soft`) e status vêm do preset sem mudança. O arquivo **não** mexe em `--chart-*`, sombras nem raios de cor; os raios e as alturas de controle ficam no bloco "CAMADA DO SITE".
- A médio prazo, a forma oficial é `defineBrand` (`@imagineapps-team/react/theme/brand`), validada antes com `defineBrandInputSchema`.
- É **proibido** override de cor por componente: nada de `className="bg-[#F3ECDD]"`, `style={{ color: "#..." }}`, hex cru em folha de componente ou bloco `[data-theme="welabs"]` em outra folha. Papel de cor que falta vira token novo em `app/lib.css`, como `--indicator-muted`. Efeito com cor própria (`TextShimmer highlightColor`, `BorderBeam color`) recebe `var(--primary)` por prop, centralizado no wrapper de `components/lib/`.
- Componente da lib que pinta por estilo inline não se corrige com regra de classe, porque o inline vence. O `TypingDots` pinta cada ponto com `background-color: currentColor` inline, por isso a cor dos pontos vem de `color` no `[data-slot="typing-dots"]` (`app/lib.css`). Antes de sobrescrever uma peça da lib, leia o `dist/ui/*.js` dela.
- O bloco que usa a lib leva `data-theme="welabs"` (`components/template/Home.tsx:269`, a moldura do kit em `components/scene-kit/Scene.tsx`). Fora dele, `app/lib.css:32-55` neutraliza três vazamentos medidos da base da lib: transição de 160 ms, `line-height` 1,5 e `vertical-align: middle`. Ao ampliar o uso da lib, revise essas três exceções, sem duplicá-las.

## 4. Paleta creme

Esta é a paleta de tudo que a lib pinta (cenas do kit, bloco do Domus). A escala de areia completa é 50 `#faf5ea`, 100 `#f3ecdd`, 200 `#e2d8c3`, 300 `#d4c7ab`, 400 `#bfb29a`, 500 `#a39883`, 600 `#827968`, 700 `#625b4e`, 800 `#4c473d`, 900 `#333029` e 950 `#1c1a16`. Só os degraus da tabela têm token.

| Papel | Token (`app/lib.css`) | Valor |
|---|---|---|
| Página, popover, papel de trabalho | `--background`, `--popover` | creme 50 `#faf5ea` |
| Cartão, casca da janela (barra, painel lateral) | `--card` | areia 100 `#f3ecdd` |
| Linha fina, anel | `--border`, `--edge-subtle` (e `--muted`/`--accent`, que a lib usa como fundo de hover) | areia 200 `#e2d8c3` |
| Borda de campo em repouso / no hover | `--input` / `--input-hover` | areia 300 `#d4c7ab` / areia 600 `#827968` |
| Fundo de campo | `--field` | branco `#ffffff` |
| Ponto discreto (status em repouso, digitação) | `--indicator-muted` | areia 600 `#827968` |
| Texto e ícone de segundo plano | `--muted-foreground` | areia 700 `#625b4e` |
| Tinta (texto, ícone sobre âmbar) | `--foreground` | `#1c1a16` |
| Âmbar: ativo / aconteceu | `--primary` / `--primary-soft` | `#ffb020` / `#ffe2b1` |

As folhas antigas fora da lib (`components/onepage/shell.module.css:8-45`: `--page`, `--surface` **branco**, `--c2`, `--cl`, `--mute-l`, `--action`) ainda seguem a paleta da v3 com cartão branco. Elas não são referência para trabalho novo; um bloco que migra para a lib passa a ler os papéis acima.

### Papéis de cor (cenas e janelas de produto)

Decisões medidas na cena do Relloo em 22/10, com contraste e motivo item a item em `~/code/control/portfolio/site-redesign/scene-kit/colour-decisions.md`.

- **Duas superfícies de profundidade:** a casca da janela (barra de título, painel lateral, lista) é `--card`, e o painel onde o olho trabalha (histórico, detalhe) é `--background`. A linha selecionada da lista também usa `--background`, porque se une ao painel que abre.
- **A areia 200 só serve como linha ou anel**, nunca como área grande: sobre o creme ela amarela, e esse foi o motivo citado pela equipe da lib. Divisória, borda de painel e anel de marca neutra usam `--border`.
- **A areia 700 (`--muted-foreground`) só aparece em texto e ícone**, nunca em fundo ou preenchimento, nem perto de um preenchimento âmbar (operador: "forte demais" como fundo, "contrasta mal com amber"). Ponto ou preenchimento discreto usa `--indicator-muted`. O teste `components/scene-kit/scene-colour.test.ts` reprova `--muted-foreground`, `#625b4e` ou alias dele em `background`/`fill` no kit, e qualquer cor crua nas folhas do kit.
- **Marcas** (círculos de ícone):
  - neutra: `--card`, ou `--background` sobre a casca, com anel `--border` e ícone em `--muted-foreground`;
  - do sujeito do painel: ícone em tinta;
  - âmbar: sem anel e com ícone sempre em tinta.
- **Âmbar:**
  - `--primary` só no que está chegando agora, uma linha por vez, e só como sinal pequeno: barra à esquerda de 3 a 4 px, ponto ou marca do ícone;
  - linha ou chip **nunca** é preenchido com `--primary` (decisão do operador): o item ativo fica em `--background`, com texto em tinta e barra âmbar;
  - `--primary-soft` no que já chegou (marca, chip e selo cheios, sem contorno).
- **Linha clicável (`RowButton`, o `ghost` da lib):**
  - o hover da lib é tinta a 18 %, onde a areia 700 cai para cerca de 3,9:1, então hover, pressionado e ativo passam para `--surface-raised`;
  - a barra âmbar é `background-image`, nunca `box-shadow`, porque o `box-shadow` apaga o anel de foco da lib.
- **Bolhas:**
  - recebida: `--card` com anel `--border` e texto em tinta;
  - recebida chegando: anel `--primary`;
  - enviada: `--secondary`, sem anel e com texto em tinta;
  - evento do sistema ou do registro: sem fundo, com anel `--border` e texto `--muted-foreground`.
- **Controle inerte** (compositor de cena): a ação do `TextField` já é `soft`, nunca `solid` em tinta, para não virar a maior massa escura da janela.
- **Contraste medido:** texto de segundo plano a 5,71:1 na casca e 6,18:1 no papel; ponto discreto a 3,66:1; tinta sobre âmbar a 9,50:1. Pelo mesmo motivo, a areia 500 não serve para ponto: dá 2,42:1 sobre `--card`.

### Controles

Decisão do operador de 22/10: o contorno escuro de 1 px nos campos e o `outline` dos botões secundários pareciam legado. Um ponto só de mudança, sem estilo por chamada.

- **Primitivas** (`components/lib/ui.tsx`), as únicas portas para botão e campo:
  - `ActionButton`: ícone + texto. `emphasis` é `secondary` (padrão, `soft` da lib), `primary` (âmbar `solid`) ou `quiet` (`ghost`);
  - `IconButton`: só ícone, com `label` obrigatório como nome acessível;
  - `RowButton`: linha de lista em largura total, com o ícone dentro de uma marca que a cena pinta por estado (`markClassName`);
  - `TextField`: ícone à esquerda obrigatório, ação de ícone opcional à direita (`action`), `label` opcional (o `Field` da lib) e `size` `sm`/`md`.
- **Regra do ícone:** todo botão e todo campo levam ícone, e a prop `icon` é obrigatória, recebida como elemento (`icon={<RotateCcw />}`), para que um Server Component possa passá-lo. O padrão é `lucide-react`; as cenas antigas (`components/scenes`, `components/plays`, a casa do Domus) seguem com o `Glyph` desenhado, para uma cena não misturar duas famílias. A lib centra o ícone no texto: medido 0,5 px nos botões e 0 px nos campos, em 1440 e em 390.
- **Tokens de borda** (`app/lib.css`, bloco CONTROLES):
  - campo: fundo `--field` branco, linha `--input` areia 300 em repouso (1,59:1 no papel), `--input-hover` areia 600 no hover (4,30:1) e o anel único do site no foco, em volta do campo inteiro (tinta, 16,54:1);
  - a borda em repouso fica abaixo de 3:1 de propósito: quem identifica o campo é o ícone e o texto (areia 700, 6,72:1);
  - botão secundário: o `soft` da lib sem mudança (tinta a 10 %, sem borda), e o rótulo (13,57:1) e o ícone carregam a afordância.
- `--input` também é a borda de Checkbox, Switch, Radio e Slider da lib; o site não usa nenhum deles da lib.
- **Teste:** `components/lib/ui-boundary.test.ts` reprova `Button`, `Input`, `InputGroup*` ou `Field` da lib fora da fronteira, primitiva sem `icon=`, e `className` com `bg-`/`border-`/`ring-`/`shadow-`/`outline-` numa chamada. A cena só pinta **estado** (âmbar de chegou ou ativo), nunca a borda ou o fundo do controle.

O âmbar só sinaliza que algo **aconteceu** ou está acontecendo: linha escrita, foco, item ativo. Não serve para enfeitar chip. Texto esmaecido por `opacity` está fora do padrão: o que fica em segundo plano muda de cor (tinta → `--muted-foreground`), para não cair abaixo de AA.

## 5. Tipo, espaço e alinhamento

- **Escala fechada** (`shell.module.css`, `--t-*`), sete degraus em 1440 / 390: display 72/40, h2 44/30, h3 24/20, lead 18, corpo 16, rótulo 14 e micro 12. Os nomes `--text-*` que as folhas leem são apelidos dos degraus. Folha de componente só usa `font-size: var(--text-*)` e espaço `var(--sp-*)` numa grade de 4 px, cobrado por `components/template/polish.test.tsx`; `e2e/visual-language.spec.ts` mede no máximo 7 tamanhos acima de 12 px nas 6 rotas.
- **Piso**: 14 px no texto da página. Dentro de tela desenhada (cena, play), os degraus micro (12) e rótulo (14), com a chave em 18 (`components/scenes/tokens.module.css`), sempre com contraste AA. Texto abaixo de 12 px é proibido.
- **Hierarquia de título**: `SectionHead` tem três variantes marcadas por `data-head`:
  - `chapter`: linha fina no topo, h2 à esquerda (8/12) e a linha de apoio nas 4 colunas finais, para tese;
  - `showcase`: h2 centralizado, para vitrine de produto;
  - `strip`: título no degrau h3 (24/20) à esquerda, para detalhes e "Onde rodamos".

  Título é efeito ou rótulo, sem misturar os dois na mesma página.
- **Alinhamento** (régua de `e2e/domus.spec.ts:5-9`):
  - o nome fica centrado no seu ícone, com tolerância de 1,5 px;
  - o badge fica no eixo do ícone, com tolerância de 1 px;
  - o botão fica na linha do nome do andar, com tolerância de 1 px;
  - as calhas são iguais;
  - nenhum texto é cortado (`e2e/layout.spec.ts`);
  - a janela de cena acompanha o conteúdo, sem área vazia no rodapé.
- **Densidade**: seção de 0,5 a 1 viewport, com no máximo cerca de 40 palavras fora das cenas. O respiro entre seções é de 96 a 128 px no desktop, e dentro da seção o espaço fica entre 16 e 24 px.

## 6. Marca

Logo, símbolo, selo "by welabs" e favicon vêm **sempre** da skill `welabs-brand:welabs-brand` e dos arquivos gerados em `public/brands/welabs/`. Não redesenhe nem edite SVG à mão. Ibrand só aparece no logo, e todo texto usa Inter 400/500/600. A ordem dos produtos é sempre Domus, Relloo, Magneto, Tuner, Knowly (`scripts/check-portfolio.mjs:150-156`).

## 7. Lacunas que ficam locais

A lib não tem estas peças. Monte cada uma sobre primitivas da lib e mantenha o código em `components/`:

- **Bolha de chat** (lado, hora, ticks, divisor de canal): `Card`/`Surface` + `Badge` + `AnimatedList` + `TypingDots`. A versão definitiva é upstream.
- **Kanban** estático: `ScrollArea` + `Card size="sm"` + `Badge`.
- **Canvas de fluxo do Magneto**: nós com `Card`, arestas em SVG com `offset-path` e fundo `GridPattern`.
- **Fios entre cartões** (Orbit, URA do Tuner): SVG local.
- **Toast dentro da janela de cena**: `Alert`/`Card` + `BlurFade`. O `Toaster` da lib é portal da página.
- **Barra com o logo do produto no cromo da janela**: local, sobre `DeviceFrame`/`Surface`.
- **Driver de cena por roteiro** (`components/scenes/replay.ts`, `scene-run.ts`): fica local. Para detectar visibilidade e movimento reduzido, troque por `useInView`/`useReducedMotion`.
- **CTA grafite pílula**: só pela camada de tokens, sem variante nova de `Button`.
- **Máquina de estado CSS** dos plays (checkbox/radio + label).

O de/para bloco → componente está em `references/block-map.md`.

## 8. Efeitos proibidos (fora da marca)

`GradientText`, `GlitchText`, `DecryptedText`, `ElectricBorder`, `VideoText`, `GlassSurface`/`useLiquidGlass`, `Surface material="glass"` e `ScrollProgress` são proibidos: o site não tem barra de progresso, como `check-portfolio.mjs:60` cobra. Também não entram scroll-jacking, seção fixada no scroll, multicolor nem neon. `AuroraBackground` e `Spotlight` só entram com cor âmbar/creme passada por prop, e `Carousel` 3D, `Tilt` e `StarBorder` só com parcimônia, nunca em janela de leitura. O teste de fronteira reprova qualquer reexport dos nomes proibidos em `components/lib/`.

## Antes de entregar

Rode `npm run lint && npm run typecheck && npm test`. Para o que é medido em tela (alinhamento, contraste e corte), rode também o spec Playwright do bloco contra um servidor próprio (`PORTFOLIO_PREVIEW_URL`). Movimento: `welabs-site-motion`. Texto: `welabs-site-copy`.
