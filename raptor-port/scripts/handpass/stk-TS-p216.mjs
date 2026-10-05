/* P2-16 — long-day, rest and seven-day warnings stay distinguishable (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
// who flies the most days already?
const cand = await p.evaluate(() => {
  const days = {}
  window.DAYS.forEach((d, di) => (d.waves || []).forEach(w => (w.formations || []).forEach(f => (f.aircraft || []).forEach(a => [a.p, a.w].filter(Boolean).forEach(id => { (days[id] ||= new Set()).add(di) })))))
  return Object.entries(days).map(([id, s]) => ({ id, cs: window.PEOPLE[id]?.cs, days: [...s].sort() })).sort((a, b) => b.days.length - a.days.length).slice(0, 8)
})
console.log('candidates', JSON.stringify(cand))
const target = cand.find(c => c.days.includes(0) && c.days.includes(1)) || cand[0]
console.log('target', JSON.stringify(target))
const pid = target.id, cs = target.cs
const warnFor = async () => {
  const out = {}
  for (let di = 0; di < 7; di++) { const w = (await S.warnTexts(p, di)).filter(x => !x.off && (x.msg.includes(cs) || (x.who || []).includes(pid) || /RUN|run|7|seven|days in a row/i.test(x.code))); if (w.length) out[DAY[di]] = w.map(x => `${x.sev} ${x.code}: ${x.msg.slice(0, 140)}`) }
  return out
}
const DAY = S.DAY
const model = async () => p.evaluate(id => window.DAYS.map((d, di) => (d.waves || []).filter(w => (w.formations || []).some(f => (f.aircraft || []).some(a => a.p === id || a.w === id))).map((w, i) => w.label)), pid)
// fill in the missing days with a new wave carrying him (take-off 12:00)
const added = []
for (let di = 0; di < 7; di++) {
  if (target.days.includes(di)) continue
  await S.addFlyWave(p, di)
  const gi = (await S.readDayModel(p, di)).length - 1
  await S.boardBox(p, `ff:${di}.${gi}.0.cs`, 'ZZ'); await S.boardBox(p, `ff:${di}.${gi}.0.msn`, 'BFM'); await S.boardBox(p, `ff:${di}.${gi}.0.to`, '12:00')
  const pl = await p.evaluate(id => window.PEOPLE[id]?.role || null, pid)
  const seat = await S.crew(p, `${di}.${gi}.0.0.w`, pid)
  let ok = seat.took
  if (!ok) { const s2 = await S.crew(p, `${di}.${gi}.0.0.p`, pid); ok = s2.took }
  added.push({ di, gi, ok })
}
console.log('added', JSON.stringify(added))
const days7 = await p.evaluate(id => window.DAYS.map(d => (d.waves || []).some(w => (w.formations || []).some(f => (f.aircraft || []).some(a => a.p === id || a.w === id)))), pid)
console.log('flies each day', JSON.stringify(days7))
await S.boardOff(p)
const W1 = await warnFor(); console.log('warnings naming', cs, JSON.stringify(W1))
const hr0 = (await S.hoursMap(p, { shot: 'p216-1-seven-days-insights' })).hours[cs]
// the list of each day's warnings on the week, opened
await S.toWeek(p)
// make the long day: an early wave-wide in-time on Monday's wave that carries him; and an early one on Tuesday for the short rest
const mon = await p.evaluate(id => { const d = window.DAYS[0]; return d.waves.findIndex(w => w.formations.some(f => f.aircraft.some(a => a.p === id || a.w === id))) }, pid)
const tue = await p.evaluate(id => { const d = window.DAYS[1]; return d.waves.findIndex(w => w.formations.some(f => f.aircraft.some(a => a.p === id || a.w === id))) }, pid)
console.log('Mon wave', mon, 'Tue wave', tue)
const clear = async (di, gi) => { for (let i = 0; i < 8; i++) { const n = (await S.weekLines(p, di, gi)).length; if (!n) break; await S.typeLine(p, '#eWeek', `${di}|${gi}|0`, '') } }
async function addWeek(di, gi, text) { await W.showDay(p, di); const b = p.locator(`#eWeek .day[data-day="${di}"] [data-itadd="${di}|${gi}"]`).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500); const ls = await S.weekLines(p, di, gi); await S.typeLine(p, '#eWeek', ls[ls.length - 1].at, text) }
await W.showDay(p, 0); await clear(0, mon); await addWeek(0, mon, '03:00H: IN TIME')
await W.showDay(p, 1); await clear(1, tue); await addWeek(1, tue, '03:30H: IN TIME')
const W2 = await warnFor(); console.log('after early in-times', JSON.stringify(W2))
const hr1 = (await S.hoursMap(p, { shot: 'p216-2-long-day-insights' })).hours[cs]
await S.toWeek(p); await W.showDay(p, 0)
await S.picAt(p, `#eWeek .day[data-day="0"] [data-itline="0|${mon}|0"]`, 'p216-3-monday-long-day-week')
// open Monday's warning list and select each warning that names him
const sel = []
for (const [di, label, re] of [[0, 'Mon: Breaks Tuesday (crew rest)', /Breaks Tuesday[sS]*Static/], [0, 'Mon: Breaks Sunday (7th day)', /Breaks Sunday[sS]*Static/], [0, 'Mon: Long work day Static', /Long work day[sS]*Static/], [1, 'Tue: Crew rest (<12h) Static', /Crew rest (<12h)[sS]*Static/], [1, 'Tue: Long work day Static', /Long work day[sS]*Static/]]) {
  await S.openList(p, '#eWeek', di)
  const loc = p.locator('#eWeek .day[data-day="' + di + '"] [data-dwbox="' + di + '"] .witem').filter({ hasText: re }).first()
  if (!(await loc.count())) { sel.push({ label, found: false }); continue }
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
  await loc.locator('.wtx').first().click({ position: { x: 30, y: 8 } }).catch(async () => { await loc.click({ position: { x: 30, y: 8 } }) }); await L.sleep(600)
  const st = await p.evaluate(id => ({ ringed: [...document.querySelectorAll('.puck[data-person="' + id + '"]')].filter(e => e.offsetParent && getComputedStyle(e).outlineStyle !== 'none' && getComputedStyle(e).outlineWidth !== '0px').length, pucks: [...document.querySelectorAll('.puck[data-person="' + id + '"]')].filter(e => e.offsetParent).length, focusNote: [...document.querySelectorAll('.dwlist *')].filter(e => /lit dashed|Clear focus/.test(e.innerText || '') && e.children.length === 0).map(e => e.innerText.trim()).slice(0, 2) }), pid)
  sel.push({ label, found: true, ...st })
  await S.picAt(p, '#eWeek .day[data-day="' + di + '"] [data-dwbox="' + di + '"] .witem.focus, #eWeek .day[data-day="' + di + '"] [data-dwbox="' + di + '"] .witem:has(.wtx)', 'p216-4-clicked-' + label.replace(/[^A-Za-z0-9]+/g, '-'))
  const clr = p.locator('#eWeek [data-clearfocus], #eWeek button:has-text("Clear focus")').first(); if (await clr.count() && await clr.isVisible()) { await clr.click(); await L.sleep(300) }
}
console.log('selected', JSON.stringify(sel))
// shorten the long day without removing a worked date: Monday's early in-time later
await S.toWeek(p); await W.showDay(p, 0)
await S.typeLine(p, '#eWeek', `0|${mon}|0`, '07:00H: IN TIME')
const W3 = await warnFor(); console.log('after shortening Monday', JSON.stringify(W3))
const hr2 = (await S.hoursMap(p, { shot: 'p216-5-shortened-insights' })).hours[cs]
const days7b = await p.evaluate(id => window.DAYS.map(d => (d.waves || []).some(w => (w.formations || []).some(f => (f.aircraft || []).some(a => a.p === id || a.w === id)))), pid)
const has = (W, re) => Object.values(W).flat().some(x => re.test(x))
const longBefore = has(W2, /LONGDAY/), longAfter = has(W3, /LONGDAY/)
const runBefore = has(W2, /RUN/), runAfter = has(W3, /RUN/)
const restBefore = has(W2, /REST/), restAfter = has(W3, /REST/)
console.log('longDay', longBefore, '->', longAfter, 'run', runBefore, '->', runAfter, 'rest', restBefore, '->', restAfter, 'hours', hr0, hr1, hr2)
await S.picAt(p, `#eWeek .day[data-day="0"] [data-itline="0|${mon}|0"]`, 'p216-6-monday-shortened-week')
row('P2-16', `${cs}: given a wave on every day Mon-Sun (new waves on ${added.map(a => DAY[a.di]).join('/') || 'none'}), a 03:00H in-time on Monday's wave and 03:30H on Tuesday's (long day + short rest), each warning that names him clicked in the day's list, then Monday's in-time moved to 07:00H; Work hours read from Insights`,
  `${cs} flies on each day: ${JSON.stringify(days7)} -> after: ${JSON.stringify(days7b)}. Warnings naming him: seven days ${JSON.stringify(W1)}; after the early in-times ${JSON.stringify(W2)}; after shortening Monday ${JSON.stringify(W3)}. Work hours: ${hr0} -> ${hr1} -> ${hr2}. long-day warning ${longBefore}->${longAfter}; seven-day ${runBefore}->${runAfter}; crew-rest ${restBefore}->${restAfter}. Clicking each line: ${JSON.stringify(sel)}`,
  longBefore && !longAfter && runAfter && days7b.every(Boolean) && hr1 !== hr2 ? 'PASS' : 'PARTIAL', ['p216-3-monday-long-day-week', 'p216-5-shortened-insights', 'p216-6-monday-shortened-week'])
console.log('errors', errors)
S.savePart('p216', { errors, cs, W1, W2, W3, sel, hr0, hr1, hr2 })
await browser.close()
