/* The ?timing readout's walk (chat 164, 24 Nov 26 — evidence sheet docs/handpass/2026-11-24-timing-readout.md).
   A small server of the BUILT app (compressed, an ETag and "check again each time" as Vercel answers static files, so
   the readout's kept-files and downloaded rows meet real answers), real browsers, and the readers of the window.
   Settings from the first line (docs/walk-scripts.md §1): TW_DIST the build folder, TW_OUT the picture folder. */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
process.env.TW_DIST ||= path.join(ROOT, 'dist')
process.env.TW_OUT ||= path.join(ROOT, 'docs/img/handpass/2026-11-24-timing-readout/walk1')
export const DIST = process.env.TW_DIST
export const OUT = process.env.TW_OUT
const req = createRequire(path.join(ROOT, 'package.json'))
export const { chromium, webkit } = req('playwright')

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' }
const gz = new Map()
/** Serve `dist` on a free port: every answer compressed, with an ETag; a repeat ask with that ETag gets "unchanged". */
export function serve(dist = DIST) {
  dist = path.resolve(dist)
  const hits = []
  const server = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0])
    if (p === '/' || !path.extname(p)) p = '/index.html'
    const f = path.join(dist, p)
    if (!f.startsWith(dist) || !fs.existsSync(f)) { hits.push({ p, st: 404 }); s.writeHead(404); s.end(); return }
    let body = gz.get(f)
    if (!body) { body = zlib.gzipSync(fs.readFileSync(f)); gz.set(f, body) }
    const etag = '"' + crypto.createHash('md5').update(body).digest('hex').slice(0, 16) + '"'
    if (q.headers['if-none-match'] === etag) { hits.push({ p, st: 304 }); s.writeHead(304, { etag }); s.end(); return }
    hits.push({ p, st: 200, n: body.length })
    s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-encoding': 'gzip', 'cache-control': 'public, max-age=0, must-revalidate', etag })
    s.end(body)
  })
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ base: 'http://localhost:' + server.address().port, hits, close: () => new Promise(c => server.close(c)) })))
}

export const DESK = { viewport: { width: 1366, height: 768 } }
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }

/* the press's own moment, read inside the page (the guide's §5: a response is timed from the press) — the click's or
   the Enter's own time stamp, the moment the browser received it, so a press the busy page heard late is counted whole
   (the first run's lesson: a watch started by a later call from here began only once the busy page let it in) */
export const PRESS = `(() => { const w = window; w.__tw = { press: null, done: null, want: null };
  addEventListener('click', e => { w.__tw.press = e.timeStamp }, true);
  addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') w.__tw.press = e.timeStamp }, true);
  const ready = p => {
    const s = document.getElementById('page-' + p)
    if (!s || !s.classList.contains('on') || s.hasAttribute('aria-busy')) return false
    if (document.querySelector('.pgclaw:not(.gone)')) return false
    if (p === 'viewsched' && !document.querySelector('#page-viewsched.on #vWeek .day')) return false
    return true
  };
  /* armed BEFORE the press: every frame from then on looks, as the readout's own stopwatch does */
  w.__tw.arm = p => { const gen = (w.__tw.gen = (w.__tw.gen || 0) + 1); w.__tw.done = null; w.__tw.press = null;
    const tick = () => { if (gen !== w.__tw.gen) return;
      if (w.__tw.press == null || !ready(p)) { requestAnimationFrame(tick); return }
      requestAnimationFrame(() => requestAnimationFrame(() => { if (gen === w.__tw.gen) w.__tw.done = Math.round(performance.now() - w.__tw.press) })) };
    requestAnimationFrame(tick) } })()`

export async function browserOf(kind = 'chromium', opts = {}) {
  const b = kind === 'webkit' ? webkit : chromium
  return b.launch({ headless: true, ...opts })
}
/** A fresh browser context (nothing kept from another scenario), its page, the errors it shows, and the developer protocol. */
export async function fresh(browser, size = DESK, { cpu = 1 } = {}) {
  const ctx = await browser.newContext({ ...size })
  await ctx.addInitScript(PRESS)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)) })
  let cdp = null
  if (browser.browserType().name() === 'chromium') {
    cdp = await ctx.newCDPSession(page)
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
  }
  return { ctx, page, errors, cdp }
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))
let shotN = 0
export function shotDir(sub) {
  const d = path.join(OUT, sub)
  fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); shotN = 0
  return d
}
export async function pic(page, dir, name, clip) {
  const f = path.join(dir, String(++shotN).padStart(2, '0') + '-' + name + '.png')
  await page.screenshot({ path: f, ...(clip ? { clip } : {}) })
  return path.relative(ROOT, f).replace(/\\/g, '/')
}

/* ---------------------------------------------------------------------------------------------------- the app */
export async function signIn(page, who = 'ad', lands = 'viewsched') {
  await page.waitForSelector('#luser', { state: 'visible', timeout: 120000 })
  await page.fill('#luser', who)
  await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await armOutside(page, lands)
  await page.click('#loginForm button[type=submit]')
}
/** The outside stopwatch: from the press (as the browser received it) to the second frame after the page is the one on
 *  screen, nothing loading over it — the speed plan's own end (§How it was measured), watched inside the page from
 *  before the press. For the week: its days drawn. Arm it, press, then read it. */
