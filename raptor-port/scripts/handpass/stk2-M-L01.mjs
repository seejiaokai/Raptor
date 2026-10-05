/* L-01 — a published weekend's earned leave, and three Logic values. */
import * as G from './stk2-M-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W, AM } = G
const w = await G.world()
const p = w.p
const SAT = 5
const rowsOut = []

await G.boardOn(p, SAT)
await G.addWave(p, SAT)
await type(p, `[data-bfld="ff:${SAT}.0.0.cs"]`, 'VIPER')
await type(p, `[data-bfld="ff:${SAT}.0.0.to"]`, '10:00')
await type(p, `[data-bfld="ff:${SAT}.0.0.ld"]`, '11:15')
const put1 = await put(p, `[data-slot="${SAT}.0.0.0.p"]`, ['bane'])
console.log('seat', put1)
await G.pic(p, 'L01-01-board-built')
const signed = await W.signDay(p, SAT)
const pub = await W.publishDay(p, SAT)
console.log('signed', signed, 'pub', pub)
await G.sleep(800)
const h0 = await W.head(p, SAT)
console.log('head after publish', JSON.stringify(h0))
await G.pic(p, 'L01-02-board-published')
await G.boardOff(p)

async function snap(label) {
  const out = { label }
  await G.sleep(300)
  out.cell = await G.lwRead(p, 'bane')
  await G.pic(p, `L01-${label}-lw-cell`)
  const t = await G.oilTrackerRead(p)
  out.trackerRanger = (t.entries || []).filter(e => /Ranger/i.test(e))
  out.trackerN = (t.entries || []).length
  out.trackerRangerLine = ((t.text||'').match(/Ranger IP[^A-Z]{0,120}?(?:left)?(?= [A-Z][a-z]+ I?[A-Z])/)||[''])[0]
  out.trackerText = ''
  await G.pic(p, `L01-${label}-tracker`)
  await G.oilTrackerClose(p)
  await L.go(p, 'editsched')
  await W.showDay(p, SAT)
  out.head = await W.head(p, SAT)
  out.amend = await p.evaluate(() => (document.querySelector('#alPanel')||{}).innerText?.replace(/\s+/g,' ').trim().slice(0,200))
  out.rules = await p.evaluate(() => ({ stamp: document.body.classList.contains('page-rules-off') }))
  out.vconf = await p.evaluate(() => ({ reportLead: VCONF.reportLead, debrief: VCONF.debrief, oilFullMin: VCONF.oilFullMin }))
  await G.pic(p, `L01-${label}-sat-bar`)
  console.log('SNAP', JSON.stringify(out))
  rowsOut.push(out)
  return out
}
await snap('A-baseline')

/* nominal report 3h -> 2h30 */
await G.logicEditOn(p)
const v1 = await G.logicSet(p, 'reportLead', '2h30')
await G.pic(p, 'L01-B0-logic-report-2h30')
console.log('reportLead box', v1)
await G.logicDone(p)
await snap('B-report-2h30')
/* back */
await G.logicEditOn(p); await G.logicSet(p, 'reportLead', '3h'); await G.logicDone(p)
await snap('C-report-back-3h')

/* debrief 2h -> 1h30 */
await G.logicEditOn(p)
await G.logicSet(p, 'debrief', '1h30')
await G.pic(p, 'L01-D0-logic-debrief-1h30')
await G.logicDone(p)
await snap('D-debrief-1h30')
await G.logicEditOn(p); await G.logicSet(p, 'debrief', '2h'); await G.logicDone(p)
await snap('E-debrief-back-2h')

/* full-day threshold +30 min */
const std = await p.evaluate(() => VCONF.oilFullMin)
await G.logicEditOn(p)
const box = await G.logicSet(p, 'oilFullMin', String(std + 30))
await G.pic(p, 'L01-F0-logic-threshold')
console.log('oilFullMin box', box, 'std', std)
await G.logicDone(p)
await snap('F-threshold-plus30')
await G.logicEditOn(p); await G.logicSet(p, 'oilFullMin', String(std)); await G.logicDone(p)
await snap('G-threshold-back')

G.rec('L-01', 'raw', rowsOut, 'RAW')
G.save('L01-' + (process.env.HP_PHONE ? 'ph' : 'dk'), { rowsOut, errors: w.errors })
console.log('errors', w.errors)
await w.browser.close()
