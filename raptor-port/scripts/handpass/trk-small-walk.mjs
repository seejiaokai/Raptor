/* [TRK-PINCH-OLD-EDGES] the walk, 21 Oct 26 — the Tracker chart's pinch when the mode changes under it, and a pinch whose
   lifts were lost. Real two-finger touch through Chromium's own touch input (CDP Input.dispatchTouchEvent) on the built
   bundle, a third finger or a mouse click for the button pressed under a pinch, a synthetic lost lift (Chromium never
   loses one: bug-check order 7.9), and a plain mouse for the three refusals.
     HP_URL   the preview serving THIS checkout's dist (required)
     HP_SHOTS / HP_OUT / HP_TMP  as trk-lib.mjs
   Each scenario prints PASS / FAIL with the values it judged. */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= resolve(HERE, '../../docs/img/handpass/2026-10-21-tracker-small/walk')
process.env.HP_OUT ||= resolve(HERE, '../../docs/handpass/parts/trk-small')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
for (const f of readdirSync(process.env.HP_SHOTS)) if (f.endsWith('.png')) rmSync(resolve(process.env.HP_SHOTS, f))
if (!process.env.HP_URL) { console.error('HP_URL not set'); process.exit(2) }
const VERSION = 'trk-small-walk v5'
console.log(VERSION, '-', process.env.HP_URL)
/* THE BUILD IT DRIVES IS PROVED FIRST */
const served = ((await (await fetch(process.env.HP_URL + '/')).text()).match(/assets\/index-[^"']+\.js/) || [])[0]
const localDist = resolve(HERE, '../../dist/assets')
const local = existsSync(localDist) ? readdirSync(localDist).find(f => /^index-.*\.js$/.test(f)) : null
console.log('build proof: served', served, '/ local dist', local ? 'assets/' + local : '(none)')
if (served !== 'assets/index-B0xwe99_.js') { console.error('not the expected build'); process.exit(2) }
const { login, toTracker, shot, save, core, dlg, SHOTS } = await import('./trk-lib.mjs')
const { mark, unmark, chartAt, ballAt } = await import('./trk-pinch.mjs')

const wait = ms => new Promise(r => setTimeout(r, ms))
const T = (cdp, type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
const rows = []
let curPics = []
const pic = async (page, name) => { await shot(page, name); curPics.push(name + '.png') }

/* ---------- contexts ---------- */
async function openCtx({ size, touchLaptop = false, phone = false }) {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: size,
    ...(phone ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : touchLaptop ? { hasTouch: true, isMobile: false, deviceScaleFactor: 1 } : {}),
    acceptDownloads: true,
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.type() + ': ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(process.env.HP_URL + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, 'a')
  await toTracker(page)
  const cdp = (phone || touchLaptop) ? await ctx.newCDPSession(page) : null
  return { browser, ctx, page, errors, cdp }
}

/* ---------- reading the screen ---------- */
const S = page => page.evaluate(() => {
  const w = document.querySelector('#board .flowwrap'), v = document.getElementById('viewport'), p = document.getElementById('fzPct'), f = document.getElementById('flowSvg'), a = document.getElementById('arrangeBtn'), b = document.getElementById('board')
  return {
    z: w ? +(getComputedStyle(w).zoom || 1) : null, wt: w ? w.style.transform : null,
    view: v ? v.getAttribute('transform') : '', pct: p ? p.textContent : null,
    arrange: f ? f.classList.contains('arrange') : null, btn: a ? a.textContent : null,
    st: b ? Math.round(b.scrollTop) : null, sl: b ? Math.round(b.scrollLeft) : null, pop: !!document.getElementById('pop'),
  }
})
const kOf = v => +((v || '').match(/scale\(([\d.]+)\)/) || [0, 1])[1]
const pctN = s => parseInt(s.pct, 10)
const pctOk = s => s.z != null && Math.abs(pctN(s) - s.z * 100) <= 0.5 + 1e-6
const menuOpen = page => page.evaluate(() => !!document.querySelector('#sylMenuPanel.on'))
const menuRect = page => page.evaluate(() => { const r = document.getElementById('sylMenuPanel').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } })
async function openMenuTap(page) { if (!(await menuOpen(page))) { await page.tap('#sylMenuBtn'); await wait(300) } }
async function toggleEditReal(page) { await openMenuTap(page); await page.tap('#arrangeBtn'); await wait(700) }
const centre = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width } }, sel)

