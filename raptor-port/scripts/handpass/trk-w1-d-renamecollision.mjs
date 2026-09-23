/* [HUMAN-RETEST] Tracker — walker w1, walk D: a RENAME COLLISION across the
   round trip (Fable #16; D120).

   He renames the built-in "2026" to "2026 OLD", duplicates a chart and names
   the copy "2026" — both legal in his app. Export every chart → wipe (the fresh
   app's built-in is called "2026" again) → Import. Does the import refuse, or
   rename anything? If it refuses, is the way out it names workable? */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, curSylLabel, sylLabels,
  arrangeOn, arrangeOff, dragBy, drawn, exportVia, importVia, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-d-export.json')

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'renSyl'); const r1 = await dlg(pa, { value: '2026 OLD' }); await sleep(500)
L.ok('A: the built-in 2026 renamed "2026 OLD"', /^2026 OLD/.test(await curSylLabel(pa)), `${r1.text.replace(/\s+/g, ' ')} → ${await curSylLabel(pa)}`)
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { ok: true }); await sleep(900)
L.note('A: Duplicate made', await curSylLabel(pa))
await menu(pa, 'syl', 'renSyl'); const r2 = await dlg(pa, { value: '2026' }); await sleep(500)
L.ok('A: the copy renamed "2026" (the name is free here)', /^2026( ✎)?$/.test(await curSylLabel(pa)), `${r2.text.replace(/\s+/g, ' ')} → ${await curSylLabel(pa)}`)
/* make the copy tell-apart-able: move one ball (saved on the drop) */
await arrangeOn(pa); await dragBy(pa, 'ACG-03', 130, 20); await arrangeOff(pa)
const copyA = (await drawn(pa)).balls.find(b => b.id === 'ACG-03')
const labelsA = await sylLabels(pa)
L.note('A: charts before Export', labelsA.join(' · '))
await shot(pa, 'w1-06-A-before-export')
const ex = await exportVia(pa, { tick: 'all', file: FILE })
L.note('A: the file holds', ex.json.charts.sylcat.map(e => `${e.name} (${e.id.startsWith('sb') ? 'built-in' : 'custom'})`).join(' · '))
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
L.note('B: charts in the wiped app', (await sylLabels(pb)).join(' · '))
const asked = await importVia(pb, FILE, async (msg, i, page) => { if (/could not be brought in/.test(msg)) await shot(page, 'w1-06-B-refusal'); return 'ok' })
await shot(pb, 'w1-06-B-after-import')
L.note('B: the import said', asked.map(a => `"${a.msg}"`).join(' || '))
const labelsB = await sylLabels(pb)
L.ok('B: the import brings both in with their names (no refusal)', labelsB.some(l => /^2026 OLD/.test(l)) && labelsB.some(l => /^2026( ✎)?$/.test(l)) && !asked.some(a => /could not be brought in/.test(a.msg)), `charts after: ${labelsB.join(' · ')}`)

/* if it refused: follow the way out the message names — rename the one here, import again */
if (asked.some(a => /could not be brought in/.test(a.msg))) {
  await pickSyl(pb, '2026')
  await menu(pb, 'syl', 'renSyl'); await dlg(pb, { value: '2026 OLD' }); await sleep(500)
  L.note('B: followed the message — renamed the wiped app\'s "2026" to', await curSylLabel(pb))
  const asked2 = await importVia(pb, FILE)
  L.note('B: the second import said', asked2.map(a => `"${a.msg}"`).join(' || '))
  const labelsB2 = await sylLabels(pb)
  await pickSyl(pb, '2026')
  const copyB = (await drawn(pb)).balls.find(b => b.id === 'ACG-03')
  await shot(pb, 'w1-06-B-after-second-import')
  L.ok('B: after the renaming the message asks for, the import goes through with both names', labelsB2.some(l => /^2026 OLD/.test(l)) && labelsB2.some(l => /^2026( ✎)?$/.test(l)), `charts: ${labelsB2.join(' · ')}; the copy's moved ACG-03 ${copyB && copyA && copyB.t === copyA.t ? 'is where it was' : 'is NOT where it was (' + (copyB && copyB.t) + ' vs ' + (copyA && copyA.t) + ')'}`)
}
save('w1-d-renamecollision', { rows: L.rows, labelsA, asked, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 4).join(' | ')}`)
await B.browser.close()
