# Matriz de evidência — 9 questões de maior risco clínico (Sódio e Água)

**Gerado em:** 2026-08-29
**Escopo:** as 9 questões de `soares2026-sodio-agua` (única referência) já identificadas como de
maior risco clínico em `RELATORIO-PROVENIENCIA-E-FONTES.md`, seção 12.2 — `sodio-agua-04`,
`08`, `09`, `11`, `12`, `19`, `20`, `22`, `23` — mais triagem secundária de 4 questões de
fronteira (`13`, `15`, `21`, `24`).
**Natureza:** verificação de adequação e atualidade de fontes. **Modo somente leitura** sobre
`banco-questoes.json`, `fontes.json`, `correcoes.json`, páginas e imagens — nenhum desses
arquivos foi escrito nesta sessão (hashes na seção final). Nenhum enunciado, alternativa,
gabarito, explicação, estado editorial ou `referencias[]` foi alterado. Este documento é o único
artefato produzido.

## Como ler esta matriz

- "Fonte atual" é sempre `soares2026-sodio-agua` (material de aula) — é a única referência
  cadastrada nas 9 questões, conforme já apurado na correção anterior.
- "Cobertura da fonte atual" avalia se o material de aula, sozinho, é suficiente para sustentar a
  afirmação de maior risco daquela questão, à luz do princípio 2 da Política Editorial (material
  de aula define escopo pedagógico, mas não basta sozinho para afirmação clínica controversa,
  quantitativa ou terapêutica).
- "Fonte complementar candidata" é uma fonte que esta auditoria localizou e leu (não apenas
  citação de segunda mão) — diretriz oficial, revisão institucional forte ou artigo original.
  Nenhuma foi adicionada a `fontes.json` ou a `referencias[]`; são candidatas para decisão
  humana.
- Nenhum DOI/PMID/edição foi inventado. Onde a leitura direta da página falhou (erro HTTP), isso
  está declarado explicitamente, e a fonte não é tratada como confirmada.

---

## Etapa 1 — Decomposição das 9 questões

| ID | Afirmação clínica central | Tipo | População/contexto | Valor numérico | Resposta correta (índice) | Fonte atual |
|---|---|---|---|---|---|---|
| `sodio-agua-04` | Classificação de gravidade da depleção do VEC por faixa percentual, aplicada a um quadro clínico (sede, turgor↓, hipotensão ortostática, oligúria, pulso fino, sem choque) | limiar + diagnóstico (classificação) | Adulto, sem choque | Corta em 5% / 10% / 30% do VEC | "Moderada, entre 10% e 30% do VEC" (índice 2) | `soares2026-sodio-agua` |
| `sodio-agua-08` | Conduta terapêutica inicial na hiponatremia hipervolêmica por insuficiência cardíaca | conduta | Adulto com IC, edema, congestão, Na 128 mEq/L | Na 128 mEq/L | "Hiponatremia hipervolêmica; restrição de água livre e furosemida" (índice 4) | `soares2026-sodio-agua` |
| `sodio-agua-09` | Mecanismo e conduta inicial na hiponatremia hipovolêmica por tiazídico + diarreia | conduta | Idosa, hidroclorotiazida, diarreia, hipotensão ortostática, Na 126 mEq/L | Na 126 mEq/L | "Perda de sódio e água com VEC reduzido; solução salina 0,9%" (índice 1) | `soares2026-sodio-agua` |
| `sodio-agua-11` | Conduta na hipernatremia hipervolêmica por sobrecarga de sódio (bicarbonato) | conduta | Adulto, carga de bicarbonato de sódio | não numérico | "Reposição de água livre associada a furosemida" (índice 3) | `soares2026-sodio-agua` |
| `sodio-agua-12` | Prioridade terapêutica inicial na hipernatremia hipovolêmica do grande queimado | conduta + urgência | Grande queimado, hipotensão, taquicardia | não numérico | "Restaurar a volemia com solução salina 0,9%" (índice 0) | `soares2026-sodio-agua` |
| `sodio-agua-19` | Achado que diferencia síndrome cerebral perdedora de sal (SCPS) de SIHAD após hemorragia subaracnóidea | diagnóstico (caso clínico) | Pós-HSA, hiponatremia, poliúria, Na urinário 70 mEq/L | Na urinário 70 mEq/L | "Redução clínica do VEC acompanhada de poliúria" (índice 3) | `soares2026-sodio-agua` |
| `sodio-agua-20` | Conduta terapêutica na síndrome cerebral perdedora de sal | conduta | Genérico (SCPS) | não numérico | "SF 0,9%, aumento da oferta de sal e possível fludrocortisona" (índice 1) | `soares2026-sodio-agua` |
| `sodio-agua-22` | Diagnóstico de diabetes insípido em caso pós-cirurgia hipofisária | diagnóstico (caso clínico) | Pós-cirurgia hipofisária | Na 151 mEq/L; POsm 305; Uosm 160; densidade 1,003 | "Diabetes insípido" (índice 3) | `soares2026-sodio-agua` |
| `sodio-agua-23` | Correção de água/volemia no DI e indicação de desmopressina | conduta + classificação | DI central vs. nefrogênico | não numérico | "Corrige-se água e volemia de forma controlada; desmopressina indicada na deficiência central de ADH" (índice 1) | `soares2026-sodio-agua` |

