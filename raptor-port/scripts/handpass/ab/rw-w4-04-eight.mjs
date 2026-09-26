/* W4 — EIGHT records on one day, and the tap list at 390 px (26 Sep 26). Old plan G2; Fable S15 ("the tap list with
   eight records fits with no sideways scroll"). Saint (salsa, a pilot), Thu 6 Aug — every record through the app's
   own controls, in an order the grid allows (once a day carries a mark a tap opens the LIST, so the bid sheet's own
   doors come first and the second bid goes in through a one-day drag-select):
     1 an OIL award (the bid sheet's +OIL → Give FO)           5 ATT C 13:00–15:00 (Inputs) — replaces the PM bid → a notice
     2 an LL morning bid (the bid sheet)                       6 OL 08:30–09:30 (Inputs)
     3 an OL afternoon bid (a one-day drag-select → fill)      7 a course, all day (Inputs)
     4 LL 07:00–08:00 (Inputs) — replaces the AM bid → a notice 8 overseas duty, all day (Inputs)
   Expected: the box shows the LL morning with an amber ! (the two notices); the list has EIGHT lines in ladder order
   (LL, OL, ATT C, the award, the course and OD, the two notices); at 390 px every line is reachable, the last line and
   the close button can be reached, nothing scrolls sideways, no console errors. The figures follow every step.
   Usage (from raptor-port/): node scripts/handpass/ab/w4-04-eight.mjs [desktop|phone]
   RE-WALK COPY (26 Sep 26, re-walker W4): pictures to rewalk/w4, results to the rewalk-w4-eight-<width> files. W4-1 is
   fixed, so the premise the first walk worked round is gone: on the phone the afternoon bid now goes in through a
   REAL one-day hold (a finger held still on 6 Aug and lifted), and the money is the desktop's — no 7 Aug bid. */
const W = process.argv[2] || 'phone'
/* re-walk: `phone twoday` repeats the FIRST walk's work-round (the PM bid by a TWO-day drag, 6–7 Aug) so the eight-record
   list and its money can still be read at 390 px while the one-day hold is broken (W4-1 re-walk) */
const TWO = process.argv[3] === 'twoday'
const WT = W + (TWO ? '-twoday' : '')
process.env.AB_WHO = 'rewalk/w4'
const L = await import('./w4-lib.mjs')
const { openW4, fileInput, lwOpen, tapDay, closeSheets, sheetPress, sheetNow, shot, resultBook, ROOT, readAll, manningOn, manningDelta, top, cellOf, sideScroll, fingerTap, toastSpy, toasts } = L
const PHONE = W === 'phone'
const R = resultBook(`W4-eight-${WT}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w4-eight-${WT}.txt`)
const { browser, page, errors } = await openW4({ phone: PHONE, who: 'a' })
await toastSpy(page)
const cdp = PHONE ? await page.context().newCDPSession(page) : null
const P = n => `w4-eight-${WT}-${n}`
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const id = 'salsa', d = '2026-08-06'

/** a one-day selection: a finger held on the day (phone), or a short mouse drag inside it (desktop) */
/* ON THE PHONE a finger held on ONE day and lifted cannot keep the selection sheet open (finding W4-1, probe
   w4-08-hold-why.mjs: the sheet mounts, the finger's own trailing tap closes it 20 ms later) — so the phone build
   drags over TWO days, 6–7 Aug, and the afternoon bid lands on both (the 7th's charges are counted in the money). */
const D2 = '2026-08-07'
async function selectOneDay() {
  await lwOpen(page, d)   // a phone figure sheet carries the grid back to January ([AMEND-SMALL-SEEN] 6)
  const sel = `[data-testid="cell-${id}-${d}"]`
  await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(350)
  const c = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, sel)
  if (PHONE) {
    const c2 = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, `[data-testid="cell-${id}-${D2}"]`)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 3 }] })
    await page.waitForTimeout(300)
    /* re-walk: held STILL on the one day (W4-1 fixed) — six moves of zero distance, as the first walk's hold probe did */
    for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: TWO ? c.x + (c2.x - c.x) * i / 6 : c.x, y: c.y, id: 3 }] }); await page.waitForTimeout(30) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(c.x - 4, c.y); await page.mouse.down(); await page.mouse.move(c.x + 3, c.y, { steps: 4 }); await page.mouse.up()
  }
  await page.waitForTimeout(700)
  return sheetNow(page)
}
const readNow = async (tag) => { await lwOpen(page, d); const r = await readAll(page, id, d, { bd: ['lve', 'medtot'] }); R.note(`${tag}-figures`, { cell: r.cell, lve: r.sheet.lve, oil: r.sheet.oil, medtot: r.sheet.medtot, agree: r.agree, disagree: r.disagree }); return r }

