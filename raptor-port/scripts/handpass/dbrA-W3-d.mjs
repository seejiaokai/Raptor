/* W3 part D — the Leave War's Undo and Redo (the top bar's ↶ / ↷, the one timeline — D347, D352), desktop 1440×900,
   one fresh demo world, the admin. Four gestures: a bid, a decision (Approve), a move (of a pending bid) and a stage move.
   Every Undo and every Redo is its own L.step (the rows it wrote, named by its batch) AND is checked against a load:
     ROUND 1 (Undo then a REAL reload) — the gesture, ↶, reload: what came back is the state before the gesture.
     ROUND 2 (Undo, then Redo) — the gesture, ↶ (checked by a FRESH PAGE in the same browser — a real reload would empty
             the Undo list the Redo needs), ↷, then a REAL reload.
   Run from scripts/handpass:  node dbrA-W3-d.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-d.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, cells, recsAt, lwReload, peerRead, stageNow, stageGo, topHist, pic, row, rowsSummary, banner, at } = W
const EL = /^settings\/elog:/
const REC = /^leavewar\/rec:y2026:/
const WARROW = /^leavewar\/war:y2026$/

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `D-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
  }
}
const focusCell = async (pid, iso) => { await lwOpen(page, iso); const c = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first(); if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300) } }
const approve = async (pid, iso) => { const t = await tapCell(page, pid, iso); const p = await sheetPress(page, 'decide-approve'); const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page); return { opened: t.open, pressed: p.pressed } }
async function move(pid, from, to) {
  const t = await tapCell(page, pid, from)
  const p = await sheetPress(page, 'decide-shift')
  const c = page.locator(`[data-testid="cell-${pid}-${to}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
  const pt = await at(page, `cell-${pid}-${to}`)
  await page.mouse.click(pt.x, pt.y); await L.sleep(700)
  if (await banner(page) && await page.locator('[data-testid="move-confirm"]:visible').count()) { await page.locator('[data-testid="move-confirm"]:visible').click(); await L.sleep(700) }
  return { opened: t.open, pressed: p.pressed, bannerEnd: await banner(page) }
}
const U = async () => topHist(page, 'undo'), RD = async () => topHist(page, 'redo')
/* THE WAR ROW, COMPARED BY MEANING (probes p1/p2, 30 Sep 26): a war row saved by the first boot has no `eventKinds` on
   its days; once the war has been READ back at a load, every day carries `eventKinds: []` (store.ts readWars), so the
   first war-row write after a load stores the longer form — and an Undo writes back the loaded form, not the boot's
   bytes. The two say the same thing (no tag on any day); that one difference is set aside, nothing else. */
const canon = x => Array.isArray(x) ? '[' + x.map(canon).join(',') + ']' : x && typeof x === 'object' ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}' : JSON.stringify(x)
/* …and the order of a day's fields (the read form puts `eventKinds` after `events`, the boot form has none) — compared
   field by field, whatever order they are written in (probe p2: nothing else differs) */
const warMeaning = raw => { if (!raw) return raw; const w = JSON.parse(raw); return canon({ ...w, days: (w.days || []).map(d => ({ ...d, eventKinds: d.eventKinds || [] })) }) }

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('D0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'D0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}

