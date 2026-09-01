// Rota `#/lista?d=<payload>` — reproduz uma cápsula de estudo compartilhada
// por link. Mesmo motor de quiz das sessões curadas/dinâmicas
// (`quizShellHtml` + `window.QuestoesApp.initQuiz`); nada de renderização
// própria aqui.
import { loadBanco, loadFontes, toQuizData } from "../data.mjs";
import { decodeCapsulePayload, toCapsuleSpec, resolveCapsuleQuestions, capsuleSummary, CAPSULE_MODE_LABEL } from "../capsule.mjs";
import { quizShellHtml, escapeText } from "./quiz-shell.mjs";

export function buildCapsuleMissingNotice(missingIds) {
  if (!missingIds.length) return "";
  return `<p class="bridge-note" role="status">${missingIds.length} questão(ões) desta cápsula não existe(m) mais no banco atual e foi(ram) omitida(s).</p>`;
}

export function buildCapsuleInfoHtml(payload, summary) {
  const revealButton = payload.answerReveal === "end"
    ? `<button type="button" class="button-secondary" id="capsule-reveal" aria-pressed="false">Revelar respostas</button>`
    : "";
  return `<div class="active-filters" role="note"><strong>Cápsula de estudo</strong> · Modo: ${escapeText(summary.modeLabel)} · Ordem: ${escapeText(summary.orderLabel)} · Revelação: ${escapeText(summary.revealLabel)} <span class="muted">(${summary.count} questão(ões))</span> ${revealButton}</div>`;
}

export async function renderListaView(root, { route, signal }) {
  const payload = decodeCapsulePayload(route.query.get("d"));
  const banco = await loadBanco({ signal });
  const { questions, missingIds } = resolveCapsuleQuestions(banco.questoes, payload);
  const fontes = await loadFontes({ signal });
  const spec = toCapsuleSpec(payload);
  const summary = capsuleSummary(payload);
  const meta = { type: "capsule", specId: spec.quizId, filter: null, eligibleCount: payload.questionIds.length, includedCount: questions.length, mode: payload.mode, order: payload.order, answerReveal: payload.answerReveal };
  const quizData = toQuizData(spec, questions, fontes, meta);
  quizData.order = payload.order;
  quizData.answerReveal = payload.answerReveal;
  const infoHtml = `${buildCapsuleInfoHtml(payload, summary)}${buildCapsuleMissingNotice(missingIds)}`;
  root.innerHTML = quizShellHtml({ eyebrow: `Cápsula · ${CAPSULE_MODE_LABEL[payload.mode] || payload.mode}`, backHref: "#/seletor", backLabel: "Voltar ao seletor", extraHtml: infoHtml });
  window.QuestoesApp.initQuiz(quizData, root);
}
