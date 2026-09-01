# Filas de revisão editorial — fechamento da auditoria de `Questões`

**Gerado em:** 2026-08-29
**Natureza:** consolidação em filas fechadas das pendências editoriais existentes no banco após
a etapa 3.3 (aplicação das decisões delimitadas em `MATRIZ-EVIDENCIA-SODIO-AGUA.md`). Nenhuma
data de revisão foi preenchida, nenhuma revisão humana foi declarada, nenhum uso de IA foi
declarado ou negado sem evidência, e nenhuma questão foi promovida a `aprovada` para gerar
estas filas — os números vêm de uma leitura direta de `banco-questoes.json` após as edições
desta sessão.

**Critério de prioridade:** ordem de risco de `PADRAO-INTEGRIDADE-CIENTIFICA-E-EDUCACIONAL.md`
(decisão terapêutica/diagnóstico/dose/urgência > dados de paciente/imagem > números/limiares/
diretriz > itens avaliativos > mecanismo estável > formatação), aplicada por tema/grupo, não
por questão individual — dentro de um mesmo tema todas as questões do grupo herdam a mesma
prioridade, salvo quando indicado.

---

## Fila 1 — questões sem `revisadoEm` (154)

Campo legado, distinto de `auditoriaEditorial.auditadoEm`. Nenhuma data foi inferida ou
preenchida nesta sessão.

| Tema | Qtde | IDs | Estado atual predominante | Motivo | Prioridade |
|---|---|---|---|---|---|
| Antimicrobianos - fundamentos | 76 | `antimicrobianos-001` … `antimicrobianos-076` | `em_revisao` | Revisão clínica de terapêutica antimicrobiana ainda não concluída com data registrada | **Alta** (decisão terapêutica) |
| Hipertensão Arterial e SRAA | 38 | `hipertensao-01` … `hipertensao-38` | `pendente_revisao_conteudo` | Migração mecânica sem auditoria de conteúdo ainda registrada | **Alta** (decisão terapêutica) |
| Distúrbios de Sódio e Água | 24 | `sodio-agua-01` … `sodio-agua-24` | 22 `em_revisao`/`requer_atualizacao` + 2 `aprovada` (`sodio-agua-05`, `-06`, `-07`, etc. têm campo próprio; ver banco) | `revisadoEm` legado nunca foi preenchido para o tema, mesmo nas já aprovadas por auditoria integrada | Média (parte já tem `auditoriaEditorial.auditadoEm`) |
| Radiografia de Tórax Básica | 18 | `rxtorax-01` … `rxtorax-18` | `em_revisao` | Imagens ainda com `statusDireitos: pendente_verificacao`; conteúdo pendente | **Alta** (imagem clínica) |
| Endocardite Infecciosa | 10 | `endocardite-43` … `endocardite-52` | variado | Bloco final do tema ainda sem `revisadoEm` | Média |
| Tosse Crônica e Hemoptise | 6 | `tosse-hemoptise-01` … `tosse-hemoptise-06` | variado | Tema pequeno, revisão pendente | Média-baixa |

Total: **154**, confirmado por leitura de `banco-questoes.json` após as edições desta sessão
(inalterado em relação ao levantamento de `RELATORIO-INTEGRIDADE.md`, seção 9 — as edições
desta etapa não tocaram `revisadoEm` em nenhuma questão).

## Fila 2 — questões com uso de IA `nao_documentado` (38)

Todas no mesmo grupo: itens legados migrados mecanicamente, com `nao_documentado` como valor
honesto de "não sei" (não presumido), conforme exigido pela Política Editorial.

| Tema | Qtde | IDs | Estado atual | Motivo | Prioridade |
|---|---|---|---|---|---|
| Hipertensão Arterial e SRAA | 38 | `hipertensao-01` … `hipertensao-38` | `pendente_revisao_conteudo` | Migração mecânica anterior a este banco declarativo; finalidade real de eventual uso de IA nunca foi registrada | **Alta** (mesmo grupo da Fila 1, decisão terapêutica) |

Total: **38**, inalterado em relação a `RELATORIO-INTEGRIDADE.md`, seção 10.

## Fila 3 — questões ainda não `aprovada` (134)

Antes desta sessão: 133 (`RELATORIO-INTEGRIDADE.md`, seção 2). Após a etapa 3.3: **134** — a
diferença é exclusivamente `sodio-agua-08`, que saiu de `aprovada` para `requer_atualizacao`
por decisão explícita desta sessão (ver `correcoes.json`, `questaoId: sodio-agua-08`). Nenhuma
questão foi promovida a `aprovada`.

| Tema | Estado | Qtde | IDs | Motivo | Prioridade |
|---|---|---|---|---|---|
| Antimicrobianos - fundamentos | `em_revisao` | 76 | `antimicrobianos-001` … `antimicrobianos-076` | Revisão clínica em andamento, sem conclusão registrada | **Alta** |
| Hipertensão Arterial e SRAA | `pendente_revisao_conteudo` | 38 | `hipertensao-01` … `hipertensao-38` | Estrutura válida, conteúdo ainda não auditado pelo padrão integrado | **Alta** |
| Radiografia de Tórax Básica | `em_revisao` | 18 | `rxtorax-01` … `rxtorax-18` | Imagens sem `statusDireitos: verificado` | **Alta** (imagem) |
| Distúrbios de Sódio e Água | `em_revisao` | 1 | `sodio-agua-04` | Conflito de fonte não resolvido (aula vs. Manual MSD) — ver Fila 4 | **Alta** |
| Distúrbios de Sódio e Água | `requer_atualizacao` | 1 | `sodio-agua-08` | Possível desatualização terapêutica (tolvaptano, Spasovski 2024) — decisão desta sessão | Média |

