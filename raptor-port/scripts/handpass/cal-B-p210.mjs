/* P2-10 — no ordinary counters means zero under-manned counter days (D669). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const short = o => o.map(x => x.replace('fly-row-', '').replace('count-', '#')).join(' > ')
const um = () => B.txt(B.tid(w, 'undermanned'))
const umCls = () => B.tid(w, 'undermanned').evaluate(e => e.className)
const colorOf = async (row, iso) => B.cell(w, row, iso).evaluate(e => { const c = getComputedStyle(e); return { ink: c.color, cls: e.className, t: e.innerText.trim() } })
const redish = c => { const m = (c.match(/[\d.]+/g) || []).map(Number); return m[0] > 180 && m[1] < 140 && m[2] < 140 }
const J = d => `2026-01-${String(d).padStart(2, '0')}`
/* 1. fresh */
const o0 = short(await B.blockOrder(w)); const u0 = await um()
note('1 fresh block', o0 + ' | summary: ' + u0)
chk('four fixed rows only, summary 0 days', o0 === 'req-p > req-w > avail-p > avail-w' && /0 days/.test(u0), `${o0} | ${u0}`)
pics.push(await B.pic(p, `P2-10-${S}-1-fresh`))
/* 2. make Available P lower than Required P: type 40 on Req P for 12 Jan, 13 Jan (typed through the real cell) */
await B.reveal(w, J(12))
await B.press(w, B.cell(w, 'req-p', J(12))); await B.sleep(300)
const typeStr = async s => { if (!w.phone) { await p.keyboard.type(s); return } for (const ch of s) await B.press(w, B.tid(w, `fly-pad-${ch}`)) }
await typeStr('40')
if (w.phone) await B.press(w, B.tid(w, 'fly-pad-next')); else await p.keyboard.press('Enter')
await B.sleep(250)
await typeStr('40')
if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else await p.keyboard.press('Enter')
await B.sleep(400)
if (!w.phone) { await p.keyboard.press('Escape'); await B.sleep(200) }
const a12 = await colorOf('avail-p', J(12)), r12 = await colorOf('req-p', J(12)), a14 = await colorOf('avail-p', J(14))
note('2 Req P 12 Jan = ' + r12.t + '; Available P 12 Jan', JSON.stringify(a12) + ' | 14 Jan (no figure): ' + JSON.stringify(a14))
chk('Available P is red where under Required (class under, red ink)', /under/.test(a12.cls) && redish(a12.ink), JSON.stringify(a12))
chk('Available P is not red where Required is a dash', !/under/.test(a14.cls), JSON.stringify(a14))
const u1 = await um(), uc1 = await umCls()
note('2 summary after Available went red', u1 + ' | class ' + uc1)
chk('under-manned summary still 0 days (fixed rows never count)', /0 days/.test(u1) && !/undermanned/.test(uc1), `${u1} | ${uc1}`)
pics.push(await B.pic(p, `P2-10-${S}-2-available-red`))
/* 3. add one ordinary counter that is under on some days */
await B.makeCounter(w, 'Pilots under', { seat: 'pilot', amber: 40, red: 30 })
const o1 = short(await B.blockOrder(w)); const u2 = await um(), uc2 = await umCls()
note('3 after adding one ordinary counter (red below 30; the squadron has ~28)', o1 + ' | summary: ' + u2 + ' | class ' + uc2)
pics.push(await B.pic(p, `P2-10-${S}-3-counter-added`))
const nCounter = +(/(\d+)\s*day/.exec(u2) || [0, -1])[1]
chk('the summary now counts days, from the new counter alone', nCounter > 0, u2)
/* how many days is the counter red? the counter row's cells with a red class across the drawn months (desktop draws the whole year) */
let redCells = null
if (!w.phone) redCells = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="count-pilots-under-2026-"]')].filter(e => /\bred\b/.test(e.className)).length)
note('red cells in the new counter row (drawn months)', String(redCells))
if (!w.phone) chk('the figure equals the counter row\'s own red days', redCells === nCounter, `${redCells} vs ${nCounter}`)
/* 4. remove the counter again: back to 0 */
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
await B.press(w, B.tid(w, 'manning-delete-pilots-under')); await B.sleep(500)
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
const u3 = await um()
note('4 counter deleted', u3 + ' | ' + short(await B.blockOrder(w)))
chk('with the counter gone, back to 0 days (Available is still red)', /0 days/.test(u3), u3)
pics.push(await B.pic(p, `P2-10-${S}-4-counter-removed`))
const bad = checks.filter(c => !c[1])
B.row('P2-10', S, 'Fresh world; read Manning + summary; typed Req P 40 on 12 and 13 Jan (Available P ~28 goes red); read the summary; added one ordinary counter via ⚙ + Counter (red below 30); read summary; deleted it via the Rearrange cross',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p210-' + S, w.errors)
await B.close(w)
