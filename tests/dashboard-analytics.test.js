const assert = require("node:assert/strict");
const test = require("node:test");
const analytics = require("../_dados/dashboard-analytics.js");

function record(quiz, answers, extra = {}) { return { quiz, answers, ...extra }; }

test("agrega qId globalmente e separa versões", () => {
  const items = analytics.aggregate([
    record("lista-a", [{ qId: "global-1", itemVersion: 1, correct: true, question: "Texto antigo" }]),
    record("lista-b", [{ qId: "global-1", itemVersion: 2, correct: false, question: "Texto novo" }])
  ]);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0].quizIds, ["lista-a", "lista-b"]);
  assert.deepEqual(items[0].versions.map(v => v.version), ["1", "2"]);
});

test("calcula dificuldade, distratores, ambiguidade e tempo", () => {
  const answers = [
    { qId: "q", itemVersion: 3, correct: true, selectedOption: 0, selectedOptionText: "Certa", correctOption: 0, options: ["Certa", "D1", "D2"], responseTimeMs: 1000 },
    { qId: "q", itemVersion: 3, correct: false, selectedOption: 1, selectedOptionText: "D1", correctOption: 0, options: ["Certa", "D1", "D2"], certainty: "know", certaintyMarkedAt: "2026-01-01T00:00:00Z", answeredAt: "2026-01-01T00:00:03Z" }
  ];
  const version = analytics.aggregate([record("a", answers)])[0].versions[0];
  assert.equal(version.observedDifficulty, 0.5);
  assert.equal(version.distractors.find(d => d.label === "D1").frequency, 0.5);
  assert.equal(version.distractors.find(d => d.label === "D1").ambiguity, true);
  assert.deepEqual(version.neverChosen.map(d => d.label), ["D2"]);
  assert.equal(version.responseTime.n, 2);
  assert.equal(version.responseTime.meanMs, 2000);
});

test("mantém registros legados e bloqueia discriminação com amostra insuficiente", () => {
  const item = analytics.aggregate([record("antiga", [{ qIndex: 4, question: "Legada", correct: false, selectedOption: 2 }])])[0];
  assert.equal(item.global, false);
  assert.equal(item.versions[0].version, analytics.LEGACY_VERSION);
  assert.match(item.versions[0].distractors[0].label, /texto não registrado/);
  assert.equal(item.versions[0].discrimination.available, false);
  assert.match(item.versions[0].discrimination.reason, /≥30 tentativas/);
});
