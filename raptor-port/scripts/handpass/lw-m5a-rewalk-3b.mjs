// M5a re-walk 3b — admin, desktop, the war's today 20 Dec 2026: row 10's Monday 22 Feb (War bal − 1 = 8), the below-zero ask and every negative drawn "−",
// carried forward clamped (25 beside 20 saves 20; −3 saves 0).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r3b'
process.env.LW_TODAY ||= '2026-12-20'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, vis, txt, balRow, leftOf, eq, pickRange, place, gridFig, undoTip, shotD } = R
console.log('[lw-m5a-rewalk-3b v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
const MINUS = '−'
const hasHyphenNeg = s => /(^|[^\w])-\d/.test(s || '')
try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  // ---- carried forward clamped
  await R.typeInBox(w, T('bal-LVE-vegas'), 20)
  const v0 = await balRow(P, 'vegas'); const tip0 = await undoTip(P)
  await R.typeInBox(w, T('bal-cf-vegas'), 25)
  const v1 = await balRow(P, 'vegas'); const e1 = await txt(P, T('bal-cf-vegas-err')); const tip1 = await undoTip(P)
  await shotD(w, '01-cf-25')
  note('C1 carried forward 25 beside App bal 20: shown clamped to 20, saved 20', S, ok(eq(v1.cf, '20') && eq(v1.app, '20')), `App ${v1.app}, incl. ${v1.cf}; words under box "${e1}"; Undo tip before "${tip0}" → after "${tip1}"`, ['01-cf-25'])
  await R.typeInBox(w, T('bal-cf-vegas'), 20)
  const tip2 = await undoTip(P)
  note('C2 carried forward 20 typed over a 20 already shown: nothing saved (the Undo step does not change)', S, ok(tip2 === tip1), `tip "${tip1}" → "${tip2}"`, [])
  await R.typeInBox(w, T('bal-cf-vegas'), -3)
  const v3 = await balRow(P, 'vegas'); const e3 = await txt(P, T('bal-cf-vegas-err'))
  await shotD(w, '02-cf-minus3')
  note('C3 carried forward −3: saved 0', S, ok(eq(v3.cf, '0')), `incl. ${v3.cf}; words "${e3}"`, ['02-cf-minus3'])
  // ---- a negative typed: every surface draws U+2212
  await R.typeInBox(w, T('bal-LVE-vegas'), -2)
  const nb = await balRow(P, 'vegas')
  await press(w, T('bal-name-vegas')); await P.waitForTimeout(700)
  const pw = await R.pwRead(P); await R.closePw(w)
  await L.openGrid(w); await P.waitForTimeout(500)
  const gf = await gridFig(P, 'vegas')
  await shotD(w, '03-grid-negative')
  note('G1 Vapor (vegas) typed −2: the Balances box and War bal, the window and the grid\'s figure all draw "−" (U+2212)', S,
    ok(nb.app.includes(MINUS) && nb.war.includes(MINUS) && pw.app.includes(MINUS) && pw.war.includes(MINUS) && gf.includes(MINUS) && !hasHyphenNeg(gf)),
    `Balances box "${nb.app}", War bal "${nb.war}"; window box "${pw.app}", war "${pw.war}"; grid figure "${gf}" (code points ${[...gf].slice(0, 4).map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ')})`, ['03-grid-negative'])
  // ---- the below-zero ask (Saint: 20 incl 0; LL 1–12 Feb 27 approved → 10; LL Sat 13 – Sun 21 Feb: the run grows to 21 days → −1)
  await R.openBalances(w)
  await R.typeInBox(w, T('bal-LVE-salsa'), 20); await R.typeInBox(w, T('bal-cf-salsa'), 0)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  const r1 = await pickRange(w, 'salsa', '2027-02-01', '2027-02-12', true); const p1 = await place(w, 'LL')
  const r2 = await pickRange(w, 'salsa', '2027-02-13', '2027-02-21', true)
  const left = await txt(P, T('bid-LL-left'))
  await press(w, T('bid-LL')); await P.waitForTimeout(700)
  const ask = await vis(P, T('bid-picker'))
  const words = await P.evaluate(() => { const bp = document.querySelector('[data-testid="bid-picker"]'); return bp ? bp.innerText.replace(/\s+/g, ' ') : '' })
  await shotD(w, '04-below-zero-ask')
  const asked = (words.match(/That takes[^.]*\./) || [''])[0]
  note('Z1 the below-zero ask names the figure with "−" (U+2212), not a hyphen', S, ok(ask && asked.includes(MINUS + '1') && !/ -\d/.test(asked)), `ranges ${r1}/${p1}/${r2}; LL button read "${left}"; the ask: "${asked}"`, ['04-below-zero-ask'])
  await press(w, T('bid-LL')); await P.waitForTimeout(800)
  await L.closeWin(w)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }).catch(() => {}); await P.waitForTimeout(700)
  const gs = await gridFig(P, 'salsa'); await shotD(w, '05-grid-after-second-press')
  note('Z2 after the second press the grid\'s figure beside Saint reads −1 with "−"', S, ok(gs.includes(MINUS + '1') && !hasHyphenNeg(gs)), `grid figure "${gs}"`, ['05-grid-after-second-press'])
  // ---- row 10: Nomad 30; LL 1–12 Feb approved, LL Sat 13 – Sun 21 pending; Mon 22 Feb LL left = War bal − 1
  await R.openBalances(w)
  await R.typeInBox(w, T('bal-LVE-pike'), 30)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  const a1 = await pickRange(w, 'pike', '2027-02-01', '2027-02-12', true); const a2 = await place(w, 'LL')
  const b1 = await pickRange(w, 'pike', '2027-02-13', '2027-02-21', false); const b2 = await place(w, 'LL')
  await R.openBalances(w); const pr = await balRow(P, 'pike')
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }).catch(() => {}); await P.waitForTimeout(700)
  const l = await leftOf(w, 'pike', '2027-02-22', 'full', '06-row10-left-22-feb')
  note('R10 row 10 (Nomad): Mon 22 Feb LL left = War bal − 1 = 8', S, ok(eq(l.LL, '8') && eq(pr.war, '9')), `placed ${a1}/${a2}/${b1}/${b2}; Nomad App ${pr.app} pend ${pr.pend} war ${pr.war}; LL left ${l.LL}`, ['06-row10-left-22-feb'])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r3b')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
