/* CHAT 20 — two questions for him, drawn on the real app (8 Nov 26). Nothing in the app is changed: every "proposed"
   picture is today's screen with ONE named change made in the page for the picture only.
   Q1 [the Tracker's magnifier]: the Tracker's search boxes draw a magnifier whose handle is shorter than the app's one
      magnifier (D1127: every search box looks like the Edit Schedule week's). Pictures: the Tracker's Find box today, the
      same box with the app's handle (the handle's line swapped in the page), Edit Schedule's search box for reference —
      cropped tight at 4x, desktop; and the phone's Find button and Find strip, today and matched.
   Q2 [TRK-NOSTORE-SAVED, D1660]: a browser that keeps nothing (its storage cannot even be touched — locked down, or
      private browsing): the app falls back to memory, so nothing survives a reload, yet the Tracker's corner says
      "● saved" and the top bar says nothing. Reproduced by making the page's localStorage throw on access. Pictures:
      today (the Tracker and Edit Schedule, desktop and phone, the corner marked) and a reload proving the mark is lost;
      option A — the app's own "Not saved" band (raised by a refused save, the nearest real state) with its words changed
      and Retry hidden, on the Tracker and Edit Schedule, desktop and phone, the corner silent as it already is while the
      band is up; option B — only the Tracker's corner, its words changed, in its own warning colour. The words for A and
      B are measured for a one-line fit at the iPhone's width, also in letters about a seventh wider.
   From raptor-port/:  WALK_DIR=<frozen dist> node scripts/handpass/trk-chat20-questions.mjs
   PAGE_ONLY=1 skips the pictures and only refills the questions page's pictures (each <img data-pic="NAME" src="…">).
   Version line: c20q v1. */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
console.log('c20q v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOTP = resolve(HERE, '..', '..')
const OUT = resolve(ROOTP, 'docs/img/handpass/2026-11-08-chat20-tracker/questions')
const PAGE = resolve(ROOTP, 'docs/mock/2026-11-08-chat20-tracker-questions.html')
mkdirSync(OUT, { recursive: true })

/* fill the page's pictures from the folder: every <img data-pic="NAME" src="…"> gets NAME.png as a data address */
function fillPage() {
  if (!existsSync(PAGE)) { console.log('page not written yet: ' + PAGE); return }
  let html = readFileSync(PAGE, 'utf8'); let n = 0; const missing = []
  html = html.replace(/<img data-pic="([^"]+)" src="[^"]*"/g, (all, name) => {
    const f = resolve(OUT, name + '.png')
    if (!existsSync(f)) { missing.push(name); return all }
    n++; return `<img data-pic="${name}" src="data:image/png;base64,${readFileSync(f).toString('base64')}"`
  })
  writeFileSync(PAGE, html)
  console.log(`page filled: ${n} pictures, ${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB` + (missing.length ? '; MISSING ' + missing.join(', ') : ''))
}
if (process.env.PAGE_ONLY) { fillPage(); process.exit(0) }

process.env.C9_RESULTS ||= resolve(tmpdir(), 'c20q-unused-results.json')
process.env.HP_URL ||= 'http://localhost:4391'
const L = await import('./trk-chat9-lib.mjs')
const { mkWorld, closeW, closeAll, geo, land, closePop, tapXY, limitOf, sleep, PHONE, PC } = L
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.error('set WALK_DIR to the frozen build folder'); process.exit(2) }
console.log('serving ' + WALK_DIR + ' at ' + L.BASE)

/* a browser whose storage cannot even be touched: reading localStorage throws (as a locked-down or private browser
   does), so the app's boot picks the memory store (storage/boot.ts chooseBackend) */
