// Walker script 2 (6 Nov 26): S2 (d) a double tap on a leave button.  SIZE=desk|phone  ENGINE=chromium (phone only)  CASE=gaps|targets
process.env.LW_OUT ||= process.env.LW_DIST === 'dist-before' ? '2026-11-06-lw-faults/walk-before' : '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w2' + (process.env.LW_DIST === 'dist-before' ? 'b' : '')
const { L, row, T, openNow, elAt, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w2 v1]', L.SIZE, L.DIST, process.env.ENGINE || '')
const SIZE = L.SIZE, ENG = process.env.ENGINE || (SIZE === 'phone' ? 'webkit' : 'chromium')
const TAG = `${SIZE}${ENG === 'chromium' && SIZE === 'phone' ? 'c' : ''}${process.env.LW_DIST === 'dist-before' ? 'B' : ''}`
const w = await fresh(SIZE, 'admin', SIZE === 'phone' && ENG === 'chromium' ? 'chromium' : undefined)
const P = w.page
const id = await L.pidOf(P, 'Drifter')
await L.openCell(w, id, L.day(9)); await L.autoApprove(w, false); await L.closeWin(w)
const pendingCount = async d => (await L.cellWords(w, id, d))
let sec = 0
async function oneCase(name, d, gap, { dbl = false, between = null } = {}) {
  await L.settle(w)
  await L.openCell(w, id, d)
  const ll = await L.centre(P, T('bid-LL'))
  const t = ll
  let under, t1end, t2start
  if (dbl) {
    await P.mouse.dblclick(t.x, t.y, { delay: 40 }); await P.waitForTimeout(700)
    under = '(browser double click)'
  } else {
    await L.finger(w, t.x, t.y)
    t1end = Date.now()
    if (between) await between(t)
    await P.waitForTimeout(Math.max(0, gap - (Date.now() - t1end) - 25))
    under = await elAt(P, t.x, t.y)
    t2start = Date.now()
    await L.finger(w, t.x, t.y, `s2-${TAG}-${name}-t2q`)
    await P.waitForTimeout(800)
  }
  const open = await openNow(P)
  const cell = await pendingCount(d)
  await L.shot(w, `s2-${TAG}-${name}-settled`)
  return { under, open, cell, realGap: t2start ? t2start - t1end : null, ll: { x: Math.round(t.x), y: Math.round(t.y) } }
}
try {
  if (SIZE === 'phone' && process.env.CASE === 'cell') {
    const rid = await L.pidOf(P, 'Reaper'), d = L.day(13)
    for (const g of [170]) {
      await L.settle(w)
      await L.openCell(w, id, d)
      const ll = await L.centre(P, T('bid-LL'))
      await L.reachCell(w, rid, L.day(14))
      const cb = await P.locator(T(L.cellId(rid, L.day(14)))).first().boundingBox()
      const cp = { x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 }
      const hit = await elAt(P, cp.x, cp.y)
      await L.finger(w, ll.x, ll.y); const t1 = Date.now()
      await P.waitForTimeout(g - 40)
      await L.finger(w, cp.x, cp.y, 's2-' + TAG + '-cell-t2q'); const gp = Date.now() - t1
      await P.waitForTimeout(800)
      const open = await openNow(P)
      await L.shot(w, 's2-' + TAG + '-cell-settled')
      row('S2-target-cell', TAG, 'tap LL, then ~170 ms later a tap on a DAY CELL (Reaper, another point than LL: the guard is the grid, not one point); real gap ' + gp + ' ms', 'EXPECTED nothing opens. point held ' + hit + '; open after=' + JSON.stringify(open) + '; cell d=' + await L.cellWords(w, id, d), open.length === 0 && (await L.cellWords(w, id, d)).includes('LL') ? 'PASS' : 'FAIL', ['s2-' + TAG + '-cell-t2q', 's2-' + TAG + '-cell-settled'])
    }
  } else if (SIZE === 'phone') {
    const gaps = [[120, 9], [170, 10], [400, 11], [700, 12]]
    for (const [g, dn] of gaps) {
      const d = L.day(dn)
      const r = await oneCase(`g${g}`, d, g)
      const placedOnce = (r.cell.match(/LL/g) || []).length === 1
      let v, exp
      if (g < 450) { exp = 'LL placed once, nothing open'; v = placedOnce && r.open.length === 0 ? 'PASS' : 'FAIL' }
      else { exp = 'LL placed once; the second tap (after the moment) opens what is under it'; v = placedOnce ? (r.open.length ? 'PASS' : 'RECORD') : 'FAIL' }
      row(`S2-gap${g}`, TAG, `tap LL, tap again at the same point after ~${g} ms (real ${r.realGap} ms)`, `EXPECTED ${exp}. Second tap landed on ${r.under}; cell=${r.cell}; open after=${JSON.stringify(r.open)}; LL at ${JSON.stringify(r.ll)}`, v, [`s2-${TAG}-g${g}-t2q`, `s2-${TAG}-g${g}-settled`])
    }
  } else {
    const r = await oneCase('dbl', L.day(9), 0, { dbl: true })
    const once = (r.cell.match(/LL/g) || []).length === 1
    row('S2-dblclick', TAG, 'page.mouse.dblclick on LL', `EXPECTED LL placed once, nothing open. cell=${r.cell}; open after=${JSON.stringify(r.open)}; LL at ${JSON.stringify(r.ll)}`, once && r.open.length === 0 ? 'PASS' : 'FAIL', [`s2-${TAG}-dbl-settled`])
    // one click on LL then ~200 ms later a single click on another day's cell
    await L.settle(w)
    const d2 = L.day(11), d3 = L.day(12)
    await L.openCell(w, id, d2)
    const ll = await L.centre(P, T('bid-LL'))
    await P.mouse.click(ll.x, ll.y)
    const t0 = Date.now()
    const tgt = await L.centre(P, T(L.cellId(id, d3)))
    await P.waitForTimeout(Math.max(0, 200 - (Date.now() - t0)))
    await P.mouse.click(tgt.x, tgt.y)
    await P.waitForTimeout(700)
    const open = await openNow(P)
    await L.shot(w, `s2-${TAG}-click-next`)
    const text = await P.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || '').slice(0, 60).replace(/\s+/g, ' '))
    row('S2-click-next', TAG, 'one click on LL, ~200 ms later one single click on another day\'s cell', `EXPECTED that day's window opens. open=${JSON.stringify(open)}; window says: ${text}; cell d2=${await L.cellWords(w, id, d2)}`, open.includes('bid-picker') ? 'PASS' : 'FAIL', [`s2-${TAG}-click-next`])
  }
} catch (e) { console.log('ERR', e.stack); row('S2', TAG, 'script', 'stopped: ' + String(e).slice(0, 300), 'NOT WALKED') }
console.log('errs', JSON.stringify(w.errs))
finish('w2-' + TAG)
await L.closeBrowser()
