import test from "node:test";import assert from "node:assert/strict";import { normalizeSearchText, searchQuestions } from "../app/search.mjs";

test("normalizeSearchText: sodio/sódio/SODIO equivalem",()=>{
  assert.equal(normalizeSearchText("sódio"),normalizeSearchText("sodio"));
  assert.equal(normalizeSearchText("SODIO"),normalizeSearchText("sodio"));
});
test("normalizeSearchText: questões/questoes equivalem",()=>{
  assert.equal(normalizeSearchText("questões"),normalizeSearchText("questoes"));
});
test("normalizeSearchText: preserva termos técnicos e números",()=>{
  assert.equal(normalizeSearchText("Na+ 135 mEq/L"),"na+ 135 meq/l");
});
test("normalizeSearchText: string vazia",()=>{
  assert.equal(normalizeSearchText(""),"");
});
test("normalizeSearchText: null/undefined viram string vazia",()=>{
  assert.equal(normalizeSearchText(null),"");
  assert.equal(normalizeSearchText(undefined),"");
});

const questions=[
  {id:"a",pergunta:"Endocardite infecciosa em válvula nativa",tema:"Endocardite Infecciosa",categoria:"Clínica"},
  {id:"b",pergunta:"Distúrbio de sódio em paciente internado",tema:"Distúrbios de Sódio e Água",categoria:"Clínica"}
];
test("searchQuestions: busca vazia não filtra nada (retorna vazio, não todas)",()=>{
  assert.deepEqual(searchQuestions(questions,""),[]);
});
test("searchQuestions: 'sodio' encontra questão com 'sódio'",()=>{
  const result=searchQuestions(questions,"sodio");
  assert.equal(result.length,1);
  assert.equal(result[0].id,"b");
});
test("searchQuestions: 'endocardite' continua funcionando",()=>{
  const result=searchQuestions(questions,"endocardite");
  assert.equal(result.length,1);
  assert.equal(result[0].id,"a");
});
