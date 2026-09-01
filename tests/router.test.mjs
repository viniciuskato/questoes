import test from "node:test";import assert from "node:assert/strict";import { parseRoute } from "../app/router.mjs";
test("rota padrão",()=>assert.equal(parseRoute("").name,"inicio"));
test("quiz com id",()=>assert.deepEqual({name:parseRoute("#/quiz/endocardite").name,param:parseRoute("#/quiz/endocardite").param},{name:"quiz",param:"endocardite"}));
test("deep link do seletor",()=>{const hierarchy=["Medicina","Infectologia"];const route=parseRoute(`#/seletor?hierarquia=${encodeURIComponent(JSON.stringify(hierarchy))}&highlight=endocardite-01`);assert.equal(route.name,"seletor");assert.deepEqual(JSON.parse(route.query.get("hierarquia")),hierarchy);assert.equal(route.query.get("highlight"),"endocardite-01");});
test("rota de sessão dinâmica com filtros e tamanho",()=>{
  const route=parseRoute("#/sessao?tema=Endoscopia%20Digestiva&tamanho=10");
  assert.equal(route.name,"sessao");
  assert.equal(route.param,null);
  assert.equal(route.query.get("tema"),"Endoscopia Digestiva");
  assert.equal(route.query.get("tamanho"),"10");
});
test("rota de sessão dinâmica preserva múltiplos valores de tag",()=>{
  const route=parseRoute("#/sessao?tema=Endocardite%20Infecciosa&tag=a&tag=b");
  assert.deepEqual(route.query.getAll("tag"),["a","b"]);
});
