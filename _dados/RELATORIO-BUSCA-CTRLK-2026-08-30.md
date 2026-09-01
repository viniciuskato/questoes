# Busca global Ctrl+K — 2026-08-30

## Estado do `_shared/` no momento da implementação

Esta sessão criou `Questões/_shared/` (não existia antes) na mesma janela de trabalho, para uma tarefa anterior de extração de CSS/JS dos templates de quiz (ver `RELATORIO-MIGRACAO-SHARED-2026-08-30.md`). No momento em que a busca foi implementada, `_shared/` já continha `theme.css` e `app.js` — mas **nenhum dos dois é um utilitário genérico de busca**: são o tema visual e o motor de perguntas/respostas do quiz. Não havia nada reaproveitável ali para esta funcionalidade, então a busca foi implementada localmente em `index.html`, como a regra 5 do pedido previa para o caso de não haver algo pronto. Se outra sessão também estiver mexendo em `_shared/` em paralelo, não deve haver conflito: esta tarefa só leu esses arquivos, não os alterou.

## O que foi implementado

1. **Atalho `Ctrl+K`** (também aceita `Cmd+K`) em `index.html`, com `preventDefault` para não competir com atalhos do navegador. Abre um modal (`#search-overlay`) com campo de texto, resultados e rodapé de contagem.
2. **Fonte dos dados**: a busca lê `_banco/banco-questoes.json` via `fetch()`, no navegador, sob demanda (só na primeira abertura do modal) — **somente leitura**, o arquivo nunca é escrito. O campo usado é `data.questoes` (confirmado: 214 itens, cada um com `classificacao.hierarquia`, `tags`, `estadoEditorial`).
3. **Campos pesquisados**: texto do enunciado (`pergunta`), `tema`, `categoria`, `tags`, todos os níveis de `classificacao.hierarquia` e `estadoEditorial` — tudo normalizado (minúsculo, sem acento) e combinado num único texto de busca por questão, filtrado por todos os termos digitados (busca "E", não "OU").
4. **Performance**: o índice é montado uma vez (214 itens, custo desprezível) e cacheado em memória após o primeiro carregamento; a filtragem em si roda a cada busca, mas só é disparada com **debounce de 150 ms** depois que o usuário para de digitar, e os resultados exibidos são limitados a 40 (com contagem "mostrando N de M" quando há mais).
5. **Navegação até a questão**: cada resultado mostra o caminho da hierarquia, um trecho do enunciado e badges de tags/estado. Ao clicar (ou `Enter` no item ativo, navegável com ↑/↓), o navegador vai para `medicina/seletor.html?hierarquia=<hierarquia-JSON>&highlight=<qId>`. Foi adicionado suporte a esses dois parâmetros de URL em `_banco/template-seletor.html` (e propagado ao `medicina/seletor.html` gerado via `node gerar-seletor.js`): a página pré-seleciona esse caminho da hierarquia, inicia a sessão automaticamente e rola até o card da questão específica, destacando-o por ~2,6s com um contorno.
6. **`Esc` fecha a busca** sem conflitar com o `Esc` que já fecha o diálogo de configurações (checados independentemente, cada overlay cuida do seu próprio estado).

## Decisões de UX

- **Deep-link por hierarquia completa, não só por tema**: o link gerado usa `classificacao.hierarquia` inteira (ex.: `Medicina › Infectologia › Endocardite Infecciosa › Epidemiologia`), não só o tema raiz. Isso abre uma sessão já filtrada bem perto da questão buscada, em vez de cair no banco inteiro — trade-off consciente: a sessão fica mais estreita (pode ter poucas questões), mas mais relevante ao que foi buscado.
- **Sem índice de busca pré-computado**: com ~214 itens, uma varredura linear por tecla (com debounce) é instantânea; não valia a pena construir um índice invertido ou dependência externa.
- **Falha de `fetch()` tratada como estado esperado, não erro silencioso**: abrir `index.html` direto por duplo clique (`file://`) faz o Chrome/Edge bloquear `fetch()` de outro arquivo local por política de mesma origem. A busca detecta isso e troca a mensagem do modal por uma explicação com o comando (`npx serve .` ou equivalente) para habilitá-la via servidor estático — em vez de a caixa de busca simplesmente não retornar nada.
- **Reaproveitado o padrão de overlay já existente** (`.settings-overlay`) como referência visual para o novo `.search-overlay`, mas como uma classe CSS própria (`body.search-open`) em vez de reusar `body.settings-open`, para não haver risco de um modal fechar e destravar o scroll enquanto o outro ainda está aberto.

## Testes realizados

- **Sintaxe**: extração e `new Function(...)` de todos os blocos `<script>` inline de `index.html` e do `medicina/seletor.html` regenerado — sem erros.
- **Checagem estática de dados**: script Node confirmando que `_banco/banco-questoes.json` tem `questoes` como array de 214 itens, todos com `classificacao.hierarquia` presente (necessário para o link de hierarquia funcionar em 100% dos casos).
- **Não foi possível abrir um navegador real nesta sessão** (ambiente sem UI gráfica) — a verificação funcional completa (abrir o modal, digitar, navegar por teclado, clicar num resultado e confirmar o destaque na questão) fica pendente de um teste manual local. Recomendado: abrir `index.html` via `npx serve .` (ou equivalente), apertar Ctrl+K, buscar por um termo como "endocardite" ou uma tag como "epidemiologia", e confirmar que o clique leva a `medicina/seletor.html` já com a sessão iniciada e a questão destacada.

## Limitações conhecidas

- A busca **não funciona ao abrir `index.html` por duplo clique** (protocolo `file://`), só via servidor estático local — comportamento inerente ao `fetch()` de arquivos locais no Chromium, não uma falha da implementação. A mensagem de erro no modal explica isso ao usuário.
- O link de destino filtra pela hierarquia completa da questão; se duas questões tiverem exatamente a mesma hierarquia, ambas aparecem na sessão gerada, mas só a buscada é destacada.
- Sem paginação real além do corte em 40 resultados — buscas muito genéricas (ex.: uma letra só) são bloqueadas pelo mínimo de 2 caracteres, mas termos curtos e comuns ainda podem truncar resultados relevantes; o rodapé avisa quando isso acontece.
- `gerar-seletor.js` foi executado ao final (`node gerar-seletor.js`) porque `_banco/template-seletor.html` foi alterado (deep-link); `medicina/seletor.html` está portanto atualizado. Nenhum outro script gerador precisou rodar — `index.html` não é gerado por script.

## Arquivos alterados

- `index.html` — modal de busca, atalho Ctrl+K, CSS do modal.
- `_banco/template-seletor.html` — suporte a `?hierarquia=&highlight=` e destaque visual da questão.
- `medicina/seletor.html` — regenerado a partir do template acima.
- Backup pré-edição: `_banco/_archive/2026-08-30-shared-foundation/index.html.bak-antes-busca-ctrlk` (além do `index.html.bak` já feito para a tarefa de `_shared/`, que também precede esta edição).

`banco-questoes.json`, `correcoes.json` e `fontes.json` não foram alterados — a busca é somente leitura.
