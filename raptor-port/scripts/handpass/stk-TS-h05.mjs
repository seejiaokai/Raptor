/* H-05 — the button on a wave that flies just after midnight (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const pidOf = async cs => p.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0], cs)
const crewCs = 'Cinch'; const cid = await pidOf(crewCs)
const lead = (await S.logicValText(p)).text; console.log('Logic nominal report', lead)
await S.toWeek(p)
const hr = async shot => { const h = await S.hoursMap(p, { shot }); return h.hours[crewCs] || '(not listed)' }
const h0 = await hr('h05-0-before')
await S.addFlyWave(p, 1)
const gi = (await S.readDayModel(p, 1)).length - 1
await S.boardBox(p, `ff:1.${gi}.0.cs`, 'ZZ'); await S.boardBox(p, `ff:1.${gi}.0.msn`, 'BFM'); await S.boardBox(p, `ff:1.${gi}.0.to`, '01:30'); await S.boardBox(p, `ff:1.${gi}.0.ld`, '02:30')
console.log('seat', JSON.stringify(await S.crew(p, `1.${gi}.0.0.p`, cid)))
const h1 = await hr('h05-1-crew-no-line')
const warn1 = (await S.reportWarns(p, 1)).map(w => w.sev + ': ' + w.msg)
// press the button on the WEEK
await S.toWeek(p); await W.showDay(p, 1)
const b = p.locator(`#eWeek .day[data-day="1"] [data-itadd="1|${gi}"]`).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(600)
const weekLines = await S.weekLines(p, 1, gi); console.log('week line', JSON.stringify(weekLines))
const wk = await S.waveHead(p, 1, gi); console.log('week head', JSON.stringify(wk))
await S.picAt(p, `#eWeek .day[data-day="1"] [data-itline="1|${gi}|0"]`, 'h05-2-week-after-press')
const warnWeek = (await S.warnTexts(p, 1)).filter(w => !w.off).map(w => w.sev + ' ' + w.code + ': ' + w.msg.slice(0, 160))
// the board's wave header
await S.openBoard(p, 1)
const bh = await S.waveHead(p, 1, gi); console.log('board head', JSON.stringify(bh))
await S.picAt(p, `#schedBoard [data-itline="1|${gi}|0"]`, 'h05-3-board-wave-header')
await S.boardOpenFold(p); const bd = await S.readBoard(p)
const h2 = await hr('h05-4-after-press')
console.log('hours', h0, h1, h2)
console.log('warn week', JSON.stringify(warnWeek))
console.log('board panel', JSON.stringify(bd.lines.map(l => l.text.slice(0, 140))))
const reportMsgs = warnWeek.filter(w => /REPORT|in-time|rally/i.test(w))
row('H-05', `Tuesday: new wave, formation ZZ, take-off 01:30, landing 02:30, ${crewCs} seated; Logic nominal report ${lead}; pressed "+ In-time / Rally" on the week`,
  `Line filled: ${JSON.stringify(weekLines.map(l => l.text))}. Beside the wave on the week: ${JSON.stringify(wk.near)}; board wave header: ${JSON.stringify(bh.asd)} and lines ${JSON.stringify(bh.lines)} / near ${JSON.stringify(bh.near)}. Tuesday warnings mentioning reporting: ${JSON.stringify(reportMsgs)}. ${crewCs}'s Work hours (week): before the wave ${h0}; crew + times, no line ${h1}; after the press ${h2}. Warnings before the press naming the wave: ${JSON.stringify(warn1)}`,
  'RECORDED', ['h05-2-week-after-press', 'h05-3-board-wave-header', 'h05-4-after-press'])
console.log('errors', errors)
S.savePart('h05', { errors, h0, h1, h2, weekLines, wk, bh, warnWeek })
await browser.close()
