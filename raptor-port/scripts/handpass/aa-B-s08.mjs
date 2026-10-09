import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTap, closeWin, pubDay, credits, reanswer, undoRedo, reload, savePart } from './aa-B-lib.mjs'
import { groundIdx, putExtra, putMain, rowPucks, rowSeat, tapRowSeat } from './aa-B-rows.mjs'
const P = 'dice', W = 'glass', M = 'shaft'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}

async function view(w, iid, rmk, label, key) {
  const { page } = w
  await openBoard(page, 5); await oilOn(page, true)
  const rs = await rowSeat(page, rmk, P)
  await openCount(page, iid); await tabTo(page, 'earn')
  const s = await winState(page)
  const rec = { Prow: rs && rs.cls, Pin: s.seats[P] || 'not in window', W: s.seats[W], M: s.seats[M], on: s.on, total: s.total, tab: s.tabs[1] }
  say(label, JSON.stringify(rec)); out[key] = { ...(out[key] || {}), [label]: rec }
  return rec
}
async function variant(name, typedWhere) {
  const w = await world('desk', 'ad', false); w.tag = 's8' + name
  const { page } = w
  const rmk = 'S8' + name
  say(`--- ${name}: typed P ${typedWhere}`)
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk, s: '09:00', e: '12:00', oil: 'no' })
  const iid = f.rec.iid
  await openBoard(page, 5)
  const slot = await groundIdx(page, rmk)
  if (typedWhere === 'extras') say('put P under the row:', await putExtra(page, slot, P))
  else { say('put P in the name box:', await putMain(page, slot, P)); say('put the placeholder under the row:', await putExtra(page, slot, 'allavail')) }
  say('row pucks', JSON.stringify(await rowPucks(page, rmk)))
  await oilOn(page, true)
  await pic(w, 'row-oil')
  await view(w, iid, rmk, 'initial', name); await pic(w, 'win-initial')
  // deny P (his own switch on the row), grant W (in the window)
  await closeWin(page)
  await tapRowSeat(page, rmk, P)
  say('P switch after tap', JSON.stringify(await rowSeat(page, rmk, P)))
  await openCount(page, iid); await tabTo(page, 'earn'); await seatTap(page, W)
  let s = await winState(page); say('W after tap', s.seats[W], 'tab', s.tabs[1]); await pic(w, 'win-switched'); await closeWin(page)
  await reanswer(page, iid, 'yes'); say('filer answered Yes')
  await view(w, iid, rmk, 'afterYes', name); await pic(w, 'win-afterYes'); await closeWin(page)
  await undoRedo(page, 'undo'); await view(w, iid, rmk, 'undo', name); await pic(w, 'win-undo'); await closeWin(page)
  await undoRedo(page, 'redo'); await view(w, iid, rmk, 'redo', name); await pic(w, 'win-redo'); await closeWin(page)
  await reload(page); await view(w, iid, rmk, 'reload', name); await pic(w, 'win-reload'); await closeWin(page)
  say('publish', JSON.stringify(await pubDay(page, 5)))
  const c = await credits(page, [P, W, M]); say('credits', JSON.stringify(c)); out[name].credits = c
  await pic(w, 'lw')
  out[name].errors = w.errors.slice()
  await w.browser.close()
}
for (const [n, t] of [['a', 'extras'], ['b', 'main']]) {
  try { await variant(n, t) } catch (e) { say('ERROR', n, e.message.split('\n')[0]); out[n] = { ...(out[n] || {}), error: e.message.split('\n')[0] } }
}
savePart('s08-run', { out, log })
