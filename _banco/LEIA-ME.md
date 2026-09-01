# Banco de Questões — como funciona

## Correções e derivados

O histórico legado permanece em `correcoes.json`. Novas correções entram no mesmo arquivo,
no array `corrections`, e seguem o contrato transversal validado pelo esquema e verificador de
`../../Organização/`. Quando uma questão muda de `versaoEditorial`, toda lista HTML que a
incorpora deve declarar essa versão em `derivatives[].basedOnVersion`; divergência indica
regeneração pendente. O HTML gerado também embute `itemVersion`, permitindo auditoria
direta do artefato.

> A governança editorial vigente está em `POLITICA-EDITORIAL.md`. Ela integra princípios
> pertinentes do ICMJE 2026, do NBME Item-Writing Guide e dos Standards for Educational
> and Psychological Testing. Estrutura válida não equivale a conteúdo clinicamente
> aprovado: consulte `estadoEditorial` e `auditoriaEditorial` de cada item.

A partir de agora, questões não nascem soltas dentro de um HTML. Elas vivem em `banco-questoes.json` (um repositório central), e cada lista publicada em `Questões/<área>/*.html` é uma **seleção montada a partir do banco**, gerada pelo script `gerar-lista.js`.

## Estrutura

```
_banco/
  banco-questoes.json    → o banco em si: todas as questões, com metadados
  fontes.json             → registro de citações (slug → referência completa), reutilizável entre temas
  POLITICA-EDITORIAL.md    → responsabilidade, IA, evidência, qualidade, equidade e correções
  correcoes.json           → histórico explícito de correções e atualizações por qId
  RELATORIO-GOVERNANCA.md  → painel textual gerado de estados e pendências editoriais
  RELATORIO-QUALIDADE-ITENS.md → triagem heurística NBME para revisão humana
  template-quiz.html      → motor genérico (CSS/JS) que qualquer lista usa — não editar questões aqui
  gerar-lista.js           → script Node que monta o HTML final a partir de banco + fontes + template
  exportar-para-prova.js   → como gerar-lista.js, mas para saída autocontida fora deste repositório (provas/)
  relatorio-cobertura.js   → gera RELATORIO-COBERTURA.md (volume/competência/complexidade/vínculo com provas por tema)
  specs/                   → um .json por lista já gerada (registro reprodutível do filtro/ids usado)
  LEIA-ME.md               → este arquivo
```

## Schema de uma questão no banco

```json
{
  "id": "endocardite-07",
  "tema": "Endocardite Infecciosa",
  "categoria": "Microbiologia",
  "tags": ["microbiologia"],
  "classificacao": {
    "area": "Medicina",
    "disciplina": "Infectologia",
    "disciplinasRelacionadas": ["Cardiologia", "Microbiologia"],
    "tema": "Endocardite Infecciosa",
    "subtema": "Microbiologia",
    "focos": [],
    "competencia": "Conhecimento fundamental",
    "complexidade": "Fundamental",
    "contexto": "Pergunta direta",
    "hierarquia": ["Medicina", "Infectologia", "Endocardite Infecciosa", "Microbiologia"]
  },
  "pergunta": "...",
  "imagem": "imagens/pneumologia/rx-derrame-pleural-menisco.png",
  "imagemLegenda": "Rx de tórax PA — legenda curta do que a imagem mostra",
  "alternativas": ["...", "...", "...", "...", "..."],
  "correta": 0,
  "explicacao": "...",
  "referencias": ["delgado2023-esc-endocardite"],
  "criadoEm": "2026-08-26",
  "fonte": "de onde veio o conteúdo (docx, tutorial, pesquisa ativa)"
}
```

Na versão 3, cada questão também possui `versaoEditorial`, `estadoEditorial`,
`auditoriaEditorial`, `proveniencia`, `evidencia` e `qualidadeDoItem`. Questões com imagem
possuem `imagemMeta`. Esses campos não devem ser marcados como verificados por migração
mecânica; a promoção para `aprovada` exige revisão humana conforme a política editorial.