/* a ball to pinch on: nearest the middle of the visible board, its fingers' span `hs` either side clear of `avoid` */
const ballSpot = (page, avoid, hs) => page.evaluate(([avoid, hs]) => {
  const b0 = document.getElementById('board').getBoundingClientRect()
  const bd = { left: b0.left, right: Math.min(b0.right, innerWidth), top: b0.top, bottom: Math.min(b0.bottom, innerHeight) }
  const mY = Math.min(60, (bd.bottom - bd.top) * 0.3), mx = (bd.left + bd.right) / 2, my = bd.top + (bd.bottom - bd.top) * 0.45
  let best = null
  for (const mX of [100, 40]) { if (best) break
    for (const g of document.querySelectorAll('#flowSvg .ball')) {
      const r = g.getBoundingClientRect(); if (!r.width) continue
      const x = r.left + r.width / 2, y = r.top + r.height / 2
      if (x < bd.left + mX || x > bd.right - mX || y < bd.top + mY || y > bd.bottom - mY) continue
      if (avoid && x + hs > avoid.l - 10 && x - hs < avoid.r + 10 && y + 40 > avoid.t - 10 && y - 40 < avoid.b + 10) continue
      const d = Math.hypot(x - mx, y - my); if (!best || d < best.d) best = { id: g.dataset.id, x, y, d }
    } }
  return best
}, [avoid, hs])
/* empty canvas in Edit chart layout (trk-pinch's emptySpot, clear of `avoid` too) */
const emptySpot = (page, avoid) => page.evaluate(avoid => {
  const s0 = document.getElementById('flowSvg').getBoundingClientRect(), b0 = document.getElementById('board').getBoundingClientRect()
  const s = { left: Math.max(s0.left, b0.left), top: Math.max(s0.top, b0.top), right: Math.min(s0.right, b0.right, innerWidth), bottom: Math.min(s0.bottom, b0.bottom, innerHeight) }
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !e || !!(e.closest && (e.closest('.ball') || e.closest('.menupanel'))) }
  const cx = (s.left + s.right) / 2, cy = (s.top + s.bottom) / 2; let best = null
  for (let y = s.top + 60; y < s.bottom - 60; y += 11) for (let x = s.left + 110; x < s.right - 110; x += 11) {
    if (avoid && x + 110 > avoid.l - 10 && x - 110 < avoid.r + 10 && y + 40 > avoid.t - 10 && y - 40 < avoid.b + 10) continue
    let ok = true; for (let d = 0; d <= 100 && ok; d += 10) if (hit(x - d, y) || hit(x + d, y)) ok = false
    if (ok) { const dd = Math.hypot(x - cx, y - cy); if (!best || dd < best.d) best = { x, y, d: dd } }
  }
  return best
}, avoid)

/* ---------- fingers ---------- */
const two = (m, d) => [{ x: m.x - d / 2, y: m.y, id: 1 }, { x: m.x + d / 2, y: m.y, id: 2 }]
async function fingersDown(cdp, m, d) { await T(cdp, 'touchStart', two(m, d)); await wait(40) }
async function fingersMove(cdp, from, to, steps, extra = []) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, m = { x: from.m.x + (to.m.x - from.m.x) * t, y: from.m.y + (to.m.y - from.m.y) * t }
    await wait(16); await T(cdp, 'touchMove', [...two(m, from.d + (to.d - from.d) * t), ...extra])
  }
}
const fingersLift = async cdp => { await wait(90); await T(cdp, 'touchEnd', []); await wait(400) }
async function pinchWhole(cdp, m, d0, d1, steps = 14) {
  await fingersDown(cdp, m, d0); await fingersMove(cdp, { m, d: d0 }, { m, d: d1 }, steps); await fingersLift(cdp); return m
}
const tapAt = async (cdp, x, y) => { await T(cdp, 'touchStart', [{ x, y, id: 9 }]); await wait(60); await T(cdp, 'touchEnd', []); await wait(300) }

/* the third finger (or a mouse) presses `sel` with the two fingers held where they are. Returns the method that worked. */
async function pressUnderPinch(page, cdp, held, sel, arrangeAfter, log) {
  const arrNow = async () => (await S(page)).arrange
  let c = await centre(page, sel)
  if (!c || !c.w) return null
  await T(cdp, 'touchStart', [...held, { x: c.x, y: c.y, id: 5 }]); await wait(80)
  await T(cdp, 'touchEnd', [{ x: c.x, y: c.y, id: 5 }]); await wait(350)      /* touchEnd naming the point lifts just that finger */
  if ((await arrNow()) === arrangeAfter) return 'a: a third touch point on the button'
  log.push('(a) a third touch point did not press it')
  if (!(await menuOpen(page))) { await page.mouse.click((await centre(page, '#sylMenuBtn')).x, (await centre(page, '#sylMenuBtn')).y); await wait(300) }
  c = await centre(page, sel)
  await page.mouse.click(c.x, c.y); await wait(500)
  if ((await arrNow()) === arrangeAfter) return 'b: a mouse click on the button while the two touch fingers were held'
  log.push('(b) a mouse click did not press it')
  return null
}

