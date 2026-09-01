# Arquitetura da SPA de Questões

## Decisão

`index.html` é o shell único do domínio. As rotas por hash carregam o banco, as fontes e as specs canônicas em tempo de execução. Questões não são copiadas para HTML ou JavaScript.

## Fontes de verdade

- `_banco/banco-questoes.json`: itens e classificação.
- `_banco/fontes.json`: referências.
- `_banco/correcoes.json`: correções editoriais.
- `_banco/specs/*.json`: definição das listas.
- `_dados/registros/*.json`: registros exportados pelo usuário.

`app/data.mjs` contém um port do filtro CommonJS de `_banco/selecionar.js`. O teste `tests/data.test.mjs` exige equivalência de IDs nas nove specs (não apenas numa amostra).

## Cobertura: todas as 393 questões acessíveis

O banco central tem **393 questões** em **10 temas**. Todas são acessíveis pela SPA por meio de dois tipos de sessão que coexistem:

1. **Listas curadas** (`_banco/specs/*.json`, `#/quiz/:specId`) — as nove specs originais, com título, descrição, ordem e recorte editorial próprios. Cobrem, pela união de seus ids (`coveredQuestionIds()` em `app/data.mjs`, nunca hardcoded), 170 questões em 4 temas. **Não foram alteradas, substituídas nem geradas automaticamente nesta etapa.**
2. **Sessões dinâmicas** (`#/sessao?...`) — construídas em runtime a partir da taxonomia (`classificacao.area/disciplina/tema/subtema/complexidade/competencia/contexto` + `tags`) de `app/taxonomy.mjs` e `app/dynamic-session.mjs`. Cobrem o banco inteiro, incluindo os 6 temas que antes só existiam no legado (Endoscopia Digestiva, Espirometria e Função Pulmonar, Hipertensão Arterial e SRAA, Insuficiência Cardíaca, Tosse Crônica e Hemoptise, Tumores do Sistema Nervoso Central). Nenhuma sessão dinâmica é gravada em `_banco/specs/` nem no banco canônico — o modelo de sessão (`{type, id, title, description, filter, size}`) vive só em memória, reconstruído a cada navegação a partir da URL.

A busca global do Início consulta as 393 questões do banco: para as que pertencem a alguma spec, oferece "Localizar no seletor" (inalterado); para as demais, oferece "Estudar este tema →", que abre `#/sessao?tema=<tema>&highlight=<qId>&tamanho=20` — a questão de origem é garantida na seleção (sem duplicá-la) e destacada visualmente (`.search-highlight` em `.question-card`) ao abrir a sessão. Não há mais resultado de busca sem ação.

## Contrato da rota `#/sessao`

Parâmetros aceitos (todos opcionais, exceto que ao menos algum filtro normalmente faz sentido): `area`, `disciplina`, `tema`, `subtema`, `complexidade`, `competencia`, `contexto`, `tag` (repetível), `tamanho` (`10`, `20`, `all`, ou inteiro positivo — padrão `all` se omitido), `highlight` (qId a priorizar/destacar). `app/dynamic-session.mjs` valida a forma da query antes de tocar no banco:

- parâmetro desconhecido → erro compreensível, nunca ignorado silenciosamente;
- parâmetro de valor único informado mais de uma vez → erro (só `tag` é repetível);
- valor de filtro sem correspondência na taxonomia (acento/caixa tolerados via `resolveTaxonomyValue`) → erro citando o valor recebido;
- `tamanho` fora de `10`/`20`/`all`/inteiro positivo → erro;
- filtro válido mas sem nenhuma questão correspondente → erro ("Nenhuma questão do banco corresponde aos filtros informados."), nunca uma sessão vazia silenciosa.

Todos esses erros chegam a `app/main.mjs` pela mesma rota de tratamento de erro de `#/quiz/:specId` (nada duplicado): a view lança, o router captura e renderiza `.route-state.error` com link de volta ao seletor.

**Seleção do subconjunto (documentado por ser uma decisão de produto, não só técnica):** os filtros determinam o conjunto elegível (`selectEligible`); o `tamanho` corta esse conjunto pegando as **N primeiras questões elegíveis na ordem canônica do banco** (`pickSessionSubset`) — determinístico, sem aleatoriedade e sem seed. Isso é o que garante que a URL seja copiável e que abrir o mesmo link em nova aba, depois de F5, ou voltar/avançar no histórico produza sempre a mesma seleção. O motor de quiz (`_shared/app.js`) continua sendo o único responsável por embaralhar a **ordem de exibição** a cada abertura da sessão — isso não muda a mesma seleção seguinte a um reload, só a ordem em que as questões aparecem dentro dela. Quando `highlight` aponta para uma questão elegível que ficaria fora do corte, ela é trocada para dentro do subconjunto (sem duplicar) para que a busca sempre entregue a questão de origem.

