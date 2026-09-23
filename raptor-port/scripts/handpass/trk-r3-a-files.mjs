/* [HUMAN-RETEST] Tracker — re-walk, round three, A: the FILE fixes, driven
   through the app's own controls on the rebuilt preview (23 Sep 26).

   D126 / W1-8  details typed on Tx stay on Tx; typed on 2026 stay on 2026
   D122 / W1-9  importing ONE chart leaves the other charts' typed details alone
   W1-3 (D120)  never-dragged balls come back where the board drew them
   W1-6         a renamed built-in + a copy wearing its old name: import not refused
   W1-7         the per-chart question's third button is "Skip this one"; the
                closing report names what was skipped
   W1-4         "a full backup" only for every chart + students
   D127 / F8    a deleted built-in stays deleted after export → wipe → import

   World A is the owner's browser before the database step; World B is the
   wiped app (a fresh browser). The OS pickers are replaced the documented way. */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, sylLabels, arrangeOn, arrangeOff, saveLit,
  exportVia, importVia, dlgUp, dlgText, tmp, showAllRow, showAllEdit, drawn } from './trk-w1-lib.mjs'

const L = log()
const FILE1 = tmp('r3-a-one-chart.json'), FILEALL = tmp('r3-a-all.json')
const labels = async page => (await sylLabels(page)).map(s => s.replace(/ ✎$/, ''))
const posOf = d => Object.fromEntries(d.balls.map(b => { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(b.t); return [b.id, { x: +m[1], y: +m[2] }] }))
const farApart = (a, b) => Object.keys(a).filter(id => !b[id] || Math.abs(a[id].x - b[id].x) > 1.5 || Math.abs(a[id].y - b[id].y) > 1.5)

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' }); const pa = A.page

/* ---- D126 / W1-8 ---- */
await pickSyl(pa, 'Tx 2026')
await showAllEdit(pa, 'BFM-5', { Name: 'TX NAME FIVE' }, 'r3-a1-tx-name-typed')
await pickSyl(pa, '2026')
const y26bfm5 = await showAllRow(pa, 'BFM-5')
L.ok('D126: a name typed on Tx does not show on 2026', !/TX NAME FIVE/.test(y26bfm5), y26bfm5)
await showAllEdit(pa, 'BFM-5', { Hours: '7.7 Hrs' })
await pickSyl(pa, 'Tx 2026')
const txbfm5 = await showAllRow(pa, 'BFM-5', { close: false })
await shot(pa, 'r3-a1-tx-keeps-its-own'); await pa.click('#saClose'); await sleep(200)
L.ok('D126: Tx keeps what was typed on Tx, and 2026\'s hours never reach it', /TX NAME FIVE/.test(txbfm5) && !/7\.7 Hrs/.test(txbfm5), txbfm5)

/* ---- D122 / W1-9 ---- */
await pickSyl(pa, '2026')
await showAllEdit(pa, 'BFM-3', { Name: 'A-SIDE NAME' })
const one = await exportVia(pa, { tick: 'as-opened', file: FILE1 })
L.note('W1-9: the one-chart file', `${one.offers.length} charts offered, ${one.tickedAtOpen} ticked; charts in file: ${Object.keys(one.json.charts.syllabi).join(', ')}; details carried for: ${Object.keys(one.json.charts.eventInfoBySyl || {}).join(', ') || 'none'}; done message "${one.conf}"`)
L.ok('W1-4: a charts-only file of 1 of 4 charts says so', /1 of 4 charts/.test(one.conf), one.conf)
await pickSyl(pa, 'Tx 2026'); await showAllEdit(pa, 'BFM-3', { Name: 'B-SIDE NAME' })
await pickSyl(pa, 'A/G - A/A 2026'); await showAllEdit(pa, 'DAAR', { Name: 'AG ONLY EDIT' })
await pickSyl(pa, '2026')
const asked9 = await importVia(pa, FILE1)
L.note('W1-9: the import asked', asked9.map(a => a.msg.slice(0, 80) + ' [' + (a.btns || []).join('/') + ']').join(' || '))
L.ok('W1-7: the per-chart question offers "Skip this one", not "Cancel"', (asked9[0].btns || []).includes('Skip this one'), (asked9[0].btns || []).join(' / '))
await pickSyl(pa, 'Tx 2026'); const tx3 = await showAllRow(pa, 'BFM-3')
await pickSyl(pa, 'A/G - A/A 2026'); const agd = await showAllRow(pa, 'DAAR', { close: false })
await shot(pa, 'r3-a2-ag-daar-after-2026-import'); await pa.click('#saClose'); await sleep(200)
await pickSyl(pa, '2026'); const y3 = await showAllRow(pa, 'BFM-3')
L.ok('D122: Tx keeps its own detail after an import of 2026', /B-SIDE NAME/.test(tx3), tx3)
L.ok('D122: an event not on the imported chart is never touched', /AG ONLY EDIT/.test(agd), agd)
L.ok('D122: the imported chart has the file\'s detail', /A-SIDE NAME/.test(y3), y3)