/* ================= ROUND 1: gesture, Undo, REAL reload ================= */
const A1 = 'taipan', A1D = '2026-01-21'      // Cobra, Wed 21 Jan
await run('9-R1 bid', async () => {
  const k0 = L.results.length
  await lwOpen(page, A1D)
  const g = await L.step(page, '9-R1 a bid (LL) on Cobra, 21 Jan', async () => bidOn(page, A1, A1D, 'LL'), { put: [REC], only: true })
  const key = g.put.find(k => REC.test(k))
  const u = await L.step(page, '9-R1 ↶ Undo the bid', U, { del: [REC], also: [EL], only: true })
  L.check('9-R1 bid Undo — exactly the bid\'s row removed', u.del.length === 1 && u.del[0] === key && u.ret.pressed, { del: u.del, put: u.put, ret: u.ret })
  await focusCell(A1, A1D); await pic(page, 'D-R1-bid-undone')
  const rr = await lwReload(page, '9-R1 bid Undo', 'a', [[A1, A1D]])
  await focusCell(A1, A1D); await pic(page, 'D-R1-bid-undo-after-reload')
  L.check('9-R1 bid Undo — after the reload the day is empty', (rr.after[`${A1}@${A1D}`] || {}).text === '', rr.after)
  row({ step: '9-R1 bid → Undo → reload', width: 'desktop', did: 'Cobra 21 Jan LL; top bar ↶', screen: JSON.stringify(rr.after), rows: `bid: ${rowsSummary(g)} || undo: ${rowsSummary(u)}`, ok: passNow(k0) })
})
await run('9-R1 decision', async () => {
  const k0 = L.results.length
  const g0 = await L.step(page, '9-R1 a bid on Cobra 21 Jan again', async () => bidOn(page, A1, A1D, 'LL'), { put: [REC], only: true })
  const key = g0.put.find(k => REC.test(k))
  const r0 = await L.rows(page)
  const g = await L.step(page, '9-R1 Approve it', async () => approve(A1, A1D), { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  const iid = g.put.find(k => k.startsWith('inputs/'))
  const u = await L.step(page, '9-R1 ↶ Undo the approval', U, { put: [REC], del: [/^inputs\//], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R1 decision Undo — the bid\'s row back (same row, same bytes) and the request row removed', u.put.includes(key) && u.del.includes(iid) && r1[key] === r0[key], { put: u.put, del: u.del, same: r1[key] === r0[key] })
  await focusCell(A1, A1D); await pic(page, 'D-R1-decision-undone')
  const rr = await lwReload(page, '9-R1 decision Undo', 'a', [[A1, A1D]])
  const t = await tapCell(page, A1, A1D); await pic(page, 'D-R1-decision-undo-after-reload'); await closeSheets(page)
  L.check('9-R1 decision Undo — after the reload it is a bid again (the sheet offers Approve)', t.open === 'bid-picker' && t.buttons.some(b => /decide-approve/.test(b)) && /LL/.test((rr.after[`${A1}@${A1D}`] || {}).text || ''), { open: t.open, cell: rr.after })
  row({ step: '9-R1 decision → Undo → reload', width: 'desktop', did: 'Cobra 21 Jan: Approve; top bar ↶', screen: `${JSON.stringify(rr.after)}; tap → ${t.open}`, rows: `approve: ${rowsSummary(g)} || undo: ${rowsSummary(u)}`, ok: passNow(k0) })
})
const A3 = 'beams', A3D = '2026-01-23', A3T = '2026-01-26'   // Comet, Fri 23 Jan → Mon 26 Jan
await run('9-R1 move', async () => {
  const k0 = L.results.length
  const g0 = await L.step(page, '9-R1 a bid on Comet 23 Jan', async () => bidOn(page, A3, A3D, 'LL'), { put: [REC], only: true })
  const key = g0.put.find(k => REC.test(k))
  const r0 = await L.rows(page)
  const g = await L.step(page, '9-R1 ⇄ Move it to 26 Jan', async () => move(A3, A3D, A3T), { put: [REC], also: [EL], only: true })
  const u = await L.step(page, '9-R1 ↶ Undo the move', U, { put: [REC], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R1 move — the move and its Undo each ONE put of the same row; after Undo the row reads as before the move', g.put.filter(k => REC.test(k)).join() === key && u.put.filter(k => REC.test(k)).join() === key && !g.del.length && !u.del.length && r1[key] === r0[key], { move: g.put, undo: u.put, same: r1[key] === r0[key] })
  const rr = await lwReload(page, '9-R1 move Undo', 'a', [[A3, A3D], [A3, A3T]])
  await focusCell(A3, A3D); await pic(page, 'D-R1-move-undo-after-reload')
  L.check('9-R1 move Undo — after the reload the bid is back on 23 Jan, 26 Jan empty', /LL/.test((rr.after[`${A3}@${A3D}`] || {}).text || '') && (rr.after[`${A3}@${A3T}`] || {}).text === '', rr.after)
  row({ step: '9-R1 move → Undo → reload', width: 'desktop', did: 'Comet 23 Jan: ⇄ Move to 26 Jan; top bar ↶', screen: JSON.stringify(rr.after), rows: `move: ${rowsSummary(g)} || undo: ${rowsSummary(u)}`, ok: passNow(k0) })
})
await run('9-R1 stage', async () => {
  const k0 = L.results.length
  await lwOpen(page, '2026-01-05')
  const r0 = await L.rows(page)
  const g = await L.step(page, '9-R1 stage → BIDDING CLOSED', async () => stageGo(page, 'advance'), { put: [WARROW], only: true })
  const u = await L.step(page, '9-R1 ↶ Undo the stage move', async () => { const r = await U(); const toast = await page.locator('.toast, [role="status"], [data-testid*="toast"]').allInnerTexts().catch(() => []); return { ...r, toast } }, { put: [WARROW], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R1 stage Undo — the war\'s row back exactly as before the stage move; open again', warMeaning(r1['leavewar/war:y2026']) === warMeaning(r0['leavewar/war:y2026']) && /OPEN/i.test(await stageNow(page)), { ret: u.ret, now: await stageNow(page) })
  await pic(page, 'D-R1-stage-undone')
  const rr = await lwReload(page, '9-R1 stage Undo', 'a', [])
  const st = await stageNow(page)
  await pic(page, 'D-R1-stage-undo-after-reload')
  L.check('9-R1 stage Undo — after the reload the war is open for bidding', /OPEN/i.test(st), st)
  row({ step: '9-R1 stage → Undo → reload', width: 'desktop', did: '→ BIDDING CLOSED; top bar ↶', screen: `stage ${st}`, rows: `stage: ${rowsSummary(g)} || undo: ${rowsSummary(u)}`, ok: passNow(k0) })
})

/* ================= ROUND 2: gesture, Undo (a fresh page reads it), Redo, REAL reload ================= */
const B1 = 'glass', B1D = '2026-01-14'      // Basher, Wed 14 Jan
await run('9-R2 bid', async () => {
  const k0 = L.results.length
  await lwOpen(page, B1D)
  const g = await L.step(page, '9-R2 a bid (LL) on Basher, 14 Jan', async () => bidOn(page, B1, B1D, 'LL'), { put: [REC], only: true })
  const key = g.put.find(k => REC.test(k))
  const r0 = await L.rows(page)
  const u = await L.step(page, '9-R2 ↶ Undo the bid', U, { del: [REC], also: [EL], only: true })
  await peerRead(ctx, page, '9-R2 bid Undo', 'a', [[B1, B1D]], errors)
  const rd = await L.step(page, '9-R2 ↷ Redo the bid', RD, { put: [REC], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R2 bid — Undo removed its row; Redo put back the SAME row, same bytes', u.del.includes(key) && rd.put.includes(key) && r1[key] === r0[key], { undo: u.del, redo: rd.put, same: r1[key] === r0[key] })
  const rr = await lwReload(page, '9-R2 bid Redo', 'a', [[B1, B1D]])
  await focusCell(B1, B1D); await pic(page, 'D-R2-bid-redo-after-reload')
  row({ step: '9-R2 bid → Undo → Redo → reload', width: 'desktop', did: 'Basher 14 Jan LL; ↶ (fresh page read); ↷', screen: JSON.stringify(rr.after), rows: `undo: ${rowsSummary(u)} || redo: ${rowsSummary(rd)}`, ok: passNow(k0) })
})
await run('9-R2 decision', async () => {
  const k0 = L.results.length
  const r0 = await L.rows(page)
  const key = recsAt(r0, B1, B1D)[0]?.key
  const g = await L.step(page, '9-R2 Approve Basher\'s bid', async () => approve(B1, B1D), { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  const iid = g.put.find(k => k.startsWith('inputs/'))
  const rA = await L.rows(page)
  const u = await L.step(page, '9-R2 ↶ Undo the approval', U, { put: [REC], del: [/^inputs\//], also: [EL], only: true })
  await peerRead(ctx, page, '9-R2 decision Undo', 'a', [[B1, B1D]], errors)
  const rd = await L.step(page, '9-R2 ↷ Redo the approval', RD, { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R2 decision — Undo: the bid row back, the request gone; Redo: the SAME request row back (same id, same bytes), the bid row gone', u.put.includes(key) && u.del.includes(iid) && rd.put.includes(iid) && rd.del.includes(key) && r1[iid] === rA[iid], { undo: [u.put, u.del], redo: [rd.put, rd.del], sameReq: r1[iid] === rA[iid] })
  const rr = await lwReload(page, '9-R2 decision Redo', 'a', [[B1, B1D]])
  const t = await tapCell(page, B1, B1D); await pic(page, 'D-R2-decision-redo-after-reload'); await closeSheets(page)
  row({ step: '9-R2 decision → Undo → Redo → reload', width: 'desktop', did: 'Basher: Approve; ↶ (fresh page read); ↷', screen: `${JSON.stringify(rr.after)}; tap → ${t.open}`, rows: `approve: ${rowsSummary(g)} || undo: ${rowsSummary(u)} || redo: ${rowsSummary(rd)}`, ok: passNow(k0) })
})
const B3 = 'freak', B3D = '2026-01-16', B3T = '2026-01-19'   // Echo, Fri 16 Jan → Mon 19 Jan
await run('9-R2 move', async () => {
  const k0 = L.results.length
  const g0 = await L.step(page, '9-R2 a bid on Echo 16 Jan', async () => bidOn(page, B3, B3D, 'LL'), { put: [REC], only: true })
  const key = g0.put.find(k => REC.test(k))
  const g = await L.step(page, '9-R2 ⇄ Move it to 19 Jan', async () => move(B3, B3D, B3T), { put: [REC], also: [EL], only: true })
  const rM = await L.rows(page)
  const u = await L.step(page, '9-R2 ↶ Undo the move', U, { put: [REC], also: [EL], only: true })
  await peerRead(ctx, page, '9-R2 move Undo', 'a', [[B3, B3D], [B3, B3T]], errors)
  const rd = await L.step(page, '9-R2 ↷ Redo the move', RD, { put: [REC], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R2 move — move, Undo and Redo each ONE put of the same row; after Redo it reads as after the move', [g, u, rd].every(x => x.put.filter(k => REC.test(k)).join() === key && !x.del.length) && r1[key] === rM[key], { g: g.put, u: u.put, rd: rd.put })
  const rr = await lwReload(page, '9-R2 move Redo', 'a', [[B3, B3D], [B3, B3T]])
  await focusCell(B3, B3T); await pic(page, 'D-R2-move-redo-after-reload')
  row({ step: '9-R2 move → Undo → Redo → reload', width: 'desktop', did: 'Echo 16 Jan: ⇄ Move to 19 Jan; ↶ (fresh page read); ↷', screen: JSON.stringify(rr.after), rows: `move: ${rowsSummary(g)} || undo: ${rowsSummary(u)} || redo: ${rowsSummary(rd)}`, ok: passNow(k0) })
})
await run('9-R2 stage', async () => {
  const k0 = L.results.length
  await lwOpen(page, '2026-01-05')
  const g = await L.step(page, '9-R2 stage → BIDDING CLOSED', async () => stageGo(page, 'advance'), { put: [WARROW], only: true })
  const rS = await L.rows(page)
  const u = await L.step(page, '9-R2 ↶ Undo the stage move', U, { put: [WARROW], also: [EL], only: true })
  await peerRead(ctx, page, '9-R2 stage Undo', 'a', [], errors)
  const pst = await stageNow(page)
  const rd = await L.step(page, '9-R2 ↷ Redo the stage move', RD, { put: [WARROW], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('9-R2 stage — Undo back to open, Redo closed again: the war\'s row as after the stage move', /OPEN/i.test(pst) && warMeaning(r1['leavewar/war:y2026']) === warMeaning(rS['leavewar/war:y2026']) && /CLOSED/i.test(await stageNow(page)), { afterUndo: pst, now: await stageNow(page) })
  const rr = await lwReload(page, '9-R2 stage Redo', 'a', [])
  const st = await stageNow(page)
  await pic(page, 'D-R2-stage-redo-after-reload')
  L.check('9-R2 stage Redo — after the reload the war reads BIDDING CLOSED', /CLOSED/i.test(st), st)
  row({ step: '9-R2 stage → Undo → Redo → reload', width: 'desktop', did: '→ BIDDING CLOSED; ↶ (fresh page read); ↷', screen: `stage ${st}`, rows: `stage: ${rowsSummary(g)} || undo: ${rowsSummary(u)} || redo: ${rowsSummary(rd)}`, ok: passNow(k0) })
})

L.check('part D — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
