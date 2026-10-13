# Welabs — site da empresa e dos produtos

Site da Welabs, empresa que desenvolve produtos próprios de software: Domus, Relloo, Magneto, Tuner e Knowly. Uma página única de nove faixas, que alternam cenas e conectores com seções de leitura (cerca de 8 telas a 1440 px), com as nossas aberturas e filmes tocando sozinhos em carrosséis sem interface de player, um bloco de conectores que mostra como os produtos se ligam, e uma página por produto no mesmo template (cerca de 5 telas).

Aplicação Next.js 16 (App Router), React 19, TypeScript e CSS Modules, em português, sem banco de dados. A identidade é a da marca Welabs (âmbar, grafite, creme, Inter), num tema único: o tema claro (creme) em todas as faixas, com o rodapé em grafite. As aberturas e filmes dos produtos seguem em vídeo, como objeto escuro dentro do tema claro.

## Rotas

| Rota               | Conteúdo                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                | Abertura e cadeia em dois blocos, um pedido do começo ao fim, produtos, o que muda na operação, para quem, integrações e infraestrutura, perguntas frequentes, conectores, faixa de marcas e plataformas, contato e rodapé                                                     |
| `/products/[slug]` | Abertura com o caminho "Welabs / Produto" e a cena nativa do produto, o que resolve, como funciona (a cadeia nativa só com as cenas do produto e, abaixo, os filmes), capacidades em grupos, para quem, perguntas, conectores com o produto aceso, fechamento e os outros produtos (`domus`, `relloo`, `magneto`, `tuner`, `knowly`) |
| `/lab/chain`       | Bancada da cadeia em tela cheia (`noindex`, sem link)                                                                                                                                                                                                                          |

Blocos da home e âncoras, na ordem: `#chain` (cadeia, logo abaixo do topo `#top`), `#how` (um pedido do começo ao fim), `#products`, `#operation` (o que muda), `#audience` (para quem), `#integrations`, `#faq`, `#connectors`, `#platforms` e `#contact` (fechamento com o contato). Páginas de produto: `#product` (abertura), `#resolves`, `#how` (cadeia nativa do produto e filmes), `#capabilities`, `#audience`, `#faq`, `#connectors`, `#platforms`, `#contact` e `#others` (os outros quatro produtos, no fim).

O menu do cabeçalho (`components/onepage/SiteNav.tsx`) está em todas as páginas: Produtos (os cinco, numa lista que abre ao passar o mouse ou ao focar; num celular, um painel aberto por botão que fecha com Esc, com um toque num link e ao mudar de página), Como funciona (`/#how`) e Contato (`/#contact`). O logo leva à home em toda página.

Rotas em inglês. Endereços antigos redirecionam (308) em um salto: `/new` → `/`; `/produtos`, `/products`, `/solucoes` e `/solutions` → `/#products`; `/sobre` e `/about` → `/#chain`; `/produtos/<slug>` → `/products/<slug>`; ids internos (`erp`, `flow`…) e slugs anteriores (`rello`, `hub-de-dominio`) vão direto ao slug atual; `/welabs/*` e `/portfolio-preview/*` do site compartilhado também. A query string é mantida. O produto oculto (`ecossistema-monitoramento`) volta para `/#products` (temporário). A lista está em `next.config.mjs`; `lib/routes.test.ts` trava segmento de rota em português e redirecionamento em mais de um salto.

## Movimento

