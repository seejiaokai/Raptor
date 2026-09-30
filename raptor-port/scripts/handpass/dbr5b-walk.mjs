/* [DB-READINESS] group A, phase 5b — THE WALK (30 Sep 26): the Tracker one piece per thing (D462), and his charts,
   syllabi and every ball's details KEPT through the conversion (D464).

   Three parts, each its own run, each step asserting the RIGHT behaviour (a re-run is the re-walk):

   OLD — against the app AS IT IS ON `main` (what his browser runs today), built from main's source and served on the
         SAME address the new build will use (browser storage belongs to an address):
           node scripts/handpass/dbr5b-walk.mjs old
         His kind of work is made through the app's own controls — a student added, details typed on a ball, a chart
         duplicated under his own name with details typed on it too, a built-in renamed, a built-in deleted, a second
         course with a student on it — then the whole Tracker is read out (what Export writes, every chart name in the
         dropdown's order) with the rest of the app's record counts, and the browser's storage is kept.
   NEW — against THIS branch's build on the same address, opening that browser's storage:
           node scripts/handpass/dbr5b-walk.mjs new
         The boot converts the old records once (the fold); every chart, layout, detail, course and student must read and
         export exactly as before; the rest of the app keeps every request, person and war; no old whole record is left.
   LIVE — this branch's build, a fresh browser (the demo):
           node scripts/handpass/dbr5b-walk.mjs live
         Two tabs of one browser each add a student and each type details on a different ball — both kept after a
         reload; a course added, renamed, deleted and restored — one row for it throughout; the chart a person opens is
         his own (Saber switches chart; Ranger still opens on the course's; Saber reopens on his); a phone look.

   HP_URL (default http://localhost:4193) · pictures docs/img/handpass/2026-09-30-dbr-phase5b/ */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
