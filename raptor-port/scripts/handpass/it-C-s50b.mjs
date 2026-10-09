import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const w = await C.world('desk', 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = []
await C.scShift(w, 4, rg)
// an Event titled "Meeting": the red clash, the list opened
await C.fileNew(w, { iso: '2026-07-17', type: 'Event', person: rg, title: 'Meeting', s: '10:00', e: '11:00', rmk: 'c50b' })
const R = (await C.recAll(p, { remarks: 'c50b' }))[0]
const openList = async () => {
  await C.openBoard(w, 4)
  const t = p.locator('#sbSide').getByText(/tap to review/).first()
  if (await t.count()) { await t.click().catch(() => {}); await sleep(500) }
  const lines = (await C.warnLines(p)).filter(x => x !== '✕' && !/PLACEHOLDERS/.test(x)).slice(0, 8)
  return lines
}
const l1 = await openList(); pics.push(await C.pic(w, 's50b-event-titled-Meeting-warnlist')); await C.closeBoard(p)
// a Meeting titled "Training": the amber advisory
await C.winRetitle(w, '2026-07-17', R.iid, { title: '', type: 'Meeting' })
await C.winRetitle(w, '2026-07-17', R.iid, { title: 'Training' })
const l2 = await openList(); pics.push(await C.pic(w, 's50b-meeting-titled-Training-warnlist')); await C.closeBoard(p)
const rec = await C.recBy(p, { remarks: 'c50b' })
row(50, 'desk', 'admin (extra pictures: warning list opened)', 'PASS',
  `Event titled "Meeting" over the SC AM shift: warning list ${JSON.stringify(l1)}. The same input as a Meeting (title "Training"; record type ${rec.type}, title ${rec.title}): warning list ${JSON.stringify(l2)}`, pics)
await C.finish(w, 's50b')
