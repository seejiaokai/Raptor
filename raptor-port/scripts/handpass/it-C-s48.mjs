import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
console.log("t1", Date.now()%100000);
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
console.log("t2", Date.now()%100000);
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
const pics = []
console.log("t3", Date.now()%100000);
await C.setMemberFiling(w, true)
console.log("t4", Date.now()%100000);
await C.switchUser(w, 'us')
console.log("t5", Date.now()%100000);
await C.fileNew(w, { iso: '2026-07-29', type: 'Event', person: sb, title: 'Ranger for Saber', s: '10:00', e: '11:00', rmk: 'f48' })
console.log("t6", Date.now()%100000);
await C.fileNew(w, { iso: '2026-07-30', type: 'Event', title: 'Ranger own', s: '10:00', e: '11:00', rmk: 'o48' })
console.log("t7", Date.now()%100000);
const F = await C.recBy(p, { remarks: 'f48' }), O = await C.recBy(p, { remarks: 'o48' })
console.log("t8", Date.now()%100000);
const filed = F && F.person === sb && F.by === rg && F.title === 'Ranger for Saber'
// the setting ON: baseline — Ranger may retitle it
console.log("t9", Date.now()%100000);
await C.openSaved(w, '2026-07-29', F.iid); const on0 = await C.winInfo(p); await C.closeWins(p)
console.log("t10", Date.now()%100000);
await C.pencil(w, F.iid).then(async ok => { w._pen0 = ok; if (ok) { await C.pic(w, 's48-pencil-on-baseline'); await p.locator('#inBody tr.ined [data-cancel], #inBody tr.ined button:has-text("Cancel")').first().click().catch(() => {}) } })
// admin turns it OFF
console.log("t11", Date.now()%100000);
await C.switchUser(w, 'ad')
console.log("t12", Date.now()%100000);
const off = await C.setMemberFiling(w, false)
console.log("t13", Date.now()%100000);
await C.switchUser(w, 'us')
console.log("t14", Date.now()%100000);
await C.openSaved(w, '2026-07-29', F.iid); const off1 = await C.winInfo(p); pics.push(await C.pic(w, 's48-off-window')); 
try { await p.locator('#inpEditTitle').click({ force: true, timeout: 2000 }); await p.keyboard.press('End'); await p.keyboard.type('QQ'); await p.keyboard.press('Enter') } catch (e) {}
console.log("t15", Date.now()%100000);
await sleep(300); await C.closeWins(p)
console.log("t16", Date.now()%100000);
const Foff = await C.recBy(p, { remarks: 'f48' })
console.log("t17", Date.now()%100000);
await C.openList(w); await C.listRow(p, F.iid).scrollIntoViewIfNeeded().catch(() => {}); await sleep(300)
console.log("t18", Date.now()%100000);
const penOff = await C.listRow(p, F.iid).locator('[data-edit]').count()
pics.push(await C.pic(w, 's48-off-list'))
// his own still works through both doors
console.log("t19", Date.now()%100000);
await C.winRetitle(w, '2026-07-30', O.iid, { title: 'Own via window' })
console.log("t20", Date.now()%100000);
const ownWin = (await C.recBy(p, { remarks: 'o48' })).title
console.log("t21", Date.now()%100000);
await C.pencilSave(w, O.iid, { title: 'Own via pencil' })
console.log("t22", Date.now()%100000);
const ownPen = (await C.recBy(p, { remarks: 'o48' })).title
// reload: the restriction stays
console.log("t23", Date.now()%100000);
await C.reload(w)
console.log("t24", Date.now()%100000);
await C.openSaved(w, '2026-07-29', F.iid); const off2 = await C.winInfo(p); pics.push(await C.pic(w, 's48-off-after-reload')); await C.closeWins(p)
console.log("t25", Date.now()%100000);
await C.openList(w); await C.listRow(p, F.iid).scrollIntoViewIfNeeded().catch(() => {}); const penOff2 = await C.listRow(p, F.iid).locator('[data-edit]').count()
// turn it back on
console.log("t26", Date.now()%100000);
await C.switchUser(w, 'ad')
console.log("t27", Date.now()%100000);
const on = await C.setMemberFiling(w, true)
console.log("t28", Date.now()%100000);
await C.switchUser(w, 'us')
console.log("t29", Date.now()%100000);
await C.openSaved(w, '2026-07-29', F.iid); const on2 = await C.winInfo(p); await C.closeWins(p)
console.log("t30", Date.now()%100000);
const penOn = await C.pencilSave(w, F.iid, { title: 'Back on route' })
console.log("t31", Date.now()%100000);
const backTitle = (await C.recBy(p, { remarks: 'f48' })).title
pics.push(await C.pic(w, 's48-on-again'))
const ok = filed && on0.save && off.now === false && !off1.save && Foff.title === 'Ranger for Saber' && penOff === 0 && ownWin === 'Own via window' && ownPen === 'Own via pencil' && !off2.save && penOff2 === 0 && on2.save && backTitle === 'Back on route'
row(48, size, 'member (Ranger) and admin', ok ? 'PASS' : 'FAIL',
  `Ranger filed Saber's Event "Ranger for Saber" (setting ON: window Save ${on0.save}). Admin turned the gear's "Members may file for other people" OFF (was ${off.was}). Ranger then: window on Saber's input Save ${off1.save}, locked ${off1.bodyInert}, text "${off1.ro}"; typed QQ+Enter -> title "${Foff.title}"; List pencil on that row ${penOff}; own Event retitled through window -> "${ownWin}", through pencil -> "${ownPen}". After a real reload: Save ${off2.save}, pencil ${penOff2}. Setting ON again: window Save ${on2.save}; pencil retitle -> "${backTitle}"`, pics)
console.log("t32", Date.now()%100000);
await C.finish(w, 's48-' + size)
