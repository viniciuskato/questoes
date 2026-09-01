#!/usr/bin/env node
/**
 * Normaliza a taxonomia pedagógica de todas as questões do banco.
 *
 * O script é idempotente: pode ser executado sempre que questões forem
 * adicionadas. Campos legados (tema, categoria e tags) são preservados.
 */
const fs = require("fs");
const path = require("path");

const BANCO_PATH = path.join(__dirname, "banco-questoes.json");

const POR_TEMA = {
  "Endocardite Infecciosa": {
    disciplina: "Infectologia",
    disciplinasRelacionadas: ["Cardiologia", "Microbiologia"]
  },
  "Distúrbios de Sódio e Água": {
    disciplina: "Fisiologia e fisiopatologia",
    disciplinasRelacionadas: ["Nefrologia", "Endocrinologia"]
  },
  "Radiografia de Tórax Básica": {
    disciplina: "Radiologia",
    disciplinasRelacionadas: ["Pneumologia"]
  },
  "Tosse Crônica e Hemoptise": {
    disciplina: "Pneumologia",
    disciplinasRelacionadas: ["Semiologia"]
  },
  "Espirometria e Função Pulmonar": {
    disciplina: "Pneumologia",
    disciplinasRelacionadas: ["Fisiologia e fisiopatologia", "Habilidades Profissionais"]
  },
  "Antimicrobianos - fundamentos": {
    disciplina: "Farmacologia",
    disciplinasRelacionadas: ["Infectologia", "Microbiologia"]
  },
  "Tumores do Sistema Nervoso Central": {
    disciplina: "Neurocirurgia",
    disciplinasRelacionadas: ["Neurologia", "Oncologia", "Radiologia", "Patologia"]
  },
  "Insuficiência Cardíaca — Caso 4": {
    disciplina: "Cardiologia",
    disciplinasRelacionadas: ["Clínica Médica"]
  },
  "Insuficiência Cardíaca": {
    disciplina: "Cardiologia",
    disciplinasRelacionadas: ["Clínica Médica"]
  },
  "Hipertensão Arterial e SRAA": {
    disciplina: "Farmacologia",
    disciplinasRelacionadas: ["Fisiologia e fisiopatologia", "Cardiologia", "Nefrologia"]
  },
  "Endoscopia Digestiva": {
    disciplina: "Gastroenterologia",
    disciplinasRelacionadas: ["Clínica Médica", "Cirurgia Geral", "Hepatologia"]
  }
};

const TAGS_ESTRUTURAIS = new Set([
  "antimicrobianos", "endocardite", "radiografia", "torax", "sodio", "agua"
]);

const RAMOS_ANTIMICROBIANOS = {
  "Fundamentos": ["Princípios gerais"],
  "Betalactâmicos": ["Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos", "Visão geral"],
  "Penicilinas": ["Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos", "Penicilinas"],
  "Cefalosporinas": ["Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos", "Cefalosporinas"],
  "Carbapenêmicos e monobactâmicos": ["Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos", "Carbapenêmicos e monobactâmicos"],
  "Glicopeptídeos": ["Antibacterianos", "Inibidores da síntese da parede celular", "Glicopeptídeos"],
  "Lipopeptídeos e polimixinas": ["Antibacterianos", "Agentes da membrana bacteriana", "Lipopeptídeos e polimixinas"],
  "Aminoglicosídeos": ["Antibacterianos", "Inibidores da síntese proteica", "Subunidade 30S", "Aminoglicosídeos"],
  "Tetraciclinas e glicilciclinas": ["Antibacterianos", "Inibidores da síntese proteica", "Subunidade 30S", "Tetraciclinas e glicilciclinas"],
  "Macrolídeos e lincosamidas": ["Antibacterianos", "Inibidores da síntese proteica", "Subunidade 50S", "Macrolídeos e lincosamidas"],
  "Oxazolidinonas": ["Antibacterianos", "Inibidores da síntese proteica", "Subunidade 50S", "Oxazolidinonas"],
  "Antifolatos": ["Antibacterianos", "Inibidores do metabolismo do folato", "Antifolatos"],
  "Metronidazol": ["Antibacterianos", "Agentes que lesionam ácidos nucleicos", "Nitroimidazóis", "Metronidazol"],
  "Quinolonas": ["Antibacterianos", "Inibidores da replicação do DNA", "Fluoroquinolonas"],
  "Agentes urinários": ["Antibacterianos", "Outros agentes de uso urinário", "Fosfomicina e nitrofurantoína"],
  "Resistência e stewardship": ["Uso racional e resistência antimicrobiana"]
};

