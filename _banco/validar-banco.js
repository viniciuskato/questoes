#!/usr/bin/env node
const banco = require("./banco-questoes.json");
const registroFontes = require("./fontes.json");
const registroCorrecoes = require("./correcoes.json");
const { selecionarQuestoes } = require("./selecionar");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const erros = [];
const avisos = [];
const ids = new Set();
const estadosEditoriais = new Set([
  "pendente_revisao_conteudo", "em_revisao", "aprovada",
  "requer_atualizacao", "suspensa", "retirada"
]);
const competencias = new Set([
  "Conhecimento fundamental", "Compreensão de mecanismo", "Raciocínio diagnóstico",
  "Interpretação diagnóstica", "Decisão terapêutica", "Integração clínica"
]);
const complexidades = new Set(["Fundamental", "Aplicação", "Integração"]);
const contextos = new Set(["Pergunta direta", "Caso clínico", "Interpretação de imagem"]);

for (const q of banco.questoes || []) {
  if (ids.has(q.id)) erros.push(`${q.id}: id duplicado`);
  ids.add(q.id);
  for (const campo of ["tema", "categoria", "pergunta", "alternativas", "correta", "explicacao", "referencias", "fonte"]) {
    if (q[campo] === undefined || q[campo] === null || q[campo] === "") erros.push(`${q.id}: ${campo} ausente`);
  }
  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 5) erros.push(`${q.id}: deve ter exatamente 5 alternativas`);
  if (Array.isArray(q.alternativas)) {
    const normalizadas = q.alternativas.map(a => String(a).trim().toLocaleLowerCase("pt-BR"));
    if (new Set(normalizadas).size !== normalizadas.length) erros.push(`${q.id}: alternativas duplicadas`);
    if (q.alternativas.some(a => !String(a).trim())) erros.push(`${q.id}: alternativa vazia`);
  }
  if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta >= (q.alternativas || []).length) erros.push(`${q.id}: índice de correta inválido`);
  const textoDoItem = [q.pergunta, ...(q.alternativas || []), q.explicacao].join(" ");
  const dependenciasImplicitas = [
    /\bcaso\s+(?:de|do|da)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}-]+/u,
    /\b(?:caso|material|texto|tutorial|aula)\s+(?:apresentad[oa]|acima|anterior)\b/iu,
    /\b(?:conforme|segundo|de acordo com)\s+(?:o|a)\s+(?:caso|material|texto|tutorial|aula)\b/iu
  ];
  if (dependenciasImplicitas.some(padrao => padrao.test(textoDoItem))) {
    erros.push(`${q.id}: item depende implicitamente de caso/material externo; reescreva-o de forma autocontida`);
  }
  if (!Array.isArray(q.referencias) || !q.referencias.length) erros.push(`${q.id}: sem referências`);
  for (const slug of q.referencias || []) {
    if (!registroFontes.fontes?.[slug]) erros.push(`${q.id}: referência inexistente em fontes.json: ${slug}`);
    if (!registroFontes.fontesMeta?.[slug]) erros.push(`${q.id}: referência sem metadados editoriais: ${slug}`);
  }
  if (!estadosEditoriais.has(q.estadoEditorial)) erros.push(`${q.id}: estadoEditorial inválido`);
  if (!Number.isInteger(q.versaoEditorial) || q.versaoEditorial < 1) erros.push(`${q.id}: versaoEditorial inválida`);
  if (!q.auditoriaEditorial || !q.proveniencia || !q.evidencia || !q.qualidadeDoItem) erros.push(`${q.id}: governança editorial incompleta`);
  if (q.estadoEditorial === "aprovada") {
    if (!q.auditoriaEditorial?.auditadoEm || !q.auditoriaEditorial?.responsavelHumano) erros.push(`${q.id}: aprovada sem auditoria humana documentada`);
    if (!q.proveniencia?.validacaoHumanaDocumentada) erros.push(`${q.id}: aprovada sem validação humana documentada`);
    const testes = q.qualidadeDoItem || {};
    for (const teste of ["respostaCoberta", "distratoresPlausiveis", "testeDeOcultacao", "unicaMelhorResposta", "equidadeRevisada"]) {
      if (testes[teste] !== true) erros.push(`${q.id}: aprovada sem ${teste}=true`);
    }
  } else {
    avisos.push(`${q.id}: estado editorial ${q.estadoEditorial}`);
  }
  if (q.imagem) {
    if (!q.imagemMeta) erros.push(`${q.id}: imagem sem imagemMeta`);
    else if (q.imagemMeta.statusDireitos !== "verificado") avisos.push(`${q.id}: direitos/proveniência da imagem pendentes`);
    const caminhoImagem = path.join(__dirname, "imagens", q.imagem.replace(/^imagens[\\/]/, ""));
    if (!fs.existsSync(caminhoImagem)) avisos.push(`${q.id}: arquivo de imagem referenciado não existe em disco: ${q.imagem}`);
  }
  const c = q.classificacao;
  if (!c) { erros.push(`${q.id}: sem classificação`); continue; }
  for (const campo of ["area", "disciplina", "tema", "subtema", "competencia", "complexidade", "contexto", "hierarquia"]) {
    if (!c[campo]) erros.push(`${q.id}: classificação.${campo} ausente`);
  }
  if (!Array.isArray(c.hierarquia) || c.hierarquia.length < 4) erros.push(`${q.id}: caminho hierárquico insuficiente`);
  if (c.hierarquia && c.hierarquia[0] !== c.area) erros.push(`${q.id}: raiz hierárquica diverge da área`);
  if (c.tema !== q.tema) erros.push(`${q.id}: tema legado e classificado divergem`);
  if (c.subtema !== q.categoria) erros.push(`${q.id}: categoria e subtema divergem`);
  if (!competencias.has(c.competencia)) erros.push(`${q.id}: competência inválida`);
  if (!complexidades.has(c.complexidade)) erros.push(`${q.id}: complexidade inválida`);
  if (!contextos.has(c.contexto)) erros.push(`${q.id}: contexto inválido`);
  if (c.provaRefs !== undefined) {
    if (!Array.isArray(c.provaRefs)) erros.push(`${q.id}: classificacao.provaRefs deve ser array`);
    else c.provaRefs.forEach((ref, i) => {
      for (const campo of ["disciplina", "edital", "topico"]) {
        if (!ref || !String(ref[campo] || "").trim()) erros.push(`${q.id}: provaRefs[${i}].${campo} ausente`);
      }
    });
  }
}

