/* rcb2-w3 R1 v1 — A: debrief advisory and tight turn with take-off typed, landing blank / typed. usage: [PHONE=1] node rcb2-w3-r1.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r1-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep, FRI } = X
say('rcb2-w3-r1 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const adv = /debrief|turn/i
const pick = a => (a || []).filter(l => adv.test(l))

await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.msn"]`, 'VL BFM')
// ground BRIEFING row 12:40-13:00 with Ranger
const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
await X.press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'BRIEFING')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:40')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:00')
say('seat ground', await X.seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, 'bane'))
say('ground row', await page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].ground[g]), [FRI, g0]))
say('formation', await page.evaluate(([d, g]) => JSON.stringify({ to: window.DAYS[d].waves[g].formations[0].to, ld: window.DAYS[d].waves[g].formations[0].ld, msn: window.DAYS[d].waves[g].formations[0].msn }), [FRI, wi]))

async function readAll(tag) {
  const bw = await X.boardWarn(w)
  await X.pic(w, `r1-${tag}-board-${P}`)
  await X.closeBoard(w)
  const dd = await X.dayDetails(w, '#eWeek', FRI)
  await X.pic(w, `r1-${tag}-daydet-${P}`)
  await X.closeDayPop(w, 'done')
  await X.board(w, FRI)
  return { board: bw, details: dd.items || [] }
}
function judge(tag, re, exp, rd, pic) {
  for (const k of ['board', 'details']) {
    const v = pick(rd[k])
    X.row('R1 ' + tag, size, k + ' warning line', exp, JSON.stringify(v), v.some(l => re.test(l)) ? 'PASS' : 'FAIL', `r1-${tag}-${k === 'board' ? 'board' : 'daydet'}-${P}.png`)
  }
}
say('ALL BOARD', JSON.stringify(await X.boardWarn(w)))
// 1: debrief, landing blank
let rd = await readAll('a-debrief-blank')
say('RD a', JSON.stringify(rd))
judge('a-debrief-blank', /VL BFM debrief.*BRIEFING sits inside 12:00.14:00 \(take-off \+ 2h, no landing typed\)/, 'debrief line ends "(take-off + 2h, no landing typed)"', rd)

// 2: second flight RU 13:00-14:00 Ranger -> tight turn 60 min
const w2 = await X.flight(w, FRI, '13:00', '14:00')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${w2}.0.msn"]`, 'RU')
rd = await readAll('b-turn-blank')
say('RD b', JSON.stringify(rd))
judge('b-turn-blank', /60 min take-off.next T\/O, no landing typed \(needs/, 'tight turn "60 min take-off→next T/O, no landing typed (needs …)"', rd)
judge('b-debrief-blank-still', /\(take-off \+ 2h, no landing typed\)/, 'debrief still "take-off + 2h, no landing typed"', rd)

// 3: type VL landing 12:30
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.ld"]`, '12:30')
rd = await readAll('c-typed')
say('RD c', JSON.stringify(rd))
judge('c-typed-debrief', /\(land \+ 2h\)/, 'debrief ends "(land + 2h)"', rd)
for (const k of ['board', 'details']) {
  const v = pick(rd[k]).filter(l => /turn|min/i.test(l))
  X.row('R1 c-typed-turn', size, k + ' tight turn', '"… min land→next T/O (needs …)", no "no landing typed"', JSON.stringify(v), v.length && v.every(l => !/no landing typed/.test(l)) && v.some(l => /land.next T\/O/.test(l)) ? 'PASS' : (v.length ? 'FAIL' : 'RECORDED'), `r1-c-typed-${k === 'board' ? 'board' : 'daydet'}-${P}.png`)
}
await X.closeBoard(w)
await X.fin(w)
