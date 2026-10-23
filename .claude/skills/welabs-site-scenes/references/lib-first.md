# Lib primeiro: fronteira, componentes de movimento e padrões do Domus

`@imagineapps-team/react` (versão em `package.json`; confira a instalada em `node_modules/@imagineapps-team/react/dist/*.d.ts`, porque o MCP serve a publicada). Nunca cite prop de memória: confira no MCP (`search_component` -> `get_component`) ou no `.d.ts`.

## Arquivos de fronteira

| Arquivo | Reexporta / define |
|---|---|
| `components/lib/ui.tsx` | `Badge`, `Card`, `CardContent`, `Table*`; primitivas de controle `ActionButton`, `IconButton`, `RowButton`, `TextField` (ícone obrigatório, recebido como elemento `icon={<RotateCcw />}`). `Button`, `Input`, `InputGroup*` e `Field` da lib **não** saem daqui |
| `components/lib/scene.tsx` | `Alert*`, `Avatar*`, `SegmentedControl`, `Separator`, `SplitView*`, `TimelineItem`, `Timeline` (com `data-slot="timeline"`), `AnimatedList`, `TypingDots`, `useInView`, `useReducedMotion` |

Só `components/lib/*.tsx` importa `@imagineapps-team/react/*` (o pacote não traz `"use client"`). Entrada que falta (`ui/effects`, `ui/surfaces`, `charts`) vira arquivo irmão com `"use client"` reexportando só os nomes usados. Teste: `components/lib/ui-boundary.test.ts` (reprova controle nativo, classe com nome de primitiva, primitiva sem `icon=` e `className` com `bg-`/`border-`/`ring-`/`shadow-`/`outline-` numa chamada).

## Componente de movimento da lib antes de keyframe à mão

| Necessidade | Componente | Props-chave |
|---|---|---|
| Faixa contínua | `Marquee` (`ui/effects`) | `speed`, `direction`, `pauseOnHover`, `gap` |
| Palavra que gira | `RotatingText` | `words`, `interval` ms, `duration` s |
| Número que conta | `NumberTicker` | `value`, `startOnView`, `format`, `duration` |
| Itens chegando | `AnimatedList` | `distance`, `duration` |
| Produto ou janela ativa | `BorderBeam` | `color`, `duration`, `borderRadius` |
| "Digitando" | `TypingDots` | cor dos pontos vem de `color` no `[data-slot="typing-dots"]` (pinta inline) |
| Entrada no viewport | `BlurFade`, `RevealOnScroll`/`Stagger` | `inView`, `delay` |
| Troca de ícone, falha | `IconMorph`, `Shake` | — |
| Detecção | `useInView`, `useReducedMotion` | — |

Componente com loop próprio (`Marquee`, `RotatingText`, `BorderBeam`) já "roda sozinho", mas confira no fonte se respeita movimento reduzido; se não, o wrapper da fronteira respeita.

## Padrões do ui-kit do Domus (só leitura)

Local: `/home/douglas/code/erpnext/front/src/ui-kit/components`. A cena **imita o padrão visual**; não importa esse código (outro repositório, outro tema). Úteis para cena:

| Padrão | Arquivo | Quando imitar |
|---|---|---|
| Linha de lista e células | `list-row.tsx`, `list-cells.tsx`, `list-view.tsx` | lista de registros, caixa de entrada |
| Cabeçalho e seções de registro | `detail-header.tsx`, `detail-section.tsx`, `section-card.tsx`, `form-section.tsx` | ficha do registro, construtor |
| Estado | `status-dot.tsx`, `count-chip-strip.tsx` | minidot ao lado do título, contagens por categoria |
| Histórico | `activity-feed.tsx` | linhas escritas no registro |
| Painel lateral | `side-panel.tsx`, `rail-drawer.tsx` | painel do assistente |
| Alternância de visão | `view-switch.tsx`, `adaptive-tabs.tsx` | troca de perfil/visão |

Ícones: lucide 0.545 com as escolhas do Domus. Uma cena não mistura duas famílias de ícone (as cenas antigas seguem com o `Glyph` desenhado).

## Lacunas que ficam locais (sobre primitivas da lib)

Bolha de chat (`Card` + `Badge` + `AnimatedList` + `TypingDots`); canvas de fluxo do Magneto (nós em `Card`, arestas SVG, fundo `GridPattern`); fios entre cartões (SVG local, ou o `Connector` do kit); toast dentro da janela (`Alert`/`Card` + `BlurFade`; o `Toaster` da lib é portal da página); barra com o logo do produto no cromo da janela (local, no `scene-kit.module.css`); máquina de estado CSS (checkbox/radio + label) dos plays legados. Efeitos proibidos: `welabs-site-ui` §8.

## Peças comuns do kit

`components/scene-kit/parts.module.css`: cabeça de painel (`paneHead`), marca com tamanho e tom (`mark`, `markXs/Sm/Md/Lg`, `data-tone="active|done|fail|subject|well"`), estados de linha (`rowStates`) e de chip (`choiceStates`), texto empilhado (`stack`, `stackLead`), meta e horário (`meta`, `time`), bolha (`bubble`), lista (`list`, `listTight`), divisórias (`ruleTop`, `ruleBottom`), selo (`seal`). A janela (cromo, palco, altura) é do `scene-kit.module.css`. Teste de geometria de token: `components/scene-kit/tokens.test.ts` (lista `GEOMETRY_ALLOWED` com motivo por entrada); cor crua: `scene-colour.test.ts`.

## Cor: o que o kit reprova

`--muted-foreground` (`#55565b`) é tom de texto e ícone, **nunca** `background`/`fill`; ponto discreto usa `--indicator-muted`. Cor crua em folha do kit reprova. Linha clicável (`RowButton`): hover/pressionado/ativo por `--veil-hover`/`--veil-press`; a barra de âmbar de um item é `background-image`, nunca `box-shadow`, que apaga o anel de foco da lib.
