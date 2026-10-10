import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
// admin background: Saber's own titled Event (filed by Saber, not by Ranger)
await C.fileNew(w, { iso: '2026-07-21', type: 'Event', person: sb, title: 'Saber briefing', s: '10:00', e: '11:00', rmk: 'sab1' })
const S = await C.recBy(p, { remarks: 'sab1' })
await C.switchUser(w, 'us')
const pics = []
// Ranger's own Event: file through the window with a title
await C.fileNew(w, { iso: '2026-07-22', type: 'Event', person: undefined, title: 'Mine v1', s: '14:00', e: '15:00', rmk: 'rng1' })
let M = await C.recBy(p, { remarks: 'rng1' })
const filed = M && M.title === 'Mine v1' && M.person === rg
// retitle through the window
await C.winRetitle(w, '2026-07-22', M.iid, { title: 'Mine v2' })
const afterWin = (await C.recBy(p, { remarks: 'rng1' })).title
// retitle through the List pencil
const pr = await C.pencilSave(w, M.iid, { title: 'Mine v3' })
const afterPen = (await C.recBy(p, { remarks: 'rng1' })).title
pics.push(await C.pic(w, 's44-list-after-own-retitle'))
// Saber's: window
await C.openSaved(w, '2026-07-21', S.iid)
const info0 = await C.winInfo(p)
pics.push(await C.pic(w, 's44-saber-readonly'))
// try to type, press Enter
let typed = null
try { await p.locator('#inpEditTitle').click({ force: true, timeout: 2000 }); await p.keyboard.press('End'); await p.keyboard.type('XYZ'); await p.keyboard.press('Enter') } catch (e) { typed = 'could not focus/type: ' + String(e.message).split('\n')[0] }
await sleep(400)
const info1 = await C.winInfo(p)
const stillOpen = await C.win(p).count()
await C.closeWins(p)
await C.openSaved(w, '2026-07-21', S.iid)
const info2 = await C.winInfo(p)
await C.closeWins(p)
const rec = await C.recBy(p, { remarks: 'sab1' })
// Saber's row in the List: is there a pencil?
await C.openList(w)
await C.listRow(p, S.iid).scrollIntoViewIfNeeded().catch(() => {}); await sleep(300)
await C.listRow(p, S.iid).scrollIntoViewIfNeeded().catch(() => {}); await sleep(300)
const hasPen = await C.listRow(p, S.iid).locator('[data-edit]').count()
pics.push(await C.pic(w, 's44-list-everyone'))
const ownStep = filed && afterWin === 'Mine v2' && afterPen === 'Mine v3'
const roOk = info0.title === 'Saber briefing' && info0.type === 'Event' && !info0.save && !info0.del && (info0.titleInert || info0.bodyInert) && info1.title === 'Saber briefing' && info2.title === 'Saber briefing' && rec.title === 'Saber briefing' && !hasPen
row(44, size, 'member (Ranger)', ownStep && roOk ? 'PASS' : 'FAIL',
  `own Event: filed "${filed ? 'Mine v1' : '??'}", window retitle -> "${afterWin}", List pencil -> "${afterPen}" (pencil asked OIL: ${pr.asked}). Saber's Event "Saber briefing": window title "${info0.title}" inert=${info0.titleInert}/${info0.bodyInert}, type "${info0.type}", Save ${info0.save}, Delete ${info0.del}, text "${info0.ro}"; after typing "XYZ"+Enter value "${info1.title}" (${typed || 'typed'}), window still open ${stillOpen}, reopened "${info2.title}", record "${rec.title}"; List pencil on Saber's row: ${hasPen}`, pics)
await C.finish(w, 's44-' + size)
