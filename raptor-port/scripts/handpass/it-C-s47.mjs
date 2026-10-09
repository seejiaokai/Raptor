import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
const pics = []
await C.switchUser(w, 'us')
await C.fileNew(w, { iso: '2026-07-28', type: 'Event', title: 'Ranger filed this', s: '10:00', e: '11:00', rmk: 'r47' })
const R0 = await C.recBy(p, { remarks: 'r47' })
await C.switchUser(w, 'ad')
await C.winRetitle(w, '2026-07-28', R0.iid, { title: 'Admin retitled' })
const R1 = await C.recBy(p, { remarks: 'r47' })
await C.switchUser(w, 'us')
await C.openSaved(w, '2026-07-28', R0.iid)
const i0 = await C.winInfo(p)
pics.push(await C.pic(w, 's47-ranger-reopen'))
// Ranger edits it
await p.fill('#inpEditTitle', 'Ranger again')
await C.saveWin(w)
await C.closeWins(p)
const R2 = await C.recBy(p, { remarks: 'r47' })
// history (the admin's Edit Schedule changes window)
await C.switchUser(w, 'ad')
await C.weekTo(w, 'Jul 27')
const hAdmin = await C.changesText(w, { pic: 's47-history-admin' })
pics.push(hAdmin.pic)
const line = t => { const m = t.match(/Tue · Input[^]*?(?=Tap a change)/); return m ? m[0] : t.slice(0, 600) }
const ok = R1 && R1.title === 'Admin retitled' && R1.by === rg && i0.title === 'Admin retitled' && i0.save && !i0.bodyInert && R2.title === 'Ranger again' && R2.by === rg && /Admin retitled/.test(hAdmin.text) && /Saber/.test(hAdmin.text)
row(47, size, 'admin then member (Ranger)', ok ? 'PASS' : 'FAIL',
  `Ranger filed "Ranger filed this"; admin retitled it "${R1.title}" (placed-by still ${R1.by === rg ? 'Ranger' : R1.by}); Ranger reopened: title "${i0.title}", Save ${i0.save}, locked ${i0.bodyInert}, placed line "${i0.placed}"; Ranger retitled "${R2.title}" (placed-by ${R2.by === rg ? 'Ranger' : R2.by}). History (admin's view, All changes): "${line(hAdmin.text)}"`, pics)
await C.finish(w, 's47-' + size)
