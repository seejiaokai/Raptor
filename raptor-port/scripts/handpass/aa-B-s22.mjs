import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, closeWin, pubDay, credits, undoRedo, savePart } from './aa-B-lib.mjs'
import { groundIdx, putExtra, putMain, rowPucks, rowSeat, dragOff } from './aa-B-rows.mjs'
const P = 'dice', G = 'torque', R = 'shaft', X = 'glass'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's22'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S22', s: '09:00', e: '12:00', oil: 'yes' })
const iid = f.rec.iid
await openBoard(page, 5)
let slot = await groundIdx(page, 'S22')
say('typed P:', await putExtra(page, slot, P)); say('typed G (ground crew):', await putExtra(page, slot, G))
say('row pucks', JSON.stringify(await rowPucks(page, 'S22')))
await pic(w, 'typed')
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P, G, R, X]); say('credits ORIG (expect P,G,R,X all HO)', JSON.stringify(out.c0))
await openBoard(page, 5)
slot = await groundIdx(page, 'S22')
// try to put P into the main box (he is already on the row)
const tryP = await putMain(page, slot, P); say('putMain P (already typed) ->', tryP)
await pic(w, 'try-P-main')
say('row pucks', JSON.stringify(await rowPucks(page, 'S22')))
// replace the main placeholder puck with another man R
say('replace main placeholder by R:', await putMain(page, slot, R))
say('row pucks after replace', JSON.stringify(await rowPucks(page, 'S22')))
say('placeholder count chip on the row', await page.locator('#schedBoard .oilcount').count())
await pic(w, 'replaced')
out.row = await rowPucks(page, 'S22')
// a second placeholder in the extras, then take it out by dragging it off
say('add ALL in the extras:', await putExtra(page, slot, 'all'))
say('row pucks with ALL', JSON.stringify(await rowPucks(page, 'S22')))
await dragOff(page, 'S22', 'all'); say('after dragging ALL off', JSON.stringify(await rowPucks(page, 'S22')))
await pic(w, 'all-removed')
out.pre = await credits(page, [P, G, R, X]); say('credits before AL (issued figures must hold)', JSON.stringify(out.pre))
await openBoard(page, 5)
say('pending chip', await page.locator('#schedBoard .dpend').first().innerText().catch(() => '?'))
// replay
await undoRedo(page, 'undo'); say('after UNDO row', JSON.stringify(await rowPucks(page, 'S22')))
await undoRedo(page, 'redo'); say('after REDO row', JSON.stringify(await rowPucks(page, 'S22')))
say('publish AL', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P, G, R, X]); say('credits AL (expect P,G,R HO; X none)', JSON.stringify(out.c1))
await pic(w, 'lw')
out.errors = w.errors
await w.browser.close()
savePart('s22-run', { out, log })
