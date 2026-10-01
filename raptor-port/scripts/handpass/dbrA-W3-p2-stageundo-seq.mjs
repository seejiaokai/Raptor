/* W3 probe 2 — part D's 9-R1 sequence, then the stage move and its Undo, printing every field of the war's row that
   differs between "just before the stage move" and "after its Undo" (and after a reload). */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p2-stageundo-seq.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, stageGo, stageNow, topHist, bidOn, tapCell, sheetPress, sheetNow, closeSheets, at, banner, pic } = W
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
await L.signIn(page, 'a'); await L.settle(page)
const K = 'leavewar/war:y2026'
const raw = async () => (await L.rows(page))[K]
const diffObj = (a, b) => { const out = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = JSON.stringify(a[k]), y = JSON.stringify(b[k]); if (x !== y) { if (k === 'days' && Array.isArray(a[k]) && Array.isArray(b[k])) { for (let i = 0; i < Math.max(a[k].length, b[k].length); i++) { const p = JSON.stringify(a[k][i]), q = JSON.stringify(b[k][i]); if (p !== q) out.push(`days[${i}]: ${p} → ${q}`) } } else out.push(`${k}: ${String(x).slice(0, 300)} → ${String(y).slice(0, 300)}`) } } return out }
const reload = async () => { await page.reload(); await L.signIn(page, 'a', { goto: false }); await lwOpen(page, '2026-01-05') }
const trace = []
const note = async (label) => { const r = await raw(); trace.push({ label, len: r.length }); return r }
await lwOpen(page, '2026-01-21')
let w = await note('boot')
await bidOn(page, 'taipan', '2026-01-21', 'LL'); await L.settle(page); await note('bid')
await topHist(page, 'undo'); await L.settle(page); await note('undo bid')
await reload(); await note('reload 1')
await bidOn(page, 'taipan', '2026-01-21', 'LL'); await L.settle(page)
await tapCell(page, 'taipan', '2026-01-21'); await sheetPress(page, 'decide-approve'); if ((await sheetNow(page)).open !== 'nothing') await closeSheets(page); await L.settle(page); await note('approve')
await topHist(page, 'undo'); await L.settle(page); await note('undo approve')
await reload(); await note('reload 2')
await bidOn(page, 'beams', '2026-01-23', 'LL'); await L.settle(page)
await tapCell(page, 'beams', '2026-01-23'); await sheetPress(page, 'decide-shift')
{ const c = page.locator('[data-testid="cell-beams-2026-01-26"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); const pt = await at(page, 'cell-beams-2026-01-26'); await page.mouse.click(pt.x, pt.y); await L.sleep(700) }
await L.settle(page); await note('move')
await topHist(page, 'undo'); await L.settle(page); await note('undo move')
await reload(); await lwOpen(page, '2026-01-05')
const before = await note('before stage')
await stageGo(page, 'advance'); await L.settle(page); await note('stage closed')
await topHist(page, 'undo'); await L.settle(page)
const after = await note('after undo')
console.log('trace of the stored war row (length):', JSON.stringify(trace))
const mean = raw => { const w = JSON.parse(raw); return { ...w, days: (w.days || []).map(d => ({ ...d, eventKinds: d.eventKinds || [] })) } }
const dm = diffObj(mean(before), mean(after))
console.log('with a missing eventKinds read as [] — what still differs:', dm.length, JSON.stringify(dm.slice(0, 20), null, 1))
const d = diffObj(JSON.parse(before), JSON.parse(after))
console.log('before stage move vs after its Undo — same bytes:', before === after, '\n', d.slice(0, 20).join('\n '))
await reload()
const again = await raw()
console.log('after a reload vs after the Undo — same bytes:', again === after, 'stage:', await stageNow(page))
L.check('the war row after the stage Undo equals the row before the stage move', before === after, d.slice(0, 10))
L.check('probe errors', !errors.length, errors)
L.save({ trace, diff: d })
await browser.close()
