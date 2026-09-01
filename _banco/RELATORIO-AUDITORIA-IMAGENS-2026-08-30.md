# Auditoria de imagens — `_banco/imagens/` (2026-08-30)

**Natureza:** diagnóstico apenas. Nenhuma imagem, nenhum registro de `banco-questoes.json`,
`correcoes.json` ou `fontes.json` foi apagado, movido, renomeado ou editado nesta rodada.
Nenhum script gerador (`gerar-seletor.js`, `gerar-lista.js`, `estratificar-banco.js` etc.) foi
executado.

## Método

1. Listagem de todos os arquivos em `_banco/imagens/` com tamanho em disco e hash SHA-256
   (`sha256sum` sobre cada arquivo).
2. Varredura de `banco-questoes.json` por dois caminhos independentes:
   - todas as ocorrências do campo `"imagem": "..."`;
   - todas as ocorrências de string terminando em extensão de imagem (`.png`, `.jpg`, `.jpeg`,
     `.gif`, `.webp`, `.svg`) em qualquer lugar do arquivo, para pegar referência fora do campo
     `imagem` caso existisse.
   - confirmação de que `imagemMeta` (metadado companheiro de cada imagem, conforme
     `LEIA-ME.md`) aparece exatamente uma vez por questão com imagem, sem apontar para arquivo
     adicional.
3. Cruzamento disco × referências para achar órfãs (em disco, nunca referenciadas).
4. Agrupamento por hash SHA-256 idêntico para achar duplicatas exatas.

## Resultado

- **Total de imagens em disco:** 10 (todas em `imagens/pneumologia/`).
- **Total referenciado no banco:** 10 — cada uma referenciada por exatamente uma questão,
  via campo `imagem`.
- **Órfãs (em disco, sem referência):** 0.
- **Duplicatas exatas (mesmo hash SHA-256):** 0 — os 10 hashes são todos distintos.

### Inventário completo

| Arquivo | Tamanho | SHA-256 | Referenciada por |
|---|---|---|---|
| rx-caso-02-mediastino.png | 432 KB | `34fc51cb...79cc5` | rxtorax-02 |
| rx-caso-03-cardiomediastino.png | 348 KB | `5df3d25c...4dcfb8` | rxtorax-03 |
| rx-caso-04-coracao-tc.png | 800 KB | `ca39be54...d019f086f` | rxtorax-04 |
| rx-caso-05-comparativa.png | 372 KB | `6546a86e...c94468` | rxtorax-05 |
| rx-caso-06-pulmoes.png | 496 KB | `d0db8f92...8ac1f8` | rxtorax-06 |
| rx-caso-07-pulmao.png | 556 KB | `0da4ad68...58ad859` | rxtorax-07 |
| rx-caso-08-pulmao.png | 468 KB | `e6e5b67f...15061ac` | rxtorax-08 |
| rx-caso-09-pleura.png | 832 KB | `782b2007...2eb7509` | rxtorax-09 |
| rx-caso-10-pleura.png | 288 KB | `60650729...14ec38671` | rxtorax-10 |
| rx-caso-11-abdome.png | 952 KB | `b5335303...e5f01` | rxtorax-11 |

(Hashes truncados na tabela por legibilidade; ver `hashes` completos no fim do arquivo se
necessário reconferir — ou reexecutar `sha256sum imagens/pneumologia/*` a qualquer momento,
já que nada foi alterado.)

**Total em disco:** ~5.5 MB.

## Espaço recuperável estimado

**0 bytes.** Não há órfãs nem duplicatas nesta pasta hoje — todo o conteúdo de
`_banco/imagens/` está em uso e é único.

## Limitações do método

- A varredura de referências é por *string literal* no JSON (`"imagem": "caminho..."` e
  varredura geral por extensão). Como o banco de questões é um arquivo de dados estático (não
  há código gerando caminhos de imagem dinamicamente em tempo de execução dentro do próprio
  JSON), essa abordagem cobre 100% das referências possíveis nesse arquivo. Não foi verificado
  se algum HTML publicado (`medicina/*.html`, exportações em `provas/`) referencia imagens fora
  do padrão `_banco/imagens/<tema>/`, pois o escopo desta auditoria é a integridade
  banco-questoes.json ↔ pasta de imagens, não os HTMLs derivados (fora do escopo desta
  tarefa).
- Duplicata detectada é só por hash idêntico (conteúdo byte-a-byte igual). Duas imagens
  visualmente parecidas mas com compressão/resolução diferentes (ex.: mesmo Rx exportado duas
  vezes com qualidades distintas) não seriam pegas por este método — não havia esse cenário
  nos 10 hashes atuais (todos distintos), mas o método não garante ausência de duplicata
  *quase* idêntica.
- `_banco/imagens/` hoje só contém a subpasta `pneumologia/`; não há imagens soltas na raiz de
  `imagens/` nem em outras subpastas de tema, então não houve necessidade de tratar
  ambiguidade de caminho relativo entre temas.
