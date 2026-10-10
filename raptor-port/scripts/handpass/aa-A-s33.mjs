// S33 — inline editing stays attached to the right request (admin, desktop; the board's Ground Programme).
// The extra input added in the middle of the edit is put in by the probe bridge (SEEDED): a person cannot press two things at once.
import { closeWins, world, closeAll, toInputs, fileInput, pic, T, sleep, readInputs, observe } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const w = await world({ who: 'ad', size: 'd' })
const page = w.page
await toInputs(page)
for (const [ph, rmk] of [['all', 'S33-ALL'], ['allavail', 'S33-AA'], ['dj', 'S33-ACE']]) await fileInput(page, { iso: '2026-07-15', type: 'Duty', person: ph, remarks: rmk, start: '09:00', end: '12:00' })
await closeWins(page)
const state = () => page.evaluate(() => window.DAYS[2].ground.map((r, i) => i + ':' + (window.PEOPLE[r.who]?.cs || r.who) + ' ' + r.str + '-' + r.end + ' ' + (r.rmks || r.rmk || '')).concat(window.INPUTS.filter(x => /^S33/.test(x.remarks || '')).map(x => 'input ' + x.remarks + ' ' + (window.PEOPLE[x.person]?.cs) + ' ' + x.s + '-' + x.e)))
await L.go(page, 'editsched'); await L.board(page, 2)
console.log('before:', JSON.stringify(await state()))
const rowOf = async rmk => page.evaluate(r => { const g = window.DAYS[2].ground; return g.findIndex(x => (x.rmks || x.rmk || '') === r) }, rmk)
const ri = await rowOf('S33-AA')
console.log('ALL AVAIL request row index on the day:', ri)
const box = page.locator(`#schedBoard [data-bfld="gr:2.${ri}.str"]`).first()
await box.scrollIntoViewIfNeeded(); await pic(page, 's33-1-board-before')
await box.click(); await box.fill('10:00')   // typed, not yet committed
console.log('mid-edit: the box says', await box.inputValue())
// another input arrives meanwhile (seeded) — placed so it sorts BEFORE the row being edited
await page.evaluate(() => window.fileInput({ person: 'bane', type: 'Duty', date: 'Jul 15', yr: 2026, s: 480, e: 540, allday: false, remarks: 'S33-NEIGHBOUR', iid: 'zzs33neighbour', by: 'stiff', acc: 'g', ord: 99 }))
await sleep(600)
console.log('after the neighbour arrived:', JSON.stringify(await state()))
await pic(page, 's33-2-neighbour-arrived')
console.log('the edited box now reads:', await page.locator('#schedBoard [data-bfld^="gr:2."][data-bfld$=".str"]').evaluateAll(els => els.map(e => e.getAttribute('data-bfld') + '=' + e.value)))
await page.keyboard.press('Enter'); await sleep(700)
await page.keyboard.press('Tab'); await sleep(300)
console.log('after commit:', JSON.stringify(await state()))
await pic(page, 's33-3-after-commit')
await page.locator('#sbUndo').click(); await sleep(700)
console.log('after Undo:', JSON.stringify(await state()))
await page.locator('#sbRedo').click(); await sleep(700)
console.log('after Redo:', JSON.stringify(await state()))
await pic(page, 's33-4-after-redo')
console.log('errs', JSON.stringify(w.errs))
await closeAll()