(Texto completo de pergunta/alternativas/explicação não reproduzido aqui — já registrado em
`banco-questoes.json`; a "justificativa atual" de cada questão está resumida na matriz da
Etapa 4.)

---

## Etapa 2 — Verificação de Spasovski

### Spasovski 2014 (já cadastrada como `spasovski2014-hiponatremia`)

- **Referência completa (confirmada):** Spasovski G, Vanholder R, Allolio B, et al. Clinical
  practice guideline on diagnosis and treatment of hyponatraemia. *European Journal of
  Endocrinology*. 2014;170:G1–G47.
- **DOI:** 10.1530/EJE-13-1020 · **PMID:** 24569125 (já confirmados em auditoria anterior,
  registrados em `fontesMeta`; não reconferidos byte a byte nesta sessão, apenas aceitos como já
  verificados).
- **Organização responsável:** European Renal Best Practice (ERBP)/ERA-EDTA, em conjunto com a
  European Society of Intensive Care Medicine (ESICM) e a European Society of Endocrinology
  (ESE).
- **Escopo:** diagnóstico e tratamento de hiponatremia (não cobre hipernatremia nem diabetes
  insípido).

### Achado novo desta sessão: existe atualização formal

`fontesMeta` (registrado na sessão anterior) dizia: *"sem atualização formal publicada até a
data desta auditoria"*. **Isso está desatualizado.** Localizei e li diretamente (WebFetch bem-
sucedido) uma atualização do mesmo autor principal:

- **Referência:** Spasovski G. Hyponatraemia—treatment standard 2024. *Nephrology Dialysis
  Transplantation*. 2024;39(10):1583–1592.
- **DOI:** 10.1093/ndt/gfae162
- **Organização:** European Renal Association (ERA).
- **Relação com a guideline de 2014:** o texto lido não afirma explicitamente "revoga" ou
  "substitui" a versão 2014 — é descrito como um "treatment standard" mais recente do mesmo
  autor principal, na mesma linha editorial da ERA. Não encontrei declaração formal de
  substituição; trato como **atualização de fato, não uma revogação formal**, e registro essa
  incerteza em vez de presumir.
- **Correções:** há erratas publicadas em *NDT* 40(6), 2025 — não lidas em detalhe (fora do
  escopo desta verificação; não afetam os trechos usados aqui, que são de conduta geral, não de
  fórmulas/dose).

**O que a versão 2024 sustenta, com trecho localizado (WebFetch, 2026-08-29):**

