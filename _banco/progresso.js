#!/usr/bin/env node
/**
 * Audita os registros de desempenho sem gerar listas derivadas.
 * O seletor hierárquico remove questões já feitas diretamente a partir dos
 * JSONs escolhidos pelo usuário, e o dashboard agrega resultados por qId.
 */
const fs = require("fs");
const path = require("path");

const registrosDir = path.join(__dirname, "..", "_dados", "registros");
const answeredIds = new Set();
const files = fs.existsSync(registrosDir)
  ? fs.readdirSync(registrosDir).filter(file => file.endsWith(".json"))
  : [];
let validRecords = 0;

for (const file of files) {
  const record = JSON.parse(fs.readFileSync(path.join(registrosDir, file), "utf8"));
  if (!record || !Array.isArray(record.answers)) continue;
  validRecords++;
  record.answers.forEach((answer, index) => {
    if (!answer.qId) throw new Error(`_dados/registros/${file}: resposta #${index} não tem qId.`);
    answeredIds.add(answer.qId);
  });
}

console.log(`${validRecords} registro(s) válido(s) · ${answeredIds.size} questões únicas respondidas.`);
console.log("Nenhuma lista ou seção do index.html foi gerada; use o seletor hierárquico.");
