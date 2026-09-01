import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";import { fileURLToPath } from "node:url";
import { resolveDynamicRoute, resolveFilters, selectEligible, pickSessionSubset, parseTamanho, validateQueryShape, serializeDynamicRoute, buildDynamicSession } from "../app/dynamic-session.mjs";
import { toQuizData } from "../app/data.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,"..");
const banco=JSON.parse(fs.readFileSync(path.join(root,"_banco/banco-questoes.json"),"utf8"));
const fontes=JSON.parse(fs.readFileSync(path.join(root,"_banco/fontes.json"),"utf8"));
const q=params=>new URLSearchParams(params);

test("filtro por tema sozinho seleciona só as questões daquele tema",()=>{
  const filter=resolveFilters(banco.questoes,q({tema:"Endocardite Infecciosa"}));
  const eligible=selectEligible(banco.questoes,filter);
  assert.equal(eligible.length,52);
  assert.ok(eligible.every(item=>(item.classificacao?.tema||item.tema)==="Endocardite Infecciosa"));
});

test("filtro por área+disciplina+tema+subtema combinados",()=>{
  const filter=resolveFilters(banco.questoes,q({area:"Medicina",disciplina:"Neurocirurgia",tema:"Tumores do Sistema Nervoso Central",subtema:"Histologia do SNC"}));
  const eligible=selectEligible(banco.questoes,filter);
  assert.equal(eligible.length,2);
});

test("valores sem acento e com caixa diferente resolvem para o canônico",()=>{
  const filter=resolveFilters(banco.questoes,q({tema:"hipertensao arterial e sraa"}));
  assert.equal(filter.tema,"Hipertensão Arterial e SRAA");
});

test("tema inexistente lança erro compreensível",()=>{
  assert.throws(()=>resolveFilters(banco.questoes,q({tema:"Tema Inventado"})),/Nenhuma questão do banco tem tema/);
});

test("filtro vazio seleciona o banco inteiro",()=>{
  const eligible=selectEligible(banco.questoes,resolveFilters(banco.questoes,q({})));
  assert.equal(eligible.length,393);
});

test("parseTamanho aceita 10, 20 e all",()=>{
  assert.equal(parseTamanho("10"),10);
  assert.equal(parseTamanho("20"),20);
  assert.equal(parseTamanho("all"),"all");
  assert.equal(parseTamanho(null),"all");
});

test("parseTamanho rejeita valores inválidos",()=>{
  assert.throws(()=>parseTamanho("abc"),/Tamanho de sessão inválido/);
  assert.throws(()=>parseTamanho("0"),/Tamanho de sessão inválido/);
  assert.throws(()=>parseTamanho("-5"),/Tamanho de sessão inválido/);
});

test("pickSessionSubset: conjunto menor que o tamanho pedido usa tudo e sinaliza redução",()=>{
  const eligible=selectEligible(banco.questoes,resolveFilters(banco.questoes,q({tema:"Radiografia de Tórax Básica"})));
  assert.equal(eligible.length,18);
  const picked=pickSessionSubset(eligible,20);
  assert.equal(picked.includedCount,18);
  assert.equal(picked.sizeReduced,true);
});

test("pickSessionSubset: tamanho 'all' inclui todas as elegíveis",()=>{
  const eligible=selectEligible(banco.questoes,resolveFilters(banco.questoes,q({tema:"Antimicrobianos - fundamentos"})));
  const picked=pickSessionSubset(eligible,"all");
  assert.equal(picked.includedCount,eligible.length);
  assert.equal(picked.sizeReduced,false);
});

test("pickSessionSubset: sessão com uma única questão elegível",()=>{
  const eligible=selectEligible(banco.questoes,resolveFilters(banco.questoes,q({subtema:"Integração Clínico-Radiológica"})));
  assert.equal(eligible.length,1);
  const picked=pickSessionSubset(eligible,10);
  assert.equal(picked.includedCount,1);
  assert.equal(picked.sizeReduced,true);
});

test("pickSessionSubset é determinístico: mesma entrada produz a mesma seleção (base do comportamento de F5/nova aba)",()=>{
  const eligible=selectEligible(banco.questoes,resolveFilters(banco.questoes,q({tema:"Insuficiência Cardíaca"})));
  const a=pickSessionSubset(eligible,10).included.map(x=>x.id);
  const b=pickSessionSubset(eligible,10).included.map(x=>x.id);
  assert.deepEqual(a,b);
});

test("validateQueryShape: rejeita parâmetro desconhecido",()=>{
  assert.throws(()=>validateQueryShape(q({temaa:"x"})),/Parâmetro desconhecido/);
});

test("validateQueryShape: rejeita parâmetro duplicado",()=>{
  const params=new URLSearchParams();params.append("tema","A");params.append("tema","B");
  assert.throws(()=>validateQueryShape(params),/mais de uma vez/);
});

