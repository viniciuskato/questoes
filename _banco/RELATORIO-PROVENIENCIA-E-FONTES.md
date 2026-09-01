# Relatório de proveniência de imagens e verificação de fontes

**Gerado em:** 2026-08-29
**Escopo:** as 10 imagens e as 6 fontes sinalizadas como pendentes em `RELATORIO-INTEGRIDADE.md`
**Natureza:** triagem documental. Nenhuma classificação foi aplicada ao banco; nenhuma
imagem, questão, gabarito, explicação ou conteúdo clínico foi alterado. Todas as
classificações abaixo são **propostas** para decisão humana.

## Nota de correção (2026-08-29, sessão posterior à triagem original)

Após a conclusão da triagem abaixo, o usuário informou que **as dez imagens de radiografia
vieram do material de aula** (o mesmo slide/aula já identificado nas seções 2 e 3 como
proveniente do Dr. Felipe Souza, PUCPR Londrina). Essa informação **não foi descoberta por
busca nesta auditoria** — foi fornecida diretamente pelo usuário, como dado documental novo.

Esta nota corrige apenas a **interpretação documental da proveniência imediata** das imagens e
refina a leitura das fontes internas e do risco das 21 questões de Sódio e Água. Ela **não**
reabre nem invalida a triagem original: a origem imediata (material de aula do Dr. Felipe
Souza) já constava nas seções 2 e 3 abaixo como o slide de onde as imagens foram extraídas —
o que muda é que agora essa origem imediata está **confirmada pelo usuário**, não apenas
inferida do padrão visual do arquivo. O que continua **não confirmado** é a autoria original da
radiografia (quem a produziu/capturou) e a licença de uso — nada disso o usuário declarou.

As conclusões originais das seções 2, 3, 6 e 8 são **preservadas abaixo sem alteração**, como
registro do raciocínio e do estado de conhecimento daquela sessão. As seções 11 e 12, ao final
deste documento, contêm a **classificação revisada** que substitui, para fins de decisão
editorial, a proposta de estado `origem_desconhecida` e o tratamento uniforme das 4 fontes
internas e das 21 questões de Sódio e Água. Nenhum arquivo do banco, imagem, questão, página ou
estado editorial foi alterado por esta correção — apenas a leitura documental registrada neste
relatório. Verificação por hash na seção 13.

## Resumo executivo

- **10/10 imagens** seguem sem comprovação de licença/direitos autorais. Nenhuma tem
  identificador de paciente visível no arquivo publicado; nenhuma tem autoria ou licença
  confirmada. Proposta de estado para as 10: `origem_desconhecida` (ver seção 2). Uma delas
  (`rxtorax-10`) carrega um risco adicional específico, documentado na seção 2.
- **6/6 fontes pendentes** seguem sem "verificada" completa, mas com dois desfechos
  diferentes nesta sessão:
  - As 2 citações vagas de livro-texto (Guyton & Hall; Katzung) puderam ser **parcialmente
    verificadas** por catálogo oficial de editora (ver seção 3) — permanecem pendentes porque
    não foi confirmado qual exemplar físico o usuário efetivamente usou.
  - As 4 referências a material de aula interno (PUCPR/PUC Londrina) permanecem
    **não localizáveis externamente** por definição — são materiais sem publicação pública;
    nenhuma busca poderia "confirmá-las" sem contato direto com o professor responsável.
- Achado de risco elevado para decisão humana: **21 questões `aprovada`** de
  Distúrbios de Sódio e Água dependem de `soares2026-sodio-agua` (material de aula) como
  **única** referência — a Política Editorial (princípio 2) exige que material de aula não
  sustente sozinho afirmação clínica quantitativa/terapêutica quando esta for controversa;
  isso não foi avaliado aqui (não é revisão clínica), mas é sinalizado para revisão humana.
- Nenhum dado foi inventado: autor, licença, URL, DOI, PMID ou edição que não pôde ser
  confirmado permanece `null`/não confirmado nesta sessão.

## 1. Baseline (Etapa 1)

- Repositório Git: **não existe** (`git status`/`git diff` retornam "not a git repository");
  confirmado como na sessão anterior — não há histórico versionado em `Questões/`.
- Hashes SHA-256 antes de qualquer leitura/escrita:

