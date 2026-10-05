/* P2-06 — specific overrides apply separately to each activity (desktop; phone with HP_PHONE=1) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row, savePart } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const clear = async (di, gi) => { for (let i = 0; i < 6; i++) { const n = (await S.weekLines(p, di, gi)).length; if (!n) break; await S.typeLine(p, '#eWeek', `${di}|${gi}|0`, '') } }
await W.showDay(p, 0)
await S.weekBox(p, 'ff:0.0.0.to', '12:00'); await S.weekBox(p, 'ff:0.0.1.to', '12:00')
await clear(0, 0)
const model = await S.readDayModel(p, 0)
const crewOf = f => [...new Set(f.ac.flatMap(a => [a.p, a.w]))]
const names = {}
for (const f of model[0].forms) { names[f.cs] = []; for (const i of crewOf(f)) names[f.cs].push(await S.csOf(p, i)) }
console.log('crews', JSON.stringify(names), 'forms', JSON.stringify(model[0].forms.map(f => [f.cs, f.to, f.ld])), 'lines', JSON.stringify(await S.weekLines(p, 0, 0)))
await W.showDay(p, 0)
const h0 = await S.hoursMap(p, { shot: 'p206-1-baseline-insights' })
await W.showDay(p, 0); await pic(p, 'p206-1b-baseline-week')
const states = { baseline: h0.hours }
// press the add button three times; read what each fills in
const addTexts = []
async function add() { const b = p.locator('#eWeek .day[data-day="0"] [data-itadd="0|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500); const ls = await S.weekLines(p, 0, 0); return ls[ls.length - 1] }
const a1 = await add(); addTexts.push(a1)
await S.typeLine(p, '#eWeek', a1.at, '08:00H: IN TIME')
const a2 = await add(); addTexts.push(a2)
await S.typeLine(p, '#eWeek', a2.at, '08:30H: VL RALLY')
const linesA = await S.weekLines(p, 0, 0)
const wA = await S.waveHead(p, 0, 0); const warnA = await S.reportWarns(p, 0)
await S.picAt(p, '#eWeek [data-itline="0|0|0"]', 'p206-2-general-in-time-plus-VL-rally-week')
const hA = await S.hoursMap(p, { shot: 'p206-3-state-A-insights' })
states.A = hA.hours
// add VL in-time 09:00
const a3 = await add(); addTexts.push(a3)
await S.typeLine(p, '#eWeek', a3.at, '09:00H: VL IN TIME')
const linesB = await S.weekLines(p, 0, 0)
const wB = await S.waveHead(p, 0, 0); const warnB = await S.reportWarns(p, 0)
await S.picAt(p, '#eWeek [data-itline="0|0|0"]', 'p206-4-added-VL-in-time-week')
const hB = await S.hoursMap(p, { shot: 'p206-5-state-B-insights' })
states.B = hB.hours
const all = Object.entries(names).flatMap(([f, ns]) => ns.map(n => ({ f, n })))
const tab = all.map(({ f, n }) => `${f}:${n} nominal ${states.baseline[n]} → A ${states.A[n]} → B ${states.B[n]}`)
console.log(tab.join('\n'))
console.log('A lines', JSON.stringify(linesA), 'B lines', JSON.stringify(linesB))
console.log('A near', JSON.stringify(wA.near), 'B near', JSON.stringify(wB.near))
console.log('warnA', JSON.stringify(warnA), 'warnB', JSON.stringify(warnB))
// the board's view of the same wave
if (!S.PHONE) { await S.openBoard(p, 0); await S.picAt(p, '#schedBoard [data-itline="0|0|0"]', 'p206-6-board-wave1'); const bl = await S.boardLines(p, 0, 0); console.log('board lines', JSON.stringify(bl)); await S.boardOff(p) }
row('P2-06', `Monday wave 1: both formations (VL, RU) take-off set to 12:00 in the boxes, lines cleared, then "+ In-time / Rally" pressed three times and typed: (A) general "08:00H: IN TIME" + "08:30H: VL RALLY"; (B) plus "09:00H: VL IN TIME". Work-hours read from Insights each time. ${S.PHONE ? '(phone 390x844, Insights via the drawer)' : '(desktop)'}`,
  `Button fills: ${addTexts.map(a => a && a.text).join(' | ')}. Work hours (week total) nominal→A→B: ${tab.join(' ; ')}. Warnings on Monday after A: ${warnA.map(w => w.msg).join(' | ') || 'none'}; after B: ${warnB.map(w => w.msg).join(' | ') || 'none'}. Messages beside the wave after B: ${JSON.stringify(wB.near).slice(0, 500)}`,
  'RECORDED-pending-judge', ['p206-2-general-in-time-plus-VL-rally-week', 'p206-3-state-A-insights', 'p206-5-state-B-insights'])
console.log('errors', errors)
S.savePart('p206', { errors, names, states, addTexts, linesA, linesB, warnA, warnB, wA, wB })
await browser.close()
