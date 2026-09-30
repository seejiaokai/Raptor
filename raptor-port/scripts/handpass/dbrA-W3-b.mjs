/* W3 part B — the Leave War, desktop 1440×900, one fresh demo world.
     5   the member (Ranger, us/us) while bidding is open: a bid on his own row → his record row; reload (as him)
     6   TWO TABS, one browser (one storage): A (Saber) approves one man's bid while B (Saber, opened BEFORE A's change and
         never reloaded) places a bid for a DIFFERENT man on another day → reload both → both there, in memory and in rows.
     6b  the same with B = the member (Ranger) bidding on his own row while A approves.
   Run from scripts/handpass:  node dbrA-W3-b.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-b.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, cells, recsAt, lwReload, pic, row, rowsSummary } = W
const EL = /^settings\/elog:/
const REC = /^leavewar\/rec:y2026:/

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, pg, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(pg, `B-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(pg).catch(() => {})
  }
}
const focusCell = async (pg, pid, iso) => { await lwOpen(pg, iso); const c = pg.locator(`[data-testid="cell-${pid}-${iso}"]`).first(); if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300) } }

/* ============ B0 the first boot (Ranger signs in first) ============ */
await L.signIn(A, 'm')
await L.settle(A)
{
  const r0 = await L.rows(A)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('B0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'B0 first boot', width: 'desktop', did: 'fresh world, signed in as Ranger (member)', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}

/* ============ 5 the member bids on his own row ============ */
const ME = 'bane', D5 = '2026-02-17'   // Ranger, Tue 17 Feb
await run('5 member bid', A, async () => {
  const k0 = L.results.length
  await lwOpen(A, D5)
  const a = await L.step(A, '5 Ranger (member) bids LL on his own row, Tue 17 Feb', async () => bidOn(A, ME, D5, 'LL'), { put: [REC], only: true })
  const recs = a.put.filter(k => REC.test(k))
  L.check('5 — ONE record row, his, pending; no history line (a member\'s own bid is not a line — D263)', recs.length === 1 && !a.del.length && a.batches.length === 1, { put: a.put, batches: a.batches, ret: a.ret })
  const r = await L.rows(A)
  const rec = recs[0] && r[recs[0]] ? JSON.parse(r[recs[0]]) : null
  L.check('5 — the stored record is Ranger\'s, 17 Feb, a pending LL bid', rec && rec.pid === ME && rec.date === D5 && rec.state === 'pending' && /LL/.test(rec.code), rec)
  await focusCell(A, ME, D5); await pic(A, 'B-5-member-bid')
  const rr = await lwReload(A, '5 member bid', 'm', [[ME, D5]])
  await focusCell(A, ME, D5); await pic(A, 'B-5-after-reload')
  row({ step: '5 member bid', width: 'desktop', did: 'Ranger signed in, tapped his 17 Feb, LL', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

/* ============ 6 two tabs: A approves, B (stale) bids for another man ============ */
await A.reload(); await L.signIn(A, 'a', { goto: false })
const X = 'snap', DX = '2026-02-03', Y = 'pump', DY = '2026-02-12'   // Cinch 3 Feb (A approves), Piston 12 Feb (B bids)
let xKey = null
await run('6 two tabs', A, async () => {
  const k0 = L.results.length
  await lwOpen(A, DX)
  const a0 = await L.step(A, '6 (A) a bid for Cinch, Tue 3 Feb', async () => bidOn(A, X, DX, 'LL'), { put: [REC], only: true })
  xKey = a0.put.find(k => REC.test(k))
  /* B opens NOW — after the bid, before the approval — and is never reloaded until the end */
  const B = await W.newPage(ctx, errors, 'B')
  await L.signIn(B, 'a')
  await lwOpen(B, DY)
  const bSawX = await cells(B, [[X, DX]])
  const a1 = await L.step(A, '6 (A) Approve Cinch\'s bid', async () => {
    await tapCell(A, X, DX); const p = await sheetPress(A, 'decide-approve')
    const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A)
    return p.pressed
  }, { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  const iid = a1.put.find(k => k.startsWith('inputs/'))
  await focusCell(A, X, DX); await pic(A, 'B-6-A-approved')
  const rMid = await L.rows(A)
  const b1 = await L.step(B, '6 (B, not reloaded) a bid for Piston, Thu 12 Feb', async () => bidOn(B, Y, DY, 'LL'), { put: [REC], only: true })
  const yKey = b1.put.find(k => REC.test(k))
  const rEnd = await L.rows(B)
  L.check('6 — B wrote ONLY its own new record row: Cinch\'s bid row NOT brought back, the approved request NOT removed', b1.put.length === 1 && yKey && yKey !== xKey && !b1.del.length && !(xKey in rEnd) && iid in rEnd && rEnd[iid] === rMid[iid], { bPut: b1.put, bDel: b1.del, xKeyBack: xKey in rEnd, iidKept: iid in rEnd })
  await focusCell(B, Y, DY); await pic(B, 'B-6-B-bid')
  /* reload both: before it, each tab lacks the other's change by design; after it, both read the same and hold both */
  const rr = await W.reloadBoth(A, 'a', B, 'a', '6 two tabs', [[X, DX], [Y, DY]])
  await focusCell(A, X, DX); await pic(A, 'B-6-A-after-reload')
  await focusCell(B, Y, DY); await pic(B, 'B-6-B-after-reload')
  const q = W.inpDate(DX)
  const inA = await A.evaluate(([p, d]) => window.INPUTS.filter(r => r.person === p && r.date === d && r.yr === 2026).map(r => `${r.type}/${r.iid}`), [X, q])
  const inB = await B.evaluate(([p, d]) => window.INPUTS.filter(r => r.person === p && r.date === d && r.yr === 2026).map(r => `${r.type}/${r.iid}`), [X, q])
  const yA = await tapCell(A, Y, DY); await pic(A, 'B-6-A-piston-sheet'); await closeSheets(A)
  L.check('6 — after reloading both: Cinch\'s approved leave (ONE request on the Inputs page, its row stored, the bid row gone) AND Piston\'s bid (its row stored, the sheet a bid), in both tabs', inA.length === 1 && inB.length === 1 && iid in rr.rows && !(xKey in rr.rows) && yKey in rr.rows && /LL/.test(rr.cB[`${Y}@${DY}`].text) && /LL/.test(rr.cB[`${X}@${DX}`].text) && /Approve/.test(yA.text || ''), { inA, inB, cells: rr.cB, pistonSheet: (yA.text || '').slice(0, 160), bSawXBefore: bSawX })
  row({ step: '6 two tabs (A approve, B bid)', width: 'desktop', did: 'A: bid Cinch 3 Feb; B opened; A: Approve; B (stale): bid Piston 12 Feb; reload both', screen: `A and B: ${JSON.stringify(rr.cA)}; Cinch's request in INPUTS: A ${inA.join()} B ${inB.join()}`, rows: `A approve: ${rowsSummary(a1)} || B bid: ${rowsSummary(b1)}`, ok: passNow(k0) })
  await B.close()
})

/* ============ 6b two tabs: A approves while B = the member bids on his own row ============ */
const X2 = 'mamba', DX2 = '2026-02-24', D6 = '2026-02-26'   // Sidewinder 24 Feb (A approves), Ranger 26 Feb (B bids)
await run('6b two tabs member', A, async () => {
  const k0 = L.results.length
  await lwOpen(A, DX2)
  const a0 = await L.step(A, '6b (A) a bid for Sidewinder, Tue 24 Feb', async () => bidOn(A, X2, DX2, 'LL'), { put: [REC], only: true })
  const key = a0.put.find(k => REC.test(k))
  const B = await W.newPage(ctx, errors, 'B2')
  await L.signIn(B, 'm')
  await lwOpen(B, D6)
  const a1 = await L.step(A, '6b (A) Approve Sidewinder\'s bid', async () => {
    await tapCell(A, X2, DX2); const p = await sheetPress(A, 'decide-approve')
    const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A)
    return p.pressed
  }, { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  const iid = a1.put.find(k => k.startsWith('inputs/'))
  const b1 = await L.step(B, '6b (B = Ranger, not reloaded) bids LL on his own row, Thu 26 Feb', async () => bidOn(B, ME, D6, 'LL'), { put: [REC], only: true })
  const rEnd = await L.rows(B)
  L.check('6b — B wrote ONLY its own record row; A\'s approval (the bid gone, the request filed) stands', b1.put.length === 1 && !b1.del.length && !(key in rEnd) && iid in rEnd, { bPut: b1.put, keyBack: key in rEnd, iidKept: iid in rEnd })
  const bKey = b1.put.find(k => REC.test(k))
  const rr = await W.reloadBoth(A, 'a', B, 'm', '6b two tabs', [[X2, DX2], [ME, D6]])
  await focusCell(A, ME, D6); await pic(A, 'B-6b-A-after-reload')
  await focusCell(B, X2, DX2); await pic(B, 'B-6b-B-after-reload')
  const q = W.inpDate(DX2)
  const inA = await A.evaluate(([p, d]) => window.INPUTS.filter(r => r.person === p && r.date === d && r.yr === 2026).length, [X2, q])
  const inB = await B.evaluate(([p, d]) => window.INPUTS.filter(r => r.person === p && r.date === d && r.yr === 2026).length, [X2, q])
  L.check('6b — after reloading both: Sidewinder\'s approved request and Ranger\'s bid both there, in both tabs', inA === 1 && inB === 1 && iid in rr.rows && !(key in rr.rows) && bKey in rr.rows && /LL/.test((rr.cA[`${ME}@${D6}`] || {}).text || '') && /LL/.test((rr.cB[`${X2}@${DX2}`] || {}).text || ''), { inA, inB, a: rr.cA, b: rr.cB })
  row({ step: '6b two tabs (A approve, B = member bid)', width: 'desktop', did: 'A: bid Sidewinder 24 Feb; B (Ranger) opened; A: Approve; B (stale): his own bid 26 Feb; reload both', screen: `A: ${JSON.stringify(rr.cA)} · B: ${JSON.stringify(rr.cB)}`, rows: `A approve: ${rowsSummary(a1)} || B bid: ${rowsSummary(b1)}`, ok: passNow(k0) })
  await B.close()
})

L.check('part B — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
