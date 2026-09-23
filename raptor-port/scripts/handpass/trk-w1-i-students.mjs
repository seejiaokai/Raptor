/* [HUMAN-RETEST] Tracker — walker w1, walk I: the STUDENTS round trip
   (R16, R17, R19, R21, R23, R35; D120).

   World A builds a real student record through the app's own controls, on the
   demo course 26ABSG, chart 2026:
     P — picked from the squadron roster (+ Add → the list: a linked dot);
     T — typed by hand;
     both with grades (DCO / DPCO / Marginal / N.A.), dated Done-on days,
     failures with their days, both Last Flown boxes, down days, an upchit day,
     a pace and both end dates, and a lull period; STUDENT A (the demo name) with
     one mark; and a NEW course 27TEST with a typed student and a mark.
   Export WITH Students & courses (every chart) — the file name and the done
   message must say so.
   World B (wiped): Import → "also contains students and marks… Bring them in
   too?" → Yes → compare everything on screen for every student.
   World C (wiped; STUDENT A given a mark of her own first): Import → No →
   her marks untouched, nobody added, 27TEST not added. */
import { readFileSync } from 'node:fs'
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, pickCourse, pickCrew, crewLabels, courseLabels,
  tapBall, bubble, exportVia, importVia, dlgUp, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-i-with-students.json')
const EVENTS = ['ST-01', 'ST-02', 'ACG-01', 'ACG-02']

async function grade(page, id, label, doneOn = null) {
  await tapBall(page, id)
  if (!(await page.locator('#pop').isVisible().catch(() => false))) return false
  if (doneOn) { await page.fill('#popDoneDate', doneOn); await sleep(200) }
  await page.locator('#pop .opts button', { hasText: new RegExp('^' + label.replace('.', '\\.')) }).first().click(); await sleep(400)
  return true
}
async function fail(page, id, days) {
  await tapBall(page, id)
  for (const d of days) { await page.fill('#popFailDate', d); await sleep(150); await page.click('#popFailPlus'); await sleep(300) }
  const n = await page.locator('#failCount').innerText().catch(() => '?')
  await page.locator('#pop .opts button', { hasText: 'Close' }).click(); await sleep(250)
  return n
}
async function fillSide(page, vals) {
  for (const [id, v] of Object.entries(vals)) { await page.fill('#' + id, v); await sleep(250) }
}
async function lull(page, from, to) {
  await page.click('#setLullBtn'); await page.waitForSelector('#lullCal', { state: 'visible' })
  await page.click(`#lullCal .day[data-iso="${from}"]`); await sleep(200)
  await page.click(`#lullCal .day[data-iso="${to}"]`); await sleep(400)
}
/* everything the screen says about one student */
async function studentScreen(page, name) {
  await pickCrew(page, name)
  const ev = {}
  for (const id of EVENTS) ev[id] = await bubble(page, id)
  const side = await page.evaluate(() => {
    const v = id => { const e = document.getElementById(id); return e ? e.value : null }
    const t = sel => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    return {
      overall: t('.c-overall .big'), lastSyll: v('lastSyll'), lastCurr: v('lastCurr'), downDays: v('downDays'), upchit: v('upchit'),
      daysSince: t('.c-curr .curKv'), epw: v('epwIn'), endA: v('targetIn'), endB: v('targetIn2'), paceCard: t('.c-pace .paceGrid'),
      fails: [...document.querySelectorAll('#failChips .failchip')].map(c => c.getAttribute('title')), lulls: t('#lullChips'),
    }
  })
  const chip = await page.evaluate(n => {
    const c = [...document.querySelectorAll('.c-students .chips .chip')].find(x => x.innerText.replace(/[✎×\d]/g, '').trim() === n)
    return c ? { linked: c.classList.contains('linked'), title: c.getAttribute('title') } : null
  }, name)
  return { ev, side, chip }
}
function compare(tag, a, b) {
  const diffs = []
  for (const id of EVENTS) if (a.ev[id] !== b.ev[id]) diffs.push(`${id}: "${a.ev[id]}" vs "${b.ev[id]}"`)
  for (const k of Object.keys(a.side)) if (JSON.stringify(a.side[k]) !== JSON.stringify(b.side[k])) diffs.push(`${k}: ${JSON.stringify(a.side[k])} vs ${JSON.stringify(b.side[k])}`)
  if (JSON.stringify(a.chip) !== JSON.stringify(b.chip)) diffs.push(`chip: ${JSON.stringify(a.chip)} vs ${JSON.stringify(b.chip)}`)
  L.ok(`13: ${tag} — everything on screen matches after export → wipe → import`, !diffs.length, diffs.length ? diffs.slice(0, 4).join(' ‖ ') : `${EVENTS.length} events, currency, pace, failures, lulls, chip — identical`)
}

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pickSyl(pa, '2026')
L.note('A: crew at start', (await crewLabels(pa)).join(', '))
/* P — from the squadron roster */
await pa.click('#addStu'); await dlgUp(pa, 2000)
const rosterOffer = (await pa.locator('#dlgList .dlg-item').allInnerTexts()).slice(0, 3).map(s => s.replace(/\s+/g, ' '))
await shot(pa, 'w1-13-A-add-from-roster')
await pa.locator('#dlgList .dlg-item').first().click(); await sleep(700)
const crew1 = await crewLabels(pa)
const P = crew1[crew1.length - 1]
L.note('A: + Add offered the roster', `${rosterOffer.join(' | ')} … picked → "${P}"`)
/* T — typed */
await pa.click('#addStu'); await dlgUp(pa, 2000); await dlg(pa, { value: 'typed one' }); await sleep(700)
const crew2 = await crewLabels(pa)
const T = crew2[crew2.length - 1]
L.ok('A: two students added — one from the roster, one typed', crew2.length === 4 && T === 'TYPED ONE', crew2.join(', '))

