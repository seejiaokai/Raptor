// THE LEAVE WAR SMALL FIXES — the WALK (4 Nov 26): the number pad's figure box, the failed-download card, the spoken claw.
// Drives the real built app (served on :4173) through its own controls: taps on cells and keys, the top bar's Undo, the
// menu on a phone, the tabs on a desktop. window.go() is never used. Every check prints PASS / FAIL / NOT WALKED with the
// values it measured; every picture is named in the result. Self-contained (no shared kit).
// Run from raptor-port/: node scripts/handpass/lwsf-walk.mjs
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../docs/img/handpass/2026-11-04-lw-small-fixes-walk')
const RES = join(HERE, '../../docs/handpass/parts/lwsf-walk.txt')
const URL = 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }); mkdirSync(dirname(RES), { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const lines = []
const flush = () => writeFileSync(RES, lines.join('\n') + '\n')
const L = s => { lines.push(s); console.log(s); flush() }
L('lwsf-walk v1 — ' + new Date().toISOString() + ' — build served at ' + URL)
const check = (id, ok, note) => L(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`)
const notWalked = (id, note) => L(`NOT WALKED ${id}: ${note}`)
const info = (id, note) => L(`INFO ${id}: ${note}`)
const J = v => JSON.stringify(v)

const PH_UP = { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const PH_SIDE = { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

const allT = []
function watch(page, tag, refusal) {
  const T = { tag, refusal: !!refusal, pe: [], ce: [], http: [], failed: [], lw: 0, tr: 0, fetchRoot: [] }
  page.on('pageerror', e => T.pe.push(String(e.message).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') T.ce.push(m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) T.http.push(r.status() + ' ' + r.url()) })
  page.on('requestfailed', r => T.failed.push(r.url() + ' ' + (r.failure()?.errorText || '')))
  page.on('request', r => {
    const u = r.url()
    if (/assets\/LeaveWarPage-.*\.js/.test(u)) T.lw++
    if (/assets\/TrackerPage-.*\.js/.test(u)) T.tr++
    if (u === URL && r.resourceType() === 'fetch') T.fetchRoot.push(u)
  })
  allT.push(T)
  return T
}

/* a context whose Leave War and Tracker files can be refused or slowed at will (the flags are read at each request) */
async function mk(type, opts, tag, refusal) {
  const ctx = await type.newContext(opts)
  const G = { lw: false, tr: false, slowLw: 0 }
  const handler = key => async r => {
    try {
      if (G[key === 'lw' ? 'lw' : 'tr']) return await r.abort('internetdisconnected')
      if (key === 'lw' && G.slowLw) await sleep(G.slowLw)
      await r.continue()
    } catch { /* the page went first */ }
  }
  await ctx.route('**/assets/LeaveWarPage-*.js', handler('lw'))
  await ctx.route('**/assets/TrackerPage-*.js', handler('tr'))
  await ctx.addInitScript(() => {
    try {
      new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('pgclaw')) (window.__claws ||= []).push(Math.round(performance.now())) }).observe(document, { childList: true, subtree: true })
    } catch { /* no document yet */ }
  })
  const page = await ctx.newPage()
  const touch = !!opts.hasTouch
  const T = watch(page, tag, refusal)
  return { ctx, page, G, T, touch }
}
const login = async (p, u = 'ad', pw = 'a') => {
  await p.goto(URL)
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(400)
}
const press = async (w, sel) => { const l = w.page.locator(sel).first(); await (w.touch ? l.tap() : l.click()) }
const tapS = async (w, sel, ms = 650) => { await press(w, sel); await sleep(ms) }
/* the app's own routes: ☰ then the menu's line on a phone, the top bar's tab on a desktop */
async function nav(w, p) {
  if (await w.page.locator('#burger').isVisible()) {
    await w.page.locator('#burger').tap(); await w.page.waitForSelector('#drawer.open', { timeout: 5000 }); await sleep(250)
    await w.page.locator(`#drawerNav a[data-page="${p}"]`).tap()
  } else {
    await press(w, `a[data-page="${p}"]:visible`)
  }
  await sleep(300)
}
const shot = async (page, name, clip) => { await page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); L('  picture ' + name + '.png') }
async function scenario(id, fn) {
  try { await fn() } catch (e) { L(`FAIL ${id}: the script stopped — ${String(e.message).split('\n')[0].slice(0, 240)}`) }
}

