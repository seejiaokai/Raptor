// merge walker E's per-run row files into cal-E.json (the table) and remove the per-run files
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
const runs = {}
for (const f of readdirSync(PARTS).filter(f => /^cal-E-rows-.*\.json$/.test(f))) {
  runs[f.replace(/^cal-E-rows-/, '').replace(/\.json$/, '')] = JSON.parse(readFileSync(join(PARTS, f), 'utf8'))
}
const table = [
  { id: 'P5-01', verdict: 'FAIL', sizes: 'desk FAIL; phone not reachable (the editor panel covers every other input)', pics: ['p501-desk-a2-added', 'p501-desk-a3-after-click', 'p501-desk-b3-after-click', 'p501-desk-c1-control', 'p501-phone-a2-added'] },
  { id: 'P5-02', verdict: 'PARTIAL', sizes: 'desk PASS (bar drag for dates, List row editor for hours); phone not walked (panel covers the doors)', pics: ['p502-desk-a2-after-drag', 'p502-desk-b3-after-list-edit'] },
  { id: 'P5-03', verdict: 'PARTIAL', sizes: 'desk PASS (Keep mine and Take theirs, separate worlds); phone not walked (panel covers the List)', pics: ['p503-desk-mine-2-save-refused', 'p503-desk-theirs-2-save-refused', 'p503-desk-theirs-4-saved'] },
  { id: 'P5-04', verdict: 'PARTIAL', sizes: 'desk PASS (A day Delete, B top-bar Undo, C one man taken out of the shared entry); phone B PASS, A and C not reachable behind the panel', pics: ['p504-desk-A-3-after-delete', 'p504-desk-B-2-after-undo', 'p504-desk-C-4-back-as-saber', 'p504-phone-B-2-after-undo'] },
  { id: 'P5-05', verdict: 'PASS', sizes: 'desk real mouse; phone real finger (hold then drag)', pics: ['p505-desk-1-mid-drag', 'p505-desk-2-after-drag', 'p505-desk-3-after-undo', 'p505-phone-2-after-drag'] },
  { id: 'P5-06', verdict: 'FAIL', sizes: 'short phone all gestures PASS; desk: Escape pressed mid bar-drag then release leaves the ghost stuck', pics: ['p506-short-3-hold-drag-range', 'p506-short-6a-mid-drag', 'p506b-3-after-move-away'] },
  { id: 'P5-07', verdict: 'PASS', sizes: 'desk and phone', pics: ['p507-phone-1-crowd', 'p507-desk-4-january'] },
  { id: 'P5-08', verdict: 'PASS', sizes: 'desk (real keyboard)', pics: ['p508-desk-2-year-edge-right', 'p508-desk-6-backspace-asks'] },
  { id: 'P5-09', verdict: 'PASS', sizes: 'desk and phone', pics: ['p509-desk-1-opened-day', 'p509-desk-3-delete-asks'] },
  { id: 'P5-10', verdict: 'PASS', sizes: 'desk and phone (phone List has no sort header: cards)', pics: ['p510-desk-3-list-trident', 'p510-phone-3-list-trident'] },
  { id: 'P5-11', verdict: 'FAIL', sizes: 'month PASS (still + flash + brought back); List stays still and a hidden row is brought clear of the top bar, but the List row shows no flash on Undo/Redo and only a faint tint on Save; Undo of a bar move turned the month though the bar was partly in view', pics: ['p505-desk-2-after-drag', 'p505-desk-3-after-undo', 'p511-desk-l1-after-save', 'p511b-desk-list'] },
  { id: 'P5-12', verdict: 'PASS', sizes: 'desk and phone', pics: ['p512-desk-3-invalid-saved', 'p512-desk-7-undo-1'] },
  { id: 'H-05', verdict: 'PASS', sizes: 'desk and phone, Saber and Ranger', pics: ['h05-desk-ad-1-medical', 'h05-desk-ad-4-viewer-2', 'h05-desk-ad-6-upload-door', 'h05-phone-ad-1-medical'] },
  { id: 'H-09', verdict: 'FAIL', sizes: 'tabs, arrival at top, one row, Calendar|List and filters PASS at desk, phone, short, Saber and Ranger; reload does not come back on the Inputs page', pics: ['h09-short-ad-2-tab-SANS', 'h09-short-ad-4b-after-signin-Inputs', 'h09-desk-ad-4-reload-Inputs'] },
  { id: 'H-10', verdict: 'PASS', sizes: 'desk and phone', pics: ['h10-desk-2-person-Saber'] },
]
writeFileSync(join(PARTS, 'cal-E.json'), JSON.stringify({ walker: 'E', share: 'P5-01..P5-12, H-05, H-09, H-10', counts: { PASS: table.filter(t => t.verdict === 'PASS').length, FAIL: table.filter(t => t.verdict === 'FAIL').length, PARTIAL: table.filter(t => t.verdict === 'PARTIAL').length, NOT_WALKED: 0 }, table, runs }, null, 1))
for (const f of readdirSync(PARTS).filter(f => /^cal-E-rows-.*\.json$/.test(f))) unlinkSync(join(PARTS, f))
console.log('merged', Object.keys(runs).length, 'run files')
