// The walk of his D1720 (6 Nov 26, [LW-PO-DAYS-DRAWING]): whatever is filed on a posted-out man's gone days is drawn as
// leave is there, and an admin's tap on it opens the day's list. Written as assertions of the right behaviour, so a re-run
// is the re-walk. SIZE=desk|phone, LW_DIST=<build>, LW_OUT=<pictures folder>. Uses the night's shared walk bits.
process.env.LW_OUT ||= '2026-11-06-lw-faults/d1720'
process.env.WNAME = 'd1720'
const { L, row, T, openNow, fresh, finish } = await import('./lw-f1106-w0.mjs')
const SIZE = L.SIZE
console.log('[lw-d1720-walk v1]', SIZE, L.DIST)
const w = await fresh(SIZE)
const P = w.page
const step = async (id, fn) => { try { await fn() } catch (e) { console.log(e.stack); row(id, SIZE, 'step', 'stopped: ' + String(e).slice(0, 250), 'NOT WALKED') } }
const dies = await L.pidOf(P, 'Diesel'), echo = await L.pidOf(P, 'Echo')
const d28 = L.day(54), d29 = L.day(55), d30 = L.day(56), d31 = L.day(57)
const cells = async pid => [await L.cellWords(w, pid, d28), await L.cellWords(w, pid, d29), await L.cellWords(w, pid, d30), await L.cellWords(w, pid, d31)]
const avail = () => P.evaluate(ds => ds.map(d => ['avail-p', 'avail-w'].map(r => (document.querySelector(`[data-testid="${r}-${d}"]`)?.textContent || '-').trim()).join('/')), [d28, d29, d30])
const tags = (pid, ds) => P.evaluate(({ pid, ds }) => ds.map(d => !!document.querySelector(`[data-testid="potag-${pid}-${d}"]`)), { pid, ds })