for (const [slug, citation] of Object.entries(registroFontes.fontes || {})) {
  if (!String(citation).trim()) erros.push(`fonte ${slug}: citação vazia`);
  const meta = registroFontes.fontesMeta?.[slug];
  if (!meta) erros.push(`fonte ${slug}: fontesMeta ausente`);
  else if (meta.verificacao !== "verificada") avisos.push(`fonte ${slug}: verificação editorial ${meta.verificacao}`);
}

for (const correcao of registroCorrecoes.correcoes || []) {
  if (!ids.has(correcao.questaoId)) erros.push(`correção aponta para questão inexistente: ${correcao.questaoId}`);
  for (const campo of ["questaoId", "data", "tipo", "camposAlterados", "motivo"]) {
    if (!correcao[campo]) erros.push(`correção incompleta: ${campo} ausente`);
  }
}

for (const campo of ["disciplinas", "temas", "subtemas", "competencias", "complexidades", "contextos"]) {
  const exemplo = banco.questoes[0];
  const valor = campo === "disciplinas" ? exemplo.classificacao.disciplina
    : campo === "temas" ? exemplo.tema
    : campo === "subtemas" ? exemplo.classificacao.subtema
    : exemplo.classificacao[campo.slice(0, -1)];
  try {
    const resultado = selecionarQuestoes(banco, { filtro: { [campo]: [valor] } });
    if (!resultado.length) erros.push(`filtro ${campo} não encontra o próprio exemplo`);
  } catch (error) { erros.push(`filtro ${campo}: ${error.message}`); }
}

try {
  const betalactamicos = selecionarQuestoes(banco, { filtro: { nosHierarquicos: ["Betalactâmicos"] } });
  if (betalactamicos.length !== 18) erros.push(`ramo Betalactâmicos deveria conter 18 questões, encontrou ${betalactamicos.length}`);
  const prefixo = ["Medicina", "Farmacologia", "Antimicrobianos", "Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos"];
  const porCaminho = selecionarQuestoes(banco, { filtro: { caminhoHierarquico: prefixo } });
  if (porCaminho.length !== betalactamicos.length) erros.push("filtros por nó e por caminho divergem em Betalactâmicos");
} catch (error) { erros.push(`hierarquia de betalactâmicos: ${error.message}`); }

const seletorPath = path.join(__dirname, "..", "medicina", "seletor.html");
if (fs.existsSync(seletorPath)) {
  const html = fs.readFileSync(seletorPath, "utf8");
  // O seletor atual navega por classificacao.hierarquia. Os antigos painéis
  // paralelos de disciplina/competencia/complexidade foram removidos do
  // template; manter seus IDs aqui fazia toda regeneracao valida falhar.
  for (const marcador of ["hierarquia-list", "hierarquia-breadcrumb", "selectedHierarchyPath", "classificacao", "Seletor por tema"]) {
    if (!html.includes(marcador)) erros.push(`seletor gerado sem ${marcador}`);
  }
  const inicio = html.indexOf('<script type="application/json" id="banco-data">');
  const fim = html.indexOf("</script>", inicio);
  try {
    const dados = JSON.parse(html.slice(html.indexOf(">", inicio) + 1, fim));
    if (dados.length !== banco.questoes.length || dados.some(q => !q.classificacao)) {
      erros.push("dados classificados incompletos no seletor gerado");
    }
  } catch (error) { erros.push(`dados inválidos no seletor: ${error.message}`); }
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .filter(match => !match[0].includes('type="application/json"'));
  scripts.forEach((match, index) => {
    try { new vm.Script(match[1], { filename: `seletor-inline-${index + 1}.js` }); }
    catch (error) { erros.push(`JavaScript inválido no seletor: ${error.message}`); }
  });
}

if (erros.length) {
  console.error(erros.join("\n"));
  process.exit(1);
}
console.log(`Banco estruturalmente válido: ${banco.questoes.length} questões, ${ids.size} ids únicos, taxonomia v${banco.taxonomia.versao}.`);
console.log(`Governança editorial: ${avisos.length} pendências informativas (use --verbose para listar).`);
if (process.argv.includes("--verbose") && avisos.length) console.warn(avisos.join("\n"));
