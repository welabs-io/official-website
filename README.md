# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios de software: Domus, Relloo, Magneto, Tuner e Knowly. Uma página única de cinco seções, compacta, com as nossas aberturas e filmes tocando sozinhos em carrosséis sem interface de player, e uma página por produto na mesma linguagem.

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, em português, sem banco de dados. A identidade é a da marca Welabs (âmbar, grafite, creme, Inter), com fundo alternando grafite e creme a cada seção.

## Rotas

| Rota               | Conteúdo                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Topo com as aberturas, faixa de quem atendemos, produtos, cadeia, plataformas, botão final e rodapé                       |
| `/products/[slug]` | Logo com selo, uma linha factual e o carrossel da abertura e dos filmes (`domus`, `relloo`, `magneto`, `tuner`, `knowly`) |

Seções da home e âncoras: 1 topo (`#top`), 2 faixa de logos (`#logos`), 3 produtos (`#products`), 4 cadeia (`#chain`), 5 plataformas e fechamento (`#platforms`, `#contact`).

Rotas em inglês. Endereços antigos redirecionam (308) em um salto: `/new` → `/`; `/produtos`, `/products`, `/solucoes` e `/solutions` → `/#products`; `/sobre` e `/about` → `/#chain`; `/produtos/<slug>` → `/products/<slug>`; ids internos (`erp`, `flow`…) e slugs anteriores (`rello`, `hub-de-dominio`) vão direto ao slug atual; `/welabs/*` e `/portfolio-preview/*` do site compartilhado também. A query string é mantida. O produto oculto (`ecossistema-monitoramento`) volta para `/#products` (temporário). A lista está em `next.config.mjs`; `lib/routes.test.ts` trava segmento de rota em português e redirecionamento em mais de um salto.

## Movimento

- Os motions são as peças da rodada de filmes (`portfolio-20261002`): as aberturas dos cinco produtos, a abertura da Welabs, trechos dos filmes e o filme da cadeia. `node scripts/sync-motion.mjs` copia as peças listadas em `lib/motion-pieces.json`, o `_shared` (manifesto, carregador, player sequencial, vendor, marca) e o player HyperFrames fixado para `public/motion`, e gera uma capa por peça em `public/motion/posters`. A rodada é só leitura.
- Cada quadro (`Reel`) é um `<hyperframes-player autoplay muted>` **sem** `controls`: só o quadro, com cantos e sombra da marca. Uma abertura seguida de um trecho de filme usa o player sequencial (`range-start`/`range-end` no trecho).
- O controlador (`motion-controller.ts`) deixa vivo só o quadro com ao menos 10% visível, no máximo dois ao mesmo tempo, e desmonta o que sai da tela. Não há botão de pausa nem barra de progresso.
- A cadeia (seção 4) acende a lista dos cinco produtos pelo tempo do filme (`CHAIN_BEATS`, medidos na peça). A rolagem nunca fica presa.
- `prefers-reduced-motion`: nada é montado; cada quadro mostra a capa estática (último quadro da abertura) e os carrosséis de logos viram uma linha quebrada.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     seções, carrossel de motion (Reel), controlador de motion, cabeçalho e rodapé
lib/                    produtos, slugs públicos, peças e slides de motion, logos dos carrosséis e ícones
public/brands/welabs/   logos da Welabs, logos dos produtos, favicons e selos
public/clients/         logos de terceiros que o site Imagine já exibe
public/platforms/       marcas de infra e dev (simple-icons, CC0; AWS e HostDime oficiais)
public/motion/          peças, _shared, player e capas copiados da rodada por scripts/sync-motion.mjs
scripts/                sincronização dos motions e verificação do site contra o preview
```

## Como rodar

Requer Node 20.9 ou superior e npm.

```sh
npm i
npm run dev
```

O site abre em http://localhost:3000. Para um build de produção local: `npm run build` e `npm start`. `NEXT_DIST_DIR` usa outra pasta de build, útil para um segundo servidor ao lado de outro já em execução.

## Verificação

`npm run check` executa lint, typecheck, testes e build. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas, os redirecionamentos, os arquivos referenciados e as regras de conteúdo (sem player com controles, sem barra, sem slogan, no máximo 85 palavras visíveis na home); `PORTFOLIO_PREVIEW_URL` aponta outro servidor.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. O botão "Conversar com a Welabs" aponta para a seção final (`#contact`); o destino definitivo ainda será decidido. O site da Imagine Apps, empresa irmã, tem repositório próprio: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website).
