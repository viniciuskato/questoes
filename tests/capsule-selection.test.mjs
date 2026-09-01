import test from "node:test";import assert from "node:assert/strict";
import { matchesQuestionBrowserTerm, truncateQuestionText, formatSelectionCount, renderCapsuleQuestionRow } from "../app/views/seletor.mjs";

const question = { id: "q1", tema: "Endocardite Infecciosa", categoria: "Diagnóstico", pergunta: "Paciente com sopro novo e febre, qual o próximo passo?" };

test("matchesQuestionBrowserTerm: termo vazio mostra a questão (navegador, não busca)",()=>{
  assert.equal(matchesQuestionBrowserTerm("", question), true);
  assert.equal(matchesQuestionBrowserTerm("   ", question), true);
});
test("matchesQuestionBrowserTerm: casa por tema sem acento/caixa",()=>{
  assert.equal(matchesQuestionBrowserTerm("endocardite", question), true);
  assert.equal(matchesQuestionBrowserTerm("ENDOCARDITE", question), true);
});
test("matchesQuestionBrowserTerm: casa pelo texto do enunciado",()=>{
  assert.equal(matchesQuestionBrowserTerm("sopro novo", question), true);
});
test("matchesQuestionBrowserTerm: termo sem correspondência não casa",()=>{
  assert.equal(matchesQuestionBrowserTerm("hipertensão", question), false);
});

test("truncateQuestionText: mantém texto curto intacto",()=>{
  assert.equal(truncateQuestionText("texto curto"), "texto curto");
});
test("truncateQuestionText: corta texto longo e adiciona reticências",()=>{
  const long = "a".repeat(200);
  const result = truncateQuestionText(long, 50);
  assert.equal(result.length, 50);
  assert.ok(result.endsWith("…"));
});

test("formatSelectionCount: pluraliza corretamente",()=>{
  assert.equal(formatSelectionCount(0), "Nenhuma questão selecionada");
  assert.equal(formatSelectionCount(1), "1 questão selecionada");
  assert.equal(formatSelectionCount(2), "2 questões selecionadas");
});

test("renderCapsuleQuestionRow: checkbox nativo dentro de label (acessível por teclado/leitor de tela sem ARIA extra)",()=>{
  const html = renderCapsuleQuestionRow(question, false);
  assert.match(html, /<input type="checkbox" data-capsule-qid="q1">/);
  assert.match(html, /<label>/);
});
test("renderCapsuleQuestionRow: questão selecionada marca checked e classe selected",()=>{
  const html = renderCapsuleQuestionRow(question, true);
  assert.match(html, /class="capsule-question selected"/);
  assert.match(html, /checked/);
});
test("renderCapsuleQuestionRow: escapa conteúdo do enunciado/tema",()=>{
  const html = renderCapsuleQuestionRow({ id: "q2", tema: "<b>x</b>", pergunta: "<script>alert(1)</script>" }, false);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<b>x<\/b>/);
});
