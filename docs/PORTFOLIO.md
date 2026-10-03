# Portfólio e reuso de apresentações

A fonte editorial e os kits internos residem em `/home/douglas/code/control/portfolio/presentations`. O projeto do site consome somente os manifests/assets validados e um catálogo mínimo. Os recibos internos estão fora do payload público.

## Atualizar conteúdo

1. Editar `<id>/source/presentation.json` na biblioteca de apresentações. Usar textos/fixtures criados para a demonstração, sem mecanismos privados de negócio.
2. Reconstruir e verificar os pacotes com `node shared/export-all.mjs` no diretório da biblioteca. O processo gera os 22 ZIPs e registra payload/tamanhos/hashes em exports/index.json.
3. Executar `node shared/sync-public.mjs`. A validação dos 22 pacotes e de seus ZIPs ocorre antes da cópia. Export antigo, hash incorreto, schema/allowlist inválidos impedem a sincronização.
4. Revisar a narrativa pública do consumidor em lib/product-context.json quando houver mudança de problema ou escopo atribuível; fontes internas não devem ser importadas no client.
5. Rodar lint/tipos/testes/build e scripts/check-portfolio.mjs com o preview disponível; revisar visualmente desktop/mobile e PT/EN após mudanças materiais.

## Embutir em outra aplicação

Copie um ZIP para um diretório público versionado e extraia-o. O player é HTML autossuficiente com imagens inline e CSP local. Não necessita React/Next, APIs de domínio, autenticação, banco ou rede externa. O manifest permite escolher poster e cenas por idioma; todas referências apontam a assets locais com SHA256.

```html
<iframe src="/presentations/wekb/1.0.0/player/pt-BR.html"
        title="WeKB — apresentação ilustrativa"
        sandbox="allow-scripts" referrerpolicy="no-referrer"
        loading="lazy" style="width:100%;height:900px;border:0"></iframe>
```

Ofereça poster e leitura textual como alternativa, e abra mídia sob demanda. O runtime tem anterior/próximo, setas, Escape, pausa por visibilidade e reprodução opt-in; preferência por movimento reduzido impede reprodução automática. O helper DOM da biblioteca também fornece modos home/card/case/deck e motion off/reduce com todas as imagens e textos estáticos.

O consumidor atual usa CompanyHero e PortfolioShowcase para evidência visual nas homes e covers com marca/propósito. Presentation navega os três assets de cena com texto legível, seleção, teclado, ampliação em dialog nativo e roteiro estático. O iframe permanece como opção independente; contadores do host ficam ocultos nessa opção para evitar estados divergentes. O consumidor pode reorganizar o contexto institucional e links sem alterar a composição. A marca e os dados dentro do pacote permanecem isolados do CSS e dos serviços da aplicação host. Uma versão já publicada deve ser imutável; incremente a versão ao alterar conteúdo publicado. Atualmente 1.0.0 é candidata local.

## Filmes de produto (HyperFrames)

Duas fontes entram no site por `node scripts/sync-motion.mjs`: as jornadas aceitas da campanha `portfolio-20261001` (com corte de ferramentas internas e clientes) e as peças de negócio e topologia da rodada `portfolio-20261002`, que só entram quando o sha256 do `index.html` bate com o aceite em `accepted.json`. O script copia só o runtime de cada filme para `public/motion/<id>/`, o Player 0.8.104 para `public/motion/player.js` e gera `lib/motion-catalog.json` (tipo `business`, `topology` ou `journey`, página e produto). Página de produto: visão do produto, veja funcionando e experiência, com navegação interna e play no centro do filme. Rodar o sync de novo após qualquer aceite e reiniciar o `next start`, que congela a lista de `public/` no boot. Falhas medidas e prova por filme: skill `product-motion-system`, `references/site-embedding.md`.

## Seleção e identidade

Produtos Imagine ordenados por ênfase (`lib/emphasis.json`): Tabe.la, Stant, SGORS (ciclo com reciclagem), Central ESG, Kiosk Brands, Família WeGO, Auto Infração, SGICI, Report CRM, Netsafety e IUS. Light, Neoenergia, Enel e AVSI aparecem só como clientes, por segmento. Auto Infração não cita o órgão do cliente. Ferramentas internas, Factory e NFE Flow ficam fora. Serviços são agnósticos: não citam produto de cliente.

Produtos Welabs aparecem pelo tipo, sem marca de produto (ainda sem CNPJ): ERP, Flow, KB, CRM e Ecossistema Monitoramento. O codinome interno deste último não aparece em nada público. Contatos/legais/Organization Imagine não são fallback de Welabs. O site não tem redes sociais: só links do próprio domínio. Metadados e HTML respondem a ?lang=pt/en; marcas reais são preservadas e descritores editoriais seguem o idioma.

## Publicação

Esta entrega não executa deploy. Noindex, robots bloqueado e sitemap vazio identificam a prévia local; não são controles de confidencialidade. O material público já é sanitizado. Para publicar, confirmar atribuição/escopo dos cases e destinos institucionais, então configurar domínio/metadados/canonical/sitemap e a política de indexação das páginas aprovadas. Preservar documentos, source, prints e evidências privados fora de public.
