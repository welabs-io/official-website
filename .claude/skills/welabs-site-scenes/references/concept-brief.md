# Modelo da ficha de conceito (8 partes)

A ficha é **interna**: pode (e deve) ser detalhada. Nada dela vai à tela sem passar pelo filtro do aperitivo (`SKILL.md` §4) e pelas regras de `welabs-site-copy`. Fichas vigentes: `~/code/control/portfolio/site-redesign/v3-plan/fichas-finais.md` (v3, 22/10). As fichas de `fichas-conceito.md` (v2) acertaram a estrutura, mas foram escritas "só com o que o código sustenta" e ficaram abaixo da visão; onde divergirem, vale a v3.

Regra de raiz: **conceito é a visão do produto no ecossistema, não um retrato do código**. Pergunte a visão, o papel no ecossistema e as camadas compartilhadas (assistente, identidade e domínio do Domus, execução do Magneto, canais do Tuner, memória do Knowly). Use código como evidência de apoio, com `arquivo:linha`, repositório e SHA. Premissa vinda de ADR ou doc só entra depois de conferida no código.

## As 8 partes

| # | Parte | O que responde |
|---|---|---|
| 1 | **O problema e para quem** | Quem usa (papéis), como era o dia antes (planilha, celular, e-mail, robô que não passa a vez) e o que muda. |
| 2 | **Cenário de operação** | Uma sequência datada de momentos, no fio único (Pedido 1234): o que acontece, em que registro, com qual prova. É daqui que saem os quadros. |
| 3 | **A visão completa** | O produto inteiro, sem corte: capacidades, módulos, o que o operador define como parte dele. Citações `arquivo:linha` (repo + SHA) para o que o código já faz. |
| 4 | **Papel no ecossistema** | "Dá" e "toma" de cada outro produto (por exemplo, Relloo dá a pessoa ao Domus e toma canais do Tuner). Define quem recebe o conector na cena. |
| 5 | **O assistente no produto** | O que ele pergunta, o que propõe, qual domínio e qual memória lê. Aparece num momento só da cena, na forma comum aos cinco. |
| 6 | **Categoria e diferenciação** | A categoria de mercado, com o que o produto é confundido e por que é diferente. Alimenta a tabela de arquétipos. |
| 7 | **Cena (quadros)** | Tabela de 3 a 4 momentos: o que muda, objeto central, conector, peças em âmbar (máx. 1 a 2 por quadro). O último é o quadro assentado, sem âmbar. Declara o arquétipo. |
| 8 | **Vocabulário** | Duas listas: "do conceito" (língua interna) e "texto em tela" (o que pode ser desenhado e já passa em `copy-rules.json`). |

## Antes de fechar a ficha

- Toda string de "texto em tela" já foi passada por `welabs-site-copy` (sem "ERP", "Cliente", "recibo", "ficha", "fila", "webhook", "protocolo", "tenant", "payload", "entrega" no singular, "ecossistema", verbo de slogan, marca de canal ou nome de pessoa).
- Registros só os do fio; nenhum dado real, nenhuma métrica inventada (volume, SLA, número de empresas), nenhuma pilha interna, nenhum fornecedor de modelo de IA, nenhum marcador de fase. "Versão 3 · publicada" no Magneto é a versão do fluxo da empresa, não do produto.
- Cada quadro passa no teste de cópia ("ensina alguém a copiar?"); o que ensina o "como" fica só na ficha.
- Marque a divergência entre documento e código quando achar; não corrija o código para caber na ficha.
- A ficha vai ao canvas do Claude Design **depois** de pronta e antes de qualquer código.

## Proibições por produto (candidatas a `phrases` em `copy-rules.json`)

Funil de colunas com soma em reais e "No funil R$ ..." (Relloo mostra o funil como **faixa de etapas** dentro do painel da pessoa), "cashback", "cupom" e e-mail como canal desenhado (Tuner), painel de indicadores com número inventado, "só fiscal" (Domus). Regra nova de texto entra no JSON, nunca só aqui.
