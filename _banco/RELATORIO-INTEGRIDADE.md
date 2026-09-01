# Relatório de integridade estrutural — Banco de Questões

**Gerado em:** 2026-08-29
**Escopo:** `Questões/` (nenhum arquivo fora dessa árvore foi alterado)
**Natureza:** auditoria estrutural/técnica. Nenhum enunciado, alternativa, gabarito ou
explicação clínica foi alterado, decidido ou corrigido nesta sessão — ver "Verificação" ao final.

## 1. Arquitetura do banco

```
Questões/
  index.html                 → índice público (gerado por partes, ver LEIA-ME.md)
  medicina/*.html             → listas publicadas (derivadas do banco via gerar-lista.js)
  tests/dashboard-analytics.test.js → teste automatizado (node:test)
  _dados/                      → registros de resposta, avaliações de qualidade, dashboard
  _banco/
    banco-questoes.json        → FONTE CANÔNICA (única) — 214 questões
    fontes.json                 → registro de citações (slug → citação + metadados editoriais)
    correcoes.json               → histórico de correções por qId (array `corrections`)
    POLITICA-EDITORIAL.md        → governança editorial vigente
    LEIA-ME.md                    → arquitetura e fluxo operacional
    template-quiz.html / template-seletor.html → motor genérico (não contém questões)
    gerar-lista.js, montar-html.js, selecionar.js, exportar-para-prova.js,
    estratificar-banco.js, atualizar-index.js, progresso.js,
    relatorio-governanca.js, relatorio-cobertura.js, auditar-qualidade-itens.js,
    aplicar-governanca-editorial.js, gerar-seletor.js → scripts de transformação/relatório
    validar-banco.js             → validador estrutural existente (roda antes desta auditoria)
    verificar-consistencia-derivados.js → validador NOVO desta sessão (ver seção 3)
    specs/*.json                 → um spec por lista gerada (registro reprodutível do filtro/ids)
    _archive/                    → backups e auditorias anteriores — não tocado
```

### Fonte canônica vs. derivados

Determinado por leitura do conteúdo e do fluxo declarado em `LEIA-ME.md`, não pelo nome do
arquivo:

- **Canônico:** `_banco/banco-questoes.json` (questões), `_banco/fontes.json` (citações),
  `_banco/correcoes.json` (histórico de correções).
- **Derivados (gerados a partir do canônico, nunca editados à mão):** `medicina/*.html`
  (via `gerar-lista.js`/`montar-html.js`), `medicina/seletor.html` (via `gerar-seletor.js`),
  `index.html` seções `AUTO:LISTAS`/`AUTO:PROGRESSO` (via `atualizar-index.js`/`progresso.js`),
  `_banco/RELATORIO-GOVERNANCA.md`, `_banco/RELATORIO-COBERTURA.md`,
  `_banco/RELATORIO-QUALIDADE-ITENS.md` (via os respectivos scripts `relatorio-*.js` /
  `auditar-qualidade-itens.js`).
- **Não canônico, mas legítimo (não é banco paralelo):** `_dados/melhorias de questões/*.json`
  guarda avaliações de qualidade (`good`/`needs-improvement`) exportadas dos quizzes, não
  cópias de questões; `_dados/registros/*.json` guarda respostas de sessões, referenciadas por
  `qId`.
- **`_archive/`** contém 4 pastas de auditorias datadas (`2026-08-29-auditoria-*`) e
  `_archive/2026-08-29-pre-governanca/` e `_archive/backup-20260829-073748/`, todos backups
  `.bak`/snapshots pré-migração. Não foram lidos como fonte de verdade e não foram alterados.

Nenhum banco paralelo foi encontrado dentro de `Questões/` (ver seção 3.5).

## 2. Quantidade de itens

- **214 questões** no banco canônico, **214 ids únicos** (sem duplicação).
- Taxonomia v2. `atualizadoEm` do banco não foi alterado por esta sessão.
- Distribuição por estado editorial: `aprovada` 81, `em_revisao` 95,
  `pendente_revisao_conteudo` 38.
- Distribuição por tema: Antimicrobianos - fundamentos 76, Endocardite Infecciosa 52,
  Hipertensão Arterial e SRAA 38, Distúrbios de Sódio e Água 24, Radiografia de Tórax Básica 18,
  Tosse Crônica e Hemoptise 6.
- 33 fontes cadastradas (27 `verificada`, 4 `nao_verificavel_externamente`, 2 `vaga_pendente`).
- 24 registros em `correcoes.json` (histórico legado + novas correções, todas apontando para
  ids existentes).
- 10 questões com imagem, todas com `imagemMeta` presente e `statusDireitos: pendente_verificacao`
  (nenhuma com status `verificado` ainda).

## 3. Resultado de cada validação

### 3.1 Validador existente (`validar-banco.js`)

