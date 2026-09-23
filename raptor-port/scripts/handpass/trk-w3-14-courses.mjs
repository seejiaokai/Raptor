/* w3 item 14 — courses (R85–R89), 1700x900 so the "<COURSE> PROGRESS
   TRACKER" heading is on screen (it is hidden below 1600px).
   ✎ Rename course: a label only (marks stay), upper-cased; a taken name, a
   colon and the reserved names refused. + Add course lands at the TOP, empty.
   The last course cannot be deleted. With an UNSAVED chart edit: switching
   (both answers), adding, renaming, deleting a course and switching the chart
   all ask first. ⇅ Reorder courses and syllabi survive a reload.
   (Off my list, cheap here: do + Add syllabus / ⧉ Duplicate ask too? Fable #3.) */
import { open, shot, save, log, login, toTracker } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg, dlgText, dlgPress, pickFrom } from './trk-w3-lib.mjs'

const L = log()
const SIZE = { width: 1700, height: 900 }
const courses = page => page.evaluate(() => [...document.querySelectorAll('#courseSel option')].map(o => o.textContent))
const syls = page => page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => o.textContent))
const cur = page => page.locator('#courseSel option:checked').innerText()
const wedges = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null }, id)
const students = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
/* answer a prompt with a value and return what the app said next (a refusal box, or nothing) */
async function promptAnswer(page, value) {
  const q = await dlg(page, { value }); await sleep(400)
  const next = await dlgText(page)
  if (next) await page.click('#dlgOk'); await sleep(250)
  return { asked: q.text.replace(/\s+/g, ' '), then: next }
}
const unsavedEdit = async (page, name) => {
  await menuItem(page, 'syl', 'arrangeBtn')
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250)
  await dlg(page, { value: name }); await sleep(300)
  await menuItem(page, 'syl', 'arrangeBtn')
  return page.locator('#saveChanges').count()
}

const { browser, page, errors } = await open({ size: SIZE, who: 'a' })
L.note('start', `courses ${JSON.stringify(await courses(page))}, heading "${await page.locator('#courseTitle').innerText()}"`)
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
const w0 = await wedges(page, 'ST-01'), st0 = await students(page)

/* A. rename = a label */
await menuItem(page, 'course', 'renCourse')
let r = await promptAnswer(page, '26absg alpha')
L.ok('A. ✎ Rename course → upper-cased, the dropdown and the heading follow', (await cur(page)) === '26ABSG ALPHA' && (await page.locator('#courseTitle').innerText()) === '26ABSG ALPHA PROGRESS TRACKER', `asked "${r.asked}" · now "${await cur(page)}" · heading "${await page.locator('#courseTitle').innerText()}"`)
L.ok('A. …a label only: the same students and the mark are still there', JSON.stringify(await students(page)) === JSON.stringify(st0) && JSON.stringify(await wedges(page, 'ST-01')) === JSON.stringify(w0), `${JSON.stringify(await students(page))} · ST-01 ${JSON.stringify(await wedges(page, 'ST-01'))}`)
await shot(page, 'w3-14-A-renamed')

/* C first (we need a second course): + Add course */
await menuItem(page, 'course', 'addCourse')
r = await promptAnswer(page, '26bbsg')
const c1 = await courses(page)
L.ok('C. + Add course → lands at the TOP, empty', c1[0] === '26BBSG' && (await cur(page)) === '26BBSG' && !(await students(page)).length, `asked "${r.asked}" · order ${JSON.stringify(c1)} · status "${await page.locator('#saveStat').innerText()}" · card "${(await page.locator('#side .c-students').innerText()).replace(/\s+/g, ' ')}"`)
await shot(page, 'w3-14-C-added')
await pickFrom(page, '#courseSel', /^26ABSG ALPHA$/)

/* B. refusals */
for (const [what, v] of [['a taken name', '26bbsg'], ['a colon', 'a:b'], ['"courses"', 'courses'], ['"master"', 'master'], ['"syllabus edit"', 'syllabus edit']]) {
  await menuItem(page, 'course', 'renCourse')
  r = await promptAnswer(page, v)
  L.ok(`B. rename to ${what} is refused, with a message, nothing renamed`, !!r.then && (await cur(page)) === '26ABSG ALPHA', `said: "${(r.then || 'nothing').replace(/\s+/g, ' ')}" · course "${await cur(page)}"`)
}
/* the same refusals on + Add course */
await menuItem(page, 'course', 'addCourse')
r = await promptAnswer(page, 'master')
L.ok('B. + Add course "master" is refused too', !!r.then && !(await courses(page)).includes('MASTER'), `said: "${(r.then || 'nothing').replace(/\s+/g, ' ')}"`)

