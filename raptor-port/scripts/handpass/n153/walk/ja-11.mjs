// S11 the Course / Syllabus / Crew writers, with a pick attempted between opening and confirming, and again after picking first.
// S2 a deleted course restored after a pick. PART=s11a (142 side), s11b (picking first, on 149), s2.
import { mk, closeAll, finish, pic, picsFor, note, step, check, T, ask, hit, menuItem, pickCourse, pickCrew, pickSyl, info, grade, addCourse, addStudent, half, shut, sleep } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd', PART = process.env.PART || 's11a'
console.log('ja-11 v1', SZ, PART)
picsFor(`j11-${SZ}-${PART}`)
const lists = async s => { const t = await T(s); return { courses: t.course.list, syls: t.syl.list.map(x => x.replace(' ✎', '')), crew: t.crew?.list || [] } }
/* a press on the top bar's squadron button while a window is up: the shade takes it, as ruled. Reads what is left on screen */
async function barTry(s, key) {
  const b = await s.page.locator('#sqnMenuBtn').filter({ visible: true }).first().boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(s, 350)
  const v = await s.page.evaluate(() => ({ q: !!document.getElementById('dlgModal'), ord: !!document.getElementById('ordModal'), menu: !!document.querySelector('#sqnMenu .sqm-row') }))
  note(`[${s.sz}] ${key}: a press on the squadron button with the window up left ${JSON.stringify(v)}`)
  return v
}
/* whatever the press left up is shut without acting */
async function clear(s) {
  if (await s.page.locator('#dlgModal').count()) await hit(s, s.page.locator('#dlgCancel').filter({ visible: true }).first(), 250)
  if (await s.page.locator('#ordModal').count()) await hit(s, '#ordCancel', 250)
  if (await s.page.locator('#sqnMenu .sqm-row').count()) { await s.page.keyboard.press('Escape'); await sleep(s, 200) }
}
const prompt = async (s, val) => { await s.page.waitForSelector('#dlgInput', { timeout: 4000 }); await s.page.locator('#dlgInput').fill(val) }
/* one writer: open it, type, attempt the pick, shut it, prove nothing happened, then do it for real */
async function both2(s, tag, open, val, seen) {
  const before = await lists(s)
  await open(); if (val != null) await prompt(s, val)
  await barTry(s, tag); await clear(s)
  const mid = await lists(s)
  check(`${tag}: an abandoned window changed nothing`, JSON.stringify(mid) === JSON.stringify(before), mid)
  await open(); if (val != null) await prompt(s, val)
  await hit(s, '#dlgOk', 700)
  if (await s.page.locator('#dlgModal').count()) { note(`${tag}: further question: ${(await ask(s)).msg}`); await hit(s, '#dlgOk', 500) }
  const after = await lists(s)
  check(`${tag}: finished`, seen(after, before), after)
}
async function ordOpen(s, id) { await menuItem(s, id === 'ordCourse' ? 'course' : 'syl', id); await s.page.waitForSelector('#ordModal', { timeout: 4000 }); await sleep(s, 200) }
const ordRows = s => s.page.evaluate(() => ({ list: [...document.querySelectorAll('#ordList .onm')].map(e => e.textContent.trim()), hid: [...document.querySelectorAll('#ordHidden .onm')].map(e => e.textContent.trim()) }))
async function restoreRow(s, name) { await hit(s, s.page.locator('#ordHidden .ordrow', { hasText: name }).locator('button').first(), 500) }

