// W1 — S09, S23 (the carried bar and Escape, D1581), S22 and the rest of T1 (who answers Escape). Desktop 1440. v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, mark, unmark, row, act, wins, rect, hitOf } = L
console.log('ibc-w1-s09 v1')
L.startRun('keep')
const browser = await L.launch()
const mk = async () => { const w = await L.session(browser, 'desktop'); await L.inputsCal(w, 2026, 7); await sleep(400); return w }
const barOf = (page, who) => page.evaluate(who => { const bs = [...document.querySelectorAll('#inpCal .ib-bar[data-iid]')].filter(b => b.getBoundingClientRect().height > 0 && (b.textContent || '').includes(who)); if (!bs.length) return null; const b = bs[0]; const r = b.getBoundingClientRect(); return { iid: b.getAttribute('data-iid'), l: r.left, t: r.top, w: r.width, h: r.height } }, who)
const recOf = (page, iid) => page.evaluate(i => JSON.stringify(window.INPUTS.filter(x => String(x.iid) === String(i)).map(x => [x.date, x.endDate])), iid)
const dragState = page => page.evaluate(() => ({ ghost: document.querySelectorAll('.ic-ghost').length, over: document.querySelectorAll('.ic-over').length, dragging: document.body.classList.contains('ic-dragging') }))
const month = page => page.locator('#inpCal .ic-mon').innerText()
const undoState = page => page.evaluate(() => { const u = document.getElementById('undoBtn'); return u ? { disabled: u.disabled, title: u.title } : null })
const dayCell = async (page, iso) => { const b = await page.locator(`#inpCal [data-icday="${iso}"]`).first().boundingBox(); return b }
const snap = async w => ({ wins: await wins(w.page), active: await act(w.page), ask: await tid(w.page, 'idy-ask').count(), carry: await dragState(w.page), month: await month(w.page) })

/* ===== S09 ===== */
{
  const w = await mk(); const p = w.page, T = 'S09'
  try {
    await L.openIcDay(w, '2026-07-15')
    const n0 = await p.locator('[data-testid="idy-open"]').count()
    await p.locator('[data-testid="idy-open"]').first().focus(); await p.keyboard.press('Delete'); await sleep(400)
    const q = await snap(w)
    row('S09-1', 'open 15 Jul; Delete on the first input card', '"Delete this input?" is up', { ...q, cards: n0 }, q.ask === 1 ? 'PASS' : 'NOT WALKED premise — no question')
    const bar = await barOf(p, 'Grit'); const d15 = await dayCell(p, '2026-07-15'), d16 = await dayCell(p, '2026-07-16')
    const step = d16.x - d15.x
    const rec0 = await recOf(p, bar.iid)
    const y = bar.t + bar.h / 2, x0 = bar.l + 40
    await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + step, y + 3, { steps: 10 }); await sleep(250)
    const c1 = await snap(w)
    row('S09-2', 'press Grit ATT C bar (13-17 Jul) and carry it one day right and HOLD', 'ghost up (premise); question still up', { ...c1, rec: rec0 }, c1.carry.ghost > 0 || c1.carry.dragging ? 'PASS' : 'NOT WALKED premise — nothing carried', 'S09-2-carrying.png')
    await shot(p, 'S09-2-carrying')
    await p.keyboard.press('Escape'); await sleep(350)
    const c2 = await snap(w)
    row('S09-3', 'Escape (first), button still down', 'bar put back (D1581): no ghost; the question still up', c2, (c2.carry.ghost === 0 && !c2.carry.dragging && c2.ask === 1) ? 'PASS' : 'FAIL', 'S09-3-after-escape-1.png')
    await shot(p, 'S09-3-after-escape-1')
    await p.mouse.up(); await sleep(500)
    const c3 = await snap(w); const rec1 = await recOf(p, bar.iid)
    row('S09-4', 'let go', 'nothing moves after the release; the question still up', { ...c3, recBefore: rec0, recAfter: rec1 }, (rec0 === rec1 && c3.ask === 1) ? 'PASS' : 'FAIL', 'S09-4-after-release.png')
    await shot(p, 'S09-4-after-release')
    await p.keyboard.press('Escape'); await sleep(400)
    const c4 = await snap(w); const n1 = await p.locator('[data-testid="idy-open"]').count()
    row('S09-5', 'Escape again', 'Keep (F6): question gone, day open, nothing deleted', { ...c4, cardsBefore: n0, cardsAfter: n1, keyHolder: c3.active }, (c4.ask === 0 && c4.wins.includes('win-inputsday') && n1 === n0) ? 'PASS' : 'FAIL', 'S09-5-after-escape-2.png')
    await shot(p, 'S09-5-after-escape-2')
  } catch (e) { L.say(`ERROR s09: ${e.stack}`); await shot(p, 's09-error').catch(() => {}) }
  await w.ctx.close()
}

