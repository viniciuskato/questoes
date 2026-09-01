/**
 * Lógica de seleção de questões do banco a partir de um spec (ids ou filtro).
 * Compartilhada por gerar-lista.js e atualizar-index.js para nunca divergir.
 */
function selecionarQuestoes(banco, spec) {
  if (Array.isArray(spec.ids) && spec.ids.length > 0) {
    const byId = new Map(banco.questoes.map(q => [q.id, q]));
    return spec.ids.map(id => {
      const q = byId.get(id);
      if (!q) throw new Error(`id "${id}" não encontrado no banco.`);
      return q;
    });
  }

  if (spec.filtro) {
    const {
      areas, disciplinas, temas, categorias, subtemas, tags, focos,
      competencias, complexidades, contextos, nosHierarquicos, caminhoHierarquico
    } = spec.filtro;
    const selecionadas = banco.questoes.filter(q => {
      const c = q.classificacao || {};
      if (areas && areas.length && !areas.includes(c.area)) return false;
      if (disciplinas && disciplinas.length && !disciplinas.includes(c.disciplina)) return false;
      if (temas && temas.length && !temas.includes(q.tema)) return false;
      if (categorias && categorias.length && !categorias.includes(q.categoria)) return false;
      if (subtemas && subtemas.length && !subtemas.includes(c.subtema)) return false;
      if (tags && tags.length && !tags.some(t => (q.tags || []).includes(t))) return false;
      if (focos && focos.length && !focos.some(f => (c.focos || []).includes(f))) return false;
      if (competencias && competencias.length && !competencias.includes(c.competencia)) return false;
      if (complexidades && complexidades.length && !complexidades.includes(c.complexidade)) return false;
      if (contextos && contextos.length && !contextos.includes(c.contexto)) return false;
      if (nosHierarquicos && nosHierarquicos.length && !nosHierarquicos.some(no => (c.hierarquia || []).includes(no))) return false;
      if (caminhoHierarquico && caminhoHierarquico.length && !caminhoHierarquico.every((no, i) => (c.hierarquia || [])[i] === no)) return false;
      return true;
    });
    if (selecionadas.length === 0) throw new Error("o filtro não retornou nenhuma questão do banco.");
    return selecionadas;
  }

  throw new Error('spec precisa de "ids" ou "filtro".');
}

module.exports = { selecionarQuestoes };
