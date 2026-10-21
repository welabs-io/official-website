---
name: welabs-site-motion
description: Contrato de continuidade do movimento no site Welabs (welabs-website) - toda cena, play, palco e carrossel roda sozinho, faz loop e, depois de qualquer gesto humano, completa, segura ~1 s, reseta e retoma; os 3 tokens de easing; quadro final sob movimento reduzido; pausa fora da tela; componentes de movimento da lib (Marquee, RotatingText, NumberTicker, AnimatedList, BorderBeam...) no lugar de keyframes à mão. Use antes de criar ou alterar animação, transição, keyframe, cena, play, autodemo, replay, carrossel ou qualquer coisa com `data-phase`, `data-live` ou `data-replay` neste repositório, e ao escrever spec Playwright de movimento.
---

# Movimento do site Welabs

## O contrato de continuidade (inegociável)

1. **Roda sozinho.** Toda cena, play, palco e carrossel começa a demonstrar sem gesto, ao entrar na tela. Nada abre vazio esperando clique. Hoje os plays abrem no registro vazio, "Nada ainda." (`PLAY_COMMON.idle`, `lib/content/plays.ts:15-19`), o que é falha conhecida da F3.
2. **Faz loop.** Ao terminar, segura o quadro final e recomeça do primeiro quadro. Nenhuma peça pousa congelada num botão "Recomeçar". A mensagem não faz loop hoje: as animações dela são `both`, sem `infinite` (`components/template/message.module.css:273-359`), o que é falha conhecida da F3.
3. **Gesto assume e devolve.** Qualquer evento humano (clique, toque, arrasto, tecla) pausa a autodemo e roda a sequência que disparou **até o fim**. Depois **segura cerca de 1 s** (mínimo de 1 s, que é a régua de `e2e/domus.spec.ts:206-208`), **reseta** e **retoma** o loop sozinho. Gesto nunca deixa a peça parada.
4. **Pausa fora da tela.** Movimento CSS só roda sob `data-on="true"`, que o `LiveObserver` escreve nos elementos `data-live` (`components/onepage/LiveObserver.tsx:10-23`). Cena com roteiro é observada com limiar de 0,5 (`components/scenes/replay.ts:34-44`). Fora da tela não pode haver nenhuma animação rodando.
5. **Movimento reduzido mostra o quadro final.** O servidor desenha o quadro assentado (`data-phase="end"`, `components/scenes/replay.ts:5-7`), e sob `prefers-reduced-motion: reduce` nada roda: `getAnimations()` do bloco dá 0 e o conteúdo final fica visível (`e2e/domus.spec.ts:214-233`). Toda folha que anima tem o seu bloco `@media (prefers-reduced-motion: reduce)`.

**Padrão de referência: a casa do Domus** (`components/template/house.module.css:1-15`). O ciclo é de 8 s (`--domus-cycle`) e o checkbox troca cada animação pela gêmea (`-a`/`-b`, keyframes iguais), o que reinicia a sequência do primeiro quadro. A peça toca até o fim, segura, reseta e segue em loop. Copie essa mecânica, com o hold do contrato.

## Durações e ritmo

| Uso | Valor |
|---|---|
| Micro (hover, press, abrir) | `--dur-1` 0,16 s · `--dur-2` 0,28 s · `--dur-3` 0,48 s (`components/onepage/shell.module.css:105-107`) |
| Passo de cena | 400–700 ms |
| Ciclo de cena | 6–10 s |
| Carrossel / palavra que gira | 3 s por item, sincronizados |
| Hold depois de gesto | ~1 s, depois reset |
| Pausa entre replays de cena | `PAUSE = 2.2` s (`components/scenes/replay.ts:13`) |

Ficam proibidos scroll-jacking, seção fixada no scroll, barra de progresso, botão de pausar/retomar (`scripts/check-portfolio.mjs:60`) e vídeo ou player (`check-portfolio.mjs:61-65`). Tudo é DOM nativo. Movimento só entra quando mostra um efeito do produto ou orienta a atenção, e mantém a mesma ordem de produtos em palco, cadeia e faixas.

