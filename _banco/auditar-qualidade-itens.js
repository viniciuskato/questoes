#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const bank = JSON.parse(fs.readFileSync(path.join(__dirname, "banco-questoes.json"), "utf8"));
const findings = [];
const absolutePattern = /\b(sempre|nunca|exclusivamente|apenas|obrigatoriamente|em todos os casos|sem qualquer)\b/i;
const negativeStemPattern = /\b(exceto|incorreta|não corresponde|não é|menos provável)\b/i;
const metaOptionPattern = /\b(todas as anteriores|nenhuma das anteriores|a e b|b e c)\b/i;
const answerPositions = [0, 0, 0, 0, 0];

for (const q of bank.questoes) {
  answerPositions[q.correta]++;
  const lengths = q.alternativas.map(a => a.trim().length);
  const correctLength = lengths[q.correta];
  const otherLengths = lengths.filter((_, i) => i !== q.correta);
  const otherAverage = otherLengths.reduce((a, b) => a + b, 0) / otherLengths.length;
  if (correctLength > otherAverage * 1.45 && correctLength - Math.max(...otherLengths) > 15) {
    findings.push({ id: q.id, tipo: "correta_destaca_comprimento", detalhe: `${correctLength} caracteres; média das erradas ${otherAverage.toFixed(1)}` });
  }
  if (negativeStemPattern.test(q.pergunta)) findings.push({ id: q.id, tipo: "enunciado_negativo", detalhe: "Revisar se a negação é necessária e visualmente inequívoca." });
  q.alternativas.forEach((a, i) => {
    if (metaOptionPattern.test(a)) findings.push({ id: q.id, tipo: "alternativa_meta", detalhe: `Alternativa ${String.fromCharCode(65 + i)}.` });
  });
  const wrongAbsolutes = q.alternativas
    .map((a, i) => ({ a, i }))
    .filter(x => x.i !== q.correta && absolutePattern.test(x.a));
  const correctHasAbsolute = absolutePattern.test(q.alternativas[q.correta]);
  if (wrongAbsolutes.length >= 2 && !correctHasAbsolute) {
    findings.push({ id: q.id, tipo: "absolutos_nos_distratores", detalhe: `${wrongAbsolutes.length} distratores com linguagem absoluta; verificar pista por eliminação.` });
  }
  if (q.explicacao.trim().length < 120) findings.push({ id: q.id, tipo: "explicacao_curta", detalhe: `${q.explicacao.trim().length} caracteres; conferir análise de todos os distratores.` });
}

const byType = Object.entries(findings.reduce((acc, f) => {
  acc[f.tipo] = (acc[f.tipo] || 0) + 1;
  return acc;
}, {})).sort((a, b) => b[1] - a[1]);

const lines = [
  "# Relatório heurístico de qualidade dos itens",
  "",
  `Gerado em **${bank.atualizadoEm}**. As regras abaixo são triagem inspirada no NBME; não substituem revisão humana nem provam defeito no item.`,
  "",
  "## Distribuição do gabarito",
  "",
  "| Posição | Quantidade |",
  "|---|---:|",
  ...answerPositions.map((n, i) => `| ${String.fromCharCode(65 + i)} | ${n} |`),
  "",
  "## Sinais encontrados",
  "",
  "| Sinal | Itens |",
  "|---|---:|",
  ...(byType.length ? byType.map(([k, v]) => `| ${k} | ${v} |`) : ["| Nenhum | 0 |"]),
  "",
  "## Itens para revisão",
  "",
  ...(findings.length ? findings.map(f => `- \`${f.id}\` — **${f.tipo}:** ${f.detalhe}`) : ["Nenhum sinal heurístico encontrado."]),
  ""
];

fs.writeFileSync(path.join(__dirname, "RELATORIO-QUALIDADE-ITENS.md"), lines.join("\n"), "utf8");
console.log(`Auditoria heurística: ${findings.length} sinais em ${new Set(findings.map(f => f.id)).size} itens.`);

