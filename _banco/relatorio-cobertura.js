#!/usr/bin/env node
/**
 * Mapa de cobertura do banco: por tema, cruza volume, competências, complexidade
 * e estado editorial (aprovadas vs. pendentes). Inclui também o vínculo com
 * provas/ (classificacao.provaRefs), quando existir.
 *
 * Uso: node relatorio-cobertura.js
 */
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const bank = JSON.parse(fs.readFileSync(path.join(dir, "banco-questoes.json"), "utf8"));

const countBy = (items, fn) => Object.entries(items.reduce((acc, item) => {
  const key = fn(item) || "não informado";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));

const APROVADO = new Set(["aprovada"]);
const PENDENTE = new Set(["pendente_revisao_conteudo", "em_revisao", "requer_atualizacao"]);

const temas = [...new Set(bank.questoes.map(q => q.tema))].sort((a, b) => a.localeCompare(b, "pt-BR"));

const linhas = [
  "# Mapa de cobertura do banco",
  "",
  `Gerado em **${bank.atualizadoEm}** a partir do banco central. Não editar manualmente; rode \`node relatorio-cobertura.js\`.`,
  "",
  `- Temas: **${temas.length}** · Questões: **${bank.questoes.length}**`,
  `- Questões com vínculo a tópico de edital (\`classificacao.provaRefs\`): **${bank.questoes.filter(q => (q.classificacao?.provaRefs || []).length).length}**`,
  ""
];

for (const tema of temas) {
  const questoes = bank.questoes.filter(q => q.tema === tema);
  const aprovadas = questoes.filter(q => APROVADO.has(q.estadoEditorial)).length;
  const pendentes = questoes.filter(q => PENDENTE.has(q.estadoEditorial)).length;
  const suspensasOuRetiradas = questoes.length - aprovadas - pendentes;
  const provaRefs = questoes.flatMap(q => q.classificacao?.provaRefs || []);

  linhas.push(`## ${tema}`, "");
  linhas.push(`- Questões: **${questoes.length}** · aprovadas: **${aprovadas}** · pendentes/em revisão: **${pendentes}**${suspensasOuRetiradas ? ` · suspensas/retiradas: **${suspensasOuRetiradas}**` : ""}`);
  linhas.push(`- Disciplina(s): ${[...new Set(questoes.map(q => q.classificacao?.disciplina))].join(", ")}`);
  linhas.push("");
  linhas.push("| Competência | Questões |", "|---|---:|", ...countBy(questoes, q => q.classificacao?.competencia).map(([k, v]) => `| ${k} | ${v} |`));
  linhas.push("");
  linhas.push("| Complexidade | Questões |", "|---|---:|", ...countBy(questoes, q => q.classificacao?.complexidade).map(([k, v]) => `| ${k} | ${v} |`));
  linhas.push("");
  if (provaRefs.length) {
    linhas.push("| Vínculo com prova (disciplina — tópico) | Questões |", "|---|---:|",
      ...countBy(provaRefs, r => `${r.disciplina} — ${r.topico}`).map(([k, v]) => `| ${k} | ${v} |`));
  } else {
    linhas.push("- Sem vínculo com tópico de edital em `provas/` ainda (`classificacao.provaRefs` vazio em todas as questões deste tema).");
  }
  linhas.push("");
}

linhas.push(
  "## Lacunas",
  "",
  `- ${bank.questoes.length - bank.questoes.filter(q => APROVADO.has(q.estadoEditorial)).length} questões ainda não aprovadas (ver \`RELATORIO-GOVERNANCA.md\` para detalhe editorial).`,
  `- ${bank.questoes.filter(q => (q.classificacao?.provaRefs || []).length === 0).length} questões sem vínculo declarado a nenhum tópico de edital de \`provas/\` — hoje isso é a maioria absoluta do banco, porque os temas atuais (Endocardite, Sódio/Água, Antimicrobianos, HAS/SRAA, Raio-X de Tórax, Tosse/Hemoptise) não coincidem com nenhum edital já modelado em \`provas/medicina/\` (Agressão e Defesa I, Epidemiologia, Pesquisa em Saúde 2, Semiologia). O vínculo é preenchido caso a caso quando uma questão do banco for de fato reaproveitada num simulado de prova — ver \`_banco/LEIA-ME.md\`, seção "Vínculo com provas/".`,
  ""
);

fs.writeFileSync(path.join(dir, "RELATORIO-COBERTURA.md"), linhas.join("\n"), "utf8");
console.log("Mapa de cobertura atualizado.");
