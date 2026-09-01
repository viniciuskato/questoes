#!/usr/bin/env node
/**
 * Validações estruturais complementares a validar-banco.js — sempre em modo relatório
 * (nunca falha o processo, nunca altera o banco). Cobre:
 *   - TODO/FIXME/placeholder em item liberado (aprovada)
 *   - impossibilidade de migração mecânica resultar em aprovada
 *   - consistência banco <-> páginas HTML geradas (../medicina/*.html)
 *   - derivado não mais antigo que sua fonte (itemVersion da página vs versaoEditorial)
 *   - consistência banco <-> specs/*.json (ids referenciados existem)
 *   - detecção de possíveis bancos paralelos (json com "alternativas"+"correta" fora do canônico)
 *
 * Uso: node verificar-consistencia-derivados.js [--json]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const banco = require("./banco-questoes.json");
const byId = new Map(banco.questoes.map(q => [q.id, q]));

const bloqueios = [];   // erros de integridade que impediriam publicação (não travam o processo)
const pendencias = [];  // avisos informativos

// 1) TODO/FIXME/placeholder em item liberado. Marcadores em maiúsculas só, para não
// colidir com a palavra portuguesa "todo" (ex.: "durante todo o tratamento").
const MARCADOR = /\bTODO\b|\bFIXME\b|\bXXX\b|\[PLACEHOLDER\]|\bTBD\b/;
for (const q of banco.questoes) {
  const campos = {
    pergunta: q.pergunta,
    explicacao: q.explicacao,
    alternativas: (q.alternativas || []).join(" | ")
  };
  for (const [campo, texto] of Object.entries(campos)) {
    if (texto && MARCADOR.test(texto)) {
      const msg = `${q.id}: marcador TODO/FIXME/placeholder em ${campo} (estado: ${q.estadoEditorial})`;
      if (q.estadoEditorial === "aprovada") bloqueios.push(msg);
      else pendencias.push(msg);
    }
  }
}

// 2) Migração mecânica nunca pode resultar em aprovada.
for (const q of banco.questoes) {
  const aud = q.auditoriaEditorial || {};
  const migradaSemAuditoria = aud.status === "migrada_sem_auditoria_integrada" || !aud.auditadoEm;
  if (migradaSemAuditoria && q.estadoEditorial === "aprovada") {
    bloqueios.push(`${q.id}: estadoEditorial=aprovada mas auditoriaEditorial indica migração mecânica sem auditoria integrada (status=${aud.status || "ausente"})`);
  }
}

// 3) Consistência banco <-> páginas HTML geradas + derivado não mais antigo que a fonte.
const medicinaDir = path.join(ROOT, "medicina");
if (fs.existsSync(medicinaDir)) {
  for (const f of fs.readdirSync(medicinaDir)) {
    if (!f.endsWith(".html")) continue;
    const full = path.join(medicinaDir, f);
    const html = fs.readFileSync(full, "utf8");
    const m = html.match(/id="quiz-data"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) continue; // ex.: seletor.html não embute quiz-data
    let data;
    try { data = JSON.parse(m[1]); }
    catch (error) { bloqueios.push(`medicina/${f}: quiz-data inválido (${error.message})`); continue; }
    for (const item of data.questions || []) {
      const q = byId.get(item.id);
      if (!q) { pendencias.push(`medicina/${f}: id "${item.id}" não existe mais no banco (página órfã, provável regeneração pendente)`); continue; }
      const versaoAtual = q.versaoEditorial || 1;
      const versaoPagina = item.itemVersion || 1;
      if (versaoPagina < versaoAtual) {
        pendencias.push(`medicina/${f}: ${item.id} desatualizado — página v${versaoPagina} < banco v${versaoAtual} (regenerar com gerar-lista.js)`);
      }
      const divergente =
        item.q !== q.pergunta ||
        JSON.stringify(item.options) !== JSON.stringify(q.alternativas) ||
        item.correct !== q.correta ||
        item.exp !== q.explicacao;
      if (divergente) {
        pendencias.push(`medicina/${f}: ${item.id} conteúdo da página diverge do banco (regenerar; nenhum conteúdo foi alterado por esta verificação)`);
      }
    }
  }
} else {
  pendencias.push("diretório medicina/ não encontrado — verificação de páginas geradas não pôde ser executada");
}

// 4) Consistência banco <-> specs/*.json.
const specsDir = path.join(__dirname, "specs");
if (fs.existsSync(specsDir)) {
  for (const f of fs.readdirSync(specsDir)) {
    if (!f.endsWith(".json")) continue;
    let spec;
    try { spec = JSON.parse(fs.readFileSync(path.join(specsDir, f), "utf8")); }
    catch (error) { bloqueios.push(`specs/${f}: JSON inválido (${error.message})`); continue; }
    if (Array.isArray(spec.ids)) {
      for (const id of spec.ids) {
        if (!byId.has(id)) pendencias.push(`specs/${f}: id "${id}" referenciado não existe no banco`);
      }
    }
  }
}

// 5) Detecção de possíveis bancos paralelos: qualquer .json fora do canônico com
// formato de item de questão ("alternativas" + "correta"), excluindo _archive/backups.
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_archive" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".json")) out.push(full);
  }
}
const candidatos = [];
walk(ROOT, candidatos);
const canonicoBanco = path.join(__dirname, "banco-questoes.json");
for (const arquivo of candidatos) {
  if (arquivo === canonicoBanco) continue;
  let conteudo;
  try { conteudo = fs.readFileSync(arquivo, "utf8"); }
  catch { continue; }
  if (conteudo.includes('"alternativas"') && conteudo.includes('"correta"')) {
    pendencias.push(`possível banco paralelo: ${path.relative(ROOT, arquivo)} contém campos "alternativas"+"correta" fora do banco canônico`);
  }
}

const resultado = { bloqueios, pendencias };
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(resultado, null, 2));
} else {
  console.log(`Verificação de consistência (modo relatório): ${bloqueios.length} bloqueios, ${pendencias.length} pendências.`);
  if (bloqueios.length) { console.log("\n== BLOQUEIOS =="); console.log(bloqueios.join("\n")); }
  if (pendencias.length) { console.log("\n== PENDÊNCIAS =="); console.log(pendencias.join("\n")); }
}