/* ============================ THE PAD ============================ */
const P25 = 'req-p-2026-02-25', W25 = 'req-w-2026-02-25', P26 = 'req-p-2026-02-26'
const bring = async (p, tid) => { await p.evaluate(t => document.querySelector(`[data-testid="${t}"]`).scrollIntoView({ block: 'center', inline: 'center' }), tid); await sleep(350) }
const cellText = (p, tid) => p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e ? e.textContent.trim() : null }, tid)
async function toGrid(w) {
  const p = w.page
  await nav(w, 'leavewar')
  await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: 15000 }); await sleep(500)
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  if (await p.locator('[data-testid="month-FEB"]').count()) await tapS(w, '[data-testid="month-FEB"]')
  if (!(await p.locator('[data-testid^="req-p-"]').count()) && await p.locator('[data-testid="counts-toggle"]').count()) await tapS(w, '[data-testid="counts-toggle"]')
}
async function openOn(w, tid) {
  await bring(w.page, tid)
  await press(w, `[data-testid="${tid}"]`)
  await w.page.locator('[data-testid="fly-pad"]').waitFor({ timeout: 5000 }); await sleep(450)
}
const key = (w, k, ms = 650) => tapS(w, `[data-testid="fly-pad-${k}"]`, ms)
const closePad = async w => { await key(w, 'done', 500); await w.page.locator('[data-testid="fly-pad"]').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {}) }
const MEASURE = () => {
  const q = s => document.querySelector(s)
  const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: +b.left.toFixed(2), t: +b.top.toFixed(2), r: +b.right.toFixed(2), b: +b.bottom.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) } }
  const fig = q('[data-testid="fly-pad-fig"]'), cell = q('[data-testid="fly-edit-touch"]'), day = q('.flypad-day')
  const sel = fig && fig.querySelector('.flysel'), car = fig && fig.querySelector('.flycaret')
  const cs = cell ? getComputedStyle(cell, '::after') : null
  return {
    figText: fig ? fig.textContent : null, figSel: !!sel, figSelText: sel ? sel.textContent : null, caret: !!car,
    caretW: car ? +car.getBoundingClientRect().width.toFixed(2) : null, caretAnim: car ? getComputedStyle(car).animationName : null,
    cellText: cell ? cell.textContent : null, cellSelected: cell ? cell.classList.contains('selected') : null, cellHasSel: !!(cell && cell.querySelector('.flysel')),
    cellAfter: cs ? { content: cs.content, display: cs.display, opacity: cs.opacity, visibility: cs.visibility } : null,
    strip: q('.flypad-hd b') ? q('.flypad-hd b').textContent : null, day: day ? day.textContent : null,
    rects: { fig: R(fig), day: R(day), prev: R(q('[data-testid="fly-pad-prev"]')), next: R(q('[data-testid="fly-pad-next"]')), done: R(q('[data-testid="fly-pad-done"]')), pad: R(q('[data-testid="fly-pad"]')), cell: R(cell) },
    vw: window.innerWidth, vh: window.innerHeight, padUp: !!q('[data-testid="fly-pad"]'),
  }
}
const M = p => p.evaluate(MEASURE)
const hidden = a => !a || a.content === 'none' || a.display === 'none' || a.opacity === '0' || a.visibility === 'hidden'
const ov = (a, b) => a && b && a.l < b.r - 0.5 && a.r > b.l + 0.5 && a.t < b.b - 0.5 && a.b > b.t + 0.5

/* the shared opening: stage 25 Feb Req P = 7 through the pad (tap cell, 7, Done), then 26 Feb = 4 by › */
async function stage(w, tag) {
  await toGrid(w)
  await openOn(w, P25)
  await key(w, 7); await closePad(w)
  const a = await cellText(w.page, P25)
  check(`stage[${tag}]`, a === '7', `25 Feb Req P read '${a}' after tap cell, 7, Done`)
}
async function stage26(w, tag) {
  await openOn(w, P25)
  await key(w, 'next'); await key(w, 4); await closePad(w)
  const b = await cellText(w.page, P26)
  check(`stage26[${tag}]`, b === '4', `26 Feb Req P read '${b}' after open 25, ›, 4, Done`)
}
async function S1S2(w, tag, states) {
  const p = w.page
  /* S1 — reopen on the staged cell */
  await bring(p, P25)
  await press(w, `[data-testid="${P25}"]`)
  const t1 = Date.now()
  await p.screenshot({ path: join(OUT, `S1-${tag}-100ms.png`) })
  const dt = Date.now() - t1
  L(`  picture S1-${tag}-100ms.png (screenshot began the moment the tap returned, took ${dt} ms)`)
  const early = await M(p)
  await p.locator('[data-testid="fly-pad"]').waitFor({ timeout: 5000 }); await sleep(600)
  const m = await M(p); states?.push(['open', m])
  await shot(p, `S1-${tag}-settled`)
  check(`S1[${tag}]`, m.figSelText === '7' && !m.caret && m.cellSelected === true && m.cellText === '7' && m.cellHasSel,
    `box '${m.figText}' in .flysel='${m.figSelText}', caret=${m.caret}; cell text '${m.cellText}', class selected=${m.cellSelected}, cell .flysel=${m.cellHasSel}; at ~${dt}ms picture the box read '${early.figText}' (sel=${early.figSel}, caret=${early.caret})`)
  check(`S1b[${tag}] cell caret hidden while highlighted`, hidden(m.cellAfter), `cell ::after ${J(m.cellAfter)}`)
  /* S2 */
  await key(w, 9)
  const m9 = await M(p); states?.push(['typed9', m9])
  await shot(p, `S2-${tag}-typed9`)
  check(`S2a[${tag}] tap 9`, m9.figText === '9' && m9.caret && !m9.figSel && m9.cellText === '9' && m9.cellSelected === false && m9.caretW > 0,
    `box '${m9.figText}', caret=${m9.caret} (width ${m9.caretW}), sel=${m9.figSel}; cell '${m9.cellText}', selected=${m9.cellSelected}; caret animation '${m9.caretAnim}'; cell ::after ${J(m9.cellAfter)}`)
  info(`S2a[${tag}]`, `cell's thin caret while not highlighted: ${hidden(m9.cellAfter) ? 'NOT drawn' : 'drawn'} (${J(m9.cellAfter)})`)
  await key(w, 2)
  const m92 = await M(p); states?.push(['typed92', m92])
  await shot(p, `S2-${tag}-typed92`)
  check(`S2b[${tag}] tap 2`, m92.figText === '92' && m92.caret && m92.cellText === '92', `box '${m92.figText}', caret=${m92.caret}; cell '${m92.cellText}'`)
  await closePad(w)
  const g = await cellText(p, P25)
  check(`S2c[${tag}] Done keeps 92`, g === '92', `grid cell read '${g}'`)
  await openOn(w, P25)
  const mo = await M(p)
  check(`S2d[${tag}] reopen highlighted`, mo.figSelText === '92' && mo.cellSelected, `box '${mo.figText}' sel='${mo.figSelText}', cell selected=${mo.cellSelected}`)
  const t0 = Date.now()
  for (const k of [1, 2, 3]) await p.locator(`[data-testid="fly-pad-${k}"]`).tap()
  const el = Date.now() - t0
  await sleep(300)
  const mq = await M(p); states?.push(['typed123', mq])
  await shot(p, `S2-${tag}-quick123`)
  check(`S2e[${tag}] 1,2,3 within one second`, el < 1000 && mq.figText === '123' && mq.cellText === '123' && mq.caret, `three taps took ${el} ms; box '${mq.figText}', cell '${mq.cellText}', caret=${mq.caret}`)
}

