import test from "node:test";import assert from "node:assert/strict";
import { buildCapsuleMissingNotice, buildCapsuleInfoHtml } from "../app/views/lista.mjs";
import { normalizeCapsulePayload, capsuleSummary } from "../app/capsule.mjs";

test("buildCapsuleMissingNotice: vazio quando não há id ausente",()=>{
  assert.equal(buildCapsuleMissingNotice([]), "");
});
test("buildCapsuleMissingNotice: avisa quantas questões da cápsula sumiram do banco",()=>{
  const html = buildCapsuleMissingNotice(["a", "b"]);
  assert.match(html, /2 questão/);
});

test("buildCapsuleInfoHtml: resume modo/ordem/revelação e a contagem",()=>{
  const payload = normalizeCapsulePayload({ v: 1, title: "Lista", questionIds: ["a", "b"], mode: "exam", order: "original", answerReveal: "immediate" });
  const html = buildCapsuleInfoHtml(payload, capsuleSummary(payload));
  assert.match(html, /Simulado/);
  assert.match(html, /Original/);
  assert.match(html, /2 questão/);
});

test("buildCapsuleInfoHtml: só mostra o botão 'Revelar respostas' quando answerReveal é 'end'",()=>{
  const immediate = normalizeCapsulePayload({ v: 1, title: "Lista", questionIds: ["a"], answerReveal: "immediate" });
  const end = normalizeCapsulePayload({ v: 1, title: "Lista", questionIds: ["a"], answerReveal: "end" });
  assert.doesNotMatch(buildCapsuleInfoHtml(immediate, capsuleSummary(immediate)), /id="capsule-reveal"/);
  assert.match(buildCapsuleInfoHtml(end, capsuleSummary(end)), /id="capsule-reveal"/);
});
