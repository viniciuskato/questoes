// Cápsulas de estudo: listas personalizadas de questões, montadas no seletor
// e compartilhadas por link (`#/lista?d=<payload>`), sem backend e sem login.
// O payload trafega só na URL (e, opcionalmente, num arquivo .json baixado
// com a mesma forma) — nada é gravado no banco canônico nem em `_banco/specs/`.
import { PUBLIC_APP_URL } from "./config.mjs";

export const CAPSULE_VERSION = 1;

export const CAPSULE_MODES = ["study", "exam"];
export const CAPSULE_ORDERS = ["original", "shuffle"];
export const CAPSULE_REVEALS = ["immediate", "end"];

export const CAPSULE_MODE_LABEL = { study: "Estudo", exam: "Simulado" };
export const CAPSULE_ORDER_LABEL = { original: "Original", shuffle: "Embaralhada" };
export const CAPSULE_REVEAL_LABEL = { immediate: "Imediata, ao responder", end: "Somente ao final" };

function utf8ToBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64url) {
  let base64 = String(b64url).replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// `source` é aditivo e só informativo/diagnóstico (de onde a cápsula veio:
// seleção manual, lista curada ou sessão dinâmica) — `questionIds` continua
// sendo a única fonte de verdade resolvida no momento do compartilhamento.
// Por isso a validação aqui é permissiva (só a forma básica), nunca reprocessa
// filtros para recalcular questionIds.
function normalizeCapsuleSource(source) {
  if (source == null) return undefined;
  if (typeof source !== "object" || Array.isArray(source)) throw new Error("Cápsula inválida: origem malformada.");
  return { ...source };
}

// Valida e preenche defaults. Lança erros com texto compreensível — as
// mensagens usam "inválid"/"ausente" de propósito, para caírem na mesma
// classificação de erro (`badParams`) que `app/dynamic-session.mjs` já usa
// em `app/main.mjs`, sem precisar de uma categoria nova ali.
export function normalizeCapsulePayload(input) {
  if (!input || typeof input !== "object") throw new Error("Cápsula inválida: dados ausentes.");
  if (input.v !== CAPSULE_VERSION) throw new Error(`Versão de cápsula inválida: "${input.v}".`);
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("Cápsula inválida: título ausente.");
  const description = String(input.description ?? "").trim();
  if (!Array.isArray(input.questionIds)) throw new Error("Cápsula inválida: lista de questões ausente.");
  const questionIds = [...new Set(input.questionIds.filter(id => typeof id === "string" && id))];
  if (!questionIds.length) throw new Error("Cápsula inválida: lista de questões vazia.");
  const mode = input.mode == null ? "study" : input.mode;
  if (!CAPSULE_MODES.includes(mode)) throw new Error(`Modo de cápsula inválido: "${input.mode}".`);
  const order = input.order == null ? "shuffle" : input.order;
  if (!CAPSULE_ORDERS.includes(order)) throw new Error(`Ordem de cápsula inválida: "${input.order}".`);
  const answerReveal = input.answerReveal == null ? "immediate" : input.answerReveal;
  if (!CAPSULE_REVEALS.includes(answerReveal)) throw new Error(`Revelação de respostas inválida: "${input.answerReveal}".`);
  const source = normalizeCapsuleSource(input.source);
  return { v: CAPSULE_VERSION, title, description, questionIds, mode, order, answerReveal, ...(source !== undefined ? { source } : {}) };
}

export function encodeCapsulePayload(payload) {
  const normalized = normalizeCapsulePayload(payload);
  return utf8ToBase64Url(JSON.stringify(normalized));
}

export function decodeCapsulePayload(raw) {
  if (!raw) throw new Error("Cápsula inválida: link sem dados.");
  let json;
  try { json = base64UrlToUtf8(raw); }
  catch (_) { throw new Error("Cápsula inválida: link malformado."); }
  let parsed;
  try { parsed = JSON.parse(json); }
  catch (_) { throw new Error("Cápsula inválida: link malformado."); }
  return normalizeCapsulePayload(parsed);
}

export function buildCapsuleRoute(payload) {
  return `#/lista?d=${encodeCapsulePayload(payload)}`;
}

// Base pública para links compartilháveis. Usa PUBLIC_APP_URL quando
// configurada (produção); caso contrário cai na origem atual (dev local),
// preservando o caminho real da aplicação sem depender de "index.html" estar
// ou não presente em location.pathname.
export function getPublicAppBaseUrl() {
  if (PUBLIC_APP_URL) return PUBLIC_APP_URL.replace(/\/+$/, "");
  const currentPath = location.pathname;
  const basePath = currentPath.endsWith("/index.html")
    ? currentPath.slice(0, -"/index.html".length)
    : currentPath.replace(/\/+$/, "");
  return `${location.origin}${basePath}`;
}

// Única função responsável por montar um link de compartilhamento completo
// — sempre passa por aqui, nunca por concatenação manual de location.* nos
// componentes de UI (isso é o que fazia o link copiado carregar "localhost"
// para quem abria em outro dispositivo).
export function buildShareUrl(payload) {
  return `${getPublicAppBaseUrl()}/index.html${buildCapsuleRoute(payload)}`;
}

// Slug estável só para dar um `quizId` legível (usado no cabeçalho e no
// registro exportado) — nunca gravado em `_banco/specs/`.
const DIACRITICS_RE = /[̀-ͯ]/g;
export function capsuleSlug(title) {
  const slug = String(title || "")
    .normalize("NFD").replace(DIACRITICS_RE, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `capsula-${slug || "estudo"}`;
}

export function toCapsuleSpec(payload) {
  return { quizId: capsuleSlug(payload.title), title: payload.title, description: payload.description || "" };
}

// Resolve os ids do payload contra o banco atual. Ids que não existem mais
// (banco mudou desde que a cápsula foi criada) são reportados, não escondidos
// — mas só falha de fato se NENHUM id sobrar, seguindo o mesmo princípio de
// "nunca sessão vazia em silêncio" de `dynamic-session.mjs`.
export function resolveCapsuleQuestions(questoes, payload) {
  const byId = new Map(questoes.map(q => [q.id, q]));
  const questions = [];
  const missingIds = [];
  for (const id of payload.questionIds) {
    const q = byId.get(id);
    if (q) questions.push(q); else missingIds.push(id);
  }
  if (!questions.length) throw new Error("Nenhuma questão desta cápsula foi encontrada no banco atual.");
  return { questions, missingIds };
}

export function capsuleSummary(payload) {
  return {
    count: payload.questionIds.length,
    modeLabel: CAPSULE_MODE_LABEL[payload.mode] || payload.mode,
    orderLabel: CAPSULE_ORDER_LABEL[payload.order] || payload.order,
    revealLabel: CAPSULE_REVEAL_LABEL[payload.answerReveal] || payload.answerReveal
  };
}
