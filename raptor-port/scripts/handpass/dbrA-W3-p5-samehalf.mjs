/* W3 probe 5 — two tabs bid the SAME man, the SAME day, the SAME half (the case the plan says "is kept in storage and
   not read"): A (Saber) bids Warden's whole 17 Mar as LL; B (Saber, opened before, not reloaded) bids the same whole
   day as OL. Reload both: what the grid and the day's sheet show, what storage holds, and whether a later edit of the
   shown one leaves the hidden one byte-for-byte. Reported, not judged against a ruling (the plan's own behaviour). */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p5-samehalf.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, recsAt, cells, pic, row, rowsSummary } = W
const REC = /^leavewar\/rec:/
const X = 'nact', D = '2026-03-17'
const errors = []
const browser = await L.launch(); const ctx = await L.context(browser)
const A = await W.newPage(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A); await lwOpen(A, D)
const B = await W.newPage(ctx, errors, 'B')
await L.signIn(B, 'a'); await lwOpen(B, D)
const a = await L.step(A, 'P5 (A) Warden 17 Mar, whole day LL', async () => bidOn(A, X, D, 'LL'), { put: [REC], only: true })
const b = await L.step(B, 'P5 (B, stale) Warden 17 Mar, whole day OL', async () => bidOn(B, X, D, 'OL'), { put: [REC], only: true })
for (const [p, who] of [[A, 'a'], [B, 'a']]) { await p.reload(); await L.signIn(p, who, { goto: false }); await lwOpen(p, D) }
const r = await L.rows(A)
const stored = recsAt(r, X, D).map(x => `${x.code}/${x.state}#${x.ord}(${x.key.slice(-6)})`)
const cA = await cells(A, [[X, D]]), cB = await cells(B, [[X, D]])
const t = await tapCell(A, X, D)
await pic(A, 'P5-same-half-after-both-reloaded')
await closeSheets(A)
console.log('stored:', stored, 'A shows', cA, 'B shows', cB, 'sheet', t.open, (t.text || '').slice(0, 200), t.lines)
L.check('P5 — both bids are kept in storage', stored.length === 2, stored)
L.check('P5 — both tabs show the same one', JSON.stringify(cA[`${X}@${D}`].text) === JSON.stringify(cB[`${X}@${D}`].text), { cA, cB })
row({ step: 'P5 two tabs, same man, same day, same half', width: 'desktop', did: 'B opened; A: Warden 17 Mar LL; B (stale): the same day OL; reload both', screen: `grid A "${cA[`${X}@${D}`].text}" B "${cB[`${X}@${D}`].text}"; tap → ${t.open} ${(t.text || '').slice(0, 80)}`, rows: `stored ${stored.join(' ')} || A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: stored.length === 2, pics: ['P5-same-half-after-both-reloaded.png'] })
L.check('probe 5 — no console errors', !errors.length, errors)
L.save({ table: W.TABLE, errors })
await browser.close()
