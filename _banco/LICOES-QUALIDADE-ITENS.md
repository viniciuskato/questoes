# Lições de qualidade de itens — defeitos já cometidos e como evitá-los

**Finalidade:** catálogo vivo de defeitos reais, encontrados por revisão humana (Vinicius) em
`_dados/melhorias de questões/*.json` e corrigidos no banco. Não é política editorial (isso é
`POLITICA-EDITORIAL.md`) nem checagem automatizada (isso é `auditar-qualidade-itens.js` e
`validar-banco.js`) — é o registro concreto de "isso já deu errado, não repita", para consultar
**antes** de escrever ou revisar qualquer item novo. Atualizar sempre que uma revisão de
qualidade (`_dados/melhorias de questões/`) apontar um padrão novo, mesmo que pareça único —
padrões só ficam visíveis depois de repetir.

Cada entrada abaixo já foi corrigida em pelo menos uma questão real (ver `correcoes.json` para
o antes/depois). O objetivo aqui não é o histórico da correção, é a regra prática para não
reintroduzir o mesmo erro num item novo.

---

## 1. Distrator descartável por categoria diferente ("respondi por exclusão")

**Sintoma:** o gabarito é reconhecível não porque o autor sabe o conteúdo, mas porque os 4
distratores testam conceitos de famílias totalmente diferentes — basta reconhecer "isso aqui é
sobre outra coisa" para descartá-los, sem precisar saber o que é a resposta certa.

**Exemplo real corrigido:** `antimicrobianos-073` perguntava o que caracteriza uma ESBL. O
gabarito era sobre betalactamases, mas os 4 distratores eram PBP alterada, bomba de efluxo e
proteção ribossomal — mecanismos de resistência de categorias inteiramente diferentes. Reescrito
para 4 distratores todos dentro da mesma família (outras betalactamases: AmpC, KPC, penicilinase
de espectro estreito, metalo-betalactamase), forçando o examinando a saber o traço específico que
distingue ESBL (inibição por clavulanato + espectro de cefalosporinas), não só "isso é sobre
enzima, não sobre bomba".

**Regra prática:** todo distrator deve pertencer à **mesma categoria lógica** do gabarito e
representar um erro que alguém com conhecimento parcial (não zero) cometeria de verdade. Se um
distrator seria descartado por qualquer leigo, ele não está testando nada — reescreva.
Sinal de alerta durante a resposta: sempre que o usuário reportar "usei exclusão" (sabia que as
outras estavam erradas, não que aquela estava certa), é sinal de que a questão precisa ser
revisada — não é elogio à alternativa correta, é falha nos distratores.

## 2. Alternativa correta óbvia/inferível por lógica geral, sem conhecimento específico