const LOCK_INIT = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } })`
let LOCK_NEXT = false
for (const e of ['chromium', 'webkit']) {
  const b = await L.browserFor(e, true, false); const orig = b.newContext.bind(b)
  b.newContext = async o => { const c = await orig(o); await serveFrozen(c, L.BASE); if (LOCK_NEXT) await c.addInitScript(LOCK_INIT); return c }
}
const world = async (opts, locked = false) => { LOCK_NEXT = locked; try { return await mkWorld({ ...opts, clock: CLOCK }) } finally { LOCK_NEXT = false } }

const CLOCK = '2026-11-08T09:00:00+08:00'
const M = { errors: {}, notes: [] }
const note = s => { M.notes.push(s); console.log(' · ' + s) }
const DESK = { size: PC, dpr: 2 }
const PHON = { size: PHONE, touch: true, engine: 'webkit', dpr: 2 }

const shot = async (w, name, clip) => {
  await sleep(350)
  await w.page.screenshot({ path: resolve(OUT, name + '.png'), animations: 'disabled', caret: 'hide', ...(clip ? { clip } : {}) })
  console.log(' pic ' + name)
}
const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }, sel)
/* a mark ON the element (an outline takes no room), never a box laid over the page */
const markOn = (page, sel, off = 3) => page.evaluate(([sel, off]) => {
  const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!e) throw new Error('premise gone: ' + sel)
  e.style.outline = '2px dashed #ff8a1c'; e.style.outlineOffset = off + 'px'; e.setAttribute('data-c20mark', '1')
}, [sel, off])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-c20mark]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = ''; e.removeAttribute('data-c20mark') }))
const topClip = async (w, extra) => { const g = await geo(w.page); const h = Math.min(g.vh, Math.ceil(limitOf(g) + extra)); return { x: 0, y: 0, width: g.vw, height: h } }
const scale = page => page.evaluate(() => window.visualViewport ? visualViewport.scale : 1)

async function toEditSchedule(w) {
  const p = w.page
  const tab = p.locator('#topnav a[data-page="editsched"]:visible')
  if (await tab.count()) await tab.click()
  else { await p.locator('#burger').tap(); await sleep(400); await p.locator('#drawer a[data-page="editsched"]').first().tap() }
  await p.waitForFunction(() => window.CURPAGE === 'editsched', null, { timeout: 15000 })
  await sleep(1500)
}
async function toTracker(w) { await L.navTracker(w.page) }

/* mark one event done, the way a person does: Find it, tap it, press DCO, Close */
async function markOne(w, code = 'ST-02') {
  const g = await land(w, code)
  if (!g.ball) throw new Error('event ' + code + ' not found')
  await tapXY(w, g.ball.x, g.ball.y); await sleep(1400)
  const b = w.page.locator('#pop .opts button[data-g="dco"]').first()
  if (w.touch) await b.tap(); else await b.click()
  await sleep(1000)
  await closePop(w); await sleep(600)
  /* a desktop's Find box keeps the code typed: empty it, so the bar reads as a person leaves it */
  if (!w.touch) { await L.typeFind(w.page, ''); await w.page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(400) }
  return grade(w.page, code)
}
const grade = (page, code) => page.evaluate(c => { try { return window.__undoForTests().grade(c) || '(none)' } catch (e) { return 'unread: ' + e.message } }, code)
const corner = page => page.evaluate(() => { const s = document.getElementById('saveStat'); if (!s) return null; const r = s.getBoundingClientRect(); return { text: s.textContent, hidden: s.hidden, shown: r.width > 0 && r.height > 0, cls: s.className, color: getComputedStyle(s).color, maxW: getComputedStyle(s).maxWidth, font: getComputedStyle(s).fontSize } })

/* ---------- Q2's words ---------- */
/* in the order preferred; the first that fits the phone in letters a seventh wider is drawn (run 1: the first three
   need ~380px there, the band gives ~374 less its sign and gaps) */
const A_WORDS = [
  ['This browser will not keep your work', 'a reload loses it'],
  ["This browser won't keep your work", 'a reload loses it'],
  ['This browser keeps nothing', 'a reload loses your work'],
  ['Not kept', 'this browser loses your work on a reload'],
  ['Lost on a reload', 'this browser keeps nothing'],
  ["This browser won't keep work", 'a reload loses it'],
]
const B_WORDS = ['● kept until a reload', '● lost on a reload', '● lost on reload', '● not kept']

/* option A: the "Not saved" band's own strip, its words changed and Retry hidden (Retry cannot help: nothing failed) */
const applyA = (page, [lead, rest]) => page.evaluate(([lead, rest]) => {
  const band = [...document.querySelectorAll('.topbar > .savestat.failed')].find(e => e.getBoundingClientRect().height > 0)
  if (!band) return { ok: false }
  band.querySelector('.sv-msg b').textContent = lead
  band.querySelector('.sv-rest').textContent = rest
  const btn = band.querySelector('button'); if (btn) btn.style.display = 'none'
  const msg = band.querySelector('.sv-msg'), r = band.querySelector('.sv-rest'), b = band.querySelector('.sv-msg b')
  const br = band.getBoundingClientRect()
  return { ok: true, fits: !(msg.scrollWidth > msg.clientWidth + 0.5) && !(r.scrollWidth > r.clientWidth + 0.5),
    needs: Math.round(b.scrollWidth + r.scrollWidth + 16 + 18), room: Math.round(msg.clientWidth + (msg.scrollWidth > msg.clientWidth ? 0 : 0)),
    restCut: r.scrollWidth > r.clientWidth + 0.5, bandW: Math.round(br.width), bandH: Math.round(br.height), font: getComputedStyle(msg).fontSize }
}, [lead, rest])
const aStill = (page, lead) => page.evaluate(lead => { const b = [...document.querySelectorAll('.topbar > .savestat.failed .sv-msg b')].find(e => e.getBoundingClientRect().height > 0); return !!b && b.textContent === lead }, lead)
/* option B: the corner's words, in its own warning class ('saving' — the orange it uses for chart edits not yet saved) */
const applyB = (page, words) => page.evaluate(words => {
  const s = document.getElementById('saveStat'); if (!s) return { ok: false }
  s.hidden = false; s.textContent = words; s.title = 'This browser will not keep your work: a reload loses it'; s.className = 'savestat saving'
  const r = s.getBoundingClientRect()
  return { ok: true, fits: !(s.scrollWidth > s.clientWidth + 0.5), needs: s.scrollWidth, room: Math.round(r.width), cap: getComputedStyle(s).maxWidth, color: getComputedStyle(s).color }
}, words)

async function bandUp(w) {
  for (let i = 0; i < 20; i++) { if (await vis(w.page, '.topbar > .savestat.failed')) return true; await sleep(500) }
  return false
}
const keepErrors = (w, tag) => { M.errors[tag] = w.errors.slice(); if (w.errors.length) console.log(' errors ' + tag + ': ' + w.errors.join(' | ')) }

/* ============ Q1 — the magnifier ============ */
const TRK_D = 'm20 20-3.5-3.5', APP_D = 'm21 21-4.3-4.3'
const swapHandle = (page, d) => page.evaluate(d => { const ps = [...document.querySelectorAll('#page-tracker .srchglyph path')]; ps.forEach(p => p.setAttribute('d', d)); return ps.length }, d)
const glyphFacts = (page, sel) => page.evaluate(sel => { const s = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!s) return null; const r = s.getBoundingClientRect(); const p = s.querySelector('path'); return { w: r.width, h: r.height, d: p && p.getAttribute('d'), color: getComputedStyle(s).color } }, sel)
const boxClip = (box, glyph, pad = 6, tail = 46) => ({ x: Math.max(0, box.l - pad), y: Math.max(0, box.t - pad), width: Math.round(glyph.r - box.l + tail + pad), height: Math.round(box.h + 2 * pad) })

{ /* desktop, 4x */
  const w = await world({ size: PC, dpr: 4 })
  try {
    const p = w.page
    const box = await vis(p, '#page-tracker header .findbox'), gl = await vis(p, '#page-tracker header .findbox .srchglyph')
    if (!box || !gl) throw new Error('premise: the Tracker\'s Find box is not in its bar')
    M.q1 = { trk: await glyphFacts(p, '#page-tracker header .findbox .srchglyph') }
    await markOn(p, '#page-tracker header .findbox', 2)
    await shot(w, 'q1-d-where', { x: Math.min(Math.max(0, box.l - 260), PC.width - 600), y: Math.max(0, box.t - 10), width: 600, height: Math.round(box.h + 20) })
    await unmark(p)
    const clip = boxClip(box, gl)
    await shot(w, 'q1-d-trk-today', clip)
    const n = await swapHandle(p, APP_D); note(`Q1 desktop: the app's handle swapped into ${n} Tracker magnifiers in the page`)
    if (!n || (await glyphFacts(p, '#page-tracker header .findbox .srchglyph')).d !== APP_D) throw new Error('premise: the swap did not land')
    await shot(w, 'q1-d-trk-matched', clip)
    await swapHandle(p, TRK_D)
    await toEditSchedule(w)
    const ebox = await vis(p, '.searchbox:has(#searchE)'), egl = await vis(p, '.searchbox:has(#searchE) svg')
    if (!ebox || !egl) throw new Error('premise: Edit Schedule\'s search box not found')
    M.q1.es = await glyphFacts(p, '.searchbox:has(#searchE) svg')
    M.q1.esBoxH = ebox.h; M.q1.trkBoxH = box.h
    await shot(w, 'q1-d-es-ref', boxClip(ebox, egl))
    const u = x => x.w / 24
    M.q1.handlePx = { trk: +(3.5 * Math.SQRT2 * u(M.q1.trk)).toFixed(2), app: +(4.3 * Math.SQRT2 * u(M.q1.es)).toFixed(2), appAtTrkSize: +(4.3 * Math.SQRT2 * u(M.q1.trk)).toFixed(2) }
    note('Q1 handle length on screen (px): ' + JSON.stringify(M.q1.handlePx) + '; Tracker glyph ' + M.q1.trk.w + 'px, Edit Schedule glyph ' + M.q1.es.w + 'px')
  } catch (e) { note('Q1 desktop NOTRUN: ' + String(e.message).split('\n')[0]) }
  keepErrors(w, 'q1-desktop'); await closeW(w)
}
{ /* phone, 4x for the close-up */
  const w = await world({ ...PHON, dpr: 4 })
  try {
    const p = w.page
    const btn = await vis(p, '#hSearchBtn')
    if (!btn) throw new Error('premise: the phone\'s Find button is not in the bar')
    const bclip = { x: Math.max(0, btn.l - 8), y: Math.max(0, btn.t - 8), width: Math.round(btn.w + 16), height: Math.round(btn.h + 16) }
    await shot(w, 'q1-p-btn-today', bclip)
    /* open the Find strip without its box taking the keyboard: a focused box under 16px zooms an emulated phone */
    await p.evaluate(() => { window.__f = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function () {}; document.getElementById('hSearchBtn').click() })
    await sleep(700); await p.evaluate(() => { HTMLElement.prototype.focus = window.__f })
    const box = await vis(p, '#hSearchPanel .findbox'), gl = await vis(p, '#hSearchPanel .findbox .srchglyph')
    if (!box || !gl) throw new Error('premise: the Find strip did not open')
    M.q1p = { scale: await scale(p), glyph: await glyphFacts(p, '#hSearchPanel .findbox .srchglyph') }
    note('Q1 phone: the page\'s zoom with the strip open ' + M.q1p.scale)
    const sclip = boxClip(box, gl, 6, 30)
    await shot(w, 'q1-p-strip-today', sclip)
    await swapHandle(p, APP_D)
    await shot(w, 'q1-p-strip-matched', sclip)
    await shot(w, 'q1-p-btn-matched', bclip)
  } catch (e) { note('Q1 phone NOTRUN: ' + String(e.message).split('\n')[0]) }
  keepErrors(w, 'q1-phone'); await closeW(w)
}

