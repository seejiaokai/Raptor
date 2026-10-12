// walker F cases:  node scripts/handpass/or-F-run.mjs F1 F2a ...
import * as L from './or-F-lib.mjs'
import * as A from './or-F-acts.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad/orF'
mkdirSync(SCR, { recursive: true })
const { DI } = A
const want = process.argv.slice(2)
const log = (...a) => console.log(...a)

async function world(pre, { pubDi = DI, preAfter } = {}) {
  const { ctx, page } = await L.open()
  const filed = []
  for (const s of pre) { const f = await L.fileInput(page, s); filed.push(f) }
  if (preAfter) await preAfter(page)
  const pub = await L.signAndPublish(page, pubDi)
  await L.toWeek(page)
  return { ctx, page, pub, filed }
}
const people = p => p.evaluate(() => window.INPUTS.map(r => ({ title: r.title, type: r.type, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), cx: !!r.cx, cxr: r.cxr || '' })))

async function runCase(key, body) {
  if (want.length && !want.includes(key)) return
  const rc = { key, did: [], pics: [] }
  const t0 = Date.now()
  let w
  try {
    w = await body(rc)
  } catch (e) { rc.crash = String(e.stack || e).split('\n').slice(0, 6).join(' | '); log(key, 'CRASH', rc.crash) }
  writeFileSync(`${SCR}/${key}.json`, JSON.stringify(rc, null, 1))
  log(key, 'done', Math.round((Date.now() - t0) / 1000) + 's')
  if (w) await w.close().catch(() => {})
}
/* common: the clean published state, then do, then snap + discard */
async function standard(rc, tag, w, doIt, o = {}) {
  const { page } = w
  const di = o.di ?? DI
  rc.pub = w.pub; rc.filedBefore = JSON.stringify(w.filed)
  rc.signsPublished = await A.signState(page, di); log(tag, 'signs after publish', JSON.stringify(rc.signsPublished))
  const c0 = await L.counts(page, { di }); rc.cleanCounts = L.fmt(c0); log(tag, 'clean', L.fmt(c0))
  rc.rowBefore = JSON.stringify((await A.rowOf(page, o.title || L.TITLE, di)).map(r => ({ times: r.times, pucks: r.pucks })))
  rc.did.push(...(await doIt(page, rc)))
  rc.rowAfter = JSON.stringify((await A.rowOf(page, o.title || L.TITLE, di)).map(r => ({ times: r.times, pucks: r.pucks, cls: r.cls })))
  const s = await A.snap(page, tag, di, o)
  rc.counts = s.fmt; rc.lines = s.lines; rc.pics.push(...s.pics); rc.n = s.c.n; rc.agree = s.c.agree; rc.amend = s.c.c; rc.dayText = s.c.a; rc.windowTitle = s.c.d; rc.togoHead = s.c.e
  log(tag, 'COUNTS', s.fmt, ' LINES', JSON.stringify(s.lines))
  rc.signsAfter = await A.signState(page, di); log(tag, 'signs after', JSON.stringify(rc.signsAfter))
  rc.inputs = await people(page)
  if (!o.noDiscard) { rc.discard = await A.discardProbe(page, tag, di, o.title || L.TITLE); log(tag, 'DISCARD', JSON.stringify(rc.discard)) }
  return s
}