/* the earlier Tracker walks' proven ball tap (brings the ball into the chart's view the way a person does, then taps it) */
import { tapBall as w3tap } from './trk-w3-lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4193'
const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-09-30-dbr-phase5b')
const TMP = resolve(tmpdir(), 'dbr5b-walk')
mkdirSync(SHOTS, { recursive: true }); mkdirSync(TMP, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const part = process.argv[2]

const results = []
const check = (name, ok, detail = '') => { results.push({ part, name, ok: !!ok, detail: String(detail).slice(0, 400) }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 240) : ''}`) }
const shot = (page, name) => page.screenshot({ path: resolve(SHOTS, name + '.png') })

async function newPage(ctx, errors, label) {
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push(`${label}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  return page
}
async function signIn(page, who = 'a') {
  await page.goto(BASE + '/')
  const onCard = await page.waitForSelector('#luser', { state: 'visible', timeout: 8000 }).then(() => true, () => false)
  if (onCard) {
    await page.fill('#luser', who === 'a' ? 'ad' : 'us'); await page.fill('#lpass', who === 'a' ? 'a' : 'us')
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(400)
}
async function logout(page) {
  const b = page.locator('#logoutBtn:visible, .topbar button:has-text("Log out"):visible, .topbar button:has-text("Logout"):visible')
  if (await b.count()) await b.first().click()
  else { await page.click('#burger'); await sleep(250); await page.locator('#drawer').getByText(/Log ?out/i).first().click() }
  await page.waitForSelector('#luser', { state: 'visible' })
}
/* which build is on the address: the new one carries the row door's reader (`lsRecord`); main's does not — a part run
   against the wrong build would overwrite the saved old browser with a new one, so it stops instead */
async function assertBuild(page, wantNew) {
  const isNew = await page.evaluate(() => typeof (window.__coreForTests || {}).lsRecord === 'function')
  if (isNew !== wantNew) throw new Error(`this part needs ${wantNew ? "THIS branch's" : "main's"} build on ${BASE}, and the other one is being served`)
}
async function toTracker(page) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else { await page.click('#burger'); await sleep(250); await page.locator('#drawer a[data-page="tracker"]').first().click() }
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  await sleep(500)
}
/* the app's own question box: fill it (if it asks for a value) and press OK / the first button matching `press` */
async function answer(page, value = null, press = /^(OK|Yes|Save|Delete|Add|Rename|Remove|Continue|Import|Replace|Done)/i) {
  await page.waitForSelector('#dlgModal', { state: 'visible', timeout: 6000 })
  const text = (await page.locator('#dlgModal').innerText()).trim()
  if (value != null) {
    const own = page.locator('#dlgInput:visible')
    const inp = (await own.count()) ? own.first() : page.locator('#dlgModal input:visible, #dlgModal textarea:visible').first()
    await inp.fill(String(value))
  }
  const btn = page.locator('#dlgModal button:visible').filter({ hasText: press }).first()
  await ((await btn.count()) ? btn : page.locator('#dlgModal button:visible').last()).click()
  await sleep(350)
  return text
}
async function menuItem(page, menu, itemId) {
  await page.click(`#${menu}MenuBtn`)
  await page.waitForSelector(`#${itemId}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${itemId}`)
  await sleep(300)
}
async function pickFrom(page, sel, labelRe) {
  const v = await page.evaluate(({ sel, src, flags }) => {
    const re = new RegExp(src, flags)
    const o = [...document.querySelector(sel).options].find(o => re.test(o.textContent))
    return o ? o.value : null
  }, { sel, src: labelRe.source, flags: labelRe.flags })
  if (v == null) throw new Error('no option ' + labelRe + ' in ' + sel)
  await page.selectOption(sel, v); await sleep(900)
  return v
}
const tapBall = (page, id) => w3tap(page, id)
async function typeDetails(page, ballId, vals) {
  await tapBall(page, ballId)
  try { await page.waitForSelector('#popEditInfo', { state: 'visible', timeout: 5000 }) }
  catch (e) { await shot(page, '_dbg-no-popup-' + ballId.replace(/[^A-Za-z0-9-]/g, '_')); throw e }
  await page.click('#popEditInfo')
  await page.waitForSelector('#infoModal', { state: 'visible' })
  for (const [k, v] of Object.entries(vals)) await page.fill('#if' + k, v)
  await page.click('#ifSave'); await sleep(500)
}
const firstBalls = (page, n) => page.evaluate(n => [...document.querySelectorAll('#flowSvg .ball')].map(g => g.dataset.id).slice(0, n), n)
async function addStudent(page, name) { await page.click('#addStu'); await answer(page, name); await sleep(500) }
/* everything the Tracker holds of his work, as Export writes it, plus what the screen lists */
async function picture(page) {
  return page.evaluate(async () => {
    const t = window.__coreForTests
    const charts = await t.collectCharts(null, { deleted: true })
    const students = await t.collectStudents()
    return {
      charts, students,
      courses: t.coursesNow(),
      dropdown: [...document.querySelectorAll('#sylSel option')].map(o => o.textContent),
    }
  })
}
/* the rest of the app, counted from browser storage — in whichever shape it is stored */
const appCounts = page => page.evaluate(() => {
  const ls = k => localStorage.getItem('raptor:' + k)
  const keys = p => Object.keys(localStorage).filter(k => k.startsWith('raptor:' + p))
  /* the ALL / ALL AVAIL placeholder pucks rode the old roster record; since phase 2 they are code, never stored — real people only */
  const list = (blob, pre) => { const b = ls(blob); if (b) { const v = JSON.parse(b); return Array.isArray(v) ? v.length : Object.keys(v).filter(k => !(v[k] && v[k].special)).length } return keys(pre).length }
  const wars = ls('leavewar/wars') ? JSON.parse(ls('leavewar/wars')).length : keys('leavewar/war:').length
  return { inputs: list('inputs/all', 'inputs/'), people: list('people/all', 'people/'), wars, schema: ls('settings/schema') }
})
const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.fromEntries(Object.keys(x).sort().map(kk => [kk, x[kk]])) : x)

