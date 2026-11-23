// S6 reproduction from a clean world, hand-sized steps: a course copied into 149 by Export / Import, and what one squadron's
// choice of student and chart does to what the OTHER squadron reopens on. Every press is the app's own; nothing is planted.
import { mk, closeAll, finish, pic, picsFor, note, step, check, T, pickCourse, pickCrew, pickSyl, info, sleep, signIn } from './ja-lib.mjs'
import { openTrk, waitTrk, move } from './ja-fx.mjs'
import { addCourse, addStudent, grade } from './ja-lib.mjs'
import { exportIt, importIt } from './ja-xlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-06r v1', SZ)
picsFor(`j06r-${SZ}`)
const place = async s => { const t = await T(s); const i = await info(s); return { sq: (t.sq || '').slice(0, 3), course: t.course?.now, crew: t.crew?.now ?? null, chart: (t.syl?.now || '').replace(' ✎', ''), students: i.students.length, overall: i.overall } }
try {
  const s = await mk(SZ)
  await step('one course of 142, two students, copied into 149 by Export and Import', async () => {
    await signIn(s, 'ad', 'a'); await openTrk(s, '142')
    await addCourse(s, 'JR-COPY'); await addStudent(s, 'JRALPHA'); await addStudent(s, 'JRBRAVO')
    await pickCrew(s, 'JRALPHA'); await grade(s, 'ST-01', 'dco')
    const f = await exportIt(s, 's6r-full', { charts: true, students: true, all: true })
    await move(s, '149')
    await importIt(s, f.path, { charts: 'skip', students: true }); await waitTrk(s, '149')
    await pickCourse(s, 'JR-COPY')
    const t = await T(s); check('the copy is on 149 with both students', t.course.list.includes('JR-COPY') && t.crew.list.length === 2, t.crew)
  })
  await step('A: each squadron on a different student', async () => {
    await pickCrew(s, 'JRALPHA'); const p149 = await place(s); note('149 left on: ' + JSON.stringify(p149))
    await move(s, '142'); await pickCourse(s, 'JR-COPY'); await pickCrew(s, 'JRBRAVO'); const p142 = await place(s); note('142 left on: ' + JSON.stringify(p142))
    await move(s, '149'); await sleep(s, 500); const back = await place(s); note('149 reopened on: ' + JSON.stringify(back))
    check('S6-R1 149 reopens on the student last chosen on 149 (JRALPHA)', back.crew === 'JRALPHA', back); await pic(s, '01-149-student-after-142-chose')
    await move(s, '142'); await sleep(s, 400); const b2 = await place(s)
    check('S6-R1c 142 reopens on its own student (JRBRAVO)', b2.crew === 'JRBRAVO', b2)
  })
  await step('B: 142 changes its chart', async () => {
    await pickCourse(s, 'JR-COPY'); await pickSyl(s, '2024'); await sleep(s, 300); const p142 = await place(s); note('142 left on: ' + JSON.stringify(p142))
    await move(s, '149'); await sleep(s, 500); const back = await place(s); note('149 reopened on: ' + JSON.stringify(back))
    check('S6-R2 149 keeps the chart it was on (2026)', back.chart === '2026', back); await pic(s, '02-149-chart-after-142-chose')
    check('S6-R2b 149 still opens on its students', back.students === 2, back.students)
    await pickSyl(s, '2026'); await sleep(s, 300); const r = await place(s); note('149 back on 2026 by hand: ' + JSON.stringify(r))
    check('S6-R2c nothing lost: the 149 copy holds both students and the mark on 2026', r.students === 2 && /Done=1 /.test((await (async () => { await pickCrew(s, 'JRALPHA'); return info(s) })()).overall), r)
  })
  await step('C: control, a course NOT copied keeps its place', async () => {
    await pickCourse(s, '26ABSG'); await pickCrew(s, 'STUDENT B'); await move(s, '142'); await sleep(s, 300); await pickCourse(s, '26ABSG'); await pickCrew(s, 'STUDENT A')
    await move(s, '149'); await sleep(s, 400); const c = await place(s); note('control 149: ' + JSON.stringify(c))
    note('the demo course 26ABSG exists on both squadrons under its own id in each; recorded, not judged')
  })
  await s.ctx.close()
} finally { finish(`j06r-${SZ}`); await closeAll() }