Quando o conjunto elegível é menor que o `tamanho` pedido, a sessão usa todas as elegíveis e mostra um aviso (`.bridge-note`) explicando a redução — nunca falha nem trunca silenciosamente.

## Contrato da rota `#/lista` (cápsulas de estudo)

Terceiro tipo de sessão, sem backend e sem login: uma **cápsula de estudo** é
uma lista de ids de questão escolhida à mão no seletor e compartilhada por
link (`#/lista?d=<payload>`). O payload (`app/capsule.mjs`) trafega só na
URL — nunca é gravado em `_banco/specs/` nem no banco canônico, o mesmo
princípio das sessões dinâmicas.

- `d` é um único parâmetro: JSON compacto (`{v, title, description,
  questionIds, mode, order, answerReveal}`) codificado em base64url
  (`encodeCapsulePayload`/`decodeCapsulePayload`). `v` é a versão do formato
  (hoje sempre `1`); `mode` é `"study"` ou `"exam"`; `order` é `"original"`
  (ordem de `questionIds`) ou `"shuffle"`; `answerReveal` é `"immediate"` ou
  `"end"`.
- `app/views/lista.mjs` decodifica o payload, resolve `questionIds` contra o
  banco atual (`resolveCapsuleQuestions`) e monta `quizData` com
  `toQuizData()` — mesmo caminho de `#/quiz/:specId` e `#/sessao`. Nenhuma
  renderização de quiz própria: `quizShellHtml` + `window.QuestoesApp.initQuiz`.
- Ids que não existem mais no banco (banco mudou desde que a cápsula foi
  criada) são reportados num aviso (`.bridge-note`), não escondidos — mas se
  **nenhum** id sobreviver, a rota lança erro compreensível, seguindo o
  mesmo princípio de "nunca sessão vazia em silêncio" de `#/sessao`.
- `order` e `answerReveal` são aditivos no motor de quiz (`_shared/app.js`):
  `quizData.order === "original"` faz `renderQuiz()` pular o embaralhar da
  ordem das questões (a ordem das alternativas continua sempre embaralhada);
  `quizData.answerReveal === "end"` adiciona a classe `reveal-pending` a
  `#quiz`, que só esconde visualmente a marcação de certo/errado e a
  explicação via CSS — a resposta continua sendo registrada normalmente por
  baixo. Um botão "Revelar respostas" (renderizado só nesse caso) remove a
  classe. HTMLs legados e sessões curadas/dinâmicas nunca definem esses
  campos, então mantêm o comportamento de sempre.
- O seletor (`app/views/seletor.mjs`) ganha um navegador de questões
  individuais ("Monte sua cápsula de estudo") com checkbox nativo por
  questão (acessível por teclado/leitor de tela sem ARIA extra), contador,
  "Compartilhar lista" (abre o modal "Criar cápsula de estudo") e "Limpar
  seleção". A seleção em andamento é persistida em `localStorage`
  (`readCapsuleSelection`/`writeCapsuleSelection`, `app/store.mjs`) só para
  sobreviver a um reload dentro do próprio seletor — não é o payload
  compartilhado.
- O modal oferece "Baixar cápsula" (baixa o mesmo payload como `.json`, sem
  precisar de link) além de "Copiar link"; o botão de copiar sempre informa
  sucesso ou falha por texto (não só cor), com um link de fallback quando a
  Clipboard API não está disponível.