/* P's record */
await pickCrew(pa, P)
await grade(pa, 'ST-01', 'DCO', '2026-09-01')
await grade(pa, 'ST-02', 'DPCO')
await grade(pa, 'ACG-01', 'Marginal', '2026-09-12')
L.note('A: P — ACG-01 fails recorded', await fail(pa, 'ACG-01', ['2026-09-05', '2026-09-10']))
await grade(pa, 'ACG-02', 'N.A.')
await fillSide(pa, { lastSyll: '2026-09-15', lastCurr: '2026-09-16', downDays: '3', upchit: '2026-09-20', epwIn: '3.5', targetIn: '2026-12-01', targetIn2: '2027-01-15' })
await lull(pa, '2026-09-28', '2026-10-02')
await shot(pa, 'w1-13-A-P-record')
/* T's record */
await pickCrew(pa, T)
await grade(pa, 'ST-01', 'Marginal', '2026-08-18')
L.note('A: T — ST-01 fails recorded', await fail(pa, 'ST-01', ['2026-08-20']))
await grade(pa, 'ACG-01', 'DCO', '2026-08-25')
await fillSide(pa, { lastSyll: '2026-08-30', lastCurr: '2026-08-31', downDays: '1', epwIn: '1.5', targetIn: '2027-03-01', targetIn2: '2027-04-01' })
await lull(pa, '2026-09-14', '2026-09-18')
await shot(pa, 'w1-13-A-T-record')
/* STUDENT A — one mark (the demo name exists in every fresh app too) */
await pickCrew(pa, 'STUDENT A')
await grade(pa, 'ST-01', 'DCO', '2026-09-02')
/* a NEW course with a typed student and a mark */
await menu(pa, 'course', 'addCourse'); await dlg(pa, { value: '27TEST' }); await sleep(900)
await pa.click('#addStu'); await dlgUp(pa, 2000); await dlg(pa, { value: 'C STUDENT' }); await sleep(700)
await grade(pa, 'ST-01', 'DCO', '2026-09-03')
const cA = await studentScreen(pa, 'C STUDENT')
await pickCourse(pa, '26ABSG'); await sleep(500)
const snapA = { P: await studentScreen(pa, P), T: await studentScreen(pa, T), SA: await studentScreen(pa, 'STUDENT A') }
L.note('A: P on screen', JSON.stringify(snapA.P.side) + ' ' + JSON.stringify(snapA.P.chip))
L.note('A: P ACG-01 bubble', snapA.P.ev['ACG-01'])
const crewA = await crewLabels(pa), coursesA = await courseLabels(pa)

/* Export WITH Students & courses, every chart */
const ex = await exportVia(pa, { tick: 'all', students: true, file: FILE, shotName: 'w1-13-A-export-window' })
L.ok('13 / R19: the suggested file name says WITH-STUDENTS', /WITH-STUDENTS/.test(ex.suggested), ex.suggested)
L.ok('13 / R18: the done message warns the file holds names and marks', /CONTAINS student names and marks/i.test(ex.conf), ex.conf)
const st = ex.json.students || {}
const aCourse = Object.values(st.byCourse || {}).find(b => b && b.bySyllabus && b.bySyllabus.sb2026 && (b.bySyllabus.sb2026.roster || []).some(r => r.name === P))
const pEntry = aCourse && aCourse.bySyllabus.sb2026.roster.find(r => r.name === P)
const pMarks = aCourse && pEntry && (aCourse.bySyllabus.sb2026.marks || {})[pEntry.id]
L.note('13 / R35: P in the file', `roster entry ${JSON.stringify(pEntry)}; ST-01 mark ${JSON.stringify(pMarks && pMarks['ST-01'])}`)
L.ok('13 / R35: a mark in the file carries who and when (by / at)', !!(pMarks && pMarks['ST-01'] && pMarks['ST-01'].by && pMarks['ST-01'].at), JSON.stringify(pMarks && pMarks['ST-01']))
await A.browser.close()