/* ---------- one scenario ---------- */
async function scenario(id, name, expected, env, fn, recoverFn) {
  const { page, errors } = env, e0 = errors.length
  curPics = []
  let r
  try { r = await fn() } catch (e) { r = { pass: false, detail: 'SCRIPT ERROR: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e) } ; try { if (env.cdp) await T(env.cdp, 'touchEnd', []); await page.keyboard.press('Escape') } catch (_) {} ; if (recoverFn) { try { await recoverFn() } catch (_) {} } }
  const errs = errors.slice(e0)
  if (errs.length && r.pass !== null) { r.pass = false; r.detail = (r.detail || '') + ' | PAGE/CONSOLE ERRORS: ' + errs.join(' ; ') }
  const row = { id, name, expected, pass: r.pass, detail: r.detail, method: r.method || null, pics: curPics.slice(), errors: errs, measured: r.measured || null }
  rows.push(row)
  console.log(`${r.pass === null ? 'NOT WALKED' : r.pass ? 'PASS' : 'FAIL'}  ${id}  ${r.detail || ''}  [errors ${errs.length}]`)
}

/* ordinary pinch on a ball: returns {pass, detail, measured} */
async function ordinaryPinch(page, cdp, pre, { avoid = null } = {}) {
  const b = await ballSpot(page, avoid, 110)
  if (!b) return { pass: false, detail: 'no ball in view to pinch on' }
  const s0 = await S(page)
  let [d0, d1] = [70, 180]; if (s0.z >= 2.2) [d0, d1] = [d1, d0]
  await mark(page, b); await pic(page, `${pre}-1-before`); await unmark(page)
  const end = await pinchWhole(cdp, { x: b.x, y: b.y }, d0, d1)
  const a = await ballAt(page, b.id), s1 = await S(page)
  await mark(page, end); await pic(page, `${pre}-2-after`); await unmark(page)
  const drift = a ? Math.round(Math.hypot(a.x - end.x, a.y - end.y) * 10) / 10 : 999
  const ok = drift <= 6 && s1.pct !== s0.pct && pctOk(s1) && s1.wt === ''
  return { pass: ok, measured: { ball: b.id, drift, before: { z: s0.z, pct: s0.pct }, after: { z: s1.z, pct: s1.pct } },
    detail: `ball ${b.id} ${drift}px from the fingers' end (${Math.round(end.x)},${Math.round(end.y)}); zoom ${s0.z}->${s1.z}; label ${s0.pct}->${s1.pct} (round(zoom*100)=${Math.round(s1.z * 100)}); wrap transform "${s1.wt}"`, s1 }
}
/* pinch on empty canvas in Edit chart layout */
async function editPinch(page, cdp, pre, avoid = null) {
  const p = await emptySpot(page, avoid)
  if (!p) return { pass: false, detail: 'no empty canvas on screen to pinch on' }
  const c0 = await chartAt(page, p), v0 = (await S(page)).view
  let [d0, d1] = [60, 180]; if (kOf(v0) >= 3.5) [d0, d1] = [d1, d0]
  await mark(page, p); await pic(page, `${pre}-1-before`); await unmark(page)
  const end = await pinchWhole(cdp, { x: p.x, y: p.y }, d0, d1)
  const c1 = await chartAt(page, end), v1 = (await S(page)).view
  await mark(page, end); await pic(page, `${pre}-2-after`); await unmark(page)
  const drift = Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y) * kOf(v1) * 10) / 10
  return { pass: drift <= 6 && v1 !== v0, drift, detail: `canvas point under the fingers moved ${drift}px; view ${v0} -> ${v1}`, v0, v1 }
}