| Arquivo | SHA-256 |
|---|---|
| `banco-questoes.json` | `2653b2c9729107dfad35dc0da0d7739b75d0fc23bf345cb6b6932f8669c15aee` |
| `fontes.json` | `e2057d4c391a61365362c90ca3a47c56527759102cfcff03287931fcb96f28b7` |
| `correcoes.json` | `f7710db7da9df5fb734a78162d08f79fd699295284af7ede77ec051991391fc7` |
| `imagens/pneumologia/rx-caso-02-mediastino.png` | `34fc51cba0b705ccecf52ebfe19c8edbb4b9ba4dc30565538221c57206079cc5` |
| `imagens/pneumologia/rx-caso-03-cardiomediastino.png` | `5df3d25c7e6362292e60a735803859fc831abb9de4f4d6b954d82d178c4dcfb8` |
| `imagens/pneumologia/rx-caso-04-coracao-tc.png` | `ca39be544825de4d75874556fdf071c3576af5e6c7dfcacbe7917a7d019f086f` |
| `imagens/pneumologia/rx-caso-05-comparativa.png` | `6546a86ef6235238425a6c76ca099fb185c334e20894d380f8075800c2b94468` |
| `imagens/pneumologia/rx-caso-06-pulmoes.png` | `d0db8f92f612b5371c61672f48dc0313e045e971478c7431e13510f0c08ac1f8` |
| `imagens/pneumologia/rx-caso-07-pulmao.png` | `0da4ad68532d4570643c4ac98c570b8c0693576f824072e854a122ec858ad859` |
| `imagens/pneumologia/rx-caso-08-pulmao.png` | `e6e5b67fbe437616dcc282ca12f66c8f4fcf3717fd0357fbce98842b115061ac` |
| `imagens/pneumologia/rx-caso-09-pleura.png` | `782b2007b330b828e8da0f9003047a81d8db6cec80a8b0d65e7ab02622eb7509` |
| `imagens/pneumologia/rx-caso-10-pleura.png` | `60650729fbab69009930e98099616c664e56c4b56dd5f8bf860ed3914ec38671` |
| `imagens/pneumologia/rx-caso-11-abdome.png` | `b53353031fbf5ff47b57f9aaf16c6eb6662740046e1bd68e7330f1c0698e5f01` |

- **Onde cada imagem é usada:** todas as 10 são referenciadas por exatamente uma questão
  cada (`rxtorax-02`…`rxtorax-11`, tema Radiografia de Tórax Básica), publicadas em
  `medicina/radiografia-torax-basica.html` (renderização direta) e embutidas em
  `medicina/seletor.html` (dado bruto do banco, usado para navegação/prévia). Nenhum outro
  HTML, spec ou exportação usa essas imagens.
