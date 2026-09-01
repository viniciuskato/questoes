#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const BANK_PATH = path.join(DIR, "banco-questoes.json");
const SOURCES_PATH = path.join(DIR, "fontes.json");
const DATE = "2026-08-29";

const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));

const requiredSources = {
  "irwin2018-chest-cough-guideline": "Irwin RS, French CL, Chang AB, Altman KW; CHEST Expert Cough Panel. Classification of Cough as a Symptom in Adults and Management Algorithms: CHEST Guideline and Expert Panel Report. <em>Chest</em>. 2018;153(1):196–209. doi:10.1016/j.chest.2017.10.016. PMID:29080708.",
  "ittrich2017-hemoptysis-review": "Ittrich H, Bockhorn M, Klose H, Simon M. The Diagnosis and Treatment of Hemoptysis. <em>Deutsches Ärzteblatt International</em>. 2017;114(21):371–381. doi:10.3238/arztebl.2017.0371. PMID:28625277.",
  "sakr2010-massive-hemoptysis-bronchoscopy": "Sakr L, Dutau H. Massive Hemoptysis: An Update on the Role of Bronchoscopy in Diagnosis and Management. <em>Respiration</em>. 2010;80(1):38–58. doi:10.1159/000274492. PMID:20090288.",
  "goldman-cecil-pneumologia": "Goldman L, Cooney KA, editors. <em>Goldman-Cecil Medicine</em>. 27th ed. Elsevier; 2024. Chapter: Approach to the Patient with Respiratory Disease."
};
sources.fontes = { ...(sources.fontes || {}), ...requiredSources };

bank.versao = Math.max(Number(bank.versao || 1), 3);
bank.atualizadoEm = DATE;
bank.politicaEditorial = {
  versao: "1.0",
  vigenteDesde: DATE,
  documento: "POLITICA-EDITORIAL.md",
  referenciasNormativas: ["ICMJE 2026", "NBME Item-Writing Guide 2024", "Standards for Educational and Psychological Testing 2014"]
};
bank.governanca = {
  finalidade: "avaliação formativa e estudo em saúde",
  naoSubstitui: "diretriz clínica, avaliação profissional ou decisão assistencial",
  responsabilidadeFinal: "humana",
  usoDeIA: {
    utilizadoNoProjeto: true,
    declaracao: "IA pode auxiliar redação, estruturação e auditoria; não é autora nem fonte primária; aprovação exige validação humana."
  },
  conflitosDeInteresse: {
    declaracao: "Nenhum conflito financeiro ou patrocínio comercial foi documentado no banco até esta versão.",
    verificarAntesDePublicacaoExterna: true
  },
  correcoes: "correcoes.json"
};

for (const q of bank.questoes || []) {
  q.versaoEditorial = Number(q.versaoEditorial || 1);
  q.estadoEditorial = q.estadoEditorial || "pendente_revisao_conteudo";
  q.auditoriaEditorial = q.auditoriaEditorial || {
    status: "migrada_sem_auditoria_integrada",
    auditadoEm: null,
    responsavelHumano: null,
    criterios: []
  };
  q.proveniencia = q.proveniencia || {
    origemDeclarada: q.fonte || null,
    usoDeIA: "nao_documentado",
    finalidadesDaIA: [],
    validacaoHumanaDocumentada: false
  };
  q.evidencia = q.evidencia || {
    natureza: "nao_classificada",
    certeza: "nao_classificada",
    dependenciaContextual: [],
    ultimaVerificacao: null,
    revisarApos: null
  };
  q.qualidadeDoItem = q.qualidadeDoItem || {
    respostaCoberta: null,
    distratoresPlausiveis: null,
    testeDeOcultacao: null,
    unicaMelhorResposta: null,
    equidadeRevisada: null
  };
  if (q.imagem && !q.imagemMeta) {
    q.imagemMeta = {
      origem: null,
      autorOuInstituicao: null,
      licenca: null,
      url: null,
      modificacoes: [],
      tipo: "nao_classificado",
      privacidadeVerificada: false,
      statusDireitos: "pendente_verificacao"
    };
  }
}

sources.versao = Math.max(Number(sources.versao || 1), 2);
sources.atualizadoEm = DATE;
sources.fontesMeta = sources.fontesMeta || {};
for (const slug of Object.keys(sources.fontes || {})) {
  sources.fontesMeta[slug] = sources.fontesMeta[slug] || {
    tipo: "nao_classificado",
    verificacao: "pendente",
    verificadoEm: null,
    identificadores: {},
    jurisdicao: null,
    vigente: null,
    substituidaPor: null,
    observacoes: "Metadados criados por migração; requer conferência editorial."
  };
}
Object.assign(sources.fontesMeta, {
  "irwin2018-chest-cough-guideline": { tipo: "diretriz_consenso", verificacao: "verificada", verificadoEm: DATE, identificadores: { doi: "10.1016/j.chest.2017.10.016", pmid: "29080708", pmcid: "PMC6689094" }, jurisdicao: "internacional", vigente: null, substituidaPor: null, observacoes: "Metadados conferidos em PubMed/PMC." },
  "ittrich2017-hemoptysis-review": { tipo: "revisao_narrativa", verificacao: "verificada", verificadoEm: DATE, identificadores: { doi: "10.3238/arztebl.2017.0371", pmid: "28625277", pmcid: "PMC5478790" }, jurisdicao: "internacional", vigente: null, substituidaPor: null, observacoes: "Metadados conferidos em PubMed/PMC." },
  "sakr2010-massive-hemoptysis-bronchoscopy": { tipo: "revisao_narrativa", verificacao: "verificada", verificadoEm: DATE, identificadores: { doi: "10.1159/000274492", pmid: "20090288" }, jurisdicao: "internacional", vigente: null, substituidaPor: null, observacoes: "Metadados conferidos no artigo e índice bibliográfico." },
  "goldman-cecil-pneumologia": { tipo: "livro_texto", verificacao: "verificada", verificadoEm: DATE, identificadores: {}, jurisdicao: "internacional", vigente: true, substituidaPor: null, observacoes: "Edição e capítulo conferidos em registro bibliográfico da obra." }
});

fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2) + "\n", "utf8");
fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2) + "\n", "utf8");
console.log(`Governança aplicada a ${bank.questoes.length} questões e ${Object.keys(sources.fontes).length} fontes.`);
