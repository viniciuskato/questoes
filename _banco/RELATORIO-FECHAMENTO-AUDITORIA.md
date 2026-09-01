# Relatório de fechamento da auditoria — Banco de Questões

**Gerado em:** 2026-08-29
**Escopo:** aplicação das decisões editoriais/bibliográficas delimitadas sobre as 9+4 questões
de maior risco clínico de `Distúrbios de Sódio e Água` (etapa 3.3 do plano de auditoria),
consolidação das pendências restantes em filas fechadas, e encerramento da auditoria de
`Questões/`. Nenhuma nova busca clínica foi realizada nesta sessão — todas as decisões usam
exclusivamente evidência já lida e registrada em `MATRIZ-EVIDENCIA-SODIO-AGUA.md`.

---

## 1. Alterações bibliográficas feitas

3 fontes complementares novas, com dados bibliográficos confirmados por leitura direta
(WebFetch) já registrada em `MATRIZ-EVIDENCIA-SODIO-AGUA.md`, foram cadastradas em
`fontes.json` (texto de citação + `fontesMeta` completo: tipo, verificação, identificadores,
jurisdição, vigência, observações):

| Slug | Referência | Identificador | Tipo | Usada em |
|---|---|---|---|---|
| `spasovski2024-hiponatremia-tratamento-padrao` | Spasovski G. Hyponatraemia—treatment standard 2024. *NDT*. 2024;39(10):1583–1592. | DOI 10.1093/ndt/gfae162 | diretriz_consenso | `sodio-agua-09` |
| `statpearls2023-hipernatremia` | Sonani B, Al-Dhahir MA. Hypernatremia. StatPearls, atualizado 24 ago. 2023. | NCBI Bookshelf NBK441960 | revisao_narrativa | `sodio-agua-11` |
| `statpearls2024-avp-disorder-di` | Hui C, et al. Arginine Vasopressin Disorder (Diabetes Insipidus). StatPearls, atualizado 11 jan. 2024. | NCBI Bookshelf NBK470458 | revisao_narrativa | `sodio-agua-22`, `sodio-agua-23` |

Nenhum DOI, PMID ou identificador foi inventado. Onde o PMID não pôde ser confirmado
(`spasovski2024-hiponatremia-tratamento-padrao`), o campo foi simplesmente omitido em vez de
preenchido com um valor não verificado.

`sodio-agua-12` **não** recebeu fonte complementar: a matriz de evidência classificou a
correspondência com a candidata (StatPearls — Burn Fluid Resuscitation) como **indireta** (o
texto confirma cristaloide isotônico no grande queimado em geral, mas não discute
hipernatremia especificamente), e a instrução desta etapa foi adicionar fonte apenas quando a
correspondência for direta. Decisão registrada em `correcoes.json` (`questaoId: sodio-agua-12`,
`tipo: nota_editorial`, sem alteração de conteúdo).

A fonte de aula (`soares2026-sodio-agua`) foi preservada em `referencias[]` de todas as 5
questões editadas — nenhuma fonte complementar a substituiu.

## 2. Estado final de `sodio-agua-04`

- **Estado editorial:** `em_revisao` (preservado — não foi alterado).
- **Ação:** nenhuma alteração de enunciado, alternativas, gabarito ou explicação.
- **Registro:** `correcoes.json` recebeu uma entrada informativa (`tipo: nota_editorial`,
  `camposAlterados: []`) documentando o conflito entre os cortes percentuais da aula/questão e
  os do Manual MSD — mesmos rótulos de gravidade (leve/moderada/grave), limiares numéricos
  incompatíveis. Esta sessão **não decidiu** qual convenção está correta.
- **Bloqueio:** aprovação depende de confirmação humana, junto à disciplina de Nefrologia
  (material `soares2026-sodio-agua`), de qual convenção percentual é de fato a adotada. Listada
  na Fila 4 de `FILAS-REVISAO-EDITORIAL.md`.

