// W2 part A — scenarios 13, 14 and 38 (for 13): an Other for Ranger, Goes to Unavailable, on an UNPUBLISHED day (Wed 15 Jul 2026);
// then flipped to the Ground Programme and back; Undo, Redo, reload. Desktop 1536 x 864, admin, real storage, a fresh world.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-a.mjs
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
H.clearPrefix('a-')
console.log('lw-m3b-w2-a', H.OUT)
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ranger = await H.idOf(P, 'Ranger')
const ISO = '2026-07-15', DI = 2
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
/* "3 –" is 3 pilots and no WSO figure: read each side as a number or a dash */
const needOf = s => { const p = String(s || '').trim().split(/\s+/); return p.length >= 2 ? p.slice(0, 2).map(x => (/^\d+$/.test(x) ? +x : x)) : s }
const state = async tag => {
  await H.warOpen(w, ranger, ISO)
  const s = { cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO), req: await H.reqP(P, ISO) }
  note(tag + '-war', 'desk', JSON.stringify(s))
  return s
}
const sansNeed = async tag => {
  await H.sansOpen(w); await H.sansMonth(w, 2026, 7)
  const n = await H.sansNeed(P, ISO); note(tag + '-sans', 'desk', 'need ' + n + ' | day: ' + await H.sansDayWords(P, ISO)); return n
}
const unavRow = async () => { await H.goEdit(w); return { unav: await H.rowsOf(P, DI, 'sec-unav'), grnd: await H.rowsOf(P, DI, 'sec-grnd'), inp: await H.rowsOf(P, DI, 'sec-inp') } }
const mine = rows => (rows.rows || []).filter(r => /Ranger/.test(r.text) && /Range tasking/.test(r.text))

/* ---- the base: Required P typed on the war so the SANS calendar has a figure to move ---- */
await H.warOpen(w, ranger, ISO)
note('required', 'desk', 'typed ' + await L.setRequired(w, 'p', ISO, 30))
const base = await state('base')
const needBase = await sansNeed('base')
const row0 = await unavRow()
note('base-edit', 'desk', 'Wed Unavailable: ' + JSON.stringify(row0.unav.rows?.map(r => r.text)))

/* ================= 13 ================= */
const f = await H.fileInput(w, {
  who: 'Ranger', type: 'Other', from: ISO, remarks: 'Range tasking', goes: 'u', tag: '13',
  beforeSave: async o => { if (!(await P.locator('#inpEditAllday').isChecked())) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) }; o.pic = await H.pic(w, 'a-13-window', [H.WIN], { pad: 6 }) },
})
note('13-filed', 'desk', JSON.stringify({ acc: f.rec?.acc, type: f.rec?.type, allday: f.rec?.allday, date: f.rec?.date, asked: f.asked, goesLine: f.goesLine }))
const iid = f.rec.iid
const e1 = await unavRow()
const mineU = mine(e1.unav)
note('13-edit', 'desk', 'Unavailable has: ' + JSON.stringify(mineU) + ' | Ground has: ' + JSON.stringify(mine(e1.grnd)))
await H.centreOn(P, [`#eWeek section.day[data-day="${DI}"] .sec-unav`])
await H.pic(w, 'a-13-edit-unavail', [`#eWeek section.day[data-day="${DI}"] .sec-unav`], { pad: 6 })
const s1 = await state('13')
await H.warPic(w, 'a-13-war', ranger, [ISO], { pad: 8 })
const need1 = await sansNeed('13')
await H.pic(w, 'a-13-sans', [T('sc-day-' + ISO)], { pad: 24 })
{
  const okFiled = f.rec.acc === 'u' && f.goesLine === 'Counted as away on the Leave War'
  const okEdit = mineU.length === 1
  const box = (s1.cell || []).find(b => /^OTH\|/.test(b))
  const okBox = !!box && /outlined/.test(box)
  const okAvail = num(s1.avail) === num(base.avail) - 1
  const nb = needOf(needBase), n1 = needOf(need1)
  const okNeed = Array.isArray(nb) && Array.isArray(n1) && n1[0] === nb[0] + 1 && n1[1] === nb[1]
  L.rec('13', 'desk', okFiled && okEdit && okBox && okAvail && okNeed ? 'PASS?' : 'FAIL?', `filed acc=${f.rec.acc} line="${f.goesLine}"; Unavailable row holds it with remarks: ${okEdit}; war box ${box}; Available P ${base.avail} → ${s1.avail}; SANS still needed ${need1 === needBase ? 'unchanged' : needBase + ' → ' + need1}`, ['a-13-window', 'a-13-edit-unavail', 'a-13-war', 'a-13-sans'])
}

