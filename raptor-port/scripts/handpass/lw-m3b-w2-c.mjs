// W2 part C — scenarios 16 (a Training moved under Unavailable and back, Edit Schedule and the Scheduler Board), 17 (the letters of each kind on
// the war, desktop and phone), 38 (reload after 16). Desktop 1536 x 864 and the same world on a phone 402 x 874. Admin, real storage.
//   world 16: Ranger's Training on Wed 15 Jul (Edit Schedule) and on Fri 17 Jul (the board)
//   world 17: Ranger's Meeting Mon 13, Personal Tue 14, Appointment Wed 15, Duty Thu 16, Event Fri 17 (Attach is in part D)
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-c.mjs   [SETS=16,17]
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const SETS = (process.env.SETS || '16,17').split(',')
for (const k of SETS) H.clearPrefix('c-' + k)
console.log('lw-m3b-w2-c', H.OUT, 'sets', SETS.join(','))
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const hasBox = (cell, re) => (cell || []).some(b => re.test(b))
const sc = async (id, fn) => { console.log('-- ' + id); try { await fn() } catch (e) { note(id, 'desk', 'NOT DONE — ' + String(e).slice(0, 500)); L.rec(id, 'desk', 'NOT WALKED', 'script stopped: ' + String(e).split('\n')[0].slice(0, 300), []) } }

/* ---- the schedule's own buttons: every Accept / Reject button carries the input's id and where it sends it ---- */
const accList = (P, scope, iid) => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), [scope, iid])
async function pressAcc(w, scope, iid, dest, di) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0 && di != null) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) throw new Error(`no ${dest} button for ${iid} in ${scope}: have ${JSON.stringify(await accList(P, scope, iid))}`)
  const b = P.locator(sel).nth(at)
  await b.scrollIntoViewIfNeeded().catch(() => {})
  const label = (await b.innerText()).trim()
  await b.click(); await P.waitForTimeout(1000)
  const asked = await H.answerAsks(w, 'acc-' + dest, { oil: 'no' })
  return { label, asked }
}
const EDIT = di => `#eWeek section.day[data-day="${di}"]`
async function editSnap(w, di, re) {
  const P = w.page
  await H.goEdit(w)
  const t = P.locator(`${EDIT(di)} [data-pitog="${di}"]`).first()
  if (await t.count()) { const n = (await H.rowsOf(P, di, 'sec-inp')).rows?.length || 0; if (!n) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500) } }
  const pick = async s => ((await H.rowsOf(P, di, s)).rows || []).filter(r => re.test(r.text))
  return { unav: await pick('sec-unav'), grnd: await pick('sec-grnd'), inp: await pick('sec-inp') }
}
async function warSnap(w, who, iso) {
  await H.warOpen(w, who, iso)
  return { cell: await H.cellBoxes(w, who, iso), avail: await H.availP(w.page, iso) }
}
const where = s => s.unav.length ? 'Unavailable' : s.grnd.length ? 'Ground Programme' : s.inp.length ? 'Personal Inputs only' : 'nowhere'