async function padWalk(opts, tag) {
  const w = await mk(browser, opts, `pad-${tag}`)
  const states = []
  const p = w.page
  await login(p)
  await stage(w, tag)
  await stage26(w, tag)
  /* S1 + S2 leave the pad open on 25 Feb with 123 typed */
  await S1S2(w, tag, states)
  await closePad(w)
  const v123 = await cellText(p, P25)
  /* S3 — ⌫ until empty */
  await openOn(w, P25)
  for (let i = 0; i < 4; i++) { const mm = await M(p); if (mm.figText === '') break; await key(w, 'back', 350) }
  const me = await M(p); states.push(['empty', me])
  await shot(p, `S3-${tag}-empty`)
  check(`S3a[${tag}] emptied`, me.figText === '' && me.caret && !me.figSel && me.caretW > 0, `box text '${me.figText}', caret=${me.caret} (width ${me.caretW}), sel=${me.figSel}; cell '${me.cellText}'`)
  await closePad(w)
  const after = await cellText(p, P25)
  await shot(p, `S3-${tag}-after-done`)
  check(`S3b[${tag}] Done on empty`, after !== v123, `grid cell read '${after}' (before '${v123}')`)
  const undo = p.locator('button[aria-label="Undo"]:visible').first()
  const undoOn = await undo.isEnabled().catch(() => false)
  await (w.touch ? undo.tap() : undo.click()); await sleep(700)
  const back = await cellText(p, P25)
  await shot(p, `S3-${tag}-after-undo`)
  check(`S3c[${tag}] Undo puts the figure back`, back === v123, `Undo enabled=${undoOn}; grid cell read '${back}', expected '${v123}'`)
  /* S4 */
  await openOn(w, P25)
  const m0 = await M(p)
  await key(w, 'next')
  const mn = await M(p); states.push(['next', mn])
  const nextCell = await cellText(p, P26)
  await shot(p, `S4-${tag}-next`)
  check(`S4a[${tag}] › shows the next day's own figure highlighted`, mn.day !== m0.day && mn.figSel && mn.figSelText === nextCell && mn.cellSelected, `day '${m0.day}' -> '${mn.day}'; box '${mn.figText}' sel=${mn.figSel}; the day's grid cell reads '${nextCell}'; cell selected=${mn.cellSelected}`)
  await key(w, 'prev')
  const mp = await M(p); states.push(['prev', mp])
  await shot(p, `S4-${tag}-prev`)
  check(`S4b[${tag}] ‹ back`, mp.day === m0.day && mp.figSel && mp.figSelText === m0.figText, `day '${mp.day}', box '${mp.figText}' sel=${mp.figSel} (was '${m0.figText}')`)
  /* S5 — tap the box itself */
  const b5 = await M(p)
  const c = { x: (b5.rects.fig.l + b5.rects.fig.r) / 2, y: (b5.rects.fig.t + b5.rects.fig.b) / 2 }
  const hit = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? !!e.closest('[data-testid="fly-pad-fig"]') : false }, c)
  await p.touchscreen.tap(c.x, c.y); await sleep(700)
  const a5 = await M(p)
  await shot(p, `S5-${tag}-after-box-tap`)
  check(`S5[${tag}] a tap on the box changes nothing`, hit && a5.padUp && a5.figText === b5.figText && a5.figSel === b5.figSel && a5.caret === b5.caret && a5.day === b5.day && a5.cellText === b5.cellText,
    `the tap point (${c.x.toFixed(0)},${c.y.toFixed(0)}) landed on the box: ${hit}; before '${b5.figText}'/sel ${b5.figSel}/caret ${b5.caret}, after '${a5.figText}'/sel ${a5.figSel}/caret ${a5.caret}; pad still up=${a5.padUp}; day '${a5.day}'`)
  /* S6 — a tap on the Req W cell with the pad up */
  await key(w, 5)
  const pre = await M(p)
  let placed = null
  for (const block of ['center', 'start', 'end']) {
    await p.evaluate(({ t, block }) => document.querySelector(`[data-testid="${t}"]`).scrollIntoView({ block, inline: 'center' }), { t: W25, block }); await sleep(450)
    placed = await p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); const b = e.getBoundingClientRect(); const x = (b.left + b.right) / 2, y = (b.top + b.bottom) / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h) || h.contains(e)) && !h.closest('.flypad'), over: h ? (h.className || h.tagName) + '' : null } }, W25)
    if (placed.ok) break
  }
  if (!placed.ok) {
    await shot(p, `S6-${tag}-cell-covered`)
    notWalked(`S6[${tag}]`, `the Req W cell could not be reached with the pad up: the point (${placed.x.toFixed(0)},${placed.y.toFixed(0)}) is covered by '${placed.over}' in every scroll position tried`)
  } else {
    await p.touchscreen.tap(placed.x, placed.y); await sleep(900)
    const m6 = await M(p)
    const pv = await cellText(p, P25)
    await shot(p, `S6-${tag}-on-reqW`)
    check(`S6[${tag}] the pad moves to Req W and the first figure is saved`, m6.padUp && /W/.test(m6.strip || '') && pv === '5', `strip '${m6.strip}', day '${m6.day}', box '${m6.figText}'; before the tap the box read '${pre.figText}'; Req P cell now reads '${pv}'`)
  }
  await closePad(w)
  /* S7 — geometry in every state */
  s7(tag, states)
  /* the page's own errors */
  await w.ctx.close()
  return states
}

