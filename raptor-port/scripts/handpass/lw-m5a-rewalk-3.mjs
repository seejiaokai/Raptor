// M5a re-walk 3 — admin, desktop, the war's today 25 Jan 2026: each leave button's "left" is what is left AFTER the bid
// (a weekday −1, an afternoon −0.5, a Saturday 0, the drag window over two weekdays −2).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r3'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, vis, txt, balRow, leftOf, eq, shotD } = R
console.log('[lw-m5a-rewalk-3 v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  const r0 = await balRow(P, 'bane')
  note('L0 Ranger before: War bal 12.5, CCL 3 −1 (war 2)', S, ok(eq(r0.war, '12.5')), JSON.stringify({ app: r0.app, war: r0.war, CCL: r0.CCL }), [])
  const a = await leftOf(w, 'bane', '2026-02-04', 'full', '01-left-wed-4-feb')
  note('L1 Wed 4 Feb (free weekday): LL left is War bal − 1 = 11.5; CCL left 1', S, ok(eq(a.LL, '11.5') && eq(a.CCL, '1')), `LL ${a.LL} · OL ${a.OL} · CCL ${a.CCL} · PL ${a.PL}; day line "${a.dayline}"`, ['01-left-wed-4-feb'])
  const b = await leftOf(w, 'bane', '2026-02-04', 'pm', '02-left-wed-4-feb-pm')
  note('L2 Wed 4 Feb, afternoon only: LL left 12 (−0.5)', S, ok(eq(b.LL, '12')), `LL ${b.LL} · CCL ${b.CCL}`, ['02-left-wed-4-feb-pm'])
  const c = await leftOf(w, 'bane', '2026-02-07', 'full', '03-left-sat-7-feb')
  note('L3 Sat 7 Feb: LL left 12.5 (a Saturday costs nothing here)', S, ok(eq(c.LL, '12.5')), `LL ${c.LL} · CCL ${c.CCL}`, ['03-left-sat-7-feb'])
  // the drag window over Tue 24 – Wed 25 Feb
  await L.openGrid(w); await press(w, T('month-FEB')); await P.waitForTimeout(1000)
  await L.reachCell(w, 'bane', '2026-02-24')
  const aB = await P.locator(T('cell-bane-2026-02-24')).first().boundingBox(), bB = await P.locator(T('cell-bane-2026-02-25')).first().boundingBox()
  await P.mouse.move(aB.x + aB.width / 2, aB.y + aB.height / 2); await P.mouse.down()
  await P.mouse.move(bB.x + bB.width / 2, bB.y + bB.height / 2, { steps: 12 }); await P.waitForTimeout(300); await P.mouse.up(); await P.waitForTimeout(700)
  const open = await vis(P, T('sel-actions'))
  const ll = await txt(P, T('sel-LL-left')), ccl = await txt(P, T('sel-CCL-left')), span = await txt(P, T('sel-span'))
  await shotD(w, '04-drag-window')
  note('L4 the drag window over Tue 24 – Wed 25 Feb: LL left 10.5 (−2)', S, ok(open && eq(ll, '10.5')), `window open ${open}; "${span}"; LL left ${ll}; CCL left ${ccl}`, ['04-drag-window'])
  await press(w, T('sel-cancel')).catch(() => {}); await P.waitForTimeout(300)
  // a real placing: the figure after the bid matches what the button said — place LL on Wed 4 Feb, App bal / War bal after
  await L.openCell(w, 'bane', '2026-02-04')
  await L.approveWhatIEnter(w, true)
  const placed = await L.placeLeave(w, 'LL'); await L.closeWin(w)
  await R.openBalances(w)
  const r1 = await balRow(P, 'bane')
  note('L5 placing LL on Wed 4 Feb (approved): War bal 12.5 → 11.5, as the button said', S, ok(placed && eq(r1.war, '11.5')), `placed ${placed}; App ${r1.app} incl ${r1.cf} pend ${r1.pend} war ${r1.war}`, [])
  const d = await leftOf(w, 'bane', '2026-02-05', 'full', '05-left-after')
  note('L6 the next weekday now reads 10.5', S, ok(eq(d.LL, '10.5')), `LL ${d.LL}`, ['05-left-after'])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r3')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
