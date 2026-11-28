// sa208-wA-serve — walker A's static server for the chat 208 walk (his answers to the SANS warning-lines questions,
// D2753–D2759), 27 Nov 26. Serves the frozen build folder (index.html as the fallback) on one port, on this machine only.
// Brief: docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md. Run: node scripts/handpass/sa208-wA-serve.mjs
import http from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
const DIR = process.env.SA208_DIR || 'D:/raptor-work/c208-build'
const PORT = +(process.env.SA208_PORT || 4961)
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' }
const handler = (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '')
  let f = join(DIR, rel)
  if (!rel || !existsSync(f) || !statSync(f).isFile() || !resolve(f).startsWith(resolve(DIR))) f = join(DIR, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(readFileSync(f))
}
for (const host of ['127.0.0.1', '::1']) http.createServer(handler).listen(PORT, host, () => console.log('sa208-wA-serve', DIR, 'on', host, PORT))
