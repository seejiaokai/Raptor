/* P2-06, P2-07, P2-08 — reporting lines: separate overrides, duplicate lines, the Add button. One world, desktop. */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)
const mins = s => { const m = /^(?:(\d+)h)?(\d+)?m?$/.exec(String(s || '').replace(/\s/g, '')); if (!m) return null; return (+(m[1] || 0)) * 60 + (+(m[2] || 0)) }
const fmt = m => (m == null ? '?' : (m < 0 ? '-' : '') + Math.floor(Math.abs(m) / 60) + 'h' + String(Math.abs(m) % 60).padStart(2, '0'))
async function hoursOf(names, picName) {
  await S.toWeek(p)
  const ins = await S.insightsOf(p, picName)
  return { h: Object.fromEntries(names.map(n => [n, ins.hours[n]])), m: Object.fromEntries(names.map(n => [n, mins(ins.hours[n])])), pic: ins.pic }
}
const delta = (a, b) => Object.fromEntries(Object.keys(a.m).map(k => [k, (a.m[k] == null || b.m[k] == null) ? null : b.m[k] - a.m[k]]))
async function addSecondFormation(di, wi, { cs, to, ld, p1, w1 }) {
  await S.toBoard(p, di)
  await tapLine(di, wi)
  await S.type(p, `[data-bfld="ff:${di}.${wi}.1.cs"]`, cs)
  await S.type(p, `[data-bfld="ff:${di}.${wi}.1.to"]`, to)
  await S.type(p, `[data-bfld="ff:${di}.${wi}.1.ld"]`, ld)
  const got = []
  if (p1) got.push(await S.put(p, `[data-slot="${di}.${wi}.1.0.p"]`, [p1]))
  if (w1) got.push(await S.put(p, `[data-slot="${di}.${wi}.1.0.w"]`, [w1]))
  return got
}
async function tapLine(di, wi) { await S.tap(p, `[data-gline="${di}.${wi}"]`) }
async function setWho(di, wi, fi, p1, w1) {
  const g = []
  if (p1) g.push(await S.put(p, `[data-slot="${di}.${wi}.${fi}.0.p"]`, [p1]))
  if (w1) g.push(await S.put(p, `[data-slot="${di}.${wi}.${fi}.0.w"]`, [w1]))
  return g
}
const evStart = (di, id) => p.evaluate(([d, i]) => { try { return window.dayEvents(d, i).map(e => ({ k: e.k || e.kind, s: e.s ?? e.start, e: e.e ?? e.end, report: e.report ?? e.intime })).slice(0, 4) } catch (e) { return String(e) } }, [di, id])