- `imagem` e `imagemLegenda` são opcionais — só usar quando a questão depende de interpretar uma imagem (radiografia, ECG, etc). O caminho é relativo a `_banco/` (ex.: `imagens/<tema>/arquivo.png`); o gerador resolve automaticamente para `../_banco/<caminho>` no HTML final, já que toda lista fica em `Questões/<área>/`. Arquivos de imagem ficam em `_banco/imagens/<tema>/`.
- `referencias` usa **slugs** de `fontes.json`, não números fixos — a numeração `[1]`, `[2]`... é recalculada dinamicamente pelo motor do quiz, por ordem de primeira aparição dentro de cada lista gerada. Isso é o que permite misturar questões de temas diferentes numa mesma lista sem colidir numeração.
- `tags` existe para filtros mais finos que `categoria` (ex.: cruzar "endocardite" + "critérios diagnósticos" entre temas diferentes), mas por enquanto a maioria das questões só tem a própria categoria como tag — expandir conforme for útil.
- `classificacao` separa dimensões que antes estavam misturadas. `classificacao.hierarquia` guarda o caminho ordenado e pode ter profundidade variável; `focos`, `competencia`, `complexidade` e `contexto` são lentes independentes e combináveis.
- Exemplo farmacológico: `Medicina → Farmacologia → Antimicrobianos → Antibacterianos → Inibidores da síntese da parede celular → Betalactâmicos → Cefalosporinas`. Selecionar qualquer nó inclui todas as questões descendentes.
- `tema`/`categoria` continuam como campos canônicos legados e são espelhados em `classificacao.tema`/`classificacao.subtema` para não quebrar listas existentes.
- `classificacao.provaRefs` (opcional, array) vincula uma questão a um tópico de edital de `provas/`: `[{ "disciplina": "Agressão e Defesa I (RA3)", "edital": "provas/medicina/agressao-defesa.html", "topico": "Hemostasia e trombose" }]`. Só é preenchido quando a questão é de fato reaproveitada num simulado daquela disciplina — ver "Vínculo com provas/" abaixo. `validar-banco.js` valida a forma do campo quando presente, mas não exige que exista.
- Depois de adicionar ou alterar questões, rode `node estratificar-banco.js`. O script reclassifica o banco inteiro de forma idempotente; tema novo exige uma regra explícita em `POR_TEMA`, evitando classificação silenciosa ou improvisada.

## Princípio de elaboração: acerto por conhecimento positivo

O objetivo primário de cada questão é que o aluno chegue à resposta porque **reconhece ou recupera o conteúdo correto**, e não porque elimina alternativas frágeis. A eliminação pode ocorrer como consequência legítima do conhecimento, mas não pode ser o principal mecanismo de resolução criado pelo texto da questão.

Ao escrever ou revisar uma questão:

- Definir primeiro qual conhecimento específico está sendo testado e formular a resposta correta sem olhar para os distratores.
- Construir os distratores a partir de erros conceituais reais e próximos: condutas válidas em outro cenário, agentes semelhantes, critérios parcialmente trocados, doses ou tempos plausíveis, achados de diagnósticos diferenciais. Todos devem pertencer à mesma categoria lógica da resposta correta.
- Manter alternativas comparáveis em extensão, precisão, estrutura gramatical e grau de detalhe. A correta não pode se destacar por ser a única nuançada, completa, técnica ou longa.
- Evitar distratores descartáveis por linguagem absoluta ou caricatural (`sempre`, `nunca`, `exclusivamente`, `sem qualquer relação`, `contraindicado em todos os casos`), salvo quando o próprio conteúdo cobrado realmente depender de uma regra absoluta e as demais alternativas tiverem rigor equivalente.
- Evitar pistas independentes do conteúdo: incompatibilidade gramatical com o enunciado, repetição literal de termos apenas na correta, alternativas mutuamente inclusivas, pares de opostos que denunciam a resposta, ou quatro opções manifestamente absurdas ao lado de uma razoável.
- Preferir vinhetas, comparações ou perguntas diretas com informação suficiente para identificar positivamente a resposta. Não aumentar a dificuldade tornando o enunciado ambíguo ou os distratores capciosos.

### Teste obrigatório antes de publicar

1. **Teste da resposta coberta:** ler apenas o enunciado e tentar formular a resposta em texto livre. O conhecimento-alvo deve permitir chegar a ela antes de ver as opções.
2. **Teste dos distratores isolados:** para cada errada, registrar mentalmente por que um aluno com uma confusão plausível poderia escolhê-la. Se ela só estiver errada por absurdo, exagero verbal ou categoria incompatível, reescrevê-la.
3. **Teste de ocultação:** ocultar a alternativa correta e verificar se alguma pista formal ainda revela sua posição ou permite resolver o item sem dominar o conteúdo. Se sim, reescrever.
4. **Teste da explicação:** a justificativa deve explicar por que a correta é correta e qual é o erro conceitual de cada distrator, não apenas repetir o gabarito.

