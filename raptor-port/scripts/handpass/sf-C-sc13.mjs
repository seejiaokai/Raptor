import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors, chipLine, warnLines } = L
const S = '13'
const b = await launch()
const { p } = await ctxOpen(b, {})
async function insights(tag) {
  await closeBoard(p); await go(p, 'editsched')
  await p.locator('#insightBtn').click(); await sleep(1200)
  const sa = p.locator('#insightModal [data-insights-all]'); if (await sa.count()) { await sa.first().click().catch(() => {}); await sleep(500) }
  const t = await p.evaluate(() => { const m = document.querySelector('#insightModal'); return m ? m.innerText.replace(/\s+/g, ' ') : '' })
  if (tag) await shot(p, tag)
  await p.locator('#insightClose').click().catch(() => {}); await sleep(400)
  const num = re => { const m = t.match(re); return m ? +m[1] : null }
  const sec = (a, z) => { const i = t.indexOf(a); const j = t.indexOf(z, i + 1); return i < 0 ? '' : t.slice(i, j < 0 ? undefined : j) }
  const secS = sec('SORTIES THIS WEEK', 'WORK HOURS'), secH = sec('REPORT TO DEBRIEF', 'NOT ON THE FLYING')
  const per = n => ({ sorties: (m => m ? +m[1] : null)(secS.match(new RegExp('(?:^| )' + n + ' (\\d+)(?= |$)'))), hours: ((secH.match(new RegExp('(?:^| )' + n + ' (\\d+h\\d*)(?= |$)')) || [])[1] || null) })
  const line = d => (t.match(new RegExp(`${d} (\\d+) sorties · (\\d+) formations · ([^A-Z]*?)(?= (?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|$)`)) || []).slice(1, 4).join('|')
  return { sorties: num(/(\d+) SORTIES/), forms: num(/(\d+) FORMATIONS/), aircrew: num(/(\d+) AIRCREW FLYING/), ace: per('Cinch'), drifter: per('Cobra'), saber: per('Comet'), ranger: per('Anvil'), warden: per('Diesel'), fri: line('Friday'), sat: line('Saturday'), blue: (t.match(/(blue|red)[^A-Z]{0,40}/gi) || []).slice(0, 4), raw: t.length }
}
await go(p, 'editsched')
await p.evaluate(() => { window.addWave(5, 'sc'); window.addWave(4, 'avalon') }); await sleep(500)
await openBoard(p, 5)
for (const [ai, pid] of [[0, 'snap'], [1, 'taipan'], [2, 'beams'], [3, 'shaft']]) await bPut(p, 5, 0, 0, ai, 'p', [pid])
await openBoard(p, 4)
for (const [ai, pid] of [[0, 'fantom'], [1, 'chaps'], [2, 'dice'], [3, 'prowler']]) await bPut(p, 4, 0, 0, ai, 'p', [pid])
const i0 = await insights('13-0-baseline')
rec(S, 'baseline (SC AM seated, AVALON on Fri seated, nothing flies)', 'RECORD', i0, 'RECORD', 'C-13-0-baseline.png')
await openBoard(p, 5); await bType(p, bf(5, 0, 0, 'rl'), '06:30')
const i1 = await insights('13-1-sc-r')
const d1 = { sorties: i1.sorties - i0.sorties, forms: i1.forms - i0.forms, aircrew: i1.aircrew - i0.aircrew }
rec(S, 'type SC AM R 06:30 on Sat (4 rows seated)', 'sorties +4, formations +1; each of the four spares / mains: own sorties +1; work hours rise; Saturday line reads 4 sorties 1 formation', { i1, d1 }, d1.sorties === 4 && d1.forms === 1 ? 'PASS' : 'FAIL', 'C-13-1-sc-r.png')
rec(S, "the SPARES' own counts", 'the four men (Cinch, Cobra on the MAIN rows; Comet, Anvil on the SPARE rows): own sorties +1, work hours up, aircrew flying +4', { drifter: [i0.drifter, i1.drifter], ace: [i0.ace, i1.ace], saber: [i0.saber, i1.saber], ranger: [i0.ranger, i1.ranger] }, i1.drifter.sorties === (i0.drifter.sorties || 0) + 1 && i1.ace.sorties === (i0.ace.sorties || 0) + 1 && i1.aircrew === i0.aircrew + 4 ? 'PASS' : 'FAIL', 'C-13-1-sc-r.png')
await openBoard(p, 4)
await p.locator('#schedBoard [data-safly="4.0.0.2"]:visible').first().click(); await sleep(700)
const chF = await chipLine(p)
const i2 = await insights('13-2-hand-tick')
const d2 = { sorties: i2.sorties - i1.sorties, forms: i2.forms - i1.forms, aircrew: i2.aircrew - i1.aircrew }
rec(S, 'hand-tick Warden (AVALON SPARE, Fri)', 'sorties +1, formations +1, Warden own sortie +1, Friday line 1 sortie 1 formation', { chF, i2, d2, warden: [i1.warden, i2.warden] }, d2.sorties === 1 && d2.forms === 1 ? 'PASS' : 'FAIL', 'C-13-2-hand-tick.png')
rec(S, 'blue / red mix', 'a standby sortie joins no blue / red mission count', { blueRed: i2.blue }, 'RECORD', 'C-13-2-hand-tick.png')
await openBoard(p, 4)
await p.locator('#schedBoard [data-safly="4.0.0.2"]:visible').first().click(); await sleep(700)
await openBoard(p, 5); await bType(p, bf(5, 0, 0, 'rl'), '')
const i3 = await insights('13-3-back')
rec(S, 'untick and clear R', 'back to the baseline figures', { i3, i0 }, i3.sorties === i0.sorties && i3.forms === i0.forms && i3.aircrew === i0.aircrew ? 'PASS' : 'FAIL', 'C-13-3-back.png')
// day insights from the board
await openBoard(p, 5); await bType(p, bf(5, 0, 0, 'rl'), '06:30')
await p.locator('#schedBoard').getByRole('button', { name: 'Insights' }).first().click(); await sleep(1200)
const dayI = await p.evaluate(() => { const m = [...document.querySelectorAll('#insightModal, .insightwin, [class*=insight]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 1500)); return m[0] || 'none' })
await shot(p, '13-4-board-insights')
rec(S, "the board's own Insights button with SC AM R typed", 'RECORD (does it show the day, with blue/red lines?)', dayI.slice(0, 900), 'RECORD', 'C-13-4-board-insights.png')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