test("validateQueryShape: aceita tag repetida (campo multivalorado)",()=>{
  const params=new URLSearchParams();params.append("tag","a");params.append("tag","b");
  assert.doesNotThrow(()=>validateQueryShape(params));
});

test("resolveDynamicRoute: fim a fim com tema válido e tamanho 10",()=>{
  const result=resolveDynamicRoute(banco,q({tema:"Endocardite Infecciosa",tamanho:"10"}));
  assert.equal(result.includedCount,10);
  assert.equal(result.eligibleCount,52);
  assert.equal(result.session.type,"dynamic");
});

test("resolveDynamicRoute: resultado vazio lança erro (nunca sessão vazia silenciosa)",()=>{
  const filtro=q({tema:"Endocardite Infecciosa",tag:"tag-que-nao-existe-em-nenhuma-questao"});
  assert.throws(()=>resolveDynamicRoute(banco,filtro),/Nenhuma questão do banco corresponde/);
});

test("serializeDynamicRoute + resolveDynamicRoute: round-trip preserva o mesmo conjunto elegível",()=>{
  const filter={tema:"Distúrbios de Sódio e Água"};
  const route=serializeDynamicRoute(filter,20);
  assert.match(route,/^#\/sessao\?/);
  const query=new URLSearchParams(route.split("?")[1]);
  const result=resolveDynamicRoute(banco,query);
  assert.equal(result.eligibleCount,24);
  assert.equal(result.includedCount,20);
});

test("serializeDynamicRoute preserva a opção de excluir questões feitas",()=>{
  const route=serializeDynamicRoute({tema:"Endocardite Infecciosa"},10,null,true);
  const query=new URLSearchParams(route.split("?")[1]);
  assert.equal(query.get("excluirFeitas"),"1");
  assert.doesNotThrow(()=>validateQueryShape(query));
});

test("F5 / nova aba: reconstruir a sessão a partir da mesma URL produz sessão equivalente",()=>{
  const query=q({tema:"Hipertensão Arterial e SRAA",tamanho:"10"});
  const first=resolveDynamicRoute(banco,new URLSearchParams(query));
  const second=resolveDynamicRoute(banco,new URLSearchParams(query));
  assert.deepEqual(first.included.map(x=>x.id),second.included.map(x=>x.id));
});

test("adaptação ao formato do initQuiz: mesmos campos de uma sessão curada",()=>{
  const result=resolveDynamicRoute(banco,q({tema:"Radiografia de Tórax Básica",tamanho:"all"}));
  const quizData=toQuizData(result.spec,result.included,fontes,{type:"dynamic",filter:result.session.filter,eligibleCount:result.eligibleCount,includedCount:result.includedCount});
  const item=quizData.questions[0];
  for(const key of ["id","tema","cat","classificacao","q","img","imgAlt","options","correct","exp","ref","itemVersion","editorialState"]) assert.ok(key in item,`campo ${key} ausente`);
  assert.equal(quizData.sessionMeta.type,"dynamic");
});

test("imagens e legendas sobrevivem à sessão dinâmica",()=>{
  const result=resolveDynamicRoute(banco,q({tema:"Radiografia de Tórax Básica",tamanho:"all"}));
  const withImage=result.included.find(x=>x.imagem);
  assert.ok(withImage,"esperava questão com imagem em Radiografia de Tórax Básica");
  const quizData=toQuizData(result.spec,result.included,fontes);
  const item=quizData.questions.find(x=>x.id===withImage.id);
  assert.equal(item.img,"_banco/"+withImage.imagem);
  assert.ok(item.imgAlt);
});

test("referências usadas pela sessão dinâmica são um subconjunto de fontes.json",()=>{
  const result=resolveDynamicRoute(banco,q({tema:"Endocardite Infecciosa",tamanho:"10"}));
  const quizData=toQuizData(result.spec,result.included,fontes);
  const usedSlugs=Object.keys(quizData.fontes);
  assert.ok(usedSlugs.length>0);
  usedSlugs.forEach(slug=>assert.ok(slug in fontes.fontes,`slug ${slug} não está em fontes.json`));
});

test("buildDynamicSession nunca grava no banco canônico (é um objeto em memória)",()=>{
  const session=buildDynamicSession({filter:{tema:"Endocardite Infecciosa"},size:10,highlight:null});
  assert.equal(session.type,"dynamic");
  assert.equal(typeof session.id,"string");
  assert.equal(session.filter.tema,"Endocardite Infecciosa");
});

test("compatibilidade do registro exportado: sessionMeta é opcional e aditivo (specs curadas continuam sem quebrar)",()=>{
  const spec={quizId:"x",title:"X"};
  const quizData=toQuizData(spec,banco.questoes.slice(0,1),fontes);
  assert.equal(quizData.sessionMeta,null);
});
