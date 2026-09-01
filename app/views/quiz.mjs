import { loadBanco, loadFontes, loadSpec, selecionarQuestoes, toQuizData } from "../data.mjs";
import { quizShellHtml } from "./quiz-shell.mjs";

export async function renderQuizView(root,{route,signal}){
  if(!route.param) throw new Error("Lista não encontrada.");
  const [banco,fontes,spec]=await Promise.all([loadBanco({signal}),loadFontes({signal}),loadSpec(route.param,{signal})]);
  const selected=selecionarQuestoes(banco,spec);
  const meta={type:"curated",specId:spec.quizId,filter:null,eligibleCount:selected.length,includedCount:selected.length};
  const quizData=toQuizData(spec,selected,fontes,meta);
  root.innerHTML=quizShellHtml({eyebrow:spec.quizId,backHref:"#/seletor",backLabel:"Voltar ao seletor"});
  window.QuestoesApp.initQuiz(quizData,root);
}