| Afirmação | Sustentada? | Trecho/achado |
|---|---|---|
| `sodio-agua-08` (restrição de água + furosemida na hiponatremia hipervolêmica por IC) | Parcialmente | "fluid restriction is the first choice of treatment in CHF"; furosemida citada como conduta de segunda linha (20–40 mg 8–12/12h + 3–5 g sal/dia) — **mas o padrão 2024 aponta tolvaptano como "treatment of choice" em hiponatremia hipervolêmica, especialmente em IC**, o que a questão não menciona |
| `sodio-agua-09` (SF 0,9% na hiponatremia hipovolêmica) | Sim, diretamente | "isotonic NaCl fluid" como tratamento primário, 23–30 mL/kg/dia, com reavaliação de sódio em 6–8h e 24h |
| `sodio-agua-11`, `12` (hipernatremia) | Não | Fora do escopo — Spasovski trata só de hiponatremia |
| `sodio-agua-19`, `20` (SCPS vs. SIHAD) | Não constatado nesta verificação | O texto lido cobre tratamento de SIHAD (restrição/vaptanos), mas não teve trecho específico sobre síndrome cerebral perdedora de sal localizado nesta sessão — não presumo cobertura sem tê-la visto |
| `sodio-agua-04`, `22`, `23` | Não | Fora do escopo (classificação de VEC e diabetes insípido não são hiponatremia) |

**Limitação de aplicabilidade:** diretriz europeia (ERA/ESICM/ESE), população adulta geral;
não é específica para o contexto de ensino brasileiro nem para todas as etiologias citadas nas 9
questões.

---

## Etapa 3 — Evidência complementar por afirmação não coberta (ou parcialmente coberta)

Fontes lidas diretamente nesta sessão (WebFetch, quando teve sucesso) ou obtidas por busca com
verificação cruzada (WebSearch), sempre com identificação de qual mecanismo de acesso foi usado:

| Fonte | Como foi obtida | Identificadores | Instituição | O que sustenta |
|---|---|---|---|---|
| Spasovski G. Hyponatraemia—treatment standard 2024. *NDT*. 2024;39(10):1583–1592. | WebFetch direto (sucesso) | DOI 10.1093/ndt/gfae162 | ERA | `sodio-agua-08` (parcial), `sodio-agua-09` (direta) |
| Sonani B, Al-Dhahir MA. Hypernatremia. StatPearls [Internet]. Atualizado 24 ago. 2023. | WebFetch direto (sucesso) | NCBI Bookshelf NBK441960 | NIH/StatPearls Publishing | `sodio-agua-11` — trecho: "sodium intoxication... requiring the use of loop diuretics... to remove excess sodium" combinado a reposição de água livre |
| Popowicz P, Regan A, Hotwagner DT. Burn Fluid Resuscitation. StatPearls [Internet]. Atualizado 6 abr. 2025. | WebFetch direto (sucesso) | NCBI Bookshelf NBK534227 | NIH/StatPearls Publishing | `sodio-agua-12` — parcial: confirma cristaloide isotônico/Ringer lactato como prioridade de reposição volêmica no grande queimado, mas **o texto lido não discute hipernatremia especificamente** |
| Cerebral Salt Wasting Syndrome. StatPearls [Internet] (achado por busca; conteúdo consolidado via resultados de busca, **não lido por WebFetch direto nesta sessão** — ver ressalva) | WebSearch (síntese de resultados, sem leitura de página única confirmada) | NCBI Bookshelf NBK534855 (não confirmado por leitura direta) | NIH/StatPearls Publishing | `sodio-agua-19`, `20` — hipovolemia como diferenciador central de SCPS; reposição de sal/volume como primeira linha; fludrocortisona como adjuvante em casos refratários, base de evidência = séries de caso/relatos, não ensaio controlado |
| Hui C, Khan M, Khan Suheb MZ, Radbel JM. Arginine Vasopressin Disorder (Diabetes Insipidus). StatPearls [Internet]. Atualizado 11 jan. 2024. | WebFetch direto (sucesso) | NCBI Bookshelf NBK470458 | NIH/StatPearls Publishing | `sodio-agua-13`, `21`, `22`, `23` — pato­fisiologia central (déficit de AVP) vs. nefrogênico (resistência renal via receptor V2), resposta à desmopressina (>100% de aumento da osmolalidade urinária em DI central completo; mínima/nenhuma em DI nefrogênico completo) |
| Manual MSD (edição para profissionais). Depleção de volume — Nefrologia. | WebFetch direto (sucesso) | sem DOI (manual médico online); URL: msdmanuals.com/pt/profissional/nefrologia/.../deple%C3%A7%C3%A3o-de-volume | Merck & Co. (Manual MSD) | `sodio-agua-04` — classificação por %VEC, mas com **cortes numéricos diferentes** dos da questão (ver Etapa 4) |
| Christ-Crain M. Diagnosis and management of diabetes insipidus for the internist: an update. *J Intern Med*. 2021. | Tentativa de WebFetch **falhou (HTTP 403)** — não lida | DOI 10.1111/joim.13261 (do resultado de busca, não confirmado por leitura da página) | — | **Não usada como evidência nesta matriz** — listada aqui só para registrar que foi tentada e não pôde ser confirmada por leitura direta |
| Society for Endocrinology. Inpatient management of cranial diabetes insipidus. *Endocrine Connections*. 2018;7(7). | Tentativa de WebFetch **falhou (HTTP 403)** — não lida | — | Society for Endocrinology (UK) | **Não usada como evidência nesta matriz**, pelo mesmo motivo |

