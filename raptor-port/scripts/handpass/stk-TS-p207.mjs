/* P2-07 — duplicate lines compare dates before clocks (desktop; HP_PHONE=1 for the phone) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const clear = async (di, gi) => { for (let i = 0; i < 6; i++) { const n = (await S.weekLines(p, di, gi)).length; if (!n) break; await S.typeLine(p, '#eWeek', `${di}|${gi}|0`, '') } }
await W.showDay(p, 1)
await S.weekBox(p, 'ff:1.0.0.to', '01:00')
await clear(1, 0)
const model = await S.readDayModel(p, 1)
const vl = model[0].forms[0]
const names = []; for (const i of [...new Set(vl.ac.flatMap(a => [a.p, a.w]))]) names.push(await S.csOf(p, i))
console.log('VL', vl.cs, vl.to, vl.ld, names.join(','), 'intimes', JSON.stringify(model[0].intimes))
const snap = async (tag, shot) => {
  const lines = await S.weekLines(p, 1, 0), wh = await S.waveHead(p, 1, 0), warns = await S.reportWarns(p, 1)
  await S.picAt(p, '#eWeek [data-itline="1|0|0"], #eWeek .day[data-day="1"] [data-itadd="1|0"]', shot + '-week')
  const h = await S.hoursMap(p, { shot: shot + '-insights' })
  const m = (await S.readDayModel(p, 1))[0]
  return { tag, lines, near: wh.near[0], asd: wh.asd, warns: warns.map(w => w.msg), hrs: Object.fromEntries(names.map(n => [n, h.hours[n]])), model: m.intimes }
}
const s0 = await snap('no lines', 'p207-1-none')
async function add() { const b = p.locator('#eWeek .day[data-day="1"] [data-itadd="1|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500); const ls = await S.weekLines(p, 1, 0); return ls[ls.length - 1] }
const a1 = await add(); await S.typeLine(p, '#eWeek', a1.at, '23:00H: VL IN TIME')
const a2 = await add(); await S.typeLine(p, '#eWeek', a2.at, '00:15H: VL IN TIME')
const s1 = await snap('23:00 then 00:15', 'p207-2-23-then-0015')
// reverse their order by editing the two lines
await S.typeLine(p, '#eWeek', '1|0|0', '00:15H: VL IN TIME')
await S.typeLine(p, '#eWeek', '1|0|1', '23:00H: VL IN TIME')
const s2 = await snap('00:15 then 23:00', 'p207-3-reversed')
for (const s of [s0, s1, s2]) console.log(s.tag, JSON.stringify(s))
const same = JSON.stringify(s1.hrs) === JSON.stringify(s2.hrs)
const moved = JSON.stringify(s0.hrs) !== JSON.stringify(s1.hrs)
row('P2-07', `Tuesday wave 1: VL take-off set to 01:00 in the box, lines cleared, two lines typed "23:00H: VL IN TIME" and "00:15H: VL IN TIME" (button then typing), then the two lines' texts swapped; Insights read each time. ${S.PHONE ? '(phone)' : '(desktop)'}`,
  `Crew ${names.join('/')} Work hours (week): none ${JSON.stringify(s0.hrs)} → 23:00 first ${JSON.stringify(s1.hrs)} → reversed ${JSON.stringify(s2.hrs)}. Same figures before/after the swap: ${same}. Lines as painted: ${JSON.stringify(s1.lines)} / ${JSON.stringify(s2.lines)}. Messages beside the wave: ${s1.near} // ${s2.near}. Report warnings: ${JSON.stringify(s1.warns)} // ${JSON.stringify(s2.warns)}`,
  same && moved ? 'PASS' : 'FAIL', ['p207-2-23-then-0015-week', 'p207-2-23-then-0015-insights', 'p207-3-reversed-week', 'p207-3-reversed-insights'])
console.log('errors', errors)
S.savePart('p207', { errors, s0, s1, s2 })
await browser.close()