/* a mode switched under a pinch (to: 'on' = Edit chart layout switched on, 'off' = switched off) */
async function underPinch(env, to, pre) {
  const { page, cdp } = env, log = [], checks = []
  const ck = (n, ok, v) => { checks.push({ n, ok: !!ok, v }); if (!ok) log.push('FAIL ' + n + ' [' + v + ']') }
  if (!(await S(page)).arrange) { await page.tap('#fzReset'); await wait(600) }   /* a fresh fit zoom, so the pinch before the switch has room to move it */
  if (to === 'off' && !(await S(page)).arrange) await toggleEditReal(page)
  await openMenuTap(page)
  const pr = await menuRect(page)
  const sp = to === 'on' ? await ballSpot(page, pr, 110) : await emptySpot(page, pr)
  if (!sp) return { pass: false, detail: 'no spot to pinch on clear of the open menu' }
  const s0 = await S(page)
  await mark(page, sp); await pic(page, `${pre}-1-before`); await unmark(page)
  const m = { x: sp.x, y: sp.y }
  await fingersDown(cdp, m, 60); await fingersMove(cdp, { m, d: 60 }, { m, d: 95 }, 5)
  const sDown = await S(page)
  const menuStill = await menuOpen(page)
  await pic(page, `${pre}-2-two-fingers-spread-menu-open`)
  const held = two(m, 95)
  let method = null
  if (!menuStill) { log.push('the menu closed under the fingers; reopened with a mouse click'); const c = await centre(page, '#sylMenuBtn'); await page.mouse.click(c.x, c.y); await wait(300) }
  method = await pressUnderPinch(page, cdp, held, '#arrangeBtn', to === 'on', log)
  if (!method) {
    /* (c) the app's own toggle is not reachable through a probe bridge in this build: nothing else to try */
    await fingersLift(cdp)
    return { pass: false, detail: 'could not press the button under the pinch by (a) or (b): ' + log.join('; '), method: null }
  }
  await wait(500)
  const sSw = await S(page)
  await pic(page, `${pre}-3-after-the-switch-fingers-still-down`)
  ck(`mode switched (arrange ${to === 'on' ? 'true' : 'false'}, button text)`, sSw.arrange === (to === 'on') && sSw.btn === (to === 'on' ? '✓ Done editing chart' : '✎ Edit chart layout'), `arrange=${sSw.arrange} btn="${sSw.btn}"`)
  await page.evaluate(() => { window.__pmN = 0; document.getElementById('board').addEventListener('pointermove', e => { if (e.pointerType === 'touch') window.__pmN++ }, true) })
  await fingersMove(cdp, { m, d: 95 }, { m: { x: m.x + 15, y: m.y - 10 }, d: 200 }, 8)
  const sMoves = await S(page), moveCount = await page.evaluate(() => window.__pmN)
  await pic(page, `${pre}-4-after-more-moves-fingers-still-down`)
  await fingersLift(cdp)
  const sLift = await S(page)
  await pic(page, `${pre}-5-after-the-lift`)
  ck('moves after the switch were delivered to the board (positive proof)', moveCount >= 6, `pointermoves seen=${moveCount}`)
  if (to === 'on') {
    ck('#viewport transform unchanged by the moves', sMoves.view === sSw.view, `${sSw.view} -> ${sMoves.view}`)
    ck('#viewport transform unchanged at the lift', sLift.view === sSw.view, `${sSw.view} -> ${sLift.view}`)
    ck('the button reads "✓ Done editing chart" after the lift', sLift.btn === '✓ Done editing chart' && sLift.arrange === true, `"${sLift.btn}" arrange=${sLift.arrange}`)
  } else {
    ck('zoom unchanged by the moves', sMoves.z === sSw.z && sMoves.wt === sSw.wt, `z ${sSw.z} -> ${sMoves.z}; wrap transform "${sSw.wt}" -> "${sMoves.wt}"`)
    ck('label unchanged by the moves', sMoves.pct === sSw.pct, `${sSw.pct} -> ${sMoves.pct}`)
    ck('zoom and label unchanged at the lift', sLift.z === sSw.z && sLift.pct === sSw.pct && sLift.wt === '', `z ${sSw.z} -> ${sLift.z}; label ${sSw.pct} -> ${sLift.pct}; wrap transform "${sLift.wt}"`)
    ck('ordinary chart is back (not Edit chart layout)', sLift.arrange === false, `arrange=${sLift.arrange}`)
    ck('label equals round(zoom*100) after the switch', pctOk(sSw) && pctOk(sLift), `label ${sLift.pct}, zoom ${sLift.z}`)
  }
  /* then a fresh pinch */
  let fresh
  if (to === 'on') {
    fresh = await editPinch(page, cdp, `${pre}-6-fresh-edit-pinch`)
    ck('a fresh pinch on empty canvas zooms the canvas, point kept within 6px', fresh.pass, fresh.detail)
    await toggleEditReal(page)
    const sBack = await S(page)
    await pic(page, `${pre}-7-back-to-the-ordinary-chart`)
    ck('"✓ Done editing chart" brings the ordinary chart back, label = round(zoom*100)', sBack.arrange === false && pctOk(sBack), `arrange=${sBack.arrange} label ${sBack.pct} zoom ${sBack.z}`)
  } else {
    fresh = await ordinaryPinch(page, cdp, `${pre}-6-fresh-ordinary-pinch`)
    ck('a fresh ordinary pinch works as P1', fresh.pass, fresh.detail)
  }
  const pass = checks.every(c => c.ok)
  return { pass, method, detail: `method ${method}${log.length ? ' (' + log.join('; ') + ')' : ''}; ` + checks.map(c => (c.ok ? 'ok ' : 'FAIL ') + c.n + ' [' + c.v + ']').join(' | '), measured: { checks, s0, sDown, sSw, sMoves, sLift } }
}

