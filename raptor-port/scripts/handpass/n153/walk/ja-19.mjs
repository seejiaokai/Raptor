// S19 a write finishing during a pick; S1 delete an event shared by two courses, then pick at once.
import { mk, closeAll, finish, pic, picsFor, note, step, check, T, ask, hit, pickCourse, pickCrew, info, grade, openBall, ballIds, ballInfo, delEvent, fastPick, samePress, shut, sleep, addEvent } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-19 v2', SZ)
picsFor(`j19-${SZ}`)
/* Done and fails of a student, read through the screen */
async function rd(s, n, course, crew) {
  if (!(await T(s)).sq?.startsWith(n)) await move(s, n)
  await pickCourse(s, course); await pickCrew(s, crew)
  const i = await info(s); return { done: +(/Done=(\d+)/.exec(i.overall) || [])[1], fails: i.fails.length, list: i.fails.map(f => f.split('@')[0]) }
}
const exp = { a142: { done: 3, fails: 1 }, a149: { done: 5, fails: 2 } }
async function both(s, tag) {
  const b149 = await rd(s, '149', 'JA-149', 'JA149A'); const b142 = await rd(s, '142', 'JA-142', 'JA142A')
  check(`${tag}: 142 holds its own (${exp.a142.done} done, ${exp.a142.fails} fails)`, b142.done === exp.a142.done && b142.fails === exp.a142.fails, b142)
  check(`${tag}: 149 holds its own (${exp.a149.done} done, ${exp.a149.fails} fails)`, b149.done === exp.a149.done && b149.fails === exp.a149.fails, b149)
}
async function after(s) { await sleep(s, 200); if (!s.desk) await shut(s); return waitTrk(s, '149') }
try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A') })

  await step('S19 grade, then pick with no wait', async () => {
    await openBall(s, 'ACG-06')
    await hit(s, '#pop .opts button[data-g="dco"]', 0); await fastPick(s, '149')
    check('S19a reached 149', await after(s), (await T(s)).sq); exp.a142.done++
    await both(s, 'S19a grade')
  })
  await step('S19 failed attempt, then pick with no wait', async () => {
    await openBall(s, 'ACG-07')
    await hit(s, '#popFailPlus', 0); await fastPick(s, '149')
    check('S19b reached 149', await after(s), (await T(s)).sq); exp.a142.fails++
    await both(s, 'S19b fail')
  })
  await step('S19 grade and pick in the same instant', async () => {
    await openBall(s, 'ACG-09')
    note('same-instant press: ' + await samePress(s, '#pop .opts button[data-g="dco"]', '149'))
    check('S19c reached 149', await after(s), (await T(s)).sq); await pic(s, '01-s19c'); exp.a142.done++
    await both(s, 'S19c grade same instant')
  })
  await step('S19 failure and pick in the same instant', async () => {
    await openBall(s, 'AVI-01')
    note('same-instant press: ' + await samePress(s, '#popFailPlus', '149'))
    check('S19d reached 149', await after(s), (await T(s)).sq); exp.a142.fails++
    await both(s, 'S19d fail same instant')
  })
  await step('S19 event deletion: Save changes, then pick in the same instant', async () => {
    await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
    const d = await delEvent(s, 'ACG-09'); note('delete said: ' + JSON.stringify(d)); await sleep(s, 200)
    check('S19e draft shows the deletion', (await T(s)).dirty && d.gone, await T(s))
    note('same-instant press: ' + await samePress(s, '#saveChanges', '149'))
    await sleep(s, 500); const q = await ask(s); note('after same-instant save+pick: ' + JSON.stringify(q)); await pic(s, '02-s19e')
    if (q.msg) await hit(s, '#dlgOk', 400)
    check('S19e reached 149', await after(s), (await T(s)).sq); exp.a142.done--
    await both(s, 'S19e deletion')
    await pickCourse(s, 'JA-142'); check('S19e ACG-09 gone from 142', !(await ballIds(s)).includes('ACG-09'), (await T(s)).events)
    await move(s, '149'); await pickCourse(s, 'JA-149'); check('S19e ACG-09 stays on 149', (await ballIds(s)).includes('ACG-09'), (await T(s)).events)
    await move(s, '142')
  })
  await step('S19 reverse order: pick, ready, then write', async () => {
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
    await grade(s, 'ACG-06', 'dco'); exp.a149.done++
    await openBall(s, 'ACG-08'); await hit(s, '#popFailPlus', 200); await hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 200); exp.a149.fails++
    await both(s, 'S19f written on 149')
  })
  await step('S19 reload', async () => {
    await reload(s); await openTrk(s)
    await both(s, 'S19g after reload')
    await pic(s, '03-s19-reloaded')
  })

  await step('S1 setup: one event marked in both 142 courses and on 149', async () => {
    await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); await grade(s, 'AVI-02', 'dco'); exp.a142.done++
    await pickCourse(s, 'JA-142B'); await pickCrew(s, 'JA142C'); await grade(s, 'AVI-02', 'dco')
    const c = await rd(s, '142', 'JA-142B', 'JA142C'); check('S1 JA142C has 2 marks', c.done === 2, c)
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); await grade(s, 'AVI-02', 'dco'); exp.a149.done++
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
    await both(s, 'S1 before')
  })
  await step('S1 delete, Save changes, pick at once', async () => {
    await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
    const d = await delEvent(s, 'AVI-02'); note('delete said: ' + JSON.stringify(d))
    check('S1 event off the chart in the draft', d.gone && (await T(s)).dirty, (await T(s)).events); await pic(s, '04-s1-draft')
    await hit(s, '#saveChanges', 0); await fastPick(s, '149')
    await sleep(s, 400); const q = await ask(s); note('after save+pick: ' + JSON.stringify(q)); if (q.msg) await hit(s, '#dlgOk', 400)
    check('S1 reached 149', await after(s), (await T(s)).sq); exp.a142.done--
    await pickCourse(s, 'JA-149'); check('S1 149 still has AVI-02', (await ballIds(s)).includes('AVI-02'), (await T(s)).events)
    const b = await ballInfo(s, 'AVI-02'); check('S1 149 keeps the mark on AVI-02', b && b.done, b); await pic(s, '05-s1-149')
    await both(s, 'S1 after')
    const c = await rd(s, '142', 'JA-142B', 'JA142C'); check('S1 the other 142 course lost that mark too', c.done === 1, c)
    check('S1 AVI-02 off the other 142 course', !(await ballIds(s)).includes('AVI-02'), (await T(s)).events); await pic(s, '06-s1-142b')
  })
  await step('S1 reload', async () => {
    await reload(s); await openTrk(s)
    await pickCourse(s, 'JA-142'); check('S1 no come-back on JA-142', !(await ballIds(s)).includes('AVI-02'), (await T(s)).events)
    await both(s, 'S1 after reload')
    const c = await rd(s, '142', 'JA-142B', 'JA142C'); check('S1 JA142C still 1 after reload', c.done === 1, c)
    await move(s, '149'); await pickCourse(s, 'JA-149'); const b = await ballInfo(s, 'AVI-02'); check('S1 149 mark after reload', b && b.done, b)
  })
  await s.ctx.close()
} finally { finish(`j19-${SZ}`); await closeAll() }
