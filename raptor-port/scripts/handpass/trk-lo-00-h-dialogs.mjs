/* [TRK-LEFTOVERS] baseline — N ([TRK-DLG-LEFTOVERS] item 1): with one
   question open (✎ Rename course), can Tab reach a control behind the grey
   shade, and Enter there open a SECOND question? What happens to the first?
   Desktop 1440x900, admin, a fresh browser; keyboard only once the first
   question is up. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, menuItem, dlgText } from './trk-w3-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const courseName = () => page.evaluate(() => { const c = document.getElementById('courseSel'); return c.options[c.selectedIndex].textContent })
const focused = () => page.evaluate(() => {
  const e = document.activeElement; if (!e || e === document.body) return { d: 'body', inDlg: false }
  const d = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + ((e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 30)) + '"'
  const r = e.getBoundingClientRect()
  return { d, id: e.id, inDlg: !!e.closest('#dlgModal'), chip: !!e.closest('#side .c-students'), box: [Math.round(r.x), Math.round(r.y)] }
})

const c0 = await courseName()
await menuItem(page, 'course', 'renCourse')
const q1 = await dlgText(page)
L.note('N.1 ✎ Rename course opens the question box', JSON.stringify(q1) + ' · course ' + c0)
await shot(page, 'lo-N-1-first-question')
/* Tab through: where does the focus go? */
const seq = []
let firstOut = null, outside = null
for (let i = 0; i < 80; i++) {
  await page.keyboard.press('Tab'); await sleep(60)
  const f = await focused(); seq.push(f.d + (f.inDlg ? ' [in box]' : ''))
  if (!f.inDlg && !firstOut) firstOut = { ...f, at: i + 1 }
  /* a control whose Enter opens a QUESTION: the Students card's + Add */
  if (!f.inDlg && f.id === 'addStu') { outside = { ...f, at: i + 1, opener: true }; break }
}
L.note('N.2 Tab order from the open question (until + Add)', seq.join(' → '))
L.ok('N.3 Tab stays inside the open question box', !firstOut, firstOut ? `press ${firstOut.at}: focus left the box to ${firstOut.d}; + Add reached at press ${outside ? outside.at : 'never'}` : 'focus never left the box')
await shot(page, 'lo-N-2-focus-behind-shade')
if (outside && outside.opener) {
  await page.keyboard.press('Enter'); await sleep(500)
  const q2 = await dlgText(page)
  const boxes = await page.locator('#dlgModal').count()
  L.note('N.4 Enter on ' + outside.d, 'the question box now reads ' + JSON.stringify(q2) + ` · question boxes on screen: ${boxes}`)
  L.ok('N.5 no second question opens over the first', q2 === q1, `first ${JSON.stringify(q1)} → now ${JSON.stringify(q2)}`)
  await shot(page, 'lo-N-3-second-question')
  /* answer the second: Cancel */
  /* the Cancel button itself, by its id — a text match on "No…" also matches a roster name such as "Nomad" */
  await page.click('#dlgCancel'); await sleep(400)
  const q3 = await dlgText(page)
  L.note('N.6 after Cancel on the second question: a question box on screen?', JSON.stringify(q3) + ' · course ' + await courseName())
  await shot(page, 'lo-N-4-after-cancel-second')
  /* is the first question's job done, lost, or waiting? try the rename again */
  await menuItem(page, 'course', 'renCourse')
  const q4 = await dlgText(page)
  if (q4 != null) {
    await page.fill('#dlgInput', 'LO RENAMED'); await page.click('#dlgOk'); await sleep(500)
  }
  L.note('N.7 ✎ Rename course pressed again afterwards', `question ${JSON.stringify(q4)} → course now "${await courseName()}"`)
  await shot(page, 'lo-N-5-rename-again')
}

save('lo-H-dialogs', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
