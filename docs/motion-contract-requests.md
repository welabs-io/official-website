# Pedidos de mudança ao contrato do manifesto de motion

O site decide nenhum tempo: tudo vem de `lib/motion-manifest.json`. Quando um ajuste de ritmo exige algo que o manifesto de origem
(`plan-v5/out/motion-manifest.json`, schema 1.2.0) não permite, o ajuste é feito na cópia do site e registrado aqui, para a rodada de motion
incorporar na próxima versão. Enquanto não incorporar, um `node scripts/sync-motion.mjs` com o manifesto de origem **desfaz** estes ajustes:
ele precisa ser rodado com `--schema lib/motion-manifest.schema.json` e com o manifesto do site como base.

## Pedido 1: `holdAfter` mínimo de 0,5 s nos segmentos de produto (12/10/2026, rodada `feat/faster-rotation`)

- **O que o schema diz**: `holdAfter >= 1` em `defaults`, em `chain.steps[]` e em cada segmento de abertura e filme de `products`.
- **O que o site precisa**: o operador pediu o anel de vídeo dos produtos mais rápido (tempo por tile 35% menor), com o rabo da abertura em cerca de
  1,6 s e o hold em cerca de 0,8 s. Medido no khal.ai: a troca é o único movimento grande e cada cena segura de 1,2 a 2,5 s legível; no anel de
  filmes o quadro final parado é o mesmo da capa, então 0,8 s basta para o olho assentar antes do giro.
- **Ajuste feito na cópia do site**: `lib/motion-manifest.schema.json` (`segment.holdAfter` com `minimum: 0.5`) e `lib/manifest/parse.ts`
  (`holdAfter >= 0.5`). Os passos da cadeia (`chain.steps[]`) e `defaults.holdAfter` seguem em 1 s.
- **Pedido à rodada**: baixar o piso de `holdAfter` para 0,5 nos segmentos de `products` no schema 1.3.

## Pedido 2: recortes, taxas e duração da troca dos filmes (mesma rodada)

Tudo dentro dos campos já previstos (`from`, `to`, `rate`, `holdAfter`, `transition.duration`), sem mudar o schema:

- aberturas (`products.*.intro`): `rate` 1 para 1,5 (o rabo passa de 2,4 s para 1,6 s) e `holdAfter` de 1 para 0,8;
- filmes (`products.*.films[].segments[]`): `from` movido para o primeiro quadro parado depois do gancho, `rate` 2 (o teto de leitura combinado), `holdAfter` 0,8
  e `transition.duration` 0,7 (o giro da troca dura de 0,6 a 0,8 s; antes 0,4 s);
- o `to` e o `settledAt` de cada filme não mudam, então as capas assentadas e as de fim continuam as mesmas;
- as capas de entrada (`covers.start`) dos filmes cujo `from` mudou foram geradas de novo (1280 e 640 px, WebP com qualidade 70) a partir da cópia do
  site da peça, no quadro `from + 0,5 s`, e o `poster` do filme aponta para elas.

| Tile                        | Antes (s) | Depois (s) |
| --------------------------- | --------- | ---------- |
| Abertura e filme do Domus   | 24,07     | 13,16      |
| Abertura e filme do Relloo  | 32,93     | 20,03      |
| Abertura e filme do Magneto | 23,81     | 13,78      |
| Abertura e filme do Tuner   | 23,44     | 14,98      |
| Abertura e filme do Knowly  | 25,65     | 15,43      |

Os filmes de apoio das páginas de produto caíram entre 36% e 47% pelo mesmo critério (`components/ring/ring.test.ts` guarda o limite de 35%).