Uma questão falha nessa política se puder ser acertada de modo confiável por um aluno que não sabe formular a resposta, mas percebe que quatro opções são extremas, absurdas, vagas ou de outra categoria.

## Fluxo principal: sessões personalizadas

O índice não publica listas temáticas prontas. Toda sessão comum nasce em
`medicina/seletor.html`: o usuário percorre a hierarquia do banco, escolhe o recorte e
inicia uma sessão personalizada. O desempenho é persistido por `qId`, portanto continua
comparável mesmo que a mesma questão apareça em recortes diferentes.

Depois de editar `banco-questoes.json`, rode, nesta ordem:

```
node estratificar-banco.js
node gerar-seletor.js
node validar-banco.js
```

O seletor também oferece **Remover questões já feitas**. Para usar a opção, carregue a
pasta `_dados/registros/`; os `qId` encontrados nos registros válidos deixam de entrar na
sessão e nas contagens da hierarquia.

## Exportações fixas excepcionais

O gerador por spec permanece disponível para uma exportação deliberadamente fixa, como
um simulado ou material arquivado. Esses arquivos não viram temas nem cartões no índice.

1. **Consultar o banco** — ver quais questões já existem para o tema/categoria pedido (`banco-questoes.json`, filtrando por `tema`/`categoria`/`tags`).
2. **Avaliar cobertura** — se o que existe já cobre bem o pedido, usar direto. Se faltar algo relevante, escrever questões novas seguindo o mesmo padrão do banco (5 alternativas, acerto orientado por conhecimento positivo conforme a política acima, explicação com fonte) e **adicionar ao `banco-questoes.json`** (não só ao HTML de saída) — assim a próxima lista que tocar nesse assunto já herda a questão nova.
3. **Montar o spec** — um JSON pequeno dizendo quais questões entram (`ids` explícitos, para controle fino de ordem/curadoria) ou um `filtro`. Além dos campos antigos (`temas`/`categorias`/`tags`), o filtro aceita `areas`, `disciplinas`, `subtemas`, `focos`, `competencias`, `complexidades`, `contextos`, `nosHierarquicos` e `caminhoHierarquico`. `nosHierarquicos` encontra questões que contenham qualquer nó informado; `caminhoHierarquico` exige que o caminho comece exatamente pela sequência fornecida. Salvar em `specs/<nome-da-lista>.json`.
4. **Rodar o gerador:**
   ```
   node gerar-lista.js specs/<nome-da-lista>.json ../<área>/<nome-da-lista>.html
   ```
5. **Validar o resultado** sem publicar um cartão no índice.

## Exemplo de spec.json

```json
{
  "quizId": "endocardite-tratamento",
  "title": "Endocardite — Tratamento",
  "description": "Recorte só da parte terapêutica: empírico, dirigido por agente, POET e cirurgia.",
  "ordem": 4,
  "resumo": "esquemas por agente, POET, indicações e timing cirúrgico",
  "filtro": { "temas": ["Endocardite Infecciosa"], "categorias": ["Tratamento", "Cirurgia"] }
}
```

`ordem`, `resumo` e `tituloCartao` são metadados legados e não controlam mais o índice.
`area` é opcional (default `"medicina"`).

## Índice, registros e auditoria

`Questões/index.html` é uma entrada enxuta: encaminha para **Montar uma sessão** e para
**Desempenho e plano de estudo**. Ele não contém temas, listas prontas nem uma segunda
seção de progresso.

`atualizar-index.js` é intencionalmente um comando de proteção sem escrita: preserva esse
índice e não recria cartões a partir de specs.

Depois de uma sessão, salve o progresso em `_dados/registros/`. Cada resposta precisa ter
`qId`; é essa chave, e não o nome da lista ou `qIndex`, que alimenta o painel e a exclusão
de questões já feitas. As sugestões editoriais são salvas separadamente em
`_dados/melhorias de questões/`.

Para auditar os registros, rode:

```
node progresso.js
```

`progresso.js` apenas valida os arquivos, cruza seus `qId` com o banco e informa quantos
registros e questões únicas foram reconhecidos. Ele não gera specs, HTMLs de “feitas” ou
“não feitas” e não altera o índice.

O validador separa falhas de integridade (encerram com erro) de pendências editoriais
(avisos). Use `node validar-banco.js --verbose` para listar todas as pendências. Uma questão
`aprovada` falha na validação se não houver responsável humano, data de auditoria,
validação humana e todos os testes de qualidade marcados como verdadeiros.

