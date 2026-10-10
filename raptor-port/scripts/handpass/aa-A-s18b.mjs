// S18 extra: with the members' switch OFF, the member's read-only card of a placeholder input offers "File it for me only". What does a press do?
import { closeWins, world, closeAll, toInputs, fileInput, pic, T, sleep, readInputs, URL_, signIn, membersSwitch, setPerson, openDay, observe, undoState } from './aa-A-lib.mjs'
const w = await world({ who: 'us', size: 'd' })
const A = w.page
await toInputs(A)
await fileInput(A, { iso: '2026-07-16', type: 'Duty', person: 'allavail', remarks: 'walkS18b', start: '09:00', end: '12:00' })
const B = await w.ctx.newPage(); await B.setViewportSize({ width: 1440, height: 900 }); await B.goto(URL_); await signIn(B, 'ad'); await toInputs(B)
console.log('switch', await membersSwitch(B, false))
await A.reload(); await sleep(1000); if (await A.locator('#luser').count()) await signIn(A, 'us')
await toInputs(A)
await setPerson(A, 'all'); await openDay(A, '2026-07-16')
const iid = (await readInputs(A, 'walkS18b'))[0].iid; await A.locator('[data-testid="idy-row-' + iid + '"] .sd-open').click(); await sleep(700)
await pic(A, 's18b-1-readonly-card')
const before = JSON.stringify(await readInputs(A, 'walkS18b')); const u0 = JSON.stringify(await undoState(A))
const fix = A.locator('#inpEditPop [data-testid="pp-fix"]').first()
console.log('fix button present:', await fix.count(), await fix.innerText().catch(() => ''))
if (await fix.count()) { await fix.click(); await sleep(600) }
await pic(A, 's18b-2-after-fix-press')
const after = JSON.stringify(await readInputs(A, 'walkS18b'))
console.log('record unchanged:', before === after, '| undo unchanged:', u0 === JSON.stringify(await undoState(A)))
console.log('editor now:', await A.evaluate(() => { const p = document.querySelector('#inpEditPop'); return p ? { save: !!p.querySelector('#inpEditSave'), person: p.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent, text: p.innerText.replace(/\s+/g, ' ').slice(0, 260) } : null }))
console.log('errs', JSON.stringify(w.errs))
await closeAll()