const browser = await chromium.launch({ headless: true, ...launchOptions })
const errors = []
try {
  if (part === 'old') {
    const ctx = await browser.newContext({ viewport: DESK })
    const page = await newPage(ctx, errors, 'old')
    await signIn(page, 'a'); await toTracker(page)
    await assertBuild(page, false)
    /* his kind of work, through the app's own controls */
    await addStudent(page, 'HIS STUDENT')
    const [b1, b2, b3] = await firstBalls(page, 3)
    await typeDetails(page, b1, { Name: 'HIS WORDS ON ' + b1, Crew: 'IP/IW — his note' })
    await menuItem(page, 'syl', 'dupSyl'); await answer(page, 'HIS OWN: CHART'); await sleep(900)
    /* a copy starts with nobody on it, and a ball on an empty chart opens no pop-up: put his student on it first */
    await addStudent(page, 'HIS STUDENT')
    await typeDetails(page, b2, { Name: 'ON HIS OWN CHART', Hrs: '1.5' })
    await pickFrom(page, '#sylSel', /^Tx 2026/)
    await menuItem(page, 'syl', 'renSyl'); await answer(page, 'MY TX'); await sleep(600)
    await pickFrom(page, '#sylSel', /^2024/)
    await menuItem(page, 'syl', 'delSyl'); await answer(page, null, /^(OK|Yes|Delete)/i); await sleep(900)
    await menuItem(page, 'course', 'addCourse'); await answer(page, '27B'); await sleep(900)
    await addStudent(page, 'CHARLIE')
    await pickFrom(page, '#courseSel', /^26ABSG$/)
    await typeDetails(page, b3, { Fmt: 'Sim', Pre: 'after ' + b2 })
    await sleep(1200)   // the write-behind postman
    const before = await picture(page)
    const counts = await appCounts(page)
    check('OLD: made through the app — a chart of his own, a renamed built-in, a deleted built-in, two courses, details on three balls',
      before.dropdown.some(n => n.startsWith('HIS OWN: CHART')) && before.dropdown.some(n => n.startsWith('MY TX')) && !before.dropdown.some(n => /^2024/.test(n)) &&
      before.courses.length === 2 && Object.values(before.charts.eventInfoBySyl).reduce((n, b) => n + Object.keys(b).length, 0) >= 3,
      `dropdown ${JSON.stringify(before.dropdown)} · courses ${before.courses.map(c => c.name)} · details ${JSON.stringify(Object.fromEntries(Object.entries(before.charts.eventInfoBySyl).map(([k, v]) => [k, Object.keys(v)])))}`)
    check('OLD: stored the old way — the course list, each student list and the chart records whole', await page.evaluate(() =>
      !!localStorage.getItem('raptor:tracker/v3:courses') && !!localStorage.getItem('raptor:tracker/v3:master:sylcat') && Object.keys(localStorage).some(k => /:roster$/.test(k))))
    check('OLD: the rest of the app as main keeps it', counts.inputs > 0 && counts.people > 0 && counts.wars > 0, JSON.stringify(counts))
    await shot(page, '1-old-tracker-his-work')
    writeFileSync(resolve(TMP, 'before.json'), JSON.stringify({ before, counts }))
    await ctx.storageState({ path: resolve(TMP, 'old-state.json') })
    await ctx.close()
  }

  if (part === 'new') {
    const { before, counts } = JSON.parse(readFileSync(resolve(TMP, 'before.json'), 'utf8'))
    const ctx = await browser.newContext({ viewport: DESK, storageState: resolve(TMP, 'old-state.json') })
    const page = await newPage(ctx, errors, 'new')
    await signIn(page, 'a')
    const stamp = await page.evaluate(() => JSON.parse(localStorage.getItem('raptor:settings/schema') || 'null'))
    check('NEW: the boot converted the store once — its format is 6', stamp && stamp.dataFormatVersion === 6 && stamp.initialized === true, JSON.stringify(stamp))
    const left = await page.evaluate(() => Object.keys(localStorage).filter(k => /^raptor:(inputs\/all|people\/all|plan\/all|leavewar\/(wars|openings|ledger|postouts|perslabels)|settings\/(elog|changeseen|accounts|accessreqs)|tracker\/v3:(courses|delcourses|master:(syls|sylcat|sylorder|sylhidden|syltomb|eventinfo)))$/.test(k) || /^raptor:tracker\/.*:roster$/.test(k)))
    check('NEW: no old whole record is left anywhere', left.length === 0, left.join(', '))
    const rows = await page.evaluate(() => ({
      course: Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:course:')).length,
      enr: Object.keys(localStorage).filter(k => /^raptor:tracker\/v3:[^:]+:[^:]+:enr:/.test(k)).length,
      chart: Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:chart:')).length,
      info: Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:info:')).length,
    }))
    check('NEW: the Tracker is stored one row per course, enrolment, chart and ball\'s details', rows.course === 2 && rows.enr >= 4 && rows.chart >= 5 && rows.info >= 3, JSON.stringify(rows))
    const after2 = await appCounts(page)
    check('NEW: the rest of the app came through whole — every request, person and war', after2.inputs === counts.inputs && after2.people === counts.people && after2.wars === counts.wars,
      `before ${JSON.stringify({ ...counts, schema: undefined })} · after ${JSON.stringify({ ...after2, schema: undefined })}`)
    await toTracker(page)
    await assertBuild(page, true)
    await sleep(800)
    const after = await picture(page)
    check('NEW: the Tracker reads and EXPORTS exactly as before — every chart, layout, name, order, detail, course and student (D464)',
      canon(after.charts) === canon(before.charts) && canon(after.students) === canon(before.students) && canon(after.courses) === canon(before.courses),
      canon(after.charts) !== canon(before.charts) ? 'charts differ' : canon(after.students) !== canon(before.students) ? 'students differ' : canon(after.courses) !== canon(before.courses) ? 'courses differ' : `${Object.keys(after.charts.syllabi).length} charts, ${after.courses.length} courses — the same`)
    check('NEW: the syllabus dropdown lists the same charts in the same order', JSON.stringify(after.dropdown) === JSON.stringify(before.dropdown), JSON.stringify(after.dropdown))
    await shot(page, '2-new-tracker-after-conversion')
    await pickFrom(page, '#sylSel', /^HIS OWN: CHART/)
    const ownBalls = await page.locator('#flowSvg .ball').count()
    check('NEW: his own chart opens, drawn', ownBalls > 10, `${ownBalls} balls`)
    await shot(page, '3-new-his-own-chart')
    await pickFrom(page, '#courseSel', /^27B$/)
    check('NEW: the second course and its student', (await page.locator('#activeSel option').allInnerTexts()).includes('CHARLIE'))
    await ctx.close()
    /* and at phone width */
    const pctx = await browser.newContext({ viewport: PHONE, storageState: resolve(TMP, 'old-state.json') })
    const ppage = await newPage(pctx, errors, 'new-phone')
    await signIn(ppage, 'a'); await toTracker(ppage)
    check('NEW (phone): the Tracker draws after the conversion', (await ppage.locator('#flowSvg .ball').count()) > 10)
    await shot(ppage, '4-new-phone-tracker')
    await pctx.close()
  }

  if (part === 'live') {
    const ctx = await browser.newContext({ viewport: DESK })
    const a = await newPage(ctx, errors, 'tab A')
    await signIn(a, 'a'); await toTracker(a)
    const b = await newPage(ctx, errors, 'tab B')
    await signIn(b, 'a'); await toTracker(b)
    /* two tabs of one browser, each with its own copy — each adds a student, each types on a different ball */
    await addStudent(a, 'ALPHA')
    await addStudent(b, 'BRAVO')
    const [x1, x2] = await firstBalls(a, 2)
    await typeDetails(a, x1, { Name: 'TYPED IN TAB A' })
    await typeDetails(b, x2, { Name: 'TYPED IN TAB B' })
    await sleep(1200)
    await a.reload(); await signIn(a, 'a'); await toTracker(a)
    const crew = await a.locator('#activeSel option').allInnerTexts()
    check('LIVE: two tabs each added a student — after a reload BOTH are there', crew.includes('ALPHA') && crew.includes('BRAVO'), JSON.stringify(crew))
    const info = await a.evaluate(ids => ids.map(id => window.__coreForTests.lsRecord('v3:master:eventinfo')), [x1])
    const det = JSON.parse(info[0] || '{}')
    const flat = Object.values(det).flatMap(bl => Object.values(bl).map(f => f.name))
    check('LIVE: …and each typed on a different ball — BOTH details kept', flat.includes('TYPED IN TAB A') && flat.includes('TYPED IN TAB B'), JSON.stringify(flat))
    await shot(a, '5-live-two-tabs-both-kept')
    /* a course: added, renamed, deleted, restored — one row throughout */
    await menuItem(a, 'course', 'addCourse'); await answer(a, 'WALK ONE'); await sleep(700)
    await menuItem(a, 'course', 'renCourse'); await answer(a, 'WALK TWO'); await sleep(600)
    const rowsAfterRename = await a.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:course:')).map(k => JSON.parse(localStorage.getItem(k)).name))
    await menuItem(a, 'course', 'delCourse'); await answer(a, null, /^(OK|Yes|Delete)/i); await sleep(800)
    await menuItem(a, 'course', 'ordCourse')
    await a.waitForSelector('#ordHidden', { state: 'visible' })
    await a.locator('#ordHidden button', { hasText: 'Restore' }).first().click(); await sleep(500)
    await a.click('#ordSave'); await sleep(800)
    await a.reload(); await signIn(a, 'a'); await toTracker(a)
    const courses = await a.locator('#courseSel option').allInnerTexts()
    const courseRows = await a.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/v3:master:course:')).map(k => JSON.parse(localStorage.getItem(k))))
    check('LIVE: a course added, renamed, deleted and restored — back in the list after a reload, one row for it',
      courses.includes('WALK TWO') && rowsAfterRename.includes('WALK TWO') && courseRows.filter(r => r.name === 'WALK TWO').length === 1 && !courseRows.some(r => r.deleted),
      `list ${JSON.stringify(courses)} · rows ${JSON.stringify(courseRows.map(r => r.name + (r.deleted ? ' (deleted)' : '')))}`)
    await shot(a, '6-live-course-restored')
    await ctx.close()

    /* the chart a person has open is his own place */
    const c2 = await browser.newContext({ viewport: DESK })
    const p = await newPage(c2, errors, 'pick')
    await signIn(p, 'a'); await toTracker(p)
    const courseId = await p.evaluate(() => document.getElementById('courseSel').value)
    const shared = await p.evaluate(c => JSON.parse(localStorage.getItem('raptor:tracker/v3:' + c + ':plan')).sylId, courseId)
    const tx = await pickFrom(p, '#sylSel', /^Tx 2026/)
    await sleep(1200)
    const stored = await p.evaluate(c => JSON.parse(localStorage.getItem('raptor:tracker/v3:' + c + ':plan')).sylId, courseId)
    check('LIVE: Saber switches the chart — the course\'s own chart is not changed', stored === shared && tx !== shared, `course's chart ${shared}, after the switch ${stored}, his ${tx}`)
    await logout(p); await signIn(p, 'u'); await toTracker(p)
    const ranger = await p.evaluate(() => document.getElementById('sylSel').value)
    check('LIVE: Ranger then opens the course on the course\'s chart, not on Saber\'s', ranger === shared, ranger)
    await shot(p, '7-live-ranger-course-chart')
    await logout(p); await signIn(p, 'a'); await toTracker(p)
    const saber = await p.evaluate(() => document.getElementById('sylSel').value)
    check('LIVE: Saber reopens on his own chart', saber === tx, saber)
    await shot(p, '8-live-saber-own-chart')
    await c2.close()

    const ph = await browser.newContext({ viewport: PHONE })
    const pp = await newPage(ph, errors, 'phone')
    await signIn(pp, 'a'); await toTracker(pp)
    /* on a phone the student list sits under the ⓘ Info tab */
    await pp.click('button[data-view="info"]'); await sleep(400)
    await addStudent(pp, 'PHONE ADD')
    await sleep(900)
    await pp.reload(); await signIn(pp, 'a'); await toTracker(pp)
    check('LIVE (phone): a student added on a phone is there after a reload', (await pp.locator('#activeSel option').allInnerTexts()).includes('PHONE ADD'))
    await shot(pp, '9-live-phone')
    await ph.close()
  }
} catch (e) {
  check(`${part}: the walk ran to its end`, false, e && e.stack || e)
} finally {
  await browser.close()
}
check(`${part}: no console error, page error or failed request`, errors.length === 0, errors.slice(0, 5).join(' | '))
writeFileSync(resolve(ROOT, `docs/handpass/parts/dbr5b-${part}.json`), JSON.stringify(results, null, 2))
const bad = results.filter(r => !r.ok).length
console.log(`${part}: ${results.length - bad}/${results.length} passed`)
process.exitCode = bad ? 1 : 0
