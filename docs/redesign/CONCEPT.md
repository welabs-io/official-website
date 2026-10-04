# Fio condutor — conceito do redesenho

**Ideia:** a informação flui e se conecta. O grafo é uma sensação, não um widget: fios finos correm por trás do conteúdo e ligam o que se relaciona (título → produtos, frente de atuação → filme → plataforma Welabs, desafio → filmes → experiência, Hub de domínio → demais produtos). Tipografia sóbria, impacto pelo movimento e pela composição.

## Tipografia

| Papel | Face | Tamanho |
|---|---|---|
| Título de abertura (h1) | Instrument Sans 500, tracking −0,03em | `clamp(32px, 4vw, 52px)` |
| Título de seção (h2) | Instrument Sans 500, tracking −0,022em | `clamp(24px, 2.3vw, 32px)` |
| Subtítulo (h3) | Instrument Sans 500 | 19px |
| Lead / corpo | Instrument Sans 400 | 17px / 15px |
| Rótulos, índices, metadados | IBM Plex Mono 400–500, caixa alta, +0,08em | 10,5–11px |

Linhas limitadas por `ch` (títulos 15–24ch, texto 42–60ch). Segunda linha do título em `--text-3` faz o contraste no lugar do tamanho.

## Paleta (tokens em `app/redesign.css`)

- Neutro compartilhado: `--ink #0b0d0e`, `--ink-2 #101315`, `--ink-3 #15191b`, `--line #22292c`, `--line-2 #323b3f`, `--text #e8ebea`, `--text-2 #a9b1b3`, `--text-3 #808a8d`.
- Imagine: `--imagine #0098da`, fio `--imagine-soft #5bbde9`.
- Welabs: `--welabs #ff452b`, fio `--welabs-soft #ff8069`, neutros levemente quentes (`#0d0c0c`…).
- A cor de marca aparece só em fios, nós, foco e seleção; botões primários são claros sobre escuro. Raio 2–3px, linhas finas, sem sombras.
- O site já era só escuro; o redesenho mantém `color-scheme: dark`.

## Movimento (`components/MotionLayer.tsx`)

1. **Espinha:** linha no gutter esquerdo com um nó ao lado de cada título de seção; desenha conforme a rolagem e acende os nós alcançados.
2. **Fios entre conteúdos:** `data-thread="k"` → `data-thread-to="k"`; curva Bézier por trás do conteúdo, desenhada pela rolagem, com ponto de chegada.
3. **Revelações:** `data-reveal` (sobe e aparece), `data-reveal-stagger` (filhos em sequência), `data-reveal="mask"` nos filmes (máscara que abre).
4. **Profundidade:** campo de pontos da abertura com parallax (`data-depth`).
5. **Magnetismo:** CTA principal e botão de play se inclinam para o ponteiro fino.
6. **Transição de página:** View Transitions API — saída sobe e esmaece, entrada abre por máscara; o cabeçalho fica fixo. O preloader de tela cheia (≥600ms em todo carregamento) e o cursor customizado saíram.
7. `prefers-reduced-motion`: fios desenhados por inteiro e estáticos, sem revelação, parallax, magnetismo nem transição.

## Momento-assinatura (homes)

O título sobe linha a linha, os cartões de produto assentam, e um fio sai do fim da primeira linha do título, atravessa o vão entre as colunas e desenha o grafo de produtos — Imagine: Tabe.la → Stant e Sistema de Gerenciamento de Resíduos; Welabs: Flow → Hub de domínio, KB, CRM, Ecossistema Monitoramento. Cada cartão acende quando o fio chega. Depois, o fio do Tabe.la (ou do Flow) segue até o cartão correspondente na seção seguinte. Em 390px, o trecho título → produto é omitido para não cortar o texto.

## O que mudou por página

| Página | Mudança |
|---|---|
| Cabeçalho / rodapé | Cabeçalho transparente que ganha fundo ao rolar; links com sublinhado que desenha; rodapé em quatro colunas com rótulos mono. Navegação bilateral Imagine ↔ Welabs mantida. |
| Home Imagine | Momento-assinatura; seção de contextos com cartão destacado ligado ao herói; frentes de atuação em 4 colunas → fio para o filme de know-how → fio para "Conhecer a plataforma Welabs". |
| Home Welabs | Mesmo momento com Flow como centro; fio do Flow até seu cartão no ecossistema; tons quentes. |
| Produto (Imagine e Welabs) | Título reduzido; subnavegação em texto mono; fio desafio → filmes → experiência (no Tabe.la, filmes → link da plataforma Welabs); galeria de filmes vira filme + índice de capítulos. |
| Atuação / serviços | Frentes em colunas com régua; galeria com índice lateral; fio frentes → filmes → Welabs. |
| Soluções Welabs | Lista editorial; o Hub de domínio liga um fio a cada produto que o consome. |
| Portfólio / coleções | Filtros em texto com sublinhado; cartões com quadro do filme e faixa de legenda (texto nunca sobre a imagem). |
| Contato | Título em caixa normal e menor; formulário com linhas finas. |

## Evidência

As capturas ficam fora do repositório, em `~/code/control/portfolio/site-redesign/`: antes em `before/`, depois em `after/` (1440 e 390; `*-fold.png` = primeira dobra após a abertura, demais = página inteira após rolar).