/* the whole set of writers on the squadron on screen, with this squadron's own names */
async function writers(s, P) {
  const C1 = `${P}-X1`, C2 = `${P}-X2`, Y1 = `${P} SYL`, Y2 = `${P} SYL2`, ST = `${P}STU`
  await both2(s, `${P} add course`, () => menuItem(s, 'course', 'addCourse'), C1, (a, b) => a.courses.includes(C1) && a.courses.length === b.courses.length + 1)
  await both2(s, `${P} rename course`, () => menuItem(s, 'course', 'renCourse'), C2, a => a.courses.includes(C2) && !a.courses.includes(C1))
  await both2(s, `${P} add student`, () => half(s, 'info').then(() => hit(s, '#addStu', 300)), null, () => true).catch(() => {})
  await clear(s)
  await step(`${P} student`, async () => {
    await addStudent(s, ST); check(`${P} student added`, (await lists(s)).crew.includes(ST.toUpperCase()), (await lists(s)).crew)
    await half(s, 'info'); await hit(s, s.page.locator('#side .chip', { hasText: ST.toUpperCase() }).locator('button.ren'), 300); await prompt(s, ST + '2'); await hit(s, '#dlgOk', 500); await half(s, 'flow')
    check(`${P} student renamed`, (await lists(s)).crew.includes((ST + '2').toUpperCase()), (await lists(s)).crew)
  })
  await step(`${P} course order`, async () => {
    await ordOpen(s, 'ordCourse'); const o = await ordRows(s); await hit(s, '#ordAlpha', 200); await hit(s, '#ordSave', 500)
    const l = (await lists(s)).courses; check(`${P} courses put in A-Z order, none lost`, [...o.list].sort().join() === [...l].sort().join() && l[0] === [...l].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))[0], l)
  })
  await both2(s, `${P} add syllabus`, () => menuItem(s, 'syl', 'addSyl'), Y1, (a, b) => a.syls.includes(Y1) && a.syls.length === b.syls.length + 1)
  await both2(s, `${P} rename syllabus`, () => menuItem(s, 'syl', 'renSyl'), Y2, a => a.syls.includes(Y2) && !a.syls.includes(Y1))
  await both2(s, `${P} duplicate syllabus`, () => menuItem(s, 'syl', 'dupSyl'), `${Y2} COPY`, a => a.syls.includes(`${Y2} COPY`))
  await step(`${P} syllabus order`, async () => {
    await ordOpen(s, 'ordSyl'); const o = await ordRows(s); await hit(s, '#ordAlpha', 200); await hit(s, '#ordSave', 500)
    const l = (await lists(s)).syls; check(`${P} syllabi kept whole by reorder`, o.list.length === l.length, l)
  })
  await both2(s, `${P} delete syllabus`, () => menuItem(s, 'syl', 'delSyl'), null, a => !a.syls.includes(`${Y2} COPY`))
  await both2(s, `${P} delete course`, () => menuItem(s, 'course', 'delCourse'), null, a => !a.courses.includes(C2))
  await step(`${P} restore course`, async () => {
    await ordOpen(s, 'ordCourse'); const o = await ordRows(s); note(`${P} deleted list: ${JSON.stringify(o.hid)}`)
    check(`${P} own deleted course offered, nothing foreign`, o.hid.includes(C2) && o.hid.every(n => n.startsWith(P)), o.hid)
    await restoreRow(s, C2); await hit(s, '#ordSave', 500); check(`${P} restored`, (await lists(s)).courses.includes(C2), (await lists(s)).courses)
  })
}
const other = P => P === 'JA' ? 'JB' : 'JA'
try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142') })
  if (PART === 's11a' || PART === 's11b') {
    const num = PART === 's11a' ? '142' : '149', P = PART === 's11a' ? 'JA' : 'JB', home = PART === 's11a' ? 'JA-142' : 'JA-149'
    if (num === '149') await step('pick first', async () => { await move(s, '149'); await pickCourse(s, home) })
    await step(`${P} writers`, async () => { await writers(s, P); await pic(s, `01-${P}-written`) })
    const mine = await lists(s)
    await step('the other squadron unchanged', async () => {
      const far = num === '142' ? '149' : '142'; await move(s, far); const l = await lists(s)
      check(`S11 nothing of ${P} on ${far}`, ![...l.courses, ...l.syls, ...l.crew].some(x => x.startsWith(P + '-X') || x.startsWith(P + ' SYL') || x.startsWith(P + 'STU')), l); await pic(s, '02-other')
      await move(s, num)
    })
    await step('reload', async () => {
      await reload(s); await openTrk(s); if (num === '149') await move(s, '149')
      const l = await lists(s); check(`S11 ${P} lists kept after reload`, l.courses.includes(`${P}-X2`) && l.syls.includes(`${P} SYL2`), l)
      const far = num === '142' ? '149' : '142'; await move(s, far); const f = await lists(s)
      check(`S11 ${far} still clean after reload`, ![...f.courses, ...f.syls].some(x => x.startsWith(P + '-X') || x.startsWith(P + ' SYL')), f)
      const b = await readBoth(s); check('S11 marks whole in both squadrons', whole142(b['142']) && whole149(b['149']), b)
    })
  }
  if (PART === 's2') {
    await step('S2 set up', async () => {
      await addCourse(s, 'JA-D142'); await addStudent(s, 'JAD142'); await grade(s, 'ST-01', 'dco'); await grade(s, 'ACG-01', 'marg')
      await menuItem(s, 'course', 'delCourse'); await hit(s, '#dlgOk', 700)
      await move(s, '149')
      await addCourse(s, 'JA-D149'); await addStudent(s, 'JAD149'); await grade(s, 'ST-02', 'dco')
      await menuItem(s, 'course', 'delCourse'); await hit(s, '#dlgOk', 700)
      check('S2 149 lost its disposable course', !(await lists(s)).courses.includes('JA-D149'), (await lists(s)).courses)
      await move(s, '142'); check('S2 142 lost its disposable course', !(await lists(s)).courses.includes('JA-D142'), (await lists(s)).courses)
    })
    await step('S2 142 first', async () => {
      await ordOpen(s, 'ordCourse'); const o = await ordRows(s); check('S2 142 list holds only its own', o.hid.join() === 'JA-D142', o.hid); await pic(s, '01-142-list'); await hit(s, '#ordCancel', 300)
      await move(s, '149'); await ordOpen(s, 'ordCourse'); const p = await ordRows(s); check('S2 149 list holds only its own', p.hid.join() === 'JA-D149', p.hid); await pic(s, '02-149-list')
      await restoreRow(s, 'JA-D149'); await hit(s, '#ordSave', 500)
      const l = await lists(s); check('S2 149 restored into 149', l.courses.includes('JA-D149'), l.courses)
      await pickCourse(s, 'JA-D149'); const i = await info(s); check('S2 restored student keeps marks (149)', i.students.some(x => x.includes('JAD149')) && /Done=1 /.test(i.overall), i)
      await move(s, '142'); const k = await lists(s); check('S2 149 restore did not reach 142', !k.courses.includes('JA-D149') && !k.courses.includes('JA-D142'), k.courses)
    })
    await step('S2 reverse', async () => {
      await ordOpen(s, 'ordCourse'); const o = await ordRows(s); check('S2 142 list still its own', o.hid.join() === 'JA-D142', o.hid)
      await restoreRow(s, 'JA-D142'); await hit(s, '#ordSave', 500)
      await pickCourse(s, 'JA-D142'); const i = await info(s); check('S2 restored student keeps marks (142)', i.students.some(x => x.includes('JAD142')) && /Done=2 /.test(i.overall), i); await pic(s, '03-142-restored')
    })
    await step('S2 reload', async () => {
      await reload(s); await openTrk(s)
      const a = await lists(s); check('S2 142 after reload', a.courses.includes('JA-D142') && !a.courses.includes('JA-D149'), a.courses)
      await pickCourse(s, 'JA-D142'); const i = await info(s); check('S2 142 marks after reload', /Done=2 /.test(i.overall), i)
      await move(s, '149'); const b = await lists(s); check('S2 149 after reload', b.courses.includes('JA-D149') && !b.courses.includes('JA-D142'), b.courses)
      await pickCourse(s, 'JA-D149'); const j = await info(s); check('S2 149 marks after reload', /Done=1 /.test(j.overall), j); await pic(s, '04-149-reloaded')
      const r = await readBoth(s); check('S2 fixture marks whole', whole142(r['142']) && whole149(r['149']), r)
    })
  }
  await s.ctx.close()
} finally { finish(`j11-${SZ}-${PART}`); await closeAll() }
