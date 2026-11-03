// W2: S13 — what Undo / Redo call an input, door by door (desktop, admin).
import { L, closeBoard, sleep, undoTitle } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-labels v1')
const { page, tap } = await L.session('desktop')
const boardUndo = () => page.evaluate(() => { const vis = id => { const e = document.getElementById(id); return e && e.getBoundingClientRect().height > 0 ? e : null }; const u = vis('sbUndo') || document.getElementById('undoBtn'), r = vis('sbRedo') || document.getElementById('redoBtn'); return { undo: u && (u.title || u.getAttribute('aria-label')), redo: r && (r.title || r.getAttribute('aria-label')) } })
const lastNote = async () => (await L.notes(page)).slice(-1)[0]
const men = await L.freeMen(page, 4, [2, 3])
note('S13', `men ${JSON.stringify(men)}`)
/* 1 one input, window save */
const a = await L.fileOn(page, tap, '2026-07-15', { type: 'Appointment', people: [men[0]], title: 'Dental', from: '10:00', to: '11:00', remarks: 'x' })
note('S13', `1 filed one Appointment: Undo "${(await undoTitle(page)).undo}"`)
/* 2 shared input of 3 */
const b = await L.fileOn(page, tap, '2026-07-16', { type: 'Event', people: men.slice(1, 4), title: 'Games afternoon', remarks: 'y' })
note('S13', `2 filed one Event for 3 people: Undo "${(await undoTitle(page)).undo}"`)
await page.locator('#undoBtn').click(); await sleep(600)
note('S13', `2 after Undo: toast ${JSON.stringify(await lastNote())}; Redo "${(await undoTitle(page)).redo}"`)
await page.locator('#redoBtn').click(); await sleep(600)
note('S13', `2 after Redo: ${JSON.stringify(await lastNote())}`)
/* 3 delete through the window */
await L.toInputsCal(page, false); await L.incalMonth(page, false, 2026, 7); await L.openDay(page, '2026-07-15')
await page.locator(`[data-testid="idy-row-${a}"] .icard-open`).first().click(); await page.locator('#inpEditDel').waitFor(); await page.locator('#inpEditDel').click(); await sleep(700)
note('S13', `3 delete via window: Undo "${(await undoTitle(page)).undo}"`)
await page.locator('#undoBtn').click(); await sleep(600)
note('S13', `3 after Undo of the delete: ${JSON.stringify(await lastNote())}; Redo "${(await undoTitle(page)).redo}"`)
await shot(page, 'S13', 'desktop', 'after-undo-delete')
/* 4 the keyboard Delete on a day card */
if (await L.tid(page, 'win-inputsday').count() === 0) await L.openDay(page, '2026-07-15')
await page.locator(`[data-testid="idy-row-${a}"]`).first().focus().catch(() => {})
await page.keyboard.press('Delete'); await sleep(500)
note('S13', `4 Delete key on the card: question? ${await page.locator('[data-testid="idy-delq"], [data-testid*="delete"]').count()}; Undo "${(await undoTitle(page)).undo}"; toast ${JSON.stringify(await lastNote())}`)
await shot(page, 'S13', 'desktop', 'delete-key')
await page.keyboard.press('Escape'); await sleep(300)
/* 5 board: take a ground row off, put back, LATE, accept */
await closeBoard(page); await L.go(page, 'editsched')
await page.locator('#eWeek [data-sbday="3"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(700)
await page.locator('#schedBoard .sb-arow', { hasText: 'GAMES' }).first().locator('[data-grdel]').click().catch(async e => note('S13', 'board row not found: ' + String(e).slice(0, 80))); await sleep(700)
note('S13', `5 board: ground row taken off: board Undo "${JSON.stringify(await boardUndo())}"; toast ${JSON.stringify(await lastNote())}`)
await page.locator('#sbUndo').click(); await sleep(600)
note('S13', `5 board: Undo -> toast ${JSON.stringify(await lastNote())}; Redo ${JSON.stringify(await boardUndo())}`)
await page.context().close()
await L.finish('labels')
