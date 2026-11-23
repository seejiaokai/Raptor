// Walker A's fixture, built only through the app's controls. Version line: ja-fx v1.
//   142: courses JA-142 (students JA142A, JA142B) and JA-142B (student JA142C), both on the 2026 chart
//   149: courses JA-149 (student JA149A) and JA-149B (student JA149C), both on the 2026 chart
// A's marks: 142 has ST-01 DCO, ACG-01 DCO, ACG-02 DPCO and one failure on ACG-03 (3 done).
//            149 has ST-01, ST-02, ACG-01, ACG-02, ACG-03 DCO and two failures on ACG-04 (5 done).
import { go, note, check, T, info, addCourse, addStudent, pickCourse, pickCrew, grade, failOnce, pickSq, ask, shut, signIn, state } from './ja-lib.mjs'

export async function waitTrk(s, num, ms = 15000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const t = await T(s).catch(() => null)
    if (t && t.balls > 0 && t.course && t.course.list.length && (!num || (t.sq || '').startsWith(num))) { await s.page.waitForTimeout(450); return true }
    await s.page.waitForTimeout(150)
  }
  note(`[${s.sz}] Tracker never settled on ${num}`)
  return false
}
export async function openTrk(s, num) { await go(s, 'tracker'); if (!s.desk) await shut(s); return waitTrk(s, num) }
/* a clean pick (no draft in hand): the size's own door; settles on the squadron */
export async function move(s, num) {
  await pickSq(s, num); if (!s.desk) await shut(s)
  const q = await ask(s); if (q.msg) note(`[${s.sz}] unexpected question on pick ${num}: ${q.msg}`)
  return waitTrk(s, num)
}
export async function reload(s, user = 'ad', pass = 'a') {
  await s.page.reload(); await s.page.waitForTimeout(2200)
  if (await s.page.locator('#luser').isVisible().catch(() => false)) { note(`[${s.sz}] reload asked for the sign-in`); await signIn(s, user, pass) }
  await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
}

export async function fixture(s) {
  await signIn(s, 'ad', 'a')
  await openTrk(s, '142')
  const a = await addCourse(s, 'JA-142'); await addStudent(s, 'JA142A'); await addStudent(s, 'JA142B')
  await pickCrew(s, 'JA142A')
  for (const [id, g] of [['ST-01', 'dco'], ['ACG-01', 'dco'], ['ACG-02', 'dpco']]) await grade(s, id, g)
  await failOnce(s, 'ACG-03')
  await pickCrew(s, 'JA142B'); await grade(s, 'ST-01', 'dco')
  const a2 = await addCourse(s, 'JA-142B'); await addStudent(s, 'JA142C'); await grade(s, 'ST-02', 'dco')
  await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
  const r142 = await info(s)

  await move(s, '149')
  const b = await addCourse(s, 'JA-149'); await addStudent(s, 'JA149A')
  for (const id of ['ST-01', 'ST-02', 'ACG-01', 'ACG-02', 'ACG-03']) await grade(s, id, 'dco')
  await failOnce(s, 'ACG-04'); await failOnce(s, 'ACG-04')
  const b2 = await addCourse(s, 'JA-149B'); await addStudent(s, 'JA149C'); await grade(s, 'ACG-05', 'dco')
  await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
  const r149 = await info(s)

  check('fixture 142 course made', a && a2, (await state(s)).barMark)
  check('fixture 142 A reads 3 done, 1 fail', /Done=3 /.test(r142.overall) && r142.fails.length === 1, r142)
  check('fixture 149 course made', b && b2, 'JA-149, JA-149B')
  check('fixture 149 A reads 5 done, 2 fails', /Done=5 /.test(r149.overall) && r149.fails.length === 2, r149)
  await move(s, '142')
  return { r142, r149 }
}
/* both squadrons read back through the screen, the view left on `end` */
export async function readBoth(s, end = '142') {
  const out = {}
  for (const n of end === '142' ? ['149', '142'] : ['142', '149']) {
    if (!(await T(s)).sq?.startsWith(n)) await move(s, n)
    const c = `JA-${n}`, st = `JA${n}A`
    await pickCourse(s, c); await pickCrew(s, st)
    const i = await info(s); const t = await T(s)
    out[n] = { sq: t.sq, course: t.course.now, courses: t.course.list, crew: t.crew.now, overall: i.overall.replace(/Complete=\S+ /, ''), fails: i.fails.map(f => f.split('@')[0]) }
  }
  return out
}
export const whole142 = r => /Done=3 /.test(r.overall) && r.fails.length === 1 && r.courses.includes('JA-142') && !r.courses.some(c => c.startsWith('JA-149'))
export const whole149 = r => /Done=5 /.test(r.overall) && r.fails.length === 2 && r.courses.includes('JA-149') && !r.courses.some(c => c.startsWith('JA-142'))
