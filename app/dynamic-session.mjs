// Sessões dinâmicas: construídas em runtime a partir da taxonomia do banco
// central. Nunca gravadas em `_banco/specs/*.json` nem no banco canônico —
// o modelo de sessão vive só em memória, reconstruído a cada navegação a
// partir dos parâmetros da URL (#/sessao?...).
import { fieldValue, resolveTaxonomyValue } from "./taxonomy.mjs";
import { normalizeSearchText } from "./search.mjs";

export const FILTER_FIELDS = ["area", "disciplina", "tema", "subtema", "complexidade", "competencia", "contexto"];
const REPEATABLE_FIELDS = new Set(["tag"]);
const SINGLE_FIELDS = new Set([...FILTER_FIELDS, "tamanho", "highlight", "excluirFeitas"]);
export const KNOWN_PARAMS = new Set([...SINGLE_FIELDS, ...REPEATABLE_FIELDS]);
export const SESSION_SIZES = ["10", "20", "all"];

function fieldLabel(field) {
  return { area: "área", disciplina: "disciplina", tema: "tema", subtema: "subtema", complexidade: "complexidade", competencia: "competência", contexto: "contexto", tamanho: "tamanho" }[field] || field;
}

// Valida a query bruta antes de tocar no banco: parâmetros desconhecidos e
// duplicidade indevida são erros de forma, não dependem dos dados.
export function validateQueryShape(query) {
  const keys = [...query.keys()];
  const unknown = [...new Set(keys)].filter(k => !KNOWN_PARAMS.has(k));
  if (unknown.length) throw new Error(`Parâmetro desconhecido na sessão: ${unknown.join(", ")}.`);
  for (const field of SINGLE_FIELDS) {
    if (query.getAll(field).length > 1) throw new Error(`O parâmetro "${field}" foi informado mais de uma vez.`);
  }
}

export function parseTamanho(raw) {
  if (raw == null || raw === "") return "all";
  if (raw === "all" || raw === "todas") return "all";
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Tamanho de sessão inválido: "${raw}". Use 10, 20, all, ou um número inteiro positivo.`);
  return n;
}

// Resolve os filtros da query contra a taxonomia real do banco (tolera
// acento/caixa diferentes); lança erro compreensível para valor inexistente.
export function resolveFilters(questions, query) {
  const filter = {};
  for (const field of FILTER_FIELDS) {
    const raw = query.get(field);
    if (!raw) continue;
    const canonical = resolveTaxonomyValue(questions, field, raw);
    if (!canonical) throw new Error(`Nenhuma questão do banco tem ${fieldLabel(field)} igual a "${raw}".`);
    filter[field] = canonical;
  }
  const tags = query.getAll("tag").filter(Boolean);
  if (tags.length) filter.tags = tags;
  return filter;
}

export function selectEligible(questions, filter) {
  return questions.filter(q => {
    for (const field of FILTER_FIELDS) {
      if (filter[field] && fieldValue(q, field) !== filter[field]) return false;
    }
    if (filter.tags?.length && !filter.tags.every(t => (q.tags || []).includes(t))) return false;
    return true;
  });
}

// Escolhe o subconjunto que entra na sessão. Comportamento documentado em
// ARQUITETURA-SPA.md: as N primeiras questões elegíveis na ordem canônica do
// banco (determinístico — mesma URL sempre produz a mesma seleção; não há
// seed porque não há aleatoriedade nesta etapa). O motor de quiz continua
// responsável por embaralhar a ORDEM DE EXIBIÇÃO a cada abertura da sessão.
// Quando `highlightId` está entre as elegíveis mas ficaria fora do corte,
// ele é garantido na seleção (sem duplicar) trocando de lugar com a última
// posição do corte.
export function pickSessionSubset(eligible, size, highlightId = null) {
  const eligibleCount = eligible.length;
  if (size === "all" || eligibleCount <= size) {
    return { included: eligible, eligibleCount, includedCount: eligible.length, sizeReduced: size !== "all" && eligibleCount < size, highlightIncluded: highlightId ? eligible.some(q => q.id === highlightId) : null };
  }
  let included = eligible.slice(0, size);
  let highlightIncluded = highlightId ? included.some(q => q.id === highlightId) : null;
  if (highlightId && highlightIncluded === false) {
    const found = eligible.find(q => q.id === highlightId);
    if (found) { included = [found, ...included.slice(0, size - 1)]; highlightIncluded = true; }
  }
  return { included, eligibleCount, includedCount: included.length, sizeReduced: false, highlightIncluded };
}

// Modelo único de sessão (curada ou dinâmica) — nunca gravado no banco.
export function buildDynamicSession({ filter, size, highlight }) {
  const parts = FILTER_FIELDS.filter(f => filter[f]).map(f => filter[f]);
  const title = parts.length ? parts[parts.length - 1] : "Todo o banco";
  const description = parts.length ? `Sessão dinâmica filtrada por ${parts.join(" › ")}.` : "Sessão dinâmica com todas as questões do banco.";
  const idSlug = normalizeSearchText(parts.length ? parts.join("-") : "todo-o-banco").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { type: "dynamic", id: `sessao-${idSlug || "geral"}`, title, description, filter, size, highlight: highlight || null };
}

export function toDynamicSpec(session) {
  return { quizId: session.id, title: session.title, description: session.description };
}

// Reconstrói a sessão inteira a partir de uma rota `#/sessao?...`. Lança
// erro compreensível em qualquer parâmetro inválido/desconhecido, tema
// inexistente ou resultado vazio — nunca retorna uma sessão vazia em
// silêncio (main.mjs converte o erro lançado em tela de erro acessível).
export function resolveDynamicRoute(banco, query) {
  validateQueryShape(query);
  const size = parseTamanho(query.get("tamanho"));
  const highlight = query.get("highlight") || null;
  const filter = resolveFilters(banco.questoes, query);
  const eligible = selectEligible(banco.questoes, filter);
  if (!eligible.length) throw new Error("Nenhuma questão do banco corresponde aos filtros informados.");
  const session = buildDynamicSession({ filter, size, highlight });
  const { included, eligibleCount, includedCount, sizeReduced, highlightIncluded } = pickSessionSubset(eligible, size, highlight);
  return { session, spec: toDynamicSpec(session), included, eligibleCount, includedCount, sizeReduced, highlightIncluded };
}

// Serializa uma sessão dinâmica de volta para uma rota copiável/comparável.
export function serializeDynamicRoute(filter, size, highlight = null, excludeCompleted = false) {
  const params = new URLSearchParams();
  for (const field of FILTER_FIELDS) if (filter[field]) params.set(field, filter[field]);
  (filter.tags || []).forEach(t => params.append("tag", t));
  if (size !== "all") params.set("tamanho", String(size)); else params.set("tamanho", "all");
  if (highlight) params.set("highlight", highlight);
  if (excludeCompleted) params.set("excluirFeitas", "1");
  return `#/sessao?${params.toString()}`;
}
