// `_dados/dashboard.html` não tem suporte testado a seleção de aba por
// fragmento de URL — a aba "Prioridade" (id="tab-plan") já é a padrão ativa
// no carregamento, então a revisão abre nela sem precisar de fragmento.
// Não usar "#tab-plan": um fragmento só rola a página até o elemento com esse
// id, não ativa a aba correspondente — isso seria um link morto disfarçado.
export function renderEmbed(root,kind){
  const review=kind==="revisao";
  root.innerHTML=`<iframe class="embedded-view" src="_dados/dashboard.html" scrolling="no" title="${review?'Revisão pendente':'Painel de desempenho'} (Questões)"></iframe>`;
  const frame=root.querySelector(".embedded-view");
  frame.addEventListener("load",()=>{
    const doc=frame.contentDocument;
    if(!doc)return;
    const resize=()=>{frame.style.height=`${Math.max(doc.documentElement.scrollHeight,doc.body?.scrollHeight||0)}px`;};
    resize();
    if("ResizeObserver" in window)new ResizeObserver(resize).observe(doc.documentElement);
    if(review)doc.getElementById("tab-plan")?.click();
    else doc.getElementById("tab-performance")?.click();
    resize();
  });
}
