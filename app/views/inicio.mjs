import { loadBanco, loadCorrecoes, loadSpecs, selecionarQuestoes } from "../data.mjs";
import { readDashboardCache } from "../store.mjs";
import { searchQuestions } from "../search.mjs";
import { listTemas, fieldValue } from "../taxonomy.mjs";

export async function renderInicio(root, { signal }) {
  const [banco, specs, correcoes] = await Promise.all([loadBanco({signal}), loadSpecs({signal}), loadCorrecoes({signal})]);
  const totalCount = banco.questoes.length;
  const temas = listTemas(banco.questoes);
  const cache = readDashboardCache();
  const correctionCount = (correcoes.correcoes || []).length + (correcoes.corrections || []).length;
  root.innerHTML = `<section class="hero"><div class="hero-panel"><span class="eyebrow">Estudo orientado por evidências</span><h1>Escolha, responda, revise.</h1><p>O banco central tem ${totalCount} questões, todas acessíveis pela SPA: ${specs.length} percursos curados organizam revisões específicas, e sessões dinâmicas permitem estudar qualquer um dos ${temas.length} temas do banco sem precisar de uma lista pronta.</p><div class="hero-actions"><a class="button" href="#/seletor">Iniciar sessão</a><a class="button-secondary" href="#/desempenho">Ver desempenho</a></div></div><aside class="summary-card"><div class="stat"><span>No banco</span><strong>${totalCount}</strong></div><div class="stat"><span>Percursos curados</span><strong>${specs.length}</strong></div><div class="stat"><span>Temas exploráveis</span><strong>${temas.length}</strong></div></aside></section>
    <section><div class="section-heading"><div><span class="eyebrow">Busca global</span><h2>Encontre uma questão</h2></div><span class="muted">${correctionCount} registros de correção acompanhados</span></div><p class="muted">A busca consulta as ${totalCount} questões do banco. Toda questão encontrada abre por aqui — numa lista curada, quando existe uma, ou numa sessão dinâmica do próprio tema.</p><div class="search-box"><input id="global-search" type="search" placeholder="Tema, categoria, palavra ou tag…" aria-label="Buscar no banco"></div><div id="search-results" class="topic-grid" aria-live="polite"></div></section>
    <section><div class="section-heading"><div><span class="eyebrow">Continuidade</span><h2>Progresso carregado</h2></div></div>${cache ? `<div class="summary-card"><p>Dados do painel carregados em <strong>${escapeText(cache.savedAt || "data não registrada")}</strong>.</p><a href="#/desempenho">Abrir painel</a></div>` : `<div class="empty-state">Nenhum registro carregado nesta sessão. Abra <a href="#/desempenho">Desempenho</a> e selecione a pasta de registros.</div>`}</section>`;
  const input=root.querySelector("#global-search"), results=root.querySelector("#search-results");
  input.addEventListener("input", () => {
    const found=searchQuestions(banco.questoes,input.value).slice(0,12);
    results.innerHTML=found.map(q => {
      const covering = specs.filter(spec => selecionarQuestoes(banco, spec).some(item => item.id === q.id));
      const footer = covering.length
        ? `<a href="#/seletor?hierarquia=${encodeURIComponent(JSON.stringify(q.classificacao?.hierarquia || []))}&highlight=${encodeURIComponent(q.id)}">Localizar no seletor →</a>`
        : `<a href="#/sessao?tema=${encodeURIComponent(fieldValue(q,"tema")||"")}&highlight=${encodeURIComponent(q.id)}&tamanho=20">Estudar este tema →</a>`;
      return `<article class="topic-card"><span class="eyebrow">${escapeText(q.categoria)}</span><h3>${escapeText(q.tema)}</h3><p>${escapeText(q.pergunta)}</p><footer><span>${escapeText(q.id)}</span>${footer}</footer></article>`;
    }).join("");
  });
}
const escapeText = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
