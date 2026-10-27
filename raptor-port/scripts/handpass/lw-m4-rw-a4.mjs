// Re-walk A4 — Approve all: armed amber (D1431), disarmed by a change, armed again, all lit.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, approveBtn, pressLoc, topbarUndo, linesNow } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw-a4 v1]')
const w = await L.newCtx('desk')
const P = w.page
const allBtn = () => P.locator(T('appr-approve-all'))
const css = () => allBtn().evaluate(e => { const c = getComputedStyle(e); return { text: e.innerText.replace(/\s+/g, ' ').trim(), bg: c.backgroundColor, color: c.color, border: c.borderTopColor, armed: e.className + ' ' + e.getAttribute('aria-pressed') } })
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const c0 = await css(); console.log('rest', JSON.stringify(c0))
  await shot(w, 'a4-0-rest', { clip: { x: 1000, y: 130, width: 520, height: 120 } })
  await pressLoc(w, allBtn()); await P.waitForTimeout(500)
  const c1 = await css(); console.log('armed', JSON.stringify(c1))
  await shot(w, 'a4-1-armed', { clip: { x: 1000, y: 130, width: 520, height: 120 } })
  const m = /rgb\((\d+), (\d+), (\d+)/.exec(c1.bg).slice(1).map(Number)
  const amber = m[0] > 200 && m[1] > 130 && m[2] < 120
  rec('A4.1 first tap arms: "Approve N — tap again", amber (D1431)', 'desk', /Approve \d+ — tap again/.test(c1.text) && amber ? 'PASS' : 'FAIL', JSON.stringify(c1), ['a4-1-armed'])
  // a change: decide one line
  const first = await P.locator('.appr-line .appr-dlink').first().innerText()
  const dates = first.replace(' ›', '')
  await pressLoc(w, approveBtn(P, dates)); await P.waitForTimeout(500)
  const c2 = await css(); console.log('after one decision', JSON.stringify(c2))
  await shot(w, 'a4-2-disarmed', { clip: { x: 1000, y: 130, width: 520, height: 120 } })
  rec('A4.2 deciding one line disarms it (words back to "Approve all N")', 'desk', /^Approve all \d+$/.test(c2.text) ? 'PASS' : 'FAIL', JSON.stringify(c2), ['a4-2-disarmed'])
  await pressLoc(w, allBtn()); await P.waitForTimeout(1100)
  const c3 = await css(); console.log('armed again', JSON.stringify(c3))
  await pressLoc(w, allBtn()); await P.waitForTimeout(700)
  const ls = await linesNow(P)
  console.log('lines after second tap:', ls.map(l => l.who + ':' + l.lit).join(' '))
  await shot(w, 'a4-3-all-lit')
  rec('A4.3 armed again, second tap: every shown line lit approved', 'desk', /Approve \d+ — tap again/.test(c3.text) && ls.length > 0 && ls.every(l => l.lit === 'approved') ? 'PASS' : 'FAIL', `armed text "${c3.text}"; lines ${ls.map(l => l.lit || 'pending').join(',')}; head "${await txt(P, T('appr-sub'))}"; all "${await txt(P, T('appr-approve-all'))}"`, ['a4-3-all-lit'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a4-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('a4'); await L.closeBrowser(); console.log('DONE')
