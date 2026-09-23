/* [HUMAN-RETEST] Tracker — walk 6: four smaller promises, each read off the screen.

   A. Delete a course — its question says "(marks remain in storage)". Re-create
      a course under the same name: do its students and marks come back, as
      docs/tracker/known-gaps.md says they do? (Astra #11 — course ids arrived
      13 Sep 26; a new course gets a new id.)
   B. D64: the grey hint in the "Type / format" box must read
      "e.g. Lecture, OFT/AMT, 2 x F-15" — in EVERY editor that has that box
      (the details window AND Show All's own inline editor — Astra #14).
   C. Details mode (ⓘ) on an event with no details says "tap Edit details" —
      is there an Edit details to tap there? (F4)
   D. The marking pop-up open, then a chart switch by KEYBOARD only (Tab to the
      Syllabus box, arrow key) — does the pop-up survive and grade the new chart?
      (Astra #7's remaining route; walk 4 cleared the pointer route.) */
import { open, shot, save, log, reveal, dlg, DESK } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
const wedges = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null
}, id)
async function tapBall(page, id) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(350)
}
async function courseMenu(page, item) {
  await page.click('#courseMenuBtn'); await page.waitForSelector(`#${item}`, { state: 'visible' }); await page.click(`#${item}`); await sleep(250)
}
const students = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))

const { browser, page, errors } = await open({ size: DESK, who: 'a' })

/* A. delete a course, re-create it under the same name */
await courseMenu(page, 'addCourse'); await dlg(page, { value: 'KEEP TEST' }); await sleep(900)
await page.click('#addStu'); await sleep(300)
const addQ = await dlg(page, { value: 'ALPHA' }).catch(e => ({ text: 'no dialog: ' + e.message }))
L.note('A: + Add asked', addQ.text.replace(/\s+/g, ' ').slice(0, 160))
await sleep(600)
L.note('A: students on KEEP TEST', (await students(page)).join(', '))
await tapBall(page, 'ST-01')
if (await page.locator('#pop').isVisible().catch(() => false)) { await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500) }
L.note('A: ST-01 after DCO', JSON.stringify(await wedges(page, 'ST-01')))
await courseMenu(page, 'delCourse')
const delQ = await dlg(page, { ok: true }); await sleep(800)
L.note('A: delete asked', delQ.text.replace(/\s+/g, ' '))
await courseMenu(page, 'addCourse'); await dlg(page, { value: 'KEEP TEST' }); await sleep(900)
const back = await students(page)
L.ok('A: re-creating "KEEP TEST" brings its student back, as the delete promised ("marks remain in storage")', back.includes('ALPHA'), `students now: ${JSON.stringify(back)}; ST-01 ${JSON.stringify(await wedges(page, 'ST-01'))}`)
await shot(page, '06-A-recreated-course')
L.note('A: is there any other door back to the deleted course? (course ✎ menu items)', (await (async () => { await page.click('#courseMenuBtn'); await sleep(200); const t = await page.locator('#courseMenuBtn').locator('xpath=..').innerText().catch(() => ''); await page.keyboard.press('Escape'); return t.replace(/\s+/g, ' ') })()))

/* B. the Type/format hint, in every editor that has the box */
await page.selectOption('#courseSel', { label: '26ABSG' }); await sleep(900)
L.note('B–D run on course', await page.locator('#courseSel option:checked').innerText() + ' · students ' + (await students(page)).join(', '))
await tapBall(page, 'ACG-01')
if (await page.locator('#pop').isVisible().catch(() => false)) { await page.click('#popEditInfo'); await sleep(300) }
const h1 = await page.getAttribute('#ifFmt', 'placeholder').catch(() => '(no box)')
await page.click('#ifCancel').catch(() => {}); await sleep(200)
L.ok('B: the details window\'s Type/format hint is D64\'s wording', h1 === 'e.g. Lecture, OFT/AMT, 2 x F-15', h1)
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
const editBtn = page.locator('#showAllPanel button', { hasText: /Edit/ }).first()
let h2 = '(no Edit in Show All)'
if (await editBtn.count()) {
  await editBtn.click(); await sleep(300)
  h2 = await page.evaluate(() => { const i = [...document.querySelectorAll('#showAllPanel input, #showAllPanel textarea')].find(x => /format|Lecture|OFT/i.test(x.placeholder || '')); return i ? i.placeholder : [...document.querySelectorAll('#showAllPanel input, #showAllPanel textarea')].map(x => x.placeholder).join(' | ') })
}
await shot(page, '06-B-showall-editor')
L.ok('B: Show All\'s inline editor carries the same Type/format hint (D64)', h2 === 'e.g. Lecture, OFT/AMT, 2 x F-15', h2)
await page.keyboard.press('Escape'); await sleep(200)
if (await page.locator('#showAllPanel').isVisible().catch(() => false)) await page.locator('#showAllPanel button', { hasText: /Close|×|✕/ }).first().click().catch(() => {})

/* C. Details mode on an event with no details */
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(300)
await page.locator('#arrTools button', { hasText: '+ Acad' }).click(); await sleep(300)
if (await page.locator('#dlgModal').isVisible().catch(() => false)) await dlg(page, { value: 'NODETAIL-1' })
await sleep(300)
if (await page.locator('#saveChanges').count()) { await page.click('#saveChanges'); await sleep(400) }
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(300)
await page.click('#detailsBtn'); await sleep(200)
await tapBall(page, 'NODETAIL-1')
const bub = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText.replace(/\s+/g, ' ') : '(no bubble)' })
const editHere = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b ? [...b.querySelectorAll('button, a, [role=button]')].map(x => x.innerText).join(' | ') : '' })
await shot(page, '06-C-details-no-details')
L.ok('C: where Details mode says "tap Edit details", an Edit details control is there to tap', !/tap Edit details/.test(bub) || /Edit details/.test(editHere), `bubble: "${bub}" · controls in it: "${editHere || 'none'}"`)
await page.click('#detailsBtn'); await sleep(200)

/* D. keyboard-only chart switch with the pop-up open */
await tapBall(page, 'ST-01')
const t0 = await page.locator('#popTitle').innerText().catch(() => '')
await page.focus('#sylSel')                                   // Tab would land here too; no pointer press anywhere
await page.keyboard.press('ArrowDown'); await sleep(900)
const sylNow = await page.locator('#sylSel option:checked').innerText()
const stillOpen = await page.locator('#pop').isVisible().catch(() => false)
L.note('D: after a keyboard switch to', `${sylNow} — pop-up ${stillOpen ? 'STILL OPEN: "' + (await page.locator('#popTitle').innerText().catch(() => '')) + '"' : 'closed'} (opened as "${t0}")`)
if (stillOpen) {
  const before = await wedges(page, 'ST-01')
  await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
  const after = await wedges(page, 'ST-01')
  L.ok('D: the leftover pop-up does not grade the chart it was not opened on', JSON.stringify(before) === JSON.stringify(after), `${sylNow} ST-01 ${JSON.stringify(before)} → ${JSON.stringify(after)}`)
  await shot(page, '06-D-keyboard-switch-dco')
}
save('06-misc', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
