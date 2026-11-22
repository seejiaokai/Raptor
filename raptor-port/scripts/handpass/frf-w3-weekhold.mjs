// frf-w3-weekhold — the lead from F2-f step 4–5, reproduced: a sign-off held, the board moved to the next week with the
// list up, Later pressed there; then back to the week of 13 Jul: was Saturday 18 signed, and does its box ask again?
import * as L from './frf-w3-lib.mjs'
console.log('frf-w3-weekhold v1')
const LIST = '[data-testid="win-oilday"]'
for (const k of (process.env.SIZE ? [process.env.SIZE] : ['desktop', 'phone'])) {
  const sz = L.SIZES[k], { b, p } = await L.open(sz); await L.login(p, 'ad')
  await p.evaluate(() => { const w = window; w.fileInput({ type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g', people: [{ p: 'bane' }], iid: 'w3-wk' }); w.afterSchedMutate() })
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0)
  const wk = p.locator('[data-sbweek="1"]').filter({ visible: true })
  if (await wk.count()) await wk.first().click(); else { await L.press(p, sz, '#sbNextDay'); await p.waitForTimeout(500); await L.press(p, sz, '#sbNextDay') }
  await p.waitForTimeout(800)
  const h = await L.heldFacts(p), date = await p.evaluate(() => document.getElementById('sbDate').textContent)
  await L.shot(p, sz, 'wk-1-next-week-list-says-later-signs')
  console.log(k, 'in the next week:', JSON.stringify({ date, held: h && h.held, name: h && h.name, foot: h && h.foot, title: h && h.title }))
  await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(500)
  const t = await L.toastText(p); await L.shot(p, sz, 'wk-2-after-later')
  console.log(k, 'after Later: list up', await L.listUp(p), 'note', JSON.stringify(t && t.op === '1' ? t.text : null), 'this week Sat signs', await L.signs(p))
  const back = p.locator('[data-sbweek="-1"]').filter({ visible: true })
  if (await back.count()) await back.first().click(); else { await L.press(p, sz, '#sbPrevDay'); await p.waitForTimeout(500); await L.press(p, sz, '#sbPrevDay') }
  await p.waitForTimeout(800)
  console.log(k, 'back on', await p.evaluate(() => document.getElementById('sbDate').textContent), 'Sat 18 signs', await L.signs(p))
  await L.pickSign(p, 'board', 'cur', 0)
  console.log(k, 'press CUR CK again: list up', await L.listUp(p), 'signs', await L.signs(p))
  await L.shot(p, sz, 'wk-3-back-asks-again')
  await L.done(b)
}
console.log('errors', L.errs)
