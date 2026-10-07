# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios para gestão, conhecimento, relacionamento e automação. Apresenta a empresa e o seu ecossistema de produtos — Domus, Magneto, Knowly, Relloo, Tuner e Ecossistema Monitoramento —, cada um com página própria e filmes em motion (HyperFrames) que mostram o produto em uso, com dados fictícios.

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, bilíngue (português e inglês) e sem banco de dados: o conteúdo vem de catálogos JSON versionados em `lib/` e de arquivos estáticos em `public/`. A identidade visual é a da marca Welabs (âmbar sobre grafite).

## Páginas

| Rota               | Conteúdo                                                   |
| ------------------ | ---------------------------------------------------------- |
| `/`                | Abertura, ecossistema de produtos e filmes da plataforma   |
| `/produtos`        | Coleção dos produtos                                       |
| `/produtos/[slug]` | Página do produto: desafio, filmes e produtos relacionados |
| `/solucoes`        | Os produtos pelo problema que resolvem                     |
| `/sobre`           | A empresa                                                  |

Slugs públicos: `domus`, `magneto`, `knowly`, `relloo`, `tuner` e `ecossistema-monitoramento`. Ids internos (`/produtos/erp`, `/produtos/flow`…) e slugs anteriores (`rello`, `hub-de-dominio`, `operacao-seguranca`) redirecionam para o atual. `?lang=pt` e `?lang=en` escolhem o idioma, inclusive no HTML renderizado pelo servidor.

### Endereços antigos

Até 07/10/2026 estas páginas viviam em `/welabs/*` no site compartilhado com a Imagine. Todos os endereços antigos redirecionam de forma permanente para os novos (`/welabs` → `/`, `/welabs/produtos/domus` → `/produtos/domus`, e assim por diante), assim como `/portfolio-preview/welabs` e as prévias dos produtos Welabs.

## Estrutura de pastas

```
app/                 rotas (App Router), layout raiz com a marca, estilos globais e imagem de compartilhamento
components/          páginas, cabeçalho, rodapé, cartões de produto, filmes e camada de movimento
lib/                 catálogos JSON (produtos, visuais, filmes, ênfase), slugs públicos e ícones da marca
public/motion/       filmes HyperFrames publicados, com o player fixado (player.js) e os pôsteres
public/brands/welabs/  logos da Welabs, logos dos produtos, favicons e selos
public/company-brands/  logo usado como imagem de compartilhamento quando falta filme
scripts/             sincronização de filmes, geração de pôsteres e verificação do site
proxy.ts             idioma da requisição
```

## Como rodar

Requer Node 20.9 ou superior e npm.

```sh
npm i
npm run dev
```

O site abre em http://localhost:3000. Para um build de produção local:

```sh
npm run build
npm start
```

`NEXT_DIST_DIR` permite usar outra pasta de build (por exemplo `.next-local`), útil para rodar um segundo servidor ao lado de outro já em execução.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste.

| Variável                  | Uso                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_IMAGINE_URL` | Endereço base do site da Imagine Apps, sem barra final. Alimenta o item "Imagine" do menu, a coluna do rodapé e a alternância de portfólio. É lida no build; sem ela, os links para a Imagine ficam ocultos. |

O site não tem formulário nem segredos de servidor.

## Filmes (HyperFrames)

Os filmes são composições HyperFrames produzidas fora deste repositório, numa rodada de produção que guarda as peças, o índice de entregas e a lista de peças aceitas (com o hash de cada uma). `npm run` não os gera: quem os traz para o site é `scripts/sync-motion.mjs`, executado manualmente com `node scripts/sync-motion.mjs`. O script:

1. copia de cada peça aceita apenas os arquivos de execução para `public/motion/<id>/`, conferindo o hash aprovado;
2. copia o player HyperFrames na versão fixada;
3. reescreve `lib/motion-catalog.json` com título, duração, tipo e produto de cada filme;
4. gera os pôsteres dos cartões (`scripts/generate-motion-posters.mjs`) a partir do quadro final de cada peça.

Todos os produtos abrem com a introdução de marca da Welabs (`lib/brand-intros.json`), cujo quadro final também é a capa dos cartões. A ordem dos filmes de cada produto está no próprio script; a ordem dos produtos fica em `lib/emphasis.json`.

## Verificação

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run check` executa os quatro em sequência. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas de produto nos dois idiomas, os títulos e todos os redirecionamentos; `PORTFOLIO_PREVIEW_URL` aponta outro servidor local.

## Relação com o site da Imagine Apps

A Imagine Apps, empresa irmã de software sob medida e design de produto, tem site e repositório próprios: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website). Os dois sites se apontam mutuamente: aqui, pelo item "Imagine" do menu, pelo rodapé e pela alternância de portfólio; lá, pelo caminho inverso, com `NEXT_PUBLIC_WELABS_URL`. Produtos de clientes construídos pela Welabs aparecem no portfólio da Imagine com o selo "feito pela Welabs", que aponta para cá.

## Origem

Separado do imagine-website-v2 em 07/10/2026, mantendo o histórico. Neste repositório a Welabs, que vivia em `/welabs`, passou a ser a raiz do site; as páginas, os filmes, os clientes e os pacotes de apresentação da Imagine saíram daqui e seguem no repositório dela. Os pacotes de apresentação legados dos produtos Welabs, que nunca eram exibidos, também saíram nessa separação.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. Os filmes usam dados fictícios, identificados pela legenda DEMO. Regra comercial: nenhum produto aparece com estágio, versão ou marcador de maturidade; os campos `maturity` e `stage` dos catálogos ficam como dado e não são renderizados.