/* ---------------- F1 ---------------- */
await runCase('F1', async rc => {
  const w = await world([]); const { page } = w
  await standard(rc, 'f1', w, async (p, rc) => {
    const f = await L.fileInput(p, A.meetingSpec(['Drifter', 'Hunter', 'Ranger']))
    rc.filed = f
    return ['filed a Meeting "Range safety brief" for Drifter, Hunter, Ranger on Wed 15 Jul 14:00-15:00 through + Input / Several people after Wed was published']
  })
  return w.ctx
})
/* ---------------- F2 ---------------- */
const base3 = () => world([A.meetingSpec(['Drifter', 'Hunter', 'Ranger'])])
await runCase('F2a', async rc => {
  const w = await base3()
  await standard(rc, 'f2a', w, async (p, rc) => { const r = await A.addFromCrew(p, 'Tally', L.TITLE); rc.act = r; return ['dragged Tally from the crew list onto the row\'s + add: ' + JSON.stringify(r)] })
  return w.ctx
})
await runCase('F2b', async rc => {
  const w = await base3()
  await standard(rc, 'f2b', w, async (p, rc) => { const r1 = await A.addFromCrew(p, 'Tally', L.TITLE); const r2 = await A.addFromCrew(p, 'Anvil', L.TITLE); rc.act = [r1, r2]; return ['dragged Tally then Anvil from the crew list onto + add: ' + JSON.stringify([r1, r2])] })
  return w.ctx
})
await runCase('F2c', async rc => {
  const w = await base3()
  await standard(rc, 'f2c', w, async (p, rc) => { const r1 = await A.retime(p, L.TITLE, '14:30'); const r2 = await A.addFromCrew(p, 'Tally', L.TITLE); rc.act = [r1, r2]; return ['typed 14:30 over the row start; dragged Tally onto + add: ' + JSON.stringify([r1, r2])] })
  return w.ctx
})
await runCase('F2d', async rc => {
  const w = await base3()
  await standard(rc, 'f2d', w, async (p, rc) => { const r = await A.takeOutRight(p, 'Drifter', L.TITLE); rc.act = r; return ['right-clicked Drifter (first A to Z) puck on the row: ' + JSON.stringify(r)] })
  return w.ctx
})
await runCase('F2e', async rc => {
  const w = await world([A.meetingSpec(['Ranger', 'Hunter', 'Drifter'])])
  rc.joinOrder = 'picked in the window in the order Ranger, Hunter, Drifter (INPUTS list order is read below)'
  await standard(rc, 'f2e', w, async (p, rc) => { const r = await A.takeOutRight(p, 'Ranger', L.TITLE); rc.act = r; return ['right-clicked Ranger (first to join, last A to Z) puck: ' + JSON.stringify(r)] })
  return w.ctx
})
await runCase('F2f', async rc => {
  const w = await base3()
  await standard(rc, 'f2f', w, async (p, rc) => { const r = await A.boardX(p, L.TITLE); rc.act = r; return ['on the Scheduler Board pressed the row\'s X (take off the programme): ' + JSON.stringify(r)] })
  return w.ctx
})
await runCase('F2g', async rc => {
  const w = await base3()
  await standard(rc, 'f2g', w, async (p, rc) => { const r = await A.boardCx(p, L.TITLE, 'WX'); rc.act = r; return ['on the Scheduler Board pressed CX on the row, reason WX: ' + JSON.stringify(r)] })
  return w.ctx
})
await runCase('F2h', async rc => {
  const w = await base3()
  await standard(rc, 'f2h', w, async (p, rc) => { const r1 = await A.boardCx(p, L.TITLE, 'WX'); const r2 = await A.boardCx(p, L.TITLE, 'UN'); rc.act = [r1, r2]; return ['board CX with reason WX, then CX pressed again (un-cancel): ' + JSON.stringify([r1, r2])] })
  return w.ctx
})
/* ---------------- F3 ---------------- */
await runCase('F3', async rc => {
  const w = await world([A.trainingSpec('Ranger')])
  await standard(rc, 'f3', w, async (p, rc) => { const r = await A.addFromCrew(p, 'Tally', 'Ranger training', DI, 'Ranger'); rc.act = r; return ['dragged Tally from the crew list ONTO Ranger\'s lone puck: ' + JSON.stringify(r)] }, { title: 'Ranger training' })
  return w.ctx
})
/* ---------------- F5 ---------------- */
await runCase('F5', async rc => {
  const w = await base3()
  await standard(rc, 'f5', w, async (p, rc) => { const r = await A.dropPlaceholder(p, 'allavail', L.TITLE); rc.act = r; return ['dragged ALL AVAIL from the crew list onto the row: ' + JSON.stringify(r)] })
  return w.ctx
})
/* ---------------- F4 ---------------- */
await runCase('F4', async rc => {
  const spec = { type: 'Duty', people: ['Ranger'], ph: 'allavail', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range duty', oil: 'yes' }
  const w = await world([spec], { pubDi: 5 })
  await standard(rc, 'f4', w, async (p, rc) => { const r = await A.addFromCrew(p, 'Tally', 'Range duty', 5); rc.act = r; return ['dragged Tally from the crew list onto the Duty row\'s + add: ' + JSON.stringify(r)] }, { di: 5, title: 'Range duty' })
  return w.ctx
})
/* ---------------- F6 ---------------- */
const two = () => world([{ type: 'Training', people: ['Ranger', 'Tally'], from: A.ISO, to: A.ISO, timed: ['14:00', '15:00'], title: 'Training for two', oil: 'yes' }, A.meetingSpec(['Drifter', 'Hunter'])])
await runCase('F6a', async rc => {
  const w = await two()
  await standard(rc, 'f6a', w, async (p, rc) => {
    const r = await A.movePuck(p, 'Ranger', 'Training for two', L.TITLE); rc.act = r
    rc.rowsAfter = JSON.stringify([...(await A.rowOf(p, 'Training for two')), ...(await A.rowOf(p, L.TITLE))].map(r => ({ name: r.name, pucks: r.pucks })))
    return ['dragged Ranger\'s puck from the Training row onto the Meeting row\'s + add: ' + JSON.stringify(r)]
  })
  return w.ctx
})
await runCase('F6b', async rc => {
  const w = await two()
  await standard(rc, 'f6b', w, async (p, rc) => {
    const r1 = await A.takeOutRight(p, 'Ranger', 'Training for two'); const r2 = await A.addFromCrew(p, 'Anvil', L.TITLE); rc.act = [r1, r2]
    rc.rowsAfter = JSON.stringify([...(await A.rowOf(p, 'Training for two')), ...(await A.rowOf(p, L.TITLE))].map(r => ({ name: r.name, pucks: r.pucks })))
    return ['right-clicked Ranger off the Training row; dragged Anvil from the crew list onto the Meeting\'s + add: ' + JSON.stringify([r1, r2])]
  })
  return w.ctx
})
/* ---------------- F9 ---------------- */
await runCase('F9', async rc => {
  const w = await base3()
  await standard(rc, 'f9', w, async (p, rc) => {
    const r1 = await A.addFromCrew(p, 'Tally', L.TITLE)
    const c1 = await L.counts(p, { di: DI }); rc.afterAdd = L.fmt(c1); rc.afterAddLines = c1.lines
    const r2 = await A.takeOutRight(p, 'Tally', L.TITLE); rc.act = [r1, r2]
    return ['dragged Tally onto + add (pending then read: ' + L.fmt(c1) + '); then right-clicked Tally off the row: ' + JSON.stringify([r1, r2])]
  })
  return w.ctx
})
await L.browser.close(); log('ERRS', JSON.stringify(L.errs)); writeFileSync(`${SCR}/errs-${want.join('_') || 'all'}.json`, JSON.stringify(L.errs))
