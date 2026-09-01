#!/usr/bin/env node
/**
 * Gera um HTML de lista temática a partir do banco central de questões.
 *
 * Uso:
 *   node gerar-lista.js <spec.json> <saida.html>
 *
 * spec.json aceita:
 *   {
 *     "quizId": "endocardite-tratamento",         // vira o nome do quiz no registro exportado
 *     "title": "Endocardite — Tratamento",
 *     "description": "Texto curto no cabeçalho.",
 *     "footnote": "Texto curto no rodapé (opcional).",
 *     "ids": ["endocardite-19", "endocardite-20"]  // ordem explícita de questões do banco
 *   }
 * ou, em vez de "ids", um filtro:
 *   {
 *     ...,
 *     "filtro": { "temas": ["Endocardite Infecciosa"], "categorias": ["Tratamento"], "tags": [] }
 *   }
 *
 * "ids" tem prioridade sobre "filtro" se ambos estiverem presentes.
 */

const fs = require("fs");
const path = require("path");
const { montarHtmlLista } = require("./montar-html");

const BANCO_DIR = __dirname;
const BANCO_PATH = path.join(BANCO_DIR, "banco-questoes.json");
const FONTES_PATH = path.join(BANCO_DIR, "fontes.json");
const TEMPLATE_PATH = path.join(BANCO_DIR, "template-quiz.html");

function fail(msg) {
  console.error("Erro: " + msg);
  process.exit(1);
}

const [, , specPath, outPath] = process.argv;
if (!specPath || !outPath) {
  fail("uso: node gerar-lista.js <spec.json> <saida.html>");
}

const banco = JSON.parse(fs.readFileSync(BANCO_PATH, "utf8"));
const fontesRegistro = JSON.parse(fs.readFileSync(FONTES_PATH, "utf8")).fontes;
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

let resultado;
try {
  resultado = montarHtmlLista({ banco, fontesRegistro, template, spec });
} catch (err) {
  fail(err.message);
}

fs.writeFileSync(outPath, resultado.html, "utf8");
console.log(`Gerado: ${outPath}`);
console.log(`  ${resultado.count} questões · ${resultado.fontesCount} fontes citadas`);