function s7(tag, states) {
  const dl = [], mids = [], bad = []
  let drops = 0, overl = 0
  for (const [name, m] of states) {
    const r = m.rects
    if (!r.fig || !r.done) { bad.push(name + ': a box missing'); continue }
    dl.push(r.done.l)
    mids.push(Math.abs((r.fig.t + r.fig.b) / 2 - (r.day.t + r.day.b) / 2))
    const inside = r.fig.l >= r.pad.l - 0.5 && r.fig.r <= r.pad.r + 0.5 && r.fig.t >= r.pad.t - 0.5 && r.fig.b <= r.pad.b + 0.5 && r.fig.l >= -0.5 && r.fig.r <= m.vw + 0.5 && r.fig.t >= -0.5 && r.fig.b <= m.vh + 0.5
    if (!inside) bad.push(`${name}: box outside (${J(r.fig)} pad ${J(r.pad)} screen ${m.vw}x${m.vh})`)
    if (r.fig.t >= r.day.b - 1) drops++
    if (ov(r.fig, r.prev) || ov(r.fig, r.next) || ov(r.fig, r.done) || ov(r.fig, r.day)) overl++
  }
  const spread = Math.max(...dl) - Math.min(...dl)
  const mid = Math.max(...mids)
  check(`S7a[${tag}] Done's left edge across ${states.length} states`, spread <= 0.5, `min ${Math.min(...dl)}, max ${Math.max(...dl)}, spread ${spread.toFixed(2)} px (${states.map(s => s[0]).join(',')})`)
  check(`S7b[${tag}] box wholly inside pad and screen`, bad.length === 0, bad.length ? bad.join(' | ') : 'all states inside')
  check(`S7c[${tag}] box middle within 2 px of the day text's`, mid <= 2, `largest difference ${mid.toFixed(2)} px`)
  check(`S7d[${tag}] nothing overlaps ‹ › Done or the day`, overl === 0, `${overl} state(s) overlap; the box dropped under the day in ${drops} state(s)`)
}

await scenario('pad side', async () => { L('--- PAD, phone held sideways 844x390 ---'); await padWalk(PH_SIDE, 'side') })
await scenario('pad up', async () => { L('--- PAD, phone upright 402x874 ---'); await padWalk(PH_UP, 'up402') })

/* S7 at other upright widths, and iPhone-wide letters */
async function widthWalk(width, ls) {
  const tag = `w${width}${ls ? 'ls' : ''}`
  const w = await mk(browser, { viewport: { width, height: width === 320 ? 640 : 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, `pad-${tag}`)
  const p = w.page
  await login(p)
  if (ls) await p.addStyleTag({ content: '*{letter-spacing:.07em !important}' })
  await toGrid(w)
  await openOn(w, P25); await key(w, 7); await closePad(w)
  await openOn(w, P25)
  const states = []
  const mo = await M(p); states.push(['open', mo])
  await shot(p, `S7-${tag}-open`)
  for (const k of [1, 2, 3]) await key(w, k, 350)
  const m3 = await M(p); states.push(['typed123', m3])
  await shot(p, `S7-${tag}-typed123`)
  for (let i = 0; i < 4; i++) { const mm = await M(p); if (mm.figText === '') break; await key(w, 'back', 300) }
  const me = await M(p); states.push(['empty', me])
  await shot(p, `S7-${tag}-empty`)
  s7(tag, states)
  const r = mo.rects
  info(`S7[${tag}]`, `open state: pad width ${(r.pad.r - r.pad.l).toFixed(0)}, box ${J(r.fig)}, day ${J(r.day)}, box dropped under the day: ${r.fig.t >= r.day.b - 1}; ‹ ${J(r.prev)}, Done ${J(r.done)}`)
  await w.ctx.close()
}
for (const [wd, ls] of [[402, false], [375, false], [320, false], [375, true]]) await scenario(`S7 ${wd}${ls}`, async () => { L(`--- S7 at ${wd} wide${ls ? ' with letters 0.07em wider' : ''} ---`); await widthWalk(wd, ls) })

/* S8 — reduced motion */
await scenario('S8', async () => {
  L('--- S8 reduced motion ---')
  const mkR = async rm => {
    const w = await mk(browser, { ...PH_SIDE, reducedMotion: rm }, `S8-${rm}`)
    await login(w.page); await toGrid(w); await openOn(w, P25); await key(w, 9)
    const m = await M(w.page)
    await shot(w.page, `S8-${rm}`)
    await w.ctx.close()
    return m
  }
  const red = await mkR('reduce'), norm = await mkR('no-preference')
  check('S8 reduce: caret does not animate', red.caret && red.caretAnim === 'none', `with reduced motion .flycaret animation-name '${red.caretAnim}'`)
  check('S8 control: caret animates normally', norm.caret && norm.caretAnim && norm.caretAnim !== 'none', `without the setting animation-name '${norm.caretAnim}'`)
})

/* S9 — desktop */
await scenario('S9', async () => {
  L('--- S9 desktop 1440x900 ---')
  const w = await mk(browser, DESK, 'S9')
  await login(w.page)
  await toGrid(w)
  await bring(w.page, P25)
  await w.page.locator(`[data-testid="${P25}"]`).click(); await sleep(700)
  const inp = await w.page.locator('[data-testid="fly-edit-input"]').count()
  const inpVis = inp ? await w.page.locator('[data-testid="fly-edit-input"]').first().isVisible() : false
  const fig = await w.page.locator('[data-testid="fly-pad-fig"]').count()
  const padc = await w.page.locator('[data-testid="fly-pad"]').count()
  await shot(w.page, 'S9-desktop-click')
  check('S9 desktop click gives the input and no pad', inp === 1 && inpVis && fig === 0 && padc === 0, `input boxes ${inp} (visible ${inpVis}), fly-pad-fig ${fig}, fly-pad ${padc}`)
  await w.page.keyboard.press('Escape')
  await w.ctx.close()
})

/* S10 — WebKit at the iPhone */
await scenario('S10', async () => {
  L('--- S10 WebKit, iPhone 13 ---')
  let wk
  try { wk = await webkit.launch() } catch (e) { notWalked('S10', 'WebKit would not start: ' + String(e.message).split('\n')[0]); return }
  const ctx = await wk.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const T = watch(page, 'S10-webkit')
  const w = { ctx, page, T, touch: true }
  await login(page)
  await stage(w, 'webkit')
  await stage26(w, 'webkit')
  await S1S2(w, 'webkit', null)
  await ctx.close(); await wk.close()
})

/* ============================ FAILED DOWNLOAD ============================ */
const cardInfo = p => p.evaluate(() => {
  const c = document.querySelector('[data-testid="page-load-fail"]')
  if (!c) return null
  const b = c.getBoundingClientRect(), r = document.querySelector('[data-testid="page-load-retry"]')
  const tb = document.querySelector('.topbar')
  const tbr = tb ? tb.getBoundingClientRect() : null
  return { role: c.getAttribute('role'), parts: c.innerText.split('\n').map(s => s.trim()).filter(Boolean), retry: r ? r.textContent.trim() : null, retryBox: r ? (() => { const x = r.getBoundingClientRect(); return [Math.round(x.width), Math.round(x.height)] })() : null, card: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], topbar: tbr ? { vis: tbr.width > 0 && tbr.height > 0 && getComputedStyle(tb).visibility !== 'hidden', top: Math.round(tbr.top), bottom: Math.round(tbr.bottom) } : null, count: document.querySelectorAll('[data-testid="page-load-fail"]').length }
})
const WORDS = what => [`Couldn't open ${what}`, "It didn't download. Check your signal, then retry.", 'Retry']
const gridUp = async (p, ms = 15000) => { try { await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: ms }); return true } catch { return false } }
const cardUp = async (p, ms = 8000) => { try { await p.locator('[data-testid="page-load-fail"]').waitFor({ timeout: ms }); return true } catch { return false } }
const same = (a, b) => a.length === b.length && a.every((x, i) => x.replace(/[‘’]/g, "'") === b[i])

