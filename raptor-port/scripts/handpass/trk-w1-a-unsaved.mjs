/* [HUMAN-RETEST] Tracker — walker w1, walk A: UNSAVED CHART EDITS meet the File
   menu and the chart-making commands (Fable #2, Fable #3; ruling R88; D120).

   1. On 2026, in chart-edit mode: + Flight LATE-1, Connect ST-01 → LATE-1,
      Done editing, and do NOT press ✓ Save changes. Export every chart. Does
      Export warn or offer to save first? Wipe (a fresh browser) → Import → is
      LATE-1 in the imported chart?
   2. With unsaved chart edits, do + Add syllabus, ⧉ Duplicate syllabus and
      ⇪ Import each ask "unsaved flow edits… discard?" the way the Syllabus
      dropdown does (R88)? After an Import, is the orange ✓ Save changes still
      lit over a chart with nothing unsaved? */
import { open, shot, save, log, dlg, reveal, DESK, sleep, ball, menu, pickSyl, curSylLabel, sylLabels,
  arrangeOn, arrangeOff, tool, saveLit, saveStat, addBall, dragBy, exportVia, importVia, dlgUp, dlgText, tmp, bubble } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-a-export.json')
const has = (page, id) => ball(page, id).count().then(n => n > 0)

/* an unsaved structure edit: a new ball, dragged clear of where it lands */
async function unsavedBall(page, name) {
  await arrangeOn(page)
  const q = await addBall(page, '+ Flight', name)
  await sleep(300)
  await tool(page, 'Move')
  await dragBy(page, name, 170, 40)
  await arrangeOff(page)
  return q
}

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
L.note('A: charts', (await sylLabels(pa)).join(' · ') + ' — on ' + await curSylLabel(pa))
if (!/^2026/.test(await curSylLabel(pa))) await pickSyl(pa, '2026')

/* ---- 1. the unsaved edit ---- */
await arrangeOn(pa)
const q1 = await addBall(pa, '+ Flight', 'LATE-1'); await sleep(300)
L.note('1: + Flight asked', q1.text.replace(/\s+/g, ' '))
await tool(pa, 'Move'); await dragBy(pa, 'LATE-1', 170, 40)
L.ok('1: LATE-1 is on the chart', await has(pa, 'LATE-1'))
await tool(pa, 'Connect')
await reveal(pa, 'ST-01'); await ball(pa, 'ST-01').click(); await sleep(300)
await reveal(pa, 'LATE-1'); await ball(pa, 'LATE-1').click(); await sleep(500)
if (await dlgUp(pa, 600)) L.note('1: Connect raised', (await dlg(pa, {})).text)
await tool(pa, 'Move')
await shot(pa, 'w1-01-A-late1-connected-arrange')
await arrangeOff(pa)
const late1Bubble = await bubble(pa, 'LATE-1')
L.ok('1: LATE-1 now needs ST-01 (details bubble)', /Prerequisites:\s*ST-01/.test(late1Bubble), late1Bubble)
L.ok('1: ✓ Save changes is lit (the edit is unsaved)', await saveLit(pa), await saveStat(pa))
await shot(pa, 'w1-01-A-unsaved-late1')

/* ---- Export, every chart ticked ---- */
const ex = await exportVia(pa, { tick: 'all', file: FILE, shotName: 'w1-01-A-export-window-with-unsaved' })
L.ok('1: Export warned or offered to save the unsaved edit first', !!ex.pre, ex.pre ? `asked: "${ex.pre.replace(/\s+/g, ' ')}"` : 'no question — the Export window opened straight away')
L.note('1: the Export window offered', `${ex.offers.join(' · ')} — ${ex.tickedAtOpen} ticked at open; done message: "${ex.conf}"`)
const sb = ex.json.charts.syllabi.sb2026 || []
const lay = (ex.json.charts.layouts || {}).sb2026 || {}
L.ok('1: the exported 2026 chart holds LATE-1 (the chart as it stands on screen)', sb.some(e => e.id === 'LATE-1'), `events in the file's 2026: ${sb.length}; LATE-1 ${sb.some(e => e.id === 'LATE-1') ? 'present' : 'ABSENT'}; its position ${lay['LATE-1'] ? 'IS in the file\'s layout ' + JSON.stringify(lay['LATE-1']) : 'absent from the layout too'}`)
L.ok('1: after Export the edit is still unsaved on screen (nothing silently saved)', await saveLit(pa) && await has(pa, 'LATE-1'))

/* ---- 2a. the baseline R88 door: the Syllabus dropdown asks ---- */
await pickSyl(pa, 'Tx 2026')
let q = (await dlgUp(pa, 1500)) ? await dlgText(pa) : null
await shot(pa, 'w1-02-A-dropdown-asks')
L.ok('2a: the Syllabus dropdown asks about the unsaved edits (R88 baseline)', q && /unsaved flow edits/i.test(q), q ? q.replace(/\s+/g, ' ') : 'no question')
if (q) await dlg(pa, { ok: false })
L.ok('2a: "Cancel" keeps 2026 and the edit', /^2026/.test(await curSylLabel(pa)) && await has(pa, 'LATE-1') && await saveLit(pa), await curSylLabel(pa))

