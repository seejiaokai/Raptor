// WALKER 1 — scenario 21 (at a person's speed: a quick next tap, a double tap, a month button the bubble covers).
// Usage, from raptor-port/:  LW_PORT=4180 [WHICH=phone-chromium,phone-webkit,desk] node scripts/handpass/lw-night-w1-j.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-j v1', L.OUT, 'port', L.PORT)
const WHICH = (process.env.WHICH || 'phone-chromium,phone-webkit').split(',')
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s21-/.test(f) && WHICH.some(s => f.includes(`-${s}-`))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function f1(w, iso) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0)); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
/* a raw tap with no picture: a finger on a phone (CDP) or Playwright's touchscreen on WebKit */
async function rawTap(w, x, y, hold = 30) {
  if (w.cdp) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await w.page.waitForTimeout(hold); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
  else await w.page.touchscreen.tap(x, y)
}
const stamp = () => Date.now()
async function centreOf(P, sel) { const b = await P.locator(sel).first().boundingBox(); if (!b) throw new Error('no box for ' + sel); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
const undoState = P => P.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? { disabled: u.disabled || u.getAttribute('aria-disabled') === 'true', title: u.title || u.getAttribute('aria-label') } : null })

for (const which of WHICH) {
  const engine = which.endsWith('webkit') ? 'webkit' : 'chromium'
  const size = which
  const w = await H.startWorld('phone', engine)
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { rec(id, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}) } }

  /* (1) with the bubble up, tap another man's day within ~300 ms → the bubble goes, the window opens; place → a new bubble */
  await sc('S21.1 a quick next tap', async () => {
    const D = '2026-12-15', D2 = '2026-12-16'
    await f1(w, D); await f1(w, D2)
    await P.evaluate(() => window.scrollTo(0, 0))
    // the first bid, taken with its picture; the bubble is up
    const r = await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false, name: `s21-${size}-1-first-after-tap` })
    const b0 = await H.bubbleNow(P)
    if (b0.where === 'none') throw new Error('premise: no bubble after the first bid')
    // another man's day, tapped quickly (the target found first, then a finger ~250 ms after the bubble reading)
    await L.reachCell(w, ids.Ridge, D2)
    const c2 = await centreOf(P, T(L.cellId(ids.Ridge, D2)))
    const t0 = stamp()
    await P.waitForTimeout(150)
    await rawTap(w, c2.x, c2.y)
    const dt = stamp() - t0
    await P.waitForTimeout(100)
    const b1 = await H.bubbleNow(P)
    const picker = await L.vis(P, T('bid-picker'))
    const pic1 = await H.settled(w, `s21-${size}-1-quick-tap-100ms`)
    await H.setSwitch(w, false)
    const seen = await H.tapPic(w, T('bid-LL'), `s21-${size}-1-second-after-tap`)
    await P.waitForTimeout(600)
    const ask = await L.vis(P, T('bid-picker'))
    const seen2 = ask ? await H.tapPic(w, T('bid-LL'), `s21-${size}-1-second-after-tap`) : seen
    await P.waitForTimeout(600)
    const b2 = await H.bubbleNow(P), k = await H.kinds(w, ids.Ridge, D2)
    judge('S21.1 a quick next tap while the bubble is up', size, [
      ['the first bubble was up', b0.where !== 'none', H.bubbleLine(b0)],
      [`the bubble went at the next tap (${dt} ms after the reading)`, b1.where === 'none', H.bubbleLine(b1)],
      ['the window opened at that same tap (not swallowed)', picker, `picker visible=${picker}`],
      ['the placed bid raised a new bubble', b2.where !== 'none' && b2.level === 'red' && /^This bid/.test(b2.text) && RED.border.test(b2.border || ''), H.bubbleLine(b2)],
      ['LL pending for Ridge on 16 Dec', k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
    ], `quick tap ~${dt} ms after the bubble was read; 100 ms after it: ${H.bubbleLine(b1)}, window ${picker ? 'open' : 'NOT open'}; the new bubble: ${H.bubbleLine(b2)}`, [`s21-${size}-1-quick-tap-100ms.png`, `s21-${size}-1-second-after-tap.png`])
    await H.dismissBubble(w)
  })

  /* (2) a double tap (~150 ms) on a leave button → one bid, one bubble, one Undo */
  await sc('S21.2 a double tap on a leave button', async () => {
    const D = '2026-12-17'
    await P.evaluate(() => window.scrollTo(0, 0))
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Gambit, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    await H.setManningView(w, true)
    const c = await centreOf(P, T('bid-LL'))
    const kBefore = (await H.kinds(w, ids.Gambit, D)).join('+')
    const aBefore = await availCell(P, D).catch(() => null)
    const u0 = await undoState(P)
    await rawTap(w, c.x, c.y)
    await P.waitForTimeout(60)
    const bBetween = await H.bubbleNow(P)
    await P.waitForTimeout(40)
    await rawTap(w, c.x, c.y)
    await P.waitForTimeout(120)
    const bQuick = await H.bubbleNow(P)
    const quickPic = await H.settled(w, `s21-${size}-2-double-tap-after`)
    await P.waitForTimeout(700)
    const b = await H.bubbleNow(P)
    const stillOpen = await L.vis(P, T('bid-picker')), other = await L.vis(P, T('daylist-sheet'))
    const k = await H.kinds(w, ids.Gambit, D)
    const a1 = await availCell(P, D).catch(() => null)
    const nBubbles = await P.evaluate(() => document.querySelectorAll('[data-testid="manning-bubble"], [data-testid="manning-bubble-foot"]').length)
    const stray = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid], [data-testid="person-figures"], [data-testid="daylist-sheet"], .qualpop')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid || e.className))
    const underPoint = await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.className || e.tagName).toString().slice(0, 50) : null }, [c.x, c.y])
    // one Undo: the bid goes, and nothing else is left (a second Undo would be a different act)
    if (stray.length) { await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300); await P.mouse.click(5, 5).catch(() => {}); await P.waitForTimeout(300) }
    await P.evaluate(() => window.scrollTo(0, 0))
    await rawTap(w, ...Object.values(await centreOf(P, '#undoBtn')))
    await P.waitForTimeout(700)
    const kU = await H.kinds(w, ids.Gambit, D)
    const aU = await availCell(P, D).catch(() => null)
    judge('S21.2 a double tap (~150 ms) on LL', size, [
      ['one LL pending on the cell', k.length === 1 && /^LL\|k-ll\|s-w/.test(k[0]), JSON.stringify(k)],
      ['the second tap did not place a second bid or open the bid window again', !stillOpen && !other, `bid-picker=${stillOpen} daylist=${other}`],
      ['one bubble was raised between the two taps (red, "This bid …"), and not a second one after', bBetween.where !== 'none' && bBetween.level === 'red' && /^This bid/.test(bBetween.text) && nBubbles <= 1, `between the taps: ${H.bubbleLine(bBetween)}; after: ${nBubbles} node(s)`],
      ['one Undo takes the bid away', kU.length === 0, `after one Undo: ${JSON.stringify(kU)}; Available P ${a1} → ${aU}`],
    ], `two taps ~${110 + 60} ms apart; between the taps (~60 ms after the first lifted): ${H.bubbleLine(bBetween)}; 120 ms after the second: ${H.bubbleLine(bQuick)} (the second tap ends the bubble: any tap does); settled: ${H.bubbleLine(b)}; Undo: ${u0 ? JSON.stringify(u0) : 'n/a'}; Available P ${aBefore} → ${a1} → (one Undo) ${aU}; the second tap landed on "${underPoint}" (the LL button's former place) and left open: ${JSON.stringify(stray)}`, [`s21-${size}-2-double-tap-after.png`])
    await H.dismissBubble(w)
  })

  /* (3) a tap on a month button the bubble covers */
  await sc('S21.3 a tap on a month button the bubble covers', async () => {
    const D = '2026-12-18'
    await P.evaluate(() => window.scrollTo(0, 0))
    await f1(w, D)
    await H.bidType(w, ids.Ridge, D, { type: 'LL', inView: true, approve: false })
    await L.gotoMonth(w, 'DEC')
    const lit0 = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].filter(e => e.getAttribute('aria-pressed') === 'true' || /\bon\b|active|sel/.test(e.className)).map(e => e.dataset.testid))
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    // a fresh bubble: Hunter's bid at the same F1 day
    const r = await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false })
    const b0 = await H.bubbleNow(P)
    if (b0.where !== 'mid') throw new Error('premise: no bubble under the button: ' + H.bubbleLine(b0))
    // the month button the bubble covers: the one whose box the bubble's centre-line crosses
    const target = await P.evaluate(() => {
      const bub = document.querySelector('[data-testid="manning-bubble"]').getBoundingClientRect()
      const ov = m => Math.max(0, Math.min(m.r.right, bub.right) - Math.max(m.r.left, bub.left)) * Math.max(0, Math.min(m.r.bottom, bub.bottom) - Math.max(m.r.top, bub.top))
      const all = [...document.querySelectorAll('[data-testid^="month-"]')].filter(e => /^month-[A-Z]{3}$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid, r: e.getBoundingClientRect() }))
      const hit = all.map(m => ({ ...m, o: ov(m) })).sort((a, b) => b.o - a.o)[0]
      return hit && hit.o > 0 ? { id: hit.id, x: Math.max(hit.r.left + 2, Math.min(hit.r.right - 2, (Math.max(hit.r.left, bub.left) + Math.min(hit.r.right, bub.right)) / 2)), y: Math.max(hit.r.top + 2, Math.min(hit.r.bottom - 2, (Math.max(hit.r.top, bub.top) + Math.min(hit.r.bottom, bub.bottom)) / 2)), bub: [Math.round(bub.left), Math.round(bub.top), Math.round(bub.right), Math.round(bub.bottom)], btn: [Math.round(hit.r.left), Math.round(hit.r.top), Math.round(hit.r.right), Math.round(hit.r.bottom)], all: all.map(m => m.id + ':' + Math.round(m.r.left) + ',' + Math.round(m.r.top)).join(' ') } : { none: true, bub: [Math.round(bub.left), Math.round(bub.top), Math.round(bub.right), Math.round(bub.bottom)], all: all.map(m => m.id + ':' + Math.round(m.r.left) + ',' + Math.round(m.r.top)).join(' ') }
    })
    if (!target || target.none) throw new Error('no month button under the bubble: ' + JSON.stringify(target))
    const monthBefore = await P.evaluate(() => document.querySelector('td[data-testid$="-2026-12-18"]') ? 'DEC drawn' : 'DEC not drawn')
    await rawTap(w, target.x, target.y)
    await P.waitForTimeout(100)
    const b1 = await H.bubbleNow(P)
    const pic100 = await H.settled(w, `s21-${size}-3-month-tap-100ms`)
    await P.waitForTimeout(1300)
    const b2 = await H.bubbleNow(P)
    const first = await P.evaluate(() => { const hd = [...document.querySelectorAll('[data-testid^="head-"]')].find(e => e.getBoundingClientRect().left > 150 && e.getBoundingClientRect().right < innerWidth); return hd ? hd.dataset.testid : null })
    const monthAfter = await P.evaluate(() => [...document.querySelectorAll('td[data-testid^="head-"], th[data-testid^="head-"]')].filter(e => e.getBoundingClientRect().right > 120 && e.getBoundingClientRect().left < innerWidth).slice(0, 2).map(e => e.dataset.testid))
    const pic = await H.settled(w, `s21-${size}-3-month-tap-settled`)
    const moved = monthAfter.length && !/2026-12/.test(monthAfter[0] || '') && !/2026-11-(2|3)/.test(monthAfter[0] || '')
    rec('S21.3 a tap on the month button the bubble covers (RECORD)', size, 'RECORD', `the bubble ${JSON.stringify(target.bub)} covered ${target.id} (${JSON.stringify(target.btn)}), tapped at (${Math.round(target.x)}, ${Math.round(target.y)}); right after the finger lifted (~100 ms): ${H.bubbleLine(b1)}; ${monthBefore}; the grid's first visible date heads after the tap: ${JSON.stringify(monthAfter)} (${moved ? 'the month button WAS pressed: the grid moved' : 'the grid did NOT move — the tap only dismissed the bubble'}); 1.4 s after: ${H.bubbleLine(b2)}`, [`s21-${size}-3-month-tap-100ms.png`, pic])
  })
  rec('errors-21', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`j-${WHICH.join('-')}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
