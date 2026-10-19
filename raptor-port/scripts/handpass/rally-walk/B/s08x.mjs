console.log('B s08x v1 (follow-ups: + Wave, dots menu baseline vs after a changed box; undo/redo)')
import { launch, open, sleep, shot, tap, rec, bfld, model, finish } from './lib.mjs'
const b = await launch()
const goBoard = async (p, d) => { await p.evaluate(() => window.go('editsched')); await sleep(800); await p.evaluate(x => window.openScheduler(x), d); await p.waitForSelector('#schedBoard'); await sleep(900) }
const changeBoard = async p => { await tap(p, bfld(p, 'ff:3.0.0.rl')); await p.keyboard.type('0930'); await sleep(150) }
const nWave = p => p.evaluate(() => window.DAYS[3].waves.length)
const menuVis = p => p.evaluate(() => ({ sort: (() => { const s = document.getElementById('sbSortAll'); return !!s && s.offsetParent !== null })(), more: document.getElementById('sbMore')?.className, expanded: document.getElementById('sbMore')?.getAttribute('aria-expanded') }))
let ctx, p
/* baseline: + Wave with no changed box */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
let w0 = await nWave(p)
await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(500)
let w1 = await nWave(p)
rec('X1', 'board baseline: "+ Wave", no box changed', 'one wave added', { before: w0, after: w1 }, w1 === w0 + 1 ? 'PASS' : 'FAIL', await shot(p, 'B08x-X1'))
await ctx.close()
/* after changed box, + Wave pressed once, then a second press */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
w0 = await nWave(p); await changeBoard(p)
await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(500)
w1 = await nWave(p)
const rl1 = (await model(p, 3, 0, 0)).rl
await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(500)
const w2 = await nWave(p)
rec('X2', 'board: change R, press "+ Wave", then press it again', 'first press adds one wave', { before: w0, afterFirst: w1, afterSecond: w2, rlAfterFirst: rl1 }, w1 === w0 + 1 ? 'PASS' : 'FAIL', await shot(p, 'B08x-X2'))
await ctx.close()
/* after changed box, + Wave pressed with the box left by tapping a heading first */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
w0 = await nWave(p); await changeBoard(p)
await tap(p, p.locator('#sbDay'), { block: 'start' }); await sleep(300)
await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(500)
w1 = await nWave(p)
rec('X3', 'board: change R, LEAVE by a heading tap, then "+ Wave"', 'one wave added (control)', { before: w0, after: w1 }, w1 === w0 + 1 ? 'PASS' : 'FAIL')
await ctx.close()
/* dots menu baseline */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
await tap(p, p.locator('#sbMore'), { block: 'nearest' }); await sleep(400)
const mv = await menuVis(p)
rec('X4', 'board baseline: tap the dots button, no box changed', 'RECORD what opens (Sort all visible?)', mv, 'RECORD', await shot(p, 'B08x-X4'))
await ctx.close()
/* dots menu after change */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
await changeBoard(p)
await tap(p, p.locator('#sbMore'), { block: 'nearest' }); await sleep(400)
const mv2 = await menuVis(p)
rec('X5', 'board: change R, then tap the dots button', 'same as the baseline', mv2, 'RECORD', await shot(p, 'B08x-X5'))
await ctx.close()
/* undo then redo enabled */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
await changeBoard(p)
const redoBefore = await p.evaluate(() => document.getElementById('sbRedo').disabled)
await tap(p, p.locator('#sbUndo'), { block: 'nearest' }); await sleep(400)
const st = await p.evaluate(() => ({ undoDis: document.getElementById('sbUndo').disabled, redoDis: document.getElementById('sbRedo').disabled }))
rec('X6', 'board: change R, Undo once', 'R undone and Redo enabled (the save happened, then one undo)', { redoBefore, afterUndo: st, rl: (await model(p, 3, 0, 0)).rl }, st.redoDis === false && !(await model(p, 3, 0, 0)).rl ? 'PASS' : 'FAIL')
await ctx.close()
/* week undo + redo enabled */
;({ ctx, p } = await open(b)); await p.evaluate(() => window.go('editsched')); await sleep(800)
await tap(p, p.locator('#eWeek .day[data-day="3"] [data-txt="ff:3.0.0.rl"]')); await p.keyboard.type('0930')
await tap(p, p.locator('#undoBtn'), { block: 'nearest' }); await sleep(400)
const st2 = await p.evaluate(() => ({ undoDis: document.getElementById('undoBtn').disabled, redoDis: document.getElementById('redoBtn').disabled }))
rec('X7', 'week: change R, Undo once', 'R undone and Redo enabled', { afterUndo: st2, rl: (await model(p, 3, 0, 0)).rl }, st2.redoDis === false && !(await model(p, 3, 0, 0)).rl ? 'PASS' : 'FAIL')
/* redo: change another box then press Redo */
await tap(p, p.locator('#eWeek .day[data-day="3"] [data-txt="ff:3.0.0.br"]')); await p.keyboard.type('1000')
await tap(p, p.locator('#redoBtn'), { block: 'nearest' }); await sleep(500)
const mr = await model(p, 3, 0, 0)
rec('X8', 'week: after the Undo, type B 1000 (not left), press Redo', 'RECORD: B saved, Redo does what', { rl: mr.rl, br: mr.br, redoDis: await p.evaluate(() => document.getElementById('redoBtn').disabled) }, 'RECORD')
await ctx.close()
await b.close()
await finish('s08x')