await scenario('F1/F2', async () => {
  L('--- F1/F2 phone 402x874, the Leave War refused ---')
  const w = await mk(browser, PH_UP, 'F1F2', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  const up = await cardUp(p)
  await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'F1-card')
  check('F1a card words', up && ci && same(ci.parts, WORDS('the Leave War')) && ci.role === 'alert', `parts ${J(ci?.parts)}, role '${ci?.role}'`)
  check('F1b top bar visible', !!ci?.topbar?.vis && ci.topbar.top >= 0, `top bar ${J(ci?.topbar)}; card box ${J(ci?.card)}; Retry ${J(ci?.retryBox)} px`)
  const blank = await p.evaluate(() => ({ rootKids: (document.getElementById('root') || {}).children?.length ?? null, topbar: !!document.querySelector('.topbar') }))
  info('F1', `app not blank: ${J(blank)}`)
  await nav(w, 'inputs'); await sleep(900)
  const inputs = await p.evaluate(() => { const e = document.getElementById('page-inputs'); return e ? { vis: e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none', cards: document.querySelectorAll('[data-testid="page-load-fail"]').length } : null })
  await shot(p, 'F1-inputs')
  check('F1c ☰ → Inputs shows the Inputs page', !!inputs?.vis && inputs.cards === 0, J(inputs))
  await nav(w, 'leavewar')
  const again = await cardUp(p); await sleep(400)
  const ci2 = await cardInfo(p)
  await shot(p, 'F1-card-again')
  check('F1d ☰ → Leave War shows the card again', again && ci2 && same(ci2.parts, WORDS('the Leave War')), `parts ${J(ci2?.parts)}, cards ${ci2?.count}`)
  /* F2 */
  const before = w.T.lw
  await tapS(w, '[data-testid="page-load-retry"]', 100)
  await sleep(3500)
  const ci3 = await cardInfo(p)
  await shot(p, 'F2-still-refused')
  check('F2a Retry while refused: the card stays', !!ci3 && ci3.count === 1 && same(ci3.parts, WORDS('the Leave War')), `card ${ci3 ? 'shown' : 'gone'}, parts ${J(ci3?.parts)}; Leave War file requests ${before} -> ${w.T.lw} (Retry tried the download again: ${w.T.lw > before})`)
  w.G.lw = false
  const asset = (w.T.failed.find(f => /LeaveWarPage/.test(f)) || '').split(' ')[0]
  await p.evaluate(() => { window.__claws = [] })
  const lw0 = w.T.lw
  await tapS(w, '[data-testid="page-load-retry"]', 120)
  const clawNow = await p.evaluate(() => ({ claw: !!document.querySelector('.pgclaw'), seen: (window.__claws || []).length }))
  await shot(p, 'F2-retry-allowed-early')
  const ok = await gridUp(p)
  await sleep(1500)
  const seen = await p.evaluate(() => (window.__claws || []).length)
  const left = await cardInfo(p)
  await shot(p, 'F2-grid')
  if (asset) { const rq = w.T.lw; const r = await p.evaluate(u => import(/* @vite-ignore */ u).then(() => 'loaded', e => String(e && e.message)), asset); info('F2', `diagnostic: the page's own import() of the same file ${asset} once allowed answers '${r}', file requests ${rq} -> ${w.T.lw}`) }
  check('F2b Retry once allowed: the grid, no card', ok && !left, `grid ${ok}, card ${left ? 'still shown' : 'gone'}; file requests ${lw0} -> ${w.T.lw}; claw raised ${seen} time(s) (right after the press: ${J(clawNow)})`)
  await w.ctx.close()
})

await scenario('F3', async () => {
  L('--- F3 desktop, refused before sign-in ---')
  const w = await mk(browser, DESK, 'F3', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await sleep(6000)
  const st = await p.evaluate(() => ({ topbar: !!document.querySelector('.topbar'), week: !!document.querySelector('#vWeek .day'), card: document.querySelectorAll('[data-testid="page-load-fail"]').length, claw: document.querySelectorAll('.pgclaw').length, rootKids: (document.getElementById('root') || {}).children?.length ?? null }))
  await shot(p, 'F3-after-6s')
  const refusedTries = w.T.failed.filter(f => /LeaveWarPage/.test(f)).length
  check('F3a pre-warm fails silent', st.topbar && st.week && st.card === 0 && st.claw === 0, `${J(st)}; the hidden download was tried and refused ${refusedTries} time(s) (file requests ${w.T.lw})`)
  w.G.lw = false
  const r0 = w.T.lw
  await nav(w, 'leavewar')
  const ok = await gridUp(p)
  await sleep(800)
  const card = await cardInfo(p)
  await shot(p, 'F3-grid')
  check('F3b allowed later, tab click shows the grid, no card', ok && !card, `grid ${ok}, card ${card ? 'shown' : 'none'}; file requests ${r0} -> ${w.T.lw} (opening tried again: ${w.T.lw > r0})`)
  await w.ctx.close()
})

await scenario('F4', async () => {
  L('--- F4 desktop, refused, tab clicked while refused ---')
  const w = await mk(browser, DESK, 'F4', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await sleep(6000)
  const r0 = w.T.lw
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'F4-card')
  check('F4 tab click while refused shows the card', up && ci && same(ci.parts, WORDS('the Leave War')) && ci.role === 'alert' && !!ci.topbar?.vis, `parts ${J(ci?.parts)}, top bar ${J(ci?.topbar)}; card box ${J(ci?.card)}; file requests ${r0} -> ${w.T.lw}`)
  await w.ctx.close()
})

await scenario('F5', async () => {
  L('--- F5 phone, the Tracker refused ---')
  const w = await mk(browser, PH_UP, 'F5', true)
  w.G.tr = true
  const p = w.page
  await login(p)
  await nav(w, 'tracker')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'F5-card')
  check('F5a Tracker card words', up && ci && same(ci.parts, WORDS('the Tracker')) && ci.role === 'alert' && !!ci.topbar?.vis, `parts ${J(ci?.parts)}, top bar ${J(ci?.topbar)}`)
  w.G.tr = false
  const t0 = w.T.tr
  await tapS(w, '[data-testid="page-load-retry"]', 100)
  let chart = null
  for (let i = 0; i < 40; i++) { chart = await p.evaluate(() => ({ board: document.querySelectorAll('#page-tracker #board > *').length, nocourse: document.querySelectorAll('#page-tracker #trk-nocourse').length })); if (chart.board || chart.nocourse) break; await sleep(500) }
  await sleep(1500)
  const left = await cardInfo(p)
  await shot(p, 'F5-tracker')
  check('F5b Retry allowed: the Tracker chart, no card', !!(chart && (chart.board || chart.nocourse)) && !left, `chart ${J(chart)}, card ${left ? 'shown' : 'gone'}; file requests ${t0} -> ${w.T.tr}`)
  await w.ctx.close()
})

await scenario('F6', async () => {
  L('--- F6 an updated app: Retry reloads ---')
  const w = await mk(browser, PH_UP, 'F6', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  const up = await cardUp(p)
  await shot(p, 'F6-card-before')
  const html = await (await fetch(URL)).text()
  const entry = (html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/) || [])[1]
  const fake = html.replace(/index-[A-Za-z0-9_-]+\.js/g, 'index-ZZUPDATED.js')
  info('F6', `real entry '${entry}'; the faked index names 'index-ZZUPDATED.js': ${fake !== html}`)
  await w.ctx.route(u => u.href === URL, async r => {
    if (r.request().resourceType() === 'fetch') await r.fulfill({ status: 200, contentType: 'text/html', body: fake })
    else await r.continue()
  })
  await p.evaluate(() => { window.__mk = 'before-reload' })
  const loaded = p.waitForEvent('load', { timeout: 9000 }).then(() => true).catch(() => false)
  const f0 = w.T.fetchRoot.length
  await tapS(w, '[data-testid="page-load-retry"]', 100)
  const reloaded = await loaded
  await sleep(2500)
  const mk0 = await p.evaluate(() => window.__mk || null).catch(() => 'navigating')
  const shows = await p.evaluate(() => ({ login: !!document.getElementById('loginForm') && document.getElementById('loginForm').getBoundingClientRect().height > 0, week: !!document.querySelector('#vWeek .day'), card: document.querySelectorAll('[data-testid="page-load-fail"]').length, claw: document.querySelectorAll('.pgclaw').length, body: document.body.innerText.trim().slice(0, 80) }))
  await shot(p, 'F6-after-retry')
  check('F6 Retry on an updated app reloads the page', up && reloaded && mk0 === null, `card was up ${up}; fetch of the index sent ${w.T.fetchRoot.length - f0} time(s); page load event after the press: ${reloaded}; marker set before the press now ${J(mk0)}; the screen after: ${J(shows)}`)
  await w.ctx.close()
})

await scenario('F7', async () => {
  L('--- F7 desktop keyboard ---')
  const w = await mk(browser, DESK, 'F7', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await sleep(2500)
  await nav(w, 'leavewar')
  await cardUp(p); await sleep(400)
  w.G.lw = false
  let n = 0, at = null
  for (; n < 70; n++) {
    at = await p.evaluate(() => { const a = document.activeElement; return a ? a.getAttribute('data-testid') || a.tagName : null })
    if (at === 'page-load-retry') break
    await p.keyboard.press('Tab'); await sleep(60)
  }
  const ring = await p.evaluate(() => { const a = document.activeElement; if (!a) return null; const s = getComputedStyle(a); const b = a.getBoundingClientRect(); return { fv: a.matches(':focus-visible'), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor + ' off ' + s.outlineOffset, shadow: s.boxShadow, box: { x: b.left, y: b.top, w: b.width, h: b.height } } })
  await shot(p, 'F7-focus-full')
  if (ring && ring.box) await shot(p, 'F7-focus-crop', { x: Math.max(0, ring.box.x - 60), y: Math.max(0, ring.box.y - 40), width: ring.box.w + 120, height: ring.box.h + 80 })
  const hasRing = !!ring && ring.fv && (!/^none/.test(ring.outline) && !/ 0px /.test(ring.outline) || (ring.shadow && ring.shadow !== 'none'))
  check('F7a Tab reaches Retry, with a visible focus ring', at === 'page-load-retry' && hasRing, `after ${n} Tab presses focus is on '${at}'; ${J(ring)}`)
  await p.keyboard.press('Enter')
  const ok = await gridUp(p)
  await sleep(1000)
  const left = await cardInfo(p)
  await shot(p, 'F7-grid')
  check('F7b Enter on Retry: the grid appears', ok && !left, `grid ${ok}, card ${left ? 'shown' : 'gone'}`)
  await w.ctx.close()
})

await scenario('F8', async () => {
  L('--- F8 phone, the Leave War slowed 10 s ---')
  const w = await mk(browser, PH_UP, 'F8')
  const p = w.page
  await login(p)
  w.G.slowLw = 10000
  await nav(w, 'leavewar')
  const t0 = Date.now()
  const read = () => p.evaluate(() => { const c = document.querySelector('.pgclaw'); const s = document.getElementById('page-leavewar'); return { claw: !!c, role: c ? c.getAttribute('role') : null, say: c && c.querySelector('.pgclaw-say') ? c.querySelector('.pgclaw-say').textContent : null, still: document.querySelectorAll('.pgclaw-still').length, stillText: document.querySelector('.pgclaw-still') ? document.querySelector('.pgclaw-still').textContent : null, busy: s ? s.getAttribute('aria-busy') : null, card: document.querySelectorAll('[data-testid="page-load-fail"]').length } })
  await sleep(Math.max(0, 4000 - (Date.now() - t0)))
  const a4 = await read(); const e4 = Date.now() - t0
  await shot(p, 'F8-at-4s')
  check('F8a at ~4 s: claw, no "Still loading…"', a4.claw && a4.still === 0, `${e4} ms after the tap: ${J(a4)}`)
  await sleep(Math.max(0, 9000 - (Date.now() - t0)))
  const a9 = await read(); const e9 = Date.now() - t0
  await shot(p, 'F8-at-9s')
  check('F8b at ~9 s: "Still loading…" under the claw, role status, spoken words, aria-busy', a9.still === 1 && a9.stillText === 'Still loading…' && a9.role === 'status' && a9.say === 'Loading Leave War' && a9.busy === 'true', `${e9} ms after the tap: ${J(a9)}`)
  const ok = await gridUp(p, 20000)
  const tArr = Date.now() - t0
  let aft = null
  for (let i = 0; i < 20; i++) { aft = await read(); if (!aft.claw) break; await sleep(500) }
  await sleep(500); aft = await read()
  await shot(p, 'F8-arrived')
  check('F8c after the page arrives: no claw, no line, no aria-busy', ok && !aft.claw && aft.still === 0 && aft.busy === null && aft.card === 0, `grid up ${ok} (${tArr} ms after the tap): ${J(aft)}`)
  await w.ctx.close()
})

await scenario('F9', async () => {
  L('--- F9 member us/us on a phone, refused ---')
  const w = await mk(browser, PH_UP, 'F9', true)
  w.G.lw = true
  const p = w.page
  await login(p, 'us', 'us')
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'F9-card-member')
  check('F9 member sees the same card', up && ci && same(ci.parts, WORDS('the Leave War')) && ci.role === 'alert' && !!ci.topbar?.vis, `parts ${J(ci?.parts)}, top bar ${J(ci?.topbar)}`)
  await w.ctx.close()
})

await scenario('F2w', async () => {
  L('--- F2w WebKit iPhone 13, the Leave War refused, then allowed, Retry ---')
  let wk
  try { wk = await webkit.launch() } catch (e) { notWalked('F2w', 'WebKit would not start: ' + String(e.message).split('\n')[0]); return }
  const w = await mk(wk, { ...devices['iPhone 13'], deviceScaleFactor: 2 }, 'F2w-webkit', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'F2w-card')
  check('F2w-a card words (WebKit)', up && ci && same(ci.parts, WORDS('the Leave War')) && ci.role === 'alert', `parts ${J(ci?.parts)}, top bar ${J(ci?.topbar)}`)
  w.G.lw = false
  const lw0 = w.T.lw
  await tapS(w, '[data-testid="page-load-retry"]', 120)
  const ok = await gridUp(p, 12000)
  await sleep(1000)
  const left = await cardInfo(p)
  await shot(p, 'F2w-after-retry')
  check('F2w-b Retry once allowed (WebKit): the grid, no card', ok && !left, `grid ${ok}, card ${left ? 'still shown' : 'gone'}; file requests ${lw0} -> ${w.T.lw}`)
  await w.ctx.close(); await wk.close()
})

/* ============================ PLAIN-USER ROUND ============================ */
await scenario('U1', async () => {
  L('--- U1 phone, nothing refused ---')
  const w = await mk(browser, PH_UP, 'U1')
  const p = w.page
  await login(p)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  const ok = await gridUp(p)
  const claws = await p.evaluate(() => (window.__claws || []).length)
  await sleep(1500)
  const done = await p.evaluate(() => ({ claw: document.querySelectorAll('.pgclaw').length, card: document.querySelectorAll('[data-testid="page-load-fail"]').length, busy: document.getElementById('page-leavewar')?.getAttribute('aria-busy') ?? null }))
  await shot(p, 'U1-grid')
  check('U1a ☰ → Leave War: claw then grid', ok && done.claw === 0 && done.card === 0 && done.busy === null, `grid ${ok}; claw raised ${claws} time(s) (a fast local load may raise none); after: ${J(done)}`)
  const cell = p.locator('#page-leavewar td[data-testid^="cell-dice-"]').first()
  const winOpen = async () => (await p.locator('[data-testid="bid-picker"]').count()) > 0
  const openCell = async () => { await cell.scrollIntoViewIfNeeded(); await cell.tap(); await sleep(900) }
  await openCell()
  const o1 = await winOpen()
  await shot(p, 'U1-window-open')
  await p.locator('[data-testid="bid-cancel"]').tap(); await sleep(700)
  const c1 = !(await winOpen())
  check('U1b day window opens and ✕ closes it', o1 && c1, `opened ${o1}, closed by ✕ ${c1}`)
  await openCell()
  const o2 = await winOpen()
  await p.keyboard.press('Escape'); await sleep(700)
  const c2 = !(await winOpen())
  check('U1c window closes by Escape', o2 && c2, `opened ${o2}, closed by Escape ${c2}`)
  await openCell()
  const o3 = await winOpen()
  const bx = await p.evaluate(() => { const b = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return { top: b.top, bottom: b.bottom } })
  const y = bx.top > 120 ? bx.top / 2 : (bx.bottom + innerHeight) / 2
  await p.touchscreen.tap(201, y); await sleep(800)
  const c3 = !(await winOpen())
  await shot(p, 'U1-after-outside-tap')
  check('U1d window closes by a tap outside', o3 && c3, `opened ${o3}; tapped (201,${y.toFixed(0)}) with the window at ${J(bx)}; closed ${c3}`)
  await nav(w, 'tracker')
  let chart = null
  for (let i = 0; i < 30; i++) { chart = await p.evaluate(() => ({ board: document.querySelectorAll('#page-tracker #board > *').length, nocourse: document.querySelectorAll('#page-tracker #trk-nocourse').length })); if (chart.board || chart.nocourse) break; await sleep(500) }
  await sleep(1500)
  await shot(p, 'U1-tracker')
  const tcard = await cardInfo(p)
  check('U1e ☰ → Tracker: its chart', !!(chart.board || chart.nocourse) && !tcard, `${J(chart)}, card ${tcard ? 'shown' : 'none'}`)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  await sleep(250)
  const back = await p.evaluate(() => ({ grid: !!document.querySelector('[data-testid="row-slipway"]') && document.getElementById('page-leavewar').getBoundingClientRect().height > 0, claw: document.querySelectorAll('.pgclaw').length, claws: (window.__claws || []).length }))
  await shot(p, 'U1-leavewar-again')
  check('U1f ☰ → Leave War again: at once, no claw', back.grid && back.claw === 0 && back.claws === 0, `250 ms after the tap: ${J(back)}`)
  await w.ctx.close()
})

await scenario('U2', async () => {
  L('--- U2 desktop, 3 s then the Leave War tab ---')
  const w = await mk(browser, DESK, 'U2')
  const p = w.page
  await login(p)
  await sleep(3000)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  await sleep(300)
  const early = await p.evaluate(() => ({ grid: !!document.querySelector('[data-testid="row-slipway"]'), claw: document.querySelectorAll('.pgclaw').length, claws: (window.__claws || []).length, card: document.querySelectorAll('[data-testid="page-load-fail"]').length }))
  const ok = await gridUp(p, 5000)
  await sleep(500)
  await shot(p, 'U2-grid')
  const card = await cardInfo(p)
  check('U2 desktop: the grid at once, no card, no claw', early.grid && early.claw === 0 && early.claws === 0 && !card, `300 ms after the click: ${J(early)}; grid up ${ok}`)
  await w.ctx.close()
})

/* ============================ ERRORS ============================ */
L('--- page errors, console errors, 4xx/5xx per scenario (the refused files listed apart) ---')
const expectedRx = /LeaveWarPage|TrackerPage|ERR_INTERNET_DISCONNECTED|dynamically imported|Failed to fetch|Importing a module script failed/i
for (const T of allT) {
  const split = arr => T.refusal ? [arr.filter(x => !expectedRx.test(x)), arr.filter(x => expectedRx.test(x))] : [arr, []]
  const [pe, pe2] = split(T.pe), [ce, ce2] = split(T.ce), [ht, ht2] = split(T.http), [fl, fl2] = split(T.failed)
  const unexpected = pe.length + ce.length + ht.length + fl.length
  L(`${unexpected ? 'ERRORS' : 'clean '} ${T.tag}: page errors ${J(pe)}; console errors ${J(ce)}; 4xx/5xx ${J(ht)}; failed requests ${J(fl)}${T.refusal ? `; EXPECTED (the refused file) page errors ${pe2.length}, console ${ce2.length}, http ${ht2.length}, failed ${fl2.length}${ce2.length ? ' e.g. ' + J(ce2[0]) : ''}` : ''}`)
}
L('DONE')
await browser.close()
