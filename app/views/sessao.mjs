import { loadBanco, loadFontes, toQuizData } from "../data.mjs";
import { resolveDynamicRoute, FILTER_FIELDS } from "../dynamic-session.mjs";
import { quizShellHtml, escapeText } from "./quiz-shell.mjs";
import { readCompletedQuestionIds } from "../store.mjs";

const FIELD_LABEL = { area: "Área", disciplina: "Disciplina", tema: "Tema", subtema: "Subtema", complexidade: "Complexidade", competencia: "Competência", contexto: "Contexto" };

// Comunica os filtros ativos por texto (não só visualmente) — requisito de
// acessibilidade: quem usa leitor de tela precisa saber o que está sendo
// estudado sem depender de inferir a partir da lista de questões.
export function describeActiveFilters(filter) {
  const parts = FILTER_FIELDS.filter(f => filter[f]).map(f => `${FIELD_LABEL[f]}: ${filter[f]}`);
  if (filter.tags?.length) parts.push(`Tags: ${filter.tags.join(", ")}`);
  return parts.length ? parts.join(" · ") : "Todas as questões do banco (sem filtro)";
}

export function buildSizeNotice({ sizeReduced, eligibleCount, includedCount }) {
  if (!sizeReduced) return "";
  return `<p class="bridge-note" role="status">Este recorte tem apenas ${eligibleCount} questão(ões) — a sessão usa todas as ${includedCount} disponíveis em vez do tamanho pedido.</p>`;
}

export async function renderSessaoView(root, { route, signal }) {
  const banco = await loadBanco({ signal });
  const excludeCompleted = route.query.get("excluirFeitas") === "1";
  const completedIds = excludeCompleted ? readCompletedQuestionIds() : new Set();
  const availableBanco = excludeCompleted ? { ...banco, questoes: banco.questoes.filter(q => !completedIds.has(q.id)) } : banco;
  const { session, spec, included, eligibleCount, includedCount, sizeReduced, highlightIncluded } = resolveDynamicRoute(availableBanco, route.query);
  const fontes = await loadFontes({ signal });
  const meta = { type: "dynamic", specId: null, filter: session.filter, eligibleCount, includedCount };
  const quizData = toQuizData(spec, included, fontes, meta);
  const filtersHtml = `<div class="active-filters" role="note"><strong>Filtros ativos:</strong> ${escapeText(describeActiveFilters(session.filter))} <span class="muted">(${includedCount} de ${eligibleCount} questão(ões) elegível(is))</span></div>${buildSizeNotice({ sizeReduced, eligibleCount, includedCount })}<div id="session-announcer" class="visually-hidden" role="status" aria-live="polite"></div>`;
  root.innerHTML = quizShellHtml({ eyebrow: "Sessão dinâmica", backHref: "#/seletor", backLabel: "Voltar ao seletor", extraHtml: filtersHtml });
  window.QuestoesApp.initQuiz(quizData, root);

  if (session.highlight && highlightIncluded) {
    const idx = included.findIndex(q => q.id === session.highlight);
    const card = idx >= 0 ? root.querySelector(`#q${idx}`) : null;
    if (card) {
      card.classList.add("search-highlight");
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      const announcer = root.querySelector("#session-announcer");
      if (announcer) announcer.textContent = "Questão de origem da busca priorizada e destacada nesta sessão.";
      setTimeout(() => card.classList.remove("search-highlight"), 2800);
    }
  }
}
