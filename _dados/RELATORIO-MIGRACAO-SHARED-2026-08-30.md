# Migração para `_shared/` — 2026-08-30

## Contexto e decisão de escopo

Antes de tocar em qualquer HTML, foram lidos `_banco/LEIA-ME.md`, `_banco/POLITICA-EDITORIAL.md` e `_dados/LEIA-ME.md`. Ponto decisivo: **os HTMLs em `medicina/*.html` (exceto `seletor.html`) são artefatos gerados** por `_banco/gerar-lista.js` a partir de `_banco/template-quiz.html` + `banco-questoes.json` + `fontes.json` (confirmado por `montar-html.js`: o gerador só faz um `template.replace("__QUIZ_DATA_JSON__", ...)`). `medicina/seletor.html` é gerado de forma equivalente por `_banco/gerar-seletor.js` a partir de `_banco/template-seletor.html`. Todos os 9 arquivos de `medicina/*.html` (exceto `seletor.html`) têm spec correspondente em `_banco/specs/`, confirmando que são build artifacts.

Por isso, seguindo a regra 4 do pedido ("não migre HTMLs que sejam claramente gerados sem confirmar antes"), a extração foi feita **nos templates-fonte**, não nos HTMLs finais — editar os gerados diretamente seria sobrescrito na próxima regeneração e divergiria da fonte.

## O que foi extraído para `_shared/`

Comparado byte-a-byte `_banco/template-quiz.html` × `_banco/template-seletor.html` (que já compartilhavam ~70% do CSS e o motor de quiz inteiro em JS, duplicado por terem evoluído em paralelo).

- **`_shared/theme.css`** — variáveis de tema (claro `:root`, `:root[data-theme="dark"]`, paleta pré-sono `:root[data-palette="presleep"]` e a combinação escuro+pré-sono), além de todos os componentes de quiz que eram idênticos nos dois templates: `.question-card`, `.option`, `.certainty-box`, `.open-answer`/`.self-assessment`, `.post-choice`, `.quality-review`, `.explanation`, `.refs`, `.toolbar`/`.score`/botões de exportar, `.segmented-control`, `.settings-overlay`/`.settings-dialog` (diálogo de configurações inteiro) e todo o modo `body[data-view="focus"]`.
- **`_shared/app.js`** — o motor de quiz inteiro (idêntico, função por função, nos dois templates): `renderQuiz`, `selectOption`, `finalizeChoiceAnswer`, `submitOpenAnswer`/`assessOpenAnswer`/`finalizePartialAnswer`/`finalizeOpenAnswer`, `renderPreAnswerCertainty`, `recordQualityReview`, `saveRegistro`/`saveQualityReviews` e helpers de download/nome de arquivo, `updateScore`, `resetQuiz`, `renderRefs`; mais o sistema de preferências (`preferenceStore`, `setTheme`/`setPalette`/`setView`/`updateFocusView`) e o diálogo de configurações (generalizado para qualquer número de botões `.settings-trigger` — o seletor tem dois, o quiz tem um; o comportamento observável não muda).

O que **ficou local** em cada template (por ser específico ou já divergente):
- Cabeçalho, `.container`, e o botão `.settings-trigger` em si (flutuante no quiz; inline no cabeçalho/toolbar do seletor) — visualmente diferentes por design.
- `.editorial-notice` (quiz, cores fixas) vs `.editorial-note` (seletor, variáveis `--notice-*`) — nomes de classe já divergiam antes desta migração; unificar exigiria renomear marcação, fora do escopo de uma extração puramente estrutural.
- Painel de seleção por hierarquia (`.selector-panel`, `.chip`, `.hierarchy-breadcrumb` etc.) — exclusivo do seletor.
- Botões extras `export-progress`/`export-quality` — exclusivos do quiz.
- Pequena divergência pré-existente preservada de propósito: o `:focus-navigation button:hover` do seletor tinha um `:hover:not(:disabled)` que o quiz nunca teve — mantido como estava (não uniformizado), para não alterar comportamento visual do quiz.
- Handlers de scroll de "anterior/próxima" (diferem em 1 linha: `scrollTo top:0` no quiz vs `scrollTo top: quiz-area.offsetTop` no seletor) — mantidos locais por serem poucas linhas com diferença real de comportamento.

