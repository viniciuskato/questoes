import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";import { fileURLToPath } from "node:url";
import { resolveDynamicRoute } from "../app/dynamic-session.mjs";
import { buildExplorerFilter } from "../app/views/seletor.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,"..");
const banco=JSON.parse(fs.readFileSync(path.join(root,"_banco/banco-questoes.json"),"utf8"));

// Os seis temas que, antes desta etapa, só eram alcançáveis pelo legado
// (ver ARQUITETURA-SPA.md, "Cobertura real do piloto"). Cada um precisa
// virar uma sessão dinâmica funcional a partir da busca global.
const TEMAS_ANTES_SEM_LISTA = [
  "Endoscopia Digestiva",
  "Espirometria e Função Pulmonar",
  "Hipertensão Arterial e SRAA",
  "Insuficiência Cardíaca",
  "Tosse Crônica e Hemoptise",
  "Tumores do Sistema Nervoso Central"
];

for (const tema of TEMAS_ANTES_SEM_LISTA) {
  test(`busca por questão de "${tema}" produz sessão dinâmica funcional`, () => {
    const q = q0 => new URLSearchParams(q0);
    const result = resolveDynamicRoute(banco, q({ tema, tamanho: "all" }));
    assert.ok(result.includedCount > 0, `${tema} deveria ter questões elegíveis`);
    assert.ok(result.included.every(item => (item.classificacao?.tema || item.tema) === tema));
  });
}

test("buildExplorerFilter: converte estado do seletor num filtro de sessão dinâmica",()=>{
  const filter=buildExplorerFilter({tema:"Endocardite Infecciosa",subtema:"Microbiologia",tags:"a, b"});
  assert.deepEqual(filter,{tema:"Endocardite Infecciosa",subtema:"Microbiologia",tags:["a","b"]});
});

test("buildExplorerFilter: campos vazios não entram no filtro",()=>{
  const filter=buildExplorerFilter({tema:"Endocardite Infecciosa",area:"",disciplina:null,tags:""});
  assert.deepEqual(filter,{tema:"Endocardite Infecciosa"});
});
