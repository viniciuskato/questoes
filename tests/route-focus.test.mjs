import test from "node:test";import assert from "node:assert/strict";import { focusRouteRoot } from "../app/route-focus.mjs";

function fakeRoot(){
  const calls=[];
  return {calls,focus:opts=>calls.push(["focus",opts]),scrollIntoView:opts=>calls.push(["scrollIntoView",opts])};
}
function matchMedia(matches){return query=>({matches,media:query});}

test("focusRouteRoot chama focus com preventScroll:true",()=>{
  const root=fakeRoot();
  focusRouteRoot(root,{matchMedia:matchMedia(false)});
  assert.deepEqual(root.calls[0],["focus",{preventScroll:true}]);
});
test("focusRouteRoot rola para o início do elemento (block:start), não o centro",()=>{
  const root=fakeRoot();
  focusRouteRoot(root,{matchMedia:matchMedia(false)});
  assert.equal(root.calls[1][0],"scrollIntoView");
  assert.equal(root.calls[1][1].block,"start");
});
test("focusRouteRoot usa scroll suave quando reduced-motion não está ativo",()=>{
  const root=fakeRoot();
  focusRouteRoot(root,{matchMedia:matchMedia(false)});
  assert.equal(root.calls[1][1].behavior,"smooth");
});
test("focusRouteRoot respeita prefers-reduced-motion (sem animação)",()=>{
  const root=fakeRoot();
  const {reduceMotion}=focusRouteRoot(root,{matchMedia:matchMedia(true)});
  assert.equal(reduceMotion,true);
  assert.equal(root.calls[1][1].behavior,"auto");
});
test("focusRouteRoot funciona sem matchMedia disponível",()=>{
  const root=fakeRoot();
  assert.doesNotThrow(()=>focusRouteRoot(root,{matchMedia:undefined}));
});