Executado sem alterações no código. Resultado: **0 erros de integridade**, 149 pendências
editoriais informativas (avisos, esperados para itens ainda não `aprovada`). Cobre os itens
1–10 e 15 abaixo, já em produção antes desta sessão:

| # | Validação | Resultado |
|---|---|---|
| 1 | ID único e estável | ✅ 214/214 únicos; nenhuma correção aponta para id inexistente |
| 2 | Versão do item (`versaoEditorial`) | ✅ presente e inteira ≥1 em 214/214 |
| 3 | Estado editorial permitido | ✅ 214/214 dentro do conjunto de 6 estados válidos |
| 4 | Exatamente uma resposta correta | ✅ `correta` é índice inteiro único em todos os itens |
| 5 | Gabarito aponta para alternativa existente | ✅ 214/214 dentro do intervalo de `alternativas` |
| 6 | Alternativas/distratores não vazios | ✅ nenhuma alternativa vazia ou duplicada |
| 7 (parcial) | Metadados obrigatórios para `aprovada` | ✅ 81/81 aprovadas têm auditoria humana, validação humana e os 5 testes de qualidade `true` |
| 8 | Fonte rastreável | ✅ toda `referencias[]` aponta para slug existente em `fontes.json`, com `fontesMeta` |
| 15 | Bloqueio de publicação por metadados ausentes | ✅ nenhuma questão está `aprovada` sem os campos obrigatórios |

### 3.2 Validador novo (`verificar-consistencia-derivados.js`, modo relatório)

Criado nesta sessão para cobrir as lacunas 7 (TODO/placeholder), 11, 12, 13 e 14, que
`validar-banco.js` não cobria. Roda em modo relatório (nunca falha o processo, nunca altera o
banco) por instrução explícita da tarefa. Resultado desta execução: **0 bloqueios, 0
pendências.**

| # | Validação | Método | Resultado |
|---|---|---|---|
| 7 | Ausência de TODO/FIXME/placeholder em item liberado | Regex `\bTODO\b\|\bFIXME\b\|\bXXX\b\|\[PLACEHOLDER\]\|\bTBD\b` (maiúsculas, para não colidir com a palavra portuguesa "todo") sobre pergunta/alternativas/explicação | ✅ 0 ocorrências em 214 itens |
| 11 | Consistência banco ↔ exportações ↔ páginas | Compara cada `medicina/*.html` (dado embutido `quiz-data`) com o item correspondente no banco: id existe, pergunta, alternativas, gabarito e explicação idênticos | ✅ 9 páginas HTML verificadas, 0 divergências |
| 12 | Derivado não mais antigo que a fonte | Compara `itemVersion` embutido na página com `versaoEditorial` atual do item no banco | ✅ nenhuma página desatualizada |
| 13 | Detecção de bancos paralelos | Varre toda a árvore `Questões/` (exceto `_archive`) por `.json` com os campos `"alternativas"` e `"correta"` simultâneos, fora do canônico | ✅ nenhum encontrado |
| 14 | Migração mecânica não pode virar `aprovada` | Cruza `auditoriaEditorial.status === "migrada_sem_auditoria_integrada"` (ou `auditadoEm` ausente) com `estadoEditorial === "aprovada"` | ✅ 0 casos — as 38 questões migradas mecanicamente estão todas em `pendente_revisao_conteudo` |
| 9 (informativo) | Data de revisão humana | Contagem de `revisadoEm` ausente | ℹ️ 154/214 sem `revisadoEm` (compatível com 95 `em_revisao` + 38 `pendente_revisao_conteudo` + parte das aprovadas que usam só `auditoriaEditorial.auditadoEm`) — nenhuma inferência de data foi feita |
| 10 (informativo) | Declaração de IA ou `declaracao_pendente` | `proveniencia.usoDeIA` sempre presente | ℹ️ 176 itens com finalidade de IA declarada; 38 itens legados com `nao_documentado` (nenhuma declaração foi presumida) |

### 3.3 Testes automatizados

`node --test tests/dashboard-analytics.test.js` → **3/3 passando**, sem alterações no código
de teste ou no `_dados/dashboard-analytics.js`.

(Observação técnica sem impacto no resultado: `node --test tests/` falha ao tentar resolver o
diretório como módulo neste ambiente Windows/Node 24, por causa do caractere acentuado no
caminho `Questões`; rodar o arquivo de teste explicitamente contorna isso. Não é um problema do
banco nem foi alterado nada para "fazer passar".)

### 3.4 Imagens

10 questões com imagem, todas com `imagemMeta` estruturado; nenhuma ainda com
`statusDireitos: verificado` — todas aguardam conferência de origem/licença/privacidade
(`rxtorax-02` a `rxtorax-11`), como já registrado em `RELATORIO-GOVERNANCA.md`.

