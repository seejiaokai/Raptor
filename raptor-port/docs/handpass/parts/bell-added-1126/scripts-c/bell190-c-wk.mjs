// bell190-c: can WebKit reach the server at all? v2 — a data page, and a tiny server of our own on 127.0.0.1
import { createRequire } from 'module'
import http from 'node:http'
const require = createRequire(process.cwd() + '/package.json')
const { webkit } = require('playwright')
console.log('bell190-c-wk v2')
const srv = http.createServer((q, s) => { s.end('<p>ok</p>') }).listen(0, '127.0.0.1')
await new Promise(r => srv.on('listening', r))
const port = srv.address().port
const b = await webkit.launch()
console.log('webkit version', b.version())
const p = await (await b.newContext()).newPage()
for (const u of ['data:text/html,<p>hi</p>', `http://127.0.0.1:${port}/`, 'http://localhost:4190/']) {
  const t = Date.now()
  const r = await p.goto(u, { waitUntil: 'commit', timeout: 10000 }).then(r => r ? r.status() : 'null').catch(e => 'ERR ' + String(e).split('\n')[0].slice(0, 100))
  console.log(u, r, Date.now() - t, 'ms', await p.evaluate(() => document.body && document.body.innerText).catch(() => '?'))
}
await b.close(); srv.close()
