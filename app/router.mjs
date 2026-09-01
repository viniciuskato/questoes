export function parseRoute(hash = "") {
  const raw = String(hash || "").replace(/^#/, "") || "/inicio";
  const [pathPart, queryPart = ""] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean).map(decodeURIComponent);
  return { name: segments[0] || "inicio", param: segments[1] || null, segments, query: new URLSearchParams(queryPart), raw };
}

export function createRouter({ onRoute, beforeRoute }) {
  let generation = 0;
  async function dispatch() {
    const token = ++generation;
    if (beforeRoute) await beforeRoute();
    const route = parseRoute(location.hash);
    await onRoute(route, () => token === generation);
  }
  window.addEventListener("hashchange", dispatch);
  return { start: dispatch, stop: () => window.removeEventListener("hashchange", dispatch), parseRoute };
}
