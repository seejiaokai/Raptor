/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part B (30 Sep 26): the charts and the courses —
   a structural chart edit (+ Flight, moved, a prerequisite line from ST-01) then ✓ Save changes; + Add syllabus;
   details typed on a built-in (☰ Show All's Edit), 🗑 Delete that built-in, ↺ Restore it from ⇅ Reorder syllabi (its
   details must come back — D127, D464); a mark on a course, 🗑 Delete the course, ↺ Restore it from ⇅ Reorder courses
   (its students and mark must come back — D128). Each: the rows it wrote, named by its batch; a reload gives it all back
   and writes nothing.
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-b.json node dbrA-W5-b.mjs */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'
import { reveal } from './trk-lib.mjs'

const errors = [], table = [], notes = []
const CHART = /^tracker\/v3:master:chart:/, LAY = /^tracker\/v3:master:lay:/, INFO = /^tracker\/v3:master:info:/, COURSE = /^tracker\/v3:master:course:/
const arranging = p => p.locator('#arrTools.on').count().then(n => n > 0)
async function tool(p, label) { await p.locator('#arrTools button', { hasText: label }).first().click(); await T.sleep(200) }
async function dragBy(p, id, dx, dy) {
  await reveal(p, id)
  const b = await T.ball(p, id).boundingBox(); const c = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  await p.mouse.move(c.x, c.y); await p.mouse.down()
  for (let i = 1; i <= 8; i++) await p.mouse.move(c.x + dx * i / 8, c.y + dy * i / 8)
  await p.mouse.up(); await T.sleep(400)
}
async function clickBall(p, id) { await reveal(p, id); const b = await T.ball(p, id).boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await T.sleep(400) }
/* ☰ Show All → one row's Edit → a field by its label → Save (the second door to a ball's details, needing no student) */
async function showAllEdit(p, id, fields) {
  await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await T.sleep(250)
  await p.fill('#saSearch', id); await T.sleep(300)
  const row = p.locator('#saBody .sarow').filter({ has: p.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  await row.locator('button.sedit').click(); await T.sleep(250)
  for (const [label, v] of Object.entries(fields)) await p.locator('.saedit label', { hasText: label }).locator('input, textarea').first().fill(v)
  await L.shot(p, 'b3-showall-edit')
  await p.locator('.saedit .saedit-btns button.primary').click(); await T.sleep(500)
  const after = (await row.innerText()).replace(/\s+/g, ' ').trim()
  await p.click('#saClose'); await T.sleep(250)
  return after
}

const b = await L.launch()
try {
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'W5b')
  await T.firstBoot(p)
  await T.firstMount(p)
  await T.trkReload(p, 'B0 first mount')

  /* ---- B1 a structural chart edit on 2026, then ✓ Save changes ---- */
  L.check('B1 on the 2026 chart', (await T.picked(p, '#sylSel')) === '2026', await T.picked(p, '#sylSel'))
  const b1a = await L.step(p, 'B1a Edit chart layout on, + Flight "W5-NEW"', async () => {
    await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300)
    await tool(p, '+ Flight')
    return await T.dlg(p, { value: 'W5-NEW' })
  })
  notes.push('B1a + Flight asked: ' + String(b1a.ret).replace(/\s+/g, ' '))
  L.check('B1a the new ball is on the chart', await T.ball(p, 'W5-NEW').count() > 0)
  const b1b = await L.step(p, 'B1b ✋ Move: the new ball dragged clear', async () => { await tool(p, 'Move'); await dragBy(p, 'W5-NEW', 180, 60) })
  const b1c = await L.step(p, 'B1c → Connect: ST-01 then W5-NEW (a prerequisite line)', async () => {
    await tool(p, 'Connect'); await clickBall(p, 'ST-01'); await clickBall(p, 'W5-NEW')
    if (await T.dlgUp(p, 600)) return await T.dlg(p, {})
  })
  await tool(p, 'Move')
  await L.shot(p, 'b1-edit-unsaved')
  const b1d = await L.step(p, 'B1d Done editing chart', async () => { await T.menu(p, 'syl', 'arrangeBtn') })
  L.check('B1 ✓ Save changes is lit (the structure edit is not saved yet)', await p.locator('#saveChanges').count() > 0)
  const b1 = await L.step(p, 'B1 ✓ Save changes', async () => { await p.click('#saveChanges'); await T.sleep(600) }, { put: [CHART], also: [LAY], only: true })
  T.oneBatch('B1 ✓ Save changes', b1)
  L.check('B1 ✓ Save changes — the chart row is written, and the button goes', !(await p.locator('#saveChanges').count()) && b1.put.includes('tracker/v3:master:chart:sb2026'), T.rowsLine(b1))
  const def = await p.evaluate(() => { const r = JSON.parse(localStorage.getItem('raptor:tracker/v3:master:chart:sb2026')); const e = (r.def || []).find(x => x.id === 'W5-NEW'); return e || null })
  L.check('B1 ✓ Save changes — the stored chart holds W5-NEW, needing ST-01', !!def && JSON.stringify(def).includes('ST-01'), JSON.stringify(def))
  await L.shot(p, 'b1-saved')
  const r1 = await T.trkReload(p, 'B1 ✓ Save changes')
  L.check('B1 after the reload the new ball is drawn', await T.ball(p, 'W5-NEW').count() > 0 && r1.t2.charts.syllabi.sb2026.some(e => e.id === 'W5-NEW'))
  await reveal(p, 'W5-NEW'); await L.shot(p, 'b1-after-reload')
  table.push({ step: 'B1', width: 'desktop', did: 'Syllabus ✎ → Edit chart layout; + Flight "W5-NEW"; ✋ Move it; → Connect ST-01 → W5-NEW; Done; ✓ Save changes', after: `2026 holds W5-NEW (needs ST-01), ${r1.t2.charts.syllabi.sb2026.length} events`,
    rows: `+Flight: ${T.rowsLine(b1a)} ‖ move: ${T.rowsLine(b1b)} ‖ connect: ${T.rowsLine(b1c)} ‖ done: ${T.rowsLine(b1d)} ‖ SAVE: ${T.rowsLine(b1)}`, pics: ['b1-edit-unsaved', 'b1-saved', 'b1-after-reload'] })

  /* ---- B2 + Add syllabus ---- */
  /* a chart nobody has placed yet carries no place (`ord`) — the first write of the order places each (part A, A5) */
  const unplaced2 = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:chart:')).filter(k => typeof JSON.parse(localStorage.getItem(k)).ord !== 'number').length)
  notes.push(`B2 before + Add syllabus, ${unplaced2} chart rows carried no place yet`)
  const b2 = await L.step(p, 'B2 + Add syllabus "W5 EMPTY"', async () => {
    await T.menu(p, 'syl', 'addSyl'); await T.dlg(p, { value: 'W5 EMPTY' })
    await p.evaluate(() => window.__coreForTests.whenLoaded()); await T.sleep(400)
  }, { put: [CHART, LAY], only: true })
  L.check('B2 + Add syllabus — the new chart row and its blank layout (and the first placing of each chart that had none)', b2.put.filter(k => CHART.test(k)).length === 1 + unplaced2 && b2.put.filter(k => LAY.test(k)).length === 1, T.rowsLine(b2))
  T.oneBatch('B2 + Add syllabus', b2)
  const bare = s => String(s || '').replace(/ ✎$/, '')
  L.check('B2 + Add syllabus — the new chart is on screen, last in the dropdown', bare(await T.picked(p, '#sylSel')) === 'W5 EMPTY' && bare((await T.opts(p, '#sylSel')).slice(-1)[0]) === 'W5 EMPTY', (await T.opts(p, '#sylSel')).join(' · '))
  await L.shot(p, 'b2-added')
  const r2 = await T.trkReload(p, 'B2 + Add syllabus')
  L.check('B2 after the reload he is on W5 EMPTY, last in the list', bare(r2.t2.screen.chart) === 'W5 EMPTY' && bare(r2.t2.screen.chartList.slice(-1)[0]) === 'W5 EMPTY', r2.t2.screen.chartList.join(' · '))
  await L.shot(p, 'b2-after-reload')
  table.push({ step: 'B2', width: 'desktop', did: 'Syllabus ✎ → + Add syllabus "W5 EMPTY"', after: `on ${r2.t2.screen.chart} · charts ${r2.t2.screen.chartList.join(', ')}`, rows: T.rowsLine(b2), pics: ['b2-added', 'b2-after-reload'] })

  /* ---- B3 details on a built-in, delete it, ↺ Restore it ---- */
  await T.pickFrom(p, '#sylSel', '2024')
  const e24 = (await T.firstBalls(p, 1))[0]
  const b3e = await L.step(p, `B3a details typed on 2024's ${e24} (☰ Show All → Edit)`, async () => showAllEdit(p, e24, { Name: 'W5 TYPED ON 2024' }), { put: [INFO], only: true })
  L.check('B3a ONE details row, for 2024 and that ball', b3e.put.length === 1 && b3e.put[0].startsWith('tracker/v3:master:info:sb2024:'), T.rowsLine(b3e))
  T.oneBatch('B3a details typed', b3e)
  await T.trkReload(p, 'B3a details on 2024')
  const b3d = await L.step(p, 'B3b 🗑 Delete syllabus 2024 (a built-in), OK', async () => {
    await T.menu(p, 'syl', 'delSyl'); const q = await T.dlg(p, {}); await p.evaluate(() => window.__coreForTests.whenLoaded()); return q
  }, { put: [CHART], also: [/^tracker\/v3:[^:]+:plan$/, LAY, /^tracker\/v3:[^:]+:sb2024:/], only: true })
  notes.push('B3b the delete question: ' + String(b3d.ret).replace(/\s+/g, ' '))
  T.oneBatch('B3b 🗑 Delete a built-in', b3d)
  L.check('B3b 2024 is gone from the dropdown; its details row is KEPT (a built-in keeps what was typed)', !(await T.opts(p, '#sylSel')).includes('2024') && Object.keys(await L.rows(p)).some(k => k.startsWith('tracker/v3:master:info:sb2024:')), (await T.opts(p, '#sylSel')).join(' · '))
  await L.shot(p, 'b3-deleted')
  const r3d = await T.trkReload(p, 'B3b 🗑 Delete a built-in')
  L.check('B3b after the reload 2024 is still gone', !r3d.t2.screen.chartList.includes('2024') && r3d.t2.charts.deleted.includes('sb2024'), r3d.t2.screen.chartList.join(' · '))
  await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
  L.check('B3c ⇅ Reorder syllabi offers 2024 under the deleted built-ins', (await T.ordHidden(p)).includes('2024'), JSON.stringify(await T.ordHidden(p)))
  await L.shot(p, 'b3-reorder-offers-restore')
  const b3r = await L.step(p, 'B3c ↺ Restore 2024 (in ⇅ Reorder syllabi)', async () => {
    await p.locator('#ordHidden .ordrow', { hasText: '2024' }).locator('button', { hasText: 'Restore' }).click(); await T.sleep(400)
  }, { put: [CHART], only: true })
  L.check('B3c ↺ Restore — ONE chart row (2024) written', b3r.put.length === 1 && b3r.put[0] === 'tracker/v3:master:chart:sb2024', T.rowsLine(b3r))
  T.oneBatch('B3c ↺ Restore a built-in', b3r)
  /* the restore already put it back in its place (last); an unchanged list saved again changes nothing */
  const b3s = await L.step(p, 'B3d Save order, the list unchanged (after the restore)', async () => { await p.click('#ordSave') }, { none: true })
  const list3 = await T.opts(p, '#sylSel')
  L.check('B3d 2024 is back in the dropdown', list3.includes('2024'), list3.join(' · '))
  await L.shot(p, 'b3-restored')
  const r3 = await T.trkReload(p, 'B3d ↺ Restore a built-in, Save order')
  L.check('B3d after the reload 2024 is back and its typed details with it (D127, D464)', r3.t2.screen.chartList.includes('2024') && JSON.stringify((r3.t2.charts.eventInfoBySyl || {}).sb2024 || {}).includes('W5 TYPED ON 2024'), JSON.stringify((r3.t2.charts.eventInfoBySyl || {}).sb2024 || null))
  await T.pickFrom(p, '#sylSel', '2024')
  await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await p.fill('#saSearch', e24); await T.sleep(400)
  const saRow = (await p.locator('#saBody .sarow').first().innerText()).replace(/\s+/g, ' ')
  L.check('B3d ☰ Show All on the restored 2024 shows the typed name', saRow.includes('W5 TYPED ON 2024'), saRow)
  await L.shot(p, 'b3-after-reload-showall')
  await p.click('#saClose'); await T.sleep(200)
  table.push({ step: 'B3', width: 'desktop', did: `details on 2024's ${e24} via ☰ Show All (reload); 🗑 Delete syllabus 2024 (reload); ⇅ Reorder syllabi → ↺ Restore 2024 → Save order`, after: `2024 back; ${e24} reads "W5 TYPED ON 2024"`,
    rows: `details: ${T.rowsLine(b3e)} ‖ delete: ${T.rowsLine(b3d)} ‖ restore: ${T.rowsLine(b3r)} ‖ save order: ${T.rowsLine(b3s)}`, pics: ['b3-showall-edit', 'b3-deleted', 'b3-reorder-offers-restore', 'b3-restored', 'b3-after-reload-showall'] })

  /* ---- B4 a course with a mark on it: 🗑 Delete it, ↺ Restore it ---- */
  await T.pickFrom(p, '#sylSel', '2026')
  const stA = (await p.evaluate(() => window.__coreForTests.rosterNow()))[0]
  if ((await T.picked(p, '#activeSel')) !== stA.name) await T.pickFrom(p, '#activeSel', stA.name)
  const ev = (await T.firstBalls(p, 2))[1]
  const b4m = await L.step(p, `B4a a DCO mark for ${stA.name} on ${ev}`, async () => { await T.grade(p, ev, 'DCO') })
  L.check('B4a the mark is on', (await T.gradeOf(p, ev)) === 'dco')
  await T.trkReload(p, 'B4a a mark')
  const b4c = await L.step(p, 'B4b + Add course "W5 KEEP" (a second course)', async () => { await T.menu(p, 'course', 'addCourse'); await T.dlg(p, { value: 'W5 KEEP' }); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
  await T.pickFrom(p, '#courseSel', '26ABSG')
  const courseId = await p.evaluate(() => document.getElementById('courseSel').value)
  const b4d = await L.step(p, 'B4c 🗑 Delete course 26ABSG, OK', async () => {
    await T.menu(p, 'course', 'delCourse'); const q = await T.dlg(p, {}); await p.evaluate(() => window.__coreForTests.whenLoaded()); return q
  }, { put: [COURSE], only: true })
  notes.push('B4c the delete question: ' + String(b4d.ret).replace(/\s+/g, ' '))
  T.oneBatch('B4c 🗑 Delete a course', b4d)
  L.check('B4c ONE course row, now marked deleted; his enrolment and mark rows kept', b4d.put.length === 1 && JSON.parse((await L.rows(p))[b4d.put[0]]).deleted === true && Object.keys(await L.rows(p)).some(k => k.startsWith(`tracker/v3:${courseId}:sb2026:m:`)), T.rowsLine(b4d))
  await L.shot(p, 'b4-deleted')
  const r4d = await T.trkReload(p, 'B4c 🗑 Delete course')
  L.check('B4c after the reload 26ABSG is not in the course list', !r4d.t2.screen.courseList.includes('26ABSG'), r4d.t2.screen.courseList.join(' · '))
  await T.menu(p, 'course', 'ordCourse'); await p.waitForSelector('#ordModal[data-ord="course"]', { state: 'visible' })
  L.check('B4d ⇅ Reorder courses offers 26ABSG under the deleted courses', (await T.ordHidden(p)).includes('26ABSG'), JSON.stringify(await T.ordHidden(p)))
  await L.shot(p, 'b4-reorder-offers-restore')
  const b4r = await L.step(p, 'B4d ↺ Restore 26ABSG (in ⇅ Reorder courses)', async () => {
    await p.locator('#ordHidden .ordrow', { hasText: '26ABSG' }).locator('button', { hasText: 'Restore' }).click(); await T.sleep(400)
  }, { put: [COURSE], only: true })
  L.check('B4d ↺ Restore — ONE course row (its own id), no longer marked deleted', b4r.put.length === 1 && b4r.put[0] === 'tracker/v3:master:course:' + courseId && !JSON.parse((await L.rows(p))[b4r.put[0]]).deleted, T.rowsLine(b4r))
  T.oneBatch('B4d ↺ Restore a course', b4r)
  const b4s = await L.step(p, 'B4e Save order, the list unchanged (after the restore)', async () => { await p.click('#ordSave') }, { none: true })
  await L.shot(p, 'b4-restored')
  const r4 = await T.trkReload(p, 'B4e ↺ Restore a course, Save order')
  await T.pickFrom(p, '#courseSel', '26ABSG')
  const back = await T.trkPic(p)
  L.check('B4e after the reload 26ABSG is back with its students and the mark (D128)', back.screen.courseList.includes('26ABSG') && back.screen.crewList.length === 2 && (await T.gradeOf(p, ev)) === 'dco', `${back.screen.courseList.join(' · ')} · crew ${back.screen.crewList.join(', ')} · ${ev} ${await T.gradeOf(p, ev)}`)
  await reveal(p, ev); await L.shot(p, 'b4-after-reload-back')
  table.push({ step: 'B4', width: 'desktop', did: `DCO on ${ev} for ${stA.name}; + Add course W5 KEEP; 🗑 Delete course 26ABSG (reload); ⇅ Reorder courses → ↺ Restore 26ABSG → Save order (reload)`, after: `courses ${back.screen.courseList.join(', ')}; 26ABSG crew ${back.screen.crewList.join(', ')}; ${ev} DCO`,
    rows: `mark: ${T.rowsLine(b4m)} ‖ add course: ${T.rowsLine(b4c)} ‖ delete: ${T.rowsLine(b4d)} ‖ restore: ${T.rowsLine(b4r)} ‖ save order: ${T.rowsLine(b4s)}`, pics: ['b4-deleted', 'b4-reorder-offers-restore', 'b4-restored', 'b4-after-reload-back'] })
} catch (e) {
  L.check('W5 part B ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part B — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'B', table, notes, errors }) ? 1 : 0
