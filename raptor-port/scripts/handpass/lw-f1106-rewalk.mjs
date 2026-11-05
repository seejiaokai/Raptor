// The night of 5–6 Nov 26, job 1 — the re-walk of the code read's F3 (a finger's quick tap ELSEWHERE is a press he meant):
// a leave placed by a tap, then ~150 ms later a tap on another man's day well away from where LL stood — EXPECTED that day's
// window opens. Run from raptor-port:  SIZE=phone [ENGINE=chromium]  node scripts/handpass/lw-f1106-rewalk.mjs
process.env.LW_OUT ||= '2026-11-06-lw-faults/rewalk/walk'
import { mkdirSync } from 'node:fs'
const L = await import('./lw-fx1031-lib.mjs')
mkdirSync(L.OUT, { recursive: true })
const ENG = process.env.ENGINE || 'webkit'
console.log('[lw-f1106-rewalk v2]', L.SIZE, ENG, L.DIST)
const w = await L.newCtx('phone', ENG)
await w.ctx.clock.install({ time: new Date(L.T0) })
const { serveDist } = await import('../drawcheck/lib.mjs')
await serveDist(w.ctx, L.ORIGIN, L.DIST)
await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w)
const P = w.page
const id = await L.pidOf(P, 'Drifter'), other = await L.pidOf(P, 'Reaper')
const D = L.day(9), D2 = L.day(10)
await L.openCell(w, id, D)
await L.autoApprove(w, false)
const ll = await L.centre(P, L.T('bid-LL'))
await L.reachCell(w, other, D2)
const ob = await P.locator(L.T(`cell-${other}-${D2}`)).first().boundingBox()
const op = { x: ob.x + ob.width / 2, y: ob.y + ob.height / 2 }
const away = Math.round(Math.hypot(op.x - ll.x, op.y - ll.y))
const covered = await P.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-testid]')?.getAttribute('data-testid'), op)
await L.finger(w, ll.x, ll.y)
await P.waitForTimeout(150)
await L.finger(w, op.x, op.y, `f3-${ENG}-quick`)
await P.waitForTimeout(700)
const title = await L.txt(P, L.T('bid-picker'))
await L.shot(w, `f3-${ENG}-settled`)
const ok = /Reaper/.test(title || '')
/* N1 (the fix's narrow read): a window closed by a tap on the grid behind it, the same day tapped again ~250 ms later — opens */
await L.closeWin(w); await P.waitForTimeout(400)
await L.openCell(w, id, L.day(11))
const yb = await P.locator(L.T(`cell-${other}-${D2}`)).first().boundingBox()
const y = { x: yb.x + yb.width / 2, y: yb.y + yb.height / 2 }
await L.finger(w, y.x, y.y)
await P.waitForTimeout(250)
const shut = !(await L.vis(P, L.T('bid-picker')))
await L.finger(w, y.x, y.y, `n1-${ENG}-quick`)
await P.waitForTimeout(700)
const t2 = await L.txt(P, L.T('bid-picker'))
await L.shot(w, `n1-${ENG}-settled`)
L.rec('N1-retap-after-grid-close', `phone/${ENG}`, shut && /Reaper/.test(t2 || '') ? 'PASS' : 'FAIL', `first tap on Reaper's day closed the window: ${shut}; the re-tap ~250 ms later opened: ${t2 || 'nothing'}`, [`n1-${ENG}-quick`, `n1-${ENG}-settled`])
L.rec(`F3-quick-tap-elsewhere`, `phone/${ENG}`, ok ? 'PASS' : 'FAIL', `LL tapped at (${Math.round(ll.x)},${Math.round(ll.y)}); ~150 ms later a tap ${away}px away on ${covered}; window now: ${title || 'none'}; his cell ${await L.cellWords(w, id, D)}; errs ${JSON.stringify(w.errs)}`, [`f3-${ENG}-quick`, `f3-${ENG}-settled`])
await L.closeBrowser()