Nenhum trecho extenso foi copiado; os trechos entre aspas acima são as frases mínimas
necessárias para registrar a recomendação específica, como já é prática no relatório anterior.

**Achado colateral relevante (não é conflito clínico, é nomenclatura):** em 2022, sociedades de
endocrinologia propuseram renomear diabetes insípido central para "arginine vasopressin
deficiency" (AVP-D) e o nefrogênico para "arginine vasopressin resistance" (AVP-R), para reduzir
confusão com diabetes mellitus. As questões `13`, `21`, `22`, `23` usam a nomenclatura clássica
("diabetes insípido central/nefrogênico"), que continua amplamente usada na prática e não está
errada — é uma nota de atualização terminológica, não um erro de conteúdo.

---

## Etapa 4 — Matriz

| ID | Afirmação de maior risco (resumo) | Fonte atual | Cobertura da fonte atual | Fonte complementar candidata | Correspondência | Atualidade | Possível conflito | Ação recomendada | Prioridade | Revisão humana | Classificação final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `sodio-agua-04` | Corte percentual de gravidade da depleção do VEC (moderada 10–30%, grave >30%) | aula | insuficiente isoladamente para um limiar numérico usado em decisão de gravidade | Manual MSD — Depleção de Volume (nefrologia) | **indireta/discordante** — MSD usa leve <5%, moderada 5–10%, grave >10% (cortes bem diferentes) | Manual MSD é revisado continuamente; sem data de revisão desta página específica confirmada | **Sim** — dois cortes percentuais distintos e incompatíveis para os mesmos rótulos de gravidade | **Não corrigir.** Marcar para revisão humana urgente: confirmar qual convenção a aula realmente adota (pode haver mais de um esquema válido publicado; não presumo qual está certo) | **Alta** | **Sim, urgente** | `possivel_conflito_com_evidencia` |
| `sodio-agua-08` | Restrição de água + furosemida como conduta inicial na hiponatremia hipervolêmica por IC | aula | parcial — conduta correta, mas fonte única não é diretriz | Spasovski 2024 (NDT) | direta para a conduta descrita; **incompleta** frente ao padrão mais atual (tolvaptano como "treatment of choice") | fonte da aula não tem data rastreável; Spasovski 2024 é a mais atual localizada | Não — não é erro, é conduta válida mas não a mais atual segundo a fonte de 2024 | Acrescentar Spasovski 2024 como referência complementar; decisão editorial (fora desta sessão) sobre mencionar tolvaptano | Média | Recomendável, não urgente | `possivel_desatualizacao` |
| `sodio-agua-09` | SF 0,9% na hiponatremia hipovolêmica por tiazídico | aula | parcial — correta, sem reforço externo | Spasovski 2024 (NDT) | **direta** | atual (2024) | Não | Acrescentar Spasovski 2024/2014 como referência complementar | Baixa/média | Não urgente | `requer_fonte_complementar` |
| `sodio-agua-11` | Água livre + furosemida na hipernatremia hipervolêmica por bicarbonato | aula | parcial | StatPearls — Hypernatremia (Sonani/Al-Dhahir, 2023) | **direta** | atual (2023) | Não | Acrescentar StatPearls Hypernatremia como referência complementar | Baixa/média | Não urgente | `requer_fonte_complementar` |
| `sodio-agua-12` | Priorizar SF 0,9% para restaurar volemia no grande queimado com hipernatremia | aula | parcial | StatPearls — Burn Fluid Resuscitation (2025) | **indireta** — confirma prioridade de cristaloide isotônico no queimado em geral, mas não discute hipernatremia especificamente | atual (2025) | Não | Acrescentar como complementar, sinalizando que a cobertura é do princípio geral de reidratação, não do enquadramento específico "hipernatremia hipovolêmica do queimado" | Média | Recomendável | `requer_fonte_complementar` |
| `sodio-agua-19` | Redução do VEC + poliúria favorece SCPS sobre SIHAD pós-HSA | aula (já reconhece controvérsia na própria explicação) | parcial, e o próprio tópico é clinicamente controverso na literatura | StatPearls — Cerebral Salt Wasting (busca, não lida por WebFetch direto) | indireta/não confirmada por leitura direta | não determinada nesta sessão | **Possível** — parte da literatura de nefrologia/neurocrítica questiona se SCPS e SIHAD são entidades distintas após HSA, o que a própria explicação da questão já registra | Não corrigir; a questão já é transparente sobre a controvérsia. Se desejado, complementar com revisão de neurocrítica lida diretamente (não localizada com confirmação nesta sessão) | Média-alta | Recomendável (a controvérsia é da área, não um erro da questão) | `correta_com_lacuna_documental` |
| `sodio-agua-20` | SF 0,9% + sal + fludrocortisona (adjuvante) na SCPS | aula (já reconhece força de evidência baixa para fludrocortisona) | parcial | StatPearls — Cerebral Salt Wasting (busca, não lida por WebFetch direto) | indireta/não confirmada por leitura direta | não determinada | Não além do já reconhecido pela própria questão | Não corrigir; força de evidência para fludrocortisona permanece baixa (séries de caso), como a explicação já registra | Baixa-média | Não urgente | `correta_com_lacuna_documental` |
| `sodio-agua-22` | Diagnóstico de DI em caso pós-cirurgia hipofisária (Na↑, POsm↑, Uosm↓, densidade urinária baixa) | aula | parcial | StatPearls — Arginine Vasopressin Disorder (2024) | **direta** | atual (2024); nomenclatura em transição (AVP-D) desde 2022 | Não (só nota terminológica) | Acrescentar StatPearls DI como complementar; nota informativa sobre AVP-D/AVP-R (decisão editorial) | Baixa | Não urgente | `requer_fonte_complementar` |
| `sodio-agua-23` | Correção de água/volemia no DI; desmopressina indicada só no central | aula | parcial | StatPearls — Arginine Vasopressin Disorder (2024) | **direta** — desmopressina aumenta >100% a osmolalidade urinária no DI central completo; mínimo/nenhum efeito no nefrogênico completo | atual (2024); mesma nota terminológica | Não | Acrescentar StatPearls DI como complementar | Baixa | Não urgente | `requer_fonte_complementar` |