## 4. Itens bloqueados

Nenhum item está bloqueado por violação de integridade estrutural — 0 erros no validador
existente e 0 bloqueios no validador novo. "Bloqueio" aqui só ocorreria se: um item `aprovada`
tivesse metadados obrigatórios ausentes, um item `aprovada` tivesse marcador TODO/placeholder,
ou um item `aprovada` viesse de migração mecânica sem auditoria — nenhum dos três ocorre hoje.

## 5. Divergências banco–exportação–página

Nenhuma. As 9 páginas em `medicina/*.html` (76+24+24+10+52+19+12+52+18 perguntas conferidas)
refletem exatamente o conteúdo e a `versaoEditorial` atual do banco. Os 9 specs em `_banco/specs/`
que usam `ids` explícitos referenciam apenas ids existentes.

## 6. Placeholders

Nenhum placeholder de conteúdo (TODO/FIXME/[PLACEHOLDER]/TBD) encontrado em pergunta,
alternativas ou explicação de qualquer questão. O único uso da palavra "placeholder" no banco é
o atributo HTML `placeholder="Digite aqui tudo o que você lembra..."` em `template-quiz.html` e
`template-seletor.html` — é texto de instrução de UI (campo de resposta livre para
autoavaliação), não um marcador de trabalho inacabado; sinalizado por um achado do auditor
transversal genérico (`RELATORIO-AUDITORIA-TRANSVERSAL.md`, categoria "manutenção técnica") como
falso positivo específico deste banco, junto com outras 4 ocorrências da palavra portuguesa
"todo" (em "durante todo o tratamento", "vazio em todo o banco" etc.) equivocadamente casadas
pelo padrão genérico `TODO`. Nenhuma ação de código foi necessária aqui além de já usar
marcadores em maiúsculas no validador novo, que não sofre desse falso positivo.

## 7. Fontes ausentes

Nenhuma referência (`referencias[]`) aponta para slug inexistente em `fontes.json` — 100% das
33 fontes citadas por questões têm `fontesMeta`. 6 fontes seguem com verificação editorial
pendente (4 `nao_verificavel_externamente`, 2 `vaga_pendente`) — nenhuma foi inventada ou
promovida para `verificada` por esta sessão.

## 8. Estados editoriais ausentes

Nenhum. 214/214 questões têm `estadoEditorial` dentro do conjunto válido definido em
`POLITICA-EDITORIAL.md`.

## 9. Revisões ausentes

154/214 questões sem `revisadoEm` (campo legado, distinto de `auditoriaEditorial.auditadoEm`).
Nenhuma data foi inferida ou preenchida — permanece como pendência para revisão humana futura,
já visível em `RELATORIO-GOVERNANCA.md`.

## 10. Declarações de IA pendentes

Nenhuma questão está sem `proveniencia.usoDeIA`. 38 questões legadas (as mesmas migradas
mecanicamente, todas em `pendente_revisao_conteudo`) têm `nao_documentado` — valor honesto de
"não sei", não uma declaração presumida, conforme exigido pela política editorial.

## 11. Possíveis bancos paralelos

Nenhum encontrado dentro de `Questões/` fora do banco canônico e dos backups já arquivados em
`_archive/`. A varredura (`verificar-consistencia-derivados.js`, seção 3.5 do script) cobre toda
a árvore exceto `_archive/`. Nota histórica (não é um achado novo, já documentada em
`LEIA-ME.md`): um banco paralelo fora de `Questões/`
(`Biblioteca/Medicina/_anki/anki_hipertensao_sraa_anti-hipertensivos.json`, 24 questões) já foi
identificado e absorvido em 2026-08-28, antes desta sessão — fora do escopo desta auditoria por
estar fora de `Questões/`.

## 12. Falsos positivos encontrados (nesta sessão)

- Nenhum falso positivo novo do validador existente ou do validador novo — ambos rodaram limpo.
- Confirmado (não corrigido, por estar fora do escopo desta sessão e do próprio auditor
  transversal): os achados de "TODO/FIXME/placeholder" listados em
  `RELATORIO-AUDITORIA-TRANSVERSAL.md` para arquivos dentro de `Questões/_banco/` (linhas
  referentes a `LEIA-ME.md`, `progresso.js`, `template-quiz.html`, `template-seletor.html`,
  `banco-questoes.json`, `correcoes.json` e as cópias correspondentes em `_archive/`) são, sem
  exceção, ocorrências da palavra portuguesa "todo"/"Todo" ou do atributo HTML `placeholder`
  legítimo — não há nenhum marcador de trabalho inacabado real nesses arquivos. O validador novo
  desta sessão (`verificar-consistencia-derivados.js`) usa um padrão que exige maiúsculas e não
  reproduz esse falso positivo.

