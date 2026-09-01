const KEYS = { theme:"questoes-theme", palette:"questoes-palette", view:"questoes-view", dashboard:"questoes_dashboard_registros_v1" };
const COMPLETED_KEY = "questoes_completed_ids_v1";
const CAPSULE_SELECTION_KEY = "questoes_capsula_selecao_v1";
export function readPreference(kind, fallback) { try { return localStorage.getItem(KEYS[kind]) || fallback; } catch (_) { return fallback; } }
export function writePreference(kind, value) { if (!KEYS[kind] || kind === "dashboard") throw new Error("Preferência desconhecida."); try { localStorage.setItem(KEYS[kind], value); } catch (_) {} return value; }
export function readDashboardCache() { try { const raw=localStorage.getItem(KEYS.dashboard); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
export function readCompletedQuestionIds() {
  const ids = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
    if (Array.isArray(saved)) saved.forEach(id => { if (id) ids.add(id); });
  } catch (_) {}
  const records = readDashboardCache()?.data;
  if (Array.isArray(records)) records.forEach(record => (record?.answers || []).forEach(answer => { if (answer.qId) ids.add(answer.qId); }));
  return ids;
}
export function writeCompletedQuestionIds(ids) {
  const normalized = [...new Set(ids)].filter(Boolean);
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(normalized)); } catch (_) {}
  return new Set(normalized);
}

// Seleção manual de questões para montar uma cápsula de estudo (#/seletor).
// Persistida só para sobreviver a uma navegação/reload dentro do próprio
// seletor — não é o payload compartilhado (esse vive só na URL da cápsula).
export function readCapsuleSelection() {
  const ids = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(CAPSULE_SELECTION_KEY) || "[]");
    if (Array.isArray(saved)) saved.forEach(id => { if (id) ids.add(id); });
  } catch (_) {}
  return ids;
}
export function writeCapsuleSelection(ids) {
  const normalized = [...new Set(ids)].filter(Boolean);
  try { localStorage.setItem(CAPSULE_SELECTION_KEY, JSON.stringify(normalized)); } catch (_) {}
  return new Set(normalized);
}

// Aplica tema/paleta salvos a uma API tipo window.QuestoesApp. Nunca aplica
// "view" (modo foco) — isso é responsabilidade do motor ao abrir um quiz, não
// do bootstrap do shell. Extraída para ser testável sem DOM/localStorage reais.
export function applyBootPreferences(app) {
  const theme = readPreference("theme", "light");
  const palette = readPreference("palette", "normal");
  app?.setTheme?.(theme);
  app?.setPalette?.(palette);
  return { theme, palette };
}

export { KEYS };
