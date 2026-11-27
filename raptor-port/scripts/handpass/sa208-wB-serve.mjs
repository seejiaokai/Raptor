// sa208-wB-serve — walker B's static server for the SANS answers walk (chat 208, 27 Nov 26): the frozen build
// D:/raptor-work/c208-build served on port 4962 (index.html as the fallback), nothing else. Run in the background from
// raptor-port/:  node scripts/handpass/sa208-wB-serve.mjs
import http from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
const DIR = process.env.SA208B_DIR || 'D:/raptor-work/c208-build'
const PORT = +(process.env.SA208B_PORT || 4962)
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.txt': 'text/plain' }
http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '')
  let f = join(DIR, rel)
  if (!rel || !existsSync(f) || !statSync(f).isFile() || !resolve(f).startsWith(resolve(DIR))) f = join(DIR, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(readFileSync(f))
}).listen(PORT, 'localhost', () => console.log('sa208-wB-serve: ' + DIR + ' on http://localhost:' + PORT + '/'))
