/* P2-04 and P2-05 — a previous-day report across the week boundary. CASE=4 or CASE=5. Desktop. */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const CASE = process.env.CASE || '4'
const PID = CASE === '4' ? 'stiff' : 'dice'
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)
const WK1 = '13/07/2026', WK2 = '20/07/2026'
async function toWeekNo(wk) {
  await S.toWeek(p)
  const cur = await p.evaluate(() => window.CURWEEK)
  if (cur === wk) return
  const wks = await p.locator('#page-editsched [data-wk]:visible').evaluateAll(es => es.map(e => e.dataset.wk))
  if (wks.includes(wk)) { await p.locator(`#page-editsched [data-wk="${wk}"]:visible`).click() } else { await p.evaluate(w => window.loadWeek(w), wk) }
  await sleep(1000)
}
const warnsText = async di => (await S.warnsOf(p, di)).map(x => `${x.sev}:${x.code}:${x.msg}${x.key ? '' : ''}`)
async function traceBoxes(di) {
  return p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null; return [...d.querySelectorAll('[class*="trace"], [class*="rest"], .rtr, .breaks')].filter(e => e.offsetParent !== null).map(e => (e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 220)).slice(0, 6) }, di)
}
async function lw(label, id, iso, picName) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso])
  await sleep(250)
  const pc = picName ? await pic(p, picName + '-cell') : null
  const oil = await S.oilRow(p, id)
  const po = picName ? await pic(p, picName + '-oil') : null
  await S.closeOil(p)
  const cellMon = await S.lwCellOf(p, id, '2026-07-20')
  log(label, JSON.stringify({ cell: cell.text, cellMon: cellMon.text || cellMon, oil }))
  return { cell: cell.text, cellMon: cellMon.text || cellMon, oil, pics: [pc, po].filter(Boolean) }
}

// ---- Sunday of week 13 Jul: Saber on a duty row ----
const SUN_END = CASE === '4' ? '15:00' : '23:00', SUN_START = CASE === '4' ? '08:00' : '14:00'
await S.toBoard(p, 6)
await S.tap(p, '[data-dradd="6.0"]')
await S.type(p, '[data-bfld="dr:6.0.1.role"]', 'SXO')
await S.type(p, '[data-bfld="dr:6.0.1.str"]', SUN_START)
await S.type(p, '[data-bfld="dr:6.0.1.end"]', SUN_END)
const put1 = await S.put(p, '[data-fill="d:6.0.1.+"]', [PID])
log('sunday duty put', put1)
const sunPub = await S.publishNew(p, 6); await S.closeBoard(p)
log('sunday published', JSON.stringify(sunPub.head.tag))
const lwBefore = await lw('LW sunday before monday flight', PID, S.SUN, `P2-0${CASE}-a-sunday-before`)

// ---- next week ----
await toWeekNo(WK2)
const monEv = await p.evaluate(id => { try { return [window.dayEvents(0, id).length, window.dayEvents(1, id).length] } catch (e) { return String(e) } }, PID)
log('Saber events next week Mon/Tue', JSON.stringify(monEv), 'week', await p.evaluate(() => window.CURWEEK))
const di = CASE === '4' ? 0 : 1
const TO = CASE === '4' ? '00:30' : '01:00', LD = CASE === '4' ? '01:30' : '02:00', LINE = CASE === '4' ? '22:30H: IN TIME + WX/NOTAMS' : '08:00H: IN TIME + WX/NOTAMS'
const w = await S.addFlyingWave(p, di, { cs: 'VIPER', to: TO, ld: LD, p1: PID })
await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, di)
await S.addItBtn(p, di, w.wi)
const added = await S.intimes(p, di, w.wi)
await S.setItLine(p, di, w.wi, 0, LINE)
const lines = await S.itPainted(p, di, w.wi), hdr = await S.waveHeader(p, di)
const wA = await warnsText(di), trA = await traceBoxes(di)
await S.W.showDay(p, di)
const picWk = await pic(p, `P2-0${CASE}-b-next-week-day`)
await S.openList(p, '#eWeek', di)
const lst = await S.readList(p, '#eWeek', di)
const picList = await pic(p, `P2-0${CASE}-c-warning-list`)
let briefVar = null
if (CASE === '4') {
  // the scenario's own times put the suggested brief (22:10) before the entered In-time (22:30): look again with a typed brief after the In-time
  await S.toWeek(p); await S.W.showDay(p, di)
  await S.weekText(p, 'ff:' + di + '.' + w.wi + '.0.br', '23:00')
  const wV = await warnsText(di)
  await S.openList(p, '#eWeek', di); const lV = await S.readList(p, '#eWeek', di)
  const pV = await pic(p, 'P2-04-c2-with-typed-brief')
  briefVar = { wV: wV.filter(t => /CREW_REST|REPORT_ORDER/.test(t)), lines: (lV.lines || []).map(l => l.text).filter(t => /rest|order/i.test(t)), pic: pV }
}
const pubM = await S.publishNew(p, di); await S.closeBoard(p)
log('monday/tuesday published', JSON.stringify(pubM.head.tag))
log('BRIEF VARIANT', JSON.stringify(briefVar))
log('next week lines', JSON.stringify({ added, lines, hdr, wA, trA, lst: lst.lines && lst.lines.map(l => l.text), bar: lst.bar }))

