// S6 imported copies remember their own place: one course copied into 149 by Export / Import, different students and charts picked on each side.
import { mk, closeAll, finish, as, go, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, pickSyl, info, grade, shut, sleep, addStudent } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload } from './ja-fx.mjs'
import { exportIt, importIt } from './ja-xlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-06 v1', SZ)
picsFor(`j06-${SZ}`)
const place = async s => { const t = await T(s); return { sq: (t.sq || '').slice(0, 3), course: t.course?.now, crew: t.crew?.now, syl: (t.syl?.now || '').replace(' ✎', '') } }
const same = (a, b) => a.sq === b.sq && a.course === b.course && a.crew === b.crew && a.syl === b.syl
const done = async s => { const i = await info(s); return +(/Done=(\d+)/.exec(i.overall) || [])[1] }
try {
  const s = await mk(SZ)
  let p142, p149
  await step('fixture and the copy', async () => {
    await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
    const f = await exportIt(s, 's6-full', { charts: true, students: true, all: true })
    check('S6 the copy holds the course', f.text.includes('JA-142') && f.text.includes('JA142B'), f.said)
    await move(s, '149')
    const said = await importIt(s, f.path, { charts: 'skip', students: true }); note('asked: ' + JSON.stringify(said.map(x => x.slice(0, 80))))
    await waitTrk(s, '149'); const t = await T(s); note('149 courses after import: ' + JSON.stringify(t.course.list))
    check('S6 course copied into 149', t.course.list.includes('JA-142') && t.course.list.includes('JA-149'), t.course.list); await pic(s, '01-copied')
  })
  await step('S6 different student and chart on each side', async () => {
    // rosters are per chart: 149 stays on the copied 2026 chart with A; 142 moves to the 2024 chart with a new student of its own
    await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); await sleep(s, 300)
    await grade(s, 'ACG-08', 'dco')
    p149 = await place(s); note('149 place: ' + JSON.stringify(p149)); const d149 = await done(s); check('S6 149 copy of A now has 4', d149 === 4, d149)
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickSyl(s, '2024'); await sleep(s, 300)
    await addStudent(s, 'JA142Z'); await sleep(s, 300)
    p142 = await place(s); note('142 place: ' + JSON.stringify(p142))
    check('S6 the two places differ', p142.crew !== p149.crew && p142.syl !== p149.syl, { p142, p149 })
  })
  const round = async tag => {
    await move(s, '149'); await sleep(s, 400); let g = await place(s); check(`S6 ${tag}: 149 reopens on its own place`, same(g, p149), g); await pic(s, `02-${tag}-149`)
    await move(s, '142'); await sleep(s, 400); g = await place(s); check(`S6 ${tag}: 142 reopens on its own place`, same(g, p142), g); await pic(s, `03-${tag}-142`)
  }
  await step('S6 alternate', async () => { await round('alternate'); await round('alternate2') })
  await step('S6 leave the Tracker and return', async () => {
    await go(s, 'viewsched'); if (!s.desk) await shut(s); await sleep(s, 500)
    await go(s, 'tracker'); if (!s.desk) await shut(s); await waitTrk(s, '142'); let g = await place(s); check('S6 142 after leaving the Tracker', same(g, p142), g)
    await go(s, 'viewsched'); if (!s.desk) await shut(s); await sleep(s, 400); await s.page.waitForTimeout(200)
    const { pickSq } = await import('./jlib.mjs'); await pickSq(s, '149'); if (!s.desk) await shut(s); await sleep(s, 900)
    await go(s, 'tracker'); if (!s.desk) await shut(s); await waitTrk(s, '149'); g = await place(s); check('S6 149 after a pick made away from the Tracker', same(g, p149), g); await pic(s, '04-away-149')
    await move(s, '142')
  })
  await step('S6 sign out and in', async () => {
    await as(s, 'ad', 'a'); await openTrk(s, '142'); let g = await place(s); check('S6 142 after sign-in', same(g, p142), g); await pic(s, '05-signin-142')
    await move(s, '149'); g = await place(s); check('S6 149 after sign-in', same(g, p149), g); await pic(s, '06-signin-149')
  })
  await step('S6 the records on each side', async () => {
    // the mark made on the 149 copy (ACG-08) stays on 149: its A has 4, the 142 original's A keeps 3
    await pickCourse(s, 'JA-142'); await pickSyl(s, '2026'); await pickCrew(s, 'JA142A'); const c149 = await done(s)
    check('S6 the 149 copy keeps the mark made there', c149 === 4, c149)
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickSyl(s, '2026'); await pickCrew(s, 'JA142A'); await sleep(s, 200)
    const o2 = await done(s); check('S6 the 142 original keeps its 3 on 2026', o2 === 3, o2)
    await pickCrew(s, 'JA142B'); const b2 = await done(s); check('S6 142 JA142B keeps its 1', b2 === 1, b2)
    await reload(s); await openTrk(s); const g = await place(s); note('after reload ' + JSON.stringify(g))
    await pickCourse(s, 'JA-142'); await pickSyl(s, '2026'); await pickCrew(s, 'JA142A'); const r = await done(s); check('S6 142 after reload', r === 3, r)
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); const r2 = await done(s); check('S6 149 own course unharmed after reload', r2 === 5, r2)
    await pickCourse(s, 'JA-142'); await pickSyl(s, '2026'); await pickCrew(s, 'JA142A'); const r3 = await done(s); check('S6 149 copy after reload', r3 === 4, r3); await pic(s, '07-end')
  })
  await s.ctx.close()
} finally { finish(`j06-${SZ}`); await closeAll() }
