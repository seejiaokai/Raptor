/* A mouse drag that starts on a chip in the Info half still scrolls the half (the clean-up made the chips buttons and
   marked them drag-through — trk-ur round, 2 Nov 26). Desktop Chromium; and the keyboard: Tab reaches a chip, Enter presses it. */
import { open, toTracker, shot, check, finish, log } from './trk-ur-lib.mjs'
console.log('trk-ur-drag v1')
const { browser, page, errors } = await open({ who: 'a' })
await toTracker(page)
/* make the half short so it scrolls: the panel zoom + */
for (let i = 0; i < 4; i++) { await page.click('#szIn'); await page.waitForTimeout(150) }
const scroller = await page.evaluate(() => { let e = document.querySelector('#side .evchip'); while (e && !(e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e ? (e.id || e.className) : null })
log('scroller:', scroller)
for (const [label, sel] of [['next-event chip', '#side .evchip'], ['students pencil', '.c-students .ren'], ['Failures title', '#failTitle']]) {
  const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded()
  const bb = await el.boundingBox()
  const st0 = await page.evaluate(() => { let e = document.querySelector('#side .evchip'); while (e && !(e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e ? e.scrollTop : null })
  const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2
  await page.mouse.move(x, y); await page.mouse.down()
  for (let i = 1; i <= 10; i++) { await page.mouse.move(x, y - 12 * i); await page.waitForTimeout(16) }
  await page.mouse.up(); await page.waitForTimeout(400)
  const st1 = await page.evaluate(() => { let e = document.querySelector('#side .evchip'); while (e && !(e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e ? e.scrollTop : null })
  const opened = await page.evaluate(() => !!document.querySelector('#dlgModal, #failLog, #pop'))
  await shot(page, 'drag-' + label.replace(/ /g, '-'))
  check('drag-' + label.replace(/ /g, '-'), st1 !== st0 && !opened, `half scrolled ${st0} → ${st1}; something opened by the drag=${opened}`)
  if (opened) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  await page.evaluate(() => { let e = document.querySelector('#side .evchip'); while (e && !(e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY))) e = e.parentElement; if (e) e.scrollTop = 0 })
}
/* keyboard: Tab to the Failures title, Enter opens the full list */
await page.locator('#failTitle').focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(400)
await shot(page, 'kbd-failtitle-enter')
check('kbd-failtitle', await page.locator('#failLog').isVisible().catch(() => false), 'Enter on the Failures title opens the full list')
await page.keyboard.press('Escape')
finish(errors); await browser.close()
