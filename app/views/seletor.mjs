import { loadBanco, loadSpecs, selecionarQuestoes, parseHierarchy } from "../data.mjs";
import { normalizeSearchText } from "../search.mjs";
import { buildTaxonomyTree } from "../taxonomy.mjs";
import { FILTER_FIELDS, selectEligible, serializeDynamicRoute, buildDynamicSession, pickSessionSubset } from "../dynamic-session.mjs";
import { readCompletedQuestionIds, writeCompletedQuestionIds, readCapsuleSelection, writeCapsuleSelection } from "../store.mjs";
import { normalizeCapsulePayload, buildShareUrl, capsuleSummary, CAPSULE_MODE_LABEL, CAPSULE_ORDER_LABEL, CAPSULE_REVEAL_LABEL } from "../capsule.mjs";

export function matchesFilter(term, { spec, questions }) {
  const needle=normalizeSearchText(term).trim();
  if(!needle)return true;
  const haystack=normalizeSearchText(`${spec.title} ${spec.resumo||""} ${questions.map(q=>`${q.tema} ${q.pergunta}`).join(" ")}`);
  return haystack.includes(needle);
}

// Destaque é da lista (o card do seletor), não da questão individual —
// diferente do legado (medicina/seletor.html), que destaca a questão dentro
// do quiz. Aqui não há "dentro do quiz" para destacar: o seletor lista specs.
export function buildHighlightAnnouncement(listTitle) {
  return `Lista correspondente localizada: ${listTitle}.`;
}

export function renderTopicCard({ spec, questions, isHighlighted }) {
  return `<article class="topic-card${isHighlighted?' search-highlight':''}"${isHighlighted?' tabindex="-1"':''}><span class="eyebrow">${escapeText(spec.quizId)}${isHighlighted?' <span class="search-highlight-badge">Localizado</span>':''}</span><h3>${escapeText(spec.tituloCartao||spec.title)}</h3><p class="muted">${escapeText(spec.resumo||spec.description||"")}</p><footer><span>${questions.length} questões</span><span class="topic-card-actions"><button type="button" class="topic-share" data-share-spec="${escapeText(spec.quizId)}">Compartilhar lista</button><a href="#/quiz/${encodeURIComponent(spec.quizId)}">Iniciar →</a></span></footer></article>`;
}

