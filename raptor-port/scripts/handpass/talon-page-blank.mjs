// How long each page stays blank when it is opened ([TALON-CLAW-PAGES], D1607 — "any pages that loads slowly").
// Serves the built bundle (dist/) with Vite's own preview server and, for every page of the menu, in a fresh browser
// each run (nothing cached, as a first visit after sign-in): signs in as the admin, waits for the week, then opens the
// page the way he does — on a phone the ☰ menu and a tap on its line, on a desktop the top bar's tab — and records,
// frame by frame from the tap:
//   firstFrame  the first frame the screen changes at all after the tap (until then the old screen stands still)
//   content     the first frame anything of the new page is drawn under the top bar (until then the area is BLANK)
//   drawn       the first frame the page's main content is drawn (the week's days, the Leave War's rows, the chart…)
//   longest     the longest single gap between two frames in that time (how long the screen stood frozen at once)
// Conditions: his iPhone's speed (CPU not slowed) and a slowed phone (CPU 4x), both on a phone's 4G (about 9 Mbit/s,
// 40 ms), at the phone's size; and a desktop (CPU not slowed, 4G, 1536 wide) clicked before the Leave War's pre-warm.
//   npm run build && node scripts/handpass/talon-page-blank.mjs [runs] [only=page,page] [cond=phone1,phone4,desk1]
// Writes docs/img/handpass/2026-11-03-talon-pages/blank.json and prints a table of medians.
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const args = process.argv.slice(2)
const RUNS = Number(args.find(a => /^\d+$/.test(a)) || 5)
const ONLY = (args.find(a => a.startsWith('only=')) || '').slice(5).split(',').filter(Boolean)
const CONDS = ((args.find(a => a.startsWith('cond=')) || '').slice(5) || 'phone1,phone4,desk1').split(',')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages')
mkdirSync(OUT, { recursive: true })
const PORT = Number(process.env.PORT || 4293)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

// each page: its section, and what counts as its main content being drawn
const PAGES = [
  ['viewsched', '#vWeek .day'],
  ['editsched', '#eWeek .day'],
  ['inputs', '#page-inputs h1'],
  ['quals', '#page-quals table'],
  ['logic', '#page-logic .lgttl'],
  ['leavewar', '#page-leavewar table.mx tbody tr'],
  ['tracker', '#page-tracker #board'],
  ['help', '#page-help h2'],
  ['admin', '#page-admin h2'],
].filter(([p]) => !ONLY.length || ONLY.includes(p))

const COND = {
  phone1: { viewport: { width: 402, height: 874 }, mobile: true, cpu: 1 },
  phone4: { viewport: { width: 402, height: 874 }, mobile: true, cpu: 4 },
  desk1: { viewport: { width: 1536, height: 864 }, mobile: false, cpu: 1 },
}

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

async function one(condName, page, sel) {
  const c = COND[condName]
  const ctx = await browser.newContext({ viewport: c.viewport, deviceScaleFactor: 1, isMobile: c.mobile, hasTouch: c.mobile })
  const pg = await ctx.newPage()
  const errs = []
  pg.on('pageerror', e => errs.push(String(e)))
  const cdp = await ctx.newCDPSession(pg)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 })
  await pg.goto(`http://localhost:${PORT}/?fresh=1`)
  await pg.fill('#luser', 'ad')
  await pg.fill('#lpass', 'a')
  await pg.click('#loginForm button[type=submit]')
  await pg.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
  // let the sign-in settle (a person reads the week a moment), but stay inside the desktop pre-warm's 2 s quiet gap
  await pg.waitForTimeout(600)
  // a page already on screen is opened from Help instead, so its open is measured too
  if (await pg.evaluate(p => document.getElementById('page-' + p)?.classList.contains('on'), page)) {
    await pg.evaluate(() => { const h = document.querySelector('#topnav a[data-page="help"]'); h && h.click() })
    await pg.waitForSelector('#page-help.on h2', { timeout: 10000 })
    await pg.waitForTimeout(300)
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.cpu })
  if (c.mobile) {
    await pg.click('#burger')
    await pg.waitForSelector('#drawer.open', { timeout: 10000 })
    await pg.waitForTimeout(400)
  }
  // the frame recorder: from the tap on, one sample a frame
  await pg.evaluate(({ page, sel }) => {
    const w = window
    w.__pb = { t0: null, frames: [], done: false }
    const sec = document.getElementById('page-' + page)
    let seen = false
    const hasContent = () => {
      if (seen) return true
      if (!sec || !sec.classList.contains('on')) return false
      for (const el of sec.querySelectorAll('*')) {
        const r = el.getBoundingClientRect()
        if (r.height > 4 && r.width > 4 && (el.textContent || '').trim()) { seen = true; return true }
      }
      return false
    }
    const drawn = () => { const el = document.querySelector(sel); return !!el && el.getBoundingClientRect().height > 0 }
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('[data-page]')
      if (a && a.getAttribute('data-page') === page && w.__pb.t0 == null) w.__pb.t0 = e.timeStamp
    }, true)
    const loop = t => {
      if (w.__pb.t0 != null) {
        w.__pb.frames.push({ t: t - w.__pb.t0, c: hasContent(), d: drawn() })
        if (w.__pb.frames.length > 4 && w.__pb.frames.slice(-3).every(f => f.d)) { w.__pb.done = true; return }
        if (t - w.__pb.t0 > 20000) { w.__pb.done = true; return }
      }
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }, { page, sel })
  const link = c.mobile ? `#drawerNav a[data-page="${page}"]` : `#topnav a[data-page="${page}"]`
  await pg.click(link)
  await pg.waitForFunction(() => window.__pb.done, null, { timeout: 30000 })
  const fr = await pg.evaluate(() => window.__pb.frames)
  await ctx.close()
  const first = fr[0]
  const content = fr.find(f => f.c)
  const drawnF = fr.find(f => f.d)
  let longest = first ? first.t : 0
  for (let i = 1; i < fr.length && (!drawnF || fr[i - 1].t < drawnF.t); i++) longest = Math.max(longest, fr[i].t - fr[i - 1].t)
  return {
    firstFrame: first ? Math.round(first.t) : null,
    content: content ? Math.round(content.t) : null,
    drawn: drawnF ? Math.round(drawnF.t) : null,
    longest: Math.round(longest),
    errors: errs,
  }
}

const med = v => { const s = v.filter(x => x != null).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null }
const out = { runs: RUNS, at: new Date().toISOString(), results: {} }
for (const cond of CONDS) {
  out.results[cond] = {}
  for (const [page, sel] of PAGES) {
    const rows = []
    for (let i = 0; i < RUNS; i++) rows.push(await one(cond, page, sel))
    const m = k => med(rows.map(r => r[k]))
    out.results[cond][page] = { firstFrame: m('firstFrame'), content: m('content'), drawn: m('drawn'), longest: m('longest'),
      contentMax: Math.max(...rows.map(r => r.content ?? 0)), rows }
    const r = out.results[cond][page]
    console.log(`${cond.padEnd(7)} ${page.padEnd(10)} first frame ${String(r.firstFrame).padStart(5)} ms · blank until ${String(r.content).padStart(5)} ms (worst ${r.contentMax}) · drawn ${String(r.drawn).padStart(5)} ms · longest freeze ${String(r.longest).padStart(5)} ms${rows.some(x => x.errors.length) ? ' · PAGE ERRORS' : ''}`)
  }
}
writeFileSync(join(OUT, 'blank.json'), JSON.stringify(out, null, 2))
await browser.close()
await new Promise(r => server.httpServer.close(r))
