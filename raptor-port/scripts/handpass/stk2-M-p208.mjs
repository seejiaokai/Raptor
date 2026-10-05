/* P2-08 only (Walker M re-walk). */
import * as S from './stk2-M-alib.mjs'
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
const ok208 = r => /^09:00/.test((r.first || [])[0] || '') && /^10:00/.test((r.second || [])[1] || '')
try {
  const rw = await p208('week', 3)
  const rb = await p208('board', 2)
  log('P2-08', JSON.stringify([rw, rb]))
  row('P2-08', 'a wave with take-offs 12:00 and 13:00 (Logic "nominal report before T/O" 3h): pressed "+ In-time / Rally"; edited the line to 08:00H; set Logic nominal report to 2h; pressed again — once on the Edit Schedule week (Thu), once on the Scheduler Board (Wed)',
    [rw, rb].map(r => `${r.surface}: Logic nominal report ${r.logicA / 60}h at first press -> first press filled ${JSON.stringify(r.first)}; line edited to ${JSON.stringify(r.edited)}; Logic then ${r.logicB / 60}h (box showed "${r.set}") -> second press, lines now ${JSON.stringify(r.second)}`).join('  ||  '),
    (ok208(rw) && ok208(rb) ? 'PASS' : 'FAIL'), [...rw.pics, ...rb.pics])
} catch (e) { row('P2-08', 'script', String(e && e.stack || e).slice(0, 600), 'NOT WALKED (script error)', []) }

console.log(errors)
savePart('p208')
await browser.close()