## 3. Estado final de `sodio-agua-08`

- **Estado editorial:** alterado de `aprovada` para `requer_atualizacao`.
- **Validade do estado:** `requer_atualizacao` já é um estado válido em
  `POLITICA-EDITORIAL.md` ("nova evidência ou diretriz pode ter tornado o item desatualizado")
  e já era aceito pelo conjunto `estadosEditoriais` de `validar-banco.js` — nenhuma alteração de
  schema ou de código foi necessária.
- **Motivo:** `MATRIZ-EVIDENCIA-SODIO-AGUA.md` classificou a questão como
  `possivel_desatualizacao` — a conduta (restrição de água livre + furosemida) é válida e
  sustentada por Spasovski 2024 como conduta de segunda linha, mas o mesmo documento de 2024
  aponta tolvaptano como "treatment of choice" no cenário descrito.
- **Ação:** nenhum texto sobre tolvaptano foi acrescentado à questão; resposta, alternativas e
  explicação permanecem idênticas. Apenas o campo `estadoEditorial` mudou.
- **Registro:** `correcoes.json`, `questaoId: sodio-agua-08`, com `de`/`para` explícitos do
  campo alterado.

## 4. Tratamento de `sodio-agua-09`, `-11`, `-12`, `-22` e `-23`

| ID | Correspondência na matriz | Ação | Fonte adicionada |
|---|---|---|---|
| `sodio-agua-09` | Direta (SF 0,9% na hiponatremia hipovolêmica) | Fonte complementar adicionada | `spasovski2024-hiponatremia-tratamento-padrao` |
| `sodio-agua-11` | Direta (água livre + furosemida na hipernatremia hipervolêmica) | Fonte complementar adicionada | `statpearls2023-hipernatremia` |
| `sodio-agua-12` | Indireta (não discute hipernatremia especificamente) | **Nenhuma fonte adicionada** — decisão registrada | — |
| `sodio-agua-22` | Direta (diagnóstico de DI pós-hipofisário) | Fonte complementar adicionada | `statpearls2024-avp-disorder-di` |
| `sodio-agua-23` | Direta (desmopressina no DI central vs. nefrogênico) | Fonte complementar adicionada | `statpearls2024-avp-disorder-di` |

Em nenhuma das 5 questões foram alterados enunciado, alternativas, gabarito ou explicação.
Spasovski 2024 não foi associada a hipernatremia, diabetes insípido ou qualquer tema fora de
seu escopo (hiponatremia) — foi usada apenas em `sodio-agua-09`. Nenhuma fonte secundária foi
tratada como diretriz: os capítulos StatPearls foram cadastrados com `tipo: revisao_narrativa`,
não `diretriz_consenso`. Cada alteração foi registrada individualmente em `correcoes.json` com
motivo, referências e campos alterados.

## 5. Backlog de `sodio-agua-19` e `sodio-agua-20`

- Nenhuma busca nova foi realizada.
- Nenhum conteúdo ou referência foi alterado.
- Ambas as questões já reconhecem a controvérsia SCPS vs. SIHAD em sua própria explicação
  (correção anterior de `correcoes.json`, `2026-08-29`).
- Registrado em `FILAS-REVISAO-EDITORIAL.md`, Fila 5: existe lacuna documental conhecida — a
  fonte candidata de neurocrítica (StatPearls "Cerebral Salt Wasting", NBK534855) foi apenas
  localizada por busca na sessão anterior, não confirmada por leitura direta. Colocada no
  backlog editorial, não em fila de bloqueio.

## 6. Filas de revisão, IA e aprovação

Ver `FILAS-REVISAO-EDITORIAL.md` para o detalhamento completo (ID, tema, estado, motivo,
prioridade). Resumo:

| Fila | Contagem | Observação |
|---|---|---|
| 1. Sem `revisadoEm` | 154 | Inalterada por esta sessão |
| 2. IA não documentada | 38 | Inalterada por esta sessão |
| 3. Não aprovadas | **134** (era 133) | +1 por `sodio-agua-08` sair de `aprovada` |
| 4. Bloqueadas por fonte/evidência | 1 | `sodio-agua-04` |
| 5. Melhorias opcionais | 3 itens de backlog | AVP-D/AVP-R; busca de neurocrítica (19/20); fronteira de `sodio-agua-24` |

Nenhuma data de revisão foi preenchida, nenhuma revisão humana foi declarada sem ter ocorrido,
nenhum uso de IA foi declarado ou negado sem evidência, e nenhuma questão foi promovida a
`aprovada` para produzir essas filas. Nenhuma revisão individual das 154 questões da Fila 1 foi
aberta nesta sessão.

Adicionalmente, `sodio-agua-13`, `-15`, `-21` e `-24` foram avaliadas (triagem secundária já
registrada em `MATRIZ-EVIDENCIA-SODIO-AGUA.md`, Etapa 5) e permanecem **fora** de qualquer fila
de maior risco, sem alteração.

## 7. Arquivos alterados

| Arquivo | Tipo de alteração |
|---|---|
| `_banco/banco-questoes.json` | `estadoEditorial` de `sodio-agua-08`; `referencias[]` de `sodio-agua-09`, `-11`, `-22`, `-23`. Nenhum outro campo de nenhuma questão foi tocado (verificado por diff programático). |
| `_banco/fontes.json` | 3 novas entradas em `fontes` + `fontesMeta` (`spasovski2024-hiponatremia-tratamento-padrao`, `statpearls2023-hipernatremia`, `statpearls2024-avp-disorder-di`); nota de atualização acrescentada às observações de `spasovski2014-hiponatremia`. |
| `_banco/correcoes.json` | 7 novas entradas no array `correcoes` (`sodio-agua-04`, `-08`, `-09`, `-11`, `-12`, `-22`, `-23`). |
| `_banco/FILAS-REVISAO-EDITORIAL.md` | Novo. |
| `_banco/RELATORIO-FECHAMENTO-AUDITORIA.md` | Novo (este arquivo). |
| `_banco/RELATORIO-INTEGRIDADE.md` | Adendo de fechamento (seção nova ao final, histórico preservado). |
| `_banco/MATRIZ-EVIDENCIA-SODIO-AGUA.md` | Adendo de desfecho editorial (seção nova ao final, histórico preservado). |

Nenhuma imagem foi copiada ou alterada. Nenhum arquivo em `_archive/` (exceto o backup novo
desta sessão) foi tocado. Nada foi excluído, movido ou renomeado.

## 8. Backups

Backup datado criado **antes** de qualquer edição, contendo apenas os 3 JSON canônicos que
seriam editados:

```
_banco/_archive/backup-20260829-164915-fechamento-auditoria/
  banco-questoes.json
  fontes.json
  correcoes.json
  MANIFESTO-BACKUP.md
```

Nenhuma imagem foi copiada para o backup. Nenhum arquivo já arquivado foi alterado.

## 9. Testes e validadores

| Verificação | Resultado |
|---|---|
| `node --test tests/dashboard-analytics.test.js` | ✅ 3/3 passando |
| `node validar-banco.js` | ✅ Banco estruturalmente válido: 214 questões, 214 ids únicos. 150 pendências informativas (era 149 antes — +1 pelo novo estado `requer_atualizacao` de `sodio-agua-08`, um aviso esperado, não um erro) |
| `node verificar-consistencia-derivados.js` | ✅ 0 bloqueios, 0 pendências — nenhuma página HTML derivada ficou desatualizada, porque nenhuma `versaoEditorial` foi incrementada (só metadados de estado/referências mudaram, não `pergunta`/`alternativas`/`correta`/`explicacao`) |