- Os motions vêm do **manifesto de motion** da rodada (`portfolio-20261002`, `plan-v5/out/motion-manifest.json`): ele diz quais peças, quais trechos, a taxa, o `holdAfter`, a transição, as capas, o texto para leitor de tela e o valor de cada ligação. O site não decide nenhum tempo. `node scripts/sync-motion.mjs` valida o manifesto contra o schema, copia-o para `lib/motion-manifest.json`, monta a cópia do site de cada peça referenciada (peça aceita mais a regra `siteVariant.hide`, conferida por `sha256`), as capas (1280 e 640 px, recomprimidas em WebP com qualidade 70), o `_shared` da marca e o player HyperFrames fixado para `public/motion/v5`. A rodada é só leitura. `lib/manifest/` lê e valida o manifesto no build e tem os seletores; `lib/motion-slides.ts` o transforma nos slides dos anéis.
- A cadeia da home são dois blocos ligados por um conector (schema 1.2.0 do manifesto: cada passo de `chain.steps[]` tem `overview` e `detail`). Em cima, a visão geral (`ChainOverview`, SVG e CSS, sem vídeo e sem lib): os produtos na ordem do enredo como logos sobre uma linha com nós discretos, o token "Pedido 1234", os nós de `overview.nodes` acesos e a legenda `overview.label` como texto comum (sem `aria-live`: um carrossel que muda sozinho não fala por cima do leitor). Embaixo, as **cenas nativas** (`components/scenes`): sete telas de produto em HTML e CSS (`ChatPhone`, `InboxUnified`, `CrmFunnelCard`, `HouseRooms`, `SourcePanel`, `ApprovalFlow`, `ConfirmToast`), na história de Marina e do Pedido 1234, com os textos em `lib/scenes/story.ts`. O relógio é o **roteiro** `lib/scenes/script.ts`: por cena, ações com tempo relativo, `settle` e `hold`; a cena dura `settle + hold` e o token da visão geral anda no tempo do roteiro (o manifesto segue dono da legenda, dos nós e do nome acessível). `SceneStage` (servidor) mantém a troca de posição circular, com os vizinhos como as mesmas cenas paradas; `SceneDriver` + `scene-run.ts` (cliente, sob demanda) só trocam `data-pos`, escrevem a fase de cada cena (`end` assentada, `start` primeiro quadro, `play`) e disparam `ring:swap`; todo o movimento é CSS (`components/scenes/fx.css`), que anima DE um estado até o natural, então o quadro assentado é CSS puro. Pausa fora da viewport e com a aba oculta; sob `prefers-reduced-motion` cada cena fica no quadro final. Na página de produto, `#how` repete esse par (`ChainOverview` com o logo do produto marcado por uma barra âmbar e `SceneStage id="product-chain"`) só com as cenas em que o produto participa (`lib/scenes/product-scenes.ts`: as que ele protagoniza mais as que ele liga como ponta da conexão do passo; Domus 5, Relloo 5, Tuner 2, Knowly 1, Magneto 1). `scene-run.ts` avisa a visão geral o passo da cena (`steps` nos dados do palco), não a posição; um palco de uma cena só a reinicia a cada ciclo, e a última cena de um ciclo curto segura mais (`PRODUCT_MIN_CYCLE`, 18 s, porque 7,1 s de ciclo mediu 64% parado). Abaixo, o anel de vídeo (`RingStage`, "Em filmes") segue com a abertura e os filmes, que não têm cena nativa equivalente. Do nó aceso desce o conector (fio condutor com o pulso do site) até o topo do tile e desliza quando o nó muda. O bloco de cima não tem relógio: `overview-follow.ts` escuta o evento `ring:swap` e reescreve atributos e variáveis CSS no mesmo instante da troca da cena; sob `prefers-reduced-motion` o token salta sem animar. `lib/manifest/parse.ts` valida o `overview` (ao menos uma ponta do token é nó aceso, o intervalo fica dentro do `detail`, o `detail` é o passo).
- Os carrosséis circulares (cadeia, produtos, anel da página de produto) são marcação de servidor (`RingStage`): um tile por passo, produto ou filme, cada um com capa WebP. Nada hidrata. O único pedaço de cliente é o `RingDriver`, que não renderiza nada: com o carrossel a 400 px da tela ele baixa o motor (`ring-run.ts`, por `import()`) e o script do player; com o carrossel na tela, a aba visível e sem `prefers-reduced-motion`, o motor toca. Os tiles mudam de lugar por `data-pos`, sem estado do React.
- Só o tile ativo toca e só o próximo fica parado e pronto; os vizinhos são `<img>`. O vizinho anterior mostra a capa do quadro parado (`covers.settled` do manifesto), o próximo a de entrada. Cada player é um `<hyperframes-player autoplay muted>` **sem** `controls`. Sem botão de pausa nem barra de progresso.
- Bloco de conectores (`CoreHub`): CSS puro, sem biblioteca, na vertical. Três trilhos em 1/6, 1/2 e 5/6 da largura (Magneto, Tuner, Knowly) cruzam a caixa do núcleo (Domus, a costura âmbar no eixo, Relloo) e continuam, abaixo da seção, como os trilhos que convergem no fechamento, sem ponta solta. Cada ligação mostra o `connection.label` do manifesto. Na página de produto o produto da página fica aceso e só os rótulos das ligações dele ficam.
- O fio da página desce pelo eixo central (`shell.module.css`): linha de 2 px atrás do conteúdo, uma doca âmbar de 10 px no topo de cada seção e, no fundo da seção, o trecho (`ConnectorRail`) por onde desce o pulso de 4 px a cada troca do anel (`ring-run` alterna `data-pulse` entre `a` e `b`). A fileira de logos (`LogoRow`) é o núcleo e trilhos em miniatura: o trecho aceso do barramento e o valor da ligação mudam a cada troca. Toda animação CSS roda só com `data-on="true"`, que o `LiveObserver` (um único `IntersectionObserver`) liga na tela e desliga fora dela.
- `prefers-reduced-motion`: nenhum player é baixado ou montado, cada tile mostra a capa, os pulsos ficam parados e a faixa de logos vira uma linha quebrada.
- Logos: `node scripts/optimize-logos.mjs` converte os PNGs de clientes e plataformas em WebP. `node scripts/measure-perf.mjs` mede peso, players simultâneos e bloqueio da thread principal contra um servidor em execução.

## Conteúdo

Todo texto visível mora em `lib/content/*.ts`, tipado (`types.ts`): `home.ts` (frase do núcleo e dos trilhos, linha de cada ligação, títulos do fechamento, títulos da página de produto; a abertura da home, título e linha de apoio, abre a seção da cadeia) e `products.ts` (por produto: 3 problemas, 6 capacidades e a legenda de cada filme). A home mostra cinco cartões de produto (o ativo no carrossel de produtos fica aceso, `data-on` reescrito pelo `ring-run`); a página de produto mostra como funciona (filmes com legenda que acompanha a cena, texto comum sem `aria-live`; o rótulo da cena está no `aria-label` do tile ativo), o que resolve, capacidades e uma linha por ligação. `lib/content/rules.ts` guarda as palavras proibidas que o vitest aplica ao dado e ao HTML renderizado.

