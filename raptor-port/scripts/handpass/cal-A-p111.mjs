import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.worldPlain(SIZE)         // the plain address: the world is saved, so a reload brings it back
const o = {}
const D = '2026-07-21'
let pn = 0
const readAll = async (tag, snap = false) => {
  await H.warOpen(w); await H.warJump(w, D)
  const war = await H.warText(w, D)
  const work = await H.warWork(w, 'p', D)
  const pw = snap ? await H.pic(w, `p111-${tag}-war`) : null
  await H.warWorkClose(w)
  await H.openSans(w); await H.sansGoto(w, D)
  const cell = await H.sansCell(w, D)
  await H.sansOpen(w, D)
  const day = await H.sansDayRead(w)
  const ps = snap ? await H.pic(w, `p111-${tag}-sans`) : null
  await H.sansClose(w)
  return { war: [war.reqP, war.availP], work: work.replace(/^Pilots Tue 21 Jul /, ''), cellNeed: cell.need, cellF: cell.f, day: [day.req[0], day.avail[0], day.sans[0], day.need[0]], pics: [pw, ps].filter(Boolean) }
}
const pics = []
const same = (a, b) => eq([a.war, a.work, a.cellNeed, a.cellF, a.day], [b.war, b.work, b.cellNeed, b.cellF, b.day])
o.R0 = await readAll('r0')
// ---- A: the Required figure
await H.warOpen(w); await H.typeReq(w, 'p', D, 40)
o.A1 = await readAll('a1', true)
await H.undo(w); o.A1u = await readAll('a1undo', true)
await H.redo(w); o.A1r = await readAll('a1redo')
// ---- B: a leave that takes one pilot out of Available
await H.warOpen(w); await H.placeLeave(w, 'slipway', D, 'LL')
o.B1 = await readAll('b1', true)
await H.undo(w); o.B1u = await readAll('b1undo', true)
await H.redo(w); o.B1r = await readAll('b1redo')
// ---- C: a SANS pilot's Fly offer
await H.openSans(w); o.filed = await H.sansFile(w, D, 'Zenith', { f: true }); await H.sansClose(w)
o.C1 = await readAll('c1', true)
await H.undo(w); o.C1u = await readAll('c1undo', true)
await H.redo(w); o.C1r = await readAll('c1redo')
// ---- the reload, and a fresh sign-in on the same world
await sleep(1500)
await w.page.reload()
const onCard = await w.page.waitForSelector('#luser', { state: 'visible', timeout: 6000 }).then(() => true, () => false)
if (onCard) { await w.page.fill('#luser', 'ad'); await w.page.fill('#lpass', 'a'); await w.page.click('#loginForm button[type=submit]') }
await w.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(800)
o.reloaded = await readAll('reload', true)
const sel = x => [x.war, x.work, x.cellNeed, x.day]
H.judge('P1-11', `${SIZE} (plain address): Tue 21 Jul 26: one change at a time — Required P 40 typed, a leave for Drifter, Zenith's Fly offer — each followed by Undo then Redo in the top bar, with the Leave War row and working box and the SANS cell and opened day read after every step; then a reload and a fresh sign-in`, [
  ['baseline: Required dash, Available 28, nothing committed', o.R0.war[0] === '–' && o.R0.war[1] === '28' && o.R0.day[2] === '0', sel(o.R0)],
  ['A change: Required 40 shows 40 and a need of 12 on every reader', o.A1.war[0] === '40' && /Still needed 12$/.test(o.A1.work) && o.A1.day[3] === '12' && o.A1.cellNeed.startsWith('12'), sel(o.A1)],
  ['A Undo: every reader returns to the baseline with no other edit', same(o.A1u, o.R0), sel(o.A1u)],
  ['A Redo: every reader returns to the 40 reading', same(o.A1r, o.A1), sel(o.A1r)],
  ['B change: a leave takes Available to 27 and need to 13 on every reader', o.B1.war[1] === '27' && /Available 27/.test(o.B1.work) && o.B1.day[1] === '27' && o.B1.day[3] === '13', sel(o.B1)],
  ['B Undo: every reader returns to the previous reading (Available 28, need 12)', same(o.B1u, o.A1r), sel(o.B1u)],
  ['B Redo: every reader returns to the 27 / 13 reading', same(o.B1r, o.B1), sel(o.B1r)],
  ['C change: the Fly offer takes committed to 1 and need to 12 on every reader', !o.filed.stillOpen && o.C1.day[2] === '1' && o.C1.day[3] === '12' && /SANS committed to fly 1/.test(o.C1.work), sel(o.C1)],
  ['C Undo: every reader returns to committed 0, need 13', same(o.C1u, o.B1r), sel(o.C1u)],
  ['C Redo: every reader returns to committed 1, need 12', same(o.C1r, o.C1), sel(o.C1r)],
  ['after the reload and sign-in every reader still shows the last committed state', same(o.reloaded, o.C1r), sel(o.reloaded)],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [...o.A1.pics, ...o.A1u.pics, ...o.B1.pics, ...o.B1u.pics, ...o.C1.pics, ...o.C1u.pics, ...o.reloaded.pics])
H.savePart('P1-11-' + SIZE, { out: o })
await H.closeAll(w)
