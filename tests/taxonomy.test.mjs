import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";import { fileURLToPath } from "node:url";
import { buildTaxonomyTree, listTemas, collectValues, resolveTaxonomyValue, fieldValue } from "../app/taxonomy.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,"..");
const banco=JSON.parse(fs.readFileSync(path.join(root,"_banco/banco-questoes.json"),"utf8"));

test("taxonomia cobre todas as 393 questões do banco (nenhuma perdida na árvore)",()=>{
  const tree=buildTaxonomyTree(banco.questoes);
  const total=tree.reduce((sum,area)=>sum+area.count,0);
  assert.equal(total,banco.questoes.length);
  assert.equal(banco.questoes.length,393);
});

test("dez temas únicos no banco",()=>{
  assert.equal(listTemas(banco.questoes).length,10);
});

test("toda questão pertence a pelo menos um tema explorável",()=>{
  const temas=new Set(listTemas(banco.questoes));
  for(const q of banco.questoes){
    assert.ok(temas.has(fieldValue(q,"tema")),`questão ${q.id} sem tema reconhecido`);
  }
});

test("collectValues: área única 'Medicina' no piloto atual",()=>{
  assert.deepEqual(collectValues(banco.questoes,"area"),["Medicina"]);
});

test("resolveTaxonomyValue: casa valor sem acento com o canônico",()=>{
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema","Endocardite Infecciosa"),"Endocardite Infecciosa");
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema","endocardite infecciosa"),"Endocardite Infecciosa");
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema","ENDOCARDITE INFECCIOSA"),"Endocardite Infecciosa");
});

test("resolveTaxonomyValue: tema inexistente retorna null",()=>{
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema","Tema Que Não Existe"),null);
});

test("resolveTaxonomyValue: valor vazio retorna null",()=>{
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema",""),null);
  assert.equal(resolveTaxonomyValue(banco.questoes,"tema",null),null);
});

test("buildTaxonomyTree: contagens por nível somam corretamente",()=>{
  const tree=buildTaxonomyTree(banco.questoes);
  for(const area of tree){
    const discSum=area.disciplinas.reduce((s,d)=>s+d.count,0);
    assert.equal(discSum,area.count);
    for(const disc of area.disciplinas){
      const temaSum=disc.temas.reduce((s,t)=>s+t.count,0);
      assert.equal(temaSum,disc.count);
      for(const tema of disc.temas){
        const subSum=tema.subtemas.reduce((s,st)=>s+st.count,0);
        assert.equal(subSum,tema.count);
      }
    }
  }
});
