/* [HUMAN-RETEST] Tracker — walker w1, walk G: DRAWN LINES and a COLON in a
   name, across the wipe (Fable #22, Fable #24 / R71; D120).

   On a duplicate of 2026 renamed "A:B" (a colon in a chart name is allowed —
   R71), in chart-edit mode:
     L1 — a free line, loose at both ends, then ➤ Arrow (an arrowhead);
     L2 — a free line crossing L1, then ⌢ Unmerge L1 × L2 (a hop appears);
     L5 — a line from ST-01's west port out to empty space (one loose end);
     ✕ Merge on two crossing prerequisite arrows (their hop goes away).
   ✓ Save changes. A course name with a colon must be refused with the colon
   message (both + Add course and Rename course). Export every chart → wipe →
   Import → the drawn chart's every stroke, compared before and after. */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, curSylLabel, sylLabels, sylOptions, courseLabels,
  arrangeOn, arrangeOff, tool, saveLit, saveStat, drawn, exportVia, importVia, dlgUp, dlgText, tmp,
  reveal, ballCentre, revealPoint, clickAt, lsGet } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-g-export.json')
const layoutOf = async (page, id) => { try { return JSON.parse(await lsGet(page, ':lay:' + id) || 'null') } catch (_) { return null } }
const meta = lay => lay ? { lines: (lay.__lines || []).map(l => ({ pts: l.pts, a: l.a, b: l.b, arrow: l.arrow })), merges: lay.__merges || [], unmerges: lay.__unmerges || [] } : null

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { ok: true }); await sleep(900)
await menu(pa, 'syl', 'renSyl'); const rn = await dlg(pa, { value: 'A:B' }); await sleep(500)
const refusedChart = (await dlgUp(pa, 600)) ? (await dlg(pa, { ok: true })).text : null
L.ok('11: a chart can be renamed "A:B" (R71 — a colon is allowed in a chart name)', /^A:B/.test(await curSylLabel(pa)) && !refusedChart, `now on "${await curSylLabel(pa)}"${refusedChart ? '; refused: ' + refusedChart : ''}`)
const abId = (await sylOptions(pa)).find(o => o.sel).id

