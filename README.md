# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios de software: Domus, Relloo, Magneto, Tuner e Knowly. Uma página única: a home (cerca de 4,6 telas a 1440 px) e uma página por produto (cerca de 3,6 a 4,4 telas), que abre embaixo da home e desce para o próximo produto.

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, em português, sem banco de dados. A identidade é a da Welabs (âmbar, grafite, Inter) com os tokens atuais do front do ERP (v2.1: página branca com halo quente, botão de ação grafite, foco de 2 + 2 px; de-para em `control/portfolio/site-redesign/v13-proposta/v2-1/tokens-erp.md`), num tema único claro, e o rodapé em grafite. O site é 100% nativo: nenhum vídeo, `<iframe>` ou player; as aberturas de marca dos produtos são SVG nativo (`components/intro`).

## Conteúdo v2 (20/10/2026)

Menos explicação, mais vontade de conhecer: cada seção tem no máximo um título curto e uma linha, e o resto é movimento que a pessoa toca. O contato é só o botão "Agendar uma demonstração". O Domus aparece como a gestão inteira da empresa e o centro onde os outros produtos trabalham; fiscal, PIX e bancos são só um detalhe. Toda promessa vem do código dos produtos (análise v13, seção 1): nada de funil, cupom ou cashback no Relloo, nada de processo descrito em frase no Magneto, o chat do site é do Relloo.

## Rotas

| Rota               | Conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `#intro` (título com a palavra que gira e o palco dos cinco produtos sobre o registro do Domus), `#message` (a cena do kit `home-message`: a mensagem que atravessa os cinco produtos e chega no Domus), `#domus` (a casa do Domus com os módulos reais e "+ Novo módulo"), `#products` (os cinco cartões), `#operation` (três desfechos em cena nativa, tocando), `#contact` (perguntas em aberto e o botão) e `#platforms` (onde rodamos) |
| `/products/[slug]` | página autônoma, sem a home acima: `#product` (o seletor dos cinco produtos, o logo com selo, a frase, o botão e o carrossel do produto, `<slug>-carousel`), `#areas` (só o Domus), `#center` (o produto entre os outros), `#details` (o que já vem junto) e `#contact`                                                                                                                                                                     |
| `/lab/scenes`      | bancada das cenas do kit (`noindex`): a lista e `/lab/scenes/<id>`, cada cena sozinha com Recomeçar e Simular gesto                                                                                                                                                                                                                                                                                                                         |

O menu do cabeçalho (`components/onepage/SiteNav.tsx`) está em todas as páginas: Produtos (os cinco, numa lista que abre ao passar o mouse ou ao focar; num celular, um painel aberto por botão que fecha com Esc, com um toque num link e ao mudar de página) e Domus. O botão do cabeçalho leva ao contato da home e o logo leva à home em toda página.

Rotas em inglês. Endereços antigos redirecionam (308) em um salto: `/new` → `/`; `/produtos`, `/products`, `/solucoes` e `/solutions` → `/#products`; `/sobre` e `/about` → `/#message`; `/produtos/<slug>` → `/products/<slug>`; ids internos (`erp`, `flow`…) e slugs anteriores (`rello`, `hub-de-dominio`) vão direto ao slug atual; `/welabs/*` e `/portfolio-preview/*` do site compartilhado também. A query string é mantida. O produto oculto (`ecossistema-monitoramento`) volta para `/#products` (temporário). A lista está em `next.config.mjs`; `lib/routes.test.ts` trava segmento de rota em português e redirecionamento em mais de um salto.

## Interações e movimento

Tudo é CSS sobre controles nativos (`:has(:checked)`): cada interação é uma caixa de seleção ou um rádio com o rótulo visível como botão, então funciona sem script, com teclado e com leitor de tela. Os estilos ficam em `components/template/v2.module.css`; toda animação roda só com a faixa na tela (`data-on`, `LiveObserver`) e é escrita como movimento DE um estado até o natural, então sob `prefers-reduced-motion` cada desenho mostra o quadro final.

- **Palavra que gira** (`HomeIntro`): cinco palavras, 2 s paradas e 0,5 s de troca, ciclo de 12,5 s.
- **Palco dos produtos** (`components/template/Orbit.tsx`, `hub.module.css`): uma grade com o registro do Domus (Pedido 1234) no meio, os quatro produtos em volta e cada ligação na sua coluna; no mesmo ciclo da palavra, o produto da vez mostra o que fez, o pacote âmbar corre pela ligação e acende a linha dele no registro. Passar o mouse ou focar um produto para o ciclo e acende aquele produto. Na página de produto o palco fica parado, com o produto aceso.
- **Cenas do kit** (`components/scene-kit`): o carrossel de cada produto e a mensagem da home entram na página por um encaixe só, `SceneSlot` (`components/scene-kit/SceneSlot.tsx`), que lê o mesmo catálogo do lab. A continuidade é do kit (`Scene.tsx`, `timeline.ts`): toca sozinha na tela, para fora dela, o gesto assume e devolve, e sob movimento reduzido mostra o quadro assentado.
- **"+ Novo módulo"** (`DomusHouse`, `house.module.css`): a casa mostra os módulos que o ERP instala, em dois andares (Padrão e Sob medida); a vaga tracejada vira um módulo novo com o selo e a tela que se monta.
- **Entrada num produto** (`components/onepage/descent-run.ts`, `components/intro`): todo link para um produto toca a abertura de marca dele (portada da rodada de motion, sob demanda) e pousa no logo da abertura do produto. A volta é pelo menu e pelo logo; o voltar do navegador cruza um véu e devolve a home onde o visitante estava.
- **Cenas nativas** (`components/scenes`): os três desfechos da home tocam e repetem enquanto estão na tela (`MiniScene`, `components/scenes/replay.ts`).

