// Walker A, route 2c: approve all, Undo, approve all again, then every Undo step (does an undone round linger on the list). Demo lines only, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s4c'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, topbarUndo, topbarRedo } = A
const { T, rec, shot } = L
console.log('[lw-m4-walk-a-s4c v1]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openApprovals(w)
const allBtn = P.locator(T('appr-approve-all'))
const lit = () => P.evaluate(() => [...document.querySelectorAll('.appr-line')].filter(e => /lit-approved/.test(e.className)).length)
const toast = () => P.evaluate(() => [...document.querySelectorAll('[class*="toast"], [role="status"]')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
const undoOff = () => P.evaluate(() => document.querySelector('#undoBtn').disabled)
const redoOff = () => P.evaluate(() => document.querySelector('#redoBtn').disabled)
const log = []
const say = async s => { const o = `${s}: lit ${await lit()}, undo ${(await undoOff()) ? 'off' : 'on'}, redo ${(await redoOff()) ? 'off' : 'on'}, toast "${await toast()}"`; log.push(o); console.log('  ', o) }
await say('start')
await pressLoc(w, allBtn); await P.waitForTimeout(500); await pressLoc(w, allBtn); await P.waitForTimeout(600)
await say('round 1 done')
await topbarUndo(w); await say('undo (round 1)')
await shot(w, 'a-s4c-after-undo-1')
await pressLoc(w, allBtn); await P.waitForTimeout(500); await pressLoc(w, allBtn); await P.waitForTimeout(600)
await say('round 2 done')
await topbarUndo(w); await say('undo A')
await shot(w, 'a-s4c-undo-A')
const offA = await undoOff()
if (!offA) { await topbarUndo(w); await say('undo B') }
await shot(w, 'a-s4c-undo-B')
const extra = !offA
rec('4e Undo steps after approve, Undo, approve again', size, offA ? 'PASS' : 'FAIL', `after the second round and ONE Undo the Undo button is ${offA ? 'off (no step left)' : 'still on: a second Undo says "' + log[log.length - 1] + '"'}`, ['a-s4c-undo-A', 'a-s4c-undo-B'])
console.log('errs', JSON.stringify(w.errs))
L.writeResults('s4c')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