## Inventário

| Arquivo | Situação |
|---|---|
| `_banco/template-quiz.html` | Migrado — `<link _shared/theme.css>` + `<script src=_shared/app.js>` |
| `_banco/template-seletor.html` | Migrado — idem, mais suporte novo a deep-link (`?hierarquia=&highlight=`, usado pela busca Ctrl+K do `index.html`, ver relatório separado) |
| `medicina/seletor.html` | Regenerado via `node gerar-seletor.js` a partir do template migrado |
| `medicina/*.html` (8 listas geradas) | Regeneradas via `node gerar-lista.js specs/<nome>.json ../medicina/<nome>.html`, uma por spec em `_banco/specs/` |
| `index.html` | Não migrado para `_shared/` nesta passada — ver "Não migrado" abaixo (também recebeu a busca Ctrl+K, relatório separado) |
| `_dados/dashboard.html` | Não migrado — mesmo motivo |

### Não migrado / risco conhecido

- **`index.html`** e **`_dados/dashboard.html`** também têm seu próprio sistema de tema claro/escuro/pré-sono e diálogo de configurações, com CSS parecido mas não idêntico ao dos templates de quiz (larguras de diálogo diferentes, variáveis ausentes como `--accent-soft`/`--correct`/`--wrong`, e no caso do dashboard um arquivo de 743 linhas com estrutura própria de painel). Unificar essas duas páginas com `_shared/theme.css` é possível, mas exigiria decidir quais variações são intencionais vs. acidentais — deixado como item futuro para não arriscar o layout dessas páginas nesta passada. `index.html` além disso estava sob edição ativa recente (vários `index.html.bak-*` na raiz de `Questões/`), o que reforçou a decisão de não mexer no tema dela agora.

## Testes realizados

1. **Regeneração determinística**: `node gerar-seletor.js` e `node gerar-lista.js` para as 8 specs rodaram sem erro e reportaram as mesmas contagens de questões/fontes que antes da migração (214 questões no seletor; contagens por lista idênticas às da versão de backup).
2. **Diff estrutural**: comparado cada HTML gerado contra o backup pré-migração ignorando `<style>`/`<script>` — o único diff fora deles é a linha nova `<link rel="stylesheet" href="../_shared/theme.css">` e a tag `<script src="../_shared/app.js">`; todo o resto do HTML (marcação de perguntas, JSON de dados) é idêntico.
3. **Sintaxe JS**: `node --check _shared/app.js` e verificação de parse (`new Function`) de todos os blocos `<script>` inline dos HTMLs gerados — sem erros.
4. **Colisão de variáveis**: varredura automatizada de `let`/`const` no `_shared/app.js` contra os `<script>` locais dos dois templates — nenhuma redeclaração de topo de escopo (o único nome repetido, `file`, é uma variável de laço `for...of` dentro de função, sem conflito de escopo).
5. **Checagem de funções**: toda função chamada via `onclick="..."` ou pelos scripts locais (`saveRegistro`, `saveQualityReviews`, `resetQuiz`, etc.) está definida em `_shared/app.js` e nenhuma delas foi deixada duplicada nos templates.

Não foi possível abrir os arquivos num navegador real nesta sessão (ambiente sem UI gráfica); a verificação foi feita por análise estática (parse JS, diff de HTML, checagem de nomes). Recomenda-se abrir `medicina/seletor.html` e uma lista como `medicina/endocardite.html` manualmente e alternar tema claro/escuro, paleta pré-sono e modo foco para confirmação visual final.

## Backups

Cópia de todos os arquivos tocados (antes de qualquer edição) em `_banco/_archive/2026-08-30-shared-foundation/`:
`template-quiz.html.bak`, `template-seletor.html.bak`, `index.html.bak`, `dashboard.html.bak`, e um `.bak` de cada HTML em `medicina/`.

`banco-questoes.json`, `correcoes.json` e `fontes.json` não foram tocados.
