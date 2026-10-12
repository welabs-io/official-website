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

- Os motions vêm do **manifesto de motion** da rodada (`portfolio-20261002`, `plan-v5/out/motion-manifest.json`): ele diz quais peças, quais trechos, a taxa, o `holdAfter`, a transição, as capas, o texto para leitor de tela e o valor de cada ligação. O site não decide nenhum tempo. `node scripts/sync-motion.mjs` valida o manifesto contra o schema, copia-o para `lib/motion-manifest.json`, monta a cópia do site de cada peça referenciada (peça aceita mais a regra `siteVariant.hide`, conferida por `sha256`), as capas (1280 e 640 px), o `_shared` da marca e o player HyperFrames fixado para `public/motion/v5`. A rodada é só leitura. `lib/manifest/` lê e valida o manifesto no build e tem os seletores; `lib/motion-slides.ts` o transforma nos slides dos anéis.
- Os carrosséis circulares (cadeia, produtos, anel da página de produto) são marcação de servidor (`RingStage`): um tile por passo, produto ou filme, cada um com capa WebP. Nada hidrata. O único pedaço de cliente é o `RingDriver`, que não renderiza nada: com o carrossel a 400 px da tela ele baixa o motor (`ring-run.ts`, por `import()`) e o script do player; com o carrossel na tela, a aba visível e sem `prefers-reduced-motion`, o motor toca. Os tiles mudam de lugar por `data-pos`, sem estado do React.
- Só o tile ativo toca e só o próximo fica parado e pronto; os vizinhos são `<img>`. O vizinho anterior mostra a capa do quadro parado (`covers.settled` do manifesto), o próximo a de entrada. Cada player é um `<hyperframes-player autoplay muted>` **sem** `controls`. Sem botão de pausa nem barra de progresso.
- Bloco de conectores (`CoreHub`): CSS puro, sem biblioteca, na vertical. Três trilhos em 1/6, 1/2 e 5/6 da largura (Magneto, Tuner, Knowly) cruzam a caixa do núcleo (Domus, a costura âmbar no eixo, Relloo) e continuam, abaixo da seção, como os trilhos que convergem no fechamento, sem ponta solta. Cada ligação mostra o `connection.label` do manifesto. Na página de produto o produto da página fica aceso e só os rótulos das ligações dele ficam.
- O fio da página desce pelo eixo central (`shell.module.css`): linha de 2 px atrás do conteúdo, uma doca âmbar de 10 px no topo de cada seção e, no fundo da seção, o trecho (`ConnectorRail`) por onde desce o pulso de 4 px a cada troca do anel (`ring-run` alterna `data-pulse` entre `a` e `b`). A fileira de logos (`LogoRow`) é o núcleo e trilhos em miniatura: o trecho aceso do barramento e o valor da ligação mudam a cada troca. Toda animação CSS roda só com `data-on="true"`, que o `LiveObserver` (um único `IntersectionObserver`) liga na tela e desliga fora dela.
- `prefers-reduced-motion`: nenhum player é baixado ou montado, cada tile mostra a capa, os pulsos ficam parados e a faixa de logos vira uma linha quebrada.
- Logos: `node scripts/optimize-logos.mjs` converte os PNGs de clientes e plataformas em WebP. `node scripts/measure-perf.mjs` mede peso, players simultâneos e bloqueio da thread principal contra um servidor em execução.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     cabeçalho e rodapé, bloco de produto, faixa de logos, observador de movimento e os estilos da página
components/template/    template das páginas (seções declarativas), fileira de logos, bloco de conectores, trecho do fio e fechamento
components/ring/        carrossel circular: palco (servidor), motor sob demanda, reprodução encadeada e player
lib/                    produtos, slugs públicos, configuração das páginas, política do selo, manifesto de motion (lib/manifest) e slides
public/brands/welabs/   logos da Welabs, logos dos produtos, favicons e selos
public/clients/         logos de terceiros que o site Imagine já exibe
public/platforms/       marcas de infra e dev (simple-icons, CC0; AWS e HostDime oficiais)
public/motion/v5/       peças, capas, _shared e player copiados da rodada por scripts/sync-motion.mjs
scripts/                sincronização do manifesto de motion, logos em WebP, medição de peso e verificação do site contra o preview
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
