// S3 Export after changing squadron; S4 Import over a shared syllabus. PART=s3|s4
import { mk, closeAll, finish, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, pickSyl, info, grade, addEvent, hasEv, ballIds, sleep } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
import { exportIt, importIt, holds } from './ja-xlib.mjs'
const SZ = process.env.SZ || 'd', PART = process.env.PART || 's3'
console.log('ja-03 v1', SZ, PART)
picsFor(`j03-${SZ}-${PART}`)
const has = async (s, n) => (await ballIds(s)).includes(n) || hasEv(s, n)
const addSaved = async (s, name) => { const ok = await addEvent(s, name); await sleep(s, 200); await hit(s, '#saveChanges', 700); return ok && !(await T(s)).dirty }
const doneOf = async (s, course, crew) => { await pickCourse(s, course); await pickCrew(s, crew); const i = await info(s); return +(/Done=(\d+)/.exec(i.overall) || [])[1] }
try {
  const s = await mk(SZ)
  await step('fixture', async () => {
    await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    check('a saved event only on 142', await addSaved(s, 'JAEV142'), 'JAEV142')
    await move(s, '149'); await pickCourse(s, 'JA-149')
    check('a saved event only on 149', await addSaved(s, 'JAEV149'), 'JAEV149')
  })
  if (PART === 's3') {
    const judge = (x, tag, own, foreign, wantStudents) => {
      note(`${tag}: keys ${Object.keys(x.doc).join(',')}; ticked ${JSON.stringify(x.ticked)}; said ${JSON.stringify(x.said)}; size ${x.text.length}`)
      check(`${tag} holds its own chart event`, holds(x, `JAEV${own}`), `JAEV${own}`)
      check(`${tag} holds nothing of ${foreign}`, !holds(x, `JAEV${foreign}`) && !holds(x, `JA${foreign}A`) && !holds(x, `JA-${foreign}`), foreign)
      if (wantStudents) check(`${tag} holds its students and courses`, holds(x, `JA${own}A`) && holds(x, `JA-${own}`), `JA${own}A`)
      else check(`${tag} charts only: no student, course or mark`, !holds(x, `JA${own}A`) && !holds(x, `JA-${own}`) && !holds(x, 'STUDENT A') && !x.doc.students, Object.keys(x.doc))
    }
    await step('S3 149', async () => {
      await pickCourse(s, 'JA-149')
      const a = await exportIt(s, '149-charts', { charts: true, students: false }); judge(a, 'S3 149 charts', '149', '142', false); await pic(s, '01-149-charts-done')
      const b = await exportIt(s, '149-full', { charts: true, students: true, all: true }); judge(b, 'S3 149 full', '149', '142', true)
      check('S3 149 full says a full backup', /full backup/.test(b.said), b.said)
    })
    await step('S3 142', async () => {
      await move(s, '142'); await pickCourse(s, 'JA-142')
      const a = await exportIt(s, '142-charts', { charts: true, students: false }); judge(a, 'S3 142 charts', '142', '149', false)
      const b = await exportIt(s, '142-full', { charts: true, students: true, all: true }); judge(b, 'S3 142 full', '142', '149', true); await pic(s, '02-142-full-done')
      check('S3 142 full carries a course it should (JA-142B)', holds(b, 'JA-142B') && holds(b, 'JA142C'), 'JA-142B / JA142C')
      const r = await readBoth(s); check('S3 nothing changed by exporting', whole142(r['142']) && whole149(r['149']), r)
    })
  }
  if (PART === 's4') {
    let early, late
    await step('S4 export, then change the chart and mark the new event in both 142 courses', async () => {
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
      early = await exportIt(s, 'early', { charts: true, students: false }); check('S4 early copy made', holds(early, 'JAEV142') && !holds(early, 'JA4NEW'), early.ticked)
      check('S4 new event saved', await addSaved(s, 'JA4NEW'), 'JA4NEW')
      await grade(s, 'JA4NEW', 'dco')
      await pickCourse(s, 'JA-142B'); await pickCrew(s, 'JA142C'); await grade(s, 'JA4NEW', 'dco')
      check('S4 A has 4, C has 2', await doneOf(s, 'JA-142', 'JA142A') === 4 && await doneOf(s, 'JA-142B', 'JA142C') === 2, 'read')
      await pickCourse(s, 'JA-142')
      late = await exportIt(s, 'late', { charts: true, students: false }); check('S4 late copy has the event', holds(late, 'JA4NEW'), late.ticked)
      await pickSyl(s, '2024'); note('2024 chart: ' + (await T(s)).events); await pickSyl(s, '2026')
    })
    const ev2024 = async () => { await pickSyl(s, '2024'); const e = (await T(s)).events; await pickSyl(s, (await T(s)).syl.list.find(x => x.startsWith('2026'))); return e }
    let e2024
    await step('S4 Replace with the early copy', async () => {
      e2024 = await ev2024()
      const said = await importIt(s, early.path, { charts: 'replace' }); note('asked: ' + JSON.stringify(said)); await pic(s, '01-replaced')
      check('S4 replace asked about the chart by name', said.some(q => /“2026”/.test(q)), said[0])
      await pickCourse(s, 'JA-142'); check('S4 the new event gone from the chart', !(await has(s, 'JA4NEW')), (await T(s)).events)
      check('S4 hidden mark not counted: A back to 3', await doneOf(s, 'JA-142', 'JA142A') === 3, 'A')
      check('S4 hidden mark not counted: C back to 1', await doneOf(s, 'JA-142B', 'JA142C') === 1, 'C')
      await pickCourse(s, 'JA-142'); check('S4 another syllabus unchanged', await ev2024() === e2024, e2024)
      await move(s, '149'); await pickCourse(s, 'JA-149')
      check('S4 149 chart unchanged', await has(s, 'JAEV149') && !(await has(s, 'JAEV142')) && !(await has(s, 'JA4NEW')), (await T(s)).events)
      check('S4 149 marks untouched', await doneOf(s, 'JA-149', 'JA149A') === 5, '5')
      await move(s, '142')
    })
    await step('S4 Replace with the late copy: the hidden marks return', async () => {
      await pickCourse(s, 'JA-142')
      await importIt(s, late.path, { charts: 'replace' })
      check('S4 event back on the chart', await has(s, 'JA4NEW'), (await T(s)).events)
      check('S4 A has its mark again', await doneOf(s, 'JA-142', 'JA142A') === 4, 'A'); check('S4 C has its mark again', await doneOf(s, 'JA-142B', 'JA142C') === 2, 'C'); await pic(s, '02-marks-back')
    })
    await step('S4 Add as new', async () => {
      await pickCourse(s, 'JA-142')
      const said = await importIt(s, early.path, { charts: 'JAIMP' }); note('asked: ' + JSON.stringify(said))
      const t = await T(s); check('S4 added as a new chart on 142', t.syl.list.some(x => x.startsWith('JAIMP')), t.syl.list); await pic(s, '03-added')
      check('S4 the 2026 chart not replaced', await has(s, 'JA4NEW'), (await T(s)).syl.now)
      check('S4 marks kept', await doneOf(s, 'JA-142', 'JA142A') === 4, 'A')
      await move(s, '149'); const u = await T(s); check('S4 new chart not on 149', !u.syl.list.some(x => x.startsWith('JAIMP')), u.syl.list)
    })
    await step('S4 reload', async () => {
      await reload(s); await openTrk(s)
      const t = await T(s); check('S4 142 keeps the new chart after reload', t.syl.list.some(x => x.startsWith('JAIMP')), t.syl.list)
      check('S4 142 marks after reload', await doneOf(s, 'JA-142', 'JA142A') === 4 && await doneOf(s, 'JA-142B', 'JA142C') === 2, 'read'); await pickCourse(s, 'JA-142')
      check('S4 2026 chart still has the event', await has(s, 'JA4NEW'), (await T(s)).syl.now)
      await move(s, '149'); await pickCourse(s, 'JA-149'); check('S4 149 whole after reload', await doneOf(s, 'JA-149', 'JA149A') === 5 && await has(s, 'JAEV149') && !(await has(s, 'JA4NEW')), (await T(s)).events)
    })
  }
  await s.ctx.close()
} finally { finish(`j03-${SZ}-${PART}`); await closeAll() }