**Contagem resultante:** 0 `adequadamente_sustentada` · 2 `correta_com_lacuna_documental`
(`19`, `20`) · 5 `requer_fonte_complementar` (`09`, `11`, `12`, `22`, `23`) · 1
`possivel_desatualizacao` (`08`) · 1 `possivel_conflito_com_evidencia` (`04`) · 0 `inconclusiva`.

Nenhuma questão foi classificada como `adequadamente_sustentada` porque, por definição do
princípio 2 da Política Editorial, uma afirmação de conduta/diagnóstico/limiar/urgência não é
considerada adequadamente sustentada **enquanto a única referência cadastrada for material de
aula** — mesmo quando o conteúdo está de acordo com a literatura encontrada. "Adequadamente
sustentada" só se aplicaria depois de uma fonte complementar ser de fato adicionada a
`referencias[]`, o que esta sessão não fez (modo somente leitura).

---

## Etapa 5 — Triagem secundária das 4 questões de fronteira

| ID | Conteúdo | Contém limiar/diagnóstico de caso/conduta que justifique migração? | Decisão |
|---|---|---|---|
| `sodio-agua-13` | Reconhecer que diabetes insípido causa hipernatremia por perda de água com sódio corporal preservado (comparação com outras etiologias) | Não é caso clínico de paciente, não tem valor numérico, não pede conduta — é classificação etiológica genérica | **Mantida** como conceitual/mecanística |
| `sodio-agua-15` | Reconhecer o agrupamento de causas de SIHAD apresentado na aula (lista fechada de memorização) | Recall de lista de etiologia, sem caso, sem número, sem conduta | **Mantida** como conceitual |
| `sodio-agua-21` | Diferença fisiopatológica entre DI central e nefrogênico (mecanismo, sem caso clínico) | Comparação mecanística pura, mesma base do StatPearls DI lido na Etapa 3 — sem paciente, sem número, sem conduta | **Mantida** como conceitual/mecanística |
| `sodio-agua-24` | Diferenciação de SIHAD/SCPS/DI por natremia, urina e VEC (quadro comparativo, sem caso específico) | É a mais próxima de justificar migração — é essencialmente o algoritmo diagnóstico que sustenta `sodio-agua-19` e `sodio-agua-22`, mas aqui aplicado de forma genérica/comparativa, sem um paciente descrito e sem pedir uma conduta | **Mantida**, mas com nota: é a candidata mais defensável a tratamento de risco equivalente ao grupo dos 9, se o usuário preferir critério mais conservador |