/* the lost lift: synthetic */
async function lostLift(env, pre, tabsFn, prep = null) {
  const { page, cdp } = env, checks = []
  if (prep) await prep()
  const ck = (n, ok, v) => checks.push({ n, ok: !!ok, v })
  const b = await ballSpot(page, null, 150)
  if (!b) return { pass: false, detail: 'no ball in view' }
  const s0 = await S(page)
  if (s0.z * 2 > 3.05 && s0.z > 1.6) return { pass: null, detail: 'NOT WALKED: the zoom starts at ' + s0.z + ', so doubling it cannot be told from the cap' }
  await mark(page, b); await pic(page, `${pre}-1-before`); await unmark(page)
  const ev =(type, id, primary, x, y) => page.evaluate(([type, id, primary, x, y]) => {
    document.getElementById('board').dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id, pointerType: 'touch', isPrimary: primary, clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1 }))
  }, [type, id, primary, x, y])
  await ev('pointerdown', 41, true, b.x - 50, b.y); await wait(30)
  await ev('pointerdown', 42, false, b.x + 50, b.y); await wait(30)
  for (const dx of [83, 117, 150]) { await ev('pointermove', 42, false, b.x + dx, b.y); await wait(30) }
  const sMid = await S(page)
  ck('the pinch was under way (positive proof): the chart is a stretched picture', /scale\(/.test(sMid.wt || ''), `wrap transform "${sMid.wt}"`)
  /* the lifts of 41 and 42 never arrive; the next first finger */
  await ev('pointerdown', 43, true, b.x, b.y + 90); await wait(500)
  const s1 = await S(page)
  await pic(page, `${pre}-2-after-the-next-first-finger`)
  await ev('pointerup', 43, true, b.x, b.y + 90); await wait(300)
  const want = Math.min(3, s0.z * 2)
  ck('zoom about doubled (capped 300%)', Math.abs(s1.z - want) <= 0.03, `zoom ${s0.z} -> ${s1.z}, wanted about ${want.toFixed(3)}`)
  ck('label = round(zoom*100)', pctOk(s1), `label ${s1.pct} (was ${s0.pct}), zoom ${s1.z}`)
  ck('the stretch is gone (no inline transform on the wrap)', s1.wt === '', `"${s1.wt}"`)
  const tabsHow = await tabsFn()
  const s2 = await S(page)
  await pic(page, `${pre}-3-after-info-then-flow`)
  ck(`after a redraw (${tabsHow}) label and zoom unchanged`, s2.pct === s1.pct && s2.z === s1.z, `label ${s1.pct}->${s2.pct}, zoom ${s1.z}->${s2.z}`)
  /* an event's marking pop-up and back, no mark changed */
  const bb = await ballSpot(page, null, 20)
  if (!bb) ck('a ball to tap', false, 'none in view')
  else {
    await tapAt(cdp, bb.x, bb.y); await wait(400)
    const sp = await S(page)
    await pic(page, `${pre}-4-marking-popup-open`)
    ck('the marking pop-up opened (positive proof)', sp.pop, `pop=${sp.pop} on ball ${bb.id}`)
    await page.keyboard.press('Escape'); await wait(400)
    const s3 = await S(page)
    await pic(page, `${pre}-5-popup-closed`)
    ck('pop-up closed, label and zoom unchanged', !s3.pop && s3.pct === s1.pct && s3.z === s1.z, `pop=${s3.pop} label ${s1.pct}->${s3.pct}, zoom ${s1.z}->${s3.z}`)
  }
  return { pass: checks.every(c => c.ok), detail: checks.map(c => (c.ok ? 'ok ' : 'FAIL ') + c.n + ' [' + c.v + ']').join(' | '), measured: { s0, sMid, s1, s2, checks } }
}