// Estado do "Explorar o banco" (tema/subtema escolhidos + filtros de
// "Refinar sessão") vira um filtro de sessão dinâmica. Função pura para
// ser testável sem DOM.
export function buildExplorerFilter(state) {
  const filter = {};
  for (const field of FILTER_FIELDS) if (state[field]) filter[field] = state[field];
  const tags = String(state.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  if (tags.length) filter.tags = tags;
  return filter;
}

export function renderTemaButton(temaNode, selected) {
  return `<button type="button" class="explorer-tema${selected?' selected':''}" data-tema="${escapeText(temaNode.name)}" aria-pressed="${selected?'true':'false'}">${escapeText(temaNode.name)} <span class="muted">(${temaNode.count})</span></button>`;
}

// --- Cápsula de estudo: seleção manual de questões individuais ---

// Ao contrário de `searchQuestions` (app/search.mjs), termo vazio aqui mostra
// TODAS as questões — este é um navegador de lista, não uma busca que só
// deve agir quando há um termo.
export function matchesQuestionBrowserTerm(term, question) {
  const needle = normalizeSearchText(term).trim();
  if (!needle) return true;
  const haystack = normalizeSearchText(`${question.tema} ${question.categoria||""} ${question.pergunta}`);
  return haystack.includes(needle);
}

export function truncateQuestionText(text, max = 120) {
  const value = String(text || "").trim();
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function formatSelectionCount(n) {
  if (n === 0) return "Nenhuma questão selecionada";
  if (n === 1) return "1 questão selecionada";
  return `${n} questões selecionadas`;
}

export function renderCapsuleQuestionRow(question, checked) {
  return `<li class="capsule-question${checked?' selected':''}"><label><input type="checkbox" data-capsule-qid="${escapeText(question.id)}"${checked?' checked':''}><span class="capsule-q-main"><span class="capsule-q-tema">${escapeText(question.tema||"")}</span><span class="capsule-q-text">${escapeText(truncateQuestionText(question.pergunta))}</span></span></label></li>`;
}

function capsuleBuilderHtml() {
  return `<section class="capsule-builder"><div class="section-heading"><div><span class="eyebrow">Lista personalizada</span><h2>Monte sua cápsula de estudo</h2><p class="muted">Marque questões individualmente e compartilhe a seleção por link — sem precisar de conta ou de um tema pronto.</p></div></div>
    <div class="capsule-toolbar">
      <label for="capsule-filter" class="visually-hidden">Filtrar questões para selecionar</label>
      <input id="capsule-filter" type="search" placeholder="Filtrar questões por tema ou enunciado…">
      <div class="capsule-status" role="status" aria-live="polite"><strong id="capsule-count">Nenhuma questão selecionada</strong></div>
      <div class="capsule-actions">
        <button type="button" class="button" id="capsule-share" disabled>Compartilhar lista</button>
        <button type="button" class="button-secondary" id="capsule-clear" disabled>Limpar seleção</button>
      </div>
    </div>
    <ul id="capsule-question-list" class="capsule-question-list" role="group" aria-label="Questões disponíveis para seleção"></ul>
  </section>`;
}

function capsuleModalHtml() {
  return `<div class="settings-overlay capsule-overlay" id="capsule-overlay" aria-hidden="true">
    <section class="settings-dialog capsule-dialog" role="dialog" aria-modal="true" aria-labelledby="capsule-title">
      <div class="settings-header"><h2 id="capsule-title">Criar cápsula de estudo</h2><button type="button" class="settings-close" id="capsule-close" aria-label="Fechar">×</button></div>
      <div class="settings-body">
        <label class="capsule-field">Título<input type="text" id="capsule-form-title" placeholder="ex.: Revisão de cardiologia"></label>
        <label class="capsule-field">Descrição (opcional)<textarea id="capsule-form-description" rows="2" placeholder="Contexto ou objetivo desta lista…"></textarea></label>
        <div class="setting-row"><div class="setting-copy"><strong>Modo</strong><span>Estudo mostra estratégia e explicação; simulado é mais direto.</span></div><div class="segmented-control" id="capsule-form-mode"><button type="button" data-capsule-mode="study" class="active" aria-pressed="true">Estudo</button><button type="button" data-capsule-mode="exam" aria-pressed="false">Simulado</button></div></div>
        <div class="setting-row"><div class="setting-copy"><strong>Ordem</strong><span>Original preserva a ordem em que você marcou.</span></div><div class="segmented-control" id="capsule-form-order"><button type="button" data-capsule-order="original" aria-pressed="false">Original</button><button type="button" data-capsule-order="shuffle" class="active" aria-pressed="true">Embaralhada</button></div></div>
        <div class="setting-row"><div class="setting-copy"><strong>Revelar respostas</strong><span>Imediata mostra ao responder; ao final exige um clique em "Revelar".</span></div><div class="segmented-control" id="capsule-form-reveal"><button type="button" data-capsule-reveal="immediate" class="active" aria-pressed="true">Imediata</button><button type="button" data-capsule-reveal="end" aria-pressed="false">Somente ao final</button></div></div>
        <p class="capsule-summary" id="capsule-form-summary" role="status" aria-live="polite"></p>
        <p class="capsule-error" id="capsule-form-error" role="alert"></p>
      </div>
      <div class="settings-footer capsule-footer">
        <button type="button" class="button-secondary" id="capsule-cancel">Cancelar</button>
        <button type="button" class="button-secondary" id="capsule-download">Baixar cápsula</button>
        <button type="button" class="button" id="capsule-copy">Copiar link</button>
      </div>
      <p class="capsule-copy-status" id="capsule-copy-status" role="status" aria-live="polite"></p>
    </section>
  </div>`;
}

export async function renderSeletor(root, { route, signal }) {
  const [banco,specs]=await Promise.all([loadBanco({signal}),loadSpecs({signal})]);
  const hierarchy=parseHierarchy(route.query.get("hierarquia")); const highlight=route.query.get("highlight");
  let rows=specs.map(spec=>({spec,questions:selecionarQuestoes(banco,spec)}));
  const tree=buildTaxonomyTree(banco.questoes);
  const temas=tree.flatMap(area=>area.disciplinas.flatMap(d=>d.temas)).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
  const areas=[...new Set(banco.questoes.map(q=>q.classificacao?.area).filter(Boolean))].sort();
  const disciplinas=[...new Set(banco.questoes.map(q=>q.classificacao?.disciplina).filter(Boolean))].sort();
  const complexidades=[...new Set(banco.questoes.map(q=>q.classificacao?.complexidade).filter(Boolean))].sort();
  const competencias=[...new Set(banco.questoes.map(q=>q.classificacao?.competencia).filter(Boolean))].sort();
  const contextos=[...new Set(banco.questoes.map(q=>q.classificacao?.contexto).filter(Boolean))].sort();
  root.innerHTML=`<div class="section-heading"><div><span class="eyebrow">Percursos curados</span><h1>Seletor de estudo</h1><p class="muted">Todas as listas usam o mesmo renderizador e o banco central.</p></div></div>${hierarchy.warning?`<div class="bridge-note" role="status">${hierarchy.warning}</div>`:""}<div class="filter-panel"><label for="list-filter" class="visually-hidden">Filtrar listas, temas ou questões</label><input id="list-filter" type="search" placeholder="Filtrar listas, temas ou questões…"><select id="area-filter" aria-label="Filtrar por área"><option value="">Todas as áreas</option>${areas.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></div><div id="selector-list" class="topic-grid"></div><div id="selector-announcer" class="visually-hidden" role="status" aria-live="polite"></div>
    <section class="explorer"><div class="section-heading"><div><span class="eyebrow">Sessões dinâmicas</span><h2>Explorar o banco</h2><p class="muted">Escolha um tema e comece a estudar — sem precisar de uma lista pronta para ele.</p></div></div>
      <div id="explorer-temas" class="explorer-tema-grid" role="group" aria-label="Escolha um tema">${temas.map(t=>renderTemaButton(t,false)).join("")}</div>
      <details class="refine-details"><summary>Refinar sessão</summary>
        <div class="refine-grid">
          <label>Área<select id="explorer-area" aria-label="Filtrar por área"><option value="">Qualquer área</option>${areas.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></label>
          <label>Disciplina<select id="explorer-disciplina" aria-label="Filtrar por disciplina"><option value="">Qualquer disciplina</option>${disciplinas.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></label>
          <label>Subtema<select id="explorer-subtema" aria-label="Filtrar por subtema"><option value="">Qualquer subtema</option></select></label>
          <label>Complexidade<select id="explorer-complexidade" aria-label="Filtrar por complexidade"><option value="">Qualquer complexidade</option>${complexidades.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></label>
          <label>Competência<select id="explorer-competencia" aria-label="Filtrar por competência"><option value="">Qualquer competência</option>${competencias.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></label>
          <label>Contexto<select id="explorer-contexto" aria-label="Filtrar por contexto"><option value="">Qualquer contexto</option>${contextos.map(v=>`<option>${escapeText(v)}</option>`).join("")}</select></label>
          <label>Tags (separadas por vírgula)<input id="explorer-tags" type="text" placeholder="ex: microbiologia"></label>
        </div>
      </details>
      <div class="completed-filter">
        <label><input type="checkbox" id="explorer-exclude-completed"> <span>Excluir questões já respondidas</span></label>
        <span id="explorer-completed-status" class="muted"></span>
        <button type="button" class="button-secondary" id="explorer-load-records">Carregar registros</button>
        <input type="file" id="explorer-records-input" accept="application/json,.json" multiple webkitdirectory hidden>
      </div>
      <div class="size-choice" role="radiogroup" aria-label="Tamanho da sessão">
        <button type="button" data-size="10" aria-pressed="false">10 questões</button>
        <button type="button" data-size="20" aria-pressed="true">20 questões</button>
        <button type="button" data-size="all" aria-pressed="false">Todas</button>
      </div>
      <p id="explorer-count" class="muted" role="status" aria-live="polite">Escolha um tema para ver quantas questões estão disponíveis.</p>
      <div class="explorer-actions">
        <button type="button" class="button" id="explorer-start" disabled>Iniciar sessão</button>
        <button type="button" class="button-secondary" id="explorer-share" disabled>Compartilhar sessão</button>
      </div>
    </section>
    ${capsuleBuilderHtml()}
    ${capsuleModalHtml()}`;
  const list=root.querySelector("#selector-list"), input=root.querySelector("#list-filter"), area=root.querySelector("#area-filter"), announcer=root.querySelector("#selector-announcer");
  let capsuleApi;
  let highlightTimer=null;
  // O destaque só vale para a chegada via deep link; assim que o usuário
  // interage com o filtro, ele sai de cena (não deve reaparecer a cada tecla).
  let highlightActive=Boolean(highlight);
  const paint=({announceHighlight=false}={})=>{
    const term=input.value;const selectedArea=area.value;
    const filtered=rows.filter(row=>{const{questions}=row;if(selectedArea&&!questions.some(q=>q.classificacao?.area===selectedArea))return false;if(hierarchy.value.length&&!questions.some(q=>hierarchy.value.every((v,i)=>(q.classificacao?.hierarquia||[])[i]===v)))return false;return matchesFilter(term,row);});
    list.innerHTML=filtered.map(({spec,questions})=>renderTopicCard({spec,questions,isHighlighted:highlightActive&&questions.some(q=>q.id===highlight)})).join("")||'<div class="empty-state">Nenhuma lista corresponde aos filtros.</div>';
    clearTimeout(highlightTimer);
    const matched=[...list.querySelectorAll(".search-highlight")];
    if(matched.length){
      const reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      matched[0].scrollIntoView({block:"center",behavior:reduceMotion?"auto":"smooth"});
      if(announceHighlight)announcer.textContent=buildHighlightAnnouncement(matched.map(el=>el.querySelector("h3")?.textContent||"").join(", "));
      highlightTimer=setTimeout(()=>{highlightActive=false;matched.forEach(el=>el.classList.remove("search-highlight"));},2800);
    }
  };
  const onUserFilter=()=>{highlightActive=false;clearTimeout(highlightTimer);paint();};
  input.addEventListener("input",onUserFilter); area.addEventListener("change",onUserFilter); paint({announceHighlight:true});

  // --- Explorar o banco: seleção de tema + refinamento + tamanho ---
  const temaButtons=[...root.querySelectorAll("#explorer-temas .explorer-tema")];
  const subtemaSelect=root.querySelector("#explorer-subtema");
  const refineIds=["area","disciplina","subtema","complexidade","competencia","contexto"];
  const refineSelects=Object.fromEntries(refineIds.map(id=>[id,root.querySelector(`#explorer-${id}`)]));
  const tagsInput=root.querySelector("#explorer-tags");
  const countEl=root.querySelector("#explorer-count");
  const startButton=root.querySelector("#explorer-start");
  const shareSessionButton=root.querySelector("#explorer-share");
  const sizeButtons=[...root.querySelectorAll(".size-choice [data-size]")];
  const excludeCompletedInput=root.querySelector("#explorer-exclude-completed");
  const completedStatus=root.querySelector("#explorer-completed-status");
  const recordsInput=root.querySelector("#explorer-records-input");
  let completedIds=readCompletedQuestionIds();
  let selectedTema=null, selectedSize="20", excludeCompleted=false;

  function updateCompletedStatus(){
    completedStatus.textContent=completedIds.size
      ? `${completedIds.size} questão(ões) respondida(s) identificada(s).`
      : "Nenhuma questão respondida identificada; carregue a pasta de registros.";
  }

  function updateSubtemaOptions(){
    subtemaSelect.innerHTML='<option value="">Qualquer subtema</option>';
    if(!selectedTema) return;
    const subtemas=[...new Set(banco.questoes.filter(q=>(q.classificacao?.tema||q.tema)===selectedTema).map(q=>q.classificacao?.subtema).filter(Boolean))].sort();
    subtemas.forEach(v=>{const opt=document.createElement("option");opt.textContent=v;subtemaSelect.appendChild(opt);});
  }
  function currentState(){
    const s={tema:selectedTema,tags:tagsInput.value};
    refineIds.forEach(id=>{s[id]=refineSelects[id].value||null;});
    return s;
  }
  // Mesma ordem de `app/views/sessao.mjs` (filtra respondidas antes de
  // aplicar `selectEligible`) — usado tanto para o contador quanto para
  // congelar os ids da cápsula em "Compartilhar sessão".
  function computeExplorerEligible(){
    const filter=buildExplorerFilter(currentState());
    const pool=excludeCompleted?banco.questoes.filter(q=>!completedIds.has(q.id)):banco.questoes;
    return {filter,eligible:selectEligible(pool,filter)};
  }
  function updateCount(){
    if(!selectedTema){countEl.textContent="Escolha um tema para ver quantas questões estão disponíveis.";startButton.disabled=true;shareSessionButton.disabled=true;return;}
    const {eligible}=computeExplorerEligible();
    countEl.textContent=eligible.length?`${eligible.length} questão(ões) elegível(is) com este recorte.`:"Nenhuma questão corresponde a este recorte — ajuste os filtros.";
    startButton.disabled=eligible.length===0;
    shareSessionButton.disabled=eligible.length===0;
  }
  temaButtons.forEach(btn=>btn.addEventListener("click",()=>{
    selectedTema=btn.dataset.tema===selectedTema?null:btn.dataset.tema;
    temaButtons.forEach(b=>{const on=b.dataset.tema===selectedTema;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on));});
    updateSubtemaOptions();updateCount();
  }));
  refineIds.forEach(id=>refineSelects[id].addEventListener("change",updateCount));
  tagsInput.addEventListener("input",updateCount);
  excludeCompletedInput.addEventListener("change",()=>{excludeCompleted=excludeCompletedInput.checked;updateCount();});
  root.querySelector("#explorer-load-records").addEventListener("click",()=>recordsInput.click());
  recordsInput.addEventListener("change",async()=>{
    const ids=new Set(completedIds);
    for(const file of [...recordsInput.files].filter(item=>item.name.toLowerCase().endsWith(".json"))){
      try{
        const record=JSON.parse(await file.text());
        if(Array.isArray(record?.answers))record.answers.forEach(answer=>{if(answer.qId)ids.add(answer.qId);});
      }catch(_){}
    }
    completedIds=writeCompletedQuestionIds(ids);
    excludeCompleted=true;
    excludeCompletedInput.checked=true;
    updateCompletedStatus();updateCount();
  });
  sizeButtons.forEach(btn=>btn.addEventListener("click",()=>{
    selectedSize=btn.dataset.size;
    sizeButtons.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
  }));
  startButton.addEventListener("click",()=>{
    if(!selectedTema)return;
    const filter=buildExplorerFilter(currentState());
    location.hash=serializeDynamicRoute(filter,selectedSize==="all"?"all":Number(selectedSize),null,excludeCompleted);
  });
  shareSessionButton.addEventListener("click",()=>{
    if(!selectedTema)return;
    const {filter,eligible}=computeExplorerEligible();
    const size=selectedSize==="all"?"all":Number(selectedSize);
    const {included}=pickSessionSubset(eligible,size,null);
    const dynSession=buildDynamicSession({filter,size,highlight:null});
    capsuleApi.openCapsuleModal({
      trigger:shareSessionButton,
      questionIds:included.map(q=>q.id),
      title:dynSession.title,
      description:`${dynSession.description} (${included.length} questão(ões))`,
      source:{type:"dynamic",filters:filter,requestedSize:selectedSize}
    });
  });
  updateCompletedStatus();
  capsuleApi=wireCapsuleBuilder(root,banco);
  list.addEventListener("click",event=>{
    const btn=event.target.closest("[data-share-spec]");
    if(!btn)return;
    event.preventDefault();
    const row=rows.find(r=>r.spec.quizId===btn.dataset.shareSpec);
    if(!row)return;
    capsuleApi.openCapsuleModal({
      trigger:btn,
      questionIds:row.questions.map(q=>q.id),
      title:row.spec.tituloCartao||row.spec.title,
      description:row.spec.resumo||row.spec.description||"",
      source:{type:"curated",specId:row.spec.quizId}
    });
  });
}

