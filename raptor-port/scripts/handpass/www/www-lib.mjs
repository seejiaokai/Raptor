/* www shared helpers v1 (16 Nov 26) — [WARN-WORDS-STANDALONE] (branch claude/warn-words-standalone), its FULL check's
   walk. Evidence: docs/handpass/2026-11-16-warn-words-standalone.md. Copied from the rules check's rcb2-lib.mjs and
   rcb2-w3-lib.mjs (15 Nov 26), its settings renamed.
   Each run is its OWN WORLD: a new browser and context, real storage (never ?fresh=1), the frozen build served from
   INSIDE the test browser (every request to http://localhost:4293 answered from the frozen folder, index.html the
   fallback) — no server, no port held, several walkers on one build (docs/walk-scripts.md §1, §8).
   Settings, read once at the top, before the shared driver loads:
     WWW_DIST    the frozen folder
     WWW_BUNDLE  its bundle's file name (refused if the page loads another)
     WWW_WHO     the walker's own picture folder name (host, w1, w2 …)
     WWW_RUN     the run's own sub-folder (default 'run') — one run, one folder (walk-scripts §5) */
import { mkdirSync, appendFileSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname, join } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
export const DIST = process.env.WWW_DIST ||
  'C:/Users/User/AppData/Local/Temp/claude/42b9573624e95a02/4c1797bb-9f38-4e6f-b517-4ac8dd7d50b9/scratchpad/frozen-43af4f5'