/* P7: D134 */
async function d134(env, pre) {
  const { page, cdp } = env
  const b = await ballSpot(page, null, 110)
  if (!b) return { pass: false, detail: 'no ball in view' }
  const m = { x: b.x, y: b.y }
  const sc0 = await page.evaluate(() => { const e = document.getElementById('board'); return { max: e.scrollHeight - e.clientHeight } })
  await mark(page, m); await pic(page, `${pre}-1-before`); await unmark(page)
  await fingersDown(cdp, m, 80); await fingersMove(cdp, { m, d: 80 }, { m, d: 160 }, 12)
  await T(cdp, 'touchEnd', [{ x: m.x - 80, y: m.y, id: 1 }])      /* touchEnd naming the point lifts finger 1 only */
  await wait(300)
  const sLifted = await S(page)
  const s0 = await S(page)
  let y = m.y
  for (let i = 1; i <= 10; i++) { await wait(16); y = m.y - i * 15; await T(cdp, 'touchMove', [{ x: m.x + 80, y, id: 2 }]) }
  await wait(90)
  const s1 = await S(page)
  await mark(page, { x: m.x + 80, y }); await pic(page, `${pre}-2-after-the-one-finger-move`); await unmark(page)
  await T(cdp, 'touchEnd', []); await wait(400)
  const s2 = await S(page)
  /* control: the next finger scrolls it again (and the board can scroll at all) */
  const e = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); const bot = Math.min(r.bottom, innerHeight); for (let x = r.left + 20; x < Math.min(r.right, innerWidth) - 20; x += 13) { const yy = r.top + (bot - r.top) / 2, t = document.elementFromPoint(x, yy); if (t && !(t.closest && t.closest('.ball'))) return { x, y: yy } } return null })
  let s3 = s2
  if (e) { await T(cdp, 'touchStart', [{ x: e.x, y: e.y, id: 4 }]); for (let i = 1; i <= 10; i++) { await wait(16); await T(cdp, 'touchMove', [{ x: e.x, y: e.y - i * 15, id: 4 }]) } await wait(90); await T(cdp, 'touchEnd', []); await wait(400); s3 = await S(page) }
  const held = s1.st === s0.st && s1.sl === s0.sl && s2.st === s0.st && s2.sl === s0.sl && !s1.pop && !s2.pop && !(await page.evaluate(() => !!document.querySelector('#editModal,#infoModal,#dlgModal')))
  return { pass: held && sc0.max > 200 && s3.st !== s0.st, detail: `finger moved 150px after the other lifted: board scroll ${s0.st}/${s0.sl} -> during ${s1.st}/${s1.sl} -> after lift ${s2.st}/${s2.sl}; popup ${s1.pop}/${s2.pop}; board can scroll (max ${sc0.max}px); next ordinary drag scrolled ${s2.st} -> ${s3.st}`, measured: { sc0, sLifted, s0, s1, s2, s3 } }
}

/* real tabs (phone) or a viewport nudge (desktop without the tab bar) */
async function tabsRoundTrip(page) {
  if (await page.locator('button[data-view="info"]').isVisible()) {
    await page.tap('button[data-view="info"]'); await wait(500); await page.tap('button[data-view="flow"]'); await wait(700)
    return 'Info tab then Flow tab'
  }
  const vs = page.viewportSize()
  await page.setViewportSize({ width: 600, height: vs.height }); await wait(700); await page.setViewportSize(vs); await wait(900)
  return 'no tab bar on this size: the window made 600 wide (phone layout) and back'
}

