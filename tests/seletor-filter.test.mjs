import test from "node:test";import assert from "node:assert/strict";import { matchesFilter } from "../app/views/seletor.mjs";

const row={
  spec:{title:"Distúrbios de Sódio e Água",resumo:"Lista completa"},
  questions:[{tema:"Distúrbios de Sódio e Água",pergunta:"Paciente com hiponatremia"}]
};

test("matchesFilter: termo vazio exibe a lista (não filtra)",()=>{
  assert.equal(matchesFilter("",row),true);
  assert.equal(matchesFilter("   ",row),true);
});
test("matchesFilter: 'sodio' encontra lista com 'Sódio' no título",()=>{
  assert.equal(matchesFilter("sodio",row),true);
});
test("matchesFilter: 'sódio' encontra a mesma lista",()=>{
  assert.equal(matchesFilter("sódio",row),true);
});
test("matchesFilter: 'SODIO' encontra a mesma lista",()=>{
  assert.equal(matchesFilter("SODIO",row),true);
});
test("matchesFilter: termo sem correspondência não encontra a lista",()=>{
  assert.equal(matchesFilter("endocardite",row),false);
});
