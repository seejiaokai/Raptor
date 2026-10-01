/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part F (30 Sep 26): the independent scenario designer's
   two highest-ranked Tracker scenarios, then the phone.
   F1 (designer 1) — ⇪ Import of a backup holding a course this browser does NOT have. The file is made through the app in
      a second, separate browser (+ Add course "IMPX", + Add a student, a DCO mark, ⤓ Export with students). Imported into
      a fresh browser: every row the import writes must be named by a change-log batch — the designer suspects the course's
      one-time flags (`…:rostermig`, `…:idmig`, and any `…:idmap` / `v3:links`) are written bare. Reload: the course, its
      student and mark there ONCE, nothing demo added to it.
   F2 (designer 2) — grade ball A; reload; grade ball B; ↶ Undo; reload; ↷ Redo; reload; switching the student away and
      back after each: where the Tracker LANDS (the student picked, the ball in the chart's middle) and whether the "last
      work" rows (`…:last:<student>`, `…:lastStudent`) are named by each step's batch.
   F3 — the phone (390×844): one mark, reload.
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-f.json node dbrA-W5-f.mjs */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const TMP = resolve(tmpdir(), 'dbrA-W5'); mkdirSync(TMP, { recursive: true })
const errors = [], table = [], notes = []
/* the ball in the middle of the chart's view — where the Tracker "landed" */
const landing = p => p.evaluate(() => {
  const bd = document.getElementById('board'); if (!bd) return null
  const b = bd.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2
  let best = null, bd2 = Infinity
  for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); const d = (r.left + r.width / 2 - cx) ** 2 + (r.top + r.height / 2 - cy) ** 2; if (d < bd2) { bd2 = d; best = g.dataset.id } }
  const s = document.getElementById('activeSel')
  return { student: s ? (s.selectedOptions[0] || {}).textContent : null, ball: best }
})
const b = await L.launch()
try {
  /* ================= F1 — the file, made in a second browser ================= */
  const cx = await L.context(b)
  const x = await L.page(cx, errors, 'W5f-maker')
  await T.firstBoot(x); await T.firstMount(x)
  await T.menu(x, 'course', 'addCourse'); await T.dlg(x, { value: 'IMPX' }); await x.evaluate(() => window.__coreForTests.whenLoaded())
  await x.click('#addStu'); await T.dlg(x, { value: 'IMP STUDENT' }); await T.sleep(500)
  const [xb] = await T.firstBalls(x, 1)
  await T.grade(x, xb, 'DCO'); await L.settle(x)
  const file = await T.exportFile(x, { charts: true, students: true })
  const FILE = resolve(TMP, 'impx.json'); writeFileSync(FILE, file.text)
  const fj = JSON.parse(file.text)
  L.check('F1 the file (made in a second browser through the app) holds course IMPX, its student and the mark', JSON.stringify(fj.students.courses).includes('IMPX') && file.text.includes('IMP STUDENT') && file.text.includes('"dco"'), file.name)
  await L.shot(x, 'f1-maker-impx')
  await cx.close()

  /* ================= F1 — imported into a fresh browser ================= */
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'W5f')
  await T.firstBoot(p); await T.firstMount(p)
  const beforeImp = await T.trkPic(p)
  let asked
  const f1 = await L.step(p, 'F1 ⇪ Import… a backup holding a NEW course (Skip each chart; Yes to students & marks)', async () => {
    asked = await T.importFile(p, FILE, msg => (/already exists/.test(msg) ? 'cancel' : 'ok'))
  })
  notes.push('F1 import asked: ' + asked.map(a => `"${a.msg.slice(0, 80)}" → ${a.ans}`).join(' | '))
  notes.push(`F1 import wrote: ${T.rowsLine(f1)} · bare (no batch names them): ${f1.bare.join(', ') || 'none'}`)
  const flags = [...f1.put, ...f1.del].filter(k => /:(rostermig|idmig|idmap)$|v3:links$/.test(k))
  L.check('F1 the new course\'s one-time flags are named by a batch (none written bare)', !f1.bare.length, f1.bare.length ? `BARE: ${f1.bare.join(', ')}` : `flags written: ${flags.join(', ') || 'none'} — all named`)
  await L.shot(p, 'f1-after-import')
  const r1 = await T.trkReload(p, 'F1 ⇪ Import a new course')
  await T.pickFrom(p, '#courseSel', 'IMPX')
  const crewX = await T.opts(p, '#activeSel')
  const courses = (await T.trkPic(p)).screen.courseList
  L.check('F1 after the reload: IMPX once, at the bottom of the course list (D375), its one student with his DCO mark; nothing demo on it', courses.filter(c => c === 'IMPX').length === 1 && courses[courses.length - 1] === 'IMPX' && crewX.length === 1 && crewX[0] === 'IMP STUDENT' && (await T.gradeOf(p, xb)) === 'dco',
    `courses ${courses.join(', ')} · IMPX crew ${crewX.join(', ')} · ${xb} ${await T.gradeOf(p, xb)}`)
  L.check('F1 the demo course 26ABSG is untouched by the import (same students and records as before it)', JSON.stringify(r1.t2.students.byCourse[beforeImp.courses[0].id]) === JSON.stringify(beforeImp.students.byCourse[beforeImp.courses[0].id]), '')
  await L.shot(p, 'f1-after-reload-impx')
  table.push({ step: 'F1', width: 'desktop', did: 'a second browser: + Add course IMPX, + Add IMP STUDENT, DCO, ⤓ Export with students; a fresh browser: File → ⇪ Import… that file, Skip each chart, Yes to students & marks, OK; reload', after: `courses ${courses.join(', ')}; IMPX: ${crewX.join(', ')}, ${xb} DCO`, rows: T.rowsLine(f1) + (f1.bare.length ? ` · BARE: ${f1.bare.join(', ')}` : ''), pics: ['f1-maker-impx', 'f1-after-import', 'f1-after-reload-impx'] })
  await ctx.close()

  /* ================= F2 — grade, last work, Undo / Redo, where it lands ================= */
  const c2 = await L.context(b)
  const q = await L.page(c2, errors, 'W5f2')
  await T.firstBoot(q); await T.firstMount(q)
  const [stA, stB] = await q.evaluate(() => window.__coreForTests.rosterNow())
  const balls = await T.firstBalls(q, 40)
  const A = balls[0], B = balls[30]
  const LW = [new RegExp(`^tracker/v3:[^:]+:last:${stA.id}$`), /^tracker\/v3:[^:]+:lastStudent$/]
  const land = []
  const awayAndBack = async label => {
    const l1 = await landing(q)
    await T.pickFrom(q, '#activeSel', stB.name); await T.pickFrom(q, '#activeSel', stA.name)
    const l2 = await landing(q)
    land.push({ label, afterReload: l1, afterSwitchBack: l2 })
    return { l1, l2 }
  }
  const lastRows = async () => Object.fromEntries(Object.entries(await L.rows(q)).filter(([k]) => LW.some(re => re.test(k))))
  const g1 = await L.step(q, `F2a grade ball A (${A}) DCO`, async () => T.grade(q, A, 'DCO'))
  L.check('F2a the grade\'s batch names the mark AND the last-work rows', LW.every(re => g1.put.some(k => re.test(k))) && !g1.bare.length, T.rowsLine(g1))
  await T.trkReload(q, 'F2a grade A')
  const la = await awayAndBack('after grading A, reload')
  L.check(`F2a after the reload the Tracker lands on ${stA.name} and ball A (${A})`, la.l1.student === stA.name && la.l1.ball === A, JSON.stringify(la))
  await L.shot(q, 'f2a-landing')
  const g2 = await L.step(q, `F2b grade ball B (${B}) DCO`, async () => T.grade(q, B, 'DCO'))
  L.check('F2b the grade\'s batch names the mark AND the last-work row it changed', g2.put.some(k => LW[0].test(k)) && !g2.bare.length, T.rowsLine(g2))
  const lastAfterB = await lastRows()
  const u = await L.step(q, 'F2c ↶ Undo (top bar) — the grade on B', async () => { await q.click('#trUndoBtn'); await T.sleep(500) })
  const lastAfterUndo = await lastRows()
  notes.push(`F2c ↶ Undo wrote: ${T.rowsLine(u)}; the last-work rows ${JSON.stringify(lastAfterB) === JSON.stringify(lastAfterUndo) ? 'were NOT changed (still name ' + B + ')' : 'changed'}: ${JSON.stringify(lastAfterUndo)}`)
  L.check(`F2c B (${B}) is unmarked, A kept`, !(await T.gradeOf(q, B)) && (await T.gradeOf(q, A)) === 'dco')
  await T.trkReload(q, 'F2c ↶ Undo the grade on B')
  const lu = await awayAndBack('after ↶ Undo of B, reload')
  notes.push(`F2c after ↶ Undo + reload the Tracker lands on ${JSON.stringify(lu.l1)} (switch away and back: ${JSON.stringify(lu.l2)}) — B's grade is gone`)
  await L.shot(q, 'f2c-landing-after-undo')
  /* the history is this session's: a Redo needs the Undo in the same session — grade B again, Undo, Redo */
  await L.step(q, `F2d grade B (${B}) again`, async () => T.grade(q, B, 'DCO'))
  await L.step(q, 'F2d ↶ Undo', async () => { await q.click('#trUndoBtn'); await T.sleep(500) })
  const rd = await L.step(q, 'F2d ↷ Redo (top bar) — the grade on B', async () => { await q.click('#trRedoBtn'); await T.sleep(500) })
  notes.push(`F2d ↷ Redo wrote: ${T.rowsLine(rd)}`)
  L.check(`F2d B (${B}) is DCO again`, (await T.gradeOf(q, B)) === 'dco')
  await T.trkReload(q, 'F2d ↷ Redo the grade on B')
  const lr = await awayAndBack('after ↷ Redo of B, reload')
  L.check(`F2d after the Redo + reload the Tracker lands on ${stA.name} and B (${B})`, lr.l1.student === stA.name && lr.l1.ball === B, JSON.stringify(lr))
  await L.shot(q, 'f2d-landing-after-redo')
  notes.push('F2 landings: ' + JSON.stringify(land))
  table.push({ step: 'F2', width: 'desktop', did: `grade A=${A} (reload, switch away/back); grade B=${B} → ↶ (reload, switch); grade B → ↶ → ↷ (reload, switch)`, after: land.map(x => `${x.label}: lands ${x.afterReload.student}/${x.afterReload.ball}, after switch ${x.afterSwitchBack.ball}`).join(' ‖ '),
    rows: `grade A: ${T.rowsLine(g1)} ‖ grade B: ${T.rowsLine(g2)} ‖ ↶: ${T.rowsLine(u)} ‖ ↷: ${T.rowsLine(rd)}`, pics: ['f2a-landing', 'f2c-landing-after-undo', 'f2d-landing-after-redo'] })
  await c2.close()

  /* ================= F3 — the phone: one mark, reload ================= */
  const pc = await L.context(b, { phone: true })
  const ph = await L.page(pc, errors, 'W5f-phone')
  await T.firstBoot(ph); await T.firstMount(ph)
  const [pb] = await T.firstBalls(ph, 1)
  const [pst] = await ph.evaluate(() => window.__coreForTests.rosterNow())
  const f3 = await L.step(ph, `F3 (phone) a DCO mark on ${pb} by a finger's tap`, async () => T.grade(ph, pb, 'DCO', { touch: true }), { put: [new RegExp(`:m:${pst.id}$`)], also: [/:last:/, /:lastStudent$/, /:d:/], only: true })
  T.oneBatch('F3 (phone) a mark', f3)
  await L.shot(ph, 'f3-phone-marked')
  await T.trkReload(ph, 'F3 (phone) a mark')
  L.check('F3 (phone) after the reload the mark is there', (await T.gradeOf(ph, pb)) === 'dco', String(await T.gradeOf(ph, pb)))
  await L.shot(ph, 'f3-phone-after-reload')
  table.push({ step: 'F3', width: 'phone', did: `a finger's tap on ${pb}, DCO in the pop-up; reload`, after: `${pb} DCO for ${pst.name}`, rows: T.rowsLine(f3), pics: ['f3-phone-marked', 'f3-phone-after-reload'] })
  await pc.close()
} catch (e) {
  L.check('W5 part F ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part F — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'F', table, notes, errors }) ? 1 : 0
