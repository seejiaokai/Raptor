import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
const sw = await C.setMemberFiling(w, true)
await C.switchUser(w, 'us')
const pics = []
await C.fileNew(w, { iso: '2026-07-23', type: 'Event', person: sb, title: 'Filed by Ranger', s: '10:00', e: '11:00', rmk: 'fbr' })
let R = await C.recBy(p, { remarks: 'fbr' })
const filedOk = R && R.person === sb && R.title === 'Filed by Ranger' && R.by === rg
await C.openSaved(w, '2026-07-23', R.iid)
const i0 = await C.winInfo(p)
pics.push(await C.pic(w, 's45-ranger-reopen'))
await p.fill('#inpEditTitle', 'Retitled by Ranger')
const sv = await C.saveWin(w)
await C.closeWins(p)
const R2 = await C.recBy(p, { remarks: 'fbr' })
await C.openSaved(w, '2026-07-23', R.iid)
const i1 = await C.winInfo(p)
await C.closeWins(p)
// Saber (the input's subject, the admin) signs in
await C.switchUser(w, 'ad')
await C.openSaved(w, '2026-07-23', R.iid)
const i2 = await C.winInfo(p)
pics.push(await C.pic(w, 's45-saber-open'))
await p.fill('#inpEditTitle', 'Saber changed it')
await C.saveWin(w)
await C.closeWins(p)
const R3 = await C.recBy(p, { remarks: 'fbr' })
await C.openSaved(w, '2026-07-23', R.iid)
const i3 = await C.winInfo(p)
pics.push(await C.pic(w, 's45-saber-after'))
await C.closeWins(p)
const ok = filedOk && i0.save && !i0.bodyInert && R2.title === 'Retitled by Ranger' && R2.by === rg && i2.save && R3.title === 'Saber changed it' && R3.by === rg && R3.person === sb
row(45, size, 'member (Ranger) then admin (Saber)', ok ? 'PASS' : 'FAIL',
  `switch "members may file for others" was ${sw.was ? 'ON' : 'OFF'} (left ON). Ranger filed Saber's Event "Filed by Ranger" (person ${R && R.person === sb ? 'Saber' : R && R.person}, placed-by ${R && R.by === rg ? 'Ranger' : R && R.by}); reopened as Ranger: Save ${i0.save}, body locked ${i0.bodyInert}, placed line "${i0.placed}"; retitled -> "${R2.title}" (placed-by ${R2.by === rg ? 'Ranger' : R2.by}), reopen line "${i1.placed}". Saber signed in: Save ${i2.save}, title box "${i2.title}"; retitled -> "${R3.title}" placed-by ${R3.by === rg ? 'Ranger' : R3.by}, person ${R3.person === sb ? 'Saber' : R3.person}; line "${i3.placed}". (Saber is an admin, so his right here is also the admin's.)`, pics)
await C.finish(w, 's45-' + size)