/* ===== S09 reverse order: question up, month turned, carry, Escape ===== */
{
  const w = await mk(); const p = w.page
  try {
    await L.openIcDay(w, '2026-07-15')
    await p.locator('[data-testid="idy-open"]').first().focus(); await p.keyboard.press('Delete'); await sleep(300)
    await p.locator('#icNext').click(); await sleep(500); await p.locator('#icPrev').click(); await sleep(600)
    const bar = await barOf(p, 'Grit'); const d15 = await dayCell(p, '2026-07-15'), d16 = await dayCell(p, '2026-07-16')
    const rec0 = await recOf(p, bar.iid)
    const ask0 = await tid(p, 'idy-ask').count()
    const y = bar.t + bar.h / 2, x0 = bar.l + 40
    await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + (d16.x - d15.x), y + 3, { steps: 10 }); await sleep(250)
    await p.keyboard.press('Escape'); await sleep(350)
    const c = await snap(w)
    await p.mouse.up(); await sleep(400)
    row('S09r', 'question up, month turned with the arrows and back, carry Grit bar, Escape, release', 'bar back, nothing moves, question still up', { askBefore: ask0, after: c, recBefore: rec0, recAfter: await recOf(p, bar.iid), askAfterRelease: await tid(p, 'idy-ask').count() }, (rec0 === await recOf(p, bar.iid) && c.carry.ghost === 0 && c.ask === 1) ? 'PASS' : 'FAIL', 'S09r.png')
    await shot(p, 'S09r')
  } catch (e) { L.say(`ERROR s09r: ${e.stack}`); await shot(p, 's09r-error').catch(() => {}) }
  await w.ctx.close()
}

/* ===== S23 ===== */
async function carry(w, who, dx, dy = 3) {
  const p = w.page
  const bar = await barOf(p, who); const d15 = await dayCell(p, '2026-07-15'), d16 = await dayCell(p, '2026-07-16')
  const step = d16.x - d15.x
  const rec0 = await recOf(p, bar.iid)
  const y = bar.t + bar.h / 2, x0 = bar.l + 40
  await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + dx * step, y + dy, { steps: 8 })
  return { bar, rec0, x0, y, step }
}
{
  const w = await mk(); const p = w.page
  try {
    /* a. quick short flick then Escape before release */
    const c = await carry(w, 'Grit', 1)
    await p.keyboard.press('Escape'); await p.mouse.up(); await sleep(500)
    const s = await snap(w)
    row('S23a', 'carry one day, Escape at once, release at once (no waits)', 'bar back, nothing moves', { ...s, recBefore: c.rec0, recAfter: await recOf(p, c.bar.iid) }, c.rec0 === (await recOf(p, c.bar.iid)) && s.carry.ghost === 0 && !s.carry.dragging ? 'PASS' : 'FAIL', 'S23a.png')
    await shot(p, 'S23a')
    /* d. Escape twice, with a day open */
    await L.openIcDay(w, '2026-07-15')
    const c2 = await carry(w, 'Grit', 1); await sleep(250)
    await p.keyboard.press('Escape'); await sleep(300)
    const e1 = await snap(w)
    await p.mouse.up(); await sleep(400)
    await p.keyboard.press('Escape'); await sleep(400)
    const e2 = await snap(w)
    row('S23d', 'day open, carry, Escape (bar back), release, Escape again', 'first: bar back and day stays; second: the day closes', { afterFirst: e1, afterSecond: e2, recBefore: c2.rec0, recAfter: await recOf(p, c2.bar.iid) }, (e1.carry.ghost === 0 && e1.wins.includes('win-inputsday') && !e2.wins.includes('win-inputsday') && c2.rec0 === await recOf(p, c2.bar.iid)) ? 'PASS' : 'FAIL', 'S23d.png')
    await shot(p, 'S23d')
    /* e. the release after Escape lands on another bar: must not open it */
    const u0 = await undoState(p)
    const vec = await barOf(p, 'Vector')
    const c3 = await carry(w, 'Grit', 0)
    await p.mouse.move(vec.l + 20, vec.t + vec.h / 2, { steps: 8 }); await sleep(250)
    await p.keyboard.press('Escape'); await sleep(300)
    await p.mouse.up(); await sleep(600)
    const e3 = await snap(w)
    row('S23e', 'carry Grit bar over the Vector OML bar, Escape, release there', 'nothing opens (click eaten); nothing moves; nothing to undo', { ...e3, recBefore: c3.rec0, recAfter: await recOf(p, c3.bar.iid), undoBefore: u0, undoAfter: await undoState(p) }, (c3.rec0 === await recOf(p, c3.bar.iid) && e3.wins.length === 0) ? 'PASS' : 'FAIL', 'S23e.png')
    await shot(p, 'S23e')
  } catch (e) { L.say(`ERROR s23: ${e.stack}`); await shot(p, 's23-error').catch(() => {}) }
  await w.ctx.close()
}
{
  /* b. carry to the month's side so it turns, then Escape */
  const w = await mk(); const p = w.page
  try {
    const grid = await p.locator('[data-testid="ib-grid"]').boundingBox()
    const bar = await barOf(p, 'Grit'); const rec0 = await recOf(p, bar.iid)
    const m0 = await month(p)
    await p.mouse.move(bar.l + 40, bar.t + bar.h / 2); await p.mouse.down()
    await p.mouse.move(grid.x + grid.width - 6, bar.t + bar.h / 2, { steps: 12 })
    let turned = null
    for (let i = 0; i < 12; i++) { await sleep(250); const m = await month(p); if (m !== m0) { turned = m; break } }
    const mid = await snap(w)
    await shot(p, 'S23b-carrying-at-edge')
    await p.keyboard.press('Escape'); await sleep(400)
    const e = await snap(w)
    await p.mouse.up(); await sleep(600)
    const after = await snap(w)
    row('S23b', 'carry the bar to the right edge of the month so it turns, then Escape, then release', 'bar back on its own dates, nothing moves; RECORD the month', { month0: m0, turnedTo: turned, mid, afterEscape: e, afterRelease: after, recBefore: rec0, recAfter: await recOf(p, bar.iid) }, rec0 === await recOf(p, bar.iid) ? 'PASS' : 'FAIL', 'S23b-after-release.png')
    await shot(p, 'S23b-after-release')
  } catch (e) { L.say(`ERROR s23b: ${e.stack}`); await shot(p, 's23b-error').catch(() => {}) }
  await w.ctx.close()
}