## Conteúdo

Todo texto visível mora em `lib/content/*.ts`: `home.ts` (a home), `products.ts` (a página de cada produto: frase, palco, detalhes e perguntas); o texto desenhado de cada cena do kit fica na própria cena (`components/scene-kit/scenes/*.tsx`). `lib/content/copy-rules.json` guarda as palavras proibidas que o vitest e `scripts/check-portfolio.mjs` aplicam ao dado e ao HTML renderizado.

Orçamento de palavras visíveis (cenas não contam): de 200 a 300 na home e de 110 a 230 por produto (eram 700 a 1000 e 400 a 700 antes da v2). Vale em `components/template/site.test.tsx` e em `scripts/check-portfolio.mjs`.

## Sistema visual

Os tokens ficam em `.page` (`components/onepage/shell.module.css`) e as folhas dos componentes só os leem: escala de texto `--text-xs` (14 px, o piso do site) a `--text-hero` (o título da home), alturas de linha `--lh-*`, entreletra `--ls-*`, largura de linha `--measure` (66ch), grade de 4 px `--sp-1` a `--sp-9`, raios do front do ERP `--r-ctl` (10), `--r-card` (8), `--r-win` (14) e `--r-pill` (22), sombras `--shadow-card` e `--shadow-pop`, e um movimento só para toda transição (`--dur-1` a `--dur-3`, `--ease-out`, `--ease-in-out`). O traço de todo ícone é `ICON_STROKE` (`lib/icon-stroke.ts`). O foco visível é um só (`app/globals.css`). `components/template/polish.test.tsx` reprova valor solto nas folhas, fonte fora da escala, raio fora da escala e traço diferente.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     cabeçalho e rodapé, bloco de produto, transição entre páginas, observador de movimento e estilos
components/template/    template das páginas (seções declarativas), seções da home e do produto, palco
components/scene-kit/   kit de cenas: moldura, relógio, encaixe no site (SceneSlot), lab e as cenas v3
components/scenes/      cenas nativas dos desfechos da home: janelas de produto e o CSS de movimento
lib/scenes/             história, roteiros (tempos das ações) e tipos
lib/                    produtos, slugs públicos, configuração das páginas e política do selo
public/brands/welabs/   logos da Welabs, logos dos produtos, favicons e selos
public/platforms/       marcas de infra e dev (simple-icons, CC0; AWS e HostDime oficiais)
public/fonts/           Inter (latin, variável), a única fonte de texto
scripts/                logos em WebP, medição de peso e verificação do site contra o preview
```

## Como rodar

Requer Node 20.9 ou superior e npm.

```sh
npm i
npm run dev
```

O site abre em http://localhost:3000. Para um build de produção local: `npm run build` e `npm start`. `NEXT_DIST_DIR` usa outra pasta de build, útil para um segundo servidor ao lado de outro já em execução (alterne `.next-a` e `.next-b`).

### Ciclo de trabalho: `iterate` e `gate`

- `npm run iterate`: ciclo rápido de ajuste. Compila na pasta de build que a prévia NÃO está usando (`.next-a` ou `.next-b`) e, só com o build pronto, troca o `next start` da porta 5176 (`PORT` muda a porta). A prévia não sai do ar e nenhum teste roda. Lê do processo em execução só a variável `NEXT_DIST_DIR`, nunca o ambiente inteiro (que tem token), e só encerra servidor cuja pasta seja este checkout.
- `npm run gate`: validação completa, uma vez, antes do merge. Lint, typecheck, vitest, `iterate`, `check-portfolio` e a suíte Playwright inteira contra a prévia.

Ajuste visual se itera com `iterate`; `gate` não roda a cada ajuste.

## Verificação

`npm run check` executa lint, typecheck, testes e build. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas, os redirecionamentos, os arquivos referenciados e as regras de conteúdo (sem vídeo, `<iframe>` ou player, sem slogan, o orçamento de palavras da v2, o menu em toda página, a ordem das seções, uma interação por produto); `PORTFOLIO_PREVIEW_URL` aponta outro servidor. `e2e/interactions.spec.ts` toca cada interação; `e2e/navigation.spec.ts` e `e2e/sections-nav.spec.ts` travam a descida, o voltar, o menu e a porta para o próximo produto.

### Navegação (causa medida em 2026-10-12)

`html { scroll-behavior: smooth }` fazia o Next 16 chegar ao produto por uma rolagem que atravessava a página; a rolagem suave saiu da página inteira, e todo salto, troca de rota, voltar e avançar é instantâneo. Desde a PR #27 a home e os produtos são uma página só: o produto abre embaixo dos cinco cartões (`app/(site)/layout.tsx`, `components/onepage/Descent.tsx`), o caminho de volta é para cima e o fim de cada produto é a porta para o próximo.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. O botão "Agendar uma demonstração" aponta para o contato da home (`#contact`); o destino definitivo (agendamento pelo Domus, aviso pelo Tuner) ainda será decidido. O site da Imagine Apps, empresa irmã, tem repositório próprio: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website).