/* ---- ↺ Undo, Redo, reload (from the Leave War, where he is) ---- */
await H.warOpen(w, ranger, ISO)
const undoTitle = await P.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? b.title : 'none' })
await L.undo(w)
const pageAfterUndo = await P.evaluate(() => window.CURPAGE)
const u1 = { cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO) }
note('13-undo', 'desk', `button "${undoTitle}" → page ${pageAfterUndo}; ${JSON.stringify(u1)}; inputs of type Other now: ${await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Other').length)}`)
await H.warPic(w, 'a-13-undo-war', ranger, [ISO])
const redoTitle = await P.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? b.title : 'none' })
await L.redo(w)
const pageAfterRedo = await P.evaluate(() => window.CURPAGE)
const r1 = { cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO) }
note('13-redo', 'desk', `button "${redoTitle}" → page ${pageAfterRedo}; ${JSON.stringify(r1)}`)
await H.warPic(w, 'a-13-redo-war', ranger, [ISO])
L.rec('13-undo-redo', 'desk', (u1.cell || []).length === 0 && num(u1.avail) === num(base.avail) && (r1.cell || []).some(b => /^OTH\|/.test(b)) && num(r1.avail) === num(s1.avail) ? 'PASS?' : 'FAIL?', `Undo ("${undoTitle}") left the screen on ${pageAfterUndo}: cell ${JSON.stringify(u1.cell)} Available P ${u1.avail}; Redo ("${redoTitle}") on ${pageAfterRedo}: cell ${JSON.stringify(r1.cell)} Available P ${r1.avail}`, ['a-13-undo-war', 'a-13-redo-war'])

/* reload — the app asks for the sign-in again, then everything must be back */
await P.reload(); await P.waitForTimeout(1500)
if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(800) }
const reloaded = await state('13-reload')
await H.warPic(w, 'a-13-reload-war', ranger, [ISO])
const e2 = await unavRow()
note('13-reload-edit', 'desk', 'Unavailable has: ' + JSON.stringify(mine(e2.unav)))
await H.centreOn(P, [`#eWeek section.day[data-day="${DI}"] .sec-unav`])
await H.pic(w, 'a-13-reload-edit', [`#eWeek section.day[data-day="${DI}"] .sec-unav`], { pad: 6 })
/* Goes to reopens on what was saved — from the Inputs list's card */
const doors = {}
for (const door of ['cal', 'row']) {
  await H.openInputBy(w, iid, door)
  doors[door] = await H.goesRead(P)
  note('13-reload-door-' + door, 'desk', JSON.stringify(doors[door]))
  await H.pic(w, 'a-13-reload-window-' + door, [H.WIN], { pad: 6 })
  await L.press(w, '#inpEditCancel'); await P.waitForTimeout(500)
}
await H.openInputBy(w, iid, 'list')
const gread = await H.goesRead(P); doors.list = gread
const gu = gread.u, gg = gread.g, gl = gread.line
note('13-reload-window', 'desk', `Goes to: Ground ${gg}, Unavailable ${gu}, line "${gl}"`)
await H.pic(w, 'a-13-reload-window', [H.WIN], { pad: 6 })
L.rec('38(13)', 'desk', (reloaded.cell || []).some(b => /^OTH\|.*outlined/.test(b)) && num(reloaded.avail) === num(s1.avail) && mine(e2.unav).length === 1 && ['list', 'cal', 'row'].every(d => doors[d].u === 'true' && doors[d].line === 'Counted as away on the Leave War') ? 'PASS?' : 'FAIL?', `after reload + sign-in: cell ${JSON.stringify(reloaded.cell)}, Available P ${reloaded.avail}, Unavailable row ${mine(e2.unav).length}, Goes to by door ${JSON.stringify(doors)}`, ['a-13-reload-war', 'a-13-reload-edit', 'a-13-reload-window', 'a-13-reload-window-cal', 'a-13-reload-window-row'])

