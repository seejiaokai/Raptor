import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTap, seatTitle, closeWin, pubDay, credits, reanswer, row, savePart } from './aa-B-lib.mjs'
const P = 'dice', W = 'glass', M = 'shaft'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const sum = s => s ? `on=${s.on}/${s.total} P=${s.seats[P]} M=${s.seats[M]} W=${s.seats[W]} tabs=${s.tabs.join(' | ')}` : 'no window'

async function toWin(w, iid) {
  await openBoard(w.page, 5); await oilOn(w.page, true)
  await openCount(w.page, iid); await tabTo(w.page, 'earn')
  return winState(w.page)
}
async function variant(name, ans, order) {
  const w = await world('desk'); w.tag = 's7' + name
  const { page } = w
  say(`--- world ${name}: filer answers ${ans}, order ${order}`)
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S7' + name, s: '09:00', e: '12:00', oil: ans })
  const iid = f.rec.iid; say('filed', JSON.stringify(f.rec))
  await openBoard(page, 5)
  say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
  const c0 = await credits(page, [P, M, W]); say('credits after ORIG', JSON.stringify(c0))
  const res = { name, ans, order, c0 }
  let s = await toWin(w, iid); say('window base:', sum(s)); res.base = s && { on: s.on, total: s.total, P: s.seats[P] }
  await pic(w, 'base')
  if (order === 'switch-first') {
    await seatTap(page, P); s = await winState(page); say('tap1:', sum(s)); res.tap1 = s.seats[P]; await pic(w, 'tap1')
    await seatTap(page, P); s = await winState(page); say('tap2:', sum(s)); res.tap2 = s.seats[P]; await pic(w, 'tap2')
    await seatTap(page, P); s = await winState(page); say('tap3 (explicit set):', sum(s)); res.tap3 = s.seats[P]
    await closeWin(page)
    const next = ans === 'yes' ? 'no' : 'yes'
    await reanswer(page, iid, next); say('filer answered', next)
    s = await toWin(w, iid); say('after answer', next, ':', sum(s)); res.afterA = { on: s.on, P: s.seats[P], M: s.seats[M] }; await pic(w, 'afterA')
    const again = ans
    await closeWin(page)
    await reanswer(page, iid, again); say('filer answered', again)
    s = await toWin(w, iid); say('after answer', again, ':', sum(s)); res.afterB = { on: s.on, P: s.seats[P], M: s.seats[M] }; await pic(w, 'afterB')
    if (ans === 'no') { /* end on the No answer with P granted: answer No again then publish */ }
  } else {
    const next = ans === 'yes' ? 'no' : 'yes'
    await reanswer(page, iid, next); say('filer answered', next)
    s = await toWin(w, iid); say('after answer', next, ':', sum(s)); res.afterA = { on: s.on, P: s.seats[P], M: s.seats[M] }; await pic(w, 'afterA')
    await seatTap(page, P); s = await winState(page); say('tap1:', sum(s)); res.tap1 = s.seats[P]; await pic(w, 'tap1')
    await seatTap(page, P); s = await winState(page); say('tap2:', sum(s)); res.tap2 = s.seats[P]
    await seatTap(page, P); s = await winState(page); say('tap3:', sum(s)); res.tap3 = s.seats[P]
  }
  await closeWin(page)
  s = await winState(page)
  await openBoard(page, 5)
  say('publish AL', JSON.stringify(await pubDay(page, 5)))
  const c1 = await credits(page, [P, M, W]); say('credits after AL', JSON.stringify(c1)); res.c1 = c1
  await pic(w, 'lw')
  res.errors = w.errors.slice()
  await w.browser.close()
  return res
}
const out = []
for (const [n, a, o] of [['YA', 'yes', 'switch-first'], ['YB', 'yes', 'answer-first'], ['NA', 'no', 'switch-first'], ['NB', 'no', 'answer-first']]) {
  try { out.push(await variant(n, a, o)) } catch (e) { say('ERROR', n, e.message.split('\n')[0]); out.push({ name: n, error: e.message.split('\n')[0] }) }
}
savePart('s07-run', { out, log })
