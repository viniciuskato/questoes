#!/usr/bin/env node
/** Atualiza no index.html um único atalho de sessão para cada tema do banco. */
const fs = require("fs");
const path = require("path");

const bancoDir = __dirname;
const bancoPath = path.join(bancoDir, "banco-questoes.json");
const indexPath = path.join(bancoDir, "..", "index.html");
const startMarker = "      <!-- TOPIC_SESSIONS_START -->";
const endMarker = "      <!-- TOPIC_SESSIONS_END -->";

const raw = JSON.parse(fs.readFileSync(bancoPath, "utf8"));
const questoes = Array.isArray(raw) ? raw : (raw.questoes || []);
const temas = new Map();

for (const questao of questoes) {
  const classificacao = questao.classificacao || {};
  const tema = classificacao.tema || questao.tema;
  const hierarquia = classificacao.hierarquia || [];
  if (!tema || hierarquia.length < 3) continue;
  if (!temas.has(tema)) temas.set(tema, { total: 0, hierarquia: hierarquia.slice(0, 3) });
  temas.get(tema).total += 1;
}

const escapeHtml = value => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const cards = [...temas.entries()]
  .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
  .map(([tema, item]) => {
    const href = `medicina/seletor.html?hierarquia=${encodeURIComponent(JSON.stringify(item.hierarquia))}`;
    return `      <a class="card" href="${href}"><div class="title">${escapeHtml(tema)}</div><div class="desc">${item.total} questões</div></a>`;
  })
  .join("\n");

const index = fs.readFileSync(indexPath, "utf8");
const start = index.indexOf(startMarker);
const end = index.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) throw new Error("Marcadores de sessões por tema não encontrados no index.html.");

const updated = index.slice(0, start) + startMarker + "\n" + cards + "\n" + index.slice(end);
fs.writeFileSync(indexPath, updated, "utf8");
console.log(`index.html atualizado: ${temas.size} sessões por tema.`);
