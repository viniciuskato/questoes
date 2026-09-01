# Relatório de equivalência — piloto SPA

## Escopo

O piloto transforma `index.html` em shell de aplicação e mantém `index-legado.html`, `medicina/*.html`, templates e geradores como fallback.

## Cobertura (etapa concluída em 2026-08-31 — sessões dinâmicas)

- Banco central: **393 questões** em 10 temas — **todas acessíveis pela SPA**.
- Listas curadas (nove specs, união de ids — há specs sobrepostas como `endocardite`/`endocardite-feitas`/`endocardite-tratamento`): 170 questões em 4 temas (Antimicrobianos - fundamentos, Distúrbios de Sódio e Água, Endocardite Infecciosa, Radiografia de Tórax Básica). Intactas, não regeneradas.
- Sessões dinâmicas (`#/sessao?...`, `app/dynamic-session.mjs` + `app/taxonomy.mjs`): cobrem o banco inteiro, incluindo os 6 temas antes só alcançáveis pelo legado (Endoscopia Digestiva, Espirometria e Função Pulmonar, Hipertensão Arterial e SRAA, Insuficiência Cardíaca, Tosse Crônica e Hemoptise, Tumores do Sistema Nervoso Central).
- A busca global (Início) consulta as 393 questões: questões cobertas por spec abrem via "Localizar no seletor" (inalterado); as demais agora abrem via "Estudar este tema →", uma sessão dinâmica filtrada pelo tema da questão, com a questão de origem garantida e destacada. Não há mais resultado sem ação.
- As contagens da página Início (banco, percursos curados, temas exploráveis) continuam calculadas em runtime — nunca hardcoded.

## Equivalência estrutural

- `#/quiz/endocardite` usa a mesma spec `endocardite.json`.
- A seleção é feita contra o mesmo `banco-questoes.json`.
- O adaptador preserva ID, tema, categoria, pergunta, alternativas, resposta correta, explicação, referências, versão e estado editorial.
- O motor continua sendo `_shared/app.js`: resposta aberta/objetiva, certeza, estratégia, pontuação, revisão de qualidade, reinício, foco e exportação não foram reimplementados.
- A numeração das referências segue a primeira ocorrência na ordem canônica, como no HTML legado.

## Candidatos a arquivamento futuro — não remover agora

- `medicina/*.html`, após equivalência visual e funcional de todas as listas.
- `_banco/template-quiz.html` e `_banco/template-seletor.html`, apenas quando o fallback deixar de ser necessário.
- `_banco/atualizar-index.js`, cuja saída não é consumida pelo novo shell.

## Correções de estabilização (2026-08-31)

Encontradas em auditoria e corrigidas nesta rodada (ver `_banco/DEBT.md`, seção Resolvida):

- Imagem quebrada e legenda vazia em toda questão com `imagem` no banco (`app/data.mjs` não prefixava `_banco/` nem lia `imagemLegenda`).
- Tema escuro/paleta pré-sono salvos não eram aplicados fora do quiz (Início, Seletor, Preferências, Desempenho, Revisão ficavam sempre no tema claro até o usuário abrir um quiz ou reclicar numa preferência).
- Fragmento de URL morto `#prioridade` no iframe de Revisão (não correspondia a nenhum `id` real em `_dados/dashboard.html`).
- Checagem de contenção de caminho em `tools/serve.js` baseada em `startsWith`, vulnerável a diretório irmão com nome prefixado igual.
- Texto do Início afirmava dar acesso às 393 questões do banco quando só 170 eram alcançáveis pelas specs; busca global podia gerar link de destaque para questão sem lista na SPA (beco sem saída silencioso).

## Pendências de validação visual

Devem ser confirmados em navegador: cinco ciclos de navegação no quiz sem eventos duplicados; modos claro/escuro/pré-sono/foco (incluindo a aplicação imediata ao abrir diretamente em `#/inicio`, agora que o bootstrap aplica tema/paleta antes da primeira rota); questão com imagem (agora com caminho corrigido) e sua legenda; exportação; deep link com destaque (para questão coberta) e o estado "Ainda sem lista na SPA" (para questão não coberta); abertura de `#/revisao` sem o fragmento removido. Os testes automatizados cobrem dados, roteamento, armazenamento, bootstrap de preferências, resolução de caminho de imagem, contenção de caminho do servidor e analytics, mas não substituem essa verificação visual.

## Rodada de acabamento — homologação (2026-08-31)

Quatro achados da homologação (N1, N2, N3, N5) foram corrigidos nesta rodada; N4 foi apenas registrado (ver `_banco/DEBT.md`). Nenhuma spec nova foi criada, o dashboard legado não foi tocado, e os hashes de `_banco/banco-questoes.json`, `_banco/fontes.json` e `_banco/correcoes.json` permanecem idênticos ao início da rodada.

