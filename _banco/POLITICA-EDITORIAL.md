# Política editorial e de qualidade do Banco de Questões

**Versão:** 1.0  
**Vigência:** 2026-08-29

## Finalidade e limites

Este banco é um recurso educacional de estudo e avaliação formativa em saúde. Não é uma
diretriz clínica, não substitui julgamento profissional e não recebe certificação do
ICMJE. O projeto adapta os princípios pertinentes do ICMJE para integridade editorial;
usa o *NBME Item-Writing Guide* para qualidade de itens; e adota validade, equidade e
interpretação responsável de resultados conforme os *Standards for Educational and
Psychological Testing*.

## Princípios obrigatórios

1. **Responsabilidade humana:** uma ferramenta de IA nunca é autora, revisora responsável
   ou fonte primária. Conteúdo assistido por IA permanece sob responsabilidade humana.
2. **Proveniência:** toda questão informa sua origem e aponta para referências cadastradas.
   Material de aula define escopo pedagógico, mas não basta sozinho para sustentar uma
   afirmação clínica controversa, quantitativa ou terapêutica.
3. **Evidência calibrada:** fato estável, recomendação, ensaio, observação, hipótese
   mecanística e controvérsia não são apresentados como equivalentes.
4. **Uma única melhor resposta:** o enunciado deve permitir formular a resposta antes da
   leitura das alternativas. Distratores representam erros reais e pertencem à mesma
   categoria lógica.
5. **Sem pistas artificiais:** extensão, gramática, absolutos caricaturais, sobreposição e
   detalhe desproporcional não podem denunciar o gabarito.
6. **Explicação completa:** explica a correta e o erro conceitual de cada distrator, além
   de explicitar dependências de população, diretriz, protocolo ou epidemiologia local.
7. **Equidade:** características pessoais só aparecem quando clinicamente pertinentes;
   linguagem estigmatizante e associações demográficas sem base são evitadas.
8. **Privacidade e direitos:** imagens exigem origem, licença e avaliação de
   identificabilidade. Material clínico identificável requer base legítima e consentimento.
9. **Correções transparentes:** alteração clínica relevante gera registro de correção;
   versões anteriores são preservadas no histórico técnico.
10. **Resultados formativos:** dificuldade, discriminação e desempenho de distratores são
    usados para melhorar itens, não para extrapolar competência além do construto avaliado.
11. **Questões autocontidas:** todo item deve poder ser compreendido e respondido sem acesso
    ao tutorial, caso clínico, aula, arquivo ou conversa que serviu de fonte. O material de
    origem orienta o conteúdo, mas não integra o enunciado por referência implícita. Quando
    dados clínicos forem necessários, eles devem ser reapresentados no próprio item com
    formulação independente (por exemplo, “Paciente apresenta...”); não usar nomes ou
    expressões como “o caso de X”, “o caso apresentado”, “conforme o tutorial”, “no material
    acima” ou equivalentes. Referências bibliográficas e imagens explicitamente incorporadas
    ao item não constituem dependência implícita.

## Estados editoriais

- `pendente_revisao_conteudo`: estrutura válida, conteúdo ainda não auditado pelo padrão
  integrado.
- `em_revisao`: auditoria em andamento.
- `aprovada`: conteúdo, referências e construção do item foram revisados.
- `requer_atualizacao`: nova evidência ou diretriz pode ter tornado o item desatualizado.
- `suspensa`: não deve ser publicada nem usada até correção.
- `retirada`: preservada apenas para histórico.

Migração mecânica nunca promove uma questão para `aprovada`.

## Lições de qualidade acumuladas

`LICOES-QUALIDADE-ITENS.md` registra defeitos concretos já encontrados por revisão humana em
itens publicados (respondibilidade por exclusão, gabarito óbvio, dependência implícita do
material de origem, explicação que referencia alternativas por letra fixa apesar do embaralhamento
na exibição, viés de comprimento, dado inventado, afirmação não sustentada) e a regra prática para
não repeti-los. Consultar antes de escrever ou revisar qualquer item.

## Revisão mínima para aprovação

- Conferir a fonte primária ou institucional e a correspondência com gabarito/explicação.
- Registrar natureza e contexto da evidência quando clinicamente relevantes.
- Executar os testes de resposta coberta, distratores isolados e ocultação.
- Confirmar que enunciado, alternativas e explicação são autocontidos e não pressupõem o
  material usado para criar a questão.
- Verificar uma única melhor resposta e ausência de alternativa duplicada ou inclusiva.
- Conferir linguagem, representatividade e pertinência de características do paciente.
- Documentar uso material de IA e validação humana.
- Conferir origem/licença/privacidade de imagens.
- Registrar responsável e data da auditoria.

## Governança de fontes

Cada slug de `fontes.json` possui metadados editoriais. O texto da citação continua sendo
o formato exibido; `fontesMeta` registra tipo, estado de verificação, identificadores,
vigência e eventual substituição. Uma referência `pendente` pode permanecer durante a
migração, mas o validador a sinaliza e uma questão não pode ser aprovada com fonte central
não conferida.

## Correções

`correcoes.json` registra questão, data, tipo, campos alterados, motivo, referências e
responsável. Erros factuais ou clínicos exigem correção; mudança legítima de ciência ou
diretriz é registrada como atualização, não como má conduta. O banco e os HTMLs publicados
devem apontar sempre para a versão vigente.

## Uso de IA

O projeto declara, no nível do banco e de cada item, se o uso de IA é conhecido. Na
migração, itens antigos recebem `nao_documentado`, jamais uma declaração presumida. Antes
da aprovação, registrar finalidade (por exemplo: geração inicial, edição, auditoria de
distratores, tradução) e confirmar validação humana. Não inserir material confidencial ou
identificável em sistemas cuja confidencialidade não esteja assegurada.

## Psicometria e manutenção

Quando houver volume suficiente, acompanhar por `qId`: tentativas, acertos, tempo,
discriminação, escolha de cada distrator, abandono e contestações. Itens com distrator
inoperante, discriminação negativa, ambiguidade ou comportamento incompatível com sua
finalidade devem voltar a `em_revisao` ou ser `suspensa`.

## Referências normativas

- International Committee of Medical Journal Editors. *Recommendations for the Conduct,
  Reporting, Editing, and Publication of Scholarly Work in Medical Journals*. Janeiro de
  2026. https://www.icmje.org/recommendations/
- National Board of Medical Examiners. *NBME Item-Writing Guide: Constructing Written Test
  Questions for the Health Sciences*. 6ª ed., 2024.
- AERA, APA, NCME. *Standards for Educational and Psychological Testing*. 2014.