let r0, m0
await step('build', async () => {
  await lwOpen(page, d)
  m0 = await manningOn(page, d)
  r0 = await readAll(page, id, d, { bd: ['lve', 'medtot'] })
  /* 1 — the award, on the empty day */
  await lwOpen(page, d)
  let t = await tapDay(page, PHONE, id, d)
  await sheetPress(page, 'bid-oil')
  await page.locator('[data-testid="oil-why"]').fill('W4 G2 callout'); await page.locator('[data-testid="oil-days"]').fill('1')
  const g = await sheetPress(page, 'oil-give')
  await closeSheets(page)
  const r1 = await readNow('1-award')
  R.ck('G2-1-award', t.open === 'bid-picker' && g.pressed && top(r1.sheet.oil) === top(r0.sheet.oil) + 1 && r1.agree, 'the award lands: OIL +1, readers agree', { open: t.open, oil: [r0.sheet.oil, r1.sheet.oil], cell: r1.cell })
  /* 2 — the LL morning bid, through the bid sheet the award day still opens */
  t = await tapDay(page, PHONE, id, d)
  await sheetPress(page, 'portion-am')
  let b = await sheetPress(page, 'bid-LL')
  if (b.sheet && b.sheet.open === 'bid-picker' && /Tap the same leave again/i.test(b.sheet.text || '')) b = await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  const r2 = await readNow('2-am-bid')
  R.ck('G2-2-am-bid', t.open === 'bid-picker' && /^FO$/.test(r2.cell.box) && r2.cell.mark === '+1' && top(r2.sheet.lve) === top(r0.sheet.lve) - 0.5 && r2.agree, 'the LL morning bid is placed beside the award: the box keeps FO (an award outranks an undecided bid on the ladder) with a grey +1; the bid charges its half', { open: t.open, cell: r2.cell, lve: r2.sheet.lve })
  /* 3 — the OL afternoon bid: the day now opens its LIST, so it goes in through a one-day drag-select */
  const s = await selectOneDay()
  await shot(page, P('3-one-day-select'))
  await sheetPress(page, 'sel-portion-pm')
  const f = await sheetPress(page, 'sel-OL')
  await closeSheets(page)
  const r3 = await readNow('3-pm-bid')
  const c7 = await cellOf(page, id, D2)
  R.ck('G2-3-pm-bid', s.open === 'select-sheet' && (TWO ? /2 days/ : /1 day/).test(s.text || '') && f.pressed && r3.cell.mark === '+2' && (TWO || !c7.box) && r3.agree, 'a one-day hold (phone: a finger held still; desktop: a short mouse drag) opens the selection sheet for ONE day; OL afternoon fills beside them (+2); 7 Aug untouched', { open: s.open, span: (s.text || '').slice(0, 60), cell: r3.cell, aug7: c7 })
  /* 4–8 — the Inputs page */
  const inputs = [
    { type: 'LL', span: 'custom', start: '07:00', end: '08:00', remarks: 'W4 G2 LL early' },
    { type: 'ATT C', span: 'custom', start: '13:00', end: '15:00', remarks: 'W4 G2 medical afternoon' },
    { type: 'OL', span: 'custom', start: '08:30', end: '09:30', remarks: 'W4 G2 OL mid-morning' },
    { type: 'CSE', remarks: 'W4 G2 course' },
    { type: 'OD', remarks: 'W4 G2 overseas duty' },
  ]
  for (const [i, x] of inputs.entries()) {
    const fi = await fileInput(page, { person: id, from: d, ...x })
    const r = await readNow(`${4 + i}-${x.type}`)
    R.ck(`G2-${4 + i}-${x.type.replace(' ', '')}`, fi.added === 1 && r.agree, `${x.type} filed; every figure reader agrees at once`, { added: fi.added, toast: fi.toast, asked: fi.asked, cell: r.cell, lve: r.sheet.lve, medtot: r.sheet.medtot, disagree: r.disagree })
  }
})