/* ================= PHONE ================= */
{
  const env = await openCtx({ size: { width: 390, height: 844 }, phone: true })
  const { page, cdp, browser } = env
  await wait(500)
  console.log('PHONE context: innerWidth', await page.evaluate(() => innerWidth), 'start state', JSON.stringify(await S(page)))
  const recover = async () => { try { await T(cdp, 'touchEnd', []) } catch (_) {} ; if ((await S(page)).arrange) { try { await toggleEditReal(page) } catch (_) {} } }
  let p1 = null
  await scenario('P1', 'phone: ordinary pinch on a ball', 'the ball stays under the fingers within 6px; the label changes and equals round(zoom*100); no page error', env, async () => { const r = await ordinaryPinch(page, cdp, 'P1'); p1 = r.s1; return r }, recover)
  await scenario('P2', 'phone: Info tab then Flow tab after P1', 'label and zoom are the ones P1 reached', env, async () => {
    const how = await tabsRoundTrip(page); const s = await S(page); await pic(page, 'P2-1-back-on-flow')
    return { pass: !!p1 && s.pct === p1.pct && s.z === p1.z && s.wt === '', detail: `${how}: label ${p1 && p1.pct} -> ${s.pct}; zoom ${p1 && p1.z} -> ${s.z}` }
  }, recover)
  await scenario('P3', 'phone: Edit chart layout, pinch on empty canvas', 'canvas zooms (#viewport scale changes) with the canvas point under the fingers within 6px; no page error', env, async () => {
    await toggleEditReal(page)
    const inEdit = (await S(page)).arrange
    await pic(page, 'P3-0-edit-chart-layout')
    const r = await editPinch(page, cdp, 'P3')
    await toggleEditReal(page)
    const back = await S(page)
    await pic(page, 'P3-3-back-to-ordinary')
    return { pass: inEdit && r.pass && back.arrange === false && pctOk(back), detail: `in Edit chart layout=${inEdit}; ${r.detail}; after "✓ Done editing chart": arrange=${back.arrange} label ${back.pct} zoom ${back.z}` }
  }, recover)
  await scenario('P4', 'phone: Edit chart layout switched ON under a pinch', 'no page error; Edit chart layout on; #viewport does not change during the moves after the switch nor at the lift; a fresh pinch zooms the canvas; Done brings back the ordinary chart with label = zoom', env, () => underPinch(env, 'on', 'P4'), recover)
  await scenario('P5', 'phone: Edit chart layout switched OFF under a pinch', 'no page error; ordinary chart back; label and zoom do not change during the moves after the switch nor at the lift; a fresh ordinary pinch works', env, () => underPinch(env, 'off', 'P5'), recover)
  await scenario('P6', 'phone: the lost lift (synthetic, because Chromium never loses a lift: bug-check order 7.9)', 'after the next first finger the zoom is about doubled, label = round(zoom*100), no inline stretch; unchanged after Info->Flow and after a marking pop-up round trip; no page error', env, () => lostLift(env, 'P6', () => tabsRoundTrip(page), async () => { await page.tap('#fzReset'); await wait(600) }), recover)
  await scenario('P7', 'phone: D134, lift one finger of a pinch and move the other 150px', 'the chart does not scroll and nothing opens during that move; no page error', env, () => d134(env, 'P7'), recover)
  await browser.close()
}

/* ================= DESKTOP WITH TOUCH ================= */
{
  const env = await openCtx({ size: { width: 1400, height: 900 }, touchLaptop: true })
  const { page, cdp, browser } = env
  await wait(500)
  console.log('DESKTOP-TOUCH context (hasTouch, isMobile false): innerWidth', await page.evaluate(() => innerWidth), 'burger visible', await page.locator('#burger').isVisible().catch(() => false), 'start state', JSON.stringify(await S(page)))
  const recover = async () => { try { await T(cdp, 'touchEnd', []) } catch (_) {} ; if ((await S(page)).arrange) { try { await toggleEditReal(page) } catch (_) {} } }
  await scenario('D1', 'desktop with touch: ordinary pinch on a ball', 'as P1', env, () => ordinaryPinch(page, cdp, 'D1'), recover)
  await scenario('D2', 'desktop with touch: Edit chart layout switched ON under a pinch', 'as P4', env, () => underPinch(env, 'on', 'D2'), recover)
  await scenario('D3', 'desktop with touch: the lost lift (synthetic)', 'as P6: the zoom reached is kept', env, () => lostLift(env, 'D3', () => tabsRoundTrip(page), async () => { await page.click('#fzReset'); await wait(600) }), recover)
  await browser.close()
}

