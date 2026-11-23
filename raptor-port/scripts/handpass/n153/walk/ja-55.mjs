// S55 the Tracker's everyday round, as a person uses it, each opened control closed. WHO=member|admin|plan|master
import { mk, closeAll, finish, as, grant, go, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, pickSyl, info, grade, openBall, failLog, ballInfo, addEvent, half, sleep, signIn } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
import { exportIt } from './ja-xlib.mjs'
const SZ = process.env.SZ || 'd', WHO = process.env.WHO || 'member'
console.log('ja-55 v1', SZ, WHO)
picsFor(`j55-${SZ}-${WHO}`)
const P = { member: { u: 'us', p: 'us', n: '142', c: 'JA-142', add: 'prowler', name: 'HUNTER', start: 'JA142A', d0: 3 },
  admin: { u: 'ad2', p: 'a2', n: '142', c: 'JA-142', add: 'bane', name: 'RANGER', start: 'JA142A', d0: 3 },
  plan: { u: 'ad2', p: 'a2', n: '149', c: 'JA-149', add: 'osp9', name: 'OSPREY', start: 'JA149A', d0: 5 },
  master: { u: 'ad', p: 'a', n: '149', c: 'JA-149', add: 'kes9', name: 'KESTREL', start: 'JA149A', d0: 5 } }[WHO]
