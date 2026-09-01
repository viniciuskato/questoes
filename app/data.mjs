export const SPEC_IDS = [
  "antimicrobianos-fundamentos", "disturbios-sodio-agua-feitas", "disturbios-sodio-agua",
  "endocardite-antibioticoterapia", "endocardite-feitas", "endocardite-revisao-desempenho",
  "endocardite-tratamento", "endocardite", "radiografia-torax-basica"
];

const cache = new Map();

export async function fetchJson(path, { signal, force = false } = {}) {
  if (typeof location !== "undefined" && location.protocol === "file:") {
    throw new Error("Abra pelo Iniciar Site.bat ou execute node tools/serve.js; navegadores bloqueiam os dados sob file://.");
  }
  if (!force && cache.has(path)) return cache.get(path);
  let response;
  try { response = await fetch(path, { signal, cache: force ? "reload" : "default" }); }
  catch (error) { if (error.name === "AbortError") throw error; throw new Error(`Não foi possível carregar ${path}.`); }
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (HTTP ${response.status}).`);
  try {
    const value = await response.json();
    cache.set(path, value);
    return value;
  } catch (_) { throw new Error(`JSON inválido em ${path}. Rode node _banco/validar-banco.js.`); }
}

export const loadBanco = opts => fetchJson("_banco/banco-questoes.json", opts);
export const loadFontes = opts => fetchJson("_banco/fontes.json", opts);
export const loadCorrecoes = opts => fetchJson("_banco/correcoes.json", opts);
export const loadSpec = (id, opts) => {
  if (!SPEC_IDS.includes(id)) throw new Error(`Lista "${id}" não encontrada.`);
  return fetchJson(`_banco/specs/${id}.json`, opts);
};
export async function loadSpecs(opts) { return Promise.all(SPEC_IDS.map(id => loadSpec(id, opts))); }

// Port de _banco/selecionar.js. A equivalência é coberta por tests/data.test.mjs.
export function selecionarQuestoes(banco, spec) {
  if (Array.isArray(spec.ids) && spec.ids.length) {
    const byId = new Map(banco.questoes.map(q => [q.id, q]));
    return spec.ids.map(id => { const q = byId.get(id); if (!q) throw new Error(`id "${id}" não encontrado no banco.`); return q; });
  }
  if (!spec.filtro) throw new Error('spec precisa de "ids" ou "filtro".');
  const f = spec.filtro;
  const selected = banco.questoes.filter(q => {
    const c = q.classificacao || {};
    if (f.areas?.length && !f.areas.includes(c.area)) return false;
    if (f.disciplinas?.length && !f.disciplinas.includes(c.disciplina)) return false;
    if (f.temas?.length && !f.temas.includes(q.tema)) return false;
    if (f.categorias?.length && !f.categorias.includes(q.categoria)) return false;
    if (f.subtemas?.length && !f.subtemas.includes(c.subtema)) return false;
    if (f.tags?.length && !f.tags.some(v => (q.tags || []).includes(v))) return false;
    if (f.focos?.length && !f.focos.some(v => (c.focos || []).includes(v))) return false;
    if (f.competencias?.length && !f.competencias.includes(c.competencia)) return false;
    if (f.complexidades?.length && !f.complexidades.includes(c.complexidade)) return false;
    if (f.contextos?.length && !f.contextos.includes(c.contexto)) return false;
    if (f.nosHierarquicos?.length && !f.nosHierarquicos.some(v => (c.hierarquia || []).includes(v))) return false;
    if (f.caminhoHierarquico?.length && !f.caminhoHierarquico.every((v, i) => (c.hierarquia || [])[i] === v)) return false;
    return true;
  });
  if (!selected.length) throw new Error("o filtro não retornou nenhuma questão do banco.");
  return selected;
}

// `meta` é opcional e aditivo (sessões curadas continuam sem ele): quando
// presente, é repassado como `sessionMeta` e chega ao registro exportado
// (ver `_shared/app.js`, saveRegistro) para distinguir sessão curada de
// dinâmica sem quebrar o formato legado de registros antigos.
export function toQuizData(spec, questions, fontesDocument, meta = null) {
  const fontes = fontesDocument.fontes || fontesDocument;
  const used = new Set(questions.flatMap(q => q.referencias || []));
  return {
    quizId: spec.quizId,
    title: spec.title,
    description: spec.description || "",
    footnote: spec.footnote || "",
    questions: questions.map(q => ({ id:q.id, tema:q.tema, cat:q.categoria, classificacao:q.classificacao, q:q.pergunta, img:q.imagem ? resolveImagePath(q.imagem) : (q.img || null), imgAlt:q.imagemLegenda || q.imagemMeta?.alt || q.imgAlt || "", options:q.alternativas, correct:q.correta, exp:q.explicacao, ref:q.referencias || [], itemVersion:q.versaoEditorial || 1, editorialState:q.estadoEditorial || null })),
    fontes: Object.fromEntries([...used].map(slug => [slug, fontes[slug] || slug])),
    sessionMeta: meta
  };
}

// Caminhos de imagem no banco são relativos a `_banco/` (ex.: "imagens/x.png").
// Alguns registros legados já vêm com o prefixo embutido — nunca duplicar, e
// nunca aceitar caminho absoluto/URL externa (o banco só referencia arquivos
// locais dentro de `_banco/imagens/`).
export function resolveImagePath(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(value) || value.startsWith("/")) return null;
  if (value.startsWith("_banco/")) return value;
  return "_banco/" + value;
}

// União dos ids cobertos pelas specs carregadas — usada para comunicar
// cobertura real (nunca hardcode a contagem; ela muda se specs forem adicionadas).
export function coveredQuestionIds(banco, specs) {
  const ids = new Set();
  specs.forEach(spec => selecionarQuestoes(banco, spec).forEach(q => ids.add(q.id)));
  return ids;
}

export function parseHierarchy(value) {
  if (!value) return { value: [], warning: "" };
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? { value: parsed, warning: "" } : { value: [], warning: "O filtro de hierarquia foi ignorado porque não é uma lista." }; }
  catch (_) { return { value: [], warning: "O filtro de hierarquia foi ignorado porque está malformado." }; }
}