export const BUNDLE = process.env.WWW_BUNDLE || 'index-CCJFVavM.js'
process.env.HP_URL ||= 'http://localhost:4293'
export const WHO = process.env.WWW_WHO || 'host'
export const RUN = process.env.WWW_RUN || 'run'
process.env.HP_SHOTS ||= resolve(ROOT, 'docs/img/handpass/2026-11-16-warn-words-standalone', WHO, RUN)
export const L = await import('../lib.mjs')
export const SHOTS = L.SHOTS
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
mkdirSync(SHOTS, { recursive: true })
export const LOG = resolve(SHOTS, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
export const nrm = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const MON = 0, TUE = 1, WED = 2, THU = 3, FRI = 4, SAT = 5, SUN = 6, MAN = 'bane'

export const rows = []   // report rows: [scenario, size, did, expected, saw, verdict, pic]
export function row(sc, size, did, exp, saw, verdict, pic = '') {
  rows.push([sc, size, did, exp, saw, verdict, pic])
  say(`ROW ${verdict} | ${sc} | ${size} | ${did} | saw: ${String(saw).slice(0, 400)}`)
}
export function saveRows() { writeFileSync(SHOTS + '/rows.json', JSON.stringify(rows, null, 1)) }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

async function serveFrozen(ctx) {
  if (!existsSync(join(DIST, 'assets', BUNDLE))) throw new Error('frozen folder missing its bundle: ' + DIST)
  await ctx.route(L.BASE + '/**', async route => {
    const u = new URL(route.request().url())
    const p = decodeURIComponent(u.pathname)
    let f = join(DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
}

/** a fresh world: phone = iPhone 402×874 WebKit by touch; else desktop 1536×864 Chromium. who: 'a' admin, 'u' member */
export async function open({ phone = false, who = 'a' } = {}) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 } })
  await serveFrozen(ctx)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(L.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (!js.includes(BUNDLE)) throw new Error('not the frozen bundle: ' + js)
  return { browser, ctx, page, errors, phone, P: phone ? 'p' : 'd' }
}
export const pic = (w, name, loc) => L.shot(w.page, name, loc)
export async function fin(w) {
  say('errors', JSON.stringify(w.errors.slice(0, 8)))
  saveRows()
  try { await w.browser.close() } catch {}
  const p = rows.filter(r => r[5] === 'PASS').length, f = rows.filter(r => r[5] === 'FAIL').length
  say(`DONE ${p} PASS ${f} FAIL ${rows.length - p - f} OTHER of ${rows.length}`)
}

export async function press(w, sel, { nth = 0, after = null, scope = 'page' } = {}) {
  const page = w.page
  const q = sel.split(',').map(s => (scope === 'board' ? '#schedBoard ' : '') + s.trim() + ':visible').join(', ')
  const el = page.locator(q).nth(nth)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  const doIt = async () => { if (w.phone) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }) }
  try { await doIt() } catch {
    const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel)
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  if (after) { await sleep(60); await page.screenshot({ path: `${SHOTS}/${after}.png` }) }
  await sleep(300)
}
export async function typeIn(w, sel, value) {
  const page = w.page
  const inBoard = await page.locator('#schedBoard:visible').count()
  const q = (inBoard ? '#schedBoard ' : '') + sel + ':visible'
  const el = page.locator(q).first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(100)
  if (w.phone) await el.tap(); else await el.click()
  await el.fill('')
  if (String(value)) await el.type(String(value), { delay: 8 })
  await page.keyboard.press('Enter').catch(() => {})
  await el.blur().catch(() => {})
  await sleep(350)
}
export async function board(w, di) {
  const page = w.page
  const cur = await page.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) await closeBoard(w)
  await L.go(page, 'editsched')
  await press(w, `#eWeek [data-sbday="${di}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(500)
}
export async function closeBoard(w) {
  const page = w.page
  if (!(await page.locator('#schedBoard').count())) return
  const d = page.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first()
  if (await d.count()) { if (w.phone) await d.tap(); else await d.click() } else await page.keyboard.press('Escape')
  await sleep(600)
}
export async function addWave(w, di, kind = '') {
  const page = w.page
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, di)
  await press(w, `[data-wvadd="${di}"]`, { scope: 'board' })
  await press(w, `.wavemenu [data-wmkind="${kind}"]`)
  await page.waitForFunction(([i, n]) => window.DAYS[i].waves.length === n + 1, [di, n0])
  await sleep(300)
  return n0
}
export async function ensureRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.locator('#sbRoster:visible').count()) return
  const tab = page.locator('#schedBoard .ros-tab:visible').first()
  if (await tab.count()) { await tab.tap(); await sleep(400) }
}
export async function closeRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) { const tab = page.locator('#schedBoard .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(400) } }
}
/** arm a slot on the board and tap the man in the roster. returns 'ok' or why not */
export async function seat(w, slotSel, id) {
  const page = w.page
  await ensureRoster(w)
  let res = 'FAILED seat not armed'
  for (let t = 0; t < 3; t++) {
    await press(w, slotSel, { scope: 'board' }); await sleep(200)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); res = 'FAILED ' + id + ' not offered'; break }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
    try { if (w.phone) await p.tap({ timeout: 2500 }); else await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) { if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
    await sleep(400); res = 'ok'; break
  }
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await closeRoster(w)
  return res
}
/** a flight on the board of day di: a new wave, take-off / landing typed ('' leaves it blank), the man in the front
    seat; extra = more formation fields typed (msn …). returns the wave index */
export async function flight(w, di, to, ld, man = MAN, extra = {}) {
  const wi = await addWave(w, di, '')
  await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  for (const [k, v] of Object.entries(extra)) await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.${k}"]`, v)
  const s = await seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man)
  if (s !== 'ok') say('SEAT PROBLEM', di, wi, s)
  const f = await w.page.evaluate(([d, g]) => { const x = window.DAYS[d].waves[g].formations[0]; return { to: x.to, ld: x.ld, msn: x.msn, p: window.PEOPLE[x.aircraft[0].p]?.cs } }, [di, wi])
  say(`flight d${di} w${wi}`, JSON.stringify(f))
  return wi
}
/** the board's own warning lines (desktop #sbSide; phone folds behind [data-sbwtog]) */
export async function boardWarn(w) {
  const pg = w.page
  const tog = pg.locator('#schedBoard [data-sbwtog]:visible').first()
  if (await tog.count()) {
    const has = await pg.evaluate(() => !!document.querySelector('#schedBoard #sbWarn .wln'))
    if (has && !(await pg.locator('#schedBoard #sbWarn .wln:visible').count())) {
      await tog.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      if (w.phone) await tog.tap(); else await tog.click()
      await sleep(400)
    }
  }
  return pg.evaluate(() => {
    const side = document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard #sbSide')
    if (!side) return []
    const els = [...side.querySelectorAll('.wln, .witem')].filter(e => e.offsetWidth)
    if (els.length) return els.map(e => e.innerText.replace(/[\s\u00a0]+/g, ' ').trim()).filter(Boolean)
    return (side.innerText || '').split(/\r?\n/).map(s => s.replace(/\u00a0/g, ' ').trim()).filter(Boolean)
  })
}
/** the week strip of a day on a week root ('#eWeek' | '#vWeek'): opens it, reads .witem lines */
export async function weekWarn(w, root, di) {
  const pg = w.page
  const s = pg.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return { head: 'NO STRIP', items: [] }
  const head = nrm(await s.innerText())
  const open = await pg.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await s.tap(); else await s.click(); await sleep(400) }
  const items = await pg.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/[\s\u00a0]+/g, ' ').trim()), [root, di])
  return { head, items }
}
/** the day-details window from the day's own door on a week root; reads its issue lines; leaves it OPEN */
export async function dayDetails(w, root, di) {
  const pg = w.page
  const d = pg.locator(`${root} [data-dayinfo="${di}"]:visible`).first()
  if (!(await d.count())) return { ok: false, items: [], why: 'no door ' + root + ' ' + di }
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  if (w.phone) await d.tap(); else await d.click()
  await sleep(500)
  if (!(await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count())) return { ok: false, items: [], why: 'window did not open' }
  const items = await pg.evaluate(() => [...document.querySelectorAll('#dayPopBody .witem')].map(e => e.innerText.replace(/[\s\u00a0]+/g, ' ').trim()))
  return { ok: true, items }
}
export async function closeDayPop(w, how = 'done') {
  const pg = w.page
  if (!(await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count())) return 'not open'
  if (how === 'done') await press(w, '#dayPopDone')
  else if (how === 'x') await press(w, '#dayPopClose')
  else if (how === 'esc') { await pg.keyboard.press('Escape'); await sleep(400) }
  const still = await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count()
  return still ? 'STILL OPEN' : 'closed'
}
/** the forward "Breaks <day>" explanation on a day: tap the man's puck in the week, read the .wtr rows */
export async function trace(w, root, di, person = MAN) {
  const pg = w.page
  const p = pg.locator(`${root} .day[data-day="${di}"] .puck[data-person="${person}"]:visible`).first()
  if (!(await p.count())) return { items: [], why: 'no puck' }
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  if (w.phone) await p.tap(); else await p.click()
  await sleep(600)
  const items = await pg.evaluate(([q, i]) => [...document.querySelectorAll(`${q} .day[data-day="${i}"] .wtr`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/[\s\u00a0]+/g, ' ').trim()), [root, di])
  return { items }
}
