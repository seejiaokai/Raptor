/* rcsb-w1-s1 v1 — S1 (lowering the line, Saturday 10:00-10:30) with S4 (Sunday published under the new line) in the same world.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s1.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s1')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s1 v1', process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('pc')
const { page } = w
const SAT = 5, SUN = 6
const ranger = w.ID('Ranger')
const b1 = await C.build(w, SAT, '10:00', '10:30', ranger)
console.log('built', j(b1))
const p1 = await C.publish(w, SAT)
console.log('published', j(p1))
const a = await C.readAll(w, SAT, ranger, 's1a')
const lg = await R.setLogic(w, 'oilFullMin', '5h', 's1b-logic-5h')
console.log('logic', j(lg))
const b = await C.readAll(w, SAT, ranger, 's1b')
// close the Leave War, change nothing, reopen it
await L.go(page, 'editsched'); await sleep(500)
await W4.lwOpen(page, X.ISO[SAT])
const reopen = await W4.lwCell(page, ranger, X.ISO[SAT])
await W4.lwShot(page, 's1b-lw-reopened', ranger, X.ISO[SAT])
console.log('reopen', j(reopen))
row('S1 reopen', /HO\*/.test(reopen.box) ? 'PASS' : 'FAIL', 'Leave War closed and reopened at (b): Ranger 18 Jul box reads ' + reopen.box, 's1b-lw-reopened.png')
// S4: Sunday published under the 5h line
const b4 = await C.build(w, SUN, '10:00', '10:30', ranger)
console.log('S4 built', j(b4))
const p4 = await C.publish(w, SUN)
console.log('S4 published', j(p4))
await W4.lwOpen(page, X.ISO[SUN])
const sunBox = await W4.lwCell(page, ranger, X.ISO[SUN])
const satBox4 = await W4.lwCell(page, ranger, X.ISO[SAT])
await W4.lwShot(page, 's4-lw-sunday', ranger, X.ISO[SUN])
const sunWin = await C.lwGrid(w, ranger, X.ISO[SUN], 's4-sun')
const satWin4 = await C.lwGrid(w, ranger, X.ISO[SAT], 's4-sat')
const sunFig = await X.lwOil(w, ranger, X.ISO[SUN], 's4-person')
const trk4 = await W4.lwTracker(page, ranger, 's4-tracker')
console.log('S4', j({ sunBox, satBox4, sunWin, satWin4, sunFig, trk4: trk4.bal, trkText: (trk4.text || '').slice(0, 400), pubSun: p4.head }))
row('S4', (/FO\*/.test(sunBox.box) && /HO\*/.test(satBox4.box)) ? 'PASS' : 'FAIL', `Sunday box ${sunBox.box}; Saturday box ${satBox4.box}; Sunday window: ${sunWin.win.slice(-230)}; person OIL ${sunFig.oil}; tracker ${trk4.bal}`, 's4-lw-sunday.png, s4-sun-lw-window.png')
// (c) AL1 on Saturday
await L.go(page, 'editsched'); await sleep(500)
const pAl = await C.publish(w, SAT)
console.log('AL1 published', j(pAl))
const c = await C.readAll(w, SAT, ranger, 's1c')
const sat = x => x
row('S1a', /HO\*/.test(a.grid.box) ? 'PASS' : 'FAIL', `a: box ${a.grid.box}; person ${a.person.oil}; tracker ${a.tracker}; balances ${a.balOil}; board ${j(a.board.seat)}; head ${a.head.tag}/${a.head.pending}/nys ${a.card.nys}`, 's1a-*')
row('S1b', (/HO\*/.test(b.grid.box) && /0\.5/.test(b.person.oil) && /1 pending/.test(b.head.pending) && b.card.nys) ? 'PASS' : 'FAIL', `b: box ${b.grid.box}; person ${b.person.oil}; tracker ${b.tracker}; balances ${b.balOil}; board seat ${j(b.board.seat)}; head ${b.head.tag}/${b.head.pending}/nys ${b.card.nys}`, 's1b-*')
row('S1c', /FO\*/.test(c.grid.box) ? 'PASS' : 'FAIL', `c: box ${c.grid.box}; person ${c.person.oil}; tracker ${c.tracker}; balances ${c.balOil}; board ${j(c.board.seat)}; head ${c.head.tag}/${c.head.pending}/nys ${c.card.nys}`, 's1c-*')
R.finish(w, 's1')
await w.browser.close()
