/* [HUMAN-RETEST] Tracker — walker w2, walk 9: every pop-up a tap opens closes
   on a press OUTSIDE it (R114, owner 4 Sep 26) and on Escape (R95), desktop,
   admin (the Export window is the admin's).

   For each: open it by its own control → press a point clearly outside its box
   (what that press lands on is recorded) → reopen → Escape. Then the question
   box sitting on the ball editor: Escape answers "no" and closes only the
   question; and what a press OUTSIDE a question box does. */
import { open, shot, save, log, dlg, DESK } from './trk-lib.mjs'
import { sleep, tapBall, lullChips, wedges } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const vis = sel => page.locator(sel).first().isVisible().catch(() => false)
/* a point outside the pop-up's box, on the left of the chart (or the right, if the box is there) */
async function outsidePoint(sel) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel); const r = el ? el.getBoundingClientRect() : { left: 9999, right: -1, top: 9999, bottom: -1 }
    const cands = [[60, 470], [innerWidth - 60, 470], [60, innerHeight - 60], [innerWidth / 2, innerHeight - 30]]
    for (const [x, y] of cands) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) continue
      const hit = document.elementFromPoint(x, y)
      return { x, y, hit: hit ? (hit.id ? '#' + hit.id : hit.tagName.toLowerCase() + '.' + String(hit.className && hit.className.baseVal !== undefined ? hit.className.baseVal : hit.className).split(' ')[0]) : null }
    }
    return null
  }, sel)
}
async function check(name, openIt, sel, pic) {
  await openIt(); const up = await vis(sel)
  const p = await outsidePoint(sel)
  if (pic) await shot(page, pic)
  await page.mouse.click(p.x, p.y); await sleep(400)
  const closedOut = !(await vis(sel))
  if (!closedOut) { await page.keyboard.press('Escape'); await sleep(300) }
  await openIt(); const up2 = await vis(sel)
  await page.keyboard.press('Escape'); await sleep(400)
  const closedEsc = !(await vis(sel))
  if (!closedEsc) { await page.mouse.click(p.x, p.y); await sleep(300) }
  L.ok(`${name}: a press OUTSIDE closes it`, up && closedOut, `opened ${up}; pressed (${Math.round(p.x)},${Math.round(p.y)}) on ${p.hit}; ${closedOut ? 'closed' : 'STILL OPEN'}`)
  L.ok(`${name}: Escape closes it`, up2 && closedEsc, `opened ${up2}; Escape → ${closedEsc ? 'closed' : 'STILL OPEN'}`)
}

/* 1. the lull calendar — and no half-saved period */
const lulls0 = (await lullChips(page)).length
await check('1 lull calendar', async () => { await page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await page.click('#setLullBtn'); await sleep(300); const d = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')][8].dataset.iso); await page.locator(`#lullCal .day[data-iso="${d}"]`).click(); await sleep(200) }, '#lullCal', 'w2-11-lull-half-picked')
L.ok('1 lull calendar: nothing half-saved by either', (await lullChips(page)).length === lulls0, JSON.stringify(await lullChips(page)))
/* 2. Copy to… */
await check('2 Copy to…', async () => { await page.locator('#copyLullBtn').scrollIntoViewIfNeeded(); await page.click('#copyLullBtn'); await sleep(300) }, '#lullCopy', 'w2-11-copyto-open')
/* 3. the failures list */
await check('3 failures list', async () => { await page.locator('#failTitle').scrollIntoViewIfNeeded(); await page.click('#failTitle'); await sleep(300) }, '#failLog', null)
/* 4. Show All */
await check('4 Show All', async () => { await page.click('#showAllBtn'); await sleep(350) }, '#showAllPanel', 'w2-11-showall-open')
/* 5. the Export window (admin) */
await check('5 Export window', async () => { await page.click('#fileMenuBtn'); await page.waitForSelector('#exportBtn', { state: 'visible' }); await page.click('#exportBtn'); await sleep(350) }, '#copyModal', 'w2-11-export-open')
/* 6. the details editor */
await check('6 details editor', async () => { await tapBall(page, 'ACG-04'); await page.click('#popEditInfo'); await sleep(350) }, '#infoModal', 'w2-11-details-open')
/* 7. the reorder lists (crew, syllabus, course) */
await check('7a reorder list (crew)', async () => { await page.locator('#ordCrew').scrollIntoViewIfNeeded(); await page.click('#ordCrew'); await sleep(350) }, '#ordModal', 'w2-11-reorder-open')
await check('7b reorder list (syllabus)', async () => { await page.click('#sylMenuBtn'); await page.waitForSelector('#ordSyl', { state: 'visible' }); await page.click('#ordSyl'); await sleep(350) }, '#ordModal', null)
await check('7c reorder list (course)', async () => { await page.click('#courseMenuBtn'); await page.waitForSelector('#ordCourse', { state: 'visible' }); await page.click('#ordCourse'); await sleep(350) }, '#ordModal', null)

/* 8–10 (the ball editor and the question boxes) are in trk-w2-09d-editor-question.mjs */

save('w2-09-outside', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
