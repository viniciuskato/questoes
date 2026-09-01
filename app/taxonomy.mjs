// Taxonomia derivada em runtime de `classificacao` nas 393 questões do banco.
// Nunca gravada no banco canônico; recalculada a cada carregamento.
import { normalizeSearchText } from "./search.mjs";

export const TAXONOMY_FIELDS = ["area", "disciplina", "tema", "subtema", "complexidade", "competencia", "contexto"];

const FIELD_GETTERS = {
  area: q => q.classificacao?.area,
  disciplina: q => q.classificacao?.disciplina,
  tema: q => q.classificacao?.tema || q.tema,
  subtema: q => q.classificacao?.subtema || q.categoria,
  complexidade: q => q.classificacao?.complexidade,
  competencia: q => q.classificacao?.competencia,
  contexto: q => q.classificacao?.contexto
};

export function fieldValue(question, field) {
  const getter = FIELD_GETTERS[field];
  return getter ? getter(question) || null : null;
}

// Valores únicos de um campo, ordenados, ignorando questões sem o campo.
export function collectValues(questions, field) {
  return [...new Set(questions.map(q => fieldValue(q, field)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// Resolve um valor de URL (pode vir sem acento/caixa diferente) para o valor
// canônico existente no banco. Retorna null se não houver correspondência.
export function resolveTaxonomyValue(questions, field, rawValue) {
  const needle = normalizeSearchText(rawValue).trim();
  if (!needle) return null;
  const canonical = collectValues(questions, field);
  return canonical.find(v => normalizeSearchText(v) === needle) || null;
}

// Árvore área → disciplina → tema → subtema com contagem de questões em cada nó.
// Usada pelo seletor para a navegação "Explorar o banco" (progressive disclosure).
export function buildTaxonomyTree(questions) {
  const areas = new Map();
  for (const q of questions) {
    const area = fieldValue(q, "area") || "Sem área";
    const disciplina = fieldValue(q, "disciplina") || "Sem disciplina";
    const tema = fieldValue(q, "tema") || "Sem tema";
    const subtema = fieldValue(q, "subtema") || "Sem subtema";
    if (!areas.has(area)) areas.set(area, { name: area, count: 0, disciplinas: new Map() });
    const areaNode = areas.get(area); areaNode.count++;
    if (!areaNode.disciplinas.has(disciplina)) areaNode.disciplinas.set(disciplina, { name: disciplina, count: 0, temas: new Map() });
    const discNode = areaNode.disciplinas.get(disciplina); discNode.count++;
    if (!discNode.temas.has(tema)) discNode.temas.set(tema, { name: tema, count: 0, subtemas: new Map() });
    const temaNode = discNode.temas.get(tema); temaNode.count++;
    if (!temaNode.subtemas.has(subtema)) temaNode.subtemas.set(subtema, { name: subtema, count: 0 });
    temaNode.subtemas.get(subtema).count++;
  }
  const sortByName = (a, b) => a.name.localeCompare(b.name, "pt-BR");
  return [...areas.values()].sort(sortByName).map(area => ({
    ...area,
    disciplinas: [...area.disciplinas.values()].sort(sortByName).map(disc => ({
      ...disc,
      temas: [...disc.temas.values()].sort(sortByName).map(tema => ({
        ...tema,
        subtemas: [...tema.subtemas.values()].sort(sortByName)
      }))
    }))
  }));
}

// Lista simples de temas únicos (nível de navegação principal do seletor).
export function listTemas(questions) {
  return collectValues(questions, "tema");
}