Nenhuma das 4 foi migrada para a fila de maior risco nesta sessão — a triagem apenas registra o
critério usado (presença de caso clínico decisório, valor numérico limiar, ou pedido de conduta)
e sinaliza `sodio-agua-24` como a mais próxima da fronteira, para decisão humana se desejado.

---

## Etapa 6 — Verificação de integridade

Hashes SHA-256 calculados **antes** de qualquer leitura desta sessão e **depois** da criação
deste arquivo:

| Arquivo | Antes | Depois | Inalterado? |
|---|---|---|---|
| `_banco/banco-questoes.json` | `2653b2c9729107dfad35dc0da0d7739b75d0fc23bf345cb6b6932f8669c15aee` | `2653b2c9729107dfad35dc0da0d7739b75d0fc23bf345cb6b6932f8669c15aee` | ✅ |
| `_banco/fontes.json` | `e2057d4c391a61365362c90ca3a47c56527759102cfcff03287931fcb96f28b7` | `e2057d4c391a61365362c90ca3a47c56527759102cfcff03287931fcb96f28b7` | ✅ |
| `_banco/correcoes.json` | `f7710db7da9df5fb734a78162d08f79fd699295284af7ede77ec051991391fc7` | `f7710db7da9df5fb734a78162d08f79fd699295284af7ede77ec051991391fc7` | ✅ |
| `medicina/disturbios-sodio-agua.html` | `5c4067c358a9abc42851a87a7f53a5fe9ddf4574ac69f2677dbaf2093513bf16` | (reconferido, ver nota) | ✅ |
| `medicina/disturbios-sodio-agua-feitas.html` | `edadfeaceace6579ce10c980389d0970837cefd10da14b39f8b8d4a94090f369` | (reconferido, ver nota) | ✅ |
| `medicina/seletor.html` | `03056abac5766e0b1e97b7a010e035caa0a584e8929d68a6646e8481d5c3e263` | (reconferido, ver nota) | ✅ |

Nota: os três arquivos HTML foram reconferidos por hash ao final da sessão junto com os três
JSON canônicos; todos bateram com a linha de base. O único arquivo criado ou modificado por esta
sessão é `Questões/_banco/MATRIZ-EVIDENCIA-SODIO-AGUA.md` (novo).

## Limitações desta verificação

- Duas fontes candidatas (Christ-Crain 2021; Society for Endocrinology 2018) não puderam ser
  lidas diretamente (HTTP 403) e **não foram usadas como evidência** — aparecem na Etapa 3 só
  como tentativa registrada, não como fonte confirmada.
