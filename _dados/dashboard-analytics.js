(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DashboardAnalytics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LEGACY_VERSION = "sem versão (legado)";
  const HIGH_CONFIDENCE = new Set(["know", "false-confidence"]);
  const MIN_CLASSICAL_N = 30;
  const MIN_CLASSICAL_USERS = 2;

  function finiteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function responseTimeMs(answer) {
    for (const key of ["responseTimeMs", "durationMs", "answerTimeMs"]) {
      const value = finiteNumber(answer[key]);
      if (value !== null && value >= 0) return value;
    }
    if (answer.certaintyMarkedAt && answer.answeredAt) {
      const value = new Date(answer.answeredAt) - new Date(answer.certaintyMarkedAt);
      if (Number.isFinite(value) && value >= 0) return value;
    }
    return null;
  }

  function identity(reg, answer) {
    if (answer.qId !== undefined && answer.qId !== null && String(answer.qId).trim()) {
      return { key: "qid:" + String(answer.qId), qId: String(answer.qId), global: true };
    }
    return {
      key: "legacy:" + reg.quiz + ":" + String(answer.qIndex ?? "?") + ":" + String(answer.question || ""),
      qId: null,
      global: false
    };
  }

  function optionKey(answer) {
    if (answer.selectedOptionText !== undefined && answer.selectedOptionText !== null && String(answer.selectedOptionText).trim()) {
      return "text:" + String(answer.selectedOptionText);
    }
    if (answer.selectedOption !== undefined && answer.selectedOption !== null) return "index:" + answer.selectedOption;
    return null;
  }

  function optionLabel(answer) {
    if (answer.selectedOptionText !== undefined && answer.selectedOptionText !== null && String(answer.selectedOptionText).trim()) {
      return String(answer.selectedOptionText);
    }
    if (answer.selectedOption !== undefined && answer.selectedOption !== null) return "Alternativa #" + (Number(answer.selectedOption) + 1) + " (texto não registrado)";
    return "Alternativa não registrada";
  }

  function freshVersion(version) {
    return { version, attempts: 0, correct: 0, times: [], options: {}, users: new Set() };
  }

  function summarizeVersion(raw) {
    const distractors = Object.values(raw.options)
      .filter(o => !o.correct)
      .map(o => ({
        ...o,
        frequency: raw.attempts ? o.count / raw.attempts : 0,
        ambiguity: o.highConfidenceCount > 0
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    const knownDistractors = distractors.filter(o => o.label !== "Alternativa não registrada");
    const times = raw.times.slice().sort((a, b) => a - b);
    return {
      version: raw.version,
      attempts: raw.attempts,
      correct: raw.correct,
      observedDifficulty: raw.attempts ? 1 - raw.correct / raw.attempts : null,
      distractors,
      neverChosen: knownDistractors.filter(o => o.count === 0),
      responseTime: times.length ? {
        n: times.length,
        meanMs: times.reduce((sum, n) => sum + n, 0) / times.length,
        medianMs: times[Math.floor(times.length / 2)]
      } : null,
      discrimination: raw.attempts < MIN_CLASSICAL_N || raw.users.size < MIN_CLASSICAL_USERS
        ? { available: false, reason: `não calculada: requer ≥${MIN_CLASSICAL_N} tentativas e ≥${MIN_CLASSICAL_USERS} usuários identificados` }
        : { available: false, reason: "não calculada: os registros não contêm escore independente por usuário" }
    };
  }

  function aggregate(records) {
    const items = {};
    for (const reg of records || []) {
      if (!reg || typeof reg.quiz !== "string" || !Array.isArray(reg.answers)) continue;
      for (const answer of reg.answers) {
        const id = identity(reg, answer);
        if (!items[id.key]) items[id.key] = {
          key: id.key, qId: id.qId, global: id.global,
          question: answer.question || "Questão sem texto no registro",
          category: answer.cat || "Sem categoria", quizIds: new Set(), versions: {}
        };
        const item = items[id.key];
        item.quizIds.add(reg.quiz);
        if (answer.question) item.question = answer.question;
        const version = answer.itemVersion === undefined || answer.itemVersion === null || answer.itemVersion === ""
          ? LEGACY_VERSION : String(answer.itemVersion);
        if (!item.versions[version]) item.versions[version] = freshVersion(version);
        const row = item.versions[version];
        row.attempts++;
        if (answer.correct === true) row.correct++;
        const elapsed = responseTimeMs(answer);
        if (elapsed !== null) row.times.push(elapsed);
        const user = reg.userId || reg.studentId || answer.userId;
        if (user !== undefined && user !== null) row.users.add(String(user));

        const key = optionKey(answer);
        if (key) {
          if (!row.options[key]) row.options[key] = { key, label: optionLabel(answer), correct: answer.correct === true, count: 0, highConfidenceCount: 0 };
          const option = row.options[key];
          option.count++;
          if (answer.correct === false && HIGH_CONFIDENCE.has(answer.certainty)) option.highConfidenceCount++;
        }
        // New records may export the full option list, allowing true zero-choice detection.
        const choices = Array.isArray(answer.options) ? answer.options : Array.isArray(answer.optionTexts) ? answer.optionTexts : [];
        choices.forEach((label, index) => {
          const choiceKey = "text:" + String(label);
          if (!row.options[choiceKey]) row.options[choiceKey] = {
            key: choiceKey, label: String(label), correct: index === answer.correctOption, count: 0, highConfidenceCount: 0
          };
        });
      }
    }
    return Object.values(items).map(item => ({
      ...item,
      quizIds: Array.from(item.quizIds).sort(),
      versions: Object.values(item.versions).map(summarizeVersion)
    })).sort((a, b) => (a.qId || a.key).localeCompare(b.qId || b.key));
  }

  return { aggregate, responseTimeMs, LEGACY_VERSION, MIN_CLASSICAL_N, MIN_CLASSICAL_USERS };
});
