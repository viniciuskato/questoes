# Painel de desempenho — como funciona

Como as questões rodam como arquivo local (sem servidor), o acompanhamento de desempenho funciona em duas partes:

1. **Ao responder cada questão**, além de ver se acertou, marque como chegou naquela resposta: soube a certa direto, soube por eliminação (não sabia a certa, mas sabia que as outras estavam erradas) ou chutou. Isso é o que separa domínio real de sorte — uma questão "acertada" por chute não é a mesma coisa que uma que você realmente sabe.
2. **Ao terminar (ou parar) de responder**, clique em "Baixar registro da sessão" no topo da página. Isso baixa um `.json` com o que você respondeu, certo/errado por questão, categoria e a forma como chegou em cada resposta.
3. **Mova esse arquivo para `Questões/_dados/registros/`** (fica salvo no OneDrive, sincroniza entre seus dispositivos).
4. **Para montar uma sessão sem repetir itens**, abra `Questões/medicina/seletor.html`, marque “Remover questões já feitas” e selecione essa mesma pasta `registros/`. A exclusão usa `qId`, independentemente da lista personalizada de origem.
5. **Abra `Questões/_dados/dashboard.html`** e clique em "Selecionar pasta de registros", apontando para essa mesma pasta `registros/`. O painel carrega todos os `.json` de uma vez e mostra:
   - Acerto geral e por sessão, com tendência ao longo do tempo por banco de questões.
   - Acerto por categoria (ex.: Diagnóstico, Tratamento, Microbiologia) — as mais fracas aparecem primeiro.
   - **Prioridade alta:** questões em que você achou que sabia, mas errou (na tentativa mais recente).
   - **Acertos que não são domínio garantido:** questões que você só acertou por eliminação ou chute — vale revisar mesmo estando "certas".
   - **Calibração de confiança:** sua taxa de acerto separada por "quando disse que sabia", "quando eliminou as erradas" e "quando chutou" — mostra se sua confiança bate com a realidade.
   - **Perfil de domínio em quatro níveis**, calculado pela tentativa mais recente de cada item:
     - **Consolidado:** evocação aberta correta, antes de ver alternativas.
     - **Disponível com pista:** acerto após reconhecimento da alternativa ou eliminação.
     - **Parcial:** núcleo da resposta presente, mas incompleto; não é tratado como erro.
     - **Não dominado:** erro, chute ou confiança equivocada.
   - As questões individuais mais erradas ao longo de todo o histórico, para revisão dirigida.
   - **Análise global por item:** o mesmo `qId` é reunido mesmo quando apareceu em `quizId`/listas diferentes. Tentativas de versões distintas (`itemVersion`) permanecem separadas.
   - **Dificuldade observada:** proporção de erros por item e versão, sempre acompanhada de `n`. Trata-se do desempenho da amostra carregada, não de dificuldade intrínseca.
   - **Distratores:** frequência de escolha de cada alternativa errada, indicação das nunca escolhidas (quando o registro contém a lista completa de alternativas) e alerta de possível ambiguidade quando houve escolha errada com alta confiança.
   - **Tempo de resposta:** mediana e quantidade de observações temporizadas quando o registro fornece `responseTimeMs`/`durationMs` ou os timestamps `certaintyMarkedAt` e `answeredAt`.

## Compatibilidade e limites

- Registros antigos sem `itemVersion` aparecem no estrato **“sem versão (legado)”**.
- Registros sem `qId` continuam visíveis, mas são isolados por lista, índice e enunciado; não é seguro uni-los globalmente.
- Registros sem texto da alternativa mostram o índice legado quando disponível. Eles contam na dificuldade, mas não permitem inferir distratores nunca escolhidos.
- “Possível ambiguidade” é uma triagem editorial: uma escolha errada com confiança `know` ou `false-confidence` gera o alerta, que precisa de revisão humana e ganha peso somente com amostra maior.
- A discriminação clássica não é calculada com menos de 30 tentativas, menos de dois usuários identificados ou sem um escore independente por usuário. Repetições do mesmo usuário não substituem uma amostra de alunos.

Os testes automatizados usam apenas registros sintéticos em `Questões/tests/`; essa pasta não deve ser selecionada como fonte do painel e não se mistura a `_dados/registros/`. Para executá-los: `node --test tests/dashboard-analytics.test.js`.

O painel guarda o último carregamento no navegador (cache local), então não precisa reselecionar a pasta toda vez — só quando houver registros novos.

Esse formato funciona para qualquer banco de questões futuro (não só endocardite): cada novo material em `Questões/<área>/` que seguir o mesmo padrão de exportação aparece automaticamente agregado no mesmo painel.