export const armOutside = (page, p) => page.evaluate(p => window.__tw.arm(p), p)
export async function outsideTime(page, _p, ms = 120000) {
  await page.waitForFunction(() => window.__tw.done != null, null, { timeout: ms, polling: 50 })
  return page.evaluate(() => window.__tw.done)
}
export async function openBy(page, p, door = 'top') {
  await armOutside(page, p)
  if (door === 'drawer') {
    await page.click('#burger')
    await page.waitForSelector('#drawer.open #drawerNav a[data-page="' + p + '"]', { state: 'visible' })
    await page.click('#drawerNav a[data-page="' + p + '"]')
  } else if (door === 'key') {
    await page.focus('#topnav a[data-page="' + p + '"]')
    await page.keyboard.press('Enter')
  } else await page.click('#topnav a[data-page="' + p + '"]')
}

/* ------------------------------------------------------------------------------------------------- the window */
export async function readout(page) {
  return page.evaluate(() => {
    const root = document.getElementById('timingRoot')
    const win = root && root.querySelector('.timingwin')
    const pill = root && root.querySelector('.timing-pill')
    const rows = win ? [...win.querySelectorAll('.tm-r')].map(r => {
      const sp = r.querySelector('span'), i = sp && sp.querySelector('i')
      return { label: (sp ? [...sp.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('') : '').trim(), tag: i ? i.textContent.trim() : '', value: (r.querySelector('b') || {}).textContent || '' }
    }) : []
    const box = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } }
    return { root: !!root, open: !!win, pill: pill ? pill.textContent : null, rows, win: box(win), pillBox: box(pill), empty: win ? [...win.querySelectorAll('.tm-empty')].map(e => e.textContent) : [] }
  })
}
export const row = (r, label) => r.rows.find(x => x.label === label)
export const pageRows = r => { const i = r.rows.findIndex(x => x.label === 'Sign in pressed → week shown'); const j = r.rows.findIndex(x => x.label === 'Brief freezes'); return r.rows.slice(i + 1, j) }
/** wait until the window has a page row more than `n` (the readout re-draws as a result is handed over) */
export async function waitRows(page, n, ms = 30000) {
  const t = Date.now()
  while (Date.now() - t < ms) { const r = await readout(page); if (pageRows(r).length > n) return r; await sleep(150) }
  return readout(page)
}
export async function openWindow(page) {
  const r = await readout(page)
  if (!r.open && r.pill != null) { await page.click('#timingRoot .timing-pill'); await page.waitForSelector('#timingRoot .timingwin') }
}
/** What lies on top at a point — a press there lands on it (the order's §6, a floating surface) */
export function topAt(page, x, y) {
  return page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); if (!e) return null; const w = e.closest('.floatwin, .timing-pill, .drawer, .modal, [role=dialog], #schedBoard, .save-band, .ssband, header, nav'); return (w ? (w.id || w.className.toString().split(' ').join('.')) : '') + ' > ' + e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').join('.') }, [x, y])
}

/* ------------------------------------------------------------------------------------------------- the fixture */
/** An ALL AVAIL line on Saturday (day 5 of the seeded week), made through the board's own controls — the everything
 *  day's own steps (fixture.mjs, the order's §7.1, §7.7): the demo week has none, so the week shows no "who's available"
 *  count to open ALL AVAIL from (chat 164's W19 (c), W20 two windows — the premise missed). The Timing window is folded
 *  while it is built (it stands over the board's corner) and opened again after. */
export async function allAvailDay(page, di = 5) {
  const { tap, type, put, board } = await import('./lib.mjs')
  const wasOpen = !!(await page.$('#timingRoot .timingwin'))
  if (wasOpen) await page.click('#timingRoot .timingwin .win-x')
  await board(page, di)
  await tap(page, `[data-padd="${di}"]`)
  await type(page, `[data-bfld="ap:${di}.0.prog"]`, 'FAMILY DAY')
  await type(page, `[data-bfld="ap:${di}.0.str"]`, '10:00')
  await type(page, `[data-bfld="ap:${di}.0.end"]`, '14:00')
  const got = await put(page, `[data-fill="a:${di}.0.+"]`, ['allavail'])
  await page.click('#sbDone'); await sleep(600)
  if (wasOpen && await page.$('#timingRoot .timing-pill')) await page.click('#timingRoot .timing-pill')
  return got
}
/** The Inputs page's calendar shown and an input bar in sight: the calendar opens on the computer's own month, the demo's
 *  inputs are in July 26 (the seeded week), so a month back at a time until one shows; null when none */
export async function inputBar(page) {
  if ((await page.getAttribute('#inCalBtn', 'aria-pressed').catch(() => null)) !== 'true') { await page.click('#inCalBtn'); await sleep(600) }
  for (let i = 0; i < 8; i++) {
    const bar = page.locator('#inpCal .ib-bar:visible').first()
    if (await bar.count()) return bar
    await page.click('#icPrev'); await sleep(500)
  }
  return null
}

/* --------------------------------------------------------------------------------------------------- reporting */
export const results = []
export function judge(id, ok, note) { const v = ok === null ? 'RECORD' : ok ? 'PASS' : 'FAIL'; results.push({ id, v, note }); console.log(`${v.padEnd(6)} ${id} — ${note}`) }
export function notWalked(id, why) { results.push({ id, v: 'NOT WALKED', note: why }); console.log(`NOT WALKED ${id} — ${why}`) }
export function saveResults(name) {
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(results, null, 1))
}