Seções de leitura (direção do operador de 2026-10-12: mais conteúdo e mais rolagem), também em dados tipados, sem cliente, métrica, case nem funcionalidade que o portfólio não sustente:

- `lib/content/sections.ts` (home): `JOURNEY` (os sete passos da cadeia, uma frase e os produtos de cada um), `BENEFITS` (seis mudanças concretas, cada uma com a cena nativa que a mostra), `AUDIENCE` (quatro perfis de operação, sem nome de empresa), `INTEGRATIONS` (canais, dados, nuvem e IA, com os logos que o site já tem), `HOME_FAQ` (oito perguntas) e `HOME_SECTIONS` (títulos, linhas de apoio e o contato).
- `lib/content/product-depth.ts` (produto): as seis capacidades em grupos, com uma frase cada, três perfis e de três a quatro perguntas por produto.
- Cenas paradas: `components/scenes/MiniScene.tsx` desenha o quadro final de uma cena da cadeia fora do carrossel (as vitrines do "o que muda" e a abertura de cada página de produto), sem relógio e sem código de cliente; o texto de interface dessas cenas fica fora da contagem de palavras (`data-mini` até `data-mini-end`).
- "Como trabalhamos" (diagnóstico, implantação, operação e evolução) ficou de fora: o portfólio não traz fonte para etapas de trabalho. O contato é o botão e a linha que o operador definiu em 09/10/2026: nenhum e-mail ou WhatsApp foi dado.
- Orçamento de palavras visíveis (cenas não contam): de 700 a 1000 na home e de 400 a 700 por produto (eram 180 e 260 antes da expansão). O piso trava a seção que perde o texto; o teto, o texto que cresce sem decisão. Valem em `components/template/site.test.tsx` e em `scripts/check-portfolio.mjs`.

## Estrutura de pastas

```
app/                    rotas (home e /products/[slug]), layout raiz, estilos globais e imagem de compartilhamento
components/onepage/     cabeçalho e rodapé, bloco de produto, faixa de logos, observador de movimento e os estilos da página
components/template/    template das páginas (seções declarativas), fileira de logos, bloco de conectores, trecho do fio e fechamento
components/ring/        carrossel circular de vídeo (páginas de produto): palco (servidor), motor sob demanda, reprodução encadeada e player
components/scenes/      cenas nativas da cadeia: janelas de produto, palco, motor sob demanda e o CSS de movimento
lib/scenes/             história, roteiro (tempos das ações) e tipos das cenas
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

`npm run check` executa lint, typecheck, testes e build. Com o site rodando, `node scripts/check-portfolio.mjs` confere as páginas, os redirecionamentos, os arquivos referenciados e as regras de conteúdo (sem player com controles, sem barra, sem slogan, de 700 a 1000 palavras visíveis na home e de 400 a 700 numa página de produto, o menu em toda página, a ordem das seções); `PORTFOLIO_PREVIEW_URL` aponta outro servidor.

### Navegação (causa medida e especificações)

O relato do operador, "ao clicar num produto a página come o bloco inicial e não tem como voltar", tem duas causas medidas em 2026-10-12 (Playwright, 1440 e 375):

1. `html { scroll-behavior: smooth }` em `app/globals.css`. O Next 16 deixou de desligar a rolagem suave na troca de rota, então o clique num cartão chegava à página do produto por uma rolagem de 0,5 s que atravessava o corpo da página (760, 235, 78, 18 e 0 px em quadros sucessivos) e a restauração do navegador no avançar virava animação (num celular a página do produto ficou parada em 2867 px, a rolagem da home de onde veio). Corrigido tirando a rolagem suave da página inteira: todo salto, troca de rota, voltar e avançar é instantâneo.
2. O cabeçalho só tinha o logo e o botão: sem menu e sem caminho. Agora há o menu em toda página, o caminho "Welabs / Produto" no topo de cada produto e "Outros produtos" no fim.

`e2e/navigation.spec.ts` trava o clique (nenhum quadro da página do produto fora do topo; o logo visível e abaixo do cabeçalho), o voltar (volta à mesma posição, ±2 px), o menu a 1440 e a 375, e `e2e/sections-nav.spec.ts` trava as âncoras, o caminho, o logo e "Outros produtos". Sem a correção, a primeira especificação reprova nos dois tamanhos, com quadros da página do produto no meio da rolagem.

## Limites atuais

O site é uma prévia: páginas `noindex`, `robots.txt` bloqueando tudo e sitemap vazio. O botão "Conversar com a Welabs" aponta para a seção final (`#contact`); o destino definitivo ainda será decidido. O site da Imagine Apps, empresa irmã, tem repositório próprio: [imagineapps-team/official-website](https://github.com/imagineapps-team/official-website).