- **Onde cada fonte é usada:** ver tabela da seção 3 (coluna "itens dependentes" e "páginas
  publicadas").

## 2. Triagem das 10 imagens (Etapa 2)

> **Nota de correção (ver seção 11):** a coluna "estado proposto" desta tabela
> (`origem_desconhecida`) e a coluna "ação recomendada" refletem o entendimento desta sessão,
> **antes** de o usuário confirmar que a origem imediata é material de aula. A seção 11 revisa
> essa classificação sem apagar o texto abaixo.

Todas as 10 têm o mesmo perfil documental, já registrado em `imagemMeta` por auditoria
anterior (2026-08-29) e confirmado nesta sessão por reinspeção dos metadados — nenhuma
imagem foi reaberta/reprocessada, só os metadados textuais já existentes foram lidos.

| id / arquivo | questão / página | descrição funcional | natureza provável | autor/instituição confirmado | fonte original | URL oficial | licença/versão | atribuição exigida | alterações documentadas | imagem clínica? | risco de identificação | pode continuar publicada? | ação recomendada | estado proposto | confiança |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rx-caso-02-mediastino.png | rxtorax-02 / radiografia-torax-basica.html | Painel Rx PA+AP, setas junto ao mediastino superior | uso educacional sem licença confirmada | não (apenas o professor que exibiu o slide é conhecido; autoria da radiografia, não) | Slide de aula "Radiografia de Tórax Básica" (Dr. Felipe Souza, PUCPR Londrina) | nenhuma (material interno, sem URL pública) | nenhuma confirmada | indeterminado (depende de origem real) | montagem em painel (b)/(c) já presente na fonte; 2 setas já presentes | sim (radiografia real) | baixo (sem identificador de paciente no arquivo publicado) | manter, sob pendência | perguntar origem ao Dr. Felipe Souza; se não confirmável, substituir por imagem de licença aberta | `origem_desconhecida` | moderada |
| rx-caso-03-cardiomediastino.png | rxtorax-03 / radiografia-torax-basica.html | Rx PA+lateral, 3 setas coloridas no PA, 1 seta amarela na lateral | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | montagem PA+lateral já presente; 4 setas já presentes | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-04-coracao-tc.png | rxtorax-04 / radiografia-torax-basica.html | Rx com contorno cardíaco aumentado + corte de TC pareado | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | montagem Rx+TC já presente; 1 seta amarela já presente | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-05-comparativa.png | rxtorax-05 / radiografia-torax-basica.html | Rx normal vs. Rx com alteração (comparativa) | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | montagem comparativa já presente; 2 setas já presentes | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-06-pulmoes.png | rxtorax-06 / radiografia-torax-basica.html | Rx única com opacidades pulmonares | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | nenhuma marcação adicional | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-07-pulmao.png | rxtorax-07 / radiografia-torax-basica.html | Rx com opacidade pulmonar, 1 seta indicando estrutura tubular | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | marcador de lateralidade "R" + 1 seta vermelha já presentes | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-08-pulmao.png | rxtorax-08 / radiografia-torax-basica.html | Rx PA+lateral (atelectasia de lobo médio) | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | montagem PA+lateral já presente; sem marcações adicionais | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-09-pleura.png | rxtorax-09 / radiografia-torax-basica.html | Rx com opacidade em terço inferior de hemitórax, 2 pontas de seta | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | 2 pontas de seta amarelas já presentes | sim | baixo | manter, sob pendência | idem acima | `origem_desconhecida` | moderada |
| rx-caso-10-pleura.png | rxtorax-10 / radiografia-torax-basica.html | Rx em expiração, 5 pequenas setas vermelhas, recorte com resíduo de overlay PACS/DICOM | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | 5 setas já presentes; recorte de visualizador PACS/DICOM com resíduo textual ("...oge: 3 of 3", "IM: 200x") e régua de medida | sim | **baixo no arquivo publicado, mas indeterminado no arquivo-fonte não recortado** — resíduo de overlay sugere que o arquivo original (fora deste repositório) pode ter cabeçalho de identificação não removido | manter, sob pendência, **sem republicar ou redistribuir o arquivo-fonte original** até confirmar remoção de cabeçalho | perguntar origem ao Dr. Felipe Souza; confirmar explicitamente que o arquivo-fonte não recortado não expõe dados de paciente antes de qualquer nova publicação | `origem_desconhecida` + `requer_revisao_privacidade` | moderada |
| rx-caso-11-abdome.png | rxtorax-11 / radiografia-torax-basica.html | Rx com faixa radiotransparente entre cúpula diafragmática e abdome | uso educacional sem licença confirmada | não | idem acima | nenhuma | nenhuma confirmada | indeterminado | 1 seta preta já presente | sim | baixo | manter, sob pendência | perguntar origem ao Dr. Felipe Souza; se não confirmável, substituir por imagem de licença aberta | `origem_desconhecida` | moderada |

**Por que `origem_desconhecida` e não `uso_suspenso`:** nenhum indício concreto de violação foi
encontrado (não há marca d'água de terceiro, aviso de copyright visível, nem identificação de
paciente no arquivo em uso); o problema é ausência de comprovação positiva de direito de uso, não
evidência de uso indevido. `uso_suspenso` ficaria reservado para o caso de a checagem com o
professor revelar que a imagem não pode ser usada.

**Por que não `atribuicao_pendente` nem `permissao_pendente` isoladamente:** essas categorias
pressupõem que o titular dos direitos já é conhecido e falta só cumprir a formalidade
(citar/pedir permissão). Aqui o próprio titular original da radiografia não está identificado —
o padrão visual (setas pré-existentes, montagem em painel, resíduo de visualizador PACS/DICOM)
indica material de terceiro reproduzido no slide, não uma captura do próprio professor — por
isso a proposta é a categoria mais conservadora, `origem_desconhecida`, até que o professor
confirme a proveniência real.

## 3. Triagem das 6 fontes pendentes (Etapa 3)

> **Nota de correção (ver seção 11):** a classificação `não_localizada` aplicada abaixo às 4
> fontes internas (material de aula) foi lida por esta sessão como sinônimo de fragilidade
> documental. A seção 11 diferencia "não localizável publicamente" de "inválida como fonte para
> o escopo da disciplina" — são coisas distintas, e a tabela abaixo não fazia essa distinção
> explícita.

| slug | citação atual | itens dependentes | localização da referência oficial | título/edição confirmados | autores/instituição | ano | DOI/PMID | URL oficial | data de consulta | classificação proposta |
|---|---|---|---|---|---|---|---|---|---|---|
| `souza2026-aula-radiografia-torax-basica` | Souza, Felipe. *Radiografia de Tórax Básica* [material de aula]. Pneumologia, Saúde do Adulto 1, Medicina PUCPR — Londrina, 2026. | 18 questões (`rxtorax-*`), todas `em_revisao`, todas com esta como única referência | não localizável — material interno de curso, sem repositório público (Moodle/AVA institucional não é acessível externamente) | não aplicável (não é publicação com edição) | Dr. Felipe Souza, PUCPR Londrina (nome já conhecido pelo usuário; não confirmado por fonte pública) | 2026 (declarado, não conferido) | não aplicável | nenhuma encontrada | 2026-08-29 (esta sessão: busca não realizada, pois não há indício de que o material tenha versão pública indexável) | `não_localizada` |
| `soares2026-sodio-agua` | Soares AE. *Distúrbios dos metabolismos de sódio e água* [material de aula]. Disciplina de Nefrologia, Medicina PUC Londrina; 2026. | 24 questões, sendo **23 `aprovada`** (21 delas com esta como única referência) e 1 `em_revisao` | não localizável — material interno, mesma situação acima | não aplicável | Profa. Soares AE, PUC Londrina (nome declarado, não confirmado externamente) | 2026 (declarado) | não aplicável | nenhuma encontrada | 2026-08-29 | `não_localizada` |
| `aulas2026-antimicrobianos` | PUCPR. *Antimicrobianos I, II e III* [materiais de aula]. Disciplina Agressão e Defesa 2, Medicina, 2026.2. | 71 questões, todas `em_revisao`, todas com outras referências além desta (nenhuma depende só dela) | não localizável — material interno | não aplicável | PUCPR, Disciplina Agressão e Defesa 2 | 2026.2 (declarado) | não aplicável | nenhuma encontrada | 2026-08-29 | `não_localizada` |
| `guia2026-antimicrobianos` | *Antimicrobianos: fundamentos, classes farmacológicas e aplicação clínica* [guia integrado do usuário]. Infectologia; revisão de 26 ago. 2026. | 72 questões, todas `em_revisao`, todas com outras referências além desta | não aplicável — é uma compilação de uso pessoal do próprio usuário, não uma publicação de terceiro | não aplicável | não aplicável (autoria do próprio usuário) | 2026-08-26 (declarado) | não aplicável | não aplicável | 2026-08-29 | `não_localizada` (por natureza — não é um documento externo verificável, é material próprio) |
| `guytonhall-fisiologia-medica` | Hall JE, Hall ME. *Guyton & Hall — Tratado de Fisiologia Médica*. [Edição não confirmada — candidatas: 14ª ed., Elsevier/GEN, ISBN 978-85-9515-861-0; possível 15ª ed. não confirmada]. Rio de Janeiro: Elsevier/GEN. | 14 questões, todas `pendente_revisao_conteudo` (3 delas com esta como única referência) | página oficial da editora GEN Guanabara Koogan (grupogen.com.br) | **14ª edição**, 2021, 1.144 p., capa dura — é a edição em português atualmente listada no catálogo oficial da editora; **nenhuma 15ª edição em português foi encontrada** no catálogo oficial nesta busca | John E. Hall, Michael E. Hall; GEN Guanabara Koogan (tradução da obra original Elsevier, EUA) | 2021 | não fornecido pela página (livro-texto, não artigo) | https://www.grupogen.com.br/guyton-e-hall-tratado-de-fisiologia-medica-9788595158610 | 2026-08-29 | `parcialmente_verificada` — edição 14ª confirmada como a atual no catálogo oficial da editora; falta confirmar se é o exemplar físico que o usuário de fato consultou |
| `katzung-farmacologia-basica-clinica` | Katzung BG, et al. (eds.). *Katzung — Farmacologia Básica e Clínica*. [Edição não confirmada — candidata: 15ª ed., AMGH/McGraw-Hill, 2022–2023]. Porto Alegre: AMGH/McGraw-Hill. | 19 questões, todas `pendente_revisao_conteudo` (5 delas com esta como única referência) | listagem da loja oficial da editora Grupo A (grupoa.com.br / loja.grupoa.com.br) | **15ª edição**, Katzung & Vanderah, Artmed (Grupo A), Porto Alegre, 2022, ISBN 978-65-5804-018-7 — é a edição em português localizada no catálogo oficial; a 16ª ed. já existe em inglês/espanhol mas **nenhuma tradução em português foi encontrada** nesta busca | Bertram G. Katzung, Todd W. Vanderah (eds.); Artmed/Grupo A | 2022 | não fornecido (livro-texto) | https://loja.grupoa.com.br/farmacologia-basica-e-clinica-15ed-9786558040187-p1020453 (conteúdo da página não pôde ser totalmente confirmado por leitura automática — ver observação) | 2026-08-29 | `parcialmente_verificada` — edição 15ª identificada por resultado de busca no domínio oficial da editora; a tentativa de leitura direta da página não retornou o conteúdo completo (provável renderização via JavaScript), então o ISBN/edição vêm do próprio resultado de busca, não de uma leitura confirmada da página |

**Observação sobre a citação de `guia2026-antimicrobianos`:** este slug não é uma referência
externa no sentido do ICMJE — é descrito como "guia integrado do usuário", ou seja, material de
compilação produzido pelo próprio usuário. Não avaliei nem reescrevi seu conteúdo; apenas
confirmo que ele não é (e não deveria ser tratado como) uma fonte primária externa — a Política
Editorial já registra essa ressalva em `fontesMeta`.

**Nenhuma recomendação clínica foi avaliada ou reescrita** para nenhuma das 6 fontes, conforme
instrução. Onde a fonte não sustenta sozinha uma afirmação (caso de `soares2026-sodio-agua`
usada como única referência em 21 itens `aprovada`), o achado foi apenas registrado para revisão
humana — não decidi se a afirmação está correta nem qual fonte deveria substituí-la.

## 4. Dependências por questão (resumo)

| Fonte pendente | Questões dependentes | Questões que dependem *só* dela | Estado editorial dessas questões |
|---|---:|---:|---|
| `souza2026-aula-radiografia-torax-basica` | 18 | 18 | 100% `em_revisao` |
| `soares2026-sodio-agua` | 24 | 21 | 23 `aprovada`, 1 `em_revisao` |
| `aulas2026-antimicrobianos` | 71 | 0 | 100% `em_revisao` |
| `guia2026-antimicrobianos` | 72 | 0 | 100% `em_revisao` |
| `guytonhall-fisiologia-medica` | 14 | 3 | 100% `pendente_revisao_conteudo` |
| `katzung-farmacologia-basica-clinica` | 19 | 5 | 100% `pendente_revisao_conteudo` |

(Uma mesma questão pode aparecer em mais de uma linha se citar mais de uma fonte pendente.)

## 5. Itens publicados afetados

- `medicina/radiografia-torax-basica.html` — 18 questões, todas dependentes de
  `souza2026-aula-radiografia-torax-basica`; 10 delas também exibem as imagens em triagem.
- `medicina/disturbios-sodio-agua.html` e `medicina/disturbios-sodio-agua-feitas.html` — 24
  questões dependentes de `soares2026-sodio-agua`, incluindo as 23 já `aprovada`.
- `medicina/antimicrobianos-fundamentos.html` — 76 questões, 71 citam
  `aulas2026-antimicrobianos` e 72 citam `guia2026-antimicrobianos` (nenhuma delas
  `aprovada` ainda).
- `medicina/seletor.html` — embute o banco inteiro; reflete todas as pendências acima.
- Nenhuma página de Endocardite Infecciosa é afetada (não usa nenhuma das 6 fontes nem as 10
  imagens).

## 6. Riscos por prioridade

Seguindo a ordem de risco de `PADRAO-INTEGRIDADE-CIENTIFICA-E-EDUCACIONAL.md`:

1. **Decisão terapêutica/diagnóstico apoiada em fonte única não verificável:** as 21 questões
   `aprovada` de Distúrbios de Sódio e Água apoiadas somente em `soares2026-sodio-agua`. É o
   achado de maior risco desta triagem — requer decisão humana (seção 8).
2. **Dados de paciente / imagem clínica:** as 10 imagens de radiografia, nenhuma com licença
   confirmada; `rxtorax-10` com risco adicional sobre o arquivo-fonte não recortado (seção 2).
3. **Números/epidemiologia dependentes de diretriz:** os 33 itens que dependem apenas de
   material de aula interno para antimicrobianos (`aulas2026-antimicrobianos`,
   `guia2026-antimicrobianos`) — nenhum ainda `aprovada`, risco menor por ora, mas caminho de
   aprovação exigirá complementação por fonte clínica forte (WHO AWaRe, EUCAST, IDSA), como já
   registrado em `fontesMeta`.
4. **Itens avaliativos usados para inferir domínio:** nenhuma alteração feita; risco
   estrutural já coberto por `RELATORIO-INTEGRIDADE.md`.
5. **Mecanismos estáveis:** as 33 questões que citam os livros-texto (Guyton & Hall, Katzung)
   têm risco baixo quanto à existência da obra (agora parcialmente confirmada), mas seguem
   `pendente_revisao_conteudo` até confirmação da edição exata em mãos.
6. **Formatação/estilo:** nenhum achado nesta sessão.

## 7. Evidências

- Metadados de imagem: lidos de `q.imagemMeta` em `banco-questoes.json` (não modificado).
- Metadados de fonte: lidos de `fontesMeta` em `fontes.json` (não modificado).
- Guyton & Hall — 14ª ed.: página oficial da editora GEN Guanabara Koogan,
  https://www.grupogen.com.br/guyton-e-hall-tratado-de-fisiologia-medica-9788595158610
  (consultada via busca e leitura direta em 2026-08-29).
- Katzung — 15ª ed.: resultado de busca apontando para a loja oficial da editora Grupo A,
  https://loja.grupoa.com.br/farmacologia-basica-e-clinica-15ed-9786558040187-p1020453
  (consultada em 2026-08-29; leitura direta da página não retornou conteúdo completo — ver
  ressalva na tabela da seção 3).
- Nenhum trecho extenso de fonte externa foi copiado; apenas título, edição, ano, ISBN e
  editora foram registrados.

## 8. Decisões que exigem o usuário

1. **Confirmar com o Dr. Felipe Souza** a proveniência real das 10 imagens de radiografia de
   tórax — de onde ele obteve cada radiografia e se há autorização de reprodução. Sem isso,
   proponho manter as 10 como `origem_desconhecida` (não `uso_suspenso`, pois não há indício de
   uso indevido, só ausência de comprovação).
2. **Confirmar com a Profa. Soares AE** a proveniência do material de sódio/água e, mais
   urgente: **decidir se as 21 questões `aprovada` que dependem só desse material** precisam
   ganhar uma segunda referência clínica antes de continuarem publicadas como `aprovada`, ou se
   o usuário considera o conteúdo já suficientemente coberto por revisão humana anterior. Não
   tomei essa decisão — é uma leitura clínica/editorial, fora do escopo desta triagem.
3. **Informar a edição física exata** de Guyton & Hall e de Katzung realmente usada (mesmo que
   coincida com a 14ª/15ª ed. agora localizadas), para fechar `fontesMeta.verificacao` como
   `verificada` em vez de `vaga_pendente`.
4. **Decidir sobre `rxtorax-10`:** se o arquivo-fonte não recortado (fora deste repositório)
   ainda existir com o professor, vale pedir confirmação explícita de que nenhum dado de
   paciente aparece fora da área já recortada, antes de tratar essa imagem como definitivamente
   segura.

## 9. Dados que não puderam ser confirmados

- Autoria original de qualquer uma das 10 radiografias (o professor que exibiu o slide é
  conhecido; quem produziu/capturou a imagem original, não).
- Licença, URL oficial e exigência de atribuição de qualquer uma das 10 imagens.
- Data/versão exata dos 4 materiais de aula internos (Souza — Radiografia de Tórax; Soares —
  Sódio e Água; PUCPR — Antimicrobianos I/II/III; guia integrado do usuário).
- Qual exemplar físico (edição) de Guyton & Hall e de Katzung o usuário efetivamente consultou
  — apenas a edição atualmente disponível no catálogo oficial de cada editora foi identificada,
  o que é uma **candidata provável**, não uma confirmação do exemplar em mãos.
- Se a 15ª edição de Guyton & Hall em português realmente existe (busca não encontrou
  confirmação em catálogo oficial; apenas a 14ª foi confirmada).

## 10. Plano para eventual atualização de metadados (não executado nesta sessão)

Caso o usuário confirme os itens da seção 8, a atualização (fora desta sessão) seguiria:

1. Para as imagens: preencher `imagemMeta.autorOuInstituicao`, `licenca`, `url` com os dados
   confirmados pelo Dr. Felipe Souza e mudar `statusDireitos` de `pendente_verificacao` para
   `verificado` (se confirmado) ou para o estado que o caso indicar — nunca por inferência.
2. Para `soares2026-sodio-agua`: se o usuário decidir complementar as 21 questões `aprovada`
   com uma segunda referência clínica, isso é edição de conteúdo/gabarito-adjacente e cai fora
   desta triagem — precisaria de uma sessão de revisão editorial dedicada, não uma correção
   mecânica de metadados.
3. Para Guyton & Hall / Katzung: se o usuário confirmar a edição em mãos, atualizar
   `fontes.json` trocando `verificacao: "vaga_pendente"` por `"verificada"` e preenchendo a
   citação com a edição exata (mantendo `atualizadoEm` e registrando em `correcoes.json` como
   atualização de referência, não como correção de erro).
4. Qualquer uma dessas mudanças exige rodar `node validar-banco.js` depois, e nenhuma altera
   `pergunta`, `alternativas`, `correta` ou `explicacao` de nenhuma questão.

---

# Correção pós-sessão (2026-08-29): classificação revisada de proveniência

Tudo a partir daqui foi escrito **depois** das seções 1–10, na mesma data, em resposta à
informação fornecida pelo usuário (ver "Nota de correção" no topo do documento). Nada abaixo
apaga ou reescreve as seções 1–10; esta parte **substitui, para fins de decisão editorial**, as
propostas de estado e as conclusões de risco que dependiam de tratar a origem das imagens como
inteiramente desconhecida. Nenhum arquivo do banco foi tocado — ver seção 13.

## 11. Imagens e fontes internas — classificação revisada

### 11.1 As dez radiografias

A origem **imediata** das dez imagens não é mais tratada como desconhecida: o usuário
confirmou que vieram do material de aula (o mesmo slide "Radiografia de Tórax Básica", Dr.
Felipe Souza, PUCPR Londrina, já identificado nas seções 2–3). O que a triagem original chamava
de "origem desconhecida" numa categoria só, esta correção separa em cinco perguntas
distintas, cada uma com seu próprio grau de confirmação:

| Camada | Estado | Base |
|---|---|---|
| Origem imediata (de onde a imagem foi extraída para uso nas questões) | **confirmada**: material de aula | Declaração do usuário nesta sessão |
| Docente/disciplina/instituição que exibiu o material | **confirmada, documentada localmente**: Dr. Felipe Souza, PUCPR Londrina, disciplina Pneumologia/Saúde do Adulto 1 | Já registrado em `imagemMeta`/seção 2 antes desta correção |
| Autoria original da radiografia (quem produziu/capturou a imagem) | **não confirmada** — nenhuma evidência encontrada aponta um autor | Ausência de metadado, marca d'água ou declaração |
| Licença original da radiografia | **não confirmada** — nenhuma evidência de licença aberta ou de terceiro | Ausência de metadado |
| Autorização para redistribuição pública | **não determinada** — não foi perguntada nem declarada | Questão em aberto, não presumida |

**Estado textual proposto para as 10 imagens** (substitui `origem_desconhecida` como rótulo
único):

```
origem_imediata_material_de_aula; autoria_e_licenca_originais_nao_documentadas
```

Isso não é uma reclassificação para "seguro" nem para "suspenso" — é uma descrição mais precisa
do que exatamente está e não está confirmado. Como já registrado na seção 2 original, não há
indício concreto de uso indevido (sem marca d'água de terceiro, sem identificação de paciente
no arquivo publicado); por isso esta correção **não propõe suspensão, substituição ou bloqueio**
das 10 imagens só pela ausência de documentação de licença — o que seria desproporcional à
ausência de evidência de problema, e o próprio usuário pediu explicitamente para não tratar a
lacuna documental dessa forma.

**`rxtorax-10` continua com tratamento à parte** (ver seção 12.1) — o overlay residual de
visualizador PACS/DICOM não foi examinado, e esta correção não altera essa pendência.

**Uso privado vs. compartilhado vs. publicado — diferenciação que faltava:**

- **Uso privado para estudo:** já ocorre e não depende de nenhuma confirmação adicional de
  licença — é o uso original do material de aula pelo próprio usuário.
- **Compartilhamento restrito dentro da disciplina:** não é o caso aqui; as imagens saíram do
  ambiente da disciplina para um banco de questões pessoal.
- **Publicação ou redistribuição pública:** `Questões/` **não é um repositório Git e não tem
  deploy público confirmado** (diferente de `provas/`, que é publicado via GitHub Pages — ver
  `_banco/LEIA-ME.md`). As páginas `medicina/*.html` que embutem essas imagens são arquivos
  locais dentro do OneDrive do usuário. **Não há evidência nesta auditoria de que essas páginas
  estejam hospedadas publicamente na internet.**

Como a finalidade de publicação atual não está documentada neste relatório, ela fica registrada
como **questão em aberto** — não presumo publicação pública, e também não presumo uso
exclusivamente privado além do que já está confirmado (uso em banco de questões pessoal). Se o
usuário pretende publicar essas páginas publicamente no futuro, essa é a camada ("autorização
para redistribuição pública") que segue não determinada e exigiria confirmação separada antes
da publicação — não antes do uso privado atual.

### 11.2 Os quatro materiais de aula internos

`souza2026-aula-radiografia-torax-basica`, `soares2026-sodio-agua`,
`aulas2026-antimicrobianos` e o guia integrado do usuário (`guia2026-antimicrobianos`, que já
era tratado à parte por ser autoria do próprio usuário — ver seção 3, observação) deixam de ser
lidos, nesta correção, como fontes documentalmente frágeis só por não estarem publicados na
internet. Classificação revisada:

| Camada | Estado |
|---|---|
| Origem | Interna / material de aula (docente e disciplina identificados, exceto o guia do usuário, que é autoral) |
| Existência pública (indexável, com URL/DOI) | Não verificável — por definição, material de curso não costuma ter publicação pública, o que não é o mesmo que "não existir" ou "ser inválido" |
| Confirmação documental local (o professor confirmar o conteúdo/versão exata) | Pendente — segue dependendo de contato direto com o docente responsável, como já registrado na seção 3 |

**Três perguntas que a categoria `não_localizada` original misturava, agora separadas:**

1. **Adequação ao escopo da disciplina:** alta. Material de aula é, por definição, a fonte mais
   diretamente alinhada ao que foi efetivamente ensinado — é a base mais forte possível para
   afirmar que uma questão corresponde ao conteúdo ministrado.
2. **Rastreabilidade bibliográfica externa:** baixa/nula, e isso é esperado e não é um defeito
   do material — não é um artigo, livro ou diretriz publicada, é uma aula.
3. **Força como evidência clínica independente:** limitada — um slide de aula não substitui uma
   diretriz, um ensaio ou um livro-texto revisado por pares quando a afirmação é clínica,
   quantitativa ou terapêutica e controversa (Política Editorial, princípio 2). Isso não muda
   com a confirmação de que a origem é material de aula; pelo contrário, é exatamente o que a
   política já previa para este tipo de fonte.

Nenhuma das 4 fontes internas passa a `verificada` nem a `não_localizada` deixa de ser o rótulo
técnico correto para "sem URL/DOI pública" — o que muda é que esta correção deixa de tratar essa
ausência como sinônimo de fonte inválida ou insuficiente para o propósito 1 (aderência ao
conteúdo da disciplina).

## 12. Correção pós-sessão: `rxtorax-10` e as 21 questões de Sódio e Água

### 12.1 `rxtorax-10`

Mantida apenas a recomendação de **inspeção visual local** do overlay residual (resíduo de
visualizador PACS/DICOM: texto truncado "...oge: 3 of 3", "IM: 200x", régua de medida). Esta
correção **não conclui** que o overlay contém dado pessoal — a seção 2 original já não afirmava
isso, mas usava linguagem que podia ser lida como presumindo risco de identificação; o estado
textual correto, explícito, é:

```
overlay ainda não examinado quanto a conteúdo técnico, institucional ou identificável
```

Nenhuma ação de edição, recorte, substituição, extração de metadados ou envio a serviço externo
foi executada por esta auditoria, nem é proposta agora. A única ação recomendada permanece a
inspeção visual direta do arquivo já presente no repositório, por um humano, sem qualquer
processamento automatizado da imagem.

### 12.2 As 21 questões de Sódio e Água que dependem só de `soares2026-sodio-agua`

**Correção de contagem:** a seção "Resumo executivo" e a seção 8 (item 2) desta triagem
original falam em "21 questões `aprovada`" dependendo só dessa fonte. Reconferindo o banco
diretamente nesta correção: são **21 questões no total** com `soares2026-sodio-agua` como única
referência, mas apenas **20 estão `aprovada`** — a 21ª (`sodio-agua-04`) está `em_revisao`. As
outras 3 questões de Sódio e Água que citam `soares2026-sodio-agua` (`sodio-agua-10`,
`sodio-agua-16`, `sodio-agua-17`) já citam uma segunda fonte (`spasovski2014-hiponatremia`) e
por isso não entram neste grupo de dependência única. Nenhum estado editorial foi alterado por
esta recontagem — é só a leitura numérica correta do banco, registrada aqui porque o número
"21" estava sendo usado de forma imprecisa.

**Nenhum estado `aprovada` foi alterado.** Nenhum rebaixamento automático é proposto. Registro
explícito, como pedido: o material de aula do Dr./Profa. Soares pode sustentar tanto a
**aderência ao conteúdo ministrado** quanto a **validade dentro do escopo da disciplina** para
essas 20 questões — a ausência de fonte externa publicada não é, por si só, motivo para
questionar isso.

**Diferenciação por risco clínico (não por proveniência):** das 21 questões (20 `aprovada` + 1
`em_revisao`), a leitura do conteúdo de cada uma (enunciado, alternativas e explicação) separa
dois grupos:

- **9 questões contêm o tipo de afirmação que a Política Editorial (princípio 2) trata como
  exigindo reforço por fonte clínica além do material de aula** — porque envolvem conduta
  terapêutica, diagnóstico de caso clínico, limiar de classificação ou prioridade/urgência:

  | id | estado | por que entra neste grupo |
  |---|---|---|
  | `sodio-agua-04` | `em_revisao` | classificação de gravidade da depleção do VEC por limiar percentual (5%/10%/30%) aplicada a um caso |
  | `sodio-agua-08` | `aprovada` | conduta terapêutica inicial em hiponatremia hipervolêmica (caso de IC) |
  | `sodio-agua-09` | `aprovada` | conduta terapêutica inicial em hiponatremia hipovolêmica (caso com tiazídico) |
  | `sodio-agua-11` | `aprovada` | conduta terapêutica em hipernatremia por ganho de sódio hipertônico |
  | `sodio-agua-12` | `aprovada` | **prioridade terapêutica** (urgência) em queimado com hipernatremia |
  | `sodio-agua-19` | `aprovada` | diagnóstico diferencial aplicado a caso clínico (SCPS vs. SIHAD) |
  | `sodio-agua-20` | `aprovada` | conduta terapêutica na síndrome cerebral perdedora de sal |
  | `sodio-agua-22` | `aprovada` | diagnóstico de caso clínico (diabetes insípido pós-hipofisário) |
  | `sodio-agua-23` | `aprovada` | indicação terapêutica condicional (quando desmopressina é apropriada) |

  Para estas 9, a recomendação é **fonte clínica complementar** (por exemplo, a mesma
  `spasovski2014-hiponatremia` já usada em 3 questões correlatas do próprio tema, ou diretriz
  equivalente para os quadros de diabetes insípido/SCPS) — **sem alterar** pergunta,
  alternativas, gabarito, explicação ou estado editorial. Nenhuma dessas 9 afirmações foi
  avaliada quanto a estar certa ou errada; a recomendação é só sobre reforço documental.

  Nenhuma das 9 contém dose numérica de medicamento (mg, mEq/kg etc.) nem linguagem explícita
  de contraindicação — os termos de busca correspondentes não encontraram ocorrência no
  conjunto das 21 questões.

- **12 questões são mecanismo estável ou conteúdo descritivo/conceitual** — fisiologia de
  compartimentos hídricos, fórmulas, proporções de reabsorção tubular, definições conceituais de
  natremia, ou classificação/etiologia apresentada como conhecimento a recordar, sem aplicação a
  caso clínico decisório: `sodio-agua-01`, `02`, `03`, `05`, `06`, `07`, `13`, `14`, `15`, `18`,
  `21`, `24` (todas `aprovada`). Para estas, o material de aula como referência única é
  proporcional ao risco — não recebem a mesma recomendação de fonte complementar, conforme
  pedido explícito de não tratar mecanismo estável com o mesmo risco de conduta clínica.

  Observação de fronteira: `sodio-agua-13`, `15`, `21` e `24` tocam em diagnóstico
  diferencial/etiologia (por exemplo, causas de SIHAD, diferença entre DI central e nefrogênico)
  mas de forma conceitual/comparativa, sem caso clínico com decisão a ser tomada — por isso
  foram mantidas no grupo de menor risco. Se o usuário preferir tratá-las com o mesmo cuidado do
  primeiro grupo, é uma escolha editorial razoável; esta correção apenas registra o critério
  usado e deixa a decisão para revisão humana.

## 13. Verificação — nada além deste relatório foi alterado

Hashes SHA-256 recalculados nesta correção, comparados byte a byte com a tabela da seção 1
(baseline da sessão original):

| Arquivo | Inalterado? |
|---|---|
| `banco-questoes.json` | ✅ idêntico ao hash da seção 1 |
| `fontes.json` | ✅ idêntico ao hash da seção 1 |
| `correcoes.json` | ✅ idêntico ao hash da seção 1 |
| `imagens/pneumologia/rx-caso-02-mediastino.png` … `rx-caso-11-abdome.png` (10 arquivos) | ✅ todos idênticos aos hashes da seção 1 |

Nenhuma página `medicina/*.html`, nenhum `spec` em `_banco/specs/`, nenhum estado editorial e
nenhuma questão do banco foram lidos com intenção de alterar, nem alterados, por esta correção
— apenas lidos os campos já existentes (`referencias`, `estadoEditorial`, `pergunta`,
`alternativas`, `explicacao`) para reclassificar a proveniência e diferenciar risco clínico, sem
escrever nada de volta nesses campos. O único arquivo modificado por esta sessão é este próprio
relatório (`RELATORIO-PROVENIENCIA-E-FONTES.md`).