- **N1 — foco de rota escondido atrás do header sticky.** `root.focus()` foi trocado por `root.focus({preventScroll:true})` seguido de `root.scrollIntoView({block:"start", behavior: reduceMotion?"auto":"smooth"})` (`app/route-focus.mjs`, chamado por `app/main.mjs`). `.app-main` e seus títulos de rota ganharam `scroll-margin-top: var(--header-height)`, com a variável CSS sincronizada em runtime pelo tamanho real do `.app-header` (responsivo, inclusive quando o header empilha em telas estreitas). Sem atraso arbitrário. Confirmado geometricamente em 1440×900, 768×1024 e 390×844 (capturas em `#/seletor` e `#/preferencias`): o título da rota fica sempre visível abaixo do cabeçalho.
- **N2 — destaque de busca sem sinal visual.** O card do Seletor correspondente ao "Localizar no seletor" agora recebe a classe `.search-highlight` (outline + fundo sutil via `color-mix` com `--accent`/`--accent-soft`, portanto adaptado automaticamente a claro/escuro/pré-sono) e um badge textual "Localizado" (não depende só de cor). Uma região `aria-live="polite"` anuncia "Lista correspondente localizada: {título}." sem gerar rolagem extra. O destaque dura ~2,8s, respeita `prefers-reduced-motion` (sem transição) e é removido sem piscar. Corrigido durante a validação visual: como specs se sobrepõem (ex.: `endocardite` e `endocardite-feitas` cobrem a mesma questão), a primeira versão só geria um card via `querySelector` — o outro ficava destacado para sempre e o badge nunca sumia (estava fixo na marcação, não ligado à classe). Agora todos os cards correspondentes são geridos juntos (`querySelectorAll`), o badge é mostrado via CSS condicionado à classe `.search-highlight` no card pai, e digitar no filtro depois de chegar por deep link desativa o destaque (não reaparece a cada tecla). **O destaque é da lista (card do seletor), não da questão individual — diferente do legado**, que destaca a questão dentro do quiz; aqui não existe "dentro do quiz" para destacar nesta view.
- **N3 — filtro do Seletor sensível a acentos.** `app/search.mjs` agora exporta `normalizeSearchText()` (NFD + remoção de marcas combinantes + minúsculas, trata `null`/`undefined` como vazio) e `searchQuestions()` passou a usá-la. `app/views/seletor.mjs` importa a mesma função em `matchesFilter()`, aplicada tanto ao termo digitado quanto ao texto pesquisável das listas. "sodio", "sódio" e "SODIO" retornam os mesmos cards; "questoes"/"questões" e "endocardite" continuam equivalentes; filtro vazio mostra todas as listas.
- **N5 — campo de filtro sem nome acessível.** `#list-filter` ganhou `<label for="list-filter" class="visually-hidden">Filtrar listas, temas ou questões</label>`; o placeholder permanece como exemplo, mas não é mais a única fonte do nome acessível. Confirmado via dump do DOM renderizado (`chrome --headless --dump-dom`) que o `<label>` está associado ao campo.
- **N4 — registrado, não corrigido** (fora de escopo desta rodada): cache malformado em `questoes_dashboard_registros_v1` pode gerar `TypeError` em `_dados/dashboard.html`; ver `_banco/DEBT.md`.

Testes automatizados novos: `tests/search.test.mjs`, `tests/seletor-filter.test.mjs`, `tests/seletor-highlight.test.mjs`, `tests/route-focus.test.mjs`, `tests/seletor-a11y.test.mjs` (25 casos). Suíte completa: 63/63 passando. Validação visual manual feita com Chrome real em modo headless (navegação por hash, capturas de tela, dump do DOM) nos três breakpoints e nos temas claro/escuro/pré-sono; regressão checada em `#/quiz/radiografia-torax-basica` (imagem), `#/desempenho` (iframe do dashboard) e `index-legado.html`, sem erros novos de console.

## Sessões dinâmicas — cobertura completa do banco (2026-08-31)

Antes desta rodada, `node --test tests/*.mjs` reportava **60/60 casos passando** (a suíte cresceu desde a rodada de homologação anterior; o número 63 citado acima refere-se ao estado da suíte naquela rodada, não à contagem imediatamente anterior a esta). Hashes de `_banco/banco-questoes.json`, `_banco/fontes.json` e `_banco/correcoes.json` registrados antes de qualquer edição e conferidos como idênticos ao final: nenhum dos três arquivos canônicos foi tocado.

**O que foi adicionado**, sem alterar as nove specs nem gerar HTML/spec novos:

