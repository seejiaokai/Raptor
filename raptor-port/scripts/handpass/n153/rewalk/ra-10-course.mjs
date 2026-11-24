// ra-10 - the plain round's course choice: the seed has one course, so a second is made by + Add course, chosen away and back in the
// Course dropdown, and read after a pick of 149 and back. Both widths.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, check, shut, pickSq, addCourse, pickCourse } from './rlib.mjs'
console.log('ra-10-course v1', process.env.MQ_PORT)
const wait = (s, ms) => s.page.waitForTimeout(ms)
for (const sz of ['d', 'pc']) {
  const run = `ra-10-${sz}`; picsFor(run)
  await step(run, async () => {
    const s = await mk(sz)
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800); if (!s.desk) await shut(s)
    await pickSq(s, '149'); await shut(s); await wait(s, 1200); await pickSq(s, '142'); await shut(s); await wait(s, 1200)
    const first = (await T(s)).course.now
    check(`${run}: + Add course makes and shows RA10`, await addCourse(s, 'RA10'), (await T(s)).course)
    await pic(s, '01-new-course')
    check(`${run}: the first course chosen again`, await pickCourse(s, first), (await T(s)).course.now); await pic(s, '02-first-course')
    check(`${run}: RA10 chosen`, await pickCourse(s, 'RA10'), (await T(s)).course.now); await pic(s, '03-ra10')
    await pickSq(s, '149'); await shut(s); await wait(s, 1300)
    const on = await T(s); check(`${run}: 149 does not list 142's new course`, /^149/.test(on.sq || '') && !on.course.list.includes('RA10'), { sq: on.sq, list: on.course.list }); await pic(s, '04-on-149')
    await pickSq(s, '142'); await shut(s); await wait(s, 1300)
    const back = await T(s); check(`${run}: back on 142, on RA10`, /^142/.test(back.sq || '') && back.course.now === 'RA10', { sq: back.sq, now: back.course.now }); await pic(s, '05-back-142')
    log(run, 'lists', back.course.list)
    await s.ctx.close()
  })
}
finish('ra-10'); await closeAll()
