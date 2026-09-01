import test from "node:test";import assert from "node:assert/strict";
import {
  normalizeCapsulePayload, encodeCapsulePayload, decodeCapsulePayload, buildCapsuleRoute,
  capsuleSlug, toCapsuleSpec, resolveCapsuleQuestions, capsuleSummary,
  getPublicAppBaseUrl, buildShareUrl
} from "../app/capsule.mjs";
import { PUBLIC_APP_URL } from "../app/config.mjs";

const basePayload = { v: 1, title: "Revisão de cardiologia", description: "", questionIds: ["id-1", "id-2", "id-3"], mode: "study", order: "shuffle", answerReveal: "immediate" };

test("normalizeCapsulePayload: aceita payload mínimo válido e preenche defaults",()=>{
  const normalized = normalizeCapsulePayload({ v: 1, title: "Lista", questionIds: ["a"] });
  assert.equal(normalized.mode, "study");
  assert.equal(normalized.order, "shuffle");
  assert.equal(normalized.answerReveal, "immediate");
  assert.equal(normalized.description, "");
});

test("normalizeCapsulePayload: remove ids duplicados preservando a ordem",()=>{
  const normalized = normalizeCapsulePayload({ ...basePayload, questionIds: ["a", "b", "a", "c"] });
  assert.deepEqual(normalized.questionIds, ["a", "b", "c"]);
});

test("normalizeCapsulePayload: rejeita versão desconhecida",()=>{
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, v: 2 }), /Versão de cápsula inválida/);
});

test("normalizeCapsulePayload: rejeita título ausente",()=>{
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, title: "  " }), /título ausente/);
});

test("normalizeCapsulePayload: rejeita lista de questões vazia",()=>{
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, questionIds: [] }), /lista de questões vazia/);
});

test("normalizeCapsulePayload: rejeita modo/ordem/revelação fora do enum",()=>{
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, mode: "invalido" }), /Modo de cápsula inválido/);
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, order: "invalido" }), /Ordem de cápsula inválida/);
  assert.throws(()=>normalizeCapsulePayload({ ...basePayload, answerReveal: "invalido" }), /Revelação de respostas inválida/);
});

test("encodeCapsulePayload + decodeCapsulePayload: round-trip preserva o payload",async()=>{
  const encoded = await encodeCapsulePayload(basePayload);
  const decoded = await decodeCapsulePayload(encoded);
  assert.deepEqual(decoded, basePayload);
});

test("encodeCapsulePayload: preserva acentos e caracteres especiais no título/descrição",async()=>{
  const payload = { ...basePayload, title: "Endocardite — critérios de Duke", description: "Foco em áreas cinzentas & exceções" };
  const decoded = await decodeCapsulePayload(await encodeCapsulePayload(payload));
  assert.equal(decoded.title, payload.title);
  assert.equal(decoded.description, payload.description);
});

test("encodeCapsulePayload: comprime o payload (link fica bem menor que o JSON bruto em base64)",async()=>{
  const questionIds = Array.from({ length: 70 }, (_, i) => `endocardite-${String(i + 1).padStart(2, "0")}`);
  const payload = { ...basePayload, questionIds };
  const encoded = await encodeCapsulePayload(payload);
  const uncompressedLength = Buffer.from(JSON.stringify(normalizeCapsulePayload(payload))).toString("base64").length;
  assert.ok(encoded.length < uncompressedLength * 0.6, `esperado link comprimido bem menor: ${encoded.length} vs ${uncompressedLength}`);
});

test("decodeCapsulePayload: aceita o formato legado sem compressão (links compartilhados antes desta mudança)",async()=>{
  const legacyEncoded = Buffer.from(JSON.stringify(basePayload), "utf8").toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const decoded = await decodeCapsulePayload(legacyEncoded);
  assert.deepEqual(decoded, basePayload);
});

test("decodeCapsulePayload: link vazio lança erro compreensível",async()=>{
  await assert.rejects(()=>decodeCapsulePayload(""), /link sem dados/);
  await assert.rejects(()=>decodeCapsulePayload(null), /link sem dados/);
});

test("decodeCapsulePayload: link malformado (não é base64url válido de JSON) lança erro",async()=>{
  await assert.rejects(()=>decodeCapsulePayload("!!!nao-e-base64!!!"), /link malformado/);
});

test("getPublicAppBaseUrl: usa PUBLIC_APP_URL configurada, sem barra final",()=>{
  assert.equal(getPublicAppBaseUrl(), PUBLIC_APP_URL.replace(/\/+$/, ""));
});

test("buildShareUrl: nunca contém localhost quando PUBLIC_APP_URL está configurada",async()=>{
  const url = await buildShareUrl(basePayload);
  assert.ok(!/localhost/.test(url), `link não deveria conter localhost: ${url}`);
  assert.ok(url.startsWith(`${PUBLIC_APP_URL}/index.html#/lista?d=`), url);
});

test("buildShareUrl: rota embutida é idêntica à de buildCapsuleRoute",async()=>{
  const url = await buildShareUrl(basePayload);
  assert.ok(url.endsWith(await buildCapsuleRoute(basePayload)), url);
});

test("buildCapsuleRoute: produz uma rota #/lista?d=...",async()=>{
  const route = await buildCapsuleRoute(basePayload);
  assert.match(route, /^#\/lista\?d=/);
  const encoded = route.replace("#/lista?d=", "");
  assert.deepEqual(await decodeCapsulePayload(encoded), basePayload);
});

test("capsuleSlug: normaliza título em slug estável e com prefixo",()=>{
  assert.equal(capsuleSlug("Revisão de Cardiologia!"), "capsula-revisao-de-cardiologia");
  assert.equal(capsuleSlug(""), "capsula-estudo");
});

test("toCapsuleSpec: usa o slug como quizId e preserva título/descrição",()=>{
  const spec = toCapsuleSpec(basePayload);
  assert.equal(spec.quizId, "capsula-revisao-de-cardiologia");
  assert.equal(spec.title, basePayload.title);
});

test("resolveCapsuleQuestions: resolve ids existentes na ordem do payload",()=>{
  const questoes = [{ id: "id-3" }, { id: "id-1" }, { id: "id-2" }, { id: "id-4" }];
  const { questions, missingIds } = resolveCapsuleQuestions(questoes, basePayload);
  assert.deepEqual(questions.map(q=>q.id), ["id-1", "id-2", "id-3"]);
  assert.deepEqual(missingIds, []);
});

test("resolveCapsuleQuestions: ids que não existem mais no banco são reportados, não escondidos",()=>{
  const questoes = [{ id: "id-1" }];
  const { questions, missingIds } = resolveCapsuleQuestions(questoes, basePayload);
  assert.deepEqual(questions.map(q=>q.id), ["id-1"]);
  assert.deepEqual(missingIds, ["id-2", "id-3"]);
});

test("resolveCapsuleQuestions: nenhum id sobrevivente lança erro (nunca sessão vazia silenciosa)",()=>{
  const questoes = [{ id: "outro-id" }];
  assert.throws(()=>resolveCapsuleQuestions(questoes, basePayload), /Nenhuma questão desta cápsula foi encontrada/);
});

test("capsuleSummary: resume contagem e rótulos legíveis",()=>{
  const summary = capsuleSummary(basePayload);
  assert.equal(summary.count, 3);
  assert.equal(summary.modeLabel, "Estudo");
  assert.equal(summary.orderLabel, "Embaralhada");
  assert.match(summary.revealLabel, /Imediata/);
});
