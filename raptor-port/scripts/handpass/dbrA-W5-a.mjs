/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part A (30 Sep 26): a fresh world's first boot and
   the Tracker's first mount; then the lists — ⇅ Reorder crew, Rename a student, + Add course, ⇅ Reorder courses,
   ⇅ Reorder syllabi, Remove a student. Each: the rows it wrote, every one named by its change-log batch, and only the
   rows it should; then a reload gives the whole Tracker back and writes nothing. Every step asserts the RIGHT
   behaviour, so a re-run is the re-walk.
     HP_URL=http://localhost:4205 HP_SHOTS=…/2026-09-30-dbrA/W5 HP_OUT=…/parts/dbrA-W5-a.json node dbrA-W5-a.mjs */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const errors = [], table = [], notes = []
const ENR = /^tracker\/v3:[^:]+:[^:]+:enr:/, COURSE = /^tracker\/v3:master:course:/, CHART = /^tracker\/v3:master:chart:/
const b = await L.launch()
try {
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'W5a')
  const boot = await T.firstBoot(p)
  const fm = await T.firstMount(p)
  notes.push(`the Tracker's first mount (its one named exempt writer, plan §9 4.1) wrote ${fm.put.length} rows, ${fm.batches.length} batch(es): ${fm.put.join(', ')}`)
  L.check('A0 first mount — writes only Tracker rows (the seed and its one-time flags), nothing of the rest of the app', fm.put.every(T.isTrk) && !fm.del.length, T.rowsLine(fm))
  await L.shot(p, 'a0-first-mount')
  await T.trkReload(p, 'A0 first mount')
  await L.shot(p, 'a0-after-reload')
  table.push({ step: 'A0', width: 'desktop', did: 'fresh world: sign in, open the Tracker the first time, reload', rows: T.rowsLine(fm) + ' (exempt: first mount)', pics: ['a0-first-mount', 'a0-after-reload'] })

  /* ---- A1 ⇅ Reorder crew: STUDENT B above STUDENT A ---- */
  const a1 = await L.step(p, 'A1 ⇅ Reorder crew (B above A, Save order)', async () => {
    await p.click('#ordCrew'); await p.waitForSelector('#ordModal[data-ord="crew"]', { state: 'visible' })
    await T.ordMove(p, 1, 0)
    await L.shot(p, 'a1-reorder-crew-window')
    await p.click('#ordSave')
  }, { put: [ENR], only: true })
  const crew1 = await T.opts(p, '#activeSel')
  L.check('A1 ⇅ Reorder crew — the dropdown and the chips read B, A', crew1[0] === 'STUDENT B' && crew1[1] === 'STUDENT A', JSON.stringify(crew1))
  L.check('A1 ⇅ Reorder crew — ONE enrolment row written (the one that moved)', a1.put.length === 1, T.rowsLine(a1))
  await L.shot(p, 'a1-reorder-crew-saved')
  const r1 = await T.trkReload(p, 'A1 ⇅ Reorder crew')
  L.check('A1 ⇅ Reorder crew — after the reload still B, A', r1.t2.screen.crewList.join() === 'STUDENT B,STUDENT A', JSON.stringify(r1.t2.screen.crewList))
  await L.shot(p, 'a1-after-reload')
  table.push({ step: 'A1', width: 'desktop', did: '⇅ Reorder (Students card): STUDENT B moved above STUDENT A, Save order', after: r1.t2.screen.chips.join(' · '), rows: T.rowsLine(a1), pics: ['a1-reorder-crew-window', 'a1-reorder-crew-saved', 'a1-after-reload'] })

  /* ---- A2 Rename a student (the chip's ✎) ---- */
  const idA = (await p.evaluate(() => window.__coreForTests.rosterNow())).find(r => r.name === 'STUDENT A').id
  const a2 = await L.step(p, 'A2 Rename a student (STUDENT A → W5 RENAMED)', async () => {
    await p.click(`[data-ren="${idA}"]`)
    await T.dlg(p, { value: 'W5 RENAMED' })
  }, { put: [ENR], only: true })
  L.check('A2 Rename — ONE enrolment row written, his own', a2.put.length === 1 && a2.put[0].endsWith(':enr:' + idA), T.rowsLine(a2))
  await L.shot(p, 'a2-renamed')
  const r2 = await T.trkReload(p, 'A2 Rename a student')
  L.check('A2 Rename — after the reload the chip and the dropdown read W5 RENAMED, in its place', r2.t2.screen.crewList.join() === 'STUDENT B,W5 RENAMED', JSON.stringify(r2.t2.screen.crewList))
  await L.shot(p, 'a2-after-reload')
  table.push({ step: 'A2', width: 'desktop', did: 'Students card ✎ on STUDENT A → "W5 RENAMED"', after: r2.t2.screen.chips.join(' · '), rows: T.rowsLine(a2), pics: ['a2-renamed', 'a2-after-reload'] })

  /* ---- A3 + Add course (a second course, for the course order) ---- */
  const a3 = await L.step(p, 'A3 + Add course "W5 SECOND"', async () => {
    await T.menu(p, 'course', 'addCourse')
    await T.dlg(p, { value: 'W5 SECOND' })
    await p.evaluate(() => window.__coreForTests.whenLoaded())
  }, { put: [COURSE, /^tracker\/v3:[^:]+:plan$/], also: [/^tracker\/v3:[^:]+:(rostermig|idmig)$/], only: true })
  L.check('A3 + Add course — ONE course row', a3.put.filter(k => COURSE.test(k)).length === 1, T.rowsLine(a3))
  await L.shot(p, 'a3-course-added')
  const r3 = await T.trkReload(p, 'A3 + Add course')
  L.check('A3 + Add course — after the reload the list reads W5 SECOND, 26ABSG (the newest first, as built)', r3.t2.screen.courseList.join() === 'W5 SECOND,26ABSG', JSON.stringify(r3.t2.screen.courseList))
  await L.shot(p, 'a3-after-reload')
  table.push({ step: 'A3', width: 'desktop', did: 'Course ✎ → + Add course "W5 SECOND"', after: `courses ${r3.t2.screen.courseList.join(', ')} · on ${r3.t2.screen.course}`, rows: T.rowsLine(a3), pics: ['a3-course-added', 'a3-after-reload'] })

  /* ---- A4 ⇅ Reorder courses: 26ABSG back on top ---- */
  const a4 = await L.step(p, 'A4 ⇅ Reorder courses (26ABSG to the top, Save order)', async () => {
    await T.menu(p, 'course', 'ordCourse'); await p.waitForSelector('#ordModal[data-ord="course"]', { state: 'visible' })
    await T.ordMove(p, 1, 0)
    await L.shot(p, 'a4-reorder-courses-window')
    await p.click('#ordSave')
  }, { put: [COURSE], only: true })
  L.check('A4 ⇅ Reorder courses — ONE course row written (the one that moved)', a4.put.length === 1, T.rowsLine(a4))
  await L.shot(p, 'a4-courses-saved')
  const r4 = await T.trkReload(p, 'A4 ⇅ Reorder courses')
  L.check('A4 ⇅ Reorder courses — after the reload 26ABSG, W5 SECOND', r4.t2.screen.courseList.join() === '26ABSG,W5 SECOND', JSON.stringify(r4.t2.screen.courseList))
  await L.shot(p, 'a4-after-reload')
  table.push({ step: 'A4', width: 'desktop', did: 'Course ✎ → ⇅ Reorder courses: 26ABSG ▲ to the top, Save order', after: `courses ${r4.t2.screen.courseList.join(', ')}`, rows: T.rowsLine(a4), pics: ['a4-reorder-courses-window', 'a4-courses-saved', 'a4-after-reload'] })

  /* ---- A5 ⇅ Reorder syllabi: A/G - A/A 2026 to the top ---- */
  const before5 = await T.opts(p, '#sylSel')
  /* a chart nobody has placed yet carries no place (`ord`) on its row (plan §9: the catalogue's own order is no longer
     stored); the FIRST save of the order places every chart, so writes each — a later reorder writes only the moved one */
  const ordsBefore = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:chart:')).map(k => [k.slice(31), JSON.parse(localStorage.getItem(k)).ord]))
  const unplaced = ordsBefore.filter(([, o]) => typeof o !== 'number').length
  notes.push(`A5 before the first syllabus reorder, ${unplaced} of ${ordsBefore.length} chart rows carried no place (ord): ${JSON.stringify(ordsBefore)}`)
  const a5 = await L.step(p, 'A5 ⇅ Reorder syllabi (the last chart to the top, Save order)', async () => {
    await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
    const n = (await T.ordRows(p)).length
    await T.ordMove(p, n - 1, 0)
    await L.shot(p, 'a5-reorder-syllabi-window')
    await p.click('#ordSave')
  }, { put: [CHART], only: true })
  const after5 = await T.opts(p, '#sylSel')
  const want5 = [before5[before5.length - 1], ...before5.slice(0, -1)]
  L.check('A5 ⇅ Reorder syllabi — the dropdown reads the new order', after5.join('|') === want5.join('|'), `${before5.join(' · ')} → ${after5.join(' · ')}`)
  L.check('A5 ⇅ Reorder syllabi — the moved chart, plus each chart that had no place yet (its first placing)', a5.put.length === Math.max(1, unplaced), `${unplaced} unplaced before · ${T.rowsLine(a5)}`)
  await L.shot(p, 'a5-syllabi-saved')
  const r5 = await T.trkReload(p, 'A5 ⇅ Reorder syllabi')
  L.check('A5 ⇅ Reorder syllabi — after the reload the same order', r5.t2.screen.chartList.join('|') === want5.join('|'), r5.t2.screen.chartList.join(' · '))
  await L.shot(p, 'a5-after-reload')
  table.push({ step: 'A5', width: 'desktop', did: 'Syllabus ✎ → ⇅ Reorder syllabi: the last chart ▲ to the top, Save order', after: `charts ${r5.t2.screen.chartList.join(', ')}`, rows: T.rowsLine(a5), pics: ['a5-reorder-syllabi-window', 'a5-syllabi-saved', 'a5-after-reload'] })

  /* ---- A5b a SECOND reorder of the syllabi — now every chart has its place, only the one moved is written ---- */
  const before5b = await T.opts(p, '#sylSel')
  const a5b = await L.step(p, 'A5b ⇅ Reorder syllabi again (the second chart down one, Save order)', async () => {
    await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
    await T.ordMove(p, 1, 2)
    await p.click('#ordSave')
  }, { put: [CHART], only: true })
  const want5b = [before5b[0], before5b[2], before5b[1], ...before5b.slice(3)]
  L.check('A5b ⇅ Reorder syllabi again — ONE chart row written (the one that moved)', a5b.put.length === 1, T.rowsLine(a5b))
  L.check('A5b ⇅ Reorder syllabi again — the dropdown reads the new order', (await T.opts(p, '#sylSel')).join('|') === want5b.join('|'), (await T.opts(p, '#sylSel')).join(' · '))
  const r5b = await T.trkReload(p, 'A5b ⇅ Reorder syllabi again')
  L.check('A5b ⇅ Reorder syllabi again — after the reload the same order', r5b.t2.screen.chartList.join('|') === want5b.join('|'), r5b.t2.screen.chartList.join(' · '))
  await L.shot(p, 'a5b-after-reload')
  table.push({ step: 'A5b', width: 'desktop', did: '⇅ Reorder syllabi again: the second chart ▼ one place, Save order', after: `charts ${r5b.t2.screen.chartList.join(', ')}`, rows: T.rowsLine(a5b), pics: ['a5b-after-reload'] })

  /* ---- back to the demo course (the course dropdown) — a person's own place, never a saved row ---- */
  const a6c = await L.step(p, 'A6-pre switch the course dropdown to 26ABSG', async () => { await T.pickFrom(p, '#courseSel', '26ABSG') }, { none: true })
  table.push({ step: 'A6-pre', width: 'desktop', did: 'Course dropdown → 26ABSG', after: await T.picked(p, '#courseSel'), rows: T.rowsLine(a6c), pics: [] })

  /* ---- A6 Remove a student — with a mark and a pace on him first, so there is something of his to go ---- */
  const idB = (await p.evaluate(() => window.__coreForTests.rosterNow())).find(r => r.name === 'STUDENT B').id
  if ((await T.picked(p, '#activeSel')) !== 'STUDENT B') await T.pickFrom(p, '#activeSel', 'STUDENT B')
  const [e1] = await T.firstBalls(p, 1)
  const a6m = await L.step(p, 'A6a a mark for STUDENT B (DCO on the first ball)', async () => { await T.grade(p, e1, 'DCO') }, { put: [new RegExp(`^tracker/v3:[^:]+:[^:]+:(m|d):${idB}$`)], also: [new RegExp(`^tracker/v3:[^:]+:(last:${idB}|lastStudent)$`)], only: true })
  L.check('A6a the mark is on the ball', (await T.gradeOf(p, e1)) === 'dco', String(await T.gradeOf(p, e1)))
  await T.trkReload(p, 'A6a a mark for STUDENT B')
  const a6 = await L.step(p, 'A6 Remove a student (STUDENT B, ×, OK)', async () => {
    await p.click(`[data-rm="${idB}"]`)
    const q = await T.dlg(p, {})
    return q
  }, { del: [new RegExp(`^tracker/v3:[^:]+:[^:]+:enr:${idB}$`), new RegExp(`^tracker/v3:[^:]+:[^:]+:m:${idB}$`)], also: [new RegExp(`^tracker/v3:[^:]+:(([^:]+:d)|d|last|pace|lulls):${idB}$`), /^tracker\/v3:[^:]+:lastStudent$/], only: true })
  notes.push('A6 the remove question read: ' + String(a6.ret).replace(/\s+/g, ' '))
  const left = await T.opts(p, '#activeSel')
  L.check('A6 Remove — he is gone from the dropdown and the chips', !left.includes('STUDENT B') && left.includes('W5 RENAMED'), JSON.stringify(left))
  await L.shot(p, 'a6-removed')
  const r6 = await T.trkReload(p, 'A6 Remove a student')
  L.check('A6 Remove — after the reload he is still gone, and none of his rows is left', !r6.t2.screen.crewList.includes('STUDENT B') && !Object.keys(await L.rows(p)).some(k => k.includes(idB)), JSON.stringify(r6.t2.screen.crewList))
  await L.shot(p, 'a6-after-reload')
  table.push({ step: 'A6', width: 'desktop', did: 'a DCO mark for STUDENT B (reload), then × on his chip, OK', after: r6.t2.screen.chips.join(' · '), rows: `mark: ${T.rowsLine(a6m)} ‖ remove: ${T.rowsLine(a6)}`, pics: ['a6-removed', 'a6-after-reload'] })
} catch (e) {
  L.check('W5 part A ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part A — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'A', table, notes, errors }) ? 1 : 0
