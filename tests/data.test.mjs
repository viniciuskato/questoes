import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { selecionarQuestoes, SPEC_IDS, toQuizData, resolveImagePath, coveredQuestionIds } from "../app/data.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,"..");
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const banco=readJson("_banco/banco-questoes.json"),fontes=readJson("_banco/fontes.json");
const require=createRequire(import.meta.url);const original=require(path.join(root,"_banco/selecionar.js"));

test("fontes canônicas mantêm o baseline auditado",()=>{assert.equal(banco.questoes.length,393);assert.equal(Object.keys(fontes.fontes).length,87);});
test("todas as nove specs são selecionáveis",()=>{assert.equal(SPEC_IDS.length,9);for(const id of SPEC_IDS){const spec=readJson(`_banco/specs/${id}.json`);assert.ok(selecionarQuestoes(banco,spec).length>0,id);}});
for(const id of SPEC_IDS){test(`port ESM equivale ao seletor CommonJS: ${id}`,()=>{
  const spec=readJson(`_banco/specs/${id}.json`);
  const portIds=selecionarQuestoes(banco,spec).map(q=>q.id);
  const originalIds=original.selecionarQuestoes(banco,spec).map(q=>q.id);
  assert.equal(portIds.length,originalIds.length,`${id}: quantidade divergente (ESM=${portIds.length}, CommonJS=${originalIds.length})`);
  assert.deepEqual(portIds,originalIds,`${id}: ids divergem entre o port ESM e _banco/selecionar.js`);
});}
test("adaptação para o motor não duplica o banco",()=>{const spec=readJson("_banco/specs/endocardite.json");const selected=selecionarQuestoes(banco,spec);const quiz=toQuizData(spec,selected,fontes);assert.equal(quiz.questions.length,selected.length);assert.equal(quiz.questions[0].id,selected[0].id);assert.ok(Object.keys(quiz.fontes).length<Object.keys(fontes.fontes).length);});

test("cobertura das specs é a união real de ids, não um número fixo",()=>{
  const specs=SPEC_IDS.map(id=>readJson(`_banco/specs/${id}.json`));
  const covered=coveredQuestionIds(banco,specs);
  assert.ok(covered.size>0 && covered.size<banco.questoes.length,"cobertura deve ser um subconjunto não vazio do banco");
  const manual=new Set();
  specs.forEach(spec=>selecionarQuestoes(banco,spec).forEach(q=>manual.add(q.id)));
  assert.equal(covered.size,manual.size);
});

test("resolveImagePath: caminho relativo do banco recebe prefixo _banco/",()=>{
  assert.equal(resolveImagePath("imagens/pneumologia/rx-caso-02-mediastino.png"),"_banco/imagens/pneumologia/rx-caso-02-mediastino.png");
});
test("resolveImagePath: caminho já prefixado não duplica _banco/",()=>{
  assert.equal(resolveImagePath("_banco/imagens/x.png"),"_banco/imagens/x.png");
});
test("resolveImagePath: rejeita URL externa e caminho absoluto",()=>{
  assert.equal(resolveImagePath("https://exemplo.com/x.png"),null);
  assert.equal(resolveImagePath("//exemplo.com/x.png"),null);
  assert.equal(resolveImagePath("/etc/passwd"),null);
});
test("resolveImagePath: vazio/ausente vira null",()=>{
  assert.equal(resolveImagePath(""),null);
  assert.equal(resolveImagePath(undefined),null);
});

test("toQuizData: questão com imagem recebe caminho resolvido e legenda preservada",()=>{
  const spec=readJson("_banco/specs/radiografia-torax-basica.json");
  const selected=selecionarQuestoes(banco,spec);
  const withImage=selected.find(q=>q.imagem);
  assert.ok(withImage,"esperava ao menos uma questão com imagem na spec de radiografia");
  const quiz=toQuizData(spec,[withImage],fontes);
  const item=quiz.questions[0];
  assert.equal(item.img,"_banco/"+withImage.imagem);
  assert.equal(item.imgAlt,withImage.imagemLegenda);
  assert.notEqual(item.imgAlt,"");
});
test("toQuizData: fallback legado de imgAlt funciona quando não há imagemLegenda",()=>{
  const spec=readJson("_banco/specs/endocardite.json");
  const base=selecionarQuestoes(banco,spec)[0];
  const legado={...base,imagem:"imagens/legado.png",imagemLegenda:undefined,imagemMeta:{alt:"legenda via imagemMeta"}};
  const quiz=toQuizData(spec,[legado],fontes);
  assert.equal(quiz.questions[0].imgAlt,"legenda via imagemMeta");
});
test("toQuizData: questão sem imagem mantém img null",()=>{
  const spec=readJson("_banco/specs/endocardite.json");
  const base=selecionarQuestoes(banco,spec)[0];
  const semImagem={...base,imagem:undefined,img:undefined};
  const quiz=toQuizData(spec,[semImagem],fontes);
  assert.equal(quiz.questions[0].img,null);
  assert.equal(quiz.questions[0].imgAlt,"");
});
