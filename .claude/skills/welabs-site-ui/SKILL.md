---
name: welabs-site-ui
description: Padrão de UI do site Welabs (welabs-website) - tokens, primitivas e a fronteira da lib. Como montar qualquer bloco ou seção com @imagineapps-team/react primeiro, pela fronteira components/lib/ui.tsx e pela camada única de tema app/lib.css, com a paleta neutra vigente (tinta #121212, secundário #55565b, borda de campo clara, primária preta), as primitivas de controle com ícone, a escala tipográfica, o alinhamento, a aplicação de marca, as lacunas que ficam locais e os efeitos proibidos. Use antes de criar ou alterar qualquer componente em components/**, folha .module.css, cabeçalho de seção, CTA ou token de cor/tipo deste repositório, e ao perguntar "a lib já tem isso?" aqui. Cena, carrossel e play de produto (arquétipo, aperitivo, orçamento de âmbar, continuidade, testes) ficam em welabs-site-scenes.
---

# UI do site Welabs

Toda necessidade de UI vai **primeiro** para `@imagineapps-team/react` (versão em `package.json`). CSS à mão só para o que a lib não tem e que está na lista de lacunas abaixo. As regras daqui são cobradas por teste; se um teste reprovar, corrija o código, não o teste.

**Escopo desta skill:** tokens, primitivas e a fronteira da lib, para o site inteiro. Cena, carrossel e play de produto (conceito, arquétipo, aperitivo, orçamento de âmbar, conectores, continuidade, método de teste) estão em `welabs-site-scenes`; texto visível, em `welabs-site-copy`. Movimento e easing: `welabs-site-scenes/references/continuity.md`.

## 1. Procure na lib, nesta ordem

1. **MCP** `mcp__imagine-react-lib__search_component` -> `get_component` (props, quando usar e quando não usar). Carregue com `ToolSearch` (`select:mcp__imagine-react-lib__search_component,mcp__imagine-react-lib__get_component`). É a busca mais barata.
2. **`https://react-lib.welabs.space/llms.txt`**, quando o MCP não responder.
3. **`node_modules/@imagineapps-team/react/dist/<entrada>.d.ts`**, que é a verdade da versão **instalada**. O MCP serve a publicada, e as duas podem divergir. APIs de tema não estão no registry: `get_api defineBrand` responde "não existe", mas `defineBrand` e `defineBrandInputSchema` existem em `dist/theme/brand.d.ts`.

Nunca recomende símbolo de memória. Antes de citar uma prop, confira no MCP ou no `.d.ts`.

Peers: `recharts` e `@tanstack/react-table` **não estão instalados**. `KpiCard`+`Chart*` e `DataTable` exigem instalar antes, enquanto `Table`, `Timeline` e `Badge` não exigem. `motion` e `lucide-react` já estão.

## 2. Fronteira de import (teste: `components/lib/ui-boundary.test.ts`)

- O pacote não traz `"use client"`. Por isso **só `components/lib/*.tsx` importa `@imagineapps-team/react/*`**, e o resto do site importa de `@/components/lib/ui` (e `@/components/lib/scene` para o kit de cenas).
- Para precisar de outra entrada (`ui/effects`, `ui/surfaces`, `charts`, `ui/data-table`), crie um irmão com `"use client"` (por exemplo `components/lib/effects.tsx`) e reexporte só os nomes usados. Deep import não resolve (`exports` sem wildcard).
- Primitiva de UI (botão, input, select, textarea, tabela, badge/chip/pill/tag, card) **não se escreve à mão** em `components/**`:
  - nenhum `<button>`, `<table>`, `<select>`, `<textarea>` ou `<input>` de texto nativo;
  - nenhuma classe CSS com nome de primitiva (`.badge`, `.chip`, `.pill`, `.tag`, `.card`, `.button`, `.btn`, `.input`, `.field`, `.table`, ou um sufixo como `noteCard`), a não ser quando a classe só posiciona um componente da lib (`<Badge className={house.tag}>`).
- **Exceção permanente:** `<input type="checkbox|radio">` com `<label htmlFor>` como máquina de estado CSS dos plays e da casa (`components/plays/parts.tsx`, `components/template/Home.tsx`). `scripts/check-portfolio.mjs` exige esse controle nativo.
- O que já existe fora da regra está numa lista **explícita** de falhas conhecidas no próprio teste, cada item com a fase que o remove. Item corrigido sai da lista, e o teste reprova se a lista citar algo que não existe mais.

## 3. Uma camada de tema só

- **`app/lib.css` é o único lugar** que liga os tokens de papel da lib às cores do site. O bloco **PAPÉIS DE COR: WELABS UI V3 SOBRE O PRESET** sobrescreve o preset `welabs` da lib (decisão do operador de 22/10, que aposentou o creme e a areia: a areia tinha a temperatura do âmbar e o âmbar se dissolvia). Dois temas sob o interruptor da lib: claro (`:root`, `[data-theme="welabs"]`) e escuro (`[data-mode="dark"]`).
- A médio prazo, a forma oficial é `defineBrand` (`@imagineapps-team/react/theme/brand`), validada antes com `defineBrandInputSchema`.
- É **proibido** override de cor por componente: nada de `className="bg-[#efefeb]"`, `style={{ color: "#..." }}`, hex cru em folha de componente ou bloco `[data-theme="welabs"]` em outra folha. Papel de cor que falta vira token novo em `app/lib.css`, como `--indicator-muted`. Efeito com cor própria (`TextShimmer highlightColor`, `BorderBeam color`) recebe o token por prop, centralizado no wrapper de `components/lib/`.
- Componente da lib que pinta por estilo inline não se corrige com regra de classe, porque o inline vence. O `TypingDots` pinta cada ponto com `background-color: currentColor` inline; por isso a cor dos pontos vem de `color` no `[data-slot="typing-dots"]` (`app/lib.css`). Antes de sobrescrever uma peça da lib, leia o `dist/ui/*.js` dela.
- O bloco que usa a lib leva `data-theme="welabs"` (`components/template/Home.tsx`, a moldura do kit em `components/scene-kit/Scene.tsx`). Fora dele, `app/lib.css` neutraliza três vazamentos medidos da base da lib: transição de 160 ms, `line-height` 1,5 e `vertical-align: middle`. Ao ampliar o uso da lib, revise essas três exceções, sem duplicá-las.

## 4. Paleta vigente (Welabs UI v3)

Neutra, sem creme nem areia. Valores medidos em `app/lib.css` (claro / escuro):

| Papel | Token | Valor |
|---|---|---|
| Canvas (página, papel de trabalho) | `--background` | `#f7f7f5` / `#121214` |
| Superfície (janela, cartão, campo, menu, bolha recebida) | `--card`, `--popover` | branco `#ffffff` / `#1a1a1d` |
| Cromo (barra da janela, trilho, chip neutro, marca em repouso) | `--muted`, `--secondary` | `#efefeb` / `#202024` |
| Linha e **borda de campo clara** | `--border`, `--edge-subtle`, `--input` (= a linha) | `#e5e5e1` / `#2c2c30` |
| **Tinta** (texto, ícone) | `--foreground` | `#121212` / `#f5f5f3` |
| **Texto secundário** (só texto e ícone) | `--muted-foreground` | `#55565b` / `#b4b4b0` |
| **Primária preta** (ação e seleção) | `--primary` / `--primary-foreground` | `#121212` + branco, invertida no escuro |
| Ponto discreto (status em repouso, digitação) | `--indicator-muted` | `#8a8a86` / `#77777d` |
| Âmbar: o que está vivo agora | `--signal` / `--signal-foreground` | `#ffb020` / tinta |
| Linha selecionada, bolha chegando | `--signal-soft` (`--selected`) | `#fff3dd` |
| Concluído | `--success` / `--success-soft` | `#1e7a4c` / `#e8f4ed` |
| Erro | `--destructive` / `--destructive-soft` | `#ab3040` / `#faeaea` |
| Hover e pressionado de linha | `--veil-hover` / `--veil-press` | tinta a 4 % / 7 % |

Regras:
- **Primária preta é a ação** (botão, âncora-botão, badge, chip, segmento ativo, dia escolhido, checkbox, switch). Âmbar **nunca** é ação nem preenchimento de botão, badge ou estado escolhido; só sinaliza o que **aconteceu agora** (marca ativa, item que chegou, ponto de status), como **área**, nunca texto nem traço fino. O orçamento de âmbar por tela está em `welabs-site-scenes` §5.
- `--muted-foreground` é **tom de texto e ícone**, nunca fundo nem preenchimento (o operador rejeitou). Ponto ou preenchimento discreto usa `--indicator-muted`. O teste `components/scene-kit/scene-colour.test.ts` reprova isso e qualquer cor crua nas folhas do kit.
- A linha (`--border`) separa **painéis**, nunca as linhas de uma lista. Texto esmaecido por `opacity` está fora do padrão: o que fica em segundo plano muda de cor (tinta -> `--muted-foreground`), para não cair abaixo de AA.
- Nunca reintroduza creme, areia nem grafite quente na UI. As folhas antigas fora da lib (`components/onepage/shell.module.css`: `--page`, `--surface`, `--c2`, `--cl`, `--action`) leem aliases que apontam para os papéis acima; não são referência para trabalho novo.
- Marcas (círculos de ícone) e bolhas pintadas por estado são da cena: `welabs-site-scenes` e o bloco TIMELINE E AVATAR de `app/lib.css`.

### Controles

Um ponto só de mudança, sem estilo por chamada. A lib publicada (Storybook, brand welabs) é a referência: `e2e/lib-parity.spec.ts` compara o computado dos nossos controles com as stories.

- **Primitivas** (`components/lib/ui.tsx`), as únicas portas para botão e campo:
  - `ActionButton`: ícone + texto. `emphasis` é `secondary` (padrão, `soft` da lib), `primary` (`solid`, preto), `outline` ou `quiet` (`ghost`);
  - `IconButton`: só ícone, com `label` obrigatório como nome acessível;
  - `RowButton`: linha de lista em largura total, com o ícone dentro de uma marca que a cena pinta por estado (`markClassName`);
  - `TextField`: ícone à esquerda obrigatório, ação de ícone opcional à direita (`action`), `label` opcional e `size` `sm`/`md`.
- **Regra do ícone:** todo botão e todo campo levam ícone, e a prop `icon` é obrigatória, recebida como **elemento** (`icon={<RotateCcw />}`), para que um Server Component possa passá-lo. O padrão é `lucide-react`; as cenas antigas (`components/scenes`, `components/plays`, a casa do Domus) seguem com o `Glyph` desenhado, para uma cena não misturar duas famílias.
- **Medidas da lib, sem repintar:** altura de controle (`--control-height-md`, 40 px) e raio (`--control-radius`, 14 px) são da lib; campo com fundo da superfície e borda clara (`--input` = `--border`); botão secundário é o `soft` da lib sem borda (o rótulo e o ícone carregam a afordância); foco é o anel da lib. O que o `app/lib.css` ainda faz no bloco CONTROLES é só o interior do campo (recuo igual de peça pequena dentro do campo, medido em `e2e/scene-kit-geometry.spec.ts`).
- **Teste:** `components/lib/ui-boundary.test.ts` reprova `Button`, `Input`, `InputGroup*` ou `Field` da lib fora da fronteira, primitiva sem `icon=`, e `className` com `bg-`/`border-`/`ring-`/`shadow-`/`outline-` numa chamada. A cena só pinta **estado**, nunca a borda ou o fundo do controle.

### Tokens

Um padrão só, e um lugar só para mudar. **Todo token do site mora em `app/lib.css`**, no bloco `TOKENS DO SITE`. As folhas de componente só leem `var(--...)`.

| Família | Tokens | Onde mudar |
|---|---|---|
| Papéis de cor | os da tabela acima | `app/lib.css`, bloco PAPÉIS DE COR |
| Cores da página | `--g*`, `--c*`, `--a-*`, `--ink`, `--mute-*`, `--page`, `--surface*`, `--halo`, `--action*` (aliases dos papéis) | `app/lib.css`, TOKENS DO SITE |
| Tipo | `--t-*` (7 degraus) e os apelidos `--text-*`, `--lh-*`, `--line-micro/label/lead`, `--weight-text/label/title`, `--ls-*` | idem |
| Espaço | `--sp-1` a `--sp-9` (grade de 4 px) | idem |
| Forma e linha | `--r-*` (seguem os raios da lib), `--rule`, `--rule-dashed`, `--bar-active`, `--edge-ring`, `--edge-ring-active`, `--domus-ring*`, `--r-domus*` | idem |
| Sombra | `--shadow-card`, `--shadow-raise`, `--shadow-pop` | idem |
| Movimento | `--ease-out`, `--ease-in-out`, `--ease-spring`, `--dur-1/2/3` | idem (`--ease-in-out` fica junto das curvas da lib, no topo) |
| Ícone e marca | `--icon-xs/sm/md/lg`, `--mark-xs/sm/md/lg`, `--row-min`, `--dot`, `--scene-width` | idem |

- **Teste:** `components/scene-kit/tokens.test.ts` reprova, em qualquer folha do kit, tamanho, peso, entrelinha, espaçamento de letra, raio, sombra, espaço, largura de linha, duração ou geometria escritos à mão. A única saída é a lista `GEOMETRY_ALLOWED`, com o motivo de cada entrada. A cor crua continua com `scene-colour.test.ts`, e `components/template/polish.test.tsx` confere as escalas em `app/lib.css`. As peças comuns das cenas (`components/scene-kit/parts.module.css`) estão em `welabs-site-scenes/references/lib-first.md`.

## 5. Tipo, espaço e alinhamento

- **Escala fechada** (`--t-*`), sete degraus em 1440 / 390: display 72/40, h2 44/30, h3 24/20, lead 18, corpo 16, rótulo 14 e micro 12. Folha de componente só usa `font-size: var(--text-*)` e espaço `var(--sp-*)` numa grade de 4 px, cobrado por `components/template/polish.test.tsx`; `e2e/visual-language.spec.ts` mede no máximo 7 tamanhos acima de 12 px nas 6 rotas.
- **Piso**: 14 px no texto da página. Dentro de tela desenhada (cena, play), os degraus micro (12) e rótulo (14), sempre com contraste AA. Texto abaixo de 12 px é proibido.
- **Hierarquia de título**: `SectionHead` tem três variantes marcadas por `data-head`:
  - `chapter`: linha fina no topo, h2 à esquerda (8/12) e a linha de apoio nas 4 colunas finais, para tese;
  - `showcase`: h2 centralizado, para vitrine de produto;
  - `strip`: título no degrau h3 (24/20) à esquerda, para detalhes e "Onde rodamos".

  Título é efeito ou rótulo, sem misturar os dois na mesma página.
- **Alinhamento** (régua de `e2e/domus.spec.ts`): o nome fica centrado no seu ícone (1,5 px); o badge fica no eixo do ícone (1 px); o botão fica na linha do nome do andar (1 px); as calhas são iguais; nenhum texto é cortado (`e2e/layout.spec.ts`); a janela de cena acompanha o conteúdo, sem área vazia no rodapé.
- **Densidade**: seção de 0,5 a 1 viewport, com no máximo cerca de 40 palavras fora das cenas. O respiro entre seções é de 96 a 128 px no desktop, e dentro da seção o espaço fica entre 16 e 24 px.

## 6. Marca

Logo, símbolo, selo "by welabs" e favicon vêm **sempre** da skill `welabs-brand:welabs-brand` e dos arquivos gerados em `public/brands/welabs/`. Não redesenhe nem edite SVG à mão. Ibrand só aparece no logo, e todo texto usa Inter 400/500/600. A ordem dos produtos é sempre Domus, Relloo, Magneto, Tuner, Knowly (`scripts/check-portfolio.mjs`).

## 7. Lacunas que ficam locais (fora de cena)

Monte sobre primitivas da lib e mantenha o código em `components/`: **CTA grafite pílula** (só pela camada de tokens, sem variante nova de `Button`) e a **máquina de estado CSS** dos plays (checkbox/radio + label). As lacunas de cena (bolha, kanban, canvas de fluxo do Magneto, fios entre cartões, toast na janela, barra com logo no cromo, driver de cena) estão em `welabs-site-scenes/references/lib-first.md`. O de/para bloco -> componente está em `references/block-map.md`.

## 8. Efeitos proibidos (fora da marca)

`GradientText`, `GlitchText`, `DecryptedText`, `ElectricBorder`, `VideoText`, `GlassSurface`/`useLiquidGlass`, `Surface material="glass"` e `ScrollProgress` são proibidos: o site não tem barra de progresso, como `check-portfolio.mjs` cobra. Também não entram scroll-jacking, seção fixada no scroll, multicolor nem neon. `AuroraBackground` e `Spotlight` só entram com cor passada por prop a partir dos tokens, e `Carousel` 3D, `Tilt` e `StarBorder` só com parcimônia, nunca em janela de leitura. O teste de fronteira reprova qualquer reexport dos nomes proibidos em `components/lib/`.

## Antes de entregar

Rode `npm run lint && npm run typecheck && npm test`. Para o que é medido em tela (alinhamento, contraste e corte), rode também o spec Playwright do bloco contra um servidor próprio (`PORTFOLIO_PREVIEW_URL`). Cena e movimento: `welabs-site-scenes`. Texto: `welabs-site-copy`.