/* ================= 14 — flip to the Ground Programme (window still open from the Inputs list) ================= */
await L.press(w, T('inpEdit-goes-g')); await P.waitForTimeout(300)
const gl2 = await L.txt(P, T('inpEdit-goes-line'))
await H.pic(w, 'a-14-window-ground', [H.WIN], { pad: 6 })
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
await H.answerAsks(w, '14')
const recG = await H.inputById(P, iid)
const e3 = await unavRow()
note('14-edit', 'desk', `acc ${recG?.acc}; Unavailable has ${JSON.stringify(mine(e3.unav))}; Ground has ${JSON.stringify(mine(e3.grnd))}; Personal Inputs ${JSON.stringify(mine(e3.inp))}`)
await H.centreOn(P, [`#eWeek section.day[data-day="${DI}"] .sec-grnd`])
await H.pic(w, 'a-14-edit-ground', [`#eWeek section.day[data-day="${DI}"] .sec-grnd`], { pad: 6 })
await H.pic(w, 'a-14-edit-unavail-gone', [`#eWeek section.day[data-day="${DI}"] .sec-unav`], { pad: 6 })
const g1 = await state('14-ground')
await H.warPic(w, 'a-14-war-ground', ranger, [ISO])
const needG = await sansNeed('14-ground')
{
  const okRow = mine(e3.grnd).length === 1 && mine(e3.unav).length === 0
  const okWar = (g1.cell || []).length === 0 && num(g1.avail) === num(base.avail)
  L.rec('14-ground', 'desk', recG?.acc === 'g' && okRow && okWar && needG === needBase ? 'PASS?' : 'FAIL?', `line "${gl2}"; acc ${recG?.acc}; on Ground ${mine(e3.grnd).length}, under Unavailable ${mine(e3.unav).length}; war cell ${JSON.stringify(g1.cell)}, Available P ${g1.avail}; SANS still needed ${needG} (base ${needBase})`, ['a-14-window-ground', 'a-14-edit-ground', 'a-14-edit-unavail-gone', 'a-14-war-ground'])
}
/* Undo, Redo of the flip, from the war */
await H.warOpen(w, ranger, ISO)
await L.undo(w)
const ug = { page: await P.evaluate(() => window.CURPAGE), cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO), acc: (await H.inputById(P, iid))?.acc }
await H.warPic(w, 'a-14-undo-war', ranger, [ISO])
await L.redo(w)
const rg = { page: await P.evaluate(() => window.CURPAGE), cell: await H.cellBoxes(w, ranger, ISO), avail: await H.availP(P, ISO), acc: (await H.inputById(P, iid))?.acc }
await H.warPic(w, 'a-14-redo-war', ranger, [ISO])
L.rec('14-undo-redo', 'desk', ug.acc === 'u' && (ug.cell || []).some(b => /^OTH\|/.test(b)) && rg.acc === 'g' && (rg.cell || []).length === 0 ? 'PASS?' : 'FAIL?', `Undo of the flip: page ${ug.page}, acc ${ug.acc}, cell ${JSON.stringify(ug.cell)}, Available P ${ug.avail}; Redo: page ${rg.page}, acc ${rg.acc}, cell ${JSON.stringify(rg.cell)}, Available P ${rg.avail}`, ['a-14-undo-war', 'a-14-redo-war'])

/* ---- flip back to Unavailable through the window ---- */
await H.openInputBy(w, iid, 'list')
const gr2 = await H.goesRead(P)
note('14-window-ground', 'desk', `reopened: ${JSON.stringify(gr2)}`)
await L.press(w, T('inpEdit-goes-u')); await P.waitForTimeout(300)
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
await H.answerAsks(w, '14b')
const recU = await H.inputById(P, iid)
const e4 = await unavRow()
await H.centreOn(P, [`#eWeek section.day[data-day="${DI}"] .sec-unav`])
await H.pic(w, 'a-14-edit-unavail-back', [`#eWeek section.day[data-day="${DI}"] .sec-unav`], { pad: 6 })
const g2 = await state('14-back')
await H.warPic(w, 'a-14-war-back', ranger, [ISO])
const needB = await sansNeed('14-back')
L.rec('14-back', 'desk', recU?.acc === 'u' && mine(e4.unav).length === 1 && mine(e4.grnd).length === 0 && (g2.cell || []).some(b => /^OTH\|.*outlined/.test(b)) && num(g2.avail) === num(base.avail) - 1 && JSON.stringify(needOf(needB)) === JSON.stringify(needOf(need1)) ? 'PASS?' : 'FAIL?', `acc ${recU?.acc}; under Unavailable ${mine(e4.unav).length}, on Ground ${mine(e4.grnd).length}; war cell ${JSON.stringify(g2.cell)}, Available P ${g2.avail}; SANS still needed ${needB}`, ['a-14-edit-unavail-back', 'a-14-war-back'])
/* reload once more, to see the saved choice after the second flip */
await P.reload(); await P.waitForTimeout(1500)
if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(800) }
const g3 = await state('14-reload')
note('14-reload', 'desk', 'acc after reload: ' + (await H.inputById(P, iid))?.acc)

note('errors', 'desk', JSON.stringify(w.errs))
H.saveLog('a-run.json')
await w.ctx.close()
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