## Os três tokens de easing

Definidos uma vez em `components/onepage/shell.module.css:103-110`:

- `--ease-out`: `cubic-bezier(0.2, 0.7, 0.2, 1)`, o padrão;
- `--ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)`, para ida e volta;
- `--ease-spring`: `cubic-bezier(0.34, 1.36, 0.64, 1)`, o único overshoot, para o que nasce (chip, nó, cartão).

Além deles, só `linear` e `steps()` (para tique ou relógio). `cubic-bezier(` escrito fora da definição de um token reprova `components/template/polish.test.tsx:177-201`, e o computado em tela reprova `e2e/tokens.spec.ts`. As curvas da lib já leem esses valores, porque `app/lib.css:23-30` mapeia `--ease-out-quad`, `--ease-out-soft` e `--ease-in-out` para eles. Não crie curva nova.

## Lib antes de keyframe à mão

Antes de escrever `@keyframes`, procure o componente no MCP (`mcp__imagine-react-lib__search_component`). Quando a lib tem a peça, use a lib, pela fronteira de cliente (`components/lib/*.tsx`, ver `welabs-site-ui`). Props conferidas no MCP:

| Necessidade | Componente | Props-chave |
|---|---|---|
| Faixa contínua (plataformas, canais) | `Marquee` (`ui/effects`) | `speed` px/s, `direction`, `pauseOnHover`, `gap` |
| Palavra que gira | `RotatingText` (`ui/effects`) | `words`, `interval` ms, `duration` s |
| Número que conta | `NumberTicker` (`ui/effects`) | `value`, `startOnView`, `format`, `duration` |
| Itens chegando (mensagem, log, linha do registro) | `AnimatedList` (`ui/effects`) | `distance`, `duration` |
| Produto ou janela ativa | `BorderBeam` (`ui/effects`) | `color` (default `--primary`), `duration`, `borderRadius` |
| "Digitando" | `TypingDots` (`ui/effects`) | — |
| Entrada no viewport | `BlurFade` (`ui`), `RevealOnScroll`/`Stagger` (`ui/effects`) | `inView`, `delay` |
| Troca de ícone, falha | `IconMorph` (`ui`), `Shake` (`ui/effects`) | — |
| Detecção | `useInView`, `useReducedMotion` (`ui`) | — |

Ficam **locais**: o driver de cena por roteiro (`replay.ts`, `scene-run.ts`, `restart.ts`), os fios e pacotes em SVG com `offset-path` e a máquina de estado CSS dos plays. Mesmo esses usam os tokens e obedecem ao contrato. Componente da lib com loop próprio (`Marquee`, `RotatingText`, `BorderBeam`) já cumpre "roda sozinho". Confira no fonte (`get_component` com `include: ["source"]`) se ele respeita movimento reduzido, porque se não respeitar o wrapper da fronteira tem de respeitar.

## Como provar (Playwright)

- `e2e/helpers/continuity.ts`:
  - `expectContinuousLoop(locator, options)` amostra o estado visível do bloco e reprova se ele ficar parado mais que `maxStillMs` sem gesto. Com `trigger`, também reprova se o bloco não reagir ao clique ou se congelar depois dele, e confere que a atividade continua até o fim da janela;
  - `expectFinalFrameUnderReducedMotion(page, locator)` confere 0 animações e o conteúdo visível.
- `e2e/continuity.spec.ts` usa os dois helpers. A casa do Domus passa hoje, e as peças ainda fora do contrato (mensagem e plays) estão como `test.fail` numa lista explícita, com a fase que as corrige. Quando a fase entrar, troque `test.fail` por `test`. O próprio `test.fail` reprova se a peça já passar.
- Roda contra um servidor de pé (`PORTFOLIO_PREVIEW_URL`, `playwright.config.ts`). Suba um servidor próprio em outra porta e não use a porta do preview do operador.