**Sintoma:** a resposta certa é a única clinicamente sensata "no olho", ou os distratores são
absurdos flagrantes (ex.: "dispensa qualquer investigação adicional", "indicação cirúrgica
imediata independentemente de qualquer exame"). Isso testa senso comum, não o conteúdo.

**Exemplo real corrigido:** lote inteiro de 33 questões do caso 4 de cardiologia
(`insuficiencia-cardiaca-caso-4-*`) tinha esse padrão: gabaritos ressalvados e razoáveis contra
distratores caricatos que ninguém marcaria por engano.

**Regra prática:** distratores devem ser **defensáveis à primeira leitura** — erros que decorrem
de confundir um limiar, um mecanismo adjacente, uma classe de fármaco parecida, uma conduta
correta em outro contexto mas errada neste. Teste mental: "alguém que estudou o tema mas confundiu
um detalhe marcaria essa alternativa?" Se a resposta for não para os 4 distratores, reescreva.

## 3. Dependência implícita do material de origem (caso clínico / tutorial / aula)

**Sintoma:** o item só faz sentido para quem leu o tutorial/caso que gerou a questão — presume
achados, medicamentos ou contexto nunca reapresentados no próprio enunciado.

**Exemplos reais corrigidos:** vários itens do caso 4 de cardiologia mencionavam "o paciente do
caso" ou pressupunham achados (uso de enalapril, cardiomiopatia dilatada) sem os reproduzir na
pergunta. `tosse-hemoptise-18` tinha explicação citando profissão do paciente ("pedreiro") nunca
mencionada no enunciado daquela questão específica — dado de **outra** questão do mesmo tema,
vazado por engano.

**Regra prática (Princípio 11 da Política Editorial):** todo dado clínico necessário para
responder precisa estar **no enunciado da própria questão**, com formulação independente
("Paciente com fração de ejeção reduzida em uso de enalapril..." — não "o paciente do caso").
`validar-banco.js` já pega os casos óbvios por regex ("caso de X", "conforme o tutorial") — mas
isso não pega dependência semântica (achado citado sem reapresentação, mesmo sem usar essas
palavras). Releitura humana de "essa pergunta faz sentido para alguém que nunca viu a fonte?"
continua necessária.

## 4. Explicação referenciando posição fixa (A/B/C/D/E) — quebra quando as alternativas são embaralhadas

**Sintoma (bug sistêmico, não só de item isolado):** a explicação diz "A é falsa porque...", "C é
falsa porque...", assumindo que a ordem de exibição é a mesma ordem do array `alternativas` no
banco. Mas `_shared/app.js` **embaralha a ordem de exibição por sessão** (`shuffledOrder`). O
usuário vê "C" na tela referindo-se a uma alternativa diferente da "C" do banco — a explicação
fica incompreensível ou, pior, parece contradizer o próprio gabarito.

**Exemplo real corrigido:** 18 das 24 questões de "Tosse Crônica e Hemoptise" tinham esse padrão.
Em `tosse-hemoptise-14` isso chegou a parecer uma contradição lógica grave (a explicação "chamava
de falsa" o texto que era, na verdade, o gabarito) — na really não havia erro de conteúdo, só a
referência por letra em vez de conteúdo.

**Regra prática — obrigatória para todo item novo:** a explicação **nunca** cita alternativas por
letra ou posição. Sempre parafraseia o conteúdo: em vez de "B é falsa porque X", escrever "a
alternativa que descreve X está errada porque...". Isso vale mesmo quando parece natural escrever
"a primeira opção" ou "a última alternativa" — a ordem de exibição não é confiável.

## 5. Alternativa correta desproporcionalmente mais longa/detalhada

**Sintoma:** o gabarito combina vários fatos ressalvados; os distratores são frases curtas e
isoladas. Dá pra acertar "chutando na maior".

**Exemplos reais corrigidos:** `tosse-hemoptise-15` (147→118 caracteres) e `tosse-hemoptise-21`
(174→123 caracteres, passou a ser a mais curta) tinham o gabarito nitidamente mais extenso que a
média dos distratores.

**Regra prática:** `montar-html.js` (`strictOptionBalance`) e `auditar-qualidade-itens.js` (regra
`correta_destaca_comprimento`) já detectam isso automaticamente — rode
`node auditar-qualidade-itens.js` depois de escrever itens novos e revise qualquer sinal
encontrado. Meta prática: gabarito não deve passar de ~1,25x o comprimento médio dos distratores.
Segundo o próprio usuário: como há 5 alternativas, a "alternativa mais longa = correta" não
deveria valer para mais de ~20% dos itens (o esperado pelo acaso) — se isso vira um padrão
perceptível ao longo de um banco inteiro, é sinal de viés sistemático de escrita, não só de item
isolado.

## 6. Dado inventado na explicação, ausente do enunciado

**Sintoma:** a explicação cita um achado, medicamento ou exame que nunca apareceu na pergunta
daquela questão específica — geralmente por contaminação de outra questão do mesmo lote/caso.

**Exemplo real corrigido:** `tosse-hemoptise-06` tinha uma versão de distrator/explicação
mencionando captopril, mas o enunciado daquela questão não citava esse medicamento (era de uma
questão irmã do mesmo tema). Corrigido substituindo por um distrator sustentado pelo próprio
enunciado ("bronquite crônica por tabagismo prévio").

**Regra prática:** ao revisar um item, releia pergunta + alternativas + explicação como um bloco
fechado — todo termo citado na explicação precisa ter origem rastreável na própria pergunta ou em
conhecimento médico geral, nunca em outra questão do lote.

## 7. Afirmação não sustentada apresentada como fato dado

**Sintoma:** o gabarito ou a explicação afirma um detalhe específico (localização anatômica,
mecanismo, número) como se fosse um achado estabelecido, sem que o enunciado ou a literatura
sustentem exatamente aquele grau de especificidade.

**Exemplo real corrigido:** `tosse-hemoptise-17` afirmava que a "opacidade expansiva única e
localizada" do caso era necessariamente "hilar/perihilar" — dado não sustentado pelo enunciado
nem citado como inferência. Corrigido explicitando que é uma inferência a partir de padrão clínico
(pneumonias recorrentes no mesmo território + associação entre tabagismo pesado e tumores mais
centrais), não um achado radiológico presumido como dado.

**Regra prática:** se um detalhe não está no enunciado nem é garantido pela literatura, ou (a)
remova a especificidade, ou (b) marque explicitamente como inferência e justifique o raciocínio
por trás dela — nunca apresente como fato bruto.

## 8. Material de aula/tutorial define escopo, não basta como referência única

Fora do escopo estrito de "defeito de item", mas é a instrução permanente do usuário sobre como
escrever questões novas a partir de material de aula:

> "Quando uso uma aula ou tutorial para fazer questões, o que estou delimitando é o escopo, não
> as referências. Por isso, sempre busque referenciar para melhor qualidade das questões."

**Regra prática:** o PDF/slide de aula (`fonte`, e o slug correspondente em `referencias`) decide
**o que** vai cair na questão — mas qualquer afirmação clínica, terapêutica, diagnóstica ou
quantitativa com literatura estabelecida deve ganhar **também** uma referência de literatura real
(diretriz, revisão, livro-texto), cadastrada em `fontes.json` com `fontesMeta` honesto sobre o que
foi de fato lido (texto integral vs. resumo/metadados por busca — nunca declarar leitura integral
que não ocorreu). Reuse referências já cadastradas e verificadas quando o conteúdo bater; só
cadastre uma nova quando necessário.

---

## Como usar este arquivo

- Antes de escrever itens novos a partir de um material de aula/tutorial novo, releia as 8 seções
  acima como checklist.
- Depois de escrever, rode `node auditar-qualidade-itens.js` (comprimento/absolutismo/meta-opção)
  e `node validar-banco.js` (estrutura + dependência implícita por regex) — nenhum dos dois
  substitui a releitura humana das seções 1, 2, 6 e 7 acima, que exigem julgamento clínico.
- Toda vez que uma revisão de qualidade (`_dados/melhorias de questões/`) apontar um defeito que
  não se encaixa em nenhuma seção existente, adicione uma seção nova aqui — mesmo que só tenha
  ocorrido uma vez até agora.
