/* [HUMAN-RETEST] Tracker — walker w1, walk B: balls that were NEVER DRAGGED
   (Fable #4; D120).

   A chart's balls get a place three ways: dragged by hand (saved on the drop),
   the shipped course map, or the app's own automatic flow. This walk makes two
   charts whose balls were never dragged — SKETCH (two events typed into
   📋 Edit events) and a duplicate of 2026 put back with ↺ Reset layout — then
   leaves both OFF screen (on 2026) and exports every chart. Wipe → import →
   are the balls where the app drew them, or stacked in one corner? */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, curSylLabel, sylLabels, sylOptions,
  arrangeOn, arrangeOff, saveLit, saveStat, drawn, exportVia, importVia, dlgUp, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-b-export.json')
const SK_JSON = '[{"id":"SK-01","type":"acad"},{"id":"SK-02","type":"flight","prereqs":["SK-01"]}]'
const places = d => d.balls.map(b => b.t)
const distinct = d => new Set(places(d)).size

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page

/* SKETCH: + Add syllabus, two events typed into 📋 Edit events, ✓ Save changes — never dragged */
await menu(pa, 'syl', 'addSyl'); await dlg(pa, { value: 'SKETCH' }); await sleep(900)
L.ok('A: + Add syllabus → on SKETCH', /^SKETCH/.test(await curSylLabel(pa)), await curSylLabel(pa))
await arrangeOn(pa)
await pa.click('#editSyl'); await pa.waitForSelector('#sylText', { state: 'visible' })
await pa.fill('#sylText', SK_JSON)
await shot(pa, 'w1-03-A-sketch-edit-events')
await pa.click('#sylSave'); await sleep(500)
L.note('A: the JSON editor', (await pa.locator('#sylErr').innerText().catch(() => '')) || 'saved, no error line')
L.ok('A: ✓ Save changes lit after 📋 Edit events', await saveLit(pa))
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(600) }
L.ok('A: ✓ Save changes pressed → the chart is saved', !(await saveLit(pa)), await saveStat(pa))
await arrangeOff(pa)
const skA = await drawn(pa)
L.note('A: SKETCH on screen', skA.balls.map(b => `${b.id} ${b.t}`).join(' · '))
await shot(pa, 'w1-03-A-sketch')

/* the reset copy: Duplicate 2026, ↺ Reset layout, save */
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { value: '2026 RESET' }); await sleep(900)
L.ok('A: Duplicate → on the copy', /^2026 RESET/.test(await curSylLabel(pa)), await curSylLabel(pa))
await arrangeOn(pa)
await pa.click('#resetLayout'); await sleep(300)
const rq = (await dlgUp(pa, 1500)) ? await dlg(pa, { ok: true }) : { text: '(no question)' }
L.note('A: ↺ Reset layout asked', rq.text.replace(/\s+/g, ' '))
await sleep(500)
L.note('A: after Reset layout', `Save changes ${await saveLit(pa) ? 'lit — pressing it' : 'dark (the reset saved itself)'}`)
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(600) }
await arrangeOff(pa)
const cpA = await drawn(pa)
L.note('A: 2026 RESET on screen', `${cpA.balls.length} balls at ${distinct(cpA)} distinct places; ST-01 ${cpA.balls.find(b => b.id === 'ST-01')?.t}, ACG-03 ${cpA.balls.find(b => b.id === 'ACG-03')?.t}`)
await shot(pa, 'w1-03-A-copy-reset')

/* both charts OFF screen, then Export every chart */
await pickSyl(pa, '2026')
const ex = await exportVia(pa, { tick: 'all', file: FILE })
const ids = Object.fromEntries((await sylOptions(pa)).map(o => [o.label.replace(/ ✎$/, ''), o.id]))
const layS = ex.json.charts.layouts[ids.SKETCH] || {}, layC = ex.json.charts.layouts[ids['2026 RESET']] || {}
const posC = Object.entries(layC).filter(([k]) => !k.startsWith('__')).map(([, v]) => v.x + ',' + v.y)
L.note('A: what the FILE holds for SKETCH', `SK-01 ${JSON.stringify(layS['SK-01'])}, SK-02 ${JSON.stringify(layS['SK-02'])}`)
L.note('A: what the FILE holds for 2026 RESET', `${posC.length} ball positions, ${new Set(posC).size} distinct; e.g. ST-01 ${JSON.stringify(layC['ST-01'])}`)
L.note('A: export done message', ex.conf)
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
const asked = await importVia(pb, FILE)
L.note('B: the import asked', asked.map(a => a.msg.slice(0, 80)).join(' || '))
L.note('B: charts', (await sylLabels(pb)).join(' · '))
await pickSyl(pb, 'SKETCH')
const skB = await drawn(pb)
await shot(pb, 'w1-03-B-sketch')
L.ok('B: SKETCH\'s two balls are where the app drew them before the wipe (not stacked)', distinct(skB) === 2 && JSON.stringify(places(skB)) === JSON.stringify(places(skA)), `before ${places(skA).join(' / ')}  |  after ${places(skB).join(' / ')}`)
await pickSyl(pb, '2026 RESET')
const cpB = await drawn(pb)
await shot(pb, 'w1-03-B-copy-reset')
const moved = cpA.balls.filter(b => { const y = cpB.balls.find(z => z.id === b.id); return !y || y.t !== b.t }).length
L.ok('B: 2026 RESET\'s balls are where the course map had them before the wipe (not stacked)', distinct(cpB) > 1 && moved === 0, `${cpB.balls.length} balls at ${distinct(cpB)} distinct places after the import (before: ${distinct(cpA)}); ${moved} balls moved`)
save('w1-b-neverplaced', { rows: L.rows, skA: places(skA), skB: places(skB), asked, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 4).join(' | ')}`)
await B.browser.close()
