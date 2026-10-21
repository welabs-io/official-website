# De/para: bloco do site → componente da lib

Medido contra `@imagineapps-team/react` 0.18.0 instalado: os nomes foram conferidos nas listas de `export` de `dist/ui/index.d.ts`, `dist/ui/effects.d.ts` e `dist/ui/surfaces.d.ts`, e as props citadas, no MCP `get_component`. Antes de usar, confirme a prop no MCP ou no `.d.ts`: esta tabela orienta, mas não substitui essa conferência.

## Onde mora cada nome

| Entrada | Nomes usados no site |
|---|---|
| `ui` | `Badge`, `Button`, `Card`/`CardContent`, `Field`, `Input`, `Label`, `Checkbox`, `Table`, `Timeline`/`TimelineItem`, `SegmentedControl`, `Tabs`, `InputGroup`/`InputGroupButton`, `DeviceFrame`, `SplitView`, `ScrollArea`, `Separator`, `Alert`, `Accordion`, `Stepper`, `KpiCard`, `Progress`, `ActionButton`, `CurrencyInput`, `PhoneInput`, `SearchInput`, `Command`, `EditableText`, `AvatarStack`, `UserAvatar`, `ChipGroup`, `BentoGrid`, `AutoFit`, `BlurFade`, `IconMorph`, `AnimatedNumber`, `Stack`/`StackCard`, `Sheet`, `DropdownMenu`, `useInView`, `useReducedMotion`, `useTypewriter` |
| `ui/effects` | `Marquee`, `RotatingText`, `NumberTicker`, `AnimatedList`, `BorderBeam`, `TypingDots`, `Stagger`, `RevealOnScroll`, `TextShimmer`, `Shake`, `GridPattern` |
| `ui/surfaces` | `Surface`, `NoiseOverlay` (e os proibidos `GlassSurface`/`useLiquidGlass`) |
| `ui/markdown` | `MarkdownRenderer` |
| `ui/data-table` | `DataTable` (exige `@tanstack/react-table`, que não está instalado) |

Hoje a fronteira `components/lib/ui.tsx` reexporta só `Badge`, `Card`, `CardContent`, `Field` e `Input` da entrada `ui`. Cada entrada nova ganha um arquivo irmão com `"use client"`.

## Props conferidas no MCP

| Componente | Props |
|---|---|
| `Badge` | `variant` primary/secondary/destructive/success/warning/info/neutral · `appearance` solid/soft/outline/ghost/link · `dot` · `pulse` · `asChild` |
| `Button` | `variant` (mesmos 7) · `appearance` solid/outline/soft/ghost/link · `size` xs/sm/md/lg/icon* · `shine` · `asChild`. Para navegação, use `asChild` com o link |
| `Card` | `size` default/sm · `flush` |
| `Table` | `containerClassName`. Serve tabela estática, e `DataTable` cobre sort, filtro e paginação |
| `Marquee` | `speed` (px/s, 40) · `direction` left/right · `pauseOnHover` (true) · `gap` ('1rem') |
| `RotatingText` | `words` · `interval` (ms, 2500) · `duration` (s, 0.3) |
| `NumberTicker` | `value` · `duration` (0.8) · `format` · `digits` · `startOnView` |
| `AnimatedList` | `distance` (8) · `duration` (0.25) |
| `BorderBeam` | `duration` (4) · `delay` · `color` (default `--primary`) · `beamLength` · `strokeWidth` · `borderRadius` ('surface') |

## Bloco → lib

| Bloco (arquivo atual) | Lib | Fica local |
|---|---|---|
| Palavra que gira (`template/Orbit.tsx`, `intro/*`) | `RotatingText` | — |
| Cabeçalho de seção (`template/SectionHead.tsx`) | `BlurFade inView` na entrada | as 3 variantes `data-head` |
| Cards de produto (`template/Home.tsx`, `v2.module.css .card`) | `Card` + `Badge appearance="soft"` em `BentoGrid`, `Stagger` | — |
| Palco Orbit (`hub.module.css`) | `Card size="sm"`, `BorderBeam` no ativo, `Timeline` no registro | fios em SVG |
| Mensagem (`message.module.css`, `DragToCheck.tsx`) | `Checkbox`/`Label`, `IconMorph`, `AnimatedList` | trilho e condutor |
| Casa do Domus (`house.module.css`) | já usa `Badge`/`Card`/`Field`/`Input`; usar `Table` nas linhas | anel do logo |
| Janela de cena (`scenes/SceneWindow.tsx`) | `DeviceFrame variant="browser"` ou `Surface material="solid"`, `AutoFit` | barra com logo |
| Celular do chat (`scenes/ChatPhone.tsx`) | `DeviceFrame variant="phone"`, `TypingDots`, `InputGroup`, `UserAvatar` | bolha |
| Toast (`scenes/ConfirmToast.tsx`) | `Alert` ou `Card size="sm"` em `BlurFade`, `IconMorph` | posição na janela |
| Knowly (`SourcePanel.tsx`, `KnowlyPlay.tsx`) | `SearchInput`/`Command`, `useTypewriter`, `MarkdownRenderer`, `SegmentedControl` no perfil | — |
| Relloo (`RellooPlay.tsx`) | `SplitView`, `AnimatedList`, `Separator`, `Badge`, `AvatarStack` | bolha |
| Magneto (`MagnetoPlay.tsx`, `magneto.module.css .pill`) | `GridPattern`, `Card size="sm"` + `Badge`, `CurrencyInput`, `ActionButton`, `Shake` | arestas |
| Tuner (`TunerPlay.tsx`) | `Button appearance="outline"` ou `SegmentedControl`, `Card` + `AvatarStack` + `Badge`, `NumberTicker` | fios da URA |
| Domus play (`DomusPlay.tsx` `<table>`, `domus.module.css .field/.input/.table`) | `Field` + `Input`, `Table`, `Badge soft`, `Stepper` | — |
| Cenas de resultado (`MiniScene.tsx`) | `NumberTicker startOnView`, `KpiCard` (com `recharts` instalado) | — |
| Plataformas (`Home.tsx`) | `Marquee` | — |
| Seletor de produtos (`Product.tsx`) | `Tabs` | — |
| Menu mobile (`onepage/SiteNav.tsx` `<button>`) | `Button`, `Sheet`/`DropdownMenu` | — |
| Botão "Recomeçar" dos plays (`plays/parts.tsx` `<button type="reset">`) | `Button` (e some com a autodemo, ver `welabs-site-motion`) | — |