await arrangeOn(pa)
await reveal(pa, 'ST-01')                           // pan BEFORE picking Line (with Line on, a press on empty space starts a line)
const s = await ballCentre(pa, 'ST-01')
const before = await drawn(pa)
/* L1: loose both ends, then ➤ Arrow */
await tool(pa, 'Line')
await clickAt(pa, { x: s.x - 330, y: s.y + 60 }); await clickAt(pa, { x: s.x - 150, y: s.y + 60 }); await sleep(300)
await pa.click('#arrowBtn'); await sleep(300)
const hint1 = await pa.locator('#arrhint').innerText().catch(() => '')
/* L2: crossing L1 */
await clickAt(pa, { x: s.x - 240, y: s.y }); await clickAt(pa, { x: s.x - 240, y: s.y + 130 }); await sleep(300)
/* L5: from ST-01's west port out to empty space */
await clickAt(pa, { x: s.x - 30, y: s.y }); await clickAt(pa, { x: s.x - 110, y: s.y }); await sleep(300)
const hint5 = await pa.locator('#arrhint').innerText().catch(() => '')
const afterLines = await drawn(pa)
L.ok('10: three drawn lines added', afterLines.lines.length >= before.lines.length + 3, `${before.lines.length} → ${afterLines.lines.length} strokes; hints: "${hint1}" / "${hint5}"`)
L.ok('10: L1 wears an arrowhead after ➤ Arrow', afterLines.lines.filter(x => /arrow\]/.test(x)).length > before.lines.filter(x => /arrow\]/.test(x)).length, hint1)
/* ⌢ Unmerge L1 × L2 — click L1 away from the crossing, then L2 */
await tool(pa, 'Unmerge')
await clickAt(pa, { x: s.x - 300, y: s.y + 60 }); await sleep(200); await clickAt(pa, { x: s.x - 240, y: s.y + 110 }); await sleep(400)
const afterUn = await drawn(pa)
/* a drawn line's hop is an arc in its path; count arcs before and after (clicks land on sub-pixel chart points, so no exact coordinates) */
const arcs = d => d.lines.reduce((n, x) => n + (x.match(/ A5 5 /g) || []).length, 0)
const hopL1 = arcs(afterUn) === arcs(afterLines) + 1
L.ok('10: ⌢ Unmerge gives L1 a hop over L2', hopL1, `arcs on the chart ${arcs(afterLines)} → ${arcs(afterUn)}`)
await shot(pa, 'w1-10-A-lines-drawn-arrange')
/* ✕ Merge two crossing prerequisite arrows: find a hop the chart draws, aim at both arrows */
await tool(pa, 'Move')
const hop = await pa.evaluate(() => {
  const vis = [...document.querySelectorAll('#edgeLayer path')].filter(p => !p.getAttribute('class') && / A5 5 /.test(p.getAttribute('d') || ''))
  const pts = d => { const out = []; const re = /([ML])([-\d.]+) ([-\d.]+)/g; let m; while ((m = re.exec(d))) out.push({ x: +m[2], y: +m[3] }); return out }
  for (const p of vis) {
    const d = p.getAttribute('d'); const m = /L([-\d.]+) ([-\d.]+) A5 5 0 0 [01] ([-\d.]+) ([-\d.]+)/.exec(d); if (!m) continue
    const cx = (+m[1] + +m[3]) / 2, y = +m[2]
    const P = pts(d); let seg = null
    for (let i = 0; i < P.length - 1; i++) if (Math.abs(P[i].y - y) < 0.5 && Math.abs(P[i + 1].y - y) < 0.5 && Math.min(P[i].x, P[i + 1].x) < cx && Math.max(P[i].x, P[i + 1].x) > cx) seg = [P[i], P[i + 1]]
    for (const q of [...document.querySelectorAll('#edgeLayer path')].filter(x => !x.getAttribute('class') && x !== p)) {
      const Q = pts(q.getAttribute('d'))
      for (let i = 0; i < Q.length - 1; i++) if (Math.abs(Q[i].x - cx) < 0.5 && Math.abs(Q[i + 1].x - cx) < 0.5 && Math.min(Q[i].y, Q[i + 1].y) < y - 30 && Math.max(Q[i].y, Q[i + 1].y) > y + 30) {
        const hx = seg ? (Math.abs(seg[1].x - cx) > Math.abs(seg[0].x - cx) ? cx + Math.sign(seg[1].x - cx) * 30 : cx + Math.sign(seg[0].x - cx) * 30) : cx + 30
        return { d, cx, y, onH: { x: hx, y }, onV: { x: cx, y: y - 25 } }
      }
    }
  }
  return null
})
let mergedOk = false
if (hop) {
  await revealPoint(pa, { x: hop.cx, y: hop.y })
  await tool(pa, 'Merge')
  await clickAt(pa, hop.onH); await sleep(250); await clickAt(pa, hop.onV); await sleep(500)
  const still = await pa.evaluate(d0 => [...document.querySelectorAll('#edgeLayer path')].some(p => (p.getAttribute('d') || '') === d0), hop.d)
  const nowD = await pa.evaluate(({ cx, y }) => [...document.querySelectorAll('#edgeLayer path')].filter(p => !p.getAttribute('class')).map(p => p.getAttribute('d') || '').filter(d => d.includes(' ' + y.toFixed(1)) && / A5 5 /.test(d) && d.includes((cx - 5).toFixed(1) + ' ' + y.toFixed(1))).length, hop)
  mergedOk = !still && nowD === 0
  await shot(pa, 'w1-10-A-merge-arrange')
  L.ok('10: ✕ Merge on two crossing prerequisite arrows removes their hop', mergedOk, `hop at (${hop.cx}, ${hop.y}) — ${mergedOk ? 'gone' : 'still drawn'}`)
} else L.ok('10: found two crossing prerequisite arrows to Merge', false, 'no hop on this chart')
await tool(pa, 'Move')
L.ok('10: ✓ Save changes lit after the line work', await saveLit(pa))
if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(600) }
await arrangeOff(pa)
const drawnA = await drawn(pa)
await reveal(pa, 'ST-01'); await shot(pa, 'w1-10-A-lines-view')
const layA = meta(await layoutOf(pa, abId))
L.note('10: stored for A:B', `${layA && layA.lines.length} drawn lines; merges ${JSON.stringify(layA && layA.merges)}; unmerges ${layA && layA.unmerges.length}`)

