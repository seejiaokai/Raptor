import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, SAT } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const out = {}
/* OFT row */
await K.boardTo(p, SAT)
{
  const b = p.locator(`#schedBoard [data-sradd="${SAT}.oft"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  const n = await p.evaluate(i => window.DAYS[i].sims.oft.length, SAT)
  console.log('oft rows', n)
  const ri = n - 1
  await W.boardText(p, `sr:${SAT}.oft.${ri}.label`, 'SIM-A')
  await W.boardText(p, `sr:${SAT}.oft.${ri}.str`, '09:00')
  await W.boardText(p, `sr:${SAT}.oft.${ri}.end`, '15:00')
  const r1 = await K.handPut(p, `s:${SAT}.oft.${ri}.p`, 'snap'); console.log('oft p', JSON.stringify(r1))
  const r2 = await K.handPut(p, `s:${SAT}.oft.${ri}.+`, 'shaft'); console.log('oft +', JSON.stringify(r2))
  console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].sims.oft, SAT)))
}
const a = await R.addRow(p, 'sim', SAT, 'SIM-B', '09:00', '15:00', 'dice'); console.log('amt', JSON.stringify(a))
console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].sims.amt, SAT)))
const d1 = await R.addRow(p, 'duty', SAT, 'DESK-A', '09:00', '15:00', 'pump'); console.log('duty', JSON.stringify(d1))
const d2 = await K.handPut(p, `d:${SAT}.0.${d1.ri}.+`, 'nact'); console.log('duty extra', JSON.stringify(d2))
console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].dutywaves.map(b => b.rows), SAT)))
const g1 = await R.addRow(p, 'ground', SAT, 'GRD-A', '09:00', '15:00', 'mamba'); console.log('ground', JSON.stringify(g1))
const g2 = await K.handPut(p, `g:${SAT}.${g1.ri}.+`, 'slipway'); console.log('ground extra', JSON.stringify(g2))
console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].ground, SAT)))
const c1 = await R.addRow(p, 'prog', SAT, 'CP-A', '09:00', '15:00', 'razer'); console.log('prog', JSON.stringify(c1))
console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].allhands, SAT)))
await D.P(p, 'probe3-board')
/* OIL mode */
const m = await D.oilMode(p, true); console.log(JSON.stringify(m))
console.log(JSON.stringify(await D.switches(p), null, 0))
for (const w of ['snap', 'shaft', 'dice', 'pump', 'nact', 'mamba', 'slipway', 'razer']) console.log(w, JSON.stringify(await D.boardBars(p, w)))
await D.P(p, 'probe3-oil')
console.log('ERR', JSON.stringify(errors))
await browser.close()