Total conferido: 76+38+18+1+1 = **134**.

## Fila 4 — questões bloqueadas por fonte/evidência

| ID | Tema | Estado atual | Motivo | Prioridade |
|---|---|---|---|---|
| `sodio-agua-04` | Distúrbios de Sódio e Água | `em_revisao` | Conflito ativo e não resolvido entre os cortes percentuais de gravidade da depleção do VEC da aula/questão (leve <5%, moderada 10–30%, grave >30%) e os do Manual MSD (leve <5%, moderada 5–10%, grave >10%) — mesmos rótulos, limiares diferentes. Aprovação bloqueada até confirmação humana da convenção adotada pela disciplina. | **Alta** |

Nenhuma outra questão do escopo desta auditoria (04, 08, 09, 11, 12, 19, 20, 22, 23, 13, 15, 21,
24) foi classificada como bloqueada por fonte/evidência — `sodio-agua-08` foi tratado como
desatualização (Fila 3), não como bloqueio de fonte.

*Nota transversal (fora do escopo de decisão desta sessão, apenas registrada):* 6 fontes no
banco inteiro seguem com verificação pendente (`nao_verificavel_externamente`: 
`souza2026-aula-radiografia-torax-basica`, `soares2026-sodio-agua`, `aulas2026-antimicrobianos`,
`guia2026-antimicrobianos`; `vaga_pendente`: `guytonhall-fisiologia-medica`,
`katzung-farmacologia-basica-clinica`), conforme `RELATORIO-INTEGRIDADE.md`, seção 7. A
Política Editorial já proíbe aprovar qualquer questão cuja fonte central dependa delas sem
conferência — isso não gera uma fila nova aqui, é a mesma regra geral já em vigor.

## Fila 5 — melhorias opcionais (backlog)

| Item | Questões afetadas | Descrição | Classificação | Prioridade |
|---|---|---|---|---|
| Terminologia AVP-D/AVP-R | `sodio-agua-13`, `-21`, `-22`, `-23` | Desde 2022, sociedades de endocrinologia propõem renomear diabetes insípido central/nefrogênico para "arginine vasopressin deficiency/resistance" (AVP-D/AVP-R). A nomenclatura clássica usada nas questões continua amplamente aceita e não está errada. | Melhoria terminológica opcional — **não é erro nem bloqueio** | Baixa |
| Busca de fonte de neurocrítica para SCPS/SIHAD | `sodio-agua-19`, `-20` | A controvérsia sobre a distinção entre síndrome cerebral perdedora de sal e SIHAD após HSA já está reconhecida na explicação de ambas as questões; existe lacuna documental (nenhuma fonte de neurocrítica foi lida diretamente até o momento — a StatPearls "Cerebral Salt Wasting" foi apenas localizada por busca, não confirmada por leitura direta). Sem nova busca nesta sessão, por instrução explícita. | Backlog de busca (não é bloqueio, o item já é transparente sobre a controvérsia) | Média |
| Revisão de fronteira de `sodio-agua-24` | `sodio-agua-24` | `MATRIZ-EVIDENCIA-SODIO-AGUA.md`, Etapa 5, identificou esta questão como a mais próxima da fronteira de risco (algoritmo diagnóstico comparativo SIHAD/SCPS/DI), mas decidiu mantê-la fora da fila de maior risco por não ter um paciente descrito nem pedir conduta. Registrado como candidata a reavaliação futura, se um critério mais conservador for adotado. | Consideração de reclassificação, não uma pendência ativa | Baixa |

## Questões avaliadas e mantidas sem alteração (fora das 5 filas)

Por instrução explícita da etapa 3.3, as questões abaixo foram avaliadas na auditoria de maior
risco e permaneceram **fora** da fila de maior risco, sem qualquer alteração nesta sessão:

| ID | Motivo da triagem |
|---|---|
| `sodio-agua-13` | Classificação etiológica genérica (DI causa hipernatremia por perda de água) — sem caso clínico decisório, sem valor numérico, sem pedido de conduta |
| `sodio-agua-15` | Recall de lista fechada de etiologias de SIHAD — sem caso, sem número, sem conduta |
| `sodio-agua-21` | Comparação mecanística DI central vs. nefrogênico — sem paciente, sem número, sem conduta |
| `sodio-agua-24` | Quadro comparativo SIHAD/SCPS/DI genérico — mais próxima da fronteira, mas mantida fora da fila (ver Fila 5) |

## Resumo numérico

| Fila | Contagem |
|---|---|
| 1. Sem `revisadoEm` | 154 |
| 2. IA não documentada | 38 |
| 3. Não aprovadas | 134 |
| 4. Bloqueadas por fonte/evidência | 1 |
| 5. Melhorias opcionais (itens de backlog, não questões individuais) | 3 |
| Avaliadas e mantidas fora da fila de maior risco | 4 |

Nenhuma revisão individual das 154 questões da Fila 1 foi aberta nesta sessão. Nenhuma
pendência foi resolvida além das decisões explicitamente delimitadas para `sodio-agua-04`,
`-08`, `-09`, `-11`, `-12`, `-22` e `-23`.