/* ================= DESKTOP, MOUSE: the three refusals ================= */
{
  const env = await openCtx({ size: { width: 1400, height: 900 } })
  const { page, browser } = env
  await wait(500)
  const flags = () => page.evaluate(() => ({
    save: !!document.getElementById('saveChanges'),
    undo: [...document.querySelectorAll('button')].filter(b => /ndo/.test(b.title || '')).map(b => (b.title || '').slice(0, 30) + (b.disabled ? ' [off]' : ' [on]')),
    edges: document.querySelectorAll('#flowSvg .edgehit').length,
  }))
  const clickBall = async id => { const c = await ballAt(page, id); await page.mouse.click(c.x, c.y); await wait(350) }
  await scenario('R1', 'desktop: Connect tool on a pair already joined', 'dialog reads exactly "That link already exists."; nothing changed', env, async () => {
    await page.click('#sylMenuBtn'); await wait(200); await page.click('#arrangeBtn'); await wait(700)
    const pair = await page.evaluate(() => {
      const b = document.getElementById('board').getBoundingClientRect(), vis = id => { const g = document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`); if (!g) return false; const r = g.getBoundingClientRect(); return r.left > b.left + 10 && r.right < Math.min(b.right, innerWidth) - 10 && r.top > b.top + 10 && r.bottom < Math.min(b.bottom, innerHeight) - 10 }
      for (const e of document.querySelectorAll('#flowSvg .edgehit')) { const p = e.getAttribute('data-p'), c = e.getAttribute('data-c'); if (p && c && vis(p) && vis(c)) return { p, c } }
      return null
    })
    if (!pair) return { pass: false, detail: 'no joined pair of events in view' }
    await page.locator('#arrTools button', { hasText: 'Connect' }).first().click(); await wait(300)
    const before = await flags()
    await pic(page, 'R1-1-connect-tool-chosen')
    await clickBall(pair.p); await pic(page, 'R1-2-first-event-clicked')
    const c = await ballAt(page, pair.c); await page.mouse.click(c.x, c.y)
    await page.waitForSelector('#dlgModal', { state: 'visible', timeout: 5000 })
    await wait(250)
    await pic(page, 'R1-3-the-dialog')
    const text = (await page.locator('#dlgMsg').innerText()).trim()
    const d = await dlg(page, {})
    await wait(300)
    const after = await flags()
    await pic(page, 'R1-4-after-OK')
    const same = JSON.stringify(before) === JSON.stringify(after)
    return { pass: /^That link already exists\.$/.test(text) && same, detail: `pair ${pair.p} -> ${pair.c}; dialog text "${text}" buttons ${JSON.stringify(d.labels)}; before ${JSON.stringify(before)} after ${JSON.stringify(after)}` }
  })
  await scenario('R2', 'desktop: Text tool, NOSUCH in the prerequisite links', 'the box shows "No such event: NOSUCH" and stays open; closed without saving', env, async () => {
    await page.locator('#arrTools button', { hasText: 'Text' }).first().click(); await wait(300)
    const spot = await ballSpot(page, null, 20)
    await page.mouse.click(spot.x, spot.y); await page.waitForSelector('#editModal', { state: 'visible', timeout: 5000 }); await wait(250)
    await page.fill('#edLinks', 'NOSUCH')
    await pic(page, 'R2-1-box-with-NOSUCH-typed')
    await page.click('#edSave'); await wait(400)
    const err = (await page.locator('#edErr').innerText()).trim(), open = await page.locator('#editModal').isVisible()
    await pic(page, 'R2-2-the-refusal')
    await page.click('#edCancel'); await wait(350)
    const closed = !(await page.locator('#editModal').isVisible().catch(() => false))
    await pic(page, 'R2-3-box-closed')
    return { pass: err === 'No such event: NOSUCH' && open && closed, detail: `ball ${spot.id}; error line "${err}"; box stayed open after save=${open}; closed after Cancel=${closed}` }
  })
  await scenario('R3', 'desktop: delete the only course', 'dialog reads exactly "Keep at least one course."; the course is still there', env, async () => {
    if ((await page.evaluate(() => document.getElementById('arrangeBtn') && document.getElementById('flowSvg').classList.contains('arrange')))) { await page.click('#sylMenuBtn'); await wait(200); await page.click('#arrangeBtn'); await wait(600) }
    const n0 = await core(page, c => c.coursesNow().map(x => x.name))
    if (n0.length !== 1) return { pass: null, detail: 'NOT WALKED: the world holds ' + n0.length + ' courses, not one' }
    await page.click('#courseMenuBtn'); await wait(250); await pic(page, 'R3-1-course-menu')
    await page.click('#delCourse'); await page.waitForSelector('#dlgModal', { state: 'visible', timeout: 5000 }); await wait(250)
    await pic(page, 'R3-2-the-dialog')
    const text = (await page.locator('#dlgMsg').innerText()).trim()
    await dlg(page, {}); await wait(400)
    const n1 = await core(page, c => c.coursesNow().map(x => x.name))
    await pic(page, 'R3-3-after-OK')
    return { pass: /^Keep at least one course\.$/.test(text) && n1.length === 1 && n1[0] === n0[0], detail: `courses before ${JSON.stringify(n0)}, after ${JSON.stringify(n1)}; dialog text "${text}"` }
  })
  await browser.close()
}

const pass = rows.filter(r => r.pass === true).length, fail = rows.filter(r => r.pass === false).length, nw = rows.filter(r => r.pass === null).length
console.log(`\n${VERSION}: ${pass} PASS, ${fail} FAIL, ${nw} NOT WALKED of ${rows.length}`)
save('trk-small-walk', { version: VERSION, served, local, rows })
