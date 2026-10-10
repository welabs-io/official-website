# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios de software: Domus, Relloo, Magneto, Tuner e Knowly. Uma página única de quatro blocos, compacta, com as nossas aberturas e filmes tocando sozinhos em carrosséis sem interface de player, um bloco de conectores que mostra como os produtos se ligam, e uma página por produto no mesmo template.

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, em português, sem banco de dados. A identidade é a da marca Welabs (âmbar, grafite, creme, Inter), com fundo alternando grafite e creme a cada seção.

## Rotas

| Rota               | Conteúdo                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Cadeia, produtos, conectores, faixa de marcas e plataformas com o botão final, e rodapé                                                   |
| `/products/[slug]` | Abertura, conectores com o produto aceso, os outros filmes em carrossel e o botão final (`domus`, `relloo`, `magneto`, `tuner`, `knowly`) |
| `/lab/chain`       | Bancada da cadeia em tela cheia (`noindex`, sem link)                                                                                     |

Blocos da home e âncoras: `#chain` (cadeia, logo abaixo do topo `#top`), `#products`, `#connectors`, `#platforms` e `#contact` (fechamento). Páginas de produto: `#product` (abertura), `#connectors`, `#films`, `#contact`.

Rotas em inglês. Endereços antigos redirecionam (308) em um salto: `/new` → `/`; `/produtos`, `/products`, `/solucoes` e `/solutions` → `/#products`; `/sobre` e `/about` → `/#chain`; `/produtos/<slug>` → `/products/<slug>`; ids internos (`erp`, `flow`…) e slugs anteriores (`rello`, `hub-de-dominio`) vão direto ao slug atual; `/welabs/*` e `/portfolio-preview/*` do site compartilhado também. A query string é mantida. O produto oculto (`ecossistema-monitoramento`) volta para `/#products` (temporário). A lista está em `next.config.mjs`; `lib/routes.test.ts` trava segmento de rota em português e redirecionamento em mais de um salto.

## Movimento

- Os motions são as peças da rodada de filmes (`portfolio-20261002`): as aberturas dos cinco produtos, a abertura da Welabs, trechos dos filmes e o filme da cadeia. `node scripts/sync-motion.mjs` copia as peças listadas em `lib/motion-pieces.json`, o `_shared` (manifesto, carregador, player sequencial, vendor, marca) e o player HyperFrames fixado para `public/motion`, e gera uma capa por peça em `public/motion/posters`. A rodada é só leitura.
- Os carrosséis circulares (cadeia, produtos, filmes do produto, abertura do produto) são marcação de servidor (`RingStage`): um tile por corte ou produto, cada um com capa WebP. Nada hidrata. O único pedaço de cliente é o `RingDriver`, que não renderiza nada: com o carrossel a 400 px da tela ele baixa o motor (`ring-run.ts`, por `import()`) e o script do player; com o carrossel na tela, a aba visível e sem `prefers-reduced-motion`, o motor toca. Os tiles mudam de lugar por `data-pos`, sem estado do React.
- Só o tile ativo toca e só o próximo fica parado e pronto; os vizinhos são `<img>`. O vizinho anterior mostra a capa do último quadro (`end-<filme>.webp`), o próximo a do primeiro. Cada player é um `<hyperframes-player autoplay muted>` **sem** `controls`. Sem botão de pausa nem barra de progresso.
- Bloco de conectores (`Connectors`): SVG e CSS, sem biblioteca. Núcleo Domus e Relloo, trilhos Magneto, Tuner e Knowly, pulsos âmbar que cruzam o núcleo por trás. Dois layouts (largo e alto, para celular) com os logos como links por cima. Na página de produto o produto da página fica aceso, os que se ligam a ele ficam ligados e os outros ficam em tom baixo, todos a um clique.
- O fio entre as seções é o `::before` e o `::after` de cada faixa (`shell.module.css`): linha fina, ponto âmbar no início de cada seção e um pulso de 4 px no ritmo da faixa. Toda animação CSS (pulsos, fio, faixa de logos) roda só com `data-on="true"`, que o `LiveObserver` (um único `IntersectionObserver`) liga na tela e desliga fora dela.
- `prefers-reduced-motion`: nenhum player é baixado ou montado, cada tile mostra a capa, os pulsos ficam parados e a faixa de logos vira uma linha quebrada.
- Capas e logos: `node scripts/optimize-posters.mjs` converte as capas JPG e os PNGs de clientes em WebP e gera as capas do último quadro; rode depois de `scripts/sync-motion.mjs`. `node scripts/measure-perf.mjs` mede peso, players simultâneos e bloqueio da thread principal contra um servidor em execução.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     seções, bloco de conectores, template de produto, observador de movimento, cabeçalho e rodapé
components/ring/        carrossel circular: palco (servidor), motor sob demanda, reprodução encadeada e player
lib/                    produtos, slugs públicos, peças e slides de motion, geometria dos conectores, logos e ícones
public/brands/welabs/   logos da Welabs, logos dos produtos, favicons e selos
public/clients/         logos de terceiros que o site Imagine já exibe
public/platforms/       marcas de infra e dev (simple-icons, CC0; AWS e HostDime oficiais)
public/motion/          peças, _shared, player e capas copiados da rodada por scripts/sync-motion.mjs
scripts/                sincronização dos motions, capas em WebP, medição de peso e verificação do site contra o preview
```

## Como rodar

Requer Node 20.9 ou superior e npm.

```sh
npm i
npm run dev
```

O site abre em http://localhost:3000. Para um build de produção local: `npm run build` e `npm start`. `NEXT_DIST_DIR` usa outra pasta de build, útil para um segundo servidor ao lado de outro já em execução (alterne `.next-a` e `.next-b`).

## Verificação

`npm run check` executa lint, typecheck, testes e build. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas, os redirecionamentos, os arquivos referenciados e as regras de conteúdo (sem player com controles, sem barra, sem slogan, no máximo 85 palavras visíveis na home); `PORTFOLIO_PREVIEW_URL` aponta outro servidor.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. O botão "Conversar com a Welabs" aponta para a seção final (`#contact`); o destino definitivo ainda será decidido. O site da Imagine Apps, empresa irmã, tem repositório próprio: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website).
