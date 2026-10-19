console.log('B s07 v1 (phone Edit Schedule week, finger)')
import { launch, open, sleep, shot, elShot, tap, rec, wk, ceState, model, finish } from './lib.mjs'
const b = await launch()
const goEdit = async p => { await p.evaluate(() => window.go('editsched')); await sleep(800) }
const leave = async p => { await tap(p, p.locator('#eWeek .day[data-day="3"] .day-head'), { block: 'start' }) }
let ctx, p
/* 7a: tap, placed+highlight, type replaces, leave saves */
;({ ctx, p } = await open(b)); await goEdit(p)
let R = wk(p, 3, 'ff:3.0.0.rl')
const pre = await ceState(R)
await tap(p, R)
const pl = await ceState(R)
rec('S7a', 'finger tap on empty week R (Thu VL)', 'placed 09:45 (TO 12:45 less 3h) highlighted whole', { before: pre, after: pl }, pl.text === '09:45' && pl.sel === '09:45' ? 'PASS' : 'FAIL', await shot(p, 'B07a-placed'))
await p.keyboard.type('0930'); await sleep(150)
const ty = await ceState(R)
rec('S7a2', 'type 0930', 'replaces the placed time', ty, /^(09:30|0930)$/.test(ty.text) ? 'PASS' : 'FAIL')
await leave(p); await sleep(400)
const m = await model(p, 3, 0, 0)
rec('S7a3', 'tap the day heading (leave)', 'saved 09:30; box shows 09:30', { rl: m.rl, box: await ceState(R) }, m.rl === '09:30' ? 'PASS' : 'FAIL', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B07a3-saved'))
/* 7e: clear the typed R and leave: does the faint suggestion come back? */
await tap(p, R)
await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); await sleep(100)
await leave(p); await sleep(500)
const cleared = await ceState(R); const m2 = await model(p, 3, 0, 0)
const bef = await R.evaluate(e => ({ content: getComputedStyle(e, '::before').content, color: getComputedStyle(e, '::before').color }))
rec('S7e', 'tap typed R, select all, Delete, leave', 'R cleared (model empty); the faint 09:45 returns inside the box', { model: m2.rl, box: cleared, before: bef }, !m2.rl && cleared.ph === '09:45' && cleared.text === '' && /sugbox/.test(cleared.cls) ? 'PASS' : 'FAIL', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B07e-cleared'))
await ctx.close()

/* 7b: Escape takes out a just-placed suggestion */
;({ ctx, p } = await open(b)); await goEdit(p)
R = wk(p, 3, 'ff:3.0.0.rl')
await tap(p, R); await p.keyboard.press('Escape'); await sleep(300)
const esc = await ceState(R); const m3 = await model(p, 3, 0, 0)
const undoDis = await p.evaluate(() => { const u = document.querySelector('#undoBtn, [data-undo], #bUndo, button[title^="Undo"]'); return u ? { id: u.id, disabled: u.disabled, cls: u.className } : 'no undo found' })
rec('S7b', 'tap R (placed), then Escape', 'box empty again, nothing saved, no Undo entry', { box: esc, rl: m3.rl, undo: undoDis }, esc.text === '' && !m3.rl ? 'PASS' : 'FAIL', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B07b-escape'))
await ctx.close()

/* 7d: R then B */
;({ ctx, p } = await open(b)); await goEdit(p)
R = wk(p, 3, 'ff:3.0.0.rl'); let B = wk(p, 3, 'ff:3.0.0.br')
await tap(p, R); await tap(p, B, { block: 'nearest' })
const bs = await ceState(B); const mm = await model(p, 3, 0, 0)
rec('S7d', 'tap R then at once B (Thu VL)', 'R saved 09:45; B placed 10:25 highlighted', { B: bs, model: mm }, bs.text === '10:25' && bs.sel === '10:25' && mm.rl === '09:45' ? 'PASS' : 'FAIL', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B07d-RthenB'))
await leave(p); await sleep(400)
const mm2 = await model(p, 3, 0, 0)
rec('S7d2', 'then leave', 'both saved', mm2, mm2.rl === '09:45' && mm2.br === '10:25' ? 'PASS' : 'FAIL')
await ctx.close()

/* 7f: tap R, phone ignores highlight, type */
;({ ctx, p } = await open(b)); await goEdit(p)
R = wk(p, 3, 'ff:3.0.0.rl')
await tap(p, R)
await p.evaluate(() => { const s = window.getSelection(); s.collapseToEnd() }); await sleep(100)
await p.keyboard.type('0955'); await sleep(150)
const f = await ceState(R)
rec('S7f', 'tap, selection collapsed to the end (simulated iOS), type 0955', 'replaces the placed 09:45', f, /^(09:55|0955)$/.test(f.text) ? 'PASS' : 'FAIL', await shot(p, 'B07f-collapsed-typed'))
await ctx.close()

/* 7g: View-only Sched: empty R blank, empty B prints the suggested brief; typed R shows */
;({ ctx, p } = await open(b)); await goEdit(p)
R = wk(p, 3, 'ff:3.0.0.rl')
await tap(p, R); await p.keyboard.type('0930'); await leave(p); await sleep(400)
await p.evaluate(() => window.go('viewsched')); await sleep(900)
const view = await p.evaluate(() => { const day = document.querySelector('#vWeek .day[data-day="3"]'); return [...day.querySelectorAll('.go:not(.sa) .form')].slice(0, 2).map(f => ({ r: f.querySelector('.bto .rl')?.textContent, rH: Math.round(f.querySelector('.bto .rl')?.getBoundingClientRect().height || 0), b: f.querySelector('.bto b')?.textContent, to: f.querySelector('.ld span')?.textContent })) })
rec('S7g', 'View-only Sched Thu wave 1: VL has typed R 09:30, RU empty', 'VL R 09:30; RU R blank; B prints the suggested brief in both', view, view[0].r === '09:30' && view[1].r === '' && view[1].b ? 'PASS' : 'FAIL', await elShot(p, '#vWeek .day[data-day="3"] .go', 'B07g-viewonly'))
await ctx.close()
await b.close()
await finish('s07')
