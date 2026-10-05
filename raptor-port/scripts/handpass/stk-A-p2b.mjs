/* P2-02 and P2-03 — an entered In-time / Rally crossing the six-hour boundary: RECORDED, every figure, at every step */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)

async function snap(label, { id, cs, di, gi, iso, picName }) {
  await S.toWeek(p); await S.W.showDay(p, di)
  const lines = await S.itPainted(p, di, gi)
  const head = await S.dayHead(p, di), pend = await S.pendingKeys(p, di)
  const panel = (await S.alPanel(p) || {}).text
  const fb = await S.feedback(p, di, gi)
  const picWk = picName ? await pic(p, picName + '-week') : null
  const ins = await S.insightsOf(p, picName ? picName + '-insights' : null)
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso])
  await sleep(300)
  const picCell = picName ? await pic(p, picName + '-cell') : null
  const oil = await S.oilRow(p, id)
  const picOil = picName ? await pic(p, picName + '-oil') : null
  await S.closeOil(p)
  const o = { label, lines, work: ins.hours[cs], days: (ins.days || {})[cs], sorties: ins.flyers[cs], cell: cell.text, oil, pend: pend.length, headPending: head && head.pending, panel, fb, pics: [picWk, ins.pic, picCell, picOil].filter(Boolean) }
  log('SNAP', JSON.stringify(o))
  return o
}
async function declarePH(iso) {
  await L.go(p, 'leavewar'); await sleep(900)
  const m = p.locator('[data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
  const c = p.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await c.count())) return { done: false, why: 'no event cell' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  await c.click(); await sleep(500)
  const t = p.locator('[data-testid="event-text"]'); if (!(await t.count())) return { done: false, why: 'event sheet did not open' }
  await t.fill('PH'); await sleep(150)
  await p.locator('[data-testid="event-apply"]').click(); await sleep(700)
  const cell = await p.evaluate(d => ((document.querySelector(`[data-testid="event-0-${d}"]`) || {}).innerText || '').trim(), iso)
  return { done: true, cell }
}

/* ===== P2-02: Saturday, Saber 12:00-13:00, In-time 09:00 ===== */
await S.addFlyingWave(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'stiff' })
await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, 5)
await S.addItBtn(p, 5, 0)
log('after add button', JSON.stringify(await S.intimes(p, 5, 0)))
await S.setItLine(p, 5, 0, 0, '09:00H: IN TIME + WX/NOTAMS')
log('lines now', JSON.stringify(await S.intimes(p, 5, 0)))
const pub2 = await S.publishNew(p, 5); await S.closeBoard(p)
const a1 = await snap('P2-02 before the edit (published, In-time 09:00)', { id: 'stiff', cs: 'Saber', di: 5, gi: 0, iso: S.SAT, picName: 'P2-02-a-before' })
await S.toWeek(p); await S.W.showDay(p, 5)
await S.setItLine(p, 5, 0, 0, '08:59H: IN TIME + WX/NOTAMS')
const a2 = await snap('P2-02 after the edit, before the amendment (In-time 08:59)', { id: 'stiff', cs: 'Saber', di: 5, gi: 0, iso: S.SAT, picName: 'P2-02-b-edited' })
const am2 = await S.publishAm(p, 5); await S.closeBoard(p)
const a3 = await snap('P2-02 after the amendment (AL1)', { id: 'stiff', cs: 'Saber', di: 5, gi: 0, iso: S.SAT, picName: 'P2-02-c-amended' })
row('P2-02', 'Sat 18 Jul: Saber one flight 12:00-13:00 (lead 3h, debrief 2h), In-time 09:00H, published; changed only the In-time to 08:59H; then Publish AL1',
  [a1, a2, a3].map(a => `${a.label}: line ${JSON.stringify(a.lines)}; Insights Work hours Saber ${a.work} (${a.days || ''}); Leave War cell ${a.cell}; OIL line "${a.oil}"; pending marks ${a.pend}; head ${a.headPending}`).join('  ||  '),
  'RECORDED', [...a1.pics, ...a2.pics, ...a3.pics])

/* ===== P2-03: Tuesday public holiday, Rally only 08:59 -> 09:00 ===== */
const ph = await declarePH('2026-07-14')
log('PH', JSON.stringify(ph))
await L.go(p, 'editsched'); await sleep(400)
await S.addFlyingWave(p, 1, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'pump' })
const wiT = await p.evaluate(() => window.DAYS[1].waves.length - 1)
await S.closeBoard(p); await S.toWeek(p); await S.W.showDay(p, 1)
await S.addItBtn(p, 1, wiT)
const itsT = await S.intimes(p, 1, wiT)
log('Tue wave', wiT, JSON.stringify(itsT))
// the wave carries only a Rally line, 08:59: set every line of the new wave (ordinary wave: the + button adds one line)
await S.setItLine(p, 1, wiT, 0, '08:59H: RALLY')
const lastLines = await S.intimes(p, 1, wiT)
const pubT = await S.publishNew(p, 1); await S.closeBoard(p)
const b1 = await snap('P2-03 before the edit (published, Rally 08:59)', { id: 'pump', cs: 'Piston', di: 1, gi: wiT, iso: S.TUE, picName: 'P2-03-a-before' })
await S.toWeek(p); await S.W.showDay(p, 1)
await S.setItLine(p, 1, wiT, 0, '09:00H: RALLY')
const b2 = await snap('P2-03 after the edit, before the amendment (Rally 09:00)', { id: 'pump', cs: 'Piston', di: 1, gi: wiT, iso: S.TUE, picName: 'P2-03-b-edited' })
const amT = await S.publishAm(p, 1); await S.closeBoard(p)
const b3 = await snap('P2-03 after the amendment (AL1)', { id: 'pump', cs: 'Piston', di: 1, gi: wiT, iso: S.TUE, picName: 'P2-03-c-amended' })
row('P2-03', 'Tue 14 Jul declared PH on the Leave War event row ' + JSON.stringify(ph) + '; new wave 12:00-13:00 with Piston, wave carries only a Rally line 08:59H; published; changed Rally to 09:00H; Publish AL1',
  [b1, b2, b3].map(a => `${a.label}: line ${JSON.stringify(a.lines)}; Insights Work hours Piston ${a.work} (${a.days || ''}); Leave War cell ${a.cell}; OIL line "${a.oil}"; pending marks ${a.pend}`).join('  ||  '),
  'RECORDED', [...b1.pics, ...b2.pics, ...b3.pics])
console.log(errors)
savePart('p2b')
await browser.close()
