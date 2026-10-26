// M3 follow-ups walk (24 Oct 26) — the Leave War half: [LW-DAYLINE-PLACED-BID] (his D1296) and [LW-OPEN-MONTHS-QUICK-SWIPE]
// (his D1294), on the built bundle at 4311, his iPhone's size by real touch (402×874) and a desktop (1440×900). Written as the
// RIGHT behaviour: a PASS means correct. Usage: node lw-m3-follow-walk.mjs
import * as L from './lw-m3-follow-lib.mjs'
import { mkdirSync } from 'node:fs'
mkdirSync(L.OUT, { recursive: true })
const DAY = '2026-12-02', NEXT = '2026-12-03'
const ME = 'stiff'                                   // Saber, the admin's own row

for (const size of ['phone', 'desk']) {
  const w = await L.newCtx(size)
  const P = w.page, tag = size
  await L.signInPlain(w, 'admin')

  /* ---- D1296: his case — Required P set to what the day has, so his LL turns Available P red ---- */
  await L.reachCell(w, ME, DAY)
  const availNow = async iso => Number((await L.txt(P, `[data-testid="avail-p-${iso}"]`)) || NaN)
  if (!(await L.vis(P, `[data-testid="avail-p-${DAY}"]`))) { await P.evaluate(() => scrollTo(0, 0)); await L.press(w, L.T('counts-toggle')); await P.waitForTimeout(600) }
  const have = await availNow(DAY)
  const req = await L.setRequired(w, 'p', DAY, have)
  console.log(tag, 'Available P on 2 Dec', have, 'Required P set to', req)
  /* S1 — a new bid on the free day: before → after, red */
  await L.openCellR(w, ME, DAY, size === 'phone' ? `s1-new-${tag}-q` : null)
  await L.shot(w, `s1-new-${tag}`)
  const lineNew = await L.dayline(P)
  L.rec('S1 a new bid: before → after', tag, /→/.test(lineNew || '') && /red/.test(lineNew || '') ? 'PASS' : 'FAIL', lineNew, [`s1-new-${tag}`])
  const placed = await L.placeLeave(w, 'LL')
  L.rec('S1 the bid placed', tag, placed ? 'PASS' : 'FAIL', `window closed: ${placed}`, [])
  /* S2 — the window reopened on the day holding the bid: the day as it stands (his D1296) */
  await L.openCellR(w, ME, DAY, size === 'phone' ? `s2-held-${tag}-q` : null)
  await L.shot(w, `s2-held-${tag}`)
  const lineHeld = await L.dayline(P)
  const ok2 = !/→/.test(lineHeld || '') && /Available P\s*\d+(\.5)?\s*·\s*red/.test(lineHeld || '') && !/turns/.test(lineHeld || '')
  L.rec('S2 reopened on the held bid: "Available P <n> · red", no arrow, never "turns"', tag, ok2 ? 'PASS' : 'FAIL', lineHeld, [`s2-held-${tag}`])
  /* S3 — on the held day, Duration AM picked: still the day as it stands (the line follows Duration, D998) */
  if (await L.vis(P, L.T('portion-am'))) { await L.press(w, L.T('portion-am')); await P.waitForTimeout(300) }
  const lineHeld2 = await L.dayline(P)
  await L.shot(w, `s3-held-am-${tag}`)
  L.rec('S3 the held day with AM picked: still the standing line', tag, lineHeld2 && !/→/.test(lineHeld2) && /red/.test(lineHeld2) ? 'PASS' : 'FAIL', lineHeld2, [`s3-held-am-${tag}`])
  await L.closeWinIfOpen(w)
  /* S4 — a drag across the held day and the free day after it: the drag-selection window names the day it hurts most,
     its date first — the held day, red, as it stands */
  await L.reachCell(w, ME, NEXT)
  const c1 = await L.centre(P, L.T(L.cellId(ME, DAY)))
  const b2 = await P.locator(L.T(L.cellId(ME, NEXT))).boundingBox(), c2 = { x: b2.x + b2.width / 2, y: b2.y + b2.height / 2 }   // measured after the one scroll
  const path = [0, 0.25, 0.5, 0.75, 1].map(t => ({ x: Math.round(c1.x + (c2.x - c1.x) * t), y: Math.round(c1.y) }))
  if (w.phone) await L.holdDrag(w, path, 420)
  else { await P.mouse.move(c1.x, c1.y); await P.mouse.down(); await P.mouse.move((c1.x + c2.x) / 2, c1.y, { steps: 4 }); await P.mouse.move(c2.x, c2.y, { steps: 4 }); await P.mouse.up(); await P.waitForTimeout(500) }
  await L.shot(w, `s4-drag-${tag}`)
  const lineDrag = await L.dayline(P)
  L.rec('S4 a drag across the held day and the next: the held day named, red, as it stands', tag, lineDrag && /2 Dec|Wed/.test(lineDrag) && /red/.test(lineDrag) && !/turns/.test(lineDrag) ? 'PASS' : 'FAIL', lineDrag, [`s4-drag-${tag}`])
  await L.closeAny(w)
  /* S5 — Undo the bid: the window on the day is a new bid again (before → after) */
  await L.undo(w)
  await L.openCellR(w, ME, DAY)
  const lineUndo = await L.dayline(P)
  L.rec('S5 after Undo the day is free: before → after again', tag, /→/.test(lineUndo || '') ? 'PASS' : 'FAIL', lineUndo, [])
  await L.shot(w, `s5-undo-${tag}`)
  await L.closeWinIfOpen(w)
  /* S6 — Redo: held again, the standing line */
  await L.redo(w)
  await L.openCellR(w, ME, DAY)
  const lineRedo = await L.dayline(P)
  L.rec('S6 after Redo the held line again', tag, !/→/.test(lineRedo || '') && /red/.test(lineRedo || '') ? 'PASS' : 'FAIL', lineRedo, [])
  await L.closeWinIfOpen(w)

  /* S6b — HIS LITERAL CASE: a PENDING bid ("Approve what I enter" unticked), the window reopened on it */
  const have3 = await availNow(NEXT)
  await L.setRequired(w, 'p', NEXT, have3)
  await L.openCellR(w, ME, NEXT)
  if (await P.locator(L.T('bid-approve-tick')).isChecked()) { await L.press(w, L.T('bid-approve-tick-label')); await P.waitForTimeout(250) }
  const unt = !(await P.locator(L.T('bid-approve-tick')).isChecked())
  const placed3 = await L.placeLeave(w, 'LL')
  await L.openCellR(w, ME, NEXT)
  await L.shot(w, `s6b-pending-${tag}`)
  const linePend = await L.dayline(P)
  const pend = await L.vis(P, L.T('decide-approve'))
  L.rec('S6b his case: a PENDING bid reopened reads the day as it stands, red', tag, unt && placed3 && pend && linePend && !/→/.test(linePend) && /red/.test(linePend) && !/turns/.test(linePend) ? 'PASS' : 'FAIL', `unticked ${unt}, placed ${placed3}, pending (Approve offered) ${pend}: ${linePend}`, [`s6b-pending-${tag}`])
  await L.closeWinIfOpen(w)

  /* ---- D1294: the "Open for bidding" months, a finger at a person's speed (phone only) ---- */
  if (size === 'phone') {
    await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(300)
    await L.press(w, L.T('open-chip')); await P.waitForTimeout(500)
    const mid = k => P.locator(`[data-testid="od-month-${k}"]`).evaluate(e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })
    const st = () => P.locator('[data-testid^="od-month-"]').evaluateAll(els => els.map(e => `${e.dataset.testid.slice(9)}:${e.dataset.state}${e.disabled ? '/past' : ''}`))
    const swipe = async (a, b, stepMs, quick) => {
      const pt = i => [{ x: Math.round(a.x + (b.x - a.x) * i / 5), y: Math.round(a.y + (b.y - a.y) * i / 5), id: 1 }]
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) })
      for (let i = 1; i <= 5; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(i) }); await P.waitForTimeout(stepMs) }
      await P.waitForTimeout(90)   // the finger rests before it lifts, as a finger does (walk-scripts.md: a lift at full speed leaves the test browser in a fling that swallows the next tap)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      if (quick) { await P.waitForTimeout(60); await L.shot(w, quick) }
      await P.waitForTimeout(400)
    }
    const s0 = await st()
    console.log('months before', s0.join(' '))
    await L.shot(w, 's7-months-before')
    /* S7 — a quick move DOWN from OCT: the window scrolls, nothing opens */
    const oct = await mid('2026-10'), dec = await mid('2026-12')
    await swipe(oct, { x: oct.x + 3, y: oct.y + 80 }, 16)
    L.rec('S7 a quick move down is a scroll: nothing opens', tag, (await st()).join() === s0.join() ? 'PASS' : 'FAIL', (await st()).join(' '), [])
    /* S8 — his case: a quick sideways swipe OCT → DEC (16ms a step, no rest) */
    await swipe(await mid('2026-10'), await mid('2026-12'), 16, 's8-swipe-q')
    await L.shot(w, 's8-swipe')
    const s8 = await st()
    const ok8 = ['2026-10', '2026-11', '2026-12'].every(k => s8.some(x => x.startsWith(k) && /:(open|part)/.test(x)))
    L.rec('S8 a quick sideways swipe OCT → DEC opens all three (OCT from today)', tag, ok8 ? 'PASS' : 'FAIL', s8.join(' '), ['s8-swipe', 's8-swipe-q'])
    await L.shot(w, 's8-lines', { fullPage: false })
    /* S9 — the same quick swipe back across them closes all three (a drag that starts on an open month closes) */
    await swipe(await mid('2026-12'), await mid('2026-10'), 16)
    const s9 = await st()
    L.rec('S9 a quick swipe back DEC → OCT closes them', tag, ['2026-11', '2026-12'].every(k => s9.includes(`${k}:closed`)) ? 'PASS' : 'FAIL', s9.join(' '), [])
    /* S10 — the slow drag, finger rested first */
    await L.holdDrag(w, [await mid('2026-10'), await mid('2026-11'), await mid('2026-12')], 320)
    const s10 = await st()
    L.rec('S10 a slow drag (rested first) still opens OCT → DEC', tag, ['2026-11', '2026-12'].every(k => s10.includes(`${k}:open`)) ? 'PASS' : 'FAIL', s10.join(' '), [])
    /* S11 — a tap closes one month */
    const nov = await mid('2026-11')
    await L.finger(w, nov.x, nov.y, 0, 's11-tap-q')
    const s11 = await st()
    L.rec('S11 a tap on NOV closes it alone', tag, s11.includes('2026-11:closed') && s11.includes('2026-12:open') ? 'PASS' : 'FAIL', s11.join(' '), ['s11-tap-q'])
    await L.shot(w, 's11-tap')
    /* S12 — a quick swipe over the locked past months opens nothing there (D1268) */
    const jul = await mid('2026-07'), sep = await mid('2026-09')
    await swipe(jul, sep, 16)
    const s12 = await st()
    L.rec('S12 a quick swipe across past months changes nothing', tag, ['2026-07', '2026-08', '2026-09'].every(k => s12.find(x => x.startsWith(k)) === s0.find(x => x.startsWith(k))) ? 'PASS' : 'FAIL', s12.join(' '), [])
    /* S13 — one Undo takes the quick swipe's opening back whole (one command — the red team's B12) */
    await L.shot(w, 's12-before-close')
    await L.press(w, '[data-testid="open-dates-close"]'); await P.waitForTimeout(500)
    if (await L.vis(P, '[data-testid="open-dates"]')) throw new Error('S13: the window did not close')
    await L.undo(w)
    await L.press(w, L.T('open-chip')); await P.waitForTimeout(500)
    const s13 = await st()
    L.rec('S13 one Undo takes back the tap only (NOV open again)', tag, s13.includes('2026-11:open') ? 'PASS' : 'FAIL', s13.join(' '), [])
    await L.shot(w, 's13-undo')
  }
  console.log('ERRS', tag, w.errs.length ? w.errs.join('\n') : 'none')
  await w.ctx.close()
}
await L.closeBrowser()
const fails = L.results.filter(r => r.verdict === 'FAIL')
console.log(`\n${L.results.length} lines, ${fails.length} FAIL`)
