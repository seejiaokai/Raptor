// Scenario 35 - A range across weeks. usage: node it-B-s35.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const W1 = '20/07/2026', W2 = '27/07/2026'   // Sun 26 is day 6 of the 20 Jul week; Mon 27 is day 0 of the 27 Jul week
const FOC = 'cross-week|renamed range'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s35-${size}-${variant}`
  await L.openNew(W, '2026-07-26')
  await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', ranger)
  await p.fill('#inpEditStart', '09:00').catch(() => {}); await p.fill('#inpEditEnd', '10:00').catch(() => {})
  await p.fill('#inpEditTitle', 'Cross-week')
  const d27 = p.locator('[data-testid="win-inputedit"] button', { hasText: /^27$/ }).first()
  await (W.mobile ? d27.tap() : d27.click()); await L.sleep(300)
  const head0 = await L.saveWin(W, 'no'); await L.closeWins(p)
  const r = await L.recBy(p, { person: ranger, type: 'Event', title: 'Cross-week' })
  console.log('record', JSON.stringify(r), 'oil question:', head0)
  L.setWeek(W1); await L.pubDay(W, 6)
  L.setWeek(W2); await L.pubDay(W, 0)
  const rd = async t => {
    L.setWeek(W1); const a = await L.snap(W, 6, { focus: FOC, pic: t + '-sun' })
    L.setWeek(W2); const b = await L.snap(W, 0, { focus: FOC, pic: t + '-mon' })
    const rec = await L.rec(p, r.iid)
    return { s: { a, b, rec }, text: `SUN26(wk20Jul) ${L.brief(a)} || MON27(wk27Jul) ${L.brief(b)} || saved title ${JSON.stringify(rec && rec.title)}`, pics: [t + '-sun-edit.png', t + '-sun-togo.png', t + '-mon-edit.png', t + '-mon-togo.png'] }
  }
  const base = await rd(tag + '-1published')
  // leave a week: we are on the 27 Jul week; retitle from Inputs, then visit both weeks
  L.setWeek(W2); await L.editWeek(p)
  const head1 = await L.retitle(W, r.iid, '2026-07-26', 'Renamed range')
  console.log('retitle oil question:', JSON.stringify(head1))
  const chg = await rd(tag + '-2retitled')
  const dayOk = S => S.f.pend.length === 1 && /1 pending/.test(S.f.pend[0]) && /not yet signed/i.test(S.f.nys) && (S.togo || '').includes('Cross-week') && (S.togo || '').includes('Renamed range') && !S.v.rows.some(x => /renamed/i.test(x.name))
  const applied = ({ a, b, rec }) => rec.title === 'Renamed range' && dayOk(a) && dayOk(b)
  const reverted = ({ a, b, rec }) => rec.title === 'Cross-week' && !a.f.pend.length && !b.f.pend.length && !a.f.nys && !b.f.nys && !!a.f.signedLn && !!b.f.signedLn
  const okBase = reverted(base.s)
  L.row('35', size, 'admin', okBase && applied(chg.s) && !head1 ? 'PASS' : 'FAIL', `[${variant}] Sun 26-Mon 27 Event published in both weeks, retitled from Inputs while on the 27 Jul week (OIL question on retitle: ${head1 ? JSON.stringify(head1) : 'none'}): ${chg.text}`, chg.pics)
  console.log('okBase', okBase, 'applied', applied(chg.s))
  await L.checkpoint(W, variant, { n: '35', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s35-' + size)
console.log('ERRORS', L.ERRS)
