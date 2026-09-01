import test from "node:test";import assert from "node:assert/strict";import { readFileSync } from "node:fs";import { fileURLToPath } from "node:url";

const source=readFileSync(fileURLToPath(new URL("../app/views/seletor.mjs",import.meta.url)),"utf8");

test("#list-filter possui label associado (nome acessível explícito)",()=>{
  assert.match(source,/<label for="list-filter"[^>]*>Filtrar listas, temas ou questões<\/label>/);
});
test("#list-filter mantém o input logo após o label, na mesma marcação",()=>{
  const labelIndex=source.indexOf('<label for="list-filter"');
  const inputIndex=source.indexOf('id="list-filter" type="search"');
  assert.ok(labelIndex>=0&&inputIndex>labelIndex,"label deve vir antes do input no markup");
});
