/* P2-01 — a published Saturday's earned leave survives a Logic change (judged) */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)

async function rec(label, picName) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, 'stiff', S.SAT)
  await p.evaluate(d => { const c = document.querySelector(`[data-testid="cell-stiff-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, S.SAT)
  await sleep(300)
  const picCell = await pic(p, picName + '-cell')
  const oil = await S.oilRow(p, 'stiff')
  const picOil = await pic(p, picName + '-oil')
  await S.closeOil(p)
  log(label, JSON.stringify({ cell, oil }))
  return { cell, oil, picCell, picOil }
}

// setup: Saber on a Saturday flight 12:00-13:00, lead 180, debrief 120; publish
const lg0 = await S.logicGet(p)
await L.go(p, 'editsched'); await sleep(300)
const w = await S.addFlyingWave(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'stiff' })
const pub = await S.publishNew(p, 5); await S.closeBoard(p)
const r1 = await rec('1 after publish', 'P2-01-a')
// change nominal lead to 240 via Logic
const set = await S.logicSet(p, 'reportLead', '4h')
const lg1 = await S.logicGet(p)
await L.go(p, 'editsched'); await sleep(500)
await S.W.showDay(p, 5)
const satHead = await S.dayHead(p, 5), panel = await S.alPanel(p), satPend = await S.pendingKeys(p, 5)
const picSat = await pic(p, 'P2-01-b-saturday-after-logic-change')
const r2 = await rec('2 after Logic change, revisit Leave War', 'P2-01-c')
// switch weeks: next week and back
await L.go(p, 'editsched'); await sleep(400)
await p.locator('#page-editsched [data-wk]:visible').evaluateAll(es => es.map(e => e.dataset.wk)).then(a => log('weeks', a))
const wks = await p.locator('#page-editsched [data-wk]:visible').evaluateAll(es => es.map(e => e.dataset.wk))
const cur = await p.evaluate(() => window.CURWEEK)
const other = wks.find(x => x !== cur)
await p.locator(`#page-editsched [data-wk="${other}"]:visible`).click(); await sleep(900)
await p.locator(`#page-editsched [data-wk="${cur}"]:visible`).click(); await sleep(900)
const r3 = await rec('3 after switching weeks', 'P2-01-d')
// reload
await S.reloadAs(p, 'a'); await sleep(500)
const lg2 = await S.logicGet(p)
const r4 = await rec('4 after reload', 'P2-01-e')
const letters = r => (/\b(HO|FO)\b/.exec(r.cell.text || '') || [])[1] || r.cell.text
judge('P2-01', 'Saber on a Saturday flight 12:00-13:00 (lead 3h, debrief 2h), published; Logic lead set to 4h; revisited Leave War, switched weeks, reloaded', [
  ['published; the day is issued', pub.head.tag === 'ORIG', pub.head.tag],
  ['after publication: HO, 0.5 earned (09:00-15:00)', letters(r1) === 'HO' && /0\.5/.test(r1.oil) && /09:00.15:00/.test(r1.oil), { cell: r1.cell.text, oil: r1.oil }],
  ['Logic lead really changed to 240', lg0.reportLead === 180 && lg1.reportLead === 240, { lg0, lg1 }],
  ['still HO after the Logic change', letters(r2) === 'HO', r2.cell.text],
  ['still HO after switching weeks', letters(r3) === 'HO', r3.cell.text],
  ['still HO after reload (Logic value kept)', letters(r4) === 'HO' && lg2.reportLead === 240, { cell: r4.cell.text, lead: lg2.reportLead }],
  ['the OIL tracker line did not move to FO or change its span', [r2, r3, r4].every(r => /0\.5/.test(r.oil) && /09:00.15:00/.test(r.oil)), [r2.oil, r3.oil, r4.oil]],
], [r1.picCell, r1.picOil, picSat, r2.picCell, r2.picOil, r3.picCell, r4.picCell, r4.picOil])
log('saturday head after logic change', JSON.stringify({ satHead, panel, satPend }))
console.log(errors)
savePart('p2a')
await browser.close()
