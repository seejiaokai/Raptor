import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
let names
const state = async () => (await L.recAll(p, { type: 'Duty', date: 'Jul 18' })).filter(r => r.grp).map(r => `${names[r.person]}:${r.s}-${r.e}:${r.oil ? JSON.stringify(r.oil) : 'null'}`).sort().join(' ; ')
try {
  names = await p.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[k] = v.cs; return o })
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', title: 'Three on duty', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00', oil: 'yes' })
  parts.push('Saber filed a Sat 18 Jul 09:00-12:00 Duty for Ace, Ranger, Saber and answered Yes: ' + await state())
  // Ranger changes his own answer
  await L.switchUser(w, 'us')
  await L.openByText(w, 'Three on duty')
  const ob = p.locator('[data-testid="oil-revise-own"]')
  await ob.scrollIntoViewIfNeeded(); await ob.tap(); await sleep(500)
  await L.answerOil(w, 'no'); await sleep(500)
  const st1 = await state()
  parts.push('Ranger changed his own answer to No: ' + st1)
  const rs1 = await L.recAll(p, { type: 'Duty', date: 'Jul 18' })
  const yes = r => r.oil && Object.values(r.oil).some(v => v > 0)
  if (!(rs1.filter(r => names[r.person] === 'Ranger').every(r => !yes(r)) && rs1.filter(r => names[r.person] !== 'Ranger').every(yes))) fail("Ranger's No did not affect only him: " + st1)
  await L.closeWins(p)
  // Saber changes the hours, answers Yes again
  await L.switchUser(w, 'ad')
  await L.openByText(w, 'Three on duty')
  await L.setTimes(p, null, '17:00')
  const s = await L.saveWin(w)
  parts.push(`Saber changed the shared hours to 09:00-17:00; question on Save: ${s.asked ? s.head.slice(0, 200) : 'none'}`)
  pics.push(await L.pic(w, '73-1-new-question'))
  if (!s.asked) fail('no new OIL question after the hours change')
  else { await L.answerOil(w, 'yes'); await sleep(600) }
  const st2 = await state()
  parts.push("after the filer's new Yes: " + st2)
  const rs2 = await L.recAll(p, { type: 'Duty', date: 'Jul 18' })
  if (!rs2.every(yes)) fail("the filer's later answer did not replace the group's earlier answers: " + st2)
  await L.closeWins(p)
  const u = await L.undo(w); const stU = await state()
  const r = await L.redo(w); const stR = await state()
  parts.push(`Undo ${u}: ${stU}; Redo ${r}: ${stR}`)
  if (stR !== st2) fail('Redo did not restore')
  L.row('73a', 'phone 390x844', 'Admin (Saber) and Member (Ranger)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '73-err'))
  L.row('73a', 'phone 390x844', 'Admin/Member', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
