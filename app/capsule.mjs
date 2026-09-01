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

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url) {
  let base64 = String(b64url).replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}

// Links de cápsula podem ultrapassar 2000 caracteres (listas grandes de
// questões), e apps de mensagem no iOS (WhatsApp incluído) truncam ou
// recusam a autodetecção de links muito longos, cortando o parâmetro `d`
// inteiro — é isso que produz "link sem dados" mesmo com o payload correto.
// Por isso o JSON é comprimido (gzip via CompressionStream, nativo do
// navegador, sem dependência externa) antes do base64url: para uma lista de
// ids repetitivos como as do banco, o link cai a uma fração do tamanho
// original. O decode detecta a assinatura gzip (0x1f 0x8b) nos bytes
// decodificados; se não estiver presente, trata como o formato antigo sem
// compressão (links já compartilhados antes desta mudança continuam
// funcionando).
const GZIP_MAGIC_0 = 0x1f;
const GZIP_MAGIC_1 = 0x8b;

async function gzipCompress(text) {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(text));
  writer.close();
  const buffer = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

async function gzipDecompress(bytes) {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buffer = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buffer);
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

export async function encodeCapsulePayload(payload) {
  const normalized = normalizeCapsulePayload(payload);
  const json = JSON.stringify(normalized);
  // Sem CompressionStream (navegador muito antigo) cai para o formato
  // legado sem compressão — pior para links longos, mas nunca quebra.
  const bytes = typeof CompressionStream === "function"
    ? await gzipCompress(json)
    : new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

export async function decodeCapsulePayload(raw) {
  if (!raw) throw new Error("Cápsula inválida: link sem dados.");
  let bytes;
  try { bytes = base64UrlToBytes(raw); }
  catch (_) { throw new Error("Cápsula inválida: link malformado."); }
  let json;
  try {
    json = bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1
      ? await gzipDecompress(bytes)
      : new TextDecoder().decode(bytes);
  } catch (_) { throw new Error("Cápsula inválida: link malformado."); }
  let parsed;
  try { parsed = JSON.parse(json); }
  catch (_) { throw new Error("Cápsula inválida: link malformado."); }
  return normalizeCapsulePayload(parsed);
}

export async function buildCapsuleRoute(payload) {
  return `#/lista?d=${await encodeCapsulePayload(payload)}`;
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
export async function buildShareUrl(payload) {
  return `${getPublicAppBaseUrl()}/index.html${await buildCapsuleRoute(payload)}`;
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