/* ============ Q2 — a browser that keeps nothing ============ */
async function q2Locked(tag, opts) {
  const w = await world(opts, true)
  const out = {}
  try {
    const p = w.page
    out.premise = await p.evaluate(() => { try { void window.localStorage; return 'readable' } catch (e) { return 'throws ' + e.name } })
    if (!/throws/.test(out.premise)) throw new Error('premise: localStorage is readable')
    out.before = await corner(p)
    out.gradeBefore = await grade(p, 'ST-02')
    out.ballAfterMark = await markOne(w)
    out.after = await corner(p)
    note(`Q2 ${tag} locked: storage ${out.premise}; the corner before "${out.before && out.before.text}", after a mark "${out.after && out.after.text}" (${out.after && out.after.color})`)
    out.band = !!(await vis(p, '.topbar > .savestat.failed')); out.saving = !!(await vis(p, '.topbar > .savestat:not(.failed)'))
    note(`Q2 ${tag} locked: a band on the top bar: ${out.band}; a "Saving…" note: ${out.saving}`)
    out.scale = await scale(p); if (out.scale !== 1) note(`Q2 ${tag} locked: the page is zoomed ${out.scale} before its pictures`)
    const clip = await topClip(w, opts.touch ? 110 : 80)
    if (out.after && out.after.shown) await markOn(p, '#saveStat', 3)
    await shot(w, `q2-${tag}-trk-today`, clip)
    await unmark(p)
    /* option B — the corner alone */
    out.B = []
    for (const words of B_WORDS) out.B.push({ words, ...(await applyB(p, words)) })
    const pick = out.B.find(b => b.fits) || out.B[out.B.length - 1]
    out.Bpick = pick.words
    await applyB(p, out.Bwords || B_PICK || pick.words)
    await markOn(p, '#saveStat', 3)
    await shot(w, `q2-${tag}-trk-B`, clip)
    await unmark(p)
    note(`Q2 ${tag} B: ` + out.B.map(b => `"${b.words}" ${b.fits ? 'fits' : 'CUT'} (${b.needs}px in ${b.room}px, cap ${b.cap})`).join('; '))
    /* Edit Schedule today: the top bar says nothing */
    await toEditSchedule(w)
    out.esBand = !!(await vis(p, '.topbar > .savestat.failed'))
    await shot(w, `q2-${tag}-es-today`, await topClip(w, opts.touch ? 150 : 120))
    /* the reload: everything is gone */
    await p.reload(); await L.login(p, 'a'); await toTracker(w)
    await sleep(800)
    out.ballAfterReload = await grade(p, 'ST-02')
    out.cornerAfterReload = await corner(p)
    note(`Q2 ${tag} reload: ST-02's grade before "${out.gradeBefore}", after the mark "${out.ballAfterMark}" → after a reload "${out.ballAfterReload}"; the corner then "${out.cornerAfterReload && out.cornerAfterReload.text}"`)
  } catch (e) { note(`Q2 ${tag} locked NOTRUN: ` + String(e.message).split('\n')[0]) }
  keepErrors(w, `q2-${tag}-locked`); await closeW(w)
  return out
}
async function q2BandA(tag, opts) {
  const w = await world({ ...opts, fail: true })
  const out = {}
  try {
    const p = w.page
    await p.evaluate(() => { window.__failSaves = true })
    await markOne(w)
    if (!(await bandUp(w))) throw new Error('premise: the band did not come up')
    out.cornerWithBand = await corner(p)
    out.scale = await scale(p); if (out.scale !== 1) note(`Q2 ${tag} band: the page is zoomed ${out.scale} before its pictures`)
    out.A = []
    for (const words of A_WORDS) out.A.push({ words: words.join(' · '), ...(await applyA(p, words)) })
    const pick = A_PICK || (out.A.find(a => a.fits) ? A_WORDS[out.A.findIndex(a => a.fits)] : A_WORDS[A_WORDS.length - 1])
    out.Apick = pick.join(' · ')
    note(`Q2 ${tag} A: ` + out.A.map(a => `"${a.words}" ${a.fits ? 'fits' : 'CUT'} (needs ~${a.needs}px, band ${a.bandW}×${a.bandH}, ${a.font})`).join('; '))
    note(`Q2 ${tag} A: the corner while the band is up: "${out.cornerWithBand && out.cornerWithBand.text}" shown=${out.cornerWithBand && out.cornerWithBand.shown}`)
    if (opts.wide) {
      const clip = await topClip(w, 70)
      await applyA(p, pick); if (!(await aStill(p, pick[0]))) throw new Error('premise: A words gone before the picture')
      await markOn(p, '.topbar > .savestat.failed', -3)
      await shot(w, `q2-${tag}-trk-A`, clip); await unmark(p)
      out.B = []
      for (const words of B_WORDS) out.B.push({ words, ...(await applyB(p, words)) })
      note(`Q2 ${tag} B (wide letters): ` + out.B.map(b => `"${b.words}" ${b.fits ? 'fits' : 'CUT'} (${b.needs}px in ${b.room}px)`).join('; '))
    } else {
      const clip = await topClip(w, opts.touch ? 110 : 80)
      await applyA(p, pick); if (!(await aStill(p, pick[0]))) throw new Error('premise: A words gone before the picture')
      await markOn(p, '.topbar > .savestat.failed', -3)
      await shot(w, `q2-${tag}-trk-A`, clip); await unmark(p)
      await toEditSchedule(w)
      if (!(await bandUp(w))) throw new Error('premise: the band left on Edit Schedule')
      await applyA(p, pick); if (!(await aStill(p, pick[0]))) throw new Error('premise: A words gone on Edit Schedule')
      await markOn(p, '.topbar > .savestat.failed', -3)
      await shot(w, `q2-${tag}-es-A`, await topClip(w, opts.touch ? 150 : 120)); await unmark(p)
    }
  } catch (e) { note(`Q2 ${tag} A NOTRUN: ` + String(e.message).split('\n')[0]) }
  keepErrors(w, `q2-${tag}-band`); await closeW(w)
  return out
}

/* the words are chosen from the phone's measures in letters about a seventh wider (his iPhone draws wider letters than
   the test browser): the first wording that fits there is drawn everywhere */
let A_PICK = null, B_PICK = null
M.wide = await q2BandA('pw', { ...PHON, wide: true })
if (M.wide.A) { const i = M.wide.A.findIndex(a => a.fits); A_PICK = A_WORDS[i >= 0 ? i : A_WORDS.length - 1] }
if (M.wide.B) { const b = M.wide.B.find(b => b.fits); B_PICK = b ? b.words : null }
note('drawn: A "' + (A_PICK || []).join(' · ') + '"; B "' + B_PICK + '"')
M.dLocked = await q2Locked('d', DESK)
M.pLocked = await q2Locked('p', PHON)
M.dBand = await q2BandA('d', DESK)
M.pBand = await q2BandA('p', PHON)
M.picked = { A: A_PICK, B: B_PICK }

await closeAll()
writeFileSync(resolve(OUT, 'measure.json'), JSON.stringify(M, null, 1))
const errN = Object.values(M.errors).reduce((n, e) => n + e.length, 0)
console.log(`done; console or page errors seen: ${errN}`)
fillPage()
