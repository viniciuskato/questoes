/**
 * Monta o HTML final de uma lista (quiz) a partir de spec + banco + fontes + template.
 * Compartilhado por gerar-lista.js e progresso.js pra nunca divergir.
 */
const { selecionarQuestoes } = require("./selecionar");

function montarHtmlLista({ banco, fontesRegistro, template, spec }) {
  if (!spec.quizId || !spec.title) throw new Error('spec precisa de "quizId" e "title".');

  const selecionadas = selecionarQuestoes(banco, spec);

  const questions = selecionadas.map(q => ({
    id: q.id,
    tema: q.tema,
    cat: q.categoria,
    classificacao: q.classificacao,
    q: q.pergunta,
    img: q.imagem ? "../_banco/" + q.imagem : undefined,
    imgAlt: q.imagemLegenda || undefined,
    options: q.alternativas,
    correct: q.correta,
    exp: q.explicacao,
    ref: q.referencias || [],
    itemVersion: q.versaoEditorial || 1,
    editorialState: q.estadoEditorial || "pendente_revisao_conteudo"
  }));

  if (spec.strictOptionBalance) {
    selecionadas.forEach(q => {
      if (!Array.isArray(q.alternativas) || q.alternativas.length < 2) return;
      const lengths = q.alternativas.map(option => option.trim().length);
      const correctLength = lengths[q.correta];
      const averageLength = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
      const otherMaximum = Math.max(...lengths.filter((_, index) => index !== q.correta));
      if (correctLength > averageLength * 1.25 && correctLength > otherMaximum + 10) {
        throw new Error(`${q.id}: alternativa correta destaca-se pelo comprimento (${correctLength} caracteres; média ${averageLength.toFixed(1)}).`);
      }
    });
  }

  const usedSlugs = new Set();
  questions.forEach(item => (item.ref || []).forEach(slug => usedSlugs.add(slug)));
  const fontes = {};
  usedSlugs.forEach(slug => {
    if (!fontesRegistro[slug]) throw new Error(`fonte "${slug}" referenciada mas ausente em fontes.json.`);
    fontes[slug] = fontesRegistro[slug];
  });

  const quizData = {
    quizId: spec.quizId,
    title: spec.title,
    description: spec.description || "",
    footnote: spec.footnote || "",
    questions,
    fontes
  };

  const finalHtml = template.replace(
    "__QUIZ_DATA_JSON__",
    JSON.stringify(quizData, null, 2).replace(/</g, "\\u003c")
  );

  return { html: finalHtml, count: questions.length, fontesCount: usedSlugs.size };
}

module.exports = { montarHtmlLista };
