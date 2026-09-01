import { createRouter } from "./router.mjs";
import { renderInicio } from "./views/inicio.mjs";
import { renderSeletor } from "./views/seletor.mjs";
import { renderQuizView } from "./views/quiz.mjs";
import { renderSessaoView } from "./views/sessao.mjs";
import { renderListaView } from "./views/lista.mjs";
import { renderEmbed } from "./views/embed.mjs";
import { renderPreferencias } from "./views/preferencias.mjs";
import { applyBootPreferences } from "./store.mjs";
import { focusRouteRoot } from "./route-focus.mjs";

// Aplicado antes de montar a primeira rota para evitar flash de tema claro
// quando a preferência salva é escura/pré-sono. Não aplica "view" (foco):
// isso continua sendo responsabilidade do motor ao abrir um quiz.
applyBootPreferences(window.QuestoesApp);

const root=document.getElementById("app");let controller=null;
const header=document.querySelector(".app-header");
function syncHeaderHeight(){if(header)document.documentElement.style.setProperty("--header-height",`${header.offsetHeight}px`);}
syncHeaderHeight();
window.addEventListener("resize",syncHeaderHeight);
if(header&&"ResizeObserver"in window)new ResizeObserver(syncHeaderHeight).observe(header);
function focusRoute(){syncHeaderHeight();focusRouteRoot(root);}
function state(message,error=false){root.innerHTML=`<div class="route-state${error?' error':''}">${message}${error?' <button class="button-secondary" id="retry-route">Tentar novamente</button>':''}</div>`;if(error)root.querySelector("#retry-route")?.addEventListener("click",()=>router.start());}
function teardown(){controller?.abort();controller=null;window.QuestoesApp?.destroyQuiz?.();window.QuestoesApp?.destroySelector?.();}
async function onRoute(route,isCurrent){controller=new AbortController();state('<span class="spinner" aria-hidden="true"></span>Carregando…');document.querySelectorAll("[data-route-link]").forEach(a=>a.toggleAttribute("aria-current",a.dataset.routeLink===route.name));try{if(route.name==="inicio")await renderInicio(root,{route,signal:controller.signal});else if(route.name==="seletor")await renderSeletor(root,{route,signal:controller.signal});else if(route.name==="quiz")await renderQuizView(root,{route,signal:controller.signal});else if(route.name==="sessao")await renderSessaoView(root,{route,signal:controller.signal});else if(route.name==="lista")await renderListaView(root,{route,signal:controller.signal});else if(route.name==="desempenho"||route.name==="revisao")renderEmbed(root,route.name);else if(route.name==="preferencias")renderPreferencias(root);else{root.innerHTML='<div class="empty-state"><h1>Rota não encontrada</h1><p>Este endereço interno não existe.</p><a href="#/inicio">Voltar ao início</a></div>';}if(isCurrent())focusRoute();}catch(error){if(error.name==="AbortError"||!isCurrent())return;const missing=/não encontrada/i.test(error.message);const badParams=/desconhecido|inválid|Nenhuma questão|mais de uma vez/i.test(error.message);const title=missing?'Lista não encontrada':badParams?'Não foi possível abrir esta sessão':'Não foi possível abrir esta área';root.innerHTML=`<div class="route-state error"><h1>${title}</h1><p>${escapeText(error.message)}</p><p>${missing||badParams?'<a href="#/seletor">Voltar ao seletor</a>':'<button class="button-secondary" id="retry-route">Tentar novamente</button>'}</p></div>`;root.querySelector("#retry-route")?.addEventListener("click",()=>router.start());}}
const router=createRouter({beforeRoute:teardown,onRoute});
if(location.protocol==="file:"){const warning=document.getElementById("protocol-warning");warning.hidden=false;warning.textContent="Abra pelo Iniciar Site.bat ou execute node tools/serve.js para carregar o banco central.";}
window.QuestoesSpa={router};router.start();
const escapeText=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