/* ---- W1-3: a chart filled through the event list, never dragged ---- */
await menu(pa, 'syl', 'addSyl'); await dlg(pa, { value: 'SKETCH' }); await sleep(700)
await arrangeOn(pa)
await pa.click('#editSyl'); await pa.waitForSelector('#sylText')
await pa.fill('#sylText', JSON.stringify([{ id: 'SK-01', type: 'acad' }, { id: 'SK-02', type: 'flight', prereqs: ['SK-01'] }, { id: 'SK-03', type: 'sim', prereqs: ['SK-01'] }]))
await pa.click('#sylSave'); await sleep(400)
await arrangeOff(pa)
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(500) }
const sketchA = posOf(await drawn(pa)); await shot(pa, 'r3-a3-sketch-on-screen-A')
/* ---- W1-3: a copy of 2026 put back to the course map ---- */
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'dupSyl'); if (await dlgUp(pa, 800)) await dlg(pa, { value: '2026 RESET' }); await sleep(900)
await arrangeOn(pa); await pa.click('#resetLayout'); if (await dlgUp(pa, 1200)) await dlg(pa, {}); await sleep(500); await arrangeOff(pa)
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(500) }
const resetA = posOf(await drawn(pa)); await shot(pa, 'r3-a3-reset-copy-on-screen-A')

/* ---- D127: delete the built-in 2024 ---- */
await pickSyl(pa, '2024'); await menu(pa, 'syl', 'delSyl'); const q27 = await dlg(pa, {}); await sleep(900)
L.note('D127: the delete asked', q27.text.replace(/\s+/g, ' '))
/* ---- W1-6: rename the built-in 2026, then call a copy "2026" ---- */
await pickSyl(pa, '2026'); await menu(pa, 'syl', 'renSyl'); await dlg(pa, { value: '2026 OLD' }); await sleep(500)
await menu(pa, 'syl', 'dupSyl'); if (await dlgUp(pa, 800)) await dlg(pa, { value: '2026' }); await sleep(900)
const chartsA = await labels(pa)
L.note('A: charts before the backup', chartsA.join(' · '))

/* ---- W1-4 wording with students + ONE chart; then the whole backup ---- */
const withStu = await exportVia(pa, { tick: 'as-opened', students: true, file: tmp('r3-a-students-one.json') })
L.ok('W1-4: students + one chart is NOT called a full backup', /NOT a full backup/.test(withStu.conf) && !/— a full backup/.test(withStu.conf), withStu.conf)
const all = await exportVia(pa, { tick: 'all', file: FILEALL, shotName: 'r3-a4-export-all' })
L.ok('D127: the whole backup names the deleted built-in', (all.json.charts.deleted || []).includes('sb2024'), JSON.stringify(all.json.charts.deleted))
L.ok('W1-3: the file does not stack SKETCH\'s balls', (() => { const l = all.json.charts.layouts; const id = Object.keys(all.json.charts.syllabi).find(k => (all.json.charts.sylcat || []).find(e => e.id === k && e.name === 'SKETCH')); const s = l[id] || {}; return s['SK-01'] && JSON.stringify(s['SK-01']) !== JSON.stringify(s['SK-02']) })())
L.ok('W1-4: the whole charts backup says every chart', /every chart/.test(all.conf), all.conf)
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' }); const pb = B.page
const askedB = await importVia(pb, FILEALL, msg => (/“Tx 2026” already exists/.test(msg) ? 'cancel' : 'ok'))
const closing = (askedB[askedB.length - 1] || {}).msg || ''
await shot(pb, 'r3-a5-B-after-import')
L.note('B: the import asked', askedB.map(a => a.msg.slice(0, 70)).join(' || '))
L.ok('W1-6: the import is not refused', !/could not be brought in/.test(askedB.map(a => a.msg).join(' ')), closing)
L.ok('W1-7: the closing report names the skipped chart', /Skipped, left as they are here: Tx 2026/.test(closing), closing)
L.ok('D127: the closing report names the chart kept deleted', /Deleted, as in the backup: 2024/.test(closing), closing)
const chartsB = await labels(pb)
L.ok('D127: 2024 is not in the dropdown after the import', !chartsB.includes('2024'), chartsB.join(' · '))
L.ok('W1-6: both "2026 OLD" and "2026" came in by their names', chartsB.includes('2026 OLD') && chartsB.includes('2026'), chartsB.join(' · '))
await menu(pb, 'syl', 'ordSyl'); await pb.waitForSelector('#ordModal'); await sleep(250)
const delList = await pb.locator('#ordHidden .ordrow .onm').allInnerTexts().catch(() => [])
await shot(pb, 'r3-a5-B-reorder-deleted-2024')
L.ok('D127: 2024 waits in ⇅ Reorder as deleted, restorable', delList.includes('2024'), delList.join(' · '))
await pb.click('#ordCancel'); await sleep(200)
await pickSyl(pb, 'SKETCH'); const sketchB = posOf(await drawn(pb)); await shot(pb, 'r3-a6-B-sketch')
L.ok('W1-3: SKETCH comes back where the board drew it, not stacked', farApart(sketchA, sketchB).length === 0 && Object.keys(sketchB).length === 3, `A ${JSON.stringify(sketchA)} | B ${JSON.stringify(sketchB)}`)
await pickSyl(pb, '2026 RESET'); const resetB = posOf(await drawn(pb)); await shot(pb, 'r3-a6-B-reset-copy')
const moved = farApart(resetA, resetB)
L.ok('W1-3: the Reset copy comes back on the course map it showed', moved.length === 0, `${Object.keys(resetB).length} balls; moved: ${moved.slice(0, 6).join(', ') || 'none'}`)
await pickSyl(pb, '2026 OLD'); const oldBfm5 = await showAllRow(pb, 'BFM-5')
L.ok('D126: the 2026 details ride their chart through the round trip', /7\.7 Hrs/.test(oldBfm5), oldBfm5)

save('r3-a-files', { rows: L.rows, askedB, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 4).join(' | ')}`)
await B.browser.close()
