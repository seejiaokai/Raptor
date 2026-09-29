/* [TRK-LEFTOVERS] baseline — M ([TRK-SESSION-PICK]): the admin picks a course
   that is NOT the first one and a student, logs out through the app's own
   Logout; the member signs in on the same browser and opens the Tracker —
   which course and student does it open on? Then the admin again.
   Desktop 1440x900, one browser throughout (the same person's PC). */
import { open, shot, save, log, login, logout, toTracker, DESK } from './trk-lib.mjs'
import { sleep, menuItem, dlg } from './trk-w3-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const opts = sel => page.evaluate(sel => [...document.querySelectorAll(sel + ' option')].map(o => ({ v: o.value, t: o.textContent })), sel)
const picked = () => page.evaluate(() => { const c = document.getElementById('courseSel'), a = document.getElementById('activeSel'), s = document.getElementById('sylSel'); return { course: c.options[c.selectedIndex] && c.options[c.selectedIndex].textContent, courseIndex: c.selectedIndex, student: a.options[a.selectedIndex] && a.options[a.selectedIndex].textContent, syllabus: s.options[s.selectedIndex] && s.options[s.selectedIndex].textContent } })
const choose = async (sel, value) => { await page.click(sel); await sleep(150); await page.selectOption(sel, value); await sleep(800) }

let courses = await opts('#courseSel')
L.note('M.0 admin, fresh browser: courses', courses.map(c => c.t).join(', ') + ' · opens on ' + JSON.stringify(await picked()))
if (courses.length < 2) {
  await menuItem(page, 'course', 'addCourse'); const d = await dlg(page, { value: 'LO SECOND' }); await sleep(600)
  L.note('M.1 only one course — added one with ✎ → + Add course', d.text.replace(/\s+/g, ' ').slice(0, 120) + ' · courses now ' + (await opts('#courseSel')).map(c => c.t).join(', '))
  courses = await opts('#courseSel')
}
/* a course that is not the first in the list, with students on it */
const target = courses[1]
await choose('#courseSel', target.v)
let studs = await opts('#activeSel')
L.note('M.2 picked course #2 "' + target.t + '": its students', studs.map(s => s.t).join(', ') || '(none)')
if (studs.length < 2) {
  /* give it two students by the + Add's type-a-callsign box */
  for (const nm of ['LO ONE', 'LO TWO'].slice(0, 2 - studs.length)) {
    await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(250)
    await dlg(page, { value: nm }); await sleep(500)
  }
  studs = await opts('#activeSel')
  L.note('M.2b added students', studs.map(s => s.t).join(', '))
}
const stud = studs[studs.length - 1]
await choose('#activeSel', stud.v)
const adminPick = await picked()
L.note('M.3 the admin\'s pick before logging out', JSON.stringify(adminPick))
await shot(page, 'lo-M-1-admin-pick')

await logout(page)
L.note('M.4 logged out through the app\'s Logout', 'the sign-in page is up')
await login(page, 'u'); await toTracker(page)
const memberPick = await picked()
L.note('M.5 the member (us) signs in on the same browser, opens the Tracker', JSON.stringify(memberPick))
L.ok('M.6 the member opens on the default course (the first) — not the admin\'s last pick', memberPick.courseIndex === 0 && memberPick.course !== adminPick.course, JSON.stringify(memberPick) + ' vs admin ' + JSON.stringify(adminPick))
await shot(page, 'lo-M-2-member-opens-on')

await logout(page)
await login(page, 'a'); await toTracker(page)
const adminAgain = await picked()
L.note('M.7 the admin signs in again: the Tracker opens on', JSON.stringify(adminAgain))
await shot(page, 'lo-M-3-admin-again-opens-on')

save('lo-G-session', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