Depois de uma migração ou auditoria editorial, rode `node relatorio-governanca.js` para
atualizar o resumo de estados, fontes, imagens e uso de IA.

Rode `node auditar-qualidade-itens.js` para localizar possíveis pistas formais,
enunciados negativos, alternativas meta, linguagem absoluta e explicações curtas. O
resultado é triagem: cada sinal precisa de julgamento humano antes de alterar o item.

Depois de cada sessão não é necessário gerar uma lista derivada. Basta manter o registro
na pasta correta; rode `node progresso.js` somente quando quiser uma auditoria local.

## Vínculo com provas/

`banco-questoes.json` é a fonte canônica de questões e simulados também fora de `Questões/` —
inclusive para o domínio `provas/` (`Estudos/Base de Estudos/provas/`, skill `prova`). Isso
evita que cada material de prova acumule seu próprio banco paralelo, como aconteceu antes com
`Biblioteca/Medicina/_anki/anki_hipertensao_sraa_anti-hipertensivos.json` (24 questões
persistentes fora de governança, auditadas e absorvidas no tema "Hipertensão Arterial e SRAA"
em 2026-08-28 — ver `provas/prova_estado.txt`).

**O que não muda:** o Modo Anki de `mecanismo/SKILL.md` (usado também por `prova`) continua
efêmero — `anki_[material].json` é triagem de sessão de estudo, não um banco de itens
permanente. Ele não deve voltar a crescer como repositório paralelo de questões reaproveitáveis.

**Promoção Anki → banco:** se uma sessão Modo Anki produzir uma questão de múltipla escolha boa
o suficiente para reaproveitar (ex.: entra num simulado, não só numa triagem pontual), ela é
promovida para `banco-questoes.json` com `id` novo, `estadoEditorial: "pendente_revisao_conteudo"`
(nunca `aprovada` por promoção mecânica) e `classificacao.provaRefs` apontando para a
disciplina/tópico de origem — em vez de deixá-la existir só dentro do `anki_[material].json`.

**Vínculo por tópico de edital:** `classificacao.provaRefs` (ver schema acima) é o mecanismo de
vinculação por `qId`. Hoje está vazio em todo o banco — nenhum dos 6 temas atuais (Endocardite,
Distúrbios de Sódio e Água, Antimicrobianos, HAS/SRAA, Radiografia de Tórax, Tosse/Hemoptise)
coincide com os editais já modelados em `provas/medicina/` (Agressão e Defesa I, Epidemiologia,
Pesquisa em Saúde 2, Semiologia). É preenchido caso a caso, não retroativamente — ver
`RELATORIO-COBERTURA.md`.

**Exportar um simulado para dentro de provas/:** `provas/` é um repositório git próprio
(GitHub Pages); `Questões/` não é. Por isso a saída não pode depender de caminho relativo
cruzando repositórios. Use `exportar-para-prova.js` em vez de `gerar-lista.js` quando o destino
for `provas/`:
```
node exportar-para-prova.js specs/<nome>.json "<caminho absoluto dentro de provas/.../simulado.html>"
```
O script copia as imagens usadas para `_assets/img/` ao lado do HTML de destino e embute os
dados no arquivo — a saída fica autocontida, sem depender de `Questões/_banco/` para renderizar.
Grava também `specs/<quizId>.export-prova.json` como registro reprodutível do que foi exportado
e para onde. `spec.provaRef` (opcional) avisa, sem bloquear, quando alguma questão selecionada
ainda não declara `classificacao.provaRefs` para aquela disciplina/tópico — sinal para promovê-la
depois de decidido que o vínculo é definitivo.

**Cobertura por tópico, competência e complexidade:** `node relatorio-cobertura.js` gera
`RELATORIO-COBERTURA.md` — por tema: volume, aprovadas vs. pendentes, distribuição por
competência e complexidade, e vínculos de prova declarados (quando existirem).

## Limitação conhecida

O painel de desempenho (`_dados/dashboard.html`) usa `qId` como identidade dentro de cada
quiz e registra a versão editorial nas novas sessões. Uma mesma questão ainda pode aparecer
separada entre dois `quizId` diferentes; falta uma visão global que agregue o mesmo `qId`
entre listas. Registros antigos sem `itemVersion`, alternativa escolhida ou texto da
alternativa continuam válidos, mas não permitem análise retrospectiva completa de
distratores ou comparação entre versões.