Nenhum script de regeneração de derivados (`gerar-lista.js`, `atualizar-index.js`,
`gerar-seletor.js`) precisou ser executado, porque nenhuma alteração desta sessão muda o
conteúdo exibido nas listas HTML publicadas (`referencias[]` e `estadoEditorial` não são
renderizados nos quizzes; `versaoEditorial` não mudou).

## 10. Hashes SHA-256

| Arquivo | Antes (backup) | Depois (final desta sessão) |
|---|---|---|
| `banco-questoes.json` | `2653b2c9729107dfad35dc0da0d7739b75d0fc23bf345cb6b6932f8669c15aee` | `f14867186e59adc7ec7e20dcbfe0c39e620c055231ad6dd22821790ae27e0bb` |
| `fontes.json` | `e2057d4c391a61365362c90ca3a47c56527759102cfcff03287931fcb96f28b7` | `3561e5f0848ed12cc7e2b1333b4677b4b89b9eaffae17744b2176fc3057358d` |
| `correcoes.json` | `f7710db7da9df5fb734a78162d08f79fd699295284af7ede77ec051991391fc7` | `371b3aa7db2ab10daf8c91dbee3a228ba0f93ceafa8e00946ca73cbab3f094f` |

Os hashes "antes" são idênticos aos já registrados em `MATRIZ-EVIDENCIA-SODIO-AGUA.md` (Etapa
6) e no `MANIFESTO-BACKUP.md` desta sessão, confirmando que nada mudou nesses arquivos entre a
auditoria somente-leitura e o início desta sessão de edição.

## 11. Confirmação de que o conteúdo clínico permaneceu intacto

Verificação programática (não visual) comparando cada questão tocada, campo a campo, entre o
backup pré-edição e o arquivo final:

- `sodio-agua-04`: `pergunta`, `alternativas`, `correta`, `explicacao` — **idênticos**. Único
  campo tocado: nenhum no banco (só `correcoes.json`).
- `sodio-agua-08`: `pergunta`, `alternativas`, `correta`, `explicacao` — **idênticos**. Único
  campo alterado: `estadoEditorial`.
- `sodio-agua-09`, `-11`, `-22`, `-23`: `pergunta`, `alternativas`, `correta`, `explicacao` —
  **idênticos** em todas as quatro. Único campo alterado em cada uma: `referencias[]` (adição,
  sem remoção da fonte de aula).
- `sodio-agua-12`: **nenhum campo alterado** no banco.
- Diff completo do array `questoes` (214 itens) confirmou que **nenhuma outra questão** além
  das 5 listadas acima foi tocada em `banco-questoes.json`.
- Nenhuma imagem foi lida, copiada ou referenciada nesta sessão.

## Critério de encerramento — checklist final

- [x] Decisões 1–6 do escopo aplicadas ou justificadamente bloqueadas (`sodio-agua-04`
      permanece bloqueada por decisão humana pendente; as demais foram aplicadas).
- [x] Todas as pendências restantes estão em uma das 5 filas de `FILAS-REVISAO-EDITORIAL.md`
      (ou explicitamente marcadas como avaliadas e fora da fila de maior risco).
- [x] Nenhum conteúdo clínico (enunciado, alternativa, gabarito, explicação, imagem) foi
      modificado — confirmado por diff programático campo a campo.
- [x] `validar-banco.js`, `verificar-consistencia-derivados.js` e o teste automatizado passaram.

**A auditoria de `Questões/` está encerrada.** Nenhuma nova investigação, busca clínica ou
pacote de trabalho foi aberto nesta sessão; pendências adicionais identificadas ao longo do
processo (fontes `nao_verificavel_externamente`/`vaga_pendente` de outros temas, revisão
completa das 95 `em_revisao` e 38 `pendente_revisao_conteudo`, imagens de radiografia sem
`statusDireitos: verificado`) permanecem registradas como backlog em
`RELATORIO-INTEGRIDADE.md`, seção 13, e nas filas 1–3 de `FILAS-REVISAO-EDITORIAL.md`.
