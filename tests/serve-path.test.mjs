import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { resolveSafePath, ROOT } = require(path.join(here, "..", "tools", "serve.js"));

test("permite arquivo dentro da raiz", () => {
  assert.equal(resolveSafePath(ROOT, "/index.html"), path.join(ROOT, "index.html"));
  assert.equal(resolveSafePath(ROOT, "/app/main.mjs"), path.join(ROOT, "app", "main.mjs"));
});

test("raiz sem caminho vira index.html", () => {
  assert.equal(resolveSafePath(ROOT, "/"), path.join(ROOT, "index.html"));
});

test("rejeita travessia de diretório com ..", () => {
  assert.equal(resolveSafePath(ROOT, "/../Windows/win.ini"), null);
  assert.equal(resolveSafePath(ROOT, "/_banco/../../Windows/win.ini"), null);
  assert.equal(resolveSafePath(ROOT, "/%2e%2e/%2e%2e/Windows/win.ini"), null);
});

test("rejeita diretório irmão que só compartilha o prefixo do nome", () => {
  const sibling = ROOT + "-outra-pasta";
  assert.equal(path.relative(ROOT, sibling).startsWith(".."), true);
  assert.equal(resolveSafePath(ROOT, "/../" + path.basename(ROOT) + "-outra-pasta/segredo.txt"), null);
});

test("descarta querystring antes de resolver", () => {
  assert.equal(resolveSafePath(ROOT, "/index.html?x=1"), path.join(ROOT, "index.html"));
});
