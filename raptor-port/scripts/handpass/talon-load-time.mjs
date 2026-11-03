// How long the app takes to load, before and after the loading claw ([TALON-LOADING-CLAW], D1591 — "I want it
// lightweight too so it doesnt make my loading time increase"). Serves the built bundle (dist/) with Vite's own
// preview server, opens it RUNS times in a fresh Chromium context (nothing cached) with the CPU slowed 4x and the
// network held to a phone's 4G, and records three moments from the start of the page load: the first paint, the
// sign-in's username box on screen (the app is up), and the HTML page's size. Prints the medians and writes them to
// a JSON file beside the other runs.
//   npm run build && node scripts/handpass/talon-load-time.mjs <label> [runs]     (MOTION=reduce: the claw stands still)
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const LABEL = process.argv[2] || 'run'
const RUNS = Number(process.argv[3] || 9)
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon/load')
mkdirSync(OUT, { recursive: true })
const PORT = 4291
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const rows = []
for (let i = 0; i < RUNS; i++) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: process.env.MOTION || 'no-preference' })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Network.enable')
  // a phone's 4G: about 9 Mbit/s down, 40 ms round trip
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 })
  await page.goto(`http://localhost:${PORT}/?fresh=1`, { waitUntil: 'commit' })
  await page.waitForSelector('#luser', { state: 'visible', timeout: 60000 })
  const t = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const fp = performance.getEntriesByName('first-paint')[0]
    return { firstPaint: fp ? Math.round(fp.startTime) : null, ready: Math.round(performance.now()), htmlBytes: nav ? nav.transferSize : null }
  })
  rows.push(t)
  await ctx.close()
}
await browser.close()
await new Promise(r => server.httpServer.close(r))

const med = k => { const v = rows.map(r => r[k]).filter(x => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null }
const html = statSync(join(ROOT, 'dist/index.html')).size
const summary = { label: LABEL, runs: RUNS, firstPaintMs: med('firstPaint'), appReadyMs: med('ready'), indexHtmlBytes: html, rows }
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(summary, null, 2))
console.log(`${LABEL}: first paint ${summary.firstPaintMs} ms, app ready ${summary.appReadyMs} ms (medians of ${RUNS}), index.html ${html} bytes`)