/* =============================== 16 =============================== */
if (SETS.includes('16')) await sc('16', async () => {
  const w = await H.deskCtx(); const P = w.page
  await L.signInPlain(w, 'admin')
  note('bundle', 'desk', await H.bundleName(P))
  const ranger = await H.idOf(P, 'Ranger')
  const ISO = '2026-07-15', DI = 2, RE = /Weapons trg/
  const base = await warSnap(w, ranger, ISO)
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: ISO, remarks: 'Weapons trg', tag: '16', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
  const iid = f.rec.iid
  note('16-filed', 'desk', `acc ${f.rec.acc}, allday ${f.rec.allday}, asked ${JSON.stringify(f.asked)}`)
  const s0 = await editSnap(w, DI, RE), w0 = await warSnap(w, ranger, ISO)
  note('16-start', 'desk', `on ${where(s0)}; war cell ${JSON.stringify(w0.cell)} Available P ${base.avail} → ${w0.avail}`)
  await H.goEdit(w); await H.centreOn(P, [EDIT(DI) + ' .sec-grnd']); await H.pic(w, 'c-16-start-ground', [EDIT(DI) + ' .sec-grnd'])
  /* Reject (Personal Inputs) → the pair appears; → Unavail */
  await H.goEdit(w)
  const p1 = await pressAcc(w, EDIT(DI), iid, 'x', DI)
  const s1 = await editSnap(w, DI, RE), w1 = await warSnap(w, ranger, ISO)
  note('16-rejected', 'desk', `pressed "${p1.label}"; on ${where(s1)}; buttons now ${JSON.stringify(await accList(P, EDIT(DI), iid))}; war ${JSON.stringify(w1.cell)} Available P ${w1.avail}`)
  await H.goEdit(w); await H.centreOn(P, [EDIT(DI) + ' .sec-inp']); await H.pic(w, 'c-16-rejected-inputs', [EDIT(DI) + ' .sec-inp'])
  const btnsAfterReject = await accList(P, EDIT(DI), iid)
  const p2 = await pressAcc(w, EDIT(DI), iid, 'u', DI)
  const s2 = await editSnap(w, DI, RE), w2 = await warSnap(w, ranger, ISO)
  note('16-unavail', 'desk', `pressed "${p2.label}"; on ${where(s2)}; war ${JSON.stringify(w2.cell)} Available P ${base.avail} → ${w2.avail}`)
  await H.warPic(w, 'c-16-unavail-war', ranger, [ISO])
  await H.goEdit(w); await H.centreOn(P, [EDIT(DI) + ' .sec-unav']); await H.pic(w, 'c-16-unavail-edit', [EDIT(DI) + ' .sec-unav'])
  /* R4: the changes window and the bell, after the move */
  note('16-changes', 'desk', 'changes window (All changes tab): ' + await H.openChanges(w))
  await H.pic(w, 'c-16-changes', null)
  await H.closeChanges(w)
  note('16-changes', 'desk', 'after its own cross the window reads: ' + await H.chgText(P))
  note('16-bell', 'desk', 'bell: ' + await H.bellText(w))
  await H.pic(w, 'c-16-bell', null)
  await H.closeBell(w)
  L.rec('16-unavail', 'desk', p1.label.toLowerCase() === 'reject' && btnsAfterReject.some(b => b.startsWith('u:')) && btnsAfterReject.some(b => b.startsWith('g:')) && where(s0) === 'Ground Programme' && where(s2) === 'Unavailable' && hasBox(w2.cell, /^TRG\|.*outlined/) && num(w2.avail) === num(base.avail) - 1 ? 'PASS?' : 'FAIL?', `started on ${where(s0)}; Reject then buttons ${JSON.stringify(btnsAfterReject)}; "→ Unavail" put it on ${where(s2)}; war ${JSON.stringify(w2.cell)}, Available P ${base.avail} → ${w2.avail}`, ['c-16-start-ground', 'c-16-rejected-inputs', 'c-16-unavail-edit', 'c-16-unavail-war'])
  /* ↺ Undo, Redo of the move */
  await H.warOpen(w, ranger, ISO)
  const undoTitle = await P.evaluate(() => document.querySelector('#undoBtn')?.title)
  await L.undo(w)
  const uu = { page: await P.evaluate(() => window.CURPAGE), ...(await warSnap(w, ranger, ISO)), acc: (await H.inputById(P, iid))?.acc }
  await H.warPic(w, 'c-16-undo-war', ranger, [ISO])
  const redoTitle = await P.evaluate(() => document.querySelector('#redoBtn')?.title)
  await L.redo(w)
  const rr = { page: await P.evaluate(() => window.CURPAGE), ...(await warSnap(w, ranger, ISO)), acc: (await H.inputById(P, iid))?.acc }
  await H.warPic(w, 'c-16-redo-war', ranger, [ISO])
  note('16-undo-redo', 'desk', `Undo ("${undoTitle}"): ${JSON.stringify(uu)} · Redo ("${redoTitle}"): ${JSON.stringify(rr)}`)
  L.rec('16-undo-redo', 'desk', uu.acc === 'x' || uu.acc === 'r' || uu.acc == null || uu.acc === 'g' ? (hasBox(uu.cell, /TRG/) ? 'FAIL?' : (hasBox(rr.cell, /^TRG\|.*outlined/) && rr.acc === 'u' ? 'PASS?' : 'FAIL?')) : 'FAIL?', `Undo ("${undoTitle}") → page ${uu.page}, acc ${uu.acc}, war ${JSON.stringify(uu.cell)} Available P ${uu.avail}; Redo ("${redoTitle}") → page ${rr.page}, acc ${rr.acc}, war ${JSON.stringify(rr.cell)} Available P ${rr.avail}`, ['c-16-undo-war', 'c-16-redo-war'])
  /* Reject from Unavailable, then → Ground */
  await H.goEdit(w)
  await pressAcc(w, EDIT(DI), iid, 'x', DI)
  const w3 = await warSnap(w, ranger, ISO)
  await H.goEdit(w)
  const p4 = await pressAcc(w, EDIT(DI), iid, 'g', DI)
  const s4 = await editSnap(w, DI, RE), w4 = await warSnap(w, ranger, ISO)
  note('16-ground', 'desk', `after Reject: war ${JSON.stringify(w3.cell)} Available P ${w3.avail}; "${p4.label}" → on ${where(s4)}; war ${JSON.stringify(w4.cell)} Available P ${w4.avail}`)
  await H.warPic(w, 'c-16-ground-war', ranger, [ISO])
  await H.goEdit(w); await H.centreOn(P, [EDIT(DI) + ' .sec-grnd']); await H.pic(w, 'c-16-ground-edit', [EDIT(DI) + ' .sec-grnd'])
  L.rec('16-ground', 'desk', where(s4) === 'Ground Programme' && (w4.cell || []).length === 0 && num(w4.avail) === num(base.avail) && (w3.cell || []).length === 0 ? 'PASS?' : 'FAIL?', `Reject: war ${JSON.stringify(w3.cell)} Available P ${w3.avail}; "→ Ground": on ${where(s4)}, war ${JSON.stringify(w4.cell)}, Available P ${w4.avail}`, ['c-16-ground-edit', 'c-16-ground-war'])
  /* back under Unavailable, then the reload (38 for 16) */
  await H.goEdit(w)
  await pressAcc(w, EDIT(DI), iid, 'x', DI)
  await H.goEdit(w)
  await pressAcc(w, EDIT(DI), iid, 'u', DI)
  const wb = await warSnap(w, ranger, ISO)
  note('16-back', 'desk', `back under Unavailable: war ${JSON.stringify(wb.cell)} Available P ${wb.avail}`)
  await P.reload(); await P.waitForTimeout(1500)
  if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(800) }
  const wr = await warSnap(w, ranger, ISO)
  await H.warPic(w, 'c-16-reload-war', ranger, [ISO])
  const sr = await editSnap(w, DI, RE)
  await H.centreOn(P, [EDIT(DI) + ' .sec-unav']); await H.pic(w, 'c-16-reload-edit', [EDIT(DI) + ' .sec-unav'])
  L.rec('38(16)', 'desk', hasBox(wr.cell, /^TRG\|.*outlined/) && num(wr.avail) === num(base.avail) - 1 && where(sr) === 'Unavailable' ? 'PASS?' : 'FAIL?', `after reload + sign-in: war ${JSON.stringify(wr.cell)}, Available P ${wr.avail}; row on ${where(sr)}`, ['c-16-reload-war', 'c-16-reload-edit'])

  /* ---- the same pair on the Scheduler Board: a Training on Fri 17 Jul ---- */
  const ISO2 = '2026-07-17', DI2 = 4, RE2 = /Board trg/
  const base2 = await warSnap(w, ranger, ISO2)
  const f2 = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: ISO2, remarks: 'Board trg', tag: '16b', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
  const iid2 = f2.rec.iid
  const HPL = await import('./lib.mjs')
  await HPL.board(P, DI2)
  await HPL.openInputs(P, DI2)
  const B = '#schedBoard'
  note('16b-board', 'desk', 'board buttons for it: ' + JSON.stringify(await accList(P, B, iid2)))
  const q1 = await pressAcc(w, B, iid2, 'x', DI2)
  const btnsB = await accList(P, B, iid2)
  note('16b-board', 'desk', `Reject pressed "${q1.label}"; buttons now ${JSON.stringify(btnsB)}`)
  await H.pic(w, 'c-16b-board-rejected', [B + ' .sb-panel.pinp'])
  const q2 = await pressAcc(w, B, iid2, 'u', DI2)
  const unavPanel = await P.evaluate(() => (document.querySelector('#schedBoard .sb-panel.unav')?.innerText || '').replace(/\s+/g, ' ').trim())
  note('16b-board', 'desk', `"${q2.label}" pressed; board's Unavailable panel: ${unavPanel.slice(0, 400)}`)
  await H.pic(w, 'c-16b-board-unavail', [B + ' .sb-panel.unav'])
  await HPL.closeBoard(P)
  const wB = await warSnap(w, ranger, ISO2)
  await H.warPic(w, 'c-16b-board-war', ranger, [ISO2])
  const onUnav = /Training[\s\S]*Ranger/.test(unavPanel)
  /* and back: Reject on the board's Unavailable row, then → Ground */
  await HPL.board(P, DI2); await HPL.openInputs(P, DI2)
  const q3 = await pressAcc(w, B, iid2, 'x', DI2)
  const q4 = await pressAcc(w, B, iid2, 'g', DI2)
  const grPanel = await P.evaluate(() => { const q = document.querySelector('#schedBoard .sb-panel.grnd'); return q ? (q.innerText + ' ' + [...q.querySelectorAll('input,textarea')].map(i => i.value).join(' ')).replace(/\s+/g, ' ').trim() : '' })
  await H.pic(w, 'c-16b-board-ground', [B + ' .sb-panel.grnd'])
  await HPL.closeBoard(P)
  const wG = await warSnap(w, ranger, ISO2)
  await H.warPic(w, 'c-16b-board-ground-war', ranger, [ISO2])
  note('16b-board', 'desk', `Reject "${q3.label}" then "${q4.label}": Ground panel has it: ${/Training|Board trg/.test(grPanel)}; war ${JSON.stringify(wG.cell)} Available P ${wG.avail}`)
  L.rec('16-board', 'desk', btnsB.some(b => b.startsWith('u:')) && btnsB.some(b => b.startsWith('g:')) && onUnav && hasBox(wB.cell, /^TRG\|.*outlined/) && num(wB.avail) === num(base2.avail) - 1 && /Training|Board trg/.test(grPanel) && (wG.cell || []).length === 0 && num(wG.avail) === num(base2.avail) ? 'PASS?' : 'FAIL?', `board offers ${JSON.stringify(btnsB)} after Reject; "→ Unavail": board's Unavailable panel holds it: ${onUnav}; war ${JSON.stringify(wB.cell)} Available P ${base2.avail} → ${wB.avail}; "→ Ground": Ground panel holds it: ${/Training|Board trg/.test(grPanel)}, war ${JSON.stringify(wG.cell)}, Available P ${wG.avail}`, ['c-16b-board-rejected', 'c-16b-board-unavail', 'c-16b-board-war', 'c-16b-board-ground', 'c-16b-board-ground-war'])
  note('errors-16', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

/* =============================== 17 =============================== */
if (SETS.includes('17')) await sc('17', async () => {
  const w = await H.deskCtx(); const P = w.page
  await L.signInPlain(w, 'admin')
  const ranger = await H.idOf(P, 'Ranger')
  const plan = [['Meeting', '2026-07-13', 0, 'MTG'], ['Personal', '2026-07-14', 1, 'PERS'], ['Appointment', '2026-07-15', 2, 'APPT'], ['Duty', '2026-07-16', 3, 'DTY'], ['Event', '2026-07-17', 4, 'EVT']]
  const base = {}
  for (const [, iso] of plan) base[iso] = (await warSnap(w, ranger, iso)).avail
  note('17-base', 'desk', 'Available P ' + JSON.stringify(base))
  const got = []
  for (const [kind, iso, di, want] of plan) {
    const mark = `K-${kind}`
    const f = await H.fileInput(w, { who: 'Ranger', type: kind, from: iso, remarks: mark, tag: '17-' + kind, oil: 'no', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
    const iid = f.rec.iid
    const before = await H.cellBoxes(w, ranger, iso).catch(() => null)
    await H.goEdit(w)
    const btns0 = await accList(P, EDIT(di), iid)
    const r1 = await pressAcc(w, EDIT(di), iid, 'x', di).catch(e => ({ label: 'none (' + String(e).slice(0, 80) + ')' }))
    const btns1 = await accList(P, EDIT(di), iid)
    const r2 = await pressAcc(w, EDIT(di), iid, 'u', di)
    const rowSnap = await editSnap(w, di, new RegExp(mark))
    const w2 = await warSnap(w, ranger, iso)
    const box = (w2.cell || []).find(b => /k-unav/.test(b)) || (w2.cell || [])[0]
    note('17-' + kind, 'desk', `filed acc ${f.rec.acc} allday ${f.rec.allday}; start ${JSON.stringify(btns0)} → Reject "${r1.label}" → ${JSON.stringify(btns1)} → "${r2.label}"; row on ${where(rowSnap)}; war ${JSON.stringify(w2.cell)} Available P ${base[iso]} → ${w2.avail}`)
    got.push({ kind, iso, want, cell: w2.cell, avail: w2.avail, where: where(rowSnap), box })
  }
  await H.warOpen(w, ranger, '2026-07-13')
  await H.warPic(w, 'c-17-desk-war', ranger, plan.map(p => p[1]))
  const ok = got.every(g => g.box && new RegExp('^' + g.want + '\\|').test(g.box) && /outlined/.test(g.box) && g.where === 'Unavailable' && num(g.avail) === num(base[g.iso]) - 1)
  L.rec('17-desk', 'desk', ok ? 'PASS?' : 'FAIL?', got.map(g => `${g.kind}: ${g.box} on ${g.where}, Available P ${base[g.iso]} → ${g.avail}`).join(' · '), ['c-17-desk-war'])
  /* the widths of the boxes on the desktop — four letters: do they fit */
  note('17-desk-fit', 'desk', got.map(g => g.box).join(' ; '))
  /* the same world on a phone */
  const state = await w.ctx.storageState()
  const m = await H.phoneFrom(state)
  await sc('17-phone', async () => {
    await L.signInPlain(m, 'admin')
    const mr = await H.idOf(m.page, 'Ranger')
    const fact = await H.cellBoxes(m, mr, '2026-07-14').catch(() => null)
    note('17-phone-world', 'phone', 'Tue 14 Jul in the reopened world: ' + JSON.stringify(fact))
    if (!(fact || []).some(b => /^PERS\|/.test(b))) throw new Error('the phone world did not carry the fixture')
    await H.warOpen(m, mr, '2026-07-13')
    const phone = []
    for (const [kind, iso, , want] of plan) phone.push({ kind, want, cell: await H.cellBoxes(m, mr, iso) })
    note('17-phone', 'phone', JSON.stringify(phone))
    await H.warPic(m, 'c-17-phone-war', mr, plan.map(p => p[1]))
    for (const [kind, iso] of plan) { await m.page.locator(T(L.cellId(mr, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await m.page.waitForTimeout(250); await H.pic(m, 'c-17-phone-' + kind.toLowerCase(), [T(L.cellId(mr, iso))], { pad: 14, scale: 'device' }) }
    const fits = phone.every(p => p.cell && p.cell.length && !/OVERFLOW/.test(p.cell.join('')))
    L.rec('17-phone', 'phone', fits ? 'PASS?' : 'FAIL?', phone.map(p => `${p.kind}: ${p.cell}`).join(' · '), ['c-17-phone-war', 'c-17-phone-meeting', 'c-17-phone-personal', 'c-17-phone-appointment', 'c-17-phone-duty', 'c-17-phone-event'])
    note('errors-17-phone', 'phone', JSON.stringify(m.errs))
  })
  await m.ctx.close()
  note('errors-17', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

H.saveLog('c-run.json')
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