/* ===== S22 + T1 extras ===== */
{
  const w = await mk(); const p = w.page, T = 'S22'
  try {
    /* delete question, keys in the search box */
    await L.openIcDay(w, '2026-07-15')
    await p.locator('[data-testid="idy-open"]').first().focus(); await p.keyboard.press('Delete'); await sleep(300)
    const s0 = p.locator('#inFSearch').first()
    await s0.click({ force: true }); await s0.fill('zz'); await sleep(200)
    const k = await snap(w)
    await p.keyboard.press('Escape'); await sleep(400)
    const a = await snap(w)
    row('S22a', 'delete question up; keys in the search box (typed zz); Escape', 'Keep, "wherever the keys are" (F6): question gone', { before: k, after: a, searchValue: await s0.inputValue() }, a.ask === 0 && a.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S22a.png')
    await shot(p, 'S22a')
    await s0.fill('')
    /* a box behind holding the keys, no question: text put back, no window closes */
    await s0.click({ force: true }); await s0.fill('zz'); await sleep(200)
    const b0 = await snap(w)
    await p.keyboard.press('Escape'); await sleep(400)
    const b1 = await snap(w)
    row('T1-box', 'day open, keys in the search box with text typed (zz), Escape', 'RECORD (the box own Escape: text put back / cleared; no window closes)', { before: b0, after: b1, searchValue: await s0.inputValue() }, 'RECORDED', 'T1-box.png')
    await shot(p, 'T1-box')
    await s0.fill('')
    /* month arrow last pressed + window up */
    await p.locator('#icNext').click(); await sleep(500)
    const f0 = await snap(w)
    await p.keyboard.press('Escape'); await sleep(400)
    const f1 = await snap(w)
    row('S22b', 'day open; month arrow pressed with the mouse (keys on it); Escape (F7)', 'the day closes', { before: f0, after: f1 }, !f1.wins.includes('win-inputsday') ? 'PASS' : 'FAIL')
    await p.locator('#icPrev').click(); await sleep(500)
    /* a SELECT behind holding the keys */
    await L.openIcDay(w, '2026-07-15')
    await p.locator('#inFType').focus(); await sleep(200)
    const g0 = await snap(w)
    await p.keyboard.press('Escape'); await sleep(400)
    const g1 = await snap(w)
    row('S22c', 'day open; the Type filter (a select) holds the keys; Escape', 'RECORD (its own Escape, or the day closes)', { before: g0, after: g1 }, 'RECORDED', 'S22c.png')
    await shot(p, 'S22c')
    /* a checkbox behind */
    const boxes = await p.evaluate(() => [...document.querySelectorAll('#page-inputs input[type=checkbox]')].filter(e => e.getBoundingClientRect().height > 0).length)
    row('S22d', 'a checkbox on the page behind holding the keys', 'RECORD', { visibleCheckboxesOnInputsPage: boxes }, boxes ? 'RECORDED' : 'NOT WALKED premise — no checkbox on the Inputs calendar page behind')
    await L.closeWins(w)
    /* people picker: day + picker, Escape */
    await L.openIcDay(w, '2026-07-15')
    const pk = p.locator('#icAddPuck')
    if (await pk.count()) {
      await pk.click(); await sleep(500)
      const h0 = await snap(w); const pickerUp = await p.locator('#icPickCancel').count()
      await p.keyboard.press('Escape'); await sleep(400)
      const h1 = await snap(w); const pickerAfter = await p.locator('#icPickCancel').count()
      row('T1-picker', 'day open; "+ people" (icAddPuck) opens the picker; Escape', 'the picker closes as Cancel; the day stays', { before: h0, pickerUp, after: h1, pickerAfter }, pickerUp && !pickerAfter && h1.wins.includes('win-inputsday') ? 'PASS' : (pickerUp ? 'FAIL' : 'NOT WALKED premise — picker did not open'), 'T1-picker.png')
      await shot(p, 'T1-picker')
    } else row('T1-picker', 'day open; people picker', 'picker closes', 'no #icAddPuck', 'NOT WALKED premise')
    await L.closeWins(w)
  } catch (e) { L.say(`ERROR s22: ${e.stack}`); await shot(p, 's22-error').catch(() => {}) }
  await w.ctx.close()
}

/* T1: List date-range calendar open + input window ; input window + OIL sheet */
{
  const w = await L.session(browser, 'desktop'); const p = w.page
  try {
    await L.inputsCal(w, 2026, 7); await press(w, '#inListBtn'); await sleep(400)
    await press(w, '#inRangeBtn'); await sleep(300); await press(w, '#inRangeAll'); await sleep(500)
    await press(w, p.locator('[data-testid="in-open"]').first()); await tid(p, 'win-inputedit').waitFor(); await sleep(400)
    await p.locator('#inRangeBtn').click({ force: true }); await sleep(500)
    const r0 = { wins: await wins(p), popOpen: await p.locator('#inRangePop').isVisible().catch(() => false), calOpen: await p.locator('#inRangePop .rcal, #inRangePop [class*="cal"]').count(), active: await act(p) }
    await p.keyboard.press('Escape'); await sleep(400)
    const r1 = { wins: await wins(p), popOpen: await p.locator('#inRangePop').isVisible().catch(() => false), active: await act(p) }
    row('T1-range', 'List: input window open, press the dates button (range pop-up) behind, Escape', 'RECORD (the date-range calendar goes first, InputsPage listener)', { before: r0, after: r1 }, 'RECORDED', 'T1-range.png')
    await shot(p, 'T1-range')
    await L.closeWins(w)
    /* OIL sheet: an input window with an OIL question button */
    await p.keyboard.press('Escape'); await sleep(200)
    const idx = await p.evaluate(() => 0)
    let found = null
    const n = await p.locator('[data-testid="in-open"]').count()
    for (let i = 0; i < Math.min(n, 30) && !found; i++) {
      await p.locator('[data-testid="in-open"]').nth(i).click(); await tid(p, 'win-inputedit').waitFor().catch(() => {}); await sleep(300)
      if (await tid(p, 'oil-revise').count() || await tid(p, 'oil-answer').count()) { found = i; break }
      await L.closeWins(w); await sleep(150)
    }
    if (found === null) row('T1-oil', 'input window + OIL question sheet; Escape', 'the OIL sheet closes', `no input of the first ${Math.min(n, 30)} list rows offers an OIL answer button`, 'NOT WALKED premise')
    else {
      const btn = (await tid(p, 'oil-revise').count()) ? tid(p, 'oil-revise') : tid(p, 'oil-answer')
      await btn.first().click(); await sleep(500)
      const o0 = { wins: await wins(p), oilconf: await tid(p, 'oilconf').count(), active: await act(p) }
      await p.keyboard.press('Escape'); await sleep(400)
      const o1 = { wins: await wins(p), oilconf: await tid(p, 'oilconf').count(), escask: await tid(p, 'inped-escask').count() }
      row('T1-oil', 'input window + OIL question sheet; Escape', 'the OIL sheet closes; the input window stays', { row: found, before: o0, after: o1 }, o0.oilconf && !o1.oilconf && o1.wins.includes('win-inputedit') ? 'PASS' : (o0.oilconf ? 'FAIL' : 'NOT WALKED premise — sheet did not open'), 'T1-oil.png')
      await shot(p, 'T1-oil')
    }
  } catch (e) { L.say(`ERROR t1: ${e.stack}`); await shot(p, 't1-error').catch(() => {}) }
  await w.ctx.close()
}
await browser.close()
L.finishRun('s09')