/* ======================= P2-06 ======================= */
try {
  const di = 4
  const w = await S.addFlyingWave(p, di, { cs: 'VL', to: '12:00', ld: '13:00', p1: 'bane', w1: 'freak' })
  const got2 = await addSecondFormation(di, w.wi, { cs: 'RU', to: '12:00', ld: '13:00', p1: 'slash', w1: 'beams' })
  log('P2-06 crew', JSON.stringify(w.got), JSON.stringify(got2))
  await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, di)
  const names = ['Ranger', 'Echo', 'Blade', 'Comet']
  const s0 = await hoursOf(names, 'P2-06-a-no-lines')
  // general In-time 08:00
  await S.addItBtn(p, di, w.wi)
  await S.setItLine(p, di, w.wi, 0, '08:00H: IN TIME')
  const l1 = await S.itPainted(p, di, w.wi)
  const s1 = await hoursOf(names, 'P2-06-b-general-intime')
  // VL Rally 08:30
  await S.addItBtn(p, di, w.wi)
  const itsAfterAdd = await S.intimes(p, di, w.wi)
  await S.setItLine(p, di, w.wi, 1, '08:30H: VL RALLY')
  const l2 = await S.itPainted(p, di, w.wi)
  const s2 = await hoursOf(names, 'P2-06-c-vl-rally')
  // VL In-time 09:00
  await S.addItBtn(p, di, w.wi)
  await S.setItLine(p, di, w.wi, 2, '09:00H: VL IN TIME')
  const l3 = await S.itPainted(p, di, w.wi)
  await S.W.showDay(p, di)
  const picWeek = await pic(p, 'P2-06-d-week-lines')
  const s3 = await hoursOf(names, 'P2-06-d-vl-intime')
  const d01 = delta(s0, s1), d12 = delta(s1, s2), d23 = delta(s2, s3)
  log('P2-06', JSON.stringify({ s0: s0.h, s1: s1.h, s2: s2.h, s3: s3.h, d01, d12, d23, l1, l2, l3, itsAfterAdd }))
  // events (read only) as a second witness
  const ev = { ranger: await evStart(di, 'bane'), blade: await evStart(di, 'slash') }
  log('events', JSON.stringify(ev))
  judge('P2-06', 'Fri: new wave VL + RU both 12:00-13:00; general In-time 08:00; added VL Rally 08:30; then VL In-time 09:00 (Insights Work hours deltas per crew, VL = Ranger/Echo, RU = Blade/Comet)', [
    ['general In-time 08:00 moves BOTH crews equally', d01.Ranger === d01.Blade && d01.Echo === d01.Comet && d01.Ranger != null, { d01 }],
    ['VL Rally 08:30 beside the general 08:00 does not move anyone (both still report 08:00)', Object.values(d12).every(x => x === 0), { d12 }],
    ['VL In-time 09:00 then moves ONLY VL: VL starts 08:30 (30 min later than 08:00), RU stays 08:00', d23.Ranger === -30 && d23.Echo === -30 && d23.Blade === 0 && d23.Comet === 0, { d23 }],
  ], [s0.pic, s1.pic, s2.pic, s3.pic, picWeek])
  log('P2-06 figures', fmt(s1.m.Ranger), fmt(s2.m.Ranger), fmt(s3.m.Ranger), fmt(s3.m.Blade))
} catch (e) { row('P2-06', 'script', String(e && e.stack || e).slice(0, 600), 'NOT WALKED (script error)', []) }

/* ======================= P2-07 ======================= */
try {
  const di = 1
  const w = await S.addFlyingWave(p, di, { cs: 'VIPER', to: '01:00', ld: '02:00', p1: 'pump' })
  await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, di)
  const t0 = await hoursOf(['Piston'], 'P2-07-a-no-lines')
  await S.addItBtn(p, di, w.wi)
  await S.setItLine(p, di, w.wi, 0, '23:00H: IN TIME')
  await S.addItBtn(p, di, w.wi)
  await S.setItLine(p, di, w.wi, 1, '00:15H: IN TIME')
  const lA = await S.itPainted(p, di, w.wi), itA = await S.intimes(p, di, w.wi)
  await S.W.showDay(p, di)
  const picA = await pic(p, 'P2-07-b-lines-23-0015')
  const t1 = await hoursOf(['Piston'], 'P2-07-b-hours')
  const warnsA = (await S.warnsOf(p, di)).map(x => x.sev + ':' + x.code + ':' + x.msg)
  // reverse the order by editing the two lines
  await S.toWeek(p); await S.W.showDay(p, di)
  await S.setItLine(p, di, w.wi, 0, '00:15H: IN TIME')
  await S.setItLine(p, di, w.wi, 1, '23:00H: IN TIME')
  const lB = await S.itPainted(p, di, w.wi), itB = await S.intimes(p, di, w.wi)
  await S.W.showDay(p, di)
  const picB = await pic(p, 'P2-07-c-lines-reversed')
  const t2 = await hoursOf(['Piston'], 'P2-07-c-hours')
  const warnsB = (await S.warnsOf(p, di)).map(x => x.sev + ':' + x.code + ':' + x.msg)
  log('P2-07', JSON.stringify({ t0: t0.h, t1: t1.h, t2: t2.h, lA, lB, itA, itB, warnsA, warnsB }))
  judge('P2-07', 'Tue: new wave VIPER 01:00-02:00 (Piston); In-time lines 23:00 and 00:15; then reversed their order by editing the two lines', [
    ['the work span changed from the no-line figure by the lines (the 23:00 previous-day report starts the day)', t1.m.Piston !== t0.m.Piston, { t0: t0.h, t1: t1.h }],
    ['reversing the lines leaves Piston\'s work hours unchanged', t1.m.Piston === t2.m.Piston, { t1: t1.h, t2: t2.h }],
    ['the in-time warning names the 23:00 previous-day clock as the operative one in both orders', warnsA.some(x => /in-time 23:00 \(previous day\)/.test(x)) && warnsB.some(x => /in-time 23:00 \(previous day\)/.test(x)), { warnsA: warnsA[0], warnsB: warnsB[0] }],
  ], [t0.pic, picA, t1.pic, picB, t2.pic])
} catch (e) { row('P2-07', 'script', String(e && e.stack || e).slice(0, 600), 'NOT WALKED (script error)', []) }

