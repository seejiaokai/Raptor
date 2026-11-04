// PROBE (4 Nov 26, the re-walk of D1633): the same question as lwsf-webkit-reload-probe.mjs — after a failed Leave War
// download, does a reload fetch the file again? — but with the failure made by the SERVER (it hangs up on the file while a
// switch is on), not by the test browser's own blocking (a route or its offline switch), which may itself be what the
// browser remembers. Serves the built app (dist/) on :4188 itself.
// Run from raptor-port/ after a build: node scripts/handpass/lwsf-socket-probe.mjs
import { chromium, webkit, devices } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const DIST = resolve('dist')
const PORT = 47391
const URL = `http://127.0.0.1:${PORT}/`
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' }
const S = { refuse: false, hits: [] }
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0])
  if (/LeaveWarPage-.*\.js$/.test(path)) { S.hits.push((S.refuse ? 'hung up' : 'served') + ' ' + path.split('/').pop()); if (S.refuse) { req.socket.destroy(); return } }
  let f = join(DIST, path)
  if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' })
  res.end(readFileSync(f))
})
await new Promise(r => server.listen(PORT, "127.0.0.1", r))
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function signIn(p) {
  await p.waitForSelector('#loginForm', { timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
}
async function openLW(p) {
  if (await p.locator('#burger').isVisible()) {
    await p.locator('#burger').tap(); await p.waitForSelector('#drawer.open'); await sleep(250)
    await p.locator('#drawerNav a[data-page="leavewar"]').tap()
  } else await p.locator('a[data-page="leavewar"]:visible').first().click()
  const grid = await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: 12000 }).then(() => true, () => false)
  return { grid, card: await p.locator('[data-testid="page-load-fail"]').count() }
}
async function run(type, opts, label) {
  S.refuse = true; S.hits = []
  const { lever: _l, ...ctxOpts } = opts
  const ctx = await type.newContext(ctxOpts)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('pageerror ' + String(e.message).slice(0, 160)))
  p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 160)) })
  p.on('requestfailed', r => errs.push('failed ' + r.url().split('/').pop() + ' ' + (r.failure()?.errorText || '')))
  await p.goto(URL)
  try { await signIn(p) } catch (e) { console.log(`${label}: no sign-in form; body '${(await p.evaluate(() => document.body.innerText)).slice(0, 200)}'; ${errs.slice(0, 6).join(' | ')}`); await ctx.close(); return }
  const a = await openLW(p)
  S.refuse = false
  const before = S.hits.length
  /* the levers, tried before Retry when asked: a fresh fetch of the file skipping every cache; an import under a changed address */
  const file = readFileSync(join(DIST, 'index.html'), 'utf8') && (await import('node:fs')).readdirSync(join(DIST, 'assets')).find(f => /^LeaveWarPage-.*\.js$/.test(f))
  if (opts.lever === 'fetch') console.log('  lever fetch(cache: reload): ' + await p.evaluate(u => fetch(u, { cache: 'reload' }).then(r => 'status ' + r.status, e => 'failed ' + e.message), '/assets/' + file))
  if (opts.lever === 'busted') console.log('  lever import under ?r=1: ' + await p.evaluate(u => import(u).then(() => 'loaded', e => 'failed ' + e.message), '/assets/' + file + '?r=1'))
  const retry = p.locator('[data-testid="page-load-retry"]')
  if (opts.hasTouch) await retry.tap(); else await retry.click()
  await signIn(p)
  const b = await openLW(p)
  console.log(`${label}: refused ${JSON.stringify(a)} -> Retry, signed in again: ${b.grid && !b.card ? 'GRID' : 'CARD'} ${JSON.stringify(b)}; the server saw: ${S.hits.join(' · ')} (after Retry: ${S.hits.length - before} request(s))`)
  await ctx.close()
}
const wk = await webkit.launch()
await run(wk, { ...devices['iPhone 13'] }, 'WebKit iPhone 13, the server hangs up')
for (const lever of ['fetch', 'busted']) await run(wk, { ...devices['iPhone 13'], lever }, `WebKit iPhone 13, the server hangs up, lever '${lever}' then Retry`)
await wk.close()
const cr = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
await run(cr, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, 'Chromium phone, the server hangs up')
await cr.close()
server.close()