- `app/taxonomy.mjs` — árvore área→disciplina→tema→subtema com contagens, calculada em runtime a partir de `classificacao` nas 393 questões; resolução de valor de URL tolerante a acento/caixa (`resolveTaxonomyValue`).
- `app/dynamic-session.mjs` — validação da query de `#/sessao`, filtro contra a taxonomia, seleção do subconjunto (`pickSessionSubset`, determinístico, sem seed) e serialização de rota. Modelo de sessão único `{type, id, title, description, filter, size}`.
- `app/views/sessao.mjs` + `app/views/quiz-shell.mjs` — nova view de sessão dinâmica, compartilhando marcação e o mesmo `window.QuestoesApp.initQuiz`/`destroyQuiz` com `app/views/quiz.mjs` (refatorado para usar o shell comum, sem mudança de comportamento).
- `app/views/seletor.mjs` — nova seção "Explorar o banco" (dez botões de tema, `<details>` "Refinar sessão" com área/disciplina/subtema/complexidade/competência/contexto/tags, contagem ao vivo, tamanho 10/20/todas, "Iniciar sessão"). A seção "Percursos curados" e suas funções/marcação testadas (`matchesFilter`, `renderTopicCard`, `buildHighlightAnnouncement`, `#list-filter`) não foram alteradas.
- `app/views/inicio.mjs` — copy e contadores recalculados em runtime (393 questões, N percursos curados, 10 temas exploráveis, sem a distinção 170/223); busca global agora oferece "Estudar este tema →" para questões sem spec, em vez de texto sem ação.
- `app/data.mjs` (`toQuizData`) e `_shared/app.js` (`initQuiz`/`destroyQuiz`/`saveRegistro`) — parâmetro/campo `meta`/`sessionMeta`/`registro.session` opcional e aditivo, para distinguir sessão curada de dinâmica no registro exportado sem quebrar o formato legado (confirmado por teste: `quizData.sessionMeta` é `null` quando `toQuizData` é chamado sem o 4º argumento, como em todo HTML legado).
- CSS (`styles/app.css`): `.question-card.search-highlight` (mesma linguagem visual do destaque já existente em `.topic-card`, adaptada a claro/escuro/pré-sono e `prefers-reduced-motion`), `.active-filters`, `.explorer*`, `.size-choice`.

**Testes novos:** `tests/taxonomy.test.mjs`, `tests/dynamic-session.test.mjs`, `tests/sessao-view.test.mjs`, `tests/busca-temas-nao-cobertos.test.mjs`, mais casos adicionados a `tests/router.test.mjs` — 46 casos novos. Suíte completa depois desta rodada: **106/106 passando** (`node --test tests/*.mjs`).

**Validação visual** (Chrome real via CDP em modo headless, dirigindo cliques/teclado de verdade, não só dump-dom):

- os dez temas abrem sessão dinâmica funcional (confirmado individualmente para Endoscopia, Espirometria, Hipertensão, Insuficiência Cardíaca, Tosse/Hemoptise, Tumores do SNC — os seis antes só no legado — e os quatro já cobertos por spec);
- Radiografia de Tórax Básica com `tamanho=20` (18 disponíveis) reduz para 18 e mostra o aviso `.bridge-note`; questão com imagem renderiza `<img src="_banco/imagens/...">` com `alt` preenchido;
- fluxo completo no Seletor: clicar num tema → escolher tamanho → "Iniciar sessão" → quiz carregado com a contagem certa, sem erro de console;
- parâmetro desconhecido, tema inexistente e filtro sem resultado produzem tela de erro acessível com link de volta ao seletor — nunca tela em branco;
- busca global por termo de tema antes descoberto (ex.: "endoscopia") retorna "Estudar este tema →"; clicar abre a sessão com a questão de origem destacada (`.question-card.search-highlight`) e anunciada por região `aria-live`;
- determinismo confirmado: reload (`Page.navigate` duas vezes) na mesma URL de sessão retorna exatamente os mesmos ids, na mesma ordem de inclusão;
- voltar/avançar do histórico do navegador entre `#/inicio` e `#/sessao?...` preserva o hash e o título correto;
- cinco ciclos de entrar/sair de uma sessão dinâmica sem acumular erro de console;
- viewport 390×844 sem rolagem horizontal na página do Seletor; tema escuro + paleta pré-sono aplicados corretamente ao carregar `#/sessao?...` diretamente (bootstrap de preferências já testado, confirmado também nesta rota nova);
- navegação por teclado alcança o botão de tema via foco programático (compatível com Tab); `<details>`/`<summary>` nativo cobre o toggle de "Refinar sessão" sem JS extra;
- legado confirmado sem regressão: `index-legado.html`, `medicina/seletor.html`, `medicina/endocardite.html` e a rota `#/desempenho` (iframe do dashboard) continuam renderizando sem erro de console.

**Limitações que permanecem** (nenhuma delas é regressão desta rodada): N4 (`_dados/dashboard.html`, cache malformado) segue pendente, ver `_banco/DEBT.md`; `pickSessionSubset` não pondera diversidade de subtema/complexidade dentro do corte, só ordem canônica; não há persistência de progresso de uma sessão dinâmica entre reloads (igual ao comportamento já existente para sessões curadas).