await step('list', async () => {
  const r = await readAll(page, id, d, { bd: ['lve', 'medtot'] })
  const m1 = await manningOn(page, d)
  R.ck('G2-box', /LL/.test(r.cell.box) && r.cell.mark === '!' && r.cell.amber, 'the box shows the LL morning with an AMBER ! (two replaced-bid notices on the day)', r.cell)
  R.ck('G2-money', top(r.sheet.lve) === top(r0.sheet.lve) - 0.5 - (TWO ? 0.5 : 0) && top(r.sheet.oil) === top(r0.sheet.oil) + 1 && top(r.sheet.medtot) === top(r0.sheet.medtot) + 0.5 && r.agree,
    `money: LVE −0.5 on the day (two equal 1-hour leaves — the earlier LL pays the morning, OL nothing; the bids are gone)${TWO ? ' and −0.5 for the 7th afternoon bid (the two-day work-round)' : ''}, OIL +1 (the award), MED TOT +0.5`, { lve: [r0.sheet.lve, r.sheet.lve], oil: [r0.sheet.oil, r.sheet.oil], medtot: [r0.sheet.medtot, r.sheet.medtot], bd: r.breakdown, disagree: r.disagree })
  const dm = manningDelta(m0, m1)
  const HEADS = ['sets', 'ip', 'iwso', 'instr', 'opsp', 'opsw', 'flp', 'wmp', 'sxo']
  const h = HEADS.filter(k => dm[k] != null).map(k => dm[k])
  R.ck('G2-manning-once', h.length > 0 && h.every(v => v === -1), 'manning removes him ONCE for eight records (an award counts nobody — N13)', dm)
  await lwOpen(page, d)
  const t = await tapDay(page, PHONE, id, d)
  await shot(page, P('list-top'))
  const ls = t.lines || []
  const first = ls.map(l => (/^\S+/.exec(l) || [''])[0])
  R.ck('G2-eight-lines', t.open === 'daylist-sheet' && ls.length === 8, 'the list opens with EIGHT lines', { open: t.open, n: ls.length, lines: ls.map(x => x.slice(0, 80)) })
  const want = [/^<?LL/, /^OL/, /ATT C/, /OIL award/, /CSE|OD/, /CSE|OD/, /replaced/, /replaced/]
  R.ck('G2-ladder', ls.length === 8 && want.every((re, i) => re.test(ls[i] || '')), 'ladder order: LL, OL, ATT C, the award, the course and OD, then the two notices', first)
  /* geometry at this width: nothing wider than the screen, the last line and the ✕ reachable */
  const geo = async () => page.evaluate(() => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].find(e => e.offsetWidth)
    const li = [...s.querySelectorAll('[data-testid="daylist"] li')]
    const x = s.querySelector('[data-testid="daylist-close"]')
    const vis = e => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(Math.min(innerWidth - 1, b.left + b.width / 2), Math.min(innerHeight - 1, b.top + Math.min(b.height / 2, 12))); return b.top >= 0 && b.bottom <= innerHeight + 0.5 && !!h && (h === e || e.contains(h)) }
    let sc = s; for (let e = li[0]; e && e !== document.body; e = e.parentElement) if (e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)) { sc = e; break }
    const sb = s.getBoundingClientRect()
    return { vw: innerWidth, vh: innerHeight, sheet: [Math.round(sb.left), Math.round(sb.top), Math.round(sb.width), Math.round(sb.height)], sheetOverX: s.scrollWidth - s.clientWidth,
      widest: Math.max(...li.map(e => Math.round(e.getBoundingClientRect().right))), docOverX: document.documentElement.scrollWidth - innerWidth,
      scroller: sc === s ? 'sheet' : (sc.className || sc.tagName), scrollTop: Math.round(sc.scrollTop), scrollMax: sc.scrollHeight - sc.clientHeight,
      lastVisible: li.length ? vis(li[li.length - 1]) : null, closeVisible: x ? vis(x) : null }
  })
  const g0 = await geo()
  R.ck('G2-no-sideways', g0.docOverX <= 0 && g0.sheetOverX <= 0 && g0.widest <= g0.vw, 'nothing scrolls sideways: the page, the sheet and every line fit the screen width', g0)
  let g1 = g0
  if (!g0.lastVisible) {
    /* scroll the list the way a person does: a finger (phone) or the wheel (desktop) over the sheet */
    const sb = g0.sheet
    if (PHONE) {
      const x = sb[0] + sb[2] / 2, y0 = Math.min(g0.vh - 40, sb[1] + sb[3] - 40)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 5 }] })
      for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - 45 * i, id: 5 }] }); await page.waitForTimeout(25) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else { await page.mouse.move(sb[0] + sb[2] / 2, sb[1] + sb[3] / 2); await page.mouse.wheel(0, 1200) }
    await page.waitForTimeout(700)
    g1 = await geo()
  }
  await shot(page, P('list-bottom'))
  R.ck('G2-last-line-reachable', g1.lastVisible === true, 'the LAST line can be brought on screen (by finger on the phone)', { before: g0, after: g1 })
  R.ck('G2-close-reachable', g0.closeVisible === true || g1.closeVisible === true, 'the ✕ is on screen', { atOpen: g0.closeVisible, afterScroll: g1.closeVisible })
  /* act from the list: OK, seen on the first notice — one line goes, the mark stays amber (the other notice) */
  const ok = await sheetPress(page, /OK, seen/)
  const after = await sheetNow(page)
  R.ck('G2-seen-one', ok.pressed && (after.lines || []).length === 7, '"OK, seen" on one notice takes that line away (seven left)', { n: (after.lines || []).length })
  const x = PHONE ? await fingerTap(page, '[data-testid="daylist-close"]') : (await page.locator('[data-testid="daylist-close"]').click(), { ok: true })
  const closed = await sheetNow(page)
  R.ck('G2-close', x.ok && closed.open === 'nothing', 'the ✕ closes the list', { tap: x, open: closed.open })
  const c2 = await cellOf(page, id, d)
  R.ck('G2-still-amber', c2.mark === '!' && c2.amber, 'with one notice left the box stays amber', c2)
  const r2 = await readAll(page, id, d, { bd: ['lve'] })
  R.ck('G2-figures-after-seen', top(r2.sheet.lve) === top(r.sheet.lve) && r2.agree, 'OK, seen moves no figure', { lve: [r.sheet.lve, r2.sheet.lve], disagree: r2.disagree })
  await L.lwShot(page, P('box-after'), id, d)
})

if (PHONE) R.note('side-scroll', await sideScroll(page))
R.note('toasts', await toasts(page))
R.ck('G2-no-console-errors', errors.length === 0, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