await step('A', async () => {
  await L.postOutOn(w, dies, d29, 'overseas', d29)
  await L.toWar(w); await L.openGrid(w)
  const before = await avail()
  await L.dragCells(w, [dies, d28], [dies, d30])
  if (await P.locator(T('sel-more')).count()) { await L.press(w, T('sel-more')); await P.waitForTimeout(300) }
  const od = P.locator('[data-testid="sel-file-OD"], [data-testid="sel-OD"]').first()
  const id = await od.getAttribute('data-testid')
  await L.press(w, `[data-testid="${id}"]`); await P.waitForTimeout(900)
  if ((await L.cellWords(w, dies, d28)) === 'empty') { await L.press(w, `[data-testid="${id}"]`); await P.waitForTimeout(900) }
  await L.closeWin(w); await L.settle(w)
  const c = await cells(dies), t = await tags(dies, [d29, d30, d31]), after = await avail()
  await L.rowShot(w, dies, L.day(51), d31, `A-${SIZE}-1-diesel-row`)
  const ok = /^OD/.test(c[0]) && /^OD/.test(c[1]) && /^OD/.test(c[2]) && /^PO/.test(c[3]) && t[0] && t[1] && !t[2]
  row('A-draw', SIZE, `Diesel posted out from ${d29}; OD dragged over ${d28}..${d30}`, `cells 28-31 = ${JSON.stringify(c)}; PO tags 29/30/31 = ${JSON.stringify(t)}`, ok ? 'PASS' : 'FAIL', [`A-${SIZE}-1-diesel-row`])
  /* the manning: the OD over his gone days counts nobody — the Available rows read the same before and after (desktop: the rows open) */
  row('A-manning', SIZE, `Available P/W on ${d28}..${d30}, before and after the OD`, `before ${JSON.stringify(before)}; after ${JSON.stringify(after)}`,
    before.some(x => x.includes('-/') || x.includes('/-')) ? (SIZE === 'phone' ? 'NOT WALKED' : 'FAIL') : JSON.stringify(before.slice(1)) === JSON.stringify(after.slice(1)) ? 'PASS' : 'FAIL', [])
})
await step('B', async () => {
  /* the admin's tap on the drawn bar opens the OD whole, as on any other day (his D1722): its dates in the title, its line on
     top; its ✕ closes it; Escape on the desktop too */
  await L.openCell(w, dies, d29)
  const open1 = await openNow(P)
  const txt = await P.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 220))
  await L.shot(w, `B-${SIZE}-1-tap-29-window`)
  await L.press(w, T('bid-cancel')); await P.waitForTimeout(400)
  const open2 = await openNow(P)
  let esc = 'phone: no key'
  if (SIZE !== 'phone') { await L.openCell(w, dies, d30); await P.keyboard.press('Escape'); await P.waitForTimeout(400); esc = JSON.stringify(await openNow(P)) }
  await L.shot(w, `B-${SIZE}-2-closed`)
  const ok = open1.includes('win-lwday') || txt.length > 0
  row('B-tap', SIZE, `tap Diesel's ${d29} (the OD bar), then ✕; ${SIZE !== 'phone' ? `tap ${d30}, Escape` : ''}`, `open: ${JSON.stringify(open1)}; list: "${txt}"; after ✕: ${JSON.stringify(open2)}; after Escape: ${esc}`,
    /28–30 Dec/.test(txt) && txt.includes('OD') && !open2.length && (SIZE === 'phone' || esc === '[]') ? 'PASS' : 'FAIL', [`B-${SIZE}-1-tap-29-window`, `B-${SIZE}-2-closed`])
  /* the bare PO day beyond it still opens the posted-out sheet, as before */
  await L.openCell(w, dies, d31)
  const po = await P.locator(T('postout-sheet')).count()
  await L.shot(w, `B-${SIZE}-3-tap-31-postout`)
  await L.closeWin(w); await L.settle(w)
  row('B-po', SIZE, `tap Diesel's bare PO on ${d31}`, `posted-out sheet open: ${po > 0}`, po > 0 ? 'PASS' : 'FAIL', [`B-${SIZE}-3-tap-31-postout`])
})
await step('C', async () => {
  /* Undo takes the OD back — the gone days read a bare PO again; Redo brings the bar back */
  await L.undo(w); await L.settle(w)
  const u = await cells(dies)
  await L.rowShot(w, dies, L.day(51), d31, `C-${SIZE}-1-after-undo`)
  await L.redo(w); await L.settle(w)
  const r = await cells(dies)
  await L.rowShot(w, dies, L.day(51), d31, `C-${SIZE}-2-after-redo`)
  row('C-undo', SIZE, 'top bar Undo, then Redo', `after Undo ${JSON.stringify(u)}; after Redo ${JSON.stringify(r)}`,
    /^PO/.test(u[1]) && /^PO/.test(u[2]) && /^OD/.test(r[1]) && /^OD/.test(r[2]) ? 'PASS' : 'FAIL', [`C-${SIZE}-1-after-undo`, `C-${SIZE}-2-after-redo`])
})
await step('D', async () => {
  /* leave there: Echo posted out the same way, LL dragged over, approved; an admin's tap opens it whole, as on any other day (D1725) */
  await L.postOutOn(w, echo, d29, 'overseas', d29)
  await L.toWar(w); await L.openGrid(w)
  await L.dragCells(w, [echo, d28], [echo, d30])
  await L.autoApprove(w, true, 'sel')
  await L.press(w, T('sel-LL')); await P.waitForTimeout(900)
  await L.closeWin(w); await L.settle(w)
  const c = await cells(echo)
  await L.openCell(w, echo, d29)
  const listed = await P.locator(T('bid-picker')).count()
  await L.shot(w, `D-${SIZE}-1-echo-tap`)
  await L.closeWin(w); await L.settle(w)
  await L.rowShot(w, echo, L.day(51), d31, `D-${SIZE}-2-echo-row`)
  row('D-leave', SIZE, `Echo: LL over ${d28}..${d30} after his posting out; tap ${d29}`, `cells ${JSON.stringify(c)}; day's list open: ${listed > 0}`,
    /^LL/.test(c[1]) && listed > 0 ? 'PASS' : 'FAIL', [`D-${SIZE}-1-echo-tap`, `D-${SIZE}-2-echo-row`])   // `listed`: its window open
})
await step('E', async () => {
  /* the plain-user round's other place: the Inputs page shows the one OD across 28-30 Dec */
  await L.goPage(w, 'inputs', 'Inputs')
  for (let i = 0; i < 6; i++) {
    const lab = await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => null)
    if (lab && /December 2026/.test(lab)) break
    await L.press(w, '#icNext'); await P.waitForTimeout(300)
  }
  await L.shot(w, `E-${SIZE}-1-inputs-december`)
  const t = await P.evaluate(() => document.body.innerText.includes('Diesel'))
  row('E-inputs', SIZE, 'the Inputs page, December 2026', `Diesel named on the page: ${t}`, t ? 'PASS' : 'RECORD', [`E-${SIZE}-1-inputs-december`])
})
console.log('errs', JSON.stringify(w.errs))
row('errs', SIZE, 'console errors during the walk', `${w.errs.length}: ${JSON.stringify(w.errs.slice(0, 4))}`, w.errs.length ? 'RECORD' : 'PASS', [])
finish('d1720-' + SIZE)
await L.closeBrowser()