// ---- Sunday -> Monday -> Sunday ----
await toWeekNo(WK1); await S.W.showDay(p, 6)
const sunWarns1 = await warnsText(6), sunTrace1 = await traceBoxes(6)
const sunSaber = await S.pucks(p, '#eWeek .day[data-day="6"]', PID)
log('SUNDAY pucks of Saber', JSON.stringify(sunSaber))
const picSun1 = await pic(p, `P2-0${CASE}-d-sunday-again`)
await S.openList(p, '#eWeek', 6); const lstSun = await S.readList(p, '#eWeek', 6)
await toWeekNo(WK2); await S.W.showDay(p, di)
const wB = await warnsText(di)
await toWeekNo(WK1); await S.W.showDay(p, 6)
const sunWarns2 = await warnsText(6)
const lwAfter = await lw('LW sunday after monday flight published', PID, S.SUN, `P2-0${CASE}-e-sunday-after`)
log('sunday list', JSON.stringify({ sunWarns1, sunWarns2, sunTrace1, lstSun: lstSun.lines && lstSun.lines.map(l => l.text), bar: lstSun.bar }))
const rest = x => x.filter(t => /CREW_REST|CREW_TIGHT|REPORT_ORDER|DAYS_RUN/.test(t))
if (CASE === '4') {
  judge('P2-04', 'Sun 19 Jul: Saber on a duty row 08:00-15:00 (published); Mon 20 Jul: flight 00:30-01:30 with the In-time line 22:30H (previous evening); published; Sunday -> Monday -> Sunday; Leave War and warnings', [
    ['the 22:30 clock is read as the previous day (rest warning on Monday names Sunday 22:30)', wA.some(t => /22:30/.test(t) && /(prev|Sunday|Sun)/i.test(t)) || wB.some(t => /22:30/.test(t)), rest(wA)],
    ['the rest message measures from the Sunday 15:00 finish (not from a 24-hour guess)', wA.some(t => /CREW_REST/.test(t) && /Sunday ended 15:00/.test(t)), rest(wA)],
    ['with a typed brief after the In-time (23:00) the rest message tells him to report at the entered 22:30', !!briefVar && briefVar.wV.some(t => /CREW_REST/.test(t) && /22:30/.test(t)), briefVar],
    ['Sunday\'s earned leave line is unchanged by the Monday flight', lwBefore.oil === lwAfter.oil && lwBefore.cell === lwAfter.cell, { before: lwBefore, after: lwAfter }],
    ['Monday carries no leave cell of its own from that flight (ordinary day)', lwAfter.cellMon === 'NO CELL DRAWN' || !/^(HO|FO)/.test(String(lwAfter.cellMon)), lwAfter.cellMon],
  ], [picWk, picList, picSun1, ...lwBefore.pics, ...lwAfter.pics])
} else {
  judge('P2-05', 'Sun 19 Jul: Reaper (Saber has a Monday sim in week 20) on a duty row 14:00-23:00 (published); next week Tue 21 Jul: flight 01:00-02:00 with the In-time line 08:00H (Monday morning); no Monday work; published', [
    ['Reaper has no Monday work in week 20', monEv[0] === 0, monEv],
    ['Tuesday carries a crew-rest breach against Sunday\'s finish (nine hours)', rest(wA).some(t => /CREW_REST/.test(t)) || lst.lines.some(l => /rest/i.test(l.text)), rest(wA)],
    ['the warning / trace names Sunday as the source, not Monday', [...wA, ...lst.lines.map(l => l.text)].some(t => /Sun/i.test(t)) && ![...wA].some(t => /Monday.*(no work|nothing)/i.test(t)), wA],
    ['Sunday\'s earned leave line is not changed by the Tuesday flight', lwBefore.oil === lwAfter.oil, { before: lwBefore.oil, after: lwAfter.oil }],
  ], [picWk, picList, picSun1, ...lwBefore.pics, ...lwAfter.pics])
}
console.log(errors)
savePart('p2d-' + CASE)
await browser.close()
