import test from "node:test";import assert from "node:assert/strict";import { KEYS,readPreference,writePreference,readDashboardCache,applyBootPreferences } from "../app/store.mjs";
function memoryStorage(){const data=new Map();return{getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)}}
test("mantém exatamente as chaves legadas",()=>{assert.deepEqual(KEYS,{theme:"questoes-theme",palette:"questoes-palette",view:"questoes-view",dashboard:"questoes_dashboard_registros_v1"});});
test("preferências preservam valores",()=>{globalThis.localStorage=memoryStorage();writePreference("theme","dark");writePreference("palette","presleep");writePreference("view","focus");assert.equal(readPreference("theme","light"),"dark");assert.equal(readPreference("palette","normal"),"presleep");assert.equal(readPreference("view","list"),"focus");});
test("cache do dashboard mantém o formato",()=>{globalThis.localStorage=memoryStorage();const value={savedAt:"2026-08-31",data:[{quiz:"endocardite"}]};localStorage.setItem(KEYS.dashboard,JSON.stringify(value));assert.deepEqual(readDashboardCache(),value);});

function fakeApp(){const calls=[];return{app:{setTheme:v=>calls.push(["theme",v]),setPalette:v=>calls.push(["palette",v]),setView:v=>calls.push(["view",v])},calls};}

test("applyBootPreferences aplica tema escuro e paleta pré-sono salvos",()=>{
  globalThis.localStorage=memoryStorage();
  writePreference("theme","dark");writePreference("palette","presleep");
  const {app,calls}=fakeApp();
  const result=applyBootPreferences(app);
  assert.deepEqual(calls,[["theme","dark"],["palette","presleep"]]);
  assert.deepEqual(result,{theme:"dark",palette:"presleep"});
});
test("applyBootPreferences cai para light/normal quando não há preferência salva",()=>{
  globalThis.localStorage=memoryStorage();
  const {app,calls}=fakeApp();
  applyBootPreferences(app);
  assert.deepEqual(calls,[["theme","light"],["palette","normal"]]);
});
test("applyBootPreferences nunca aplica o modo de visualização (foco)",()=>{
  globalThis.localStorage=memoryStorage();
  writePreference("view","focus");
  const {app,calls}=fakeApp();
  applyBootPreferences(app);
  assert.ok(!calls.some(([kind])=>kind==="view"),"setView não deve ser chamado no bootstrap");
});
test("applyBootPreferences não muda nomes/formato das chaves de localStorage",()=>{
  globalThis.localStorage=memoryStorage();
  writePreference("theme","dark");
  applyBootPreferences(fakeApp().app);
  assert.equal(localStorage.getItem(KEYS.theme),"dark");
});