const noneOpen = s => s.page.evaluate(() => ['#pop', '#dlgModal', '#copyModal', '#ordModal', '#infoModal', '#showAllPanel', '#trkFlexWin', '#trkLegend', '#failLog', '#lullCal'].filter(q => { const e = document.querySelector(q); return e && e.getBoundingClientRect().width > 0 }))
const done = async s => { const i = await info(s); return +(/Done=(\d+)/.exec(i.overall) || [])[1] }
try {
  const s = await mk(SZ)
  await step('fixture', async () => {
    await fixture(s)
    if (WHO === 'plan') { check('Hunter given Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler'); await go(s, 'viewsched') }
    if (WHO !== 'master') await as(s, P.u, P.p)
    await openTrk(s, WHO === 'plan' ? '142' : undefined); if ((await T(s)).sq?.slice(0, 3) !== P.n) await move(s, P.n); await pickCourse(s, P.c)
    check(`S55 ${WHO} is on ${P.n}`, (await T(s)).sq.startsWith(P.n), (await T(s)).sq)
  })
  await step('S55 choose syllabus, course, crew', async () => {
    await pickSyl(s, '2024'); check('S55 another chart opens', (await T(s)).syl.now.startsWith('2024'), (await T(s)).syl.now)
    await pickSyl(s, '2026'); check('S55 back on 2026', (await T(s)).syl.now.startsWith('2026'), (await T(s)).syl.now)
    const others = (await T(s)).course.list.filter(c => c !== P.c); await pickCourse(s, others[0]); check('S55 another course opens', (await T(s)).course.now === others[0], others[0])
    await pickCourse(s, P.c); check('S55 crew picked', await pickCrew(s, P.start), (await T(s)).crew.now)
    check('S55 the student reads his marks', await done(s) === P.d0, await done(s))
  })
  await step('S55 add a roster student, mark, fail, read', async () => {
    await half(s, 'info'); await hit(s, '#addStu', 300); const r = s.page.locator(`#dlgList .dlg-item[data-key="${P.add}"]`)
    check('S55 the roster picker offers him', (await r.count()) > 0, P.add); await hit(s, r.first(), 700); await half(s, 'flow')
    check('S55 he is on the course', (await T(s)).crew.now === P.name, (await T(s)).crew)
    await grade(s, 'ST-01', 'dco'); await openBall(s, 'ST-02'); await hit(s, '#popFailPlus', 250); await hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 250)
    const i = await info(s), l = await failLog(s); check('S55 Info and Failures agree', /Done=1 /.test(i.overall) && i.fails.length === 1 && l.rows.length === 1 && l.rows[0].startsWith('ST-02'), { i: i.overall, f: i.fails, l: l.rows })
    const b = await ballInfo(s, 'ST-01'); check('S55 the event window agrees', b && b.done && (b.title || '').includes(P.name), b); await pic(s, '01-marked')
  })
  await step('S55 Find', async () => {
    if (!s.desk) await hit(s, '#hSearchBtn', 300)
    await s.page.locator('#hSearch').fill('ACG-07'); await s.page.locator('#hSearch').press('Enter'); await sleep(s, 500)
    const f = await s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].filter(b => b.querySelector('.found')).map(b => b.dataset.id)); check('S55 Find rings the event', f.join() === 'ACG-07', f); await pic(s, '02-find')
    if (!s.desk && !(await s.page.locator('#hSearchClear').isVisible())) await hit(s, '#hSearchBtn', 250)
    await hit(s, '#hSearchClear', 300); const g = await s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].filter(b => b.querySelector('.found')).length); check('S55 Find clears', g === 0, g)
    if (s.desk) await s.page.locator('#hSearch').blur().catch(() => {})
  })
  await step('S55 Details', async () => {
    await hit(s, '#detailsBtn', 200); check('S55 Details on', (await s.page.getAttribute('#detailsBtn', 'aria-pressed')) === 'true', 'on')
    await hit(s, '#detailsBtn', 200); check('S55 Details off', (await s.page.getAttribute('#detailsBtn', 'aria-pressed')) === 'false', 'off')
  })
  await step('S55 Show All, Legend, Flex', async () => {
    await hit(s, s.desk ? '#showAllBtn' : '#showAllTab', 400); check('S55 Show All opens', await s.page.locator('#showAllPanel').count() > 0, 'open'); await pic(s, '03-showall'); await hit(s, '#saClose', 250); check('S55 Show All closes', !(await s.page.locator('#showAllPanel').count()), 'closed')
    await hit(s, '#legendBtn', 300); check('S55 Legend opens', await s.page.locator('#trkLegend').count() > 0, 'open'); await pic(s, '04-legend')
    const lb = await s.page.locator('[data-testid="trk-legend-scrim"]').boundingBox(); if (s.desk) await s.page.mouse.click(lb.x + 4, lb.y + 4); else await s.page.touchscreen.tap(lb.x + 4, lb.y + 4); await sleep(s, 300); check('S55 Legend closes', !(await s.page.locator('#trkLegend').count()), 'closed')
    await hit(s, '#flexBtn', 350); const m = await s.page.evaluate(() => ({ inputs: document.querySelectorAll('#trkFlexWin input').length, save: !!document.querySelector('[data-testid="trk-flex-save"]') }))
    if (WHO === 'member') check('S55 member reads Flex only', m.inputs === 0 && !m.save, m); else check('S55 admin can edit Flex', m.save && m.inputs > 0, m)
    await pic(s, '05-flex'); await hit(s, '[data-testid="trk-flex-x"]', 250); check('S55 Flex closes', !(await s.page.locator('#trkFlexWin').count()), 'closed')
  })
  await step('S55 File: Export', async () => {
    const x = await exportIt(s, `s55-${WHO}`, { charts: true, students: true, all: true })
    const foreign = P.n === '142' ? 'JA149A' : 'JA142A', own = P.start
    check('S55 the export holds this squadron and the new student', x.text.includes(own) && x.text.includes(P.name) && !x.text.includes(foreign), { own, foreign, said: x.said.slice(0, 90) })
  })
  await step('S55 hide and show the bar', async () => {
    await hit(s, '#barHideBtn', 300); check('S55 the bar hides, a way back shows', await s.page.locator('#barShowBtn').isVisible(), 'show button'); await pic(s, '06-bar-hidden')
    await hit(s, '#barShowBtn', 300); check('S55 the bar is back', await s.page.locator('#courseSel').isVisible(), 'courseSel')
  })
  await step('S55 edit and save a chart', async () => {
    const name = `J55${WHO.toUpperCase()}`
    check('S55 an event drawn', await addEvent(s, name), name); await sleep(s, 200); await hit(s, '#saveChanges', 700)
    const t = await T(s); check('S55 saved', !t.dirty, t.saveStat); await pic(s, '07-chart-saved')
    const o = await noneOpen(s); check('S55 nothing left open', o.length === 0, o)
  })
  await step('S55 reload', async () => {
    await reload(s, P.u, P.p); await openTrk(s); if ((await T(s)).sq?.slice(0, 3) !== P.n) await move(s, P.n); await pickCourse(s, P.c); await pickCrew(s, P.name)
    check('S55 his marks after reload', await done(s) === 1, await done(s)); check('S55 the saved event after reload', (await s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(b => b.dataset.id))).includes(`J55${WHO.toUpperCase()}`), 'event')
    await pickCrew(s, P.start); check('S55 the first student keeps his marks', await done(s) === P.d0, await done(s))
    if (WHO === 'plan' || WHO === 'master') {
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); check('S55 142 untouched', await done(s) === 3, await done(s)); const c = (await T(s)).crew.list; check(`S55 ${P.name} not on 142`, !c.includes(P.name), c)
    }
  })
  await s.ctx.close()
} finally { finish(`j55-${SZ}-${WHO}`); await closeAll() }