- Além da seleção manual, o mesmo modal "Criar cápsula de estudo" é aberto já
  pré-preenchido a partir de três outras origens — nenhuma exige marcar
  questão por questão:
  - **"Compartilhar sessão"** (seção "Explorar o banco" do seletor, ao lado de
    "Iniciar sessão"): resolve o recorte atual (tema + filtros de "Refinar
    sessão" + tamanho escolhido) com o mesmo `selectEligible` +
    `pickSessionSubset` de `app/dynamic-session.mjs` usado por `#/sessao` —
    os ids gravados na cápsula são exatamente os que a sessão dinâmica abriria
    com aquele recorte. Título e descrição usam `buildDynamicSession()` (o
    mesmo texto que a própria sessão dinâmica usaria), com a contagem de
    questões visível na descrição; ambos continuam editáveis no modal.
    **Decisão de produto:** quando "Excluir questões já respondidas" está
    ativo, o botão compartilha o recorte já filtrado (as questões respondidas
    ficam de fora dos ids gravados) — o mesmo conjunto que "Iniciar sessão"
    abriria naquele momento para aquele usuário, não o recorte completo do
    tema. Quem abre o link recebe uma lista congelada sem esse filtro (a
    cápsula não conhece o histórico de quem a criou), então uma cápsula
    compartilhada com exclusão ativa pode ficar menor que o recorte "cru" do
    tema — isso é esperado, não um bug.
  - **"Compartilhar lista"** (ação discreta em cada card de lista curada,
    junto de "Iniciar →"): usa os ids e a ordem de `selecionarQuestoes(banco,
    spec)` da própria spec, com título/descrição pré-preenchidos a partir de
    `spec.tituloCartao/title` e `spec.resumo/description` — editáveis só na
    cápsula gerada, nunca gravados de volta na spec.
  - O navegador de questões individuais ("Compartilhar lista" dentro de
    "Monte sua cápsula de estudo") continua como estava: sem pré-preenchimento
    de título/descrição.
  Em todos os casos o payload é resolvido (ids exatos) no momento do clique,
  nunca guarda só os filtros esperando recálculo no destino — mesmo princípio
  de "lista congelada" já usado pela seleção manual. Um campo opcional e
  aditivo `source` (`{type: "dynamic"|"curated", ...}`) viaja no payload só
  para diagnóstico; `questionIds` continua sendo a única fonte de verdade
  (`normalizeCapsulePayload` valida a forma de `source` mas nunca o usa para
  recalcular a lista).

## Compatibilidade

`_shared/app.js` continua sendo usado pelos HTMLs gerados. A SPA usa a API aditiva `window.QuestoesApp`, com `initQuiz()` e `destroyQuiz()`. As chaves de `localStorage` não mudaram. `index-legado.html` preserva o índice anterior na raiz para manter caminhos relativos funcionais.

Tema e paleta salvos (`questoes-theme`, `questoes-palette`) são aplicados por `applyBootPreferences()` (`app/store.mjs`) antes de `router.start()` em `app/main.mjs`, para valer em qualquer rota — não só dentro de um quiz. O modo de visualização (`questoes-view`, foco/lista) continua sendo aplicado apenas pelo motor ao abrir um quiz, nunca no bootstrap do shell.

Caminhos de imagem do banco (`q.imagem`, relativo a `_banco/`) são resolvidos por `resolveImagePath()` em `app/data.mjs`, que prefixa `_banco/` sem duplicar quando o valor já vem prefixado e rejeita URLs externas/caminhos absolutos. A legenda (`imgAlt`) usa `q.imagemLegenda` como fonte canônica, com fallback para formatos legados. Isso vale igualmente para sessões curadas e dinâmicas — ambas passam pelo mesmo `toQuizData()`.

Um único motor de quiz (`window.QuestoesApp.initQuiz`/`destroyQuiz`) atende as duas sessões: `app/views/quiz-shell.mjs` fatora a marcação comum entre `app/views/quiz.mjs` (curada) e `app/views/sessao.mjs` (dinâmica), e ambas chamam o mesmo `initQuiz()`. Não existe um segundo motor.

**Formato do registro exportado (`_shared/app.js`, `saveRegistro`):** `toQuizData(spec, questions, fontesDocument, meta)` aceita um quarto parâmetro `meta` opcional (`{type: "curated"|"dynamic", filter, eligibleCount, includedCount}`), repassado como `quizData.sessionMeta`. `initQuiz()` guarda isso em `window.QUIZ_SESSION_META` e `saveRegistro()` grava, **só quando presente**, uma chave adicional `registro.session` com esse objeto. HTMLs legados nunca definem `sessionMeta`, então seus registros continuam com o formato exato de sempre — a mudança é aditiva, não uma migração de formato.

## Limitações deliberadas

- Desempenho e revisão ainda usam `_dados/dashboard.html` em iframe; o estado de aba/scroll do painel não é preservado ao navegar para fora e voltar (o iframe é recriado a cada troca de rota). Não há fragmento de URL para pré-selecionar aba: `_dados/dashboard.html` não tem suporte testado a isso.
- Não existe persistência automática de uma sessão de quiz; o fluxo de exportação continua igual ao legado — inclusive para sessões dinâmicas (reabrir a mesma URL reconstrói a sessão do zero, não retoma progresso).
- O port ESM do seletor é uma segunda implementação mantida em paridade por testes.
- `atualizar-index.js` continua preservado, mas não atualiza o novo shell, que calcula os cartões em runtime.
- A seleção de subconjunto de uma sessão dinâmica (`pickSessionSubset`) não pondera diversidade de subtema/complexidade — pega as N primeiras questões elegíveis na ordem do banco. Suficiente para tornar toda questão alcançável e a URL reproduzível; refinar a distribuição do corte é trabalho futuro, não coberto aqui.
- N4 (`_dados/dashboard.html`, cache malformado de registros) continua pendente — ver `_banco/DEBT.md`. Não foi tocado nesta etapa.

Nenhum HTML ou gerador legado foi removido.
