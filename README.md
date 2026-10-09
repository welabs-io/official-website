# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios de software: Domus, Relloo, Magneto, Tuner e Knowly. Uma página única de sete seções, com pouco texto e motions SVG/CSS limpos, e uma página por produto na mesma linguagem. Não há vídeo nem player: tudo que se move é desenhado na página.

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, em português, sem banco de dados. A identidade é a da marca Welabs (âmbar, grafite, creme, Inter).

## Rotas

| Rota               | Conteúdo                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `/`                | Hub, Domus, Relloo, trilhos (Magneto, Tuner, Knowly), cadeia, a Welabs com carrosséis, CTA e rodapé |
| `/products/[slug]` | Logo com selo, uma linha factual e o motion do produto (`domus`, `relloo`, `magneto`, `tuner`, `knowly`) |

Âncoras da home, em inglês: `#products` (hub), `#domus`, `#relloo`, `#rails`, `#chain`, `#about`, `#contact`.

Rotas em inglês. Endereços antigos redirecionam (308) em um salto: `/new` → `/`; `/produtos`, `/products`, `/solucoes` e `/solutions` → `/#products`; `/sobre` e `/about` → `/#about`; `/produtos/<slug>` → `/products/<slug>`; ids internos (`erp`, `flow`…) e slugs anteriores (`rello`, `hub-de-dominio`) vão direto ao slug atual; `/welabs/*` e `/portfolio-preview/*` do site compartilhado também. A query string é mantida. O produto oculto (`ecossistema-monitoramento`) volta para `/#products` (temporário). A lista está em `next.config.mjs`; `lib/routes.test.ts` trava segmento de rota em português e redirecionamento em mais de um salto.

## Movimento

- Cada palco (`MotionStage`) é uma caixa cuja animação SVG/CSS só roda enquanto o controlador (`motion-controller.ts`) o marca vivo: visível na tela, página não pausada, no máximo dois ao mesmo tempo. Fora disso o palco não tem animação e mostra o quadro estático, que é o próprio estilo base.
- `prefers-reduced-motion` começa a página pausada; o botão do cabeçalho pausa e retoma (a escolha fica no `localStorage`).
- Conectores âmbar entre seções e carrosséis só animam na tela e com a página tocando. Com a página pausada os carrosséis viram uma linha quebrada, sem corte.
- A cadeia (seção 5) é conduzida pela rolagem: um número (`--t`, de 0 a 4) escrito na seção; o resto é CSS.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     seções, palcos de motion por produto, controlador de motion, cabeçalho e rodapé
lib/                    lista de produtos, slugs públicos, logos dos carrosséis (com a evidência de uso) e ícones
public/brands/welabs/   logos da Welabs, logos dos produtos, favicons e selos
public/clients/         logos de terceiros que o site Imagine já exibe
public/platforms/       marcas de infra e dev (simple-icons, CC0; AWS e HostDime oficiais)
scripts/                verificação do site contra o preview
```

## Como rodar

Requer Node 20.9 ou superior e npm.

```sh
npm i
npm run dev
```

O site abre em http://localhost:3000. Para um build de produção local: `npm run build` e `npm start`. `NEXT_DIST_DIR` usa outra pasta de build, útil para um segundo servidor ao lado de outro já em execução.

## Verificação

`npm run check` executa lint, typecheck, testes e build. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas, os redirecionamentos, os arquivos referenciados e as regras de conteúdo (sem player, sem vídeo, sem slogan, no máximo 70 palavras visíveis na home); `PORTFOLIO_PREVIEW_URL` aponta outro servidor.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. O botão "Conversar com a Welabs" aponta para a seção final (`#contact`); o destino definitivo ainda será decidido. O site da Imagine Apps, empresa irmã, tem repositório próprio: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website).
