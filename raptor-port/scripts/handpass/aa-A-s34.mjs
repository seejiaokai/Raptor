// S34 — valid filing, remark edit, answer-only change and take-off/reinstate survive Undo, Redo and a reload (admin, desktop).
import { closeWins, world, closeAll, toInputs, fileInput, listAll, listSearch, listRow, pencil, PE, PSAVE, pic, T, oilAnswer, sleep, readInputs, observe, undoState, signIn } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const rec = async (page, rm) => page.evaluate(r => { const x = window.INPUTS.find(y => (y.remarks || '').startsWith(r)); return x ? { who: window.PEOPLE[x.person]?.cs, type: x.type, date: x.date, s: x.s, e: x.e, oil: x.oil, rmk: x.remarks, acc: x.acc } : null }, rm)
const msgs = async page => (await observe(page)).msgs.filter(m => !/^⠿/.test(m)).slice(0, 2)
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS34 ' + ph
  const w = await world({ who: 'ad', size: 'd' })
  const page = w.page
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Event', person: ph, remarks: rm, start: '09:00', end: '12:00', oil: 'yes' })
  await closeWins(page)
  const step = async (label, fn) => { await fn(); await sleep(700); console.log(ph, label, '->', JSON.stringify(await rec(page, rm)), '| toasts', JSON.stringify(await msgs(page))) }
  console.log(ph, 'created ->', JSON.stringify(await rec(page, rm)))
  // a. creation
  await step('Undo the creation', () => page.locator('#undoBtn').click())
  await step('Redo the creation', () => page.locator('#redoBtn').click())
  await page.reload(); await sleep(900); if (await page.locator('#luser').count()) await signIn(page, 'ad')
  console.log(ph, 'after reload ->', JSON.stringify(await rec(page, rm)))
  // b. remark edit through the List pencil
  await toInputs(page); await listAll(page); await listSearch(page, rm)
  await pencil(page, rm)
  await page.fill('tr.ined [data-ed="remarks"]', rm + ' EDITED')
  await page.locator(PSAVE).click(); await sleep(700)
  console.log(ph, 'remark edited ->', JSON.stringify(await rec(page, rm)))
  await step('Undo the remark edit', () => page.locator('#undoBtn').click())
  await step('Redo the remark edit', () => page.locator('#redoBtn').click())
  // c. answer-only change
  await listSearch(page, rm)
  await listRow(page, rm).locator('.roil').click(); await sleep(500)
  await oilAnswer(page, 'no')
  console.log(ph, 'answer changed to No ->', JSON.stringify(await rec(page, rm)), '| toasts', JSON.stringify(await msgs(page)))
  await step('Undo the answer change', () => page.locator('#undoBtn').click())
  await step('Redo the answer change', () => page.locator('#redoBtn').click())
  await page.reload(); await sleep(900); if (await page.locator('#luser').count()) await signIn(page, 'ad')
  console.log(ph, 'after reload (final) ->', JSON.stringify(await rec(page, rm)))
  await pic(page, `s34-${ph}-1-final-list`)
  // d. take off and reinstate on the board
  await L.go(page, 'editsched'); await L.board(page, 5)
  const iid = await page.evaluate(r => window.INPUTS.find(y => (y.remarks || '').startsWith(r)).iid, rm)
  await L.openInputs(page, 5)
  const onProg = async () => page.evaluate(i => ({ ground: (window.DAYS[5].ground || []).filter(g => String(g.src || '') === i).length, acc: window.INPUTS.find(y => y.iid === i).acc }), iid)
  console.log(ph, 'on the programme:', JSON.stringify(await onProg()))
  const takeoff = page.locator(`#schedBoard .accb[data-acc="x"][data-acck="${iid}"]`).first()
  console.log(ph, 'take-off button present:', await takeoff.count())
  if (await takeoff.count()) {
    await takeoff.evaluate(e => e.scrollIntoView({ block: 'center' })); await takeoff.click(); await sleep(700)
    console.log(ph, 'taken off ->', JSON.stringify(await onProg()))
    await pic(page, `s34-${ph}-2-taken-off`)
    await page.locator('#sbUndo').click(); await sleep(700); console.log(ph, 'Undo (board) ->', JSON.stringify(await onProg()), JSON.stringify(await msgs(page)))
    await page.locator('#sbRedo').click(); await sleep(700); console.log(ph, 'Redo (board) ->', JSON.stringify(await onProg()), JSON.stringify(await msgs(page)))
    const reinstate = page.locator(`#schedBoard .accb[data-acc="g"][data-acck="${iid}"]`).first()
    console.log(ph, 'reinstate (Accept) button present:', await reinstate.count())
    if (await reinstate.count()) { await reinstate.evaluate(e => e.scrollIntoView({ block: 'center' })); await reinstate.click(); await sleep(700); console.log(ph, 'reinstated ->', JSON.stringify(await onProg())) }
    await pic(page, `s34-${ph}-3-reinstated`)
    await page.locator('#sbUndo').click(); await sleep(600); console.log(ph, 'Undo the reinstate ->', JSON.stringify(await onProg()))
    await page.locator('#sbRedo').click(); await sleep(600); console.log(ph, 'Redo the reinstate ->', JSON.stringify(await onProg()), JSON.stringify(await msgs(page)))
  }
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