/* ================= WORLD B — wiped, Import → Yes ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
L.note('B: crew in the wiped app', (await crewLabels(pb)).join(', '))
const askedB = await importVia(pb, FILE, async (msg, i, page) => {
  if (/also contains students and marks/i.test(msg)) { await shot(page, 'w1-13-B-students-question'); return 'ok' }
  if (/^(Brought in|Students)/.test(msg)) await shot(page, 'w1-13-B-closing')
  return 'ok'
})
const qB = askedB.find(a => /also contains students/i.test(a.msg))
L.ok('13 / R16: the import asks ONCE whether to bring the students and marks in too', askedB.filter(a => /also contains students/i.test(a.msg)).length === 1, qB ? qB.msg : 'never asked')
L.ok('13 / R23: the question says a student ALSO in the file has their marks replaced; anyone not named keeps theirs', !!qB && /replaced/i.test(qB.msg) && /keeps theirs/i.test(qB.msg), qB ? qB.msg : '')
L.note('B: the closing message', (askedB[askedB.length - 1] || {}).msg)
await pickCourse(pb, '26ABSG').catch(() => {})
await pickSyl(pb, '2026')
const crewB = await crewLabels(pb)
L.ok('13 / R21: the file\'s students land on the SAME students — no name twice on the course', new Set(crewB).size === crewB.length && crewA.every(n => crewB.includes(n)), `A: ${crewA.join(', ')}  |  B: ${crewB.join(', ')}`)
const snapB = { P: await studentScreen(pb, P), T: await studentScreen(pb, T), SA: await studentScreen(pb, 'STUDENT A') }
await pickCrew(pb, P); await shot(pb, 'w1-13-B-P-record')
await pickCrew(pb, T); await shot(pb, 'w1-13-B-T-record')
compare(`P (from the roster: ${P})`, snapA.P, snapB.P)
compare('T (typed: TYPED ONE)', snapA.T, snapB.T)
compare('STUDENT A (the demo name, matched by name)', snapA.SA, snapB.SA)
const coursesB = await courseLabels(pb)
L.ok('13: the new course 27TEST came in', coursesB.includes('27TEST'), coursesB.join(', '))
if (coursesB.includes('27TEST')) {
  await pickCourse(pb, '27TEST')
  const cB = await studentScreen(pb, 'C STUDENT')
  compare('C STUDENT on 27TEST', cA, cB)
}
await B.browser.close()

/* ================= WORLD C — wiped, a mark of her own, Import → No ================= */
const C = await open({ size: DESK, who: 'a' })
const pc = C.page
await pickSyl(pc, '2026'); await pickCrew(pc, 'STUDENT A')
await grade(pc, 'ST-02', 'DPCO', '2026-09-21')
const saC0 = await studentScreen(pc, 'STUDENT A')
const askedC = await importVia(pc, FILE, async (msg, i, page) => {
  if (/also contains students and marks/i.test(msg)) return 'cancel'
  if (/^(Brought in|Nothing)/.test(msg)) await shot(page, 'w1-13-C-closing')
  return 'ok'
})
const closeC = (askedC[askedC.length - 1] || {}).msg || ''
L.ok('13 / R16: answering No — the closing message says marks are untouched', /marks are untouched/i.test(closeC), closeC)
await pickCourse(pc, '26ABSG').catch(() => {})
await pickSyl(pc, '2026')
const crewC = await crewLabels(pc), coursesC = await courseLabels(pc)
const saC1 = await studentScreen(pc, 'STUDENT A')
await shot(pc, 'w1-13-C-after-no')
L.ok('13 / R17: No → nobody from the file added to the course', !crewC.includes(P) && !crewC.includes(T), crewC.join(', '))
L.ok('13 / R16: No → the file\'s course 27TEST is not added', !coursesC.includes('27TEST'), coursesC.join(', '))
L.ok('13 / R17: No → STUDENT A\'s own marks untouched (and the file\'s mark for her did not come in)', JSON.stringify(saC0.ev) === JSON.stringify(saC1.ev), `ST-01 "${saC1.ev['ST-01']}" · ST-02 "${saC1.ev['ST-02']}"`)
save('w1-i-students', { rows: L.rows, P, T, snapA, snapB, askedB, askedC, errorsA: A.errors, errorsB: B.errors, errorsC: C.errors })
console.log(`errors A ${A.errors.length} B ${B.errors.length} C ${C.errors.length}: ${[...A.errors, ...B.errors, ...C.errors].slice(0, 4).join(' | ')}`)
await C.browser.close()
