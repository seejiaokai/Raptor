/* J7 — file an input or a medical (Inputs, everyone; a member files for himself only). The form, the list, the
   day it lands on, a medical and the Medical view; then the other ways in — the Calendar view, and the board's
   "+ Inputs" (admin). */
import { go } from '../lib.mjs'

const MC = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#fff"/>' +
  '<text x="50" y="90" font-size="34" font-family="Arial">MEDICAL CERTIFICATE</text>' +
  '<text x="50" y="170" font-size="22" font-family="Arial">Ranger — unfit for flying duty</text>' +
  '<text x="50" y="210" font-size="22" font-family="Arial">13 Jul 26 to 15 Jul 26</text></svg>')

/* The Inputs page is shot 900 wide: at 1440 its form spreads into a strip too thin to read on a slide. */
const NARROW = { viewport: { width: 900, height: 800 } }

export default async function ({ fresh, shot, span }) {
  let page = await fresh('us', NARROW)
  await go(page, 'inputs')
  const F = { x: 0, y: 105, w: 740, h: 555 }
  await page.click('#inCal [data-cal="2026-07-15"]')
  await page.selectOption('#inType', 'Appointment')
  await page.fill('#inStartT', '10:00'); await page.fill('#inEndT', '12:00')
  await page.fill('#inRemarks', 'Dental appt')
  await shot(page, 'inputs-1', F, [
    { n: 1, sel: '#inCal [data-cal="2026-07-15"]' }, { n: 2, sel: '#inType' }, { n: 3, sel: '#inStartT' },
    { n: 4, sel: '#inRemarks' }, { n: 5, sel: '#inAdd', pos: 'b' },
  ])
  await page.click('#inAdd'); await page.waitForSelector('#inBody tr.innew')
  await shot(page, 'inputs-2', F, [{ see: true, sel: '#inBody tr.innew' }])
  await page.setViewportSize({ width: 1440, height: 900 })
  await go(page, 'viewsched')
  await page.click('#weekNext'); await page.waitForTimeout(500); await page.click('#weekNext'); await page.waitForTimeout(700)
  const row = page.locator('#vWeek .day[data-day="2"] .pl-row', { hasText: 'Dental appt' }).first()
  const top = await row.evaluate(e => e.getBoundingClientRect().top + scrollY)
  await page.evaluate(y => scrollTo(0, y - 300), top); await page.waitForTimeout(400)
  await shot(page, 'inputs-3', { x: 20, y: 240, w: 560, h: 420 }, [{ see: true, sel: row }])
  // a medical, with its document, then the Medical view
  await page.setViewportSize({ width: 900, height: 800 })
  await go(page, 'inputs')
  await page.click('#inCal [data-cal="2026-07-13"]'); await page.click('#inCal [data-cal="2026-07-15"]')
  await page.selectOption('#inType', 'ATT C')
  await page.setInputFiles('.inbar .docfield input[type=file]', { name: 'MC-Ranger.svg', mimeType: 'image/svg+xml', buffer: MC })
  await page.waitForSelector('.inbar .docchip')
  await page.click('#inAdd'); await page.waitForTimeout(500)
  await page.click('#inMedBtn'); await page.waitForTimeout(700)
  await shot(page, 'inputs-4', { x: 0, y: 0, w: 560, h: 420 }, [
    { see: true, sel: page.locator('#medView .medcard', { hasText: 'Ranger' }).first() },
  ])
  await page.context().close()

  // the other ways in: the Calendar view (everyone)
  page = await fresh('us', NARROW)
  await go(page, 'inputs')
  await page.click('#inCalBtn'); await page.waitForTimeout(500)
  await page.click('#icPrev'); await page.waitForTimeout(250); await page.click('#icPrev'); await page.waitForTimeout(400)
  await page.click('#inpCal [data-icday="2026-07-15"]'); await page.waitForTimeout(300)
  await page.click('#icPopAdd'); await page.waitForSelector('#inpEditPop')
  await page.selectOption('#inpEditType', 'Meeting')
  await page.fill('#inpEditRmk', 'Ops brief')
  await shot(page, 'inputs-w2', await span(page, ['#inpEditPop'], { pad: 20, vw: 900, vh: 800 }), [{ n: 1, sel: '#inpEditType' }, { n: 2, sel: '#inpEditSave' }])
  await page.context().close()

  // and from the scheduler board (admin): "+ Inputs" on the day's Ground Programme
  page = await fresh()
  await go(page, 'editsched')
  await page.click('.sb-open[data-sbday="2"]'); await page.waitForTimeout(800)
  const add = page.locator('[data-inpadd="2.g"]').first()
  await add.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  const b = await add.boundingBox()
  await shot(page, 'inputs-w3', { x: Math.max(0, Math.min(b.x - 420, 720)), y: Math.max(0, Math.min(b.y - 200, 360)), w: 720, h: 540 }, [
    { n: 1, sel: add, pos: 'b' },
  ])
  await page.context().close()
}
