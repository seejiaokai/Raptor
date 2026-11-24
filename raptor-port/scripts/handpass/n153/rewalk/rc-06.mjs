// rc-06 - re-walk of item 6: a course copied by Export / Import keeps its own remembered student and chart on each squadron.
// The import's file is handed in through the file box the app opens (a stand-in for a person choosing the file).
import { mk, closeAll, finish, as, go, pic, picsFor, note, step, check, T, pickCourse, pickCrew, pickSyl, info, grade, shut, sleep, addStudent, addCourse, signIn, pickSq, ballIds, trackerSaved, layoutDiff } from './rlib.mjs'
import { waitTrk, openTrk, move } from '../walk/ja-fx.mjs'
import { exportIt, importIt } from '../walk/ja-xlib.mjs'
const SZ = process.env.SZ || 'd'
const RUN = process.env.RUN || '1'
const tag = `rc06-${SZ}-${RUN}`
console.log('rc-06 v1', SZ, RUN, process.env.MQ_PORT)
picsFor(tag)
const place = async s => { const t = await T(s); return { sq: (t.sq || '').slice(0, 3), course: t.course?.now, crew: t.crew?.now ?? null, chart: (t.syl?.now || '').replace(' ✎', '').trim() } }
const same = (a, b) => a.sq === b.sq && a.course === b.course && a.crew === b.crew && a.chart === b.chart
const done = async s => { const i = await info(s); return { who: i.who, done: +(/Done=(\d+)/.exec(i.overall) || [])[1] } }
let n = 10
const shot = async (s, name) => { n++; await pic(s, `${n}-${name}`) }
try {
  const s = await mk(SZ)
  let p142, p149
  const round = async (label, times) => {
    for (let i = 1; i <= times; i++) {
      await move(s, '149'); await sleep(s, 450); let g = await place(s)
      check(`${label} pass ${i}: 149 reopens on its own student and chart`, same(g, p149), { want: p149, got: g }); await shot(s, `${label}-${i}-149`)
      await move(s, '142'); await sleep(s, 450); g = await place(s)
      check(`${label} pass ${i}: 142 reopens on its own student and chart`, same(g, p142), { want: p142, got: g }); await shot(s, `${label}-${i}-142`)
    }
  }
  await step('the copy: a course of 142 with two students, Export, Import into 149', async () => {
    await signIn(s, 'ad', 'a'); await openTrk(s, '142')
    await addCourse(s, 'RC-COPY'); await addStudent(s, 'RCALPHA'); await addStudent(s, 'RCBRAVO')
    await pickCrew(s, 'RCALPHA'); await grade(s, 'ST-01', 'dco')
    const f = await exportIt(s, 'rc06', { charts: true, students: true, all: true })
    check('the file holds the course and both students', f.text.includes('RC-COPY') && f.text.includes('RCBRAVO'), f.said)
    await move(s, '149')
    const said = await importIt(s, f.path, { charts: 'skip', students: true }); note('import asked: ' + JSON.stringify(said.map(x => String(x).slice(0, 90))))
    await waitTrk(s, '149'); await pickCourse(s, 'RC-COPY')
    const t = await T(s); check('the copy is on 149 with both students', t.course.list.includes('RC-COPY') && t.crew.list.length === 2, t.crew); await shot(s, 'copied-on-149')
  })
  await step('A: a different student on each squadron, same chart', async () => {
    await pickCrew(s, 'RCALPHA'); await sleep(s, 300); p149 = await place(s); note('149 left on ' + JSON.stringify(p149))
    await move(s, '142'); await pickCourse(s, 'RC-COPY'); await pickCrew(s, 'RCBRAVO'); await sleep(s, 300); p142 = await place(s); note('142 left on ' + JSON.stringify(p142))
    check('A the two students differ', p149.crew !== p142.crew && p149.course === p142.course, { p149, p142 })
    await round('A', 3)
  })
  await step('B: 142 goes to chart 2024 with a student of its own', async () => {
    await pickSyl(s, '2024'); await sleep(s, 400); await addStudent(s, 'RCZULU'); await sleep(s, 400); p142 = await place(s); note('142 left on ' + JSON.stringify(p142))
    check('B 142 is on 2024 with RCZULU', p142.chart.startsWith('2024') && p142.crew === 'RCZULU', p142)
    await round('B', 2)
  })
  await step('C: the other way round: 149 goes to 2024 with its own student, 142 back on 2026', async () => {
    await move(s, '149'); await pickSyl(s, '2024'); await sleep(s, 400); await addStudent(s, 'RCYANK'); await sleep(s, 400); p149 = await place(s); note('149 left on ' + JSON.stringify(p149))
    check('C 149 is on 2024 with RCYANK', p149.chart.startsWith('2024') && p149.crew === 'RCYANK', p149)
    await move(s, '142'); await pickSyl(s, '2026'); await sleep(s, 300); await pickCrew(s, 'RCBRAVO'); await sleep(s, 300); p142 = await place(s); note('142 left on ' + JSON.stringify(p142))
    check('C 142 is on 2026 with RCBRAVO', p142.chart.startsWith('2026') && p142.crew === 'RCBRAVO', p142)
    await round('C', 2)
  })
  await step('D: leave the Tracker and come back, the pick made away from it', async () => {
    await go(s, 'viewsched'); if (!s.desk) await shut(s); await sleep(s, 500)
    await pickSq(s, '149'); if (!s.desk) await shut(s); await sleep(s, 800)
    await go(s, 'tracker'); if (!s.desk) await shut(s); await waitTrk(s, '149'); let g = await place(s)
    check('D 149 after a pick made away from the Tracker', same(g, p149), { want: p149, got: g }); await shot(s, 'D-149')
    await go(s, 'viewsched'); if (!s.desk) await shut(s); await sleep(s, 500)
    await pickSq(s, '142'); if (!s.desk) await shut(s); await sleep(s, 800)
    await go(s, 'tracker'); if (!s.desk) await shut(s); await waitTrk(s, '142'); g = await place(s)
    check('D 142 after a pick made away from the Tracker', same(g, p142), { want: p142, got: g }); await shot(s, 'D-142')
  })
  await step('E: sign out and sign in', async () => {
    await as(s, 'ad', 'a'); await openTrk(s); await sleep(s, 500)
    if (!(await T(s)).sq?.startsWith('142')) await move(s, '142')
    let g = await place(s); check('E 142 after sign-in', same(g, p142), { want: p142, got: g }); await shot(s, 'E-142')
    await move(s, '149'); await sleep(s, 450); g = await place(s); check('E 149 after sign-in', same(g, p149), { want: p149, got: g }); await shot(s, 'E-149')
    await move(s, '142'); await sleep(s, 450); g = await place(s); check('E 142 again after sign-in', same(g, p142), { want: p142, got: g })
  })
  await step('F: the next mark lands on the student shown, on that squadron only', async () => {
    const ev = async () => { const ids = await ballIds(s); return ids.includes('ACG-05') ? 'ACG-05' : ids[3] }
    // on 142, RCBRAVO shown
    let a142 = await trackerSaved(s, '142'), a149 = await trackerSaved(s, '149'), b = await done(s), g = await place(s)
    check('F 142 shows RCBRAVO before the mark', g.crew === 'RCBRAVO', g); await shot(s, 'F-142-before')
    const e1 = await ev(); await grade(s, e1, 'dco'); await sleep(s, 900); let c = await done(s), d142 = layoutDiff(a142, await trackerSaved(s, '142')), d149 = layoutDiff(a149, await trackerSaved(s, '149'))
    check('F mark on 142 raises the shown student by one', c.done === b.done + 1, { event: e1, before: b, after: c }); await shot(s, 'F-142-after')
    check('F mark on 142 changes 142\'s saved records', d142.length > 0, d142)
    check('F mark on 142 changes nothing saved on 149', d149.length === 0, d149)
    // on 149, RCYANK shown
    await move(s, '149'); await sleep(s, 450); a142 = await trackerSaved(s, '142'); a149 = await trackerSaved(s, '149'); b = await done(s); g = await place(s)
    check('F 149 shows RCYANK before the mark', g.crew === 'RCYANK' && same(g, p149), g); await shot(s, 'F-149-before')
    const e2 = await ev(); await grade(s, e2, 'dco'); await sleep(s, 900); c = await done(s); d142 = layoutDiff(a142, await trackerSaved(s, '142')); d149 = layoutDiff(a149, await trackerSaved(s, '149'))
    check('F mark on 149 raises the shown student by one', c.done === b.done + 1, { event: e2, before: b, after: c }); await shot(s, 'F-149-after')
    check('F mark on 149 changes 149\'s saved records', d149.length > 0, d149)
    check('F mark on 149 changes nothing saved on 142', d142.length === 0, d142)
    // the copy of RCALPHA and RCBRAVO on 149 keep what the export carried: A one mark, B none (142's mark on B did not cross)
    await pickSyl(s, '2026'); await sleep(s, 400); await pickCrew(s, 'RCBRAVO'); await sleep(s, 300); const b149 = await done(s)
    check('F 149\'s copy of RCBRAVO has no mark from 142', b149.done === 0, b149)
    await pickCrew(s, 'RCALPHA'); await sleep(s, 300); const a149d = await done(s)
    check('F 149\'s copy of RCALPHA keeps the one exported mark', a149d.done === 1, a149d); await shot(s, 'F-149-copy-read')
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