// --- Cápsula de estudo: navegador de questões + modal "Criar cápsula" ---
function wireCapsuleBuilder(root, banco) {
  const questions = banco.questoes;
  const validIds = new Set(questions.map(q => q.id));
  const filterInput = root.querySelector("#capsule-filter");
  const listEl = root.querySelector("#capsule-question-list");
  const countEl = root.querySelector("#capsule-count");
  const shareButton = root.querySelector("#capsule-share");
  const clearButton = root.querySelector("#capsule-clear");
  let selected = new Set([...readCapsuleSelection()].filter(id => validIds.has(id)));

  function persist() { writeCapsuleSelection(selected); }
  function updateStatus() {
    countEl.textContent = formatSelectionCount(selected.size);
    shareButton.disabled = selected.size === 0;
    clearButton.disabled = selected.size === 0;
  }
  function paintList() {
    const term = filterInput.value;
    const filtered = questions.filter(q => matchesQuestionBrowserTerm(term, q));
    listEl.innerHTML = filtered.map(q => renderCapsuleQuestionRow(q, selected.has(q.id))).join("") || '<li class="empty-state">Nenhuma questão corresponde ao filtro.</li>';
  }
  filterInput.addEventListener("input", paintList);
  listEl.addEventListener("change", event => {
    const checkbox = event.target.closest("input[data-capsule-qid]");
    if (!checkbox) return;
    const id = checkbox.dataset.capsuleQid;
    if (checkbox.checked) selected.add(id); else selected.delete(id);
    checkbox.closest(".capsule-question")?.classList.toggle("selected", checkbox.checked);
    persist(); updateStatus();
  });
  clearButton.addEventListener("click", () => {
    selected.clear();
    persist(); updateStatus();
    listEl.querySelectorAll("input[data-capsule-qid]").forEach(cb => { cb.checked = false; cb.closest(".capsule-question")?.classList.remove("selected"); });
  });

  // --- modal "Criar cápsula de estudo" ---
  const overlay = root.querySelector("#capsule-overlay");
  const titleInput = root.querySelector("#capsule-form-title");
  const descInput = root.querySelector("#capsule-form-description");
  const modeGroup = root.querySelector("#capsule-form-mode");
  const orderGroup = root.querySelector("#capsule-form-order");
  const revealGroup = root.querySelector("#capsule-form-reveal");
  const summaryEl = root.querySelector("#capsule-form-summary");
  const errorEl = root.querySelector("#capsule-form-error");
  const copyStatus = root.querySelector("#capsule-copy-status");
  const copyButton = root.querySelector("#capsule-copy");
  const downloadButton = root.querySelector("#capsule-download");
  let capsuleMode = "study", capsuleOrder = "shuffle", capsuleReveal = "immediate";
  let returnFocus = null;
  // Origem da cápsula sendo montada no modal: manual (`selected`), lista
  // curada ou sessão dinâmica pré-preenchida. `modalQuestionIds`/`modalSource`
  // substituem o antigo uso direto de `selected` dentro do modal, para que o
  // mesmo modal sirva às quatro origens sem duplicar sua marcação/lógica.
  let modalQuestionIds = [];
  let modalSource = null;

  function selectSegment(group, dataKey, value) {
    group.querySelectorAll("button").forEach(btn => {
      const on = btn.dataset[dataKey] === value;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }
  function updateSummary() {
    summaryEl.textContent = `${formatSelectionCount(modalQuestionIds.length)} · Modo: ${CAPSULE_MODE_LABEL[capsuleMode]} · Ordem: ${CAPSULE_ORDER_LABEL[capsuleOrder]} · Revelação: ${CAPSULE_REVEAL_LABEL[capsuleReveal]}`;
  }
  modeGroup.addEventListener("click", e => { const btn=e.target.closest("button"); if(!btn) return; capsuleMode=btn.dataset.capsuleMode; selectSegment(modeGroup,"capsuleMode",capsuleMode); updateSummary(); });
  orderGroup.addEventListener("click", e => { const btn=e.target.closest("button"); if(!btn) return; capsuleOrder=btn.dataset.capsuleOrder; selectSegment(orderGroup,"capsuleOrder",capsuleOrder); updateSummary(); });
  revealGroup.addEventListener("click", e => { const btn=e.target.closest("button"); if(!btn) return; capsuleReveal=btn.dataset.capsuleReveal; selectSegment(revealGroup,"capsuleReveal",capsuleReveal); updateSummary(); });

  function currentPayload() {
    return { v: 1, title: titleInput.value.trim(), description: descInput.value.trim(), questionIds: [...modalQuestionIds], mode: capsuleMode, order: capsuleOrder, answerReveal: capsuleReveal, ...(modalSource ? { source: modalSource } : {}) };
  }
  function validatedPayload() {
    try { return normalizeCapsulePayload(currentPayload()); }
    catch (error) { errorEl.textContent = error.message; titleInput.focus(); return null; }
  }

  // Ponto único de abertura do modal "Criar cápsula de estudo" — usado pela
  // seleção manual ("Compartilhar lista" no navegador de questões), por
  // "Compartilhar sessão" (Explorar o banco) e por "Compartilhar lista" em
  // cada card de lista curada. `questionIds` já vem resolvido (lista
  // congelada no momento do clique); `title`/`description` só pré-preenchem
  // campos que o usuário pode editar livremente antes de copiar/baixar.
  function openCapsuleModal({ trigger, questionIds, title = "", description = "", source = null } = {}) {
    returnFocus = trigger || null;
    modalQuestionIds = [...questionIds];
    modalSource = source;
    titleInput.value = title; descInput.value = description;
    capsuleMode = "study"; capsuleOrder = "shuffle"; capsuleReveal = "immediate";
    selectSegment(modeGroup, "capsuleMode", capsuleMode);
    selectSegment(orderGroup, "capsuleOrder", capsuleOrder);
    selectSegment(revealGroup, "capsuleReveal", capsuleReveal);
    errorEl.textContent = ""; copyStatus.textContent = "";
    updateSummary();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("settings-open");
    titleInput.focus();
  }
  function closeCapsuleModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("settings-open");
    if (returnFocus) returnFocus.focus();
  }
  shareButton.addEventListener("click", () => openCapsuleModal({ trigger: shareButton, questionIds: [...selected] }));
  root.querySelector("#capsule-close").addEventListener("click", closeCapsuleModal);
  root.querySelector("#capsule-cancel").addEventListener("click", closeCapsuleModal);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeCapsuleModal(); });
  // Ligado ao overlay (não a document): some junto quando root.innerHTML é
  // substituído na troca de rota, como todo o resto da view — sem precisar
  // de um destroySelector() que hoje é no-op por essa mesma razão.
  overlay.addEventListener("keydown", e => { if (e.key === "Escape") closeCapsuleModal(); });

  copyButton.addEventListener("click", async () => {
    errorEl.textContent = "";
    const payload = validatedPayload();
    if (!payload) return;
    let url;
    try {
      url = await buildShareUrl(payload);
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard indisponível.");
      await navigator.clipboard.writeText(url);
      copyStatus.textContent = "✓ Link copiado para a área de transferência.";
    } catch (_) {
      copyStatus.textContent = url
        ? `✗ Não foi possível copiar automaticamente. Copie manualmente: ${url}`
        : "✗ Não foi possível gerar o link desta cápsula.";
    }
  });
  downloadButton.addEventListener("click", () => {
    errorEl.textContent = "";
    const payload = validatedPayload();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${payload.title.toLowerCase().normalize("NFD").replace(DIACRITICS_RE,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "capsula"}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    copyStatus.textContent = "Arquivo da cápsula baixado.";
  });

  paintList();
  updateStatus();
  return { openCapsuleModal };
}

const DIACRITICS_RE=/[̀-ͯ]/g;
const escapeText=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