/* ======================= P2-08 (RECORDED) ======================= */
async function p208(surface, di) {
  const lead0 = (await S.logicGet(p)).reportLead
  // wave with two take-offs 12:00 and 13:00
  const w = await S.addFlyingWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00' })
  await addSecondFormation(di, w.wi, { cs: 'COBRA', to: '13:00', ld: '14:00' })
  if (surface === 'week') { await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, di) } else { await S.toBoard(p, di) }
  const logicA = (await S.logicGet(p)).reportLead
  await (surface === 'week' ? Promise.resolve() : Promise.resolve())
  await S.addItBtn(p, di, w.wi)
  const first = await S.intimes(p, di, w.wi), firstPainted = await S.itPainted(p, di, w.wi)
  const picA = await pic(p, `P2-08-${surface}-a-first-press`)
  await S.setItLine(p, di, w.wi, 0, '08:00H: IN TIME + WX/NOTAMS')
  const edited = await S.intimes(p, di, w.wi)
  if (surface === 'board') await S.closeBoard(p)
  const set = await S.logicSet(p, 'reportLead', '2h')
  const logicB = (await S.logicGet(p)).reportLead
  await L.go(p, 'editsched'); await sleep(400)
  if (surface === 'week') { await S.toWeek(p); await S.W.showDay(p, di) } else { await S.toBoard(p, di) }
  await S.addItBtn(p, di, w.wi)
  const second = await S.intimes(p, di, w.wi), secondPainted = await S.itPainted(p, di, w.wi)
  const picB = await pic(p, `P2-08-${surface}-b-second-press`)
  if (surface === 'board') await S.closeBoard(p)
  await S.logicSet(p, 'reportLead', '3h')   // put the setting back for the next surface
  await L.go(p, 'editsched'); await sleep(300)
  return { surface, lead0, logicA, first, firstPainted, edited, logicB, set, second, secondPainted, pics: [picA, picB] }
}
try {
  const rw = await p208('week', 3)
  const rb = await p208('board', 2)
  log('P2-08', JSON.stringify([rw, rb]))
  row('P2-08', 'a wave with take-offs 12:00 and 13:00 (Logic "nominal report before T/O" 3h): pressed "+ In-time / Rally"; edited the line to 08:00H; set Logic nominal report to 2h; pressed again — once on the Edit Schedule week (Thu), once on the Scheduler Board (Wed)',
    [rw, rb].map(r => `${r.surface}: Logic nominal report ${r.logicA / 60}h at first press -> first press filled ${JSON.stringify(r.first)}; line edited to ${JSON.stringify(r.edited)}; Logic then ${r.logicB / 60}h (box showed "${r.set}") -> second press, lines now ${JSON.stringify(r.second)}`).join('  ||  '),
    'RECORDED', [...rw.pics, ...rb.pics])
} catch (e) { row('P2-08', 'script', String(e && e.stack || e).slice(0, 600), 'NOT WALKED (script error)', []) }

console.log(errors)
savePart('p2c')
await browser.close()
