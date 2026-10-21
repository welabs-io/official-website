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

- **`app/lib.css` é o único lugar** que liga os tokens de papel da lib (`--background`, `--muted`, `--accent`, `--secondary`, `--border`, `--input`, `--chart-*`, raios) às variáveis do site. Hoje ele liga só `--border: #e2d8c3` e `--input: #827968` (`app/lib.css:62-65`). O preset `welabs` deixa `--muted`, `--accent` e `--secondary` em cinza neutro `oklch(0.96 0 0)` (`dist/theme/brands/welabs.css:42-46`), e a F2 liga esses tokens à areia ali mesmo.
- A médio prazo, a forma oficial é `defineBrand` (`@imagineapps-team/react/theme/brand`), validada antes com `defineBrandInputSchema`.
- É **proibido** override de cor por componente: nada de `className="bg-[#F3ECDD]"`, `style={{ color: "#..." }}` ou bloco `[data-theme="welabs"]` em outra folha. Efeito com cor própria (`TextShimmer highlightColor`, `BorderBeam color`) recebe `var(--primary)` por prop, centralizado no wrapper de `components/lib/`.
- O bloco que usa a lib leva `data-theme="welabs"` (`components/template/Home.tsx:246`). Fora dele, `app/lib.css:35-55` neutraliza três vazamentos medidos da base da lib: transição de 160 ms, `line-height` 1,5 e `vertical-align: middle`. Ao ampliar o uso da lib, revise essas três exceções, sem duplicá-las.

## 4. Paleta creme

Fonte: `components/onepage/shell.module.css:8-40`. Os componentes leem estes nomes, e nenhum carrega cor própria.

| Papel | Token | Valor |
|---|---|---|
| Página / cartão | `--c` / `--surface` | `#ffffff` |
| Banda que se destaca | `--surface-band` | `--muted` a 30 % sobre `--c` |
| Areia de destaque, chip, selecionado | `--c2` / `--surface-accent` | `#f3ecdd` |
| Linha fina | `--cl` | `#e2d8c3` |
| Borda de controle (3:1) | `--input` | `#827968` |
| Tinta / texto secundário | `--ink` / `--mute-l` | `#1c1a16` / `#625b4e` |
| Âmbar | `--a`, `--a-100..300` | `#ffb020`, `#fff1d8`, `#ffe2b1`, `#ffcc74` |
| Ação (CTA pílula) | `--action` / `--action-fg` | `#25272a` / `#faf5ea` |

O âmbar só sinaliza que algo **aconteceu**: linha escrita, foco, item ativo. Não serve para enfeitar chip. São três planos de profundidade: fundo creme, cartão branco com borda fina e sem sombra, e foco com sombra macia (`--shadow-pop`) mais barra âmbar. Sombra em todo cartão está fora do padrão.

## 5. Tipo, espaço e alinhamento

- **Escala da página** (`shell.module.css:52-61`): 14·15·16·18·20, `--text-2xl` 22–26, `--text-title` 28–40, `--text-display` 32–48 e `--text-hero` 40–72. Folha de componente só usa `font-size: var(--text-*)` e espaço `var(--sp-*)` numa grade de 4 px, cobrado por `components/template/polish.test.tsx:59-86`.
- **Piso**: 14 px no texto da página. Dentro de tela desenhada (cena, play), o piso é **12 px** com contraste AA, e texto de 11 px é proibido. O `--s-t-meta` de 11 px (`components/scenes/tokens.module.css:37`) é falha conhecida da F2 em `polish.test.tsx`.
- **Hierarquia de título**: não repita um h2 de 40 px centralizado em toda seção (`SectionHead.tsx:16-21`, hoje variante única). O alvo da F2 são três variantes marcadas por `data-head`:
  - `chapter`: h2 à esquerda com linha, para tese;
  - `showcase`: h2 centralizado, para vitrine de produto;
  - `strip`: h3 compacto de 24/20 px, para confiança e detalhes.

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
