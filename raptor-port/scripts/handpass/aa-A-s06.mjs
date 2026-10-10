// S6 — permission withdrawn while the OIL question is open (phone 390x844). Two tabs of ONE world: member and admin.
import { world, closeAll, toInputs, openNew, setTimes, pic, T, oilAnswer, signIn, sleep, readInputs, observe, URL_, undoState, membersSwitch } from './aa-A-lib.mjs'
const rows = []
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS6 ' + ph
  const w = await world({ who: 'us', size: 'p' })
  const A = w.page
  // admin tab in the same world
  const B = await w.ctx.newPage()
  B.on('pageerror', e => w.errs.push('B PAGEERROR ' + e)); B.on('console', m => { if (m.type() === 'error') w.errs.push('B CONSOLE ' + m.text()) })
  await B.goto(URL_); await signIn(B, 'ad')
  console.log(ph, 'B signed in as', await B.evaluate(() => document.querySelector('#roleBadge')?.innerText))
  console.log(ph, 'A signed in as', await A.evaluate(() => document.querySelector('#roleBadge')?.innerText))
  await toInputs(A)
  await openNew(A, '2026-07-18')
  await A.selectOption('#inpEditType', 'Duty'); await A.selectOption('#inpEditPerson', ph)
  const ad = A.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(A, '09:00', '12:00'); await A.fill('#inpEditRmk', rm)
  await A.locator('#inpEditSave').click(); await sleep(500)
  await A.locator(T('oil-yes')).click(); await sleep(300)
  await pic(A, `s06-${ph}-1-member-question-open`)
  const before = await readInputs(A, rm)
  console.log(ph, 'question open; saved so far:', before.length)
  // admin turns the switch off
  await toInputs(B)
  console.log(ph, 'admin switch after save (reopened):', await membersSwitch(B, false))
  await pic(B, `s06-${ph}-2-admin-switch-off`)
  // has the change reached A?
  await sleep(1500)
  const reached = await A.evaluate(() => { try { return JSON.stringify(window.INPUTCFG || window.INPCFG || null) } catch { return 'n/a' } })
  console.log(ph, 'A sees setting?', reached)
  await pic(A, `s06-${ph}-3-member-after-switch-off`)
  // press Save on the stale question
  await A.locator(T('oilconf-save')).click(); await sleep(800)
  const ob = await observe(A)
  await pic(A, `s06-${ph}-4-after-stale-save`)
  const after = await readInputs(A, rm)
  console.log(ph, 'after stale Save: saved inputs', after.length, JSON.stringify(after.map(x => x.person)), 'screen:', JSON.stringify(ob))
  const u = await undoState(A); console.log(ph, 'member undo:', JSON.stringify(u))
  rows.push({ ph, saved: after.length })
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
