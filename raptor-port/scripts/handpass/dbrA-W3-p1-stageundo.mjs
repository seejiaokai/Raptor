/* W3 probe — what differs in the war's row after a stage move and its Undo (part D's 9-R1 stage FAIL). A fresh world,
   the admin: read `leavewar/war:y2026`; → BIDDING CLOSED; ↶ Undo; read it again; print every field that differs;
   reload and read it once more (what the next load reads). Also the same for a Redo. */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p1-stageundo.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, stageGo, stageNow, topHist, pic } = W
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
await L.signIn(page, 'a'); await L.settle(page)
await lwOpen(page, '2026-01-05')
const K = 'leavewar/war:y2026'
const read = async () => JSON.parse((await L.rows(page))[K])
const diffObj = (a, b) => { const out = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = JSON.stringify(a[k]), y = JSON.stringify(b[k]); if (x !== y) out.push(`${k}: ${String(x).slice(0, 200)} → ${String(y).slice(0, 200)}`) } return out }
const w0 = await read(); const raw0 = (await L.rows(page))[K]
const g = await L.step(page, 'P1 stage → CLOSED', async () => stageGo(page, 'advance'))
const w1 = await read()
console.log('stage move changed:', diffObj(w0, w1))
const u = await L.step(page, 'P1 ↶ Undo', async () => topHist(page, 'undo'))
const w2 = await read(); const raw2 = (await L.rows(page))[K]
console.log('after Undo vs before the move:', diffObj(w0, w2), 'same bytes:', raw0 === raw2, 'same JSON (key order aside):', JSON.stringify(w0) === JSON.stringify(w2))
console.log('key order before:', Object.keys(w0).join(','), '\nkey order after :', Object.keys(w2).join(','))
const rd = await L.step(page, 'P1 ↷ Redo', async () => topHist(page, 'redo'))
const w3 = await read()
console.log('after Redo vs after the move:', diffObj(w1, w3), 'same bytes:', JSON.stringify(w1) === JSON.stringify(w3))
await page.reload(); await L.signIn(page, 'a', { goto: false }); await lwOpen(page, '2026-01-05')
console.log('after reload the stage reads', await stageNow(page))
await pic(page, 'P1-stage-after-redo-reload')
L.check('probe errors', !errors.length, errors)
L.save({ diffs: { move: diffObj(w0, w1), undo: diffObj(w0, w2), redo: diffObj(w1, w3) } })
await browser.close()
