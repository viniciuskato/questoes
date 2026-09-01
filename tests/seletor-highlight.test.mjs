import test from "node:test";import assert from "node:assert/strict";import { renderTopicCard, buildHighlightAnnouncement } from "../app/views/seletor.mjs";

const spec={quizId:"endocardite",title:"Endocardite Infecciosa",tituloCartao:"Endocardite Infecciosa — completa",resumo:"Lista completa"};
const questions=[{id:"endocardite-01"}];

test("card destacado recebe a classe search-highlight e tabindex",()=>{
  const html=renderTopicCard({spec,questions,isHighlighted:true});
  assert.match(html,/class="topic-card search-highlight"/);
  assert.match(html,/tabindex="-1"/);
});
test("card sem destaque não recebe a classe nem tabindex",()=>{
  const html=renderTopicCard({spec,questions,isHighlighted:false});
  assert.doesNotMatch(html,/search-highlight/);
  assert.doesNotMatch(html,/tabindex/);
});
test("card destacado tem indicação textual (não depende só de cor)",()=>{
  const html=renderTopicCard({spec,questions,isHighlighted:true});
  assert.match(html,/Localizado/);
});
test("parâmetro highlight inexistente (isHighlighted=false) não causa erro",()=>{
  assert.doesNotThrow(()=>renderTopicCard({spec,questions,isHighlighted:false}));
});
test("mensagem acessível contém o nome da lista localizada",()=>{
  const message=buildHighlightAnnouncement("Endocardite Infecciosa — completa");
  assert.match(message,/Lista correspondente localizada:/);
  assert.match(message,/Endocardite Infecciosa — completa/);
});