/* 11: a COURSE name with a colon — refused with the colon message */
await menu(pa, 'course', 'addCourse'); await dlg(pa, { value: 'C:D' }); await sleep(300)
const addColon = (await dlgUp(pa, 1500)) ? await dlgText(pa) : '(no message)'
await shot(pa, 'w1-11-A-course-colon-refused')
if (await dlgUp(pa, 300)) await dlg(pa, { ok: true })
L.ok('11: + Add course "C:D" is refused with the colon message', /colon/i.test(addColon) && !(await courseLabels(pa)).includes('C:D'), `"${addColon.replace(/\s+/g, ' ')}"; courses: ${(await courseLabels(pa)).join(', ')}`)
await menu(pa, 'course', 'renCourse'); await dlg(pa, { value: '26A:BSG' }); await sleep(300)
const renColon = (await dlgUp(pa, 1500)) ? await dlgText(pa) : '(no message)'
if (await dlgUp(pa, 300)) await dlg(pa, { ok: true })
L.ok('11: Rename course to "26A:BSG" is refused with the colon message', /colon/i.test(renColon) && !(await courseLabels(pa)).includes('26A:BSG'), `"${renColon.replace(/\s+/g, ' ')}"`)

/* export every chart with A:B off screen */
await pickSyl(pa, '2026')
const ex = await exportVia(pa, { tick: 'all', file: FILE })
L.note('A: exported', ex.json.charts.sylcat.map(e => e.name).join(' · '))
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
await importVia(pb, FILE)
L.ok('11: "A:B" survives the round trip by name', (await sylLabels(pb)).some(l => /^A:B/.test(l)), (await sylLabels(pb)).join(' · '))
await pickSyl(pb, 'A:B')
const drawnB = await drawn(pb)
const onlyA = drawnA.lines.filter(x => !drawnB.lines.includes(x)), onlyB = drawnB.lines.filter(x => !drawnA.lines.includes(x))
L.ok('10: every stroke on A:B is identical after export → wipe → import', !onlyA.length && !onlyB.length && drawnA.lines.length === drawnB.lines.length, `${drawnA.lines.length} vs ${drawnB.lines.length} strokes; only before: ${onlyA.length}; only after: ${onlyB.length}${onlyA[0] ? ' e.g. ' + onlyA[0].slice(0, 120) : ''}`)
const layB = meta(await layoutOf(pb, abId))
L.ok('10: the stored lines, arrowhead, merges and hops are identical after the wipe', JSON.stringify(layA) === JSON.stringify(layB), layB ? `${layB.lines.length} lines; merges ${JSON.stringify(layB.merges)}; unmerges ${layB.unmerges.length}` : 'nothing stored under the same chart')
await reveal(pb, 'ST-01'); await shot(pb, 'w1-10-B-lines-view')
await arrangeOn(pb); await reveal(pb, 'ST-01'); await shot(pb, 'w1-10-B-lines-arrange')
if (hop) { await revealPoint(pb, { x: hop.cx, y: hop.y }); await shot(pb, 'w1-10-B-merge-arrange') }
await arrangeOff(pb)
save('w1-g-lines-colon', { rows: L.rows, layA, layB, hop, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length} B ${B.errors.length}: ${[...A.errors, ...B.errors].slice(0, 4).join(' | ')}`)
await B.browser.close()
