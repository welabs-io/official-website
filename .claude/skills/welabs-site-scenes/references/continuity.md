# Continuidade e movimento (kit e legado)

O dono do contrato é o kit: `components/scene-kit/timeline.ts` (relógio sem framework, `timeline.test.ts` com timers falsos) e `Scene.tsx`. Esta página só registra as medidas e o que ainda é legado.

## Cena nova (kit)

1. Copie `components/scene-kit/TEMPLATE.tsx`; o cabeçalho dele traz as regras da cena.
2. Escreva `steps` (`{ id, at?, hold?, gate? }`); renderize **só** de `scene` (`reached`, `is`, `cycle`); todo controle chama `scene.take(id)`.
3. Registre em `components/scene-kit/registry.ts` (`SCENE_IDS`) e em `LabStage.tsx`; aprove sozinha em `/lab/scenes/<id>` (`noindex`, 1440 e 390, botões "Recomeçar" e "Simular gesto").
4. Monte no site com uma linha, só depois do aceite.

Garantias do kit: autoplay ao entrar na tela (`useInView`, limiar 0,4); loop com `LOOP_HOLD` (~1 s) no último passo; gesto assume e devolve (`HUMAN_IDLE` = 8 s parado, ou sequência completa; segura ~1 s, reseta, retoma); `data-on="false"` fora da tela (nenhum timer nem animação CSS); sob `useReducedMotion` o último passo é estático e é o que o servidor desenha; janela com a altura do quadro assentado (cópia oculta do último passo divide a célula); `SCENE_EASE`.

## Durações e ritmo

| Uso | Valor |
|---|---|
| Micro (hover, press, abrir) | `--dur-1` 0,16 s, `--dur-2` 0,28 s, `--dur-3` 0,48 s |
| Passo de cena | 400 a 1200 ms (último passo com ~0,5 s a mais que as transições, para segurar ~1 s) |
| Ciclo de cena | 6 a 10 s (ficha: 12 a 15 s no total para 4 momentos; confira o ciclo medido) |
| Carrossel / palavra que gira | cerca de 3 s por item, sincronizados |
| Hold depois de gesto | ~1 s (mínimo 1 s), depois reset |

Proibidos: scroll-jacking, seção fixada no scroll, barra de progresso, botão de pausar/retomar e vídeo ou player (`scripts/check-portfolio.mjs`). Tudo é DOM nativo. Movimento só entra quando mostra um efeito do produto ou orienta a atenção; mesma ordem de produtos em palco, cadeia e faixas (Domus, Relloo, Magneto, Tuner, Knowly).

## Os três tokens de easing

`--ease-out` `cubic-bezier(0.2, 0.7, 0.2, 1)` (padrão); `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` (ida e volta); `--ease-spring` `cubic-bezier(0.34, 1.36, 0.64, 1)` (único overshoot, para o que nasce: chip, nó, cartão). Fora deles, só `linear` e `steps()`. `cubic-bezier(` escrito fora da definição de token reprova `components/template/polish.test.tsx` e `e2e/tokens.spec.ts`. Em JS, use `SCENE_EASE`/`SCENE_CURVE` de `Scene.tsx`. Não crie curva nova.

## Legado (fora do kit, até migrar)

`components/scenes/`, `components/plays/` e a casa do Domus (`components/template/house.module.css`) seguem o contrato antigo, que vale para eles até migrarem:

1. roda sozinho ao entrar na tela (os plays ainda abrem no registro vazio, falha conhecida);
2. faz loop (a mensagem não faz, animações `both` sem `infinite`);
3. gesto assume e devolve: toca até o fim, segura ~1 s (a casa segura 3,2 s, medido em `155fb83`), reseta, retoma;
4. pausa fora da tela: movimento CSS só sob `data-on="true"` do `LiveObserver` nos elementos `data-live`; cena com roteiro observada com limiar 0,5 (`components/scenes/replay.ts`);
5. movimento reduzido mostra o quadro final (`data-phase="end"`): `getAnimations()` do bloco dá 0; toda folha que anima tem o seu `@media (prefers-reduced-motion: reduce)`.

## Prova de movimento (Playwright)

`e2e/helpers/continuity.ts`: `expectContinuousLoop(locator, options)` (reprova bloco parado mais que `maxIdleStillMs`, sem reação em `reactMs`, sem hold final de `minHoldMs`, parado mais que `maxStillMs` ou que não volta ao loop) e `expectFinalFrameUnderReducedMotion(page, locator)`. `e2e/continuity.spec.ts` usa os dois nos blocos legados, com `test.fail` numa lista explícita das falhas conhecidas (o próprio `test.fail` reprova se a peça passar). Cena do kit é provada por `e2e/scene-kit*.spec.ts`, não por esse arquivo. Os specs rodam contra servidor de pé (`PORTFOLIO_PREVIEW_URL`); suba um próprio em outra porta.
