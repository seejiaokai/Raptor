// S23 a newly created squadron: its Tracker before any record, its first course and student, two other squadrons, back; first admin's Plan.
import { mk, closeAll, finish, as, admCat, go, pic, picsFor, note, step, check, T, state, pickSq, shut, ask, addCourse, addStudent, grade, info, pickCourse, pickCrew, sleep } from './ja-lib.mjs'
import { makeSquadron } from '../../n150/walk/vlib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-23 v1', SZ)
picsFor(`j23-${SZ}`)
const NEW = '155'
/* the page after a pick, whether or not a chart can be drawn yet */
async function look(s, tag) {
  await sleep(s, 1200)
  const t = await T(s); const st = await state(s)
  const body = await s.page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').slice(0, 260))
  note(`${tag}: ${JSON.stringify({ sq: t.sq, course: t.course, crew: t.crew, balls: t.balls })} page=${st.page}`)
  note(`${tag} text: ${body}`)
  return t
}
try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s) })
  await step('S23 make the squadron', async () => {
    await admCat(s, 'Squadrons'); await makeSquadron(s, NEW); await sleep(s, 900)
    const rows = await s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.getAttribute('data-unit')))
    note('squadrons listed: ' + JSON.stringify(rows)); await pic(s, '01-squadrons')
    check('S23 squadron made (a third row)', rows.length === 3, rows)
  })
  await step('S23 its Tracker before any record', async () => {
    await pickSq(s, NEW); if (!s.desk) await shut(s); await sleep(s, 500)
    const q = await ask(s); if (q.msg) note('unexpected question: ' + q.msg)
    const st = await state(s); check('S23 master admin is on the new squadron', (st.barMark || '').startsWith(NEW), st.barMark)
    const off = st.tabs.length ? st.tabs.includes('tracker') : st.items.includes('tracker'); check('S23 Tracker offered', off, st.tabs.length ? st.tabs : st.items)
    await go(s, 'tracker'); if (!s.desk) await shut(s)
    const t = await look(s, 'S23 first look'); await pic(s, '02-new-tracker')
    const all = [...(t.course?.list || []), ...(t.crew?.list || [])]
    check('S23 nothing of 142 or 149 inherited', !all.some(x => /^JA/.test(x)), all)
  })
  await step('S23 first course, student, mark', async () => {
    const made = await addCourse(s, 'JA-155'); check('S23 first course added', made, (await T(s)).course)
    const st = await addStudent(s, 'JA155A'); check('S23 first student added', st, (await T(s)).crew)
    await grade(s, 'ST-01', 'dco'); await grade(s, 'ST-02', 'dco')
    const i = await info(s); check('S23 two marks on the new squadron', /Done=2 /.test(i.overall), i); await pic(s, '03-new-marked')
  })
  await step('S23 two other squadrons and back', async () => {
    const b = await readBoth(s); check('S23 142 and 149 whole', whole142(b['142']) && whole149(b['149']) && !b['142'].courses.includes('JA-155') && !b['149'].courses.includes('JA-155'), b)
    await move(s, NEW); await pickCourse(s, 'JA-155'); const i = await info(s); const t = await T(s)
    check('S23 new squadron kept its own', /Done=2 /.test(i.overall) && t.sq.startsWith(NEW) && !t.course.list.some(c => /^JA-14/.test(c)), { i, c: t.course.list }); await pic(s, '04-new-back')
  })
  await step('S23 reload', async () => {
    await reload(s); await openTrk(s); await move(s, NEW); await pickCourse(s, 'JA-155'); const i = await info(s)
    check('S23 new squadron after reload', /Done=2 /.test(i.overall), i)
    const b = await readBoth(s); check('S23 142 and 149 whole after reload', whole142(b['142']) && whole149(b['149']), b)
  })
  await step('S23 its first admin', async () => {
    await as(s, 'ad2', 'a2'); const st0 = await state(s); note('Hunter list: ' + JSON.stringify(st0.topList))
    await pickSq(s, NEW); if (!s.desk) await shut(s); await sleep(s, 600)
    const st = await state(s); check('S23 Hunter reaches the new squadron', (st.barMark || '').startsWith(NEW), st.barMark)
    const tabs = st.tabs.length ? st.tabs : st.items; check('S23 Hunter has its Tracker (Plan)', tabs.includes('tracker') && tabs.includes('editsched'), tabs)
    await go(s, 'tracker'); if (!s.desk) await shut(s); await waitTrk(s, NEW); await pickCourse(s, 'JA-155'); await pickCrew(s, 'JA155A')
    await grade(s, 'ACG-01', 'dco'); const i = await info(s); check('S23 first admin can mark it', /Done=3 /.test(i.overall), i); await pic(s, '05-first-admin')
    await move(s, '142'); const t = await T(s); check('S23 his 142 still his', t.course.list.includes('JA-142') && !t.course.list.includes('JA-155'), t.course.list)
    await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); const j = await info(s); check('S23 142 marks whole', /Done=3 /.test(j.overall), j)
  })
  await s.ctx.close()
} finally { finish(`j23-${SZ}`); await closeAll() }
