#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const bank = JSON.parse(fs.readFileSync(path.join(dir, "banco-questoes.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(dir, "fontes.json"), "utf8"));

const countBy = (items, fn) => Object.entries(items.reduce((acc, item) => {
  const key = fn(item) || "não informado";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));

const lines = [
  "# Relatório de governança editorial",
  "",
  `Gerado em **${bank.atualizadoEm}** a partir do banco central. Não editar manualmente; rode \`node relatorio-governanca.js\`.`,
  "",
  `- Questões: **${bank.questoes.length}**`,
  `- Fontes cadastradas: **${Object.keys(sources.fontes || {}).length}**`,
  `- Questões com imagem: **${bank.questoes.filter(q => q.imagem).length}**`,
  "",
  "## Estado editorial",
  "",
  "| Estado | Quantidade |",
  "|---|---:|",
  ...countBy(bank.questoes, q => q.estadoEditorial).map(([k, v]) => `| ${k} | ${v} |`),
  "",
  "## Temas",
  "",
  "| Tema | Questões |",
  "|---|---:|",
  ...countBy(bank.questoes, q => q.tema).map(([k, v]) => `| ${k} | ${v} |`),
  "",
  "## Verificação das fontes",
  "",
  "| Estado | Fontes |",
  "|---|---:|",
  ...countBy(Object.values(sources.fontesMeta || {}), m => m.verificacao).map(([k, v]) => `| ${k} | ${v} |`),
  "",
  "## Pendências prioritárias",
  "",
  `- ${bank.questoes.filter(q => q.estadoEditorial !== "aprovada").length} questões ainda não aprovadas pelo padrão integrado.`,
  `- ${Object.values(sources.fontesMeta || {}).filter(m => m.verificacao !== "verificada").length} fontes aguardam conferência editorial.`,
  `- ${bank.questoes.filter(q => q.imagem && q.imagemMeta?.statusDireitos !== "verificado").length} imagens aguardam conferência de origem, licença ou privacidade.`,
  `- ${bank.questoes.filter(q => q.proveniencia?.usoDeIA === "nao_documentado").length} questões legadas têm uso de IA não documentado.`,
  "",
  "A prioridade de auditoria deve considerar risco: decisão terapêutica e diagnóstico → números/cortes → imagens clínicas → mecanismos estáveis.",
  ""
];

fs.writeFileSync(path.join(dir, "RELATORIO-GOVERNANCA.md"), lines.join("\n"), "utf8");
console.log("Relatório de governança atualizado.");

