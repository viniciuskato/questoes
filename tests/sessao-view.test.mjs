import test from "node:test";import assert from "node:assert/strict";
import { describeActiveFilters, buildSizeNotice } from "../app/views/sessao.mjs";

test("describeActiveFilters: lista os filtros ativos por texto",()=>{
  const text=describeActiveFilters({tema:"Endocardite Infecciosa",subtema:"Microbiologia"});
  assert.match(text,/Tema: Endocardite Infecciosa/);
  assert.match(text,/Subtema: Microbiologia/);
});

test("describeActiveFilters: sem filtro nenhum descreve o banco inteiro",()=>{
  assert.match(describeActiveFilters({}),/Todas as questões do banco/);
});

test("describeActiveFilters: inclui tags quando presentes",()=>{
  assert.match(describeActiveFilters({tags:["microbiologia","critérios diagnósticos"]}),/Tags: microbiologia, critérios diagnósticos/);
});

test("buildSizeNotice: vazio quando o tamanho não foi reduzido",()=>{
  assert.equal(buildSizeNotice({sizeReduced:false,eligibleCount:20,includedCount:20}),"");
});

test("buildSizeNotice: avisa quando o conjunto é menor que o pedido",()=>{
  const html=buildSizeNotice({sizeReduced:true,eligibleCount:18,includedCount:18});
  assert.match(html,/18/);
  assert.match(html,/todas as 18/);
});
