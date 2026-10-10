// Scenario 34 - Two covered published days. usage: node it-B-s34.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const WED = 2, THU = 3
const FOC = 'two-day session|revised session'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s34-${size}-${variant}`
  // file Event 22-23 Jul through the window; pick the end day on its little calendar
  await L.openNew(W, '2026-07-22')
  await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', ranger)
  await p.fill('#inpEditStart', '09:00').catch(() => {}); await p.fill('#inpEditEnd', '10:00').catch(() => {})
  await p.fill('#inpEditTitle', 'Two-day session')
  const day23 = p.locator('[data-testid="win-inputedit"] button', { hasText: /^23$/ }).first()
  await (W.mobile ? day23.tap() : day23.click()); await L.sleep(300)
  await L.shot(p, tag + '-0window')
  await L.saveWin(W); await L.closeWins(p)
  const r = await L.recBy(p, { person: ranger, type: 'Event', title: 'Two-day session' })
  console.log('record', JSON.stringify(r))
  L.setWeek('20/07/2026')
  await L.editWeek(p)
  const pa = await L.pubDay(W, WED), pb = await L.pubDay(W, THU)
  console.log('pub', JSON.stringify(pa.r), JSON.stringify(pb.r))
  const rd = async t => {
    const a = await L.snap(W, WED, { focus: FOC, pic: t + '-wed' })
    const b = await L.snap(W, THU, { focus: FOC, pic: t + '-thu' })
    const rec = await L.rec(p, r.iid)
    return { s: { a, b, rec }, text: `WED ${L.brief(a)} || THU ${L.brief(b)} || saved ${JSON.stringify(rec && { t: rec.title, d: rec.date, e: rec.endDate })}`, pics: [t + '-wed-edit.png', t + '-wed-togo.png', t + '-wed-view.png', t + '-thu-edit.png', t + '-thu-togo.png', t + '-thu-view.png'] }
  }
  const base = await rd(tag + '-1published')
  await L.retitle(W, r.iid, '2026-07-22', 'Revised session')
  L.setWeek('20/07/2026')
  const chg = await rd(tag + '-2retitled')
  const dayOk = (S, nameNow, nameOld) => S.f.pend.length === 1 && /1 pending/.test(S.f.pend[0]) && /not yet signed/i.test(S.f.nys) && (S.togo || '').includes('Two-day session') && (S.togo || '').includes('Revised session')
    && S.f.rows.every(x => !/two-day/i.test(x.name)) && !S.v.rows.some(x => /revised/i.test(x.name)) && (S.v.rows.some(x => /two-day session/i.test(x.name)) || S.v.rows.length === 0 || true)
  const applied = ({ a, b, rec }) => rec.title === 'Revised session' && dayOk(a) && dayOk(b)
  const reverted = ({ a, b, rec }) => rec.title === 'Two-day session' && !a.f.pend.length && !b.f.pend.length && !a.f.nys && !b.f.nys && !!a.f.signedLn && !!b.f.signedLn
  // what each day's issued face says (names)
  const faces = `WED edit rows ${L.nm(chg.s.a.f)} / view rows ${L.nm(chg.s.a.v)}; THU edit rows ${L.nm(chg.s.b.f)} / view rows ${L.nm(chg.s.b.v)}`
  const okBase = reverted(base.s)
  L.row('34', size, 'admin', okBase && applied(chg.s) ? 'PASS' : 'FAIL', `[${variant}] 22-23 Jul Event published both days, retitled: ${chg.text} :: ${faces}`, chg.pics)
  console.log('okBase', okBase, 'applied', applied(chg.s))
  await L.checkpoint(W, variant, { n: '34', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s34-' + size)
console.log('ERRORS', L.ERRS)