## 13. Ações recomendadas (ordem de risco, conforme `PADRAO-INTEGRIDADE-CIENTIFICA-E-EDUCACIONAL.md`)

1. **Decisão terapêutica/diagnóstico:** revisar clinicamente as 95 questões `em_revisao` e as
   38 `pendente_revisao_conteudo`, priorizando as de maior peso terapêutico
   (Antimicrobianos, Endocardite — Tratamento/Cirurgia). Fora do escopo desta sessão por
   instrução explícita ("não corrigir conteúdo clínico", "não decidir qual alternativa é
   correta").
2. **Imagens clínicas:** conferir origem/licença/identificabilidade das 10 imagens de
   radiografia de tórax (`rxtorax-02`…`rxtorax-11`) e promover `statusDireitos` para
   `verificado` caso a conferência confirme.
3. **Fontes pendentes:** resolver as 6 fontes `nao_verificavel_externamente`/`vaga_pendente`
   antes de aprovar qualquer questão que dependa delas como referência central.
4. **Revisão humana ausente:** preencher `revisadoEm` nas 154 questões que ainda não têm essa
   data, como parte do fluxo normal de revisão (não retroativamente/adivinhado).
5. **Uso de IA não documentado:** ao revisar as 38 questões migradas mecanicamente, declarar
   finalidade real do uso de IA (ou confirmar que não houve) em vez de manter
   `nao_documentado` indefinidamente.
6. **Manutenção técnica (baixo risco):** considerar rodar `node verificar-consistencia-derivados.js`
   como parte do fluxo já documentado em `LEIA-ME.md` (após `estratificar-banco.js` →
   `gerar-seletor.js` → `validar-banco.js`), para pegar cedo qualquer página desatualizada ou
   banco paralelo antes que cresça.

## Limitações desta auditoria

- "ID estável" (item 1) foi verificado apenas por ausência de duplicação e por
  `correcoes.json` sempre apontar para ids existentes; não há histórico de Git em `Questões/`
  (`git status`/`git diff` não se aplicam — confirmado: não é repositório Git) para provar que
  nenhum id já foi reaproveitado no passado.
- Datas de `criadoEm`/`revisadoEm`/`auditadoEm` foram apenas lidas e contadas, nunca inferidas
  ou usadas como prova de revisão — conforme instrução.
- Esta sessão não avaliou a qualidade clínica, a plausibilidade dos distratores ou a
  correção do gabarito de nenhuma questão — isso é revisão editorial/clínica, fora do escopo.

## Adendo — fechamento da auditoria (2026-08-29, etapa 3.3)

Este adendo registra o desfecho editorial aplicado após esta auditoria de integridade
estrutural, sem apagar nada do relatório acima. Detalhamento completo em
`RELATORIO-FECHAMENTO-AUDITORIA.md` e `FILAS-REVISAO-EDITORIAL.md`.

- As decisões editoriais/bibliográficas delimitadas para as 9 questões de maior risco de
  `Distúrbios de Sódio e Água` (`MATRIZ-EVIDENCIA-SODIO-AGUA.md`) foram aplicadas: 3 fontes
  complementares cadastradas em `fontes.json` (`spasovski2024-hiponatremia-tratamento-padrao`,
  `statpearls2023-hipernatremia`, `statpearls2024-avp-disorder-di`), acrescentadas a
  `referencias[]` de `sodio-agua-09`, `-11`, `-22` e `-23`; `sodio-agua-08` mudou de `aprovada`
  para `requer_atualizacao`; `sodio-agua-04` permanece `em_revisao` com o conflito de fonte
  (aula vs. Manual MSD) registrado em `correcoes.json`, sem decisão sobre qual convenção é
  correta.
- A distribuição por estado editorial da seção 2 acima (`aprovada` 81, `em_revisao` 95,
  `pendente_revisao_conteudo` 38) está **desatualizada após este adendo**: com a saída de
  `sodio-agua-08` de `aprovada`, o total é agora `aprovada` 80, `em_revisao` 95,
  `requer_atualizacao` 1, `pendente_revisao_conteudo` 38 (214 questões, inalterado).
- `node validar-banco.js` e `node verificar-consistencia-derivados.js` foram reexecutados após
  as edições e continuam sem erros de integridade (150 pendências informativas, era 149 — o
  aumento de 1 é o novo estado `requer_atualizacao`, um aviso esperado).
- As 154 questões sem `revisadoEm`, as 38 com IA `nao_documentado` e as (agora 134) não
  `aprovada` foram organizadas em filas fechadas em `FILAS-REVISAO-EDITORIAL.md`, sem que
  nenhuma revisão individual tenha sido aberta nesta sessão.
- Nenhuma das ações recomendadas na seção 13 acima foi executada além do recorte explicitamente
  delimitado nesta etapa — seguem como backlog.
