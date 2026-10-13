// PROOF BY RECORDING for [LW-ROWS-SPLIT] (13 Oct 26) — "nothing on screen may change" (docs/walk-scripts.md §8).
// It serves ONE built bundle, opens the Leave War as an admin and as a member, at a desktop and a phone, and writes the
// grid's whole markup and a picture for each view. Run it once on a build of `main` and once on the branch's build, then
// compare the two folders byte for byte (`--compare a b`).
//   node scripts/handpass/lw-rows-record.mjs <dist folder> <out folder>
//   node scripts/handpass/lw-rows-record.mjs --compare <out a> <out b>
// VERSION 1
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

if (process.argv[2] === '--compare') {
  const [a, b] = [resolve(process.argv[3]), resolve(process.argv[4])]
  const files = readdirSync(a).filter(f => f.endsWith('.html')).sort()
  let bad = 0
  for (const f of files) {
    const x = readFileSync(join(a, f), 'utf8'), y = existsSync(join(b, f)) ? readFileSync(join(b, f), 'utf8') : null
    const same = x === y
    if (!same) bad++
    console.log(`${same ? 'SAME' : 'DIFFERENT'}  ${f}  ${x.length} bytes${same ? '' : y == null ? ' — missing in the second' : ` vs ${y.length}`}`)
  }
  console.log(`\n${files.length} views compared · ${bad ? bad + ' DIFFERENT' : 'every one identical, byte for byte'}`)
  process.exit(bad ? 1 : 0)
}

const DIST = resolve(process.argv[2]), OUT = resolve(process.argv[3])
mkdirSync(OUT, { recursive: true })
console.log(`lw-rows-record VERSION 1 — ${DIST} -> ${OUT}`)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url || '/').split('?')[0])))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
/* the clock is HELD at one moment for both builds: the grid opens on today's month and marks today */
const NOW = new Date(2026, 9, 13, 10, 0, 0).getTime()
const SIZES = [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]
const WHO = [['admin', 'ad', 'a'], ['member', 'us', 'us']]
let n = 0
for (const [size, use] of SIZES) for (const [who, user, pass] of WHO) {
  const ctx = await browser.newContext(use)
  const page = await ctx.newPage()
  await page.clock.install({ time: NOW })
  const errs = []; page.on('pageerror', e => errs.push(String(e)))
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  await page.fill('#luser', user); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 30000 })
  await page.clock.runFor(3000)                 // the window of months draws while idle: let it settle
  await page.waitForTimeout(800)
  const grab = async name => {
    /* the grid as drawn: every row and heading, in order — and the whole table's markup */
    const html = await page.evaluate(() => { const g = document.querySelector('#page-leavewar .mx-outer') || document.querySelector('#page-leavewar'); return g.outerHTML })
    writeFileSync(join(OUT, `${size}-${who}-${name}.html`), html)
    await page.screenshot({ path: join(OUT, `${size}-${who}-${name}.png`) })
    n++
    console.log(`  ${size} ${who} ${name}: ${html.length} bytes, ${await page.locator('#page-leavewar [data-testid^="row-"]').count()} rows`)
  }
  await grab('as-opened')
  /* a second place in the year: the grid scrolled a long way right, where other months and placeholders are drawn */
  await page.evaluate(() => { const s = document.querySelector('#page-leavewar .mx-outer'); if (s) s.scrollLeft = s.scrollWidth * 0.6 })
  await page.clock.runFor(3000); await page.waitForTimeout(800)
  await grab('scrolled')
  if (errs.length) console.log(`  PAGE ERRORS (${size} ${who}): ${errs.join(' | ').slice(0, 300)}`)
  await ctx.close()
}
console.log(`\n${n} views recorded`)
await browser.close(); server.close()
