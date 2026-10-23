# Catálogo de arquétipos

Fonte: tabela "Diferenciação" de `~/code/control/portfolio/site-redesign/v3-plan/fichas-finais.md` (v3, 22/10). Cada produto tem **um** arquétipo; **nunca duas cenas iguais**.

| Produto | Objeto central | Tipo de tela (exclusivo) | Movimento | Categoria | Confundido com |
|---|---|---|---|---|---|
| Domus | o modelo da empresa ganhando um tipo de registro que vira tela e passa a ser usado pelos outros | mapa de módulos com o construtor: lista de campos tipados | um campo nasce no construtor, a tela se forma, os outros produtos acendem ao usá-la | gestão empresarial integrada com construtor | sistema de gestão de prateleira; construtor sem código genérico |
| Relloo | a pessoa, com as conversas de todos os canais e a oportunidade andando no funil | caixa de entrada, pessoa e funil: única com bolha e histórico vertical com hora | a conversa vira oportunidade; a oportunidade muda de etapa por um fluxo | relacionamento e atendimento em vários canais, com funil | central de chamados; robô de mensagens; quadro de vendas |
| Magneto | uma execução viva, com comprovante por passo | trilha da execução em grafo: passos, espera, ramos | passos acendem um a um; um espera e converge, outro falha e se refaz sem duplicar | orquestração de processos com execução durável | automação "se isto, então aquilo"; robô de tela; diagrama de processo |
| Tuner | uma chamada que sai para vários canais e volta normalizada | leque de canais com a situação de cada envio | um envio se abre em vários canais; os selos passam de enviado a entregue e a lido | plataforma de comunicações por API | central de atendimento; disparo em massa; gateway de mensagem |
| Knowly | um assunto contado no tempo, com a prova de cada fato | linha do tempo horizontal | fontes chegam, o mesmo fato se funde, o trecho-prova aparece; no fim, o que ainda não se sabe | memória organizacional para pessoas e agentes | busca corporativa; chat com documentos; wiki |

## Exclusividades

Cada elemento só aparece na cena do produto indicado. É isto que impede as cenas de voltarem a parecer iguais.

| Elemento | Só em |
|---|---|
| bolha e histórico vertical com hora | Relloo |
| grafo de nós e arestas / passos | Magneto |
| eixo horizontal de tempo | Knowly |
| lista de campos tipados | Domus |
| leque de um envio para N canais | Tuner |

O painel do assistente é o único elemento comum, de propósito: mesma forma nos cinco (painel lateral de até 1/3 da largura, selo de contexto, pergunta, proposta "antes -> depois", Confirmar, comprovante), em **um momento** de cada cena. Ele é o fio visual do ecossistema.

## Anti-padrões medidos

| Anti-padrão | Por que reprova |
|---|---|
| Cabeçalho comum a todas as cenas com feed vertical embaixo | foi o achado de raiz de "todas parecem chat": as cinco cenas viravam a mesma |
| Domus como processo (o Pedido 1234 passando por módulos numa lista vertical com hora) | é a forma da execução do Magneto; Domus e Magneto ficam iguais. O Domus é **origem** e construtor, não depósito nem trilha |
| Domus como depósito ("registrado no pedido por ...", curvas convergindo para um registro) | repete o verbo "guardar", falha de posicionamento medida |
| Construtor ausente no Domus (módulo já pronto, botão que ninguém aperta) | é a terceira camada da tese: o campo tem de nascer e a tela se formar |
| Funil de colunas com soma em reais no Relloo | o funil existe (roda sobre o Magneto), mas na cena é uma **faixa de etapas** compacta dentro do painel da pessoa, sem somas |
| Painel de indicadores com números inventados | métrica inventada é proibida (`welabs-site-copy` regra 9) |
| Pergunta e resposta fora do Relloo/assistente | vira chat; a resposta com fontes é do Knowly (e o assistente é um momento só) |
| Conector em âmbar ou traço fino; mais de 2 peças âmbar por quadro | quebra as regras visuais (`SKILL.md` §5) |

A regra "cada cena declara o arquétipo" está só em texto. Para virar ferramenta: `data-archetype` na raiz da cena e uma spec que reprove `Timeline`/bolha fora do Relloo, grafo fora do Magneto, eixo de tempo fora do Knowly, e assim por diante. Memória do operador: só a regra cobrada por ferramenta mudou comportamento.
