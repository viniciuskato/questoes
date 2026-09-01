#!/usr/bin/env node
/**
 * Exporta uma seleção do banco central como HTML autocontido para dentro de
 * provas/ (ou qualquer destino fora deste repositório). provas/ é um
 * repositório git próprio (GitHub Pages); Questões/ não é. Por isso a saída
 * não pode depender de caminhos relativos cruzando repositórios — este
 * script copia as imagens usadas para junto do HTML de destino e embute os
 * dados no próprio arquivo, do mesmo jeito que gerar-lista.js já faz dentro
 * de Questões/.
 *
 * Uso:
 *   node exportar-para-prova.js <spec.json> <saida.html>
 *
 * spec.json é o mesmo formato de gerar-lista.js (ids ou filtro; quizId e
 * title obrigatórios). Campo opcional "provaRef": { "disciplina", "edital",
 * "topico" } — se presente, avisa (não bloqueia) quando alguma questão
 * selecionada ainda não declara esse vínculo em classificacao.provaRefs.
 *
 * A saída é só o artefato do simulado (não escreve nada em provas_mapa.txt,
 * provas_estado.txt ou no HTML principal da disciplina — quem decide como
 * linkar o simulado a partir do material principal é a sessão que chamou
 * este script).
 */
const fs = require("fs");
const path = require("path");
const { selecionarQuestoes } = require("./selecionar");

const BANCO_DIR = __dirname;
const BANCO_PATH = path.join(BANCO_DIR, "banco-questoes.json");
const FONTES_PATH = path.join(BANCO_DIR, "fontes.json");
const TEMPLATE_PATH = path.join(BANCO_DIR, "template-quiz.html");

function fail(msg) {
  console.error("Erro: " + msg);
  process.exit(1);
}

const [, , specPath, outPath] = process.argv;
if (!specPath || !outPath) fail("uso: node exportar-para-prova.js <spec.json> <saida.html>");

const banco = JSON.parse(fs.readFileSync(BANCO_PATH, "utf8"));
const fontesRegistro = JSON.parse(fs.readFileSync(FONTES_PATH, "utf8")).fontes;
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

if (!spec.quizId || !spec.title) fail('spec precisa de "quizId" e "title".');

let selecionadas;
try {
  selecionadas = selecionarQuestoes(banco, spec);
} catch (err) {
  fail(err.message);
}

if (spec.provaRef) {
  const semVinculo = selecionadas.filter(q => {
    const refs = q.classificacao?.provaRefs || [];
    return !refs.some(r => r.disciplina === spec.provaRef.disciplina && r.topico === spec.provaRef.topico);
  });
  if (semVinculo.length) {
    console.warn(`Aviso: ${semVinculo.length} questão(ões) exportada(s) ainda não declaram classificacao.provaRefs para ${spec.provaRef.disciplina} — ${spec.provaRef.topico}: ${semVinculo.map(q => q.id).join(", ")}`);
  }
}

const outDir = path.dirname(path.resolve(outPath));
const assetsDir = path.join(outDir, "_assets", "img");

const questions = selecionadas.map(q => {
  let img;
  if (q.imagem) {
    const origem = path.join(BANCO_DIR, "imagens", q.imagem.replace(/^imagens[\\/]/, ""));
    const nomeArquivo = path.basename(q.imagem);
    const destinoRelativo = path.join("_assets", "img", nomeArquivo);
    const destinoAbsoluto = path.join(outDir, destinoRelativo);
    fs.mkdirSync(path.dirname(destinoAbsoluto), { recursive: true });
    fs.copyFileSync(origem, destinoAbsoluto);
    img = "./" + destinoRelativo.split(path.sep).join("/");
  }
  return {
    id: q.id,
    tema: q.tema,
    cat: q.categoria,
    classificacao: q.classificacao,
    q: q.pergunta,
    img,
    imgAlt: q.imagemLegenda || undefined,
    options: q.alternativas,
    correct: q.correta,
    exp: q.explicacao,
    ref: q.referencias || [],
    itemVersion: q.versaoEditorial || 1,
    editorialState: q.estadoEditorial || "pendente_revisao_conteudo"
  };
});

const usedSlugs = new Set();
questions.forEach(item => (item.ref || []).forEach(slug => usedSlugs.add(slug)));
const fontes = {};
usedSlugs.forEach(slug => {
  if (!fontesRegistro[slug]) fail(`fonte "${slug}" referenciada mas ausente em fontes.json.`);
  fontes[slug] = fontesRegistro[slug];
});

const quizData = {
  quizId: spec.quizId,
  title: spec.title,
  description: spec.description || "",
  footnote: spec.footnote || `Importado do banco central de Questões em ${new Date().toISOString().slice(0, 10)} — qId original de cada item preservado em "id".`,
  questions,
  fontes
};

const finalHtml = template.replace(
  "__QUIZ_DATA_JSON__",
  JSON.stringify(quizData, null, 2).replace(/</g, "\\u003c")
);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, finalHtml, "utf8");

const registroPath = path.join(BANCO_DIR, "specs", `${spec.quizId}.export-prova.json`);
fs.writeFileSync(registroPath, JSON.stringify({
  quizId: spec.quizId,
  destino: path.resolve(outPath),
  provaRef: spec.provaRef || null,
  exportadoEm: new Date().toISOString().slice(0, 10),
  ids: selecionadas.map(q => q.id),
  versoesEditoriais: Object.fromEntries(selecionadas.map(q => [q.id, q.versaoEditorial || 1]))
}, null, 2), "utf8");

console.log(`Gerado: ${outPath}`);
console.log(`  ${questions.length} questões · ${usedSlugs.size} fontes citadas · registro em specs/${spec.quizId}.export-prova.json`);
