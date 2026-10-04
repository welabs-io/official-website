# Imagine Apps e Welabs — prévia institucional

Website-v2 com distribuição institucional das duas empresas. Imagine organiza serviços (know-how em movimento), produtos com cliente e clientes por segmento. Welabs apresenta sua plataforma e produtos próprios pelo tipo, sem marca de produto: Flow, CRM, Hub de domínio, KB, Channels e Ecossistema Monitoramento, seguidos da cadeia de integração. Cada produto com roteiro aprovado mostra os filmes na ordem do operador (`reel` em `lib/motion-catalog.json`). As peças animadas (HyperFrames) entram por `scripts/sync-motion.mjs`; o ranking de ênfase fica em `lib/emphasis.json`.

## Rodar localmente

Next.js 16.3.3 instalado, React 19, TypeScript e CSS. Node >=20.9.0 e npm.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Apreciação: http://127.0.0.1:3000/ e http://127.0.0.1:3000/welabs. `?lang=pt` e `?lang=en` selecionam idioma, inclusive no HTML do servidor. A seleção de idioma e os links conservam a query; nomes reais das marcas permanecem.

## Páginas e componentes

- Imagine: `/`, `/sobre`, `/servicos`, `/portfolio`, `/portfolio/[slug]`.
- Welabs: `/welabs`, `/welabs/sobre`, `/welabs/solucoes`, `/welabs/produtos`, `/welabs/produtos/[slug]`.
- Apresentações independentes: `/apresentacoes/[slug]` e `/presentation-downloads/[slug]-1.0.0.zip`. Pacotes aposentados (que citam órgão de cliente ou codinome interno) respondem 404 em `proxy.ts` e não são versionados.
- Filmes: `/portfolio/filmes`; serviços em `/servicos`; produtos só com filme (IUS, Netsafety, Report CRM) em `/portfolio/[slug]`. URLs públicas que substituem ids internos ficam em `lib/public-slugs.ts`.
- Os caminhos anteriores `/portfolio-preview` e `/portfolio-preview/welabs` redirecionam para os novos destinos locais.

`InstitutionalSite` reúne consumidores institucionais; `CompanyHero` apresenta produtos nas duas homes e `PortfolioShowcase` organiza covers/coleção. `Presentation` oferece galeria nativa com cenas, leitura, teclado e ampliação; o player independente abre como alternativa em iframe isolado. `lib/presentation-catalog.json` e `lib/presentation-visuals.json` são projeções públicas mínimas, e `lib/framepacks.server.ts` lê os manifests públicos permitidos. `lib/product-context.json` apresenta problema/participação de modo proporcional às evidências. `proxy.ts` envia ao layout o idioma validado da query. Header/footer/JSON-LD/metadados respeitam a empresa corrente.

Os 22 pacotes públicos estão em `public/presentations/<id>/1.0.0`, com poster PNG/SVG, player HTML PT/EN e manifest. Não incluem fontes, prints reais, documentos internos, APIs ou dados do produto. Downloads ZIP contêm apenas o pacote. A marca sem logo verificado é apresentada com identidade contextual, sem inventar um símbolo. Veja [documentação de reuso](docs/PORTFOLIO.md).

## Verificar

```sh
npm run check
node scripts/check-portfolio.mjs
```

O segundo comando exige o preview local rodando; `PORTFOLIO_PREVIEW_URL` pode selecionar outro servidor local. Verifica 22 pacotes, hashes de 326 assets, rotas nos dois idiomas, título/HTML localizado, players, ZIPs, seleção, ownership e aliases. Os testes do contato não enviam email.

## Formulário Imagine

O endpoint original `app/api/contact` conserva validação e proteção de envio. Variáveis server-side: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`; consulte `.env.example`. Não configurar secrets em assets ou código client. Nenhum formulário Imagine é utilizado pela Welabs; o CTA Welabs atual explora produtos.

## Limites da prévia

A versão é local, `noindex`, robots bloqueado e sitemap vazio. Não houve deploy externo. As apresentações são conceituais/ilustrativas: não comprovam operação atual, resultado quantitativo ou autoria integral nos produtos de clientes. Produtos próprios conservam estágios de desenvolvimento/Alpha; históricos ficam identificados e fora da coleção principal. Publicação futura exige configuração de destinos e revisão de escopo/atribuição, sem inferir domínio Welabs.
