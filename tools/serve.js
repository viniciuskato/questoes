#!/usr/bin/env node
// Servidor estático local para Questões — necessário porque a busca global (Ctrl+K)
// em index.html usa fetch() para ler _banco/banco-questoes.json, o que navegadores
// bloqueiam sob o protocolo file://.
//
// Uso:
//   node tools/serve.js            → http://localhost:5500
//   node tools/serve.js --port=N   → porta customizada
//   node tools/serve.js --no-open  → não abre o navegador automaticamente

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const portArg = args.find(a => a.startsWith('--port='));
const noOpen = args.includes('--no-open');
const PORT = portArg ? parseInt(portArg.split('=')[1], 10) : 5500;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Resolve uma URL contra `root` e garante que o resultado fica dentro dele.
// `path.relative` é a forma robusta de checar isso: se o caminho relativo
// resultante começa com ".." (ou é absoluto, no caso do Windows cruzar de
// drive), o alvo está fora de `root` — inclusive quando `root` e o alvo são a
// mesma string até certo ponto (ex.: "Questões" vs "Questões-outra-pasta",
// que `startsWith` deixava passar por engano). Retorna `null` quando inválido.
function resolveSafePath(root, urlPath) {
  const decoded = decodeURIComponent(String(urlPath || '').split('?')[0]);
  const target = decoded === '/' || decoded === '' ? '/index.html' : decoded;
  const full = path.resolve(root, '.' + target);
  const rel = path.relative(root, full);
  if (rel === '') return full;
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  const full = resolveSafePath(ROOT, req.url);
  if (!full) {
    res.writeHead(403);
    return res.end('403 Forbidden');
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + req.url);
    }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => {
    const url = `http://localhost:${PORT}/index.html`;
    console.log(`Servidor de Questões rodando em ${url}`);
    console.log('Pressione Ctrl+C para encerrar.');
    if (!noOpen) {
      execFile('cmd', ['/c', 'start', '', url], () => {});
    }
  });
}

module.exports = { resolveSafePath, ROOT };