/* E. unsaved chart edit → every course door asks */
L.note('E. an unsaved edit (arrange → + Test → Done, no Save): Save button shown', String(await unsavedEdit(page, 'UNS-1')))
await pickFrom(page, '#courseSel', /^26BBSG$/)
let q = await dlgText(page)
L.ok('E. switching course asks first', !!q && /unsaved flow edits/i.test(q), (q || 'no question').replace(/\s+/g, ' '))
await page.click('#dlgCancel'); await sleep(500)
L.ok('E. …Cancel: still on the course, the edit and ✓ Save changes still there', (await cur(page)) === '26ABSG ALPHA' && (await page.locator('#saveChanges').count()) === 1 && (await page.locator('#flowSvg .ball[data-id="UNS-1"]').count()) === 1, `course "${await cur(page)}", Save ${await page.locator('#saveChanges').count()}, UNS-1 ${await page.locator('#flowSvg .ball[data-id="UNS-1"]').count()}`)
await shot(page, 'w3-14-E-switch-no')
await pickFrom(page, '#courseSel', /^26BBSG$/)
q = await dlgText(page)
await page.click('#dlgOk'); await sleep(800)
L.ok('E. …OK: switches, the Save button goes, the status stops claiming unsaved edits', (await cur(page)) === '26BBSG' && !(await page.locator('#saveChanges').count()) && !/unsaved/i.test(await page.locator('#saveStat').innerText()), `course "${await cur(page)}", status "${await page.locator('#saveStat').innerText()}"`)
await pickFrom(page, '#courseSel', /^26ABSG ALPHA$/)
L.ok('E. …and back on the first course the discarded ball is gone', (await page.locator('#flowSvg .ball[data-id="UNS-1"]').count()) === 0, '')
await shot(page, 'w3-14-E-switch-yes-back')
await unsavedEdit(page, 'UNS-2')
for (const [door, run] of [
  ['+ Add course', () => menuItem(page, 'course', 'addCourse')],
  ['✎ Rename course', () => menuItem(page, 'course', 'renCourse')],
  ['🗑 Delete course', () => menuItem(page, 'course', 'delCourse')],
  ['switching the chart', () => pickFrom(page, '#sylSel', /^Tx 2026/)],
]) {
  await run(); await sleep(300)
  q = await dlgText(page)
  L.ok(`E. ${door} asks about the unsaved edit first`, !!q && /unsaved flow edits/i.test(q), (q || 'no question').replace(/\s+/g, ' '))
  if (q) { await page.click('#dlgCancel'); await sleep(400) }
  if (await dlgText(page)) { await page.click('#dlgCancel').catch(() => {}); await sleep(300) }
}
L.ok('E. after four Cancels: same course, same chart, the edit still waiting', (await cur(page)) === '26ABSG ALPHA' && /^2026/.test(await page.locator('#sylSel option:checked').innerText()) && (await page.locator('#saveChanges').count()) === 1, `course "${await cur(page)}", chart "${await page.locator('#sylSel option:checked').innerText()}", Save ${await page.locator('#saveChanges').count()}`)
/* off my list (Fable #3): + Add syllabus and ⧉ Duplicate with the same unsaved edit */
for (const [door, id] of [['+ Add syllabus', 'addSyl'], ['⧉ Duplicate syllabus', 'dupSyl']]) {
  await menuItem(page, 'syl', id); await sleep(300)
  q = await dlgText(page)
  L.note(`E (off-list, Fable #3). ${door} with an unsaved edit — the first thing it says`, (q || 'nothing').replace(/\s+/g, ' '))
  if (q) { await page.click('#dlgCancel'); await sleep(400) }
}
L.note('E. after cancelling those: Save still waiting?', String(await page.locator('#saveChanges').count()))
await page.click('#saveChanges').catch(() => {}); await sleep(400)

/* D. the last course cannot go */
await pickFrom(page, '#courseSel', /^26BBSG$/)
await menuItem(page, 'course', 'delCourse')
q = await dlgText(page)
await page.click('#dlgOk'); await sleep(700)
L.note('D. delete 26BBSG asked', (q || 'nothing').replace(/\s+/g, ' '))
L.note('D. courses now', JSON.stringify(await courses(page)))
await menuItem(page, 'course', 'delCourse')
q = await dlgText(page)
L.ok('D. with one course left, Delete says "Keep at least one course."', /Keep at least one course/.test(q || ''), (q || 'nothing').replace(/\s+/g, ' '))
if (q) await page.click('#dlgOk'); await sleep(300)
L.ok('D. …and the course is still there', (await courses(page)).length === 1, JSON.stringify(await courses(page)))

/* F. reorder courses and syllabi, then a reload */
await menuItem(page, 'course', 'addCourse'); await promptAnswer(page, '26CCSG')
await menuItem(page, 'course', 'addCourse'); await promptAnswer(page, '26DDSG')
const cb = await courses(page)
await menuItem(page, 'course', 'ordCourse'); await page.waitForSelector('#ordModal', { state: 'visible' })
await page.locator('#ordList .ordrow').nth(0).locator('button[title="Move down"]').click(); await sleep(150)
await page.locator('#ordList .ordrow').nth(1).locator('button[title="Move down"]').click(); await sleep(150)
await page.click('#ordSave'); await sleep(400)
const ca = await courses(page)
L.ok('F. ⇅ Reorder courses: the dropdown follows', JSON.stringify(ca) !== JSON.stringify(cb), `${JSON.stringify(cb)} → ${JSON.stringify(ca)}`)
const sb = await syls(page)
await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' })
const n = await page.locator('#ordList .ordrow').count()
for (let i = n - 1; i > 0; i--) { await page.locator('#ordList .ordrow').nth(i).locator('button[title="Move up"]').click(); await sleep(120) }
await shot(page, 'w3-14-F-reorder-syllabi', { el: '#ordModal' })
await page.click('#ordSave'); await sleep(400)
const sa = await syls(page)
L.ok('F. ⇅ Reorder syllabi: the dropdown follows', JSON.stringify(sa) !== JSON.stringify(sb), `${JSON.stringify(sb)} → ${JSON.stringify(sa)}`)
await page.reload(); await login(page, 'a'); await toTracker(page)
L.ok('F. both orders survive a reload', JSON.stringify(await courses(page)) === JSON.stringify(ca) && JSON.stringify(await syls(page)) === JSON.stringify(sa), `courses ${JSON.stringify(await courses(page))} · syllabi ${JSON.stringify(await syls(page))}`)
await shot(page, 'w3-14-F-after-reload')
L.note('errors', errors.join(' | ') || 'none')
save('w3-14-courses', { rows: L.rows })
await browser.close()