/* ---- 2b. + Add syllabus with the edit unsaved ---- */
await menu(pa, 'syl', 'addSyl')
q = (await dlgUp(pa, 1500)) ? await dlgText(pa) : null
await shot(pa, 'w1-02-A-addsyl-first-question')
L.ok('2b: + Add syllabus asks about the unsaved edits first', q && /unsaved flow edits/i.test(q), `first question: "${(q || 'none').replace(/\s+/g, ' ')}"`)
if (q && /unsaved/i.test(q)) await dlg(pa, { ok: true })
if (await dlgUp(pa, 800)) await dlg(pa, { value: 'W1 ADDED' })
await sleep(600)
L.note('2b: now on', `${await curSylLabel(pa)} — Save changes ${await saveLit(pa) ? 'lit' : 'dark'}; status "${await saveStat(pa)}"`)
await pickSyl(pa, '2026')
if (await dlgUp(pa, 800)) L.note('2b: going back to 2026 asked', (await dlg(pa, { ok: true })).text)
L.ok('2b: back on 2026 — LATE-1 kept, or at least the loss was asked about', await has(pa, 'LATE-1'), `LATE-1 ${await has(pa, 'LATE-1') ? 'still there' : 'GONE'}; Save changes ${await saveLit(pa) ? 'lit' : 'dark'}`)
await shot(pa, 'w1-02-A-after-addsyl-back-on-2026')

/* ---- 2c. ⧉ Duplicate syllabus with an edit unsaved ---- */
await unsavedBall(pa, 'LATE-2')
L.ok('2c: set-up — LATE-2 on 2026, unsaved', await has(pa, 'LATE-2') && await saveLit(pa))
await menu(pa, 'syl', 'dupSyl')
q = (await dlgUp(pa, 1500)) ? await dlgText(pa) : null
await shot(pa, 'w1-02-A-dupsyl-first-question')
L.ok('2c: Duplicate asks about the unsaved edits first', q && /unsaved flow edits/i.test(q), `first question: "${(q || 'none').replace(/\s+/g, ' ')}"`)
if (q && /unsaved/i.test(q)) await dlg(pa, { ok: true })
if (await dlgUp(pa, 800)) await dlg(pa, { ok: true })            // accept the offered name
await sleep(700)
const copyName = await curSylLabel(pa)
L.note('2c: the copy', `${copyName} — LATE-2 on the copy: ${await has(pa, 'LATE-2') ? 'yes' : 'no'}; Save changes ${await saveLit(pa) ? 'lit' : 'dark'}`)
await pickSyl(pa, '2026')
if (await dlgUp(pa, 800)) L.note('2c: going back to 2026 asked', (await dlg(pa, { ok: true })).text)
L.ok('2c: back on 2026 — LATE-2 kept, or its loss asked about', await has(pa, 'LATE-2'), `LATE-2 on 2026 ${await has(pa, 'LATE-2') ? 'still there' : 'GONE (it went into the copy only)'}; Save changes ${await saveLit(pa) ? 'lit' : 'dark'}`)
await shot(pa, 'w1-02-A-after-dup-back-on-2026')

/* ---- 2d. ⇪ Import with an edit unsaved ---- */
await unsavedBall(pa, 'LATE-3')
L.ok('2d: set-up — LATE-3 on 2026, unsaved', await has(pa, 'LATE-3') && await saveLit(pa))
const asked = await importVia(pa, FILE)                             // Replace it for every chart already here
L.ok('2d: Import asks about the unsaved edits before bringing charts in', /unsaved flow edits/i.test((asked[0] || {}).msg || ''), `questions: ${asked.map(a => '"' + a.msg.slice(0, 90) + '"').join(' | ')}`)
await sleep(600)
const lateAfter = await has(pa, 'LATE-3'), litAfter = await saveLit(pa)
await shot(pa, 'w1-02-A-after-import-save-lit')
L.note('2d: after the import', `on ${await curSylLabel(pa)} — LATE-3 ${lateAfter ? 'still there' : 'GONE'}; ✓ Save changes ${litAfter ? 'LIT' : 'dark'}; status "${await saveStat(pa)}"`)
L.ok('2d: ✓ Save changes is not left lit over a chart that has nothing unsaved', !(litAfter && !lateAfter), `LATE-3 ${lateAfter ? 'present' : 'gone'}, Save ${litAfter ? 'lit' : 'dark'}`)
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
const askedB = await importVia(pb, FILE)
L.note('B: the import asked', askedB.map(a => a.msg.slice(0, 100)).join(' || '))
await pickSyl(pb, '2026')
const inB = await has(pb, 'LATE-1')
await reveal(pb, 'ST-01')
await shot(pb, 'w1-01-B-2026-after-import')
L.ok('1: after export → wipe → import, 2026 carries LATE-1 (edited before Export, unsaved)', inB, inB ? 'LATE-1 present' : 'LATE-1 is NOT in the imported chart')
save('w1-a-unsaved', { rows: L.rows, exportPre: ex.pre, asked, askedB, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 4).join(' | ')}`)
await B.browser.close()
