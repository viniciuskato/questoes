// Move o foco para a raiz da rota sem deixar o topo do conteúdo atrás do
// cabeçalho fixo (sticky). preventScroll evita o scroll padrão do navegador
// (que ignora scroll-margin-top); scrollIntoView refaz o scroll respeitando
// o scroll-margin-top definido em styles/app.css.
export function focusRouteRoot(root, { matchMedia = globalThis.matchMedia } = {}) {
  const reduceMotion = Boolean(matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  root.focus({ preventScroll: true });
  root.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  return { reduceMotion };
}
