/* [ACCOUNTS] roll-call row 38 (26 Sep 26; Fable scenario S22): the developer's-PC probe bridge
   (probe-bridge.ts — window.raptorMe, raptorRole, PEOPLE, setSlotVal, lwSetViewer …) is installed
   ONLY on a loopback address. Walked on the real production bundle: dist/ served by a plain static
   server on 127.0.0.1, opened twice in a real Chromium — once as http://127.0.0.1 (the control:
   the bridge must be there) and once under a made-up name mapped to the same PC by the browser
   itself (--host-resolver-rules), which the app sees as a non-local host (the bridge must be gone,
   and the app must still sign in and draw the week). No firewall rule, nothing on the network.
   Run from raptor-port/: node scripts/handpass/acc-bridge-offhost.mjs  (after npm run build) */
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { chromium } from '@playwright/test'

const DIST = join(process.cwd(), 'dist')
const PORT = 4191
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let f = normalize(join(DIST, url))
  if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' })
  res.end(readFileSync(f))
}).listen(PORT, '127.0.0.1')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}),
  args: ['--host-resolver-rules=MAP raptor.test 127.0.0.1'] })
const probe = async (base) => {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(base)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
  const g = await page.evaluate(() => ['raptorMe', 'raptorRole', 'PEOPLE', 'setSlotVal', 'lwSetViewer', 'lwSetRole', 'fileInput'].filter(k => (window)[k] !== undefined))
  const host = await page.evaluate(() => location.hostname)
  await page.screenshot({ path: `docs/img/handpass/2026-09-26-accounts/bridge-${host.replace(/\W/g, '_')}.png` })
  await page.close()
  return { host, bridge: g, errors }
}
const local = await probe(`http://127.0.0.1:${PORT}/`)
const off = await probe(`http://raptor.test:${PORT}/`)
await browser.close(); server.close()
const ok = local.bridge.length === 7 && off.bridge.length === 0 && off.errors.length === 0
console.log(JSON.stringify({ local, off }, null, 1))
console.log(ok ? 'PASS — the bridge is on the loopback address and nowhere else; the app signs in and draws the week off it'
  : 'FAIL')
process.exit(ok ? 0 : 1)
