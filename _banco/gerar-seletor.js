#!/usr/bin/env node
/**
 * Gera Questões/medicina/seletor.html: uma página única que embute o banco
 * inteiro (todas as questões, com tema/categoria já anexados) e deixa a
 * escolha do recorte para o navegador — sem precisar de spec.json nem de
 * rodar gerar-lista.js por tema.
 *
 * Uso:
 *   node gerar-seletor.js
 *
 * Rode de novo sempre que o banco (banco-questoes.json) mudar, pra manter
 * o seletor sincronizado — os dados ficam embutidos no HTML no momento da
 * geração, não são lidos em tempo real.
 */

const fs = require("fs");
const path = require("path");

const BANCO_DIR = __dirname;
const BANCO_PATH = path.join(BANCO_DIR, "banco-questoes.json");
const FONTES_PATH = path.join(BANCO_DIR, "fontes.json");
const TEMPLATE_PATH = path.join(BANCO_DIR, "template-seletor.html");
const OUT_PATH = path.join(BANCO_DIR, "..", "medicina", "seletor.html");

function fail(msg) {
  console.error("Erro: " + msg);
  process.exit(1);
}

const banco = JSON.parse(fs.readFileSync(BANCO_PATH, "utf8"));
const fontesRegistro = JSON.parse(fs.readFileSync(FONTES_PATH, "utf8")).fontes;
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

if (!Array.isArray(banco.questoes) || banco.questoes.length === 0) {
  fail("banco-questoes.json não tem questões.");
}

const allQuestions = banco.questoes.map(q => ({
  id: q.id,
  tema: q.tema,
  cat: q.categoria,
  classificacao: q.classificacao,
  q: q.pergunta,
  img: q.imagem ? "../_banco/" + q.imagem : undefined,
  imgAlt: q.imagemLegenda || undefined,
  options: q.alternativas,
  correct: q.correta,
  exp: q.explicacao,
  ref: q.referencias || [],
  itemVersion: q.versaoEditorial || 1,
  editorialState: q.estadoEditorial || "pendente_revisao_conteudo"
}));

// embute o registro de fontes inteiro (é pequeno e evita recalcular o
// subconjunto usado toda vez que a seleção do usuário muda no navegador)
let html = template
  .replace("__BANCO_DATA_JSON__", JSON.stringify(allQuestions, null, 2).replace(/</g, "\\u003c"))
  .replace("__FONTES_DATA_JSON__", JSON.stringify(fontesRegistro, null, 2).replace(/</g, "\\u003c"));

fs.writeFileSync(OUT_PATH, html, "utf8");

const temas = new Set(banco.questoes.map(q => q.tema));
console.log(`Gerado: ${OUT_PATH}`);
console.log(`  ${banco.questoes.length} questões · ${temas.size} temas`);