const TAGS_LENTE = new Set([
  "mecanismo", "espectro", "toxicidade", "resistencia", "farmacocinetica",
  "farmacodinamica", "distribuicao", "diagnostico", "tratamento", "cirurgia",
  "epidemiologia", "fisiopatologia", "quadro clinico", "situacoes especiais",
  "prevencao", "introducao", "tecnica", "classificacao", "definicao",
  "gravidade", "investigacao", "caso-clinico", "laboratorio", "pk-pd",
  "stewardship", "antibiograma"
]);

function normalizar(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function contem(texto, termos) {
  const base = normalizar(texto);
  return termos.some(termo => base.includes(normalizar(termo)));
}

function classificarCompetencia(q) {
  const texto = `${q.categoria} ${(q.tags || []).join(" ")} ${q.pergunta}`;
  if (q.imagem || contem(texto, ["radiografia", "imagem", "incidência pa", "silhueta", "opacidade"])) {
    return "Interpretação diagnóstica";
  }
  if (contem(texto, ["tratamento", "antibioticoterapia", "cirurgia", "prevenção", "profilaxia", "conduta", "escolha", "indicação", "stewardship", "dose", "ajuste"])) {
    return "Decisão terapêutica";
  }
  if (contem(texto, ["diagnóstico", "investigação", "critério", "quadro clínico", "avaliação", "diferencial", "hemocultura", "ecocardiograma"])) {
    return "Raciocínio diagnóstico";
  }
  if (contem(texto, ["mecanismo", "fisiopatologia", "regulação", "resistência", "como se forma", "como atua", "por que", "alvo", "pk/pd", "farmacocinética", "farmacodinâmica"])) {
    return "Compreensão de mecanismo";
  }
  if (contem(texto, ["integração", "situações especiais", "caso clínico", "volemia", "complicação"])) {
    return "Integração clínica";
  }
  return "Conhecimento fundamental";
}

function classificarContexto(q) {
  if (q.imagem) return "Interpretação de imagem";
  if (contem(q.pergunta, ["paciente", "homem de", "mulher de", "caso clínico", "apresenta", "chega", "internado", "história de"])) {
    return "Caso clínico";
  }
  return "Pergunta direta";
}

function classificarComplexidade(q, competencia, contexto) {
  if (contexto === "Caso clínico" || competencia === "Integração clínica") return "Integração";
  if (["Decisão terapêutica", "Raciocínio diagnóstico", "Interpretação diagnóstica"].includes(competencia)) return "Aplicação";
  return "Fundamental";
}

function tituloTag(tag) {
  const titulos = {
    mssa: "MSSA", mrsa: "MRSA", esbl: "ESBL", ampc: "AmpC", snc: "SNC",
    aware: "AWaRe", hlar: "HLAR", poet: "POET", adh: "ADH", sihad: "SIHAD",
    scps: "SCPS", "di-central": "DI central", "di-nefrogenico": "DI nefrogênico",
    "pa-vs-ap": "PA versus AP", rotacao: "Rotação", inspiracao: "Inspiração",
    consolidacao: "Consolidação", nodulo: "Nódulo", "padrao-intersticial": "Padrão intersticial",
    "derrame-pericardico": "Derrame pericárdico", "lesoes-hipodensas": "Lesões hipodensas",
    "circulacao-pulmonar": "Circulação pulmonar", carbapenemicos: "Carbapenêmicos",
    monobactamicos: "Monobactâmicos", macrolideos: "Macrolídeos", nitrofurantoina: "Nitrofurantoína"
  };
  if (titulos[tag]) return titulos[tag];
  return String(tag).split("-").map(p => p ? p[0].toUpperCase() + p.slice(1) : p).join(" ");
}

function detalheConteudo(q) {
  const categoria = normalizar(q.categoria);
  const candidatos = (q.tags || []).filter(tag => {
    const n = normalizar(tag);
    return !TAGS_ESTRUTURAIS.has(n) && !TAGS_LENTE.has(n) && n !== categoria;
  });
  return candidatos.length ? tituloTag(candidatos[0]) : null;
}

function construirHierarquia(q, disciplina) {
  let ramo;
  if (q.tema === "Antimicrobianos - fundamentos") {
    if (q.categoria === "Fundamentos" && (q.tags || []).includes("betalactamicos")) {
      ramo = ["Antibacterianos", "Inibidores da síntese da parede celular", "Betalactâmicos", "Princípios de PK/PD"];
    } else if (q.categoria === "Fundamentos" && (q.tags || []).includes("daptomicina")) {
      ramo = ["Antibacterianos", "Agentes da membrana bacteriana", "Lipopeptídeos e polimixinas", "Daptomicina", "Distribuição"];
    } else if (q.categoria === "Fundamentos" && (q.tags || []).some(tag => ["stewardship", "antibiograma"].includes(tag))) {
      ramo = ["Uso racional e resistência antimicrobiana", "Princípios gerais"];
    } else {
      ramo = RAMOS_ANTIMICROBIANOS[q.categoria];
    }
    if (!ramo) throw new Error(`${q.id}: categoria de antimicrobianos sem ramo: ${q.categoria}`);
    ramo = ["Medicina", disciplina, "Antimicrobianos", ...ramo];
  } else {
    ramo = ["Medicina", disciplina, q.tema, q.categoria];
  }
  const detalhe = detalheConteudo(q);
  if (detalhe && !ramo.some(no => normalizar(no) === normalizar(detalhe))) ramo.push(detalhe);
  return ramo;
}

function classificarQuestao(q) {
  const eixo = POR_TEMA[q.tema];
  if (!eixo) throw new Error(`${q.id}: tema sem regra taxonômica: ${q.tema}`);
  const competencia = classificarCompetencia(q);
  const contexto = classificarContexto(q);
  const focos = [...new Set((q.tags || [])
    .filter(tag => !TAGS_ESTRUTURAIS.has(normalizar(tag)))
    .filter(tag => normalizar(tag) !== normalizar(q.categoria))
  )];

  const hierarquia = construirHierarquia(q, eixo.disciplina);
  return {
    area: "Medicina",
    disciplina: eixo.disciplina,
    disciplinasRelacionadas: eixo.disciplinasRelacionadas,
    tema: q.tema,
    subtema: q.categoria,
    focos,
    competencia,
    complexidade: classificarComplexidade(q, competencia, contexto),
    contexto,
    hierarquia
  };
}

const banco = JSON.parse(fs.readFileSync(BANCO_PATH, "utf8"));
if (!Array.isArray(banco.questoes)) throw new Error("banco sem array de questões");

banco.versao = 2;
banco.atualizadoEm = new Date().toISOString().slice(0, 10);
banco.taxonomia = {
  versao: 2,
  hierarquia: "classificacao.hierarquia (caminho ordenado, com profundidade variável)",
  eixos: ["focos", "competencia", "complexidade", "contexto"],
  complexidades: ["Fundamental", "Aplicação", "Integração"]
};
banco.questoes.forEach(q => { q.classificacao = classificarQuestao(q); });

fs.writeFileSync(BANCO_PATH, JSON.stringify(banco, null, 2) + "\n", "utf8");
console.log(`Estratificadas ${banco.questoes.length} questões (schema v${banco.versao}).`);
