// ra-08 - item 8: with an unsaved chart edit, in Edit chart layout, + Add syllabus, + Add course and Rename course each ask; Discard
// (the question's own button) drops the edit, keeps him in the editor, and the next window opens and can be cancelled.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, check, ask, hit, addEvent, hasEv, arrange, shut } from './rlib.mjs'
import { chartPrint, samePrint, inEditor, trackerSaved, layoutDiff } from './ra-lib.mjs'
const SZS = (process.env.SZ || 'd,pc').split(','), TAG = process.env.TAG || 'ra-08'
const DOORS = [['addSyl', 'syl', /add a new syllabus\?/, 'new \\(empty\\) syllabus'], ['addCourse', 'course', /add a course\?/, 'New course'], ['renCourse', 'course', /rename the course\?/, 'Rename course']]
console.log('ra-08-discard v1', process.env.MQ_PORT, SZS)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const inputShown = s => s.page.evaluate(() => { const e = document.getElementById('dlgInput'); return !!e && e.getBoundingClientRect().width > 1 })
for (const sz of SZS) for (const [id, menu, q, nextWords] of DOORS) {
  const run = `${TAG}-${sz}-${id}`
  picsFor(run)
  await step(run, async () => {
    const s = await mk(sz)
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800)
    if (!s.desk) await shut(s)
    await arrange(s, true); await wait(s, 300)
    const clean = await chartPrint(s); await arrange(s, false); await wait(s, 300)
    const name = 'RA8' + id.slice(0, 3).toUpperCase()
    if (!(await addEvent(s, name))) { check(`${run} NOT WALKED: the unsaved edit`, false, name); await s.ctx.close(); return }
    await arrange(s, true); await wait(s, 350)
    const t0 = await T(s), a0 = await trackerSaved(s, '142')
    check(`${run}: set-up: in the editor, an unsaved edit`, (await inEditor(s)) && t0.dirty && await hasEv(s, name), { editor: await inEditor(s), dirty: t0.dirty })
    await pic(s, '01-before')
    await hit(s, `#${menu}MenuBtn`, 220); await hit(s, `#${id}`, 450)
    const a = await ask(s)
    check(`${run}: it asks about the unsaved flow edits`, /unsaved flow edits/.test(a.msg || '') && q.test(a.msg || ''), a)
    await pic(s, '02-question')
    await hit(s, '#dlgOk', 700)
    const n = await ask(s), t1 = await T(s), ed1 = await inEditor(s), inp = await inputShown(s)
    check(`${run}: after Discard the next window opens`, inp && new RegExp(nextWords, 'i').test(n.msg || ''), { inp, n })
    check(`${run}: after Discard still in Edit chart layout, tools drawn`, ed1, ed1)
    check(`${run}: after Discard the edit is gone, nothing marked unsaved`, !t1.dirty && !(await hasEv(s, name)), { dirty: t1.dirty, stat: t1.saveStat })
    await pic(s, '03-next-window')
    await hit(s, '#dlgCancel', 600)
    const t2 = await T(s), ed2 = await inEditor(s), p2 = await chartPrint(s), a2 = await trackerSaved(s, '142'), c2 = await ask(s)
    check(`${run}: the window cancelled, still in the editor`, ed2 && !c2.msg, { ed2, left: c2.msg })
    check(`${run}: nothing marked unsaved`, !t2.dirty, { dirty: t2.dirty, stat: t2.saveStat })
    check(`${run}: the chart is the saved one`, samePrint(p2, clean), { clean, p2 })
    check(`${run}: no saved record changed by the Discard and Cancel`, layoutDiff(a0, a2).length === 0, layoutDiff(a0, a2))
    check(`${run}: the course and syllabus lists as they were`, JSON.stringify(t2.course?.list) === JSON.stringify(t0.course?.list) && JSON.stringify(t2.syl?.list) === JSON.stringify(t0.syl?.list), { course: t2.course?.list, syl: t2.syl?.list })
    await pic(s, '04-after-cancel')
    await s.ctx.close()
  })
}
finish(TAG); await closeAll()
