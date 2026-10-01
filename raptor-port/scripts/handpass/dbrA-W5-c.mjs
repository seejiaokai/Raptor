/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part C (30 Sep 26): the File menu — ⤓ Export (charts;
   then charts + students & marks) writes NOTHING; then, after changes made since the export (his own chart deleted, a
   mark taken back, a pace changed, a new student marked), ⇪ Import of the charts file brings his chart back exactly as
   exported (chart, layout, details, order), and ⇪ Import of the students file puts the exported marks and pace back
   while the student the file does not name keeps his (D132). Each step: the rows it wrote, named by batches; a reload
   gives it all back and writes nothing. (His route to the database is Export → wipe → Import — D120.)
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-c.json node dbrA-W5-c.mjs */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const TMP = resolve(tmpdir(), 'dbrA-W5'); mkdirSync(TMP, { recursive: true })
const errors = [], table = [], notes = []
const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.fromEntries(Object.keys(x).sort().map(kk => [kk, x[kk]])) : x)
const bare = s => String(s || '').replace(/ ✎$/, '')
async function showAllEdit(p, id, fields) {
  await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await T.sleep(250)
  await p.fill('#saSearch', id); await T.sleep(300)
  const row = p.locator('#saBody .sarow').filter({ has: p.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  await row.locator('button.sedit').click(); await T.sleep(250)
  for (const [label, v] of Object.entries(fields)) await p.locator('.saedit label', { hasText: label }).locator('input, textarea').first().fill(v)
  await p.locator('.saedit .saedit-btns button.primary').click(); await T.sleep(500)
  await p.click('#saClose'); await T.sleep(250)
}
const paceOf = (p, sid) => p.evaluate(sid => { const c = document.getElementById('courseSel').value; const v = localStorage.getItem(`raptor:tracker/v3:${c}:pace:${sid}`); return v ? JSON.parse(v) : null }, sid)

const b = await L.launch()
try {
  const ctx = await L.context(b, {})
  const p = await L.page(ctx, errors, 'W5c')
  await T.firstBoot(p); await T.firstMount(p)
  const [stA] = await p.evaluate(() => window.__coreForTests.rosterNow())
  const [e1, e2] = await T.firstBalls(p, 2)

  /* ---- setup, through the app's controls: a chart of his own with details; a mark and a pace ---- */
  const s1 = await L.step(p, 'C0a ⧉ Duplicate syllabus 2026 as "W5 OWN"', async () => { await T.menu(p, 'syl', 'dupSyl'); await T.dlg(p, { value: 'W5 OWN' }); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
  const ownId = await p.evaluate(() => document.getElementById('sylSel').value)
  const s2 = await L.step(p, `C0b details typed on W5 OWN's ${e1} (☰ Show All → Edit)`, async () => showAllEdit(p, e1, { Name: 'W5 OWN DETAIL', Hours: '2.5 Hrs' }))
  await T.trkReload(p, 'C0 his own chart with details')
  await T.pickFrom(p, '#sylSel', /^2026/)
  if ((await T.picked(p, '#activeSel')) !== stA.name) await T.pickFrom(p, '#activeSel', stA.name)
  const s3 = await L.step(p, `C0c a DCO mark for ${stA.name} on ${e2}`, async () => T.grade(p, e2, 'DCO'))
  const s4 = await L.step(p, `C0d the pace for ${stA.name}: 2.5 a week`, async () => { await p.fill('#epwIn', '2.5'); await T.sleep(300) }, { put: [/:pace:/], only: true })
  await T.trkReload(p, 'C0 a mark and a pace')
  await L.shot(p, 'c0-before-export')
  table.push({ step: 'C0', width: 'desktop', did: `setup: ⧉ Duplicate 2026 → "W5 OWN"; details on its ${e1}; DCO on ${e2} for ${stA.name}; pace 2.5/wk`, after: 'all there after a reload', rows: `dup: ${T.rowsLine(s1)} ‖ details: ${T.rowsLine(s2)} ‖ mark: ${T.rowsLine(s3)} ‖ pace: ${T.rowsLine(s4)}`, pics: ['c0-before-export'] })
  const atExport = await T.trkPic(p)

  /* ---- C1 ⤓ Export, charts only; C2 charts + students & marks — neither writes anything ---- */
  let fileC, fileS
  const c1 = await L.step(p, 'C1 ⤓ Export… every chart (no students)', async () => { const r = await T.exportFile(p, { charts: true, students: false }); fileC = r; return r.conf }, { none: true })
  writeFileSync(resolve(TMP, 'charts.json'), fileC.text)
  const jc = JSON.parse(fileC.text)
  L.check('C1 the charts file holds his own chart with its details, and no student', !!jc.charts.syllabi[ownId] && JSON.stringify(jc.charts.eventInfoBySyl[ownId] || {}).includes('W5 OWN DETAIL') && !jc.students, `${Object.keys(jc.charts.syllabi).length} charts · file ${fileC.name}`)
  notes.push('C1 export said: ' + String(fileC.conf).replace(/\s+/g, ' '))
  const c2 = await L.step(p, 'C2 ⤓ Export… every chart + students & marks', async () => { const r = await T.exportFile(p, { charts: true, students: true }); fileS = r; return r.conf }, { none: true })
  writeFileSync(resolve(TMP, 'students.json'), fileS.text)
  const js = JSON.parse(fileS.text)
  L.check('C2 the students file holds the mark and the pace', JSON.stringify(js.students).includes('"dco"') && JSON.stringify(js.students).includes('2.5'), `${Object.keys(js.students.byCourse || {}).length} course(s)`)
  notes.push('C2 export said: ' + String(fileS.conf).replace(/\s+/g, ' '))
  await L.shot(p, 'c2-after-exports')
  await T.trkReload(p, 'C2 after the two exports')
  table.push({ step: 'C1–C2', width: 'desktop', did: 'File ⇪ → ⤓ Export…: every chart (C1); every chart + Students & courses (C2); OK', after: `two files; nothing changed`, rows: `C1: ${T.rowsLine(c1)} ‖ C2: ${T.rowsLine(c2)}`, pics: ['c2-after-exports'] })

  /* ---- after the export: his chart deleted, the mark taken back, the pace changed, a new student marked ---- */
  await T.pickFrom(p, '#sylSel', /^W5 OWN/)
  const d1 = await L.step(p, 'C3a 🗑 Delete syllabus W5 OWN (his own), OK', async () => { await T.menu(p, 'syl', 'delSyl'); await T.dlg(p, {}); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
  L.check('C3a his chart and its details are gone', !(await T.opts(p, '#sylSel')).some(o => bare(o) === 'W5 OWN') && !Object.keys(await L.rows(p)).some(k => k.includes(ownId)), (await T.opts(p, '#sylSel')).join(' · '))
  T.oneBatch('C3a 🗑 Delete his own chart', d1)
  await T.pickFrom(p, '#sylSel', /^2026/)
  if ((await T.picked(p, '#activeSel')) !== stA.name) await T.pickFrom(p, '#activeSel', stA.name)
  const d2 = await L.step(p, `C3b the mark on ${e2} taken back (Not done)`, async () => T.grade(p, e2, 'Not done'))
  const d3 = await L.step(p, 'C3c the pace changed to 4', async () => { await p.fill('#epwIn', '4'); await T.sleep(300) })
  const d4 = await L.step(p, 'C3d + Add student "W5 LATE"', async () => { await p.click('#addStu'); await T.dlg(p, { value: 'W5 LATE' }); await T.sleep(400) })
  const lateId = (await p.evaluate(() => window.__coreForTests.rosterNow())).find(r => r.name === 'W5 LATE').id
  const d5 = await L.step(p, `C3e a DCO mark for W5 LATE on ${e1}`, async () => T.grade(p, e1, 'DCO'))
  await T.trkReload(p, 'C3 the changes after the export')
  await L.shot(p, 'c3-changed-since-export')
  table.push({ step: 'C3', width: 'desktop', did: `after the export: 🗑 Delete W5 OWN; Not done on ${e2}; pace 4; + Add "W5 LATE"; DCO on ${e1} for him`, after: 'all there after a reload',
    rows: `delete: ${T.rowsLine(d1)} ‖ undone mark: ${T.rowsLine(d2)} ‖ pace: ${T.rowsLine(d3)} ‖ add: ${T.rowsLine(d4)} ‖ his mark: ${T.rowsLine(d5)}`, pics: ['c3-changed-since-export'] })

  /* ---- C4 ⇪ Import the charts file: "Replace it" for each chart already here ---- */
  const beforeC4 = await T.trkPic(p)
  let asked4
  const c4 = await L.step(p, 'C4 ⇪ Import… the charts file (Replace it for each chart here)', async () => {
    asked4 = await T.importFile(p, resolve(TMP, 'charts.json'), () => 'ok')
  })
  notes.push('C4 import asked: ' + asked4.map(a => `"${a.msg.slice(0, 90)}" → ${a.ans}`).join(' | '))
  notes.push(`C4 import saved in ${c4.batches.length} change-log batches: ${c4.batches.map(x => `${x.type}/${x.n}`).join(' ')}`)
  await L.shot(p, 'c4-after-import-charts')
  const r4 = await T.trkReload(p, 'C4 ⇪ Import charts')
  L.check('C4 every chart reads EXACTLY as exported — his own back with its layout and details, the order, the deleted list (D120, D464)', canon(r4.t2.charts) === canon(atExport.charts),
    canon(r4.t2.charts) === canon(atExport.charts) ? `${r4.t2.charts.order.length} charts` : L.stateDiff(atExport.charts, r4.t2.charts).slice(0, 8).join(' || '))
  L.check('C4 his chart is back in the dropdown', r4.t2.screen.chartList.some(o => bare(o) === 'W5 OWN'), r4.t2.screen.chartList.join(' · '))
  L.check('C4 a chart import touches no student, mark, date, pace or course (every student record reads as before the import)', canon(r4.t2.students) === canon(beforeC4.students),
    canon(r4.t2.students) === canon(beforeC4.students) ? 'unchanged' : L.stateDiff(beforeC4.students, r4.t2.students).slice(0, 8).join(' || '))
  await L.shot(p, 'c4-after-reload')
  table.push({ step: 'C4', width: 'desktop', did: 'File ⇪ → Import… the charts file; "Replace it" for each chart already here; OK', after: `charts as exported: ${r4.t2.screen.chartList.join(', ')}`, rows: T.rowsLine(c4), pics: ['c4-after-import-charts', 'c4-after-reload'] })

  /* ---- C5 ⇪ Import the students file: skip the charts, Yes to students & marks ---- */
  let asked5
  const c5 = await L.step(p, 'C5 ⇪ Import… the students file (Skip each chart; Yes to students & marks)', async () => {
    asked5 = await T.importFile(p, resolve(TMP, 'students.json'), msg => (/already exists/.test(msg) ? 'cancel' : 'ok'))
  })
  notes.push('C5 import asked: ' + asked5.map(a => `"${a.msg.slice(0, 90)}" → ${a.ans}`).join(' | '))
  notes.push(`C5 import saved in ${c5.batches.length} change-log batches: ${c5.batches.map(x => `${x.type}/${x.n}`).join(' ')}`)
  await L.shot(p, 'c5-after-import-students')
  const r5 = await T.trkReload(p, 'C5 ⇪ Import students & marks')
  await T.pickFrom(p, '#sylSel', /^2026/)
  if ((await T.picked(p, '#activeSel')) !== stA.name) await T.pickFrom(p, '#activeSel', stA.name)
  const gA = await T.gradeOf(p, e2), paceA = await paceOf(p, stA.id)
  L.check(`C5 ${stA.name}'s mark and pace are the file's again (DCO on ${e2}, 2.5/wk)`, gA === 'dco' && String(paceA && paceA.epw) === '2.5', `${e2}: ${gA} · pace ${JSON.stringify(paceA)}`)
  await L.shot(p, 'c5-after-reload-studentA')
  await T.pickFrom(p, '#activeSel', 'W5 LATE')
  const gL = await T.gradeOf(p, e1)
  L.check('C5 W5 LATE — not in the file — keeps his mark (D132: an import never deletes anyone\'s marks)', gL === 'dco' && (await T.opts(p, '#activeSel')).includes('W5 LATE'), `${e1}: ${gL}`)
  await L.shot(p, 'c5-after-reload-late')
  table.push({ step: 'C5', width: 'desktop', did: 'File ⇪ → Import… the students file; "Skip this one" for each chart; Yes to students & marks; OK', after: `${stA.name}: ${e2} ${gA}, pace ${paceA && paceA.epw}; W5 LATE: ${e1} ${gL}`, rows: T.rowsLine(c5), pics: ['c5-after-import-students', 'c5-after-reload-studentA', 'c5-after-reload-late'] })
} catch (e) {
  L.check('W5 part C ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part C — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'C', table, notes, errors }) ? 1 : 0
