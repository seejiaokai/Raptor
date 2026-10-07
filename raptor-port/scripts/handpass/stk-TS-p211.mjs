/* P2-11 — equal Rally and Brief remain legal (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await S.addFlyWave(p, 4)
await S.boardBox(p, 'ff:4.0.0.cs', 'VL'); await S.boardBox(p, 'ff:4.0.0.msn', 'BFM'); await S.boardBox(p, 'ff:4.0.0.to', '12:00'); await S.boardBox(p, 'ff:4.0.0.br', '09:40')
const add = async () => { const b = p.locator('#schedBoard [data-itadd="4|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500) }
await add(); await S.typeLine(p, '#schedBoard', '4|0|0', '08:00H: IN TIME')
await add(); await S.typeLine(p, '#schedBoard', '4|0|1', '09:40H: RALLY')
const read = async tag => { const w = await S.reportWarns(p, 4); const wh = await S.waveHead(p, 4, 0); return { tag, warns: w.map(x => x.sev + ': ' + x.msg), near: wh.near[0], lines: wh.lines } }
const s1 = await read('in-time 08:00, rally 09:40, brief 09:40, T/O 12:00'); console.log(JSON.stringify(s1))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p211-1-equal-rally-brief')
await S.typeLine(p, '#schedBoard', '4|0|1', '09:41H: RALLY')
const s2 = await read('rally 09:41'); console.log(JSON.stringify(s2))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p211-2-rally-0941')
await S.typeLine(p, '#schedBoard', '4|0|1', '09:40H: RALLY')
const s3 = await read('rally back to 09:40'); console.log(JSON.stringify(s3))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p211-3-rally-back-0940')
// and the same on the week for the edit explanation
await S.toWeek(p); await W.showDay(p, 4)
const wk = await S.waveHead(p, 4, 0); console.log('week near', JSON.stringify(wk.near))
const ok1 = !s1.warns.some(w => /rally/i.test(w)); const ok2 = s2.warns.some(w => /rally 09:41/i.test(w)); const ok3 = !s3.warns.some(w => /rally/i.test(w))
row('P2-11', 'New Friday wave on the Board: VL, take-off 12:00, Brief typed 09:40; lines "08:00H: IN TIME" and "09:40H: RALLY" (button + typing); then Rally retyped 09:41, then 09:40 again',
  `equal: warnings ${JSON.stringify(s1.warns)} (beside wave: ${s1.near}); rally 09:41: ${JSON.stringify(s2.warns)} (beside wave: ${s2.near}); back to 09:40: ${JSON.stringify(s3.warns)} (beside wave: ${s3.near})`,
  ok1 && ok2 && ok3 ? 'PASS' : 'FAIL', ['p211-1-equal-rally-brief', 'p211-2-rally-0941', 'p211-3-rally-back-0940'])
console.log('errors', errors)
S.savePart('p211', { errors, s1, s2, s3 })
await browser.close()
