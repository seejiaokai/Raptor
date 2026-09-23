/* [HUMAN-RETEST] Tracker — walker w1, walk B2: item 3's other half (Fable #4).

   Walk B showed never-dragged balls come back stacked when their chart is OFF
   screen at Export. Fable called the ON-screen case fine ("the positions are the
   auto-flow ones"). But the screen does not draw a reset custom chart with the
   automatic flow — it borrows the course map. So: Duplicate 2026, ↺ Reset
   layout, and export it WHILE IT IS ON SCREEN. Wipe → import → are the balls
   where the screen had them? And SKETCH (two events typed into 📋 Edit events)
   exported while on screen. */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, curSylLabel, arrangeOn, arrangeOff, saveLit,
  drawn, exportVia, importVia, dlgUp, tmp } from './trk-w1-lib.mjs'

const L = log()
const F1 = tmp('w1-b2-reset-onscreen.json'), F2 = tmp('w1-b2-sketch-onscreen.json')
const SK_JSON = '[{"id":"SK-01","type":"acad"},{"id":"SK-02","type":"flight","prereqs":["SK-01"]}]'
const places = d => d.balls.map(b => b.id + ' ' + b.t)
const same = (a, b) => a.balls.filter(x => { const y = b.balls.find(z => z.id === x.id); return !y || y.t !== x.t }).length

const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { value: '2026 RESET ON' }); await sleep(900)
await arrangeOn(pa); await pa.click('#resetLayout'); if (await dlgUp(pa, 1500)) await dlg(pa, { ok: true }); await sleep(500)
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(500) }
await arrangeOff(pa)
const resetA = await drawn(pa)
await shot(pa, 'w1-03b-A-reset-on-screen')
const ex1 = await exportVia(pa, { tick: 'as-opened', file: F1 })        // the chart on screen is the one ticked
L.note('A: exported while on screen', `${Object.keys(ex1.json.charts.syllabi).length} chart(s): ${ex1.json.charts.sylcat.map(e => e.name).join(', ')}`)

await menu(pa, 'syl', 'addSyl'); await dlg(pa, { value: 'SKETCH ON' }); await sleep(900)
await arrangeOn(pa); await pa.click('#editSyl'); await pa.waitForSelector('#sylText', { state: 'visible' })
await pa.fill('#sylText', SK_JSON); await pa.click('#sylSave'); await sleep(400)
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(500) }
await arrangeOff(pa)
const skA = await drawn(pa)
const ex2 = await exportVia(pa, { tick: 'as-opened', file: F2 })
await A.browser.close()

const B = await open({ size: DESK, who: 'a' })
const pb = B.page
await importVia(pb, F1); await importVia(pb, F2)
await pickSyl(pb, '2026 RESET ON')
const resetB = await drawn(pb)
await shot(pb, 'w1-03b-B-reset-after-import')
const moved = same(resetA, resetB)
L.ok('3b: a reset copy exported WHILE ON SCREEN comes back where the screen had its balls', moved === 0, `${moved} of ${resetA.balls.length} balls in a different place after the round trip; e.g. ST-01 ${resetA.balls.find(b => b.id === 'ST-01')?.t} → ${resetB.balls.find(b => b.id === 'ST-01')?.t}, ACG-03 ${resetA.balls.find(b => b.id === 'ACG-03')?.t} → ${resetB.balls.find(b => b.id === 'ACG-03')?.t}`)
await pickSyl(pb, 'SKETCH ON')
const skB = await drawn(pb)
await shot(pb, 'w1-03b-B-sketch-after-import')
L.ok('3b: SKETCH exported WHILE ON SCREEN comes back where the screen had its balls', same(skA, skB) === 0, `before ${places(skA).join(' / ')} | after ${places(skB).join(' / ')}`)
save('w1-b2-onscreen', { rows: L.rows, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length} B ${B.errors.length}: ${[...A.errors, ...B.errors].slice(0, 4).join(' | ')}`)
await B.browser.close()
