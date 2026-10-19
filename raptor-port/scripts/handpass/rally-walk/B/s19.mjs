console.log('B s19 v1 (phone, finger focus then keyboard Tab order)')
import { launch, open, sleep, shot, elShot, tap, rec, wk, bfld, ceState, inState, model, finish } from './lib.mjs'
const b = await launch()
const act = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset?.txt || a.dataset?.bfld || a.tagName + '.' + a.className.toString().slice(0, 20)) : 'none' })
let ctx, p
/* week */
;({ ctx, p } = await open(b)); await p.evaluate(() => window.go('editsched')); await sleep(800)
await tap(p, wk(p, 3, 'ff:3.0.0.cs'))
const seq = [await act(p)]
for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); await sleep(200); seq.push(await act(p)) }
const want = ['ff:3.0.0.cs', 'ff:3.0.0.msn', 'ff:3.0.0.rl', 'ff:3.0.0.br', 'ff:3.0.0.to', 'ff:3.0.0.ld']
const m = await model(p, 3, 0, 0)
const rS = await ceState(wk(p, 3, 'ff:3.0.0.rl')), bS = await ceState(wk(p, 3, 'ff:3.0.0.br'))
rec('S19a', 'week: finger on CS, then Tab x5', want.join(' > '), { seq, model: m, R: rS.text, B: bS.text }, JSON.stringify(seq) === JSON.stringify(want) && !m.rl && !m.br && rS.text === '' && bS.text === '' ? 'PASS' : 'FAIL', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B19a-week-tab'))
const back = [await act(p)]
for (let i = 0; i < 5; i++) { await p.keyboard.press('Shift+Tab'); await sleep(200); back.push(await act(p)) }
rec('S19b', 'week: Shift+Tab x5 from LD', want.slice().reverse().join(' > '), back, JSON.stringify(back) === JSON.stringify(want.slice().reverse()) ? 'PASS' : 'FAIL')
/* Enter on R */
await tap(p, wk(p, 3, 'ff:3.0.0.rl')); await p.keyboard.press('Enter'); await sleep(400)
const mE = await model(p, 3, 0, 0); const a2 = await act(p)
rec('S19c', 'week: tap R (placed) then Enter', 'RECORD: saved 09:45 and left the box?', { rl: mE.rl, active: a2 }, 'RECORD', await elShot(p, '#eWeek .day[data-day="3"] .go', 'B19c-week-enter'))
await ctx.close()
/* board */
;({ ctx, p } = await open(b)); await p.evaluate(() => window.go('editsched')); await sleep(700); await p.evaluate(() => window.openScheduler(3)); await p.waitForSelector('#schedBoard'); await sleep(900)
await tap(p, bfld(p, 'ff:3.0.0.cs'))
const s2 = [await act(p)]
for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); await sleep(200); s2.push(await act(p)) }
const want2 = ['ff:3.0.0.cs', 'ff:3.0.0.msn', 'ff:3.0.0.rl', 'ff:3.0.0.br', 'ff:3.0.0.to', 'ff:3.0.0.ld']
const mb = await model(p, 3, 0, 0)
const rb = await inState(bfld(p, 'ff:3.0.0.rl')), bb = await inState(bfld(p, 'ff:3.0.0.br'))
rec('S19d', 'board: finger on CS, then Tab x5', want2.join(' > '), { seq: s2, model: mb, R: rb.value, B: bb.value }, JSON.stringify(s2) === JSON.stringify(want2) && !mb.rl && !mb.br && rb.value === '' && bb.value === '' ? 'PASS' : 'FAIL', await shot(p, 'B19d-board-tab'))
const back2 = [await act(p)]
for (let i = 0; i < 5; i++) { await p.keyboard.press('Shift+Tab'); await sleep(200); back2.push(await act(p)) }
rec('S19e', 'board: Shift+Tab x5 from LD', want2.slice().reverse().join(' > '), back2, JSON.stringify(back2) === JSON.stringify(want2.slice().reverse()) ? 'PASS' : 'FAIL')
await ctx.close()
await b.close()
await finish('s19')
