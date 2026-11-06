// Walker script 3 (6 Nov 26): S3 the drag window, S4 ways out and presses not eaten.  SIZE=desk|phone  ONLY=s3|s4
process.env.LW_OUT ||= process.env.LW_DIST === 'dist-before' ? '2026-11-06-lw-faults/walk-before' : '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w3' + (process.env.LW_DIST === 'dist-before' ? 'b' : '')
const { L, row, T, openNow, elAt, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w3 v1]', L.SIZE, L.DIST)
const SIZE = L.SIZE, PH = SIZE === 'phone'
const w = await fresh(SIZE)
const P = w.page
const id = await L.pidOf(P, 'Drifter'), rid = await L.pidOf(P, 'Reaper')
const ONLY = process.env.ONLY || ''
const cw = (pid, d) => L.cellWords(w, pid, d)
const gapTap = async (pt, name) => {
  if (!PH) { await P.mouse.dblclick(pt.x, pt.y, { delay: 40 }); await P.waitForTimeout(700); return { gap: 'dblclick' } }
  await L.finger(w, pt.x, pt.y); const t = Date.now()
  await P.waitForTimeout(130)
  const under = await elAt(P, pt.x, pt.y)
  const g0 = Date.now() - t; await L.finger(w, pt.x, pt.y, name); await P.waitForTimeout(800)
  return { gap: g0, under }
}
// first open the Drifter's day once so Auto-approve is set OFF (remembered)
await L.openCell(w, id, L.day(9)); await L.autoApprove(w, false); await L.closeWin(w); await L.settle(w)
try {
  if (!ONLY || ONLY === 's3') {
    const d1 = L.day(20), d2 = L.day(21), d3 = L.day(22)
    const sheet = await L.dragCells(w, [id, d1], [id, d3])
    await L.shot(w, `s3-${SIZE}-1-drag-window`)
    const ll = await L.centre(P, T('sel-LL'))
    const r = await gapTap(ll, `s3-${SIZE}-2-t2q`)
    const words = [await cw(id, d1), await cw(id, d2), await cw(id, d3)]
    const open = await openNow(P)
    await L.shot(w, `s3-${SIZE}-3-after`)
    const once = words.every(x => (x.match(/LL/g) || []).length === 1)
    row('S3-drag-dbl', SIZE, `drag Drifter ${d1}..${d3} (window up: ${sheet}), tap sel-LL then tap again at its point (${r.gap}${r.gap === 'dblclick' ? '' : ' ms'})`, `EXPECTED three bids written once, nothing opened. second tap on ${r.under || '-'}; cells=${JSON.stringify(words)}; open after=${JSON.stringify(open)}`, sheet && once && open.length === 0 ? 'PASS' : 'FAIL', [`s3-${SIZE}-1-drag-window`, `s3-${SIZE}-3-after`])
    // a fill over a block holding a day that already holds leave
    await L.settle(w)
    const e1 = L.day(23), e2 = L.day(24)
    await L.openCell(w, id, e2); await L.autoApprove(w, true); await L.placeLeave(w, 'OL'); await L.settle(w); await L.openCell(w, id, e2); const ap = await L.autoApprove(w, false); await L.closeWin(w); await L.settle(w)
    const before2 = await cw(id, e2)
    const sheet2 = await L.dragCells(w, [id, e1], [id, e2])
    const ll2 = await L.centre(P, T('sel-LL'))
    await L.finger(w, ll2.x, ll2.y); await P.waitForTimeout(700)
    const stays = await L.vis(P, T('select-sheet')) || await L.vis(P, T('sel-sheet'))
    const note = await P.evaluate(() => { const e = document.querySelector('[data-testid="select-sheet"],[data-testid="sel-sheet"]'); const t = (e?.innerText || '').replace(/\s+/g, ' '); const m = t.match(/\d+ written[^.]*\.[^.]*\./); return m ? m[0] : t.slice(0, 200) })
    await L.shot(w, `s3-${SIZE}-4-skipped-note`)
    // a second tap on LL inside the still-open window
    const open1 = await openNow(P)
    const again = await L.centre(P, T('sel-LL')).catch(() => null)
    let after2 = null, open2 = null
    if (again) { await L.finger(w, again.x, again.y, `s3-${SIZE}-5-second-q`); await P.waitForTimeout(800); open2 = await openNow(P); after2 = [await cw(id, e1), await cw(id, e2)]; await L.shot(w, `s3-${SIZE}-6-second-settled`) }
    row('S3-skipped', SIZE, `OL on ${e2}, then drag ${e1}..${e2} (window ${sheet2}), tap LL once`, `EXPECTED the window STAYS with a "1 written. 1 skipped…" note. window stays=${stays}; note="${note}"; cell ${e2} before=${before2}; open=${JSON.stringify(open1)}`, stays && /1 written/.test(note) && /skipped/.test(note) ? 'PASS' : 'FAIL', [`s3-${SIZE}-4-skipped-note`])
    row('S3-second-in-open', SIZE, 'a second tap on LL inside the still-open window', `EXPECTED it behaves as the window's own button (the guard not armed while it is open). after cells ${e1},${e2}=${JSON.stringify(after2)}; open=${JSON.stringify(open2)}; the window was still offered the button: ${!!again}`, again ? 'RECORD' : 'NOT WALKED', [`s3-${SIZE}-5-second-q`, `s3-${SIZE}-6-second-settled`])
    await L.settle(w)
  }
  if (!ONLY || ONLY === 's4') {
    // (a) phone: the window's X tapped twice ~170 ms apart
    const da = L.day(27)
    await L.openCell(w, id, da)
    const x = await L.centre(P, T('bid-cancel'))
    let under, gap
    if (PH) {
      await L.finger(w, x.x, x.y); const t = Date.now(); await P.waitForTimeout(110)
      under = await elAt(P, x.x, x.y)
      gap = Date.now() - t; await L.finger(w, x.x, x.y, `s4-${SIZE}-a-t2q`); await P.waitForTimeout(800)
    } else { await P.mouse.dblclick(x.x, x.y, { delay: 40 }); under = '(dblclick)'; gap = 'dblclick'; await P.waitForTimeout(800) }
    const oa = await openNow(P)
    await L.shot(w, `s4-${SIZE}-a-settled`)
    row('S4a', SIZE, `bid window's X ${PH ? 'tapped twice' : 'double-clicked'} (${gap})`, `EXPECTED closes, nothing opens behind. second tap on ${under}; open after=${JSON.stringify(oa)}`, oa.length === 0 ? 'PASS' : 'FAIL', [`s4-${SIZE}-a-settled`])
    await L.settle(w)
    // (b) bid window open, tap another day
    await L.openCell(w, id, L.day(28))
    const tgtDay = L.day(29)
    await L.reachCell(w, rid, tgtDay)
    const cb = await P.locator(T(L.cellId(rid, tgtDay))).first().boundingBox()
    const onwin = await elAt(P, cb.x + cb.width / 2, cb.y + cb.height / 2)
    await L.finger(w, cb.x + cb.width / 2, cb.y + cb.height / 2, `s4-${SIZE}-b-q`); await P.waitForTimeout(800)
    const title = await P.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || '').slice(0, 40).replace(/\s+/g, ' '))
    await L.shot(w, `s4-${SIZE}-b-settled`)
    row('S4b', SIZE, 'bid window open, tap another man\'s day on the grid', `EXPECTED that day's window opens. point held ${onwin}; window now says "${title}"`, /Reaper/.test(title) && title.includes(String(+tgtDay.slice(8))) ? 'PASS' : 'FAIL', [`s4-${SIZE}-b-settled`])
    await L.settle(w)
    // (c) day panel, close twice (phone) / record on desktop too
    await scrollTopLocal()
    const th = P.locator(`th.day[data-d="${L.day(14)}"]`).first()
    await th.scrollIntoViewIfNeeded().catch(() => {})
    const tb = await th.boundingBox()
    if (!tb) row('S4c', SIZE, 'open the day panel', 'no date header found', 'NOT WALKED')
    else {
      await L.finger(w, tb.x + tb.width / 2, tb.y + tb.height / 2); await P.waitForTimeout(700)
      const up = await L.vis(P, T('win-lwday'))
      await L.shot(w, `s4-${SIZE}-c-panel`)
      if (!up) row('S4c', SIZE, 'tap the date header', 'day panel did not open (open: ' + JSON.stringify(await openNow(P)) + ')', 'NOT WALKED', [`s4-${SIZE}-c-panel`])
      else {
        const xb = await L.centre(P, T('win-lwday-x'))
        let under2, gap2
        if (PH) { await L.finger(w, xb.x, xb.y); const t = Date.now(); await P.waitForTimeout(110); under2 = await elAt(P, xb.x, xb.y); gap2 = Date.now() - t; await L.finger(w, xb.x, xb.y, `s4-${SIZE}-c-t2q`) }
        else { await P.mouse.dblclick(xb.x, xb.y, { delay: 40 }); under2 = '(dblclick)'; gap2 = 'dblclick' }
        await P.waitForTimeout(800)
        const oc = await openNow(P)
        await L.shot(w, `s4-${SIZE}-c-settled`)
        row('S4c', SIZE, `day panel X ${PH ? 'tapped twice' : 'double-clicked'} (${gap2}) — this window is not guarded`, `RECORD only: second tap landed on ${under2}; open after=${JSON.stringify(oc)}`, 'RECORD', [`s4-${SIZE}-c-panel`, `s4-${SIZE}-c-settled`])
        await L.closeWin(w)
      }
    }
    await L.settle(w)
    // (d) desktop: Escape closes the bid window, then within ~200 ms a mouse click on a day
    if (!PH) {
      await L.openCell(w, id, L.day(30))
      const t2 = L.day(31)
      await L.reachCell(w, rid, t2)
      const tb2 = await P.locator(T(L.cellId(rid, t2))).first().boundingBox()
      await P.keyboard.press('Escape'); const t0 = Date.now()
      await P.waitForTimeout(150)
      await P.mouse.click(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2)
      const g = Date.now() - t0
      await P.waitForTimeout(700)
      const od = await openNow(P)
      await L.shot(w, `s4-${SIZE}-d-settled`)
      row('S4d', SIZE, `Escape closes the bid window, ~${g} ms later one mouse click on a day`, `EXPECTED the day's window opens. open after=${JSON.stringify(od)}`, od.includes('bid-picker') ? 'PASS' : 'FAIL', [`s4-${SIZE}-d-settled`])
      await L.settle(w)
    } else row('S4d', SIZE, 'desktop-only step', 'not run on the phone', 'NOT WALKED')
    // (e) phone: a leave placed (window closed), within ~200 ms tap a month button
    if (PH) {
      await L.openCell(w, id, L.day(32))
      const ll = await L.centre(P, T('bid-LL'))
      await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
      const llNow = await L.centre(P, T('bid-LL'))
      const mbb = await P.locator(T('month-OCT')).first().boundingBox()
      const mb = { x: mbb.x + mbb.width / 2, y: mbb.y + mbb.height / 2 }
      const was = await P.evaluate(() => document.querySelector('[data-testid="month-strip"] .mjump.on')?.textContent?.trim())
      await L.finger(w, llNow.x, llNow.y); const t0 = Date.now()
      await P.waitForTimeout(120)
      const g = Date.now() - t0
      await L.finger(w, mb.x, mb.y, `s4-${SIZE}-e-q`)
      await P.waitForTimeout(1200)
      const now = await P.evaluate(() => document.querySelector('[data-testid="month-strip"] .mjump.on')?.textContent?.trim())
      const dec15 = await P.evaluate(() => !!document.querySelector('td[data-testid$="-2026-10-15"]'))
      const lead = await P.evaluate(() => { const c = document.querySelector('td[data-testid^="cell-"]'); return null })
      await L.shot(w, `s4-${SIZE}-e-settled`)
      row('S4e', SIZE, `place LL (window closes), ~${g} ms later tap the OCT month button`, `EXPECTED the grid moves to that month. lit month before="${was}" after="${now}"; Oct 15 drawn=${dec15}; open=${JSON.stringify(await openNow(P))}`, /OCT/i.test(now || '') ? 'PASS' : 'FAIL', [`s4-${SIZE}-e-q`, `s4-${SIZE}-e-settled`])
    } else row('S4e', SIZE, 'phone-only step', 'not run on the desktop', 'NOT WALKED')
  }
} catch (e) { console.log('ERR', e.stack); row('S3S4', SIZE, 'script', 'stopped: ' + String(e).slice(0, 300), 'NOT WALKED') }
async function scrollTopLocal() { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200) }
console.log('errs', JSON.stringify(w.errs))
finish('w3-' + SIZE)
await L.closeBrowser()