- A cobertura de `spasovski2014-hiponatremia`/Spasovski 2024 para `sodio-agua-19`/`20` (SCPS) não
  foi confirmada por leitura direta nesta sessão — o trecho lido cobriu SIHAD/hiponatremia em
  geral, não especificamente síndrome cerebral perdedora de sal.
- A relação exata entre Spasovski 2014 e Spasovski 2024 (se é uma substituição formal ou um
  documento complementar) não está explícita no trecho lido; registrado como incerteza, não como
  fato.
- Nenhuma das fontes complementares candidatas foi adicionada a `fontes.json` ou a
  `referencias[]` — isso exigiria uma sessão de edição, fora do modo somente leitura desta
  auditoria.
- Não avaliei se a resposta marcada como correta em cada uma das 9 questões é a melhor possível
  clinicamente — apenas se a fonte atual é suficiente e se há conflito ou desatualização
  detectável pela literatura localizada.

## Adendo — desfecho editorial (2026-08-29, etapa 3.3)

Esta sessão anterior foi somente leitura; o adendo abaixo registra o que foi efetivamente
decidido e aplicado numa sessão de edição posterior, sem reabrir busca clínica e sem apagar
nada do conteúdo acima. Detalhamento completo em `RELATORIO-FECHAMENTO-AUDITORIA.md`.

| ID | Classificação desta matriz | Desfecho editorial aplicado |
|---|---|---|
| `sodio-agua-04` | `possivel_conflito_com_evidencia` | **Não resolvido.** Estado `em_revisao` preservado. Conflito (cortes % da aula vs. Manual MSD) registrado em `correcoes.json`; aprovação bloqueada até confirmação humana da convenção adotada pela disciplina. |
| `sodio-agua-08` | `possivel_desatualizacao` | Estado alterado de `aprovada` para `requer_atualizacao`. Tolvaptano **não** foi acrescentado ao texto — decisão de incorporá-lo permanece humana e pendente. |
| `sodio-agua-09` | `requer_fonte_complementar` | Spasovski 2024 cadastrada (`spasovski2024-hiponatremia-tratamento-padrao`) e acrescentada a `referencias[]`, preservando a fonte de aula. |
| `sodio-agua-11` | `requer_fonte_complementar` | StatPearls Hypernatremia cadastrada (`statpearls2023-hipernatremia`) e acrescentada a `referencias[]`. |
| `sodio-agua-12` | `requer_fonte_complementar` | **Fonte não adicionada** — a correspondência com a candidata (StatPearls Burn Fluid Resuscitation) é indireta (não discute hipernatremia especificamente), e a instrução da etapa foi só adicionar fonte com correspondência direta. Decisão registrada em `correcoes.json`. |
| `sodio-agua-19` | `correta_com_lacuna_documental` | Nenhuma alteração. Lacuna documental (fonte de neurocrítica não lida diretamente) registrada como item de backlog em `FILAS-REVISAO-EDITORIAL.md`, sem nova busca. |
| `sodio-agua-20` | `correta_com_lacuna_documental` | Mesmo tratamento de `sodio-agua-19`. |
| `sodio-agua-22` | `requer_fonte_complementar` | StatPearls Arginine Vasopressin Disorder cadastrada (`statpearls2024-avp-disorder-di`) e acrescentada a `referencias[]`. Nota terminológica (AVP-D) registrada como melhoria opcional no backlog, não como erro. |
| `sodio-agua-23` | `requer_fonte_complementar` | Mesma fonte complementar de `sodio-agua-22` acrescentada. |
| `sodio-agua-13`, `-15`, `-21` | mantidas conceituais (Etapa 5) | Nenhuma alteração; permanecem fora da fila de maior risco. |
| `sodio-agua-24` | mantida, candidata à fronteira (Etapa 5) | Nenhuma alteração; registrada no backlog como candidata a reavaliação se um critério mais conservador for adotado. |

Em nenhum caso desta lista foi alterado enunciado, alternativa, gabarito ou explicação. As 3
fontes complementares cadastradas usam apenas os dados bibliográficos já confirmados por
leitura direta (WebFetch) nesta própria matriz (Etapa 2 e Etapa 3) — nenhum identificador novo
foi buscado ou inventado na sessão de edição.
