---
name: welabs-site-copy
description: Regras de conteúdo do site Welabs (welabs-website) - sem pessoa fictícia nem personificação, sem slogan, sem "ERP"/"Cliente" visível, sem marcador de maturidade, sem logo de cliente, fornecedor só como exemplo de categoria, sem expor a pilha interna, Domus como a gestão inteira (nunca "só fiscal") e prometer só o que o código sustenta. Use antes de escrever ou alterar qualquer texto visível, aria-label, alt, título, metadado, string de cena ou play (lib/content/**, lib/scenes/**, lib/partners.ts, lib/products.ts) deste repositório, e ao revisar copy do site.
---

# Texto do site Welabs

## Fonte única das regras

`lib/content/copy-rules.json` é a lista única. Dois leitores a usam: `lib/content/rules.ts` (vitest: `copyViolation`, `personViolation` e `stackViolation`) e `scripts/check-portfolio.mjs` (contra o servidor). **Regra nova entra no JSON**, e nenhum dos dois carrega lista própria (`lib/content/rules.test.ts:42-49`). O texto checado inclui o visível, `alt` e `aria-label` de cada página renderizada (`components/template/site.test.tsx`).

| Chave | O que barra | Como casa |
|---|---|---|
| `words` | verbos de slogan e personificação (`domina`, `atende`, `automatiza`, `sabe`, `define`, `explica`, `conecta`, `transforma`), palavras proibidas (`cliente`, `erp`, `ecossistema`), mecanismo interno (`tenant`, `fila`, `webhook`, `payload`, `protocolo`) e maturidade (`beta`, `mvp`, `v2`, `roadmap`, `em breve`, `sandbox`...) | palavra inteira, sem caixa |
| `phrases` | slogans conhecidos e o "só fiscal" do Domus | trecho literal, sem caixa |
| `allowed` | lista fechada onde "entrega" é substantivo da história | removida antes de casar |
| `persons` | prenomes de pessoa | palavra inteira, **com** maiúscula |
| `stack` | pilha interna e base tecnológica | palavra inteira, com caixa |
| `known` | falhas conhecidas toleradas, cada uma com a fase que a remove | — |

## As regras

1. **Sem pessoa fictícia e sem personificação.** Cena e play mostram o **efeito** num registro (pedido, linha, perfil, equipe), nunca uma pessoa com nome. O produto não "sabe", "entende" nem "atende": quem age é a operação, e o produto é o lugar onde ela acontece. "Marina" ainda aparece em `lib/scenes/story.ts:9`, `lib/scenes/capabilities.ts:117-149` e `lib/content/home.ts:33`, e está em `known.persons` até a **F1**.
2. **Sem slogan.** A ideia "tudo termina num registro do Domus" é roteiro, não frase do site. Cada seção a **mostra**, sem enunciá-la. Título curto (até 6 palavras) mais uma linha.
3. **Nada de "ERP" nem "Cliente" visível**, em nenhum lugar: texto, `alt`, `aria-label`, metadado. Use "a sua empresa", "a operação", "contato", "pessoa atendida".
4. **Sem marcador de maturidade.** Produto aparece como existente, sem estágio, versão, roadmap, "em breve" ou "beta".
5. **Sem logo nem nome de cliente** (`scripts/check-portfolio.mjs:162-167`). Stant, Tabe.la e WeGO são sistemas da Imagine, não da Welabs, e não entram na faixa de plataformas (`check-portfolio.mjs:168-171`). Site sem redes sociais: só links do próprio domínio.
6. **Fornecedor só como exemplo de categoria.** A categoria vem primeiro, e no máximo as marcas que o código sustenta vão entre parênteses: "Canais de mensagem e de voz num ponto só (WhatsApp oficial, ligações, Discord)." (`lib/content/products.ts:109`). Nenhuma frase abre com marca.
7. **Sem expor a pilha interna.** Onde roda: só AWS, Google Cloud, DigitalOcean e HostDime (`check-portfolio.mjs:172-176`). Também não se mostram:
   - infra e operação (Kubernetes, Argo CD, Vault, Temporal, Authentik, Docker, GitHub, PostgreSQL, Cloudflare);
   - a base do Domus e a origem dos módulos;
   - o fornecedor de modelo de IA e o detalhe de RAG.

   Hoje `lib/partners.ts:26-82` mostra a pilha em "Onde rodamos", e ela está em `known.stack` até a **F1**.
8. **O Domus é a gestão inteira.** É o centro onde o negócio é definido e onde os outros quatro produtos escrevem, com módulos padrão e sob medida. Nunca é "só fiscal" nem "emissor de nota": fiscal e bancos são detalhes dele. Os outros produtos são as portas por onde o trabalho chega ao Domus.
9. **Prometa só o que o código sustenta.** Toda capacidade citada precisa de evidência no código do produto ou no próprio site (`file:line` no comentário da string, como já fazem `lib/content/products.ts` e `lib/scenes/capabilities.ts`). Ficam de fora:
   - preço, prazo de implantação e número de clientes;
   - métrica inventada, certificação e depoimento.

   Um número de módulos só vale quando é a contagem de `DOMUS_MODULES` (`lib/content/home.ts:72`), que `lib/content/content.test.ts:119-135` amarra aos módulos que o código instala.

## Orçamento de palavras

Home: 200 a 300 palavras visíveis. Produto: 110 a 230. O texto desenhado dentro de cena (`data-mini` ... `data-mini-end`, palco `data-scenes`) não conta, mas segue as regras acima (`components/template/site.test.tsx`, `check-portfolio.mjs:147-149,204-209`). Cada seção fica em cerca de 40 palavras fora das cenas, e cada linha de produto tem no máximo 4 palavras.

## Falhas conhecidas

`known` no JSON é a única lista de tolerância. O vitest reprova se um item tolerado **sumir** do site, para que a lista encolha junto com o código. Ao corrigir, apague o item. Nunca acrescente item para fazer um teste passar: corrija o texto.

Rotas e identificadores ficam sempre em inglês (`/products/domus`), e o texto, em português.
