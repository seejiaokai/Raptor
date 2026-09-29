/* J17 — what happens by itself (D415): one action, and every place it shows without anyone touching it. Ranger is
   `bane`; Monday 13 Jul is day 0. Each ripple runs in ONE page, switching users (the demo world survives a sign-out).
   Note the demo has two "todays": the schedule's 13 Jul, the real 29 Sep for the Inputs list and the Leave War. */
import { go } from '../lib.mjs'

const T = id => `[data-testid="${id}"]`
const UNAV = (w, di) => `${w} section.day[data-day="${di}"] .sec-unav .pl-row:has(.puck[data-person="bane"])`

export default async function ({ fresh, shot, switchTo, publishDay, around, span }) {
  const lwMonth = async (page, m) => { await go(page, 'leavewar'); await page.waitForSelector(T('row-bane')); await page.click(T('month-' + m)); await page.waitForTimeout(900) }
  const into = async (page, sel) => { await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(300) }

  // R1 — a member files ONE leave (LL, Mon 13 Jul)
  let page = await fresh('us', { viewport: { width: 900, height: 800 } })
  await go(page, 'inputs')
  await page.click('#inCal [data-cal="2026-07-13"]'); await page.selectOption('#inType', 'LL')
  await shot(page, 'r1-act', { x: 0, y: 105, w: 740, h: 555 }, [{ n: 1, sel: '#inCal [data-cal="2026-07-13"]' }, { n: 2, sel: '#inType' }, { n: 3, sel: '#inAdd', pos: 'b' }])
  await page.click('#inAdd'); await page.waitForTimeout(600)
  await page.setViewportSize({ width: 1440, height: 900 })
  await go(page, 'viewsched'); await into(page, UNAV('#vWeek', 0))
  await shot(page, 'r1-unav', await around(page, UNAV('#vWeek', 0), 640, 480, 0.4, 0.5), [{ see: true, sel: UNAV('#vWeek', 0) }])
  await page.evaluate(() => scrollTo(0, 0)); await page.click('#vWeek [data-daywarn="0"]'); await page.waitForTimeout(400)
  const warn = page.locator('#vWeek [data-dwbox="0"] .witem', { hasText: 'On leave' }).first()
  await shot(page, 'r1-warn', await around(page, warn, 560, 420, 0.5, 0.4), [{ see: true, sel: warn }])
  await lwMonth(page, 'JUL')
  await shot(page, 'r1-lw', await span(page, [T('person-bane'), T('cell-bane-2026-07-13')], { pad: 30 }), [{ see: true, sel: T('cell-bane-2026-07-13') }])
  await switchTo(page, 'ad', 'a')
  await go(page, 'editsched')
  const strike = '#eRoster .rpuck.no:has(.puck[data-person="bane"])'
  await shot(page, 'r1-palette', await around(page, strike, 480, 360, 0.5, 0.5), [{ see: true, sel: strike }])
  await shot(page, 'r1-chip', await span(page, ['#eWeek [data-chgday="0"]', '#histBtn'], { pad: 30 }), [{ see: true, sel: '#eWeek [data-chgday="0"]' }, { see: true, sel: '#histBtn' }])
  await page.context().close()

  // R1 on a day already published: the issued face holds; the admin sees "1 pending" and the sign-offs fall
  page = await fresh()
  await publishDay(page, 0)
  await switchTo(page, 'us'); await go(page, 'inputs')
  await page.click('#inCal [data-cal="2026-07-13"]'); await page.selectOption('#inType', 'LL'); await page.click('#inAdd'); await page.waitForTimeout(500)
  await switchTo(page, 'ad', 'a'); await go(page, 'editsched')
  await shot(page, 'r1-pending', await span(page, ['#eWeek [data-pendlist="0"]', '#eWeek [data-signbar="0"]'], { pad: 30 }), [
    { see: true, sel: '#eWeek [data-pendlist="0"]' }, { see: true, sel: '#eWeek [data-signbar="0"]' },
  ])
  await page.context().close()

  // R2 — an activity (a Meeting with times) lands on the day's Ground Programme by itself
  page = await fresh('us')
  await go(page, 'inputs')
  await page.click('#inCal [data-cal="2026-07-14"]'); await page.selectOption('#inType', 'Meeting')
  await page.fill('#inStartT', '09:00'); await page.fill('#inEndT', '10:00'); await page.fill('#inRemarks', 'Safety meeting')
  await page.click('#inAdd'); await page.waitForTimeout(500)
  await go(page, 'viewsched')
  const grnd = '#vWeek section.day[data-day="1"] .sec-grnd .pl-row:has-text("Safety meeting")'
  await into(page, grnd)
  await shot(page, 'r2-ground', await around(page, grnd, 560, 420, 0.5, 0.5), [{ see: true, sel: grnd }])
  await page.context().close()

  // R3 — a medical downchit (ATT C): the Medical tracker, the schedule, the Leave War
  page = await fresh('us')
  await go(page, 'inputs')
  await page.click('#inCal [data-cal="2026-07-13"]'); await page.selectOption('#inType', 'ATT C'); await page.fill('#inRemarks', 'Flu')
  await page.setInputFiles('.inbar .docfield input[type=file]', { name: 'mc.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>') })
  await page.waitForSelector('.inbar .docchip'); await page.click('#inAdd'); await page.waitForTimeout(500)
  await page.click('#inMedBtn'); await page.waitForTimeout(700)
  const card = page.locator('#medView .medcard', { hasText: 'Ranger' }).first()
  await shot(page, 'r3-med', { x: 0, y: 0, w: 640, h: 480 }, [{ see: true, sel: card }])
  await page.click('#medClose').catch(() => {}); await page.waitForTimeout(300)
  await lwMonth(page, 'JUL')
  await shot(page, 'r3-lw', await span(page, [T('person-bane'), T('cell-bane-2026-07-13')], { pad: 30 }), [{ see: true, sel: T('cell-bane-2026-07-13') }])
  await page.context().close()

  // R5 — an approved Leave War bid reaches Inputs at once (at Approve, not at Publish — D418)
  page = await fresh('us')
  await lwMonth(page, 'FEB')
  await page.click(T('cell-bane-2026-02-10')); await page.click(T('bid-LL')); await page.waitForTimeout(300); await page.click(T('bid-LL')); await page.waitForTimeout(500)
  await switchTo(page, 'ad', 'a')
  await lwMonth(page, 'FEB')
  await page.click(T('stage-advance')); await page.waitForTimeout(400)
  await page.click(T('cell-bane-2026-02-10')); await page.click(T('decide-approve')); await page.waitForTimeout(600)
  await shot(page, 'r5-lw', await span(page, [T('person-bane'), T('cell-bane-2026-02-10')], { pad: 30 }), [{ see: true, sel: T('cell-bane-2026-02-10') }])
  await go(page, 'inputs')
  await page.selectOption('#inFPerson', { label: 'Ranger' }).catch(() => {})
  await page.click('#inRangeBtn'); await page.click('#inRangeAll'); await page.waitForTimeout(500)
  const row = page.locator('#inBody tr', { hasText: '10 Feb' }).first()
  const rb = await row.boundingBox()
  await shot(page, 'r5-inputs', { x: 0, y: Math.round(Math.max(0, Math.min(rb.y - 250, 900 - 540))), w: 960, h: 540 }, [{ see: true, sel: row }])
  await page.context().close()

  // R6 — a callsign changed on Quals moves everywhere at once (the stored person stays the same)
  page = await fresh()
  await go(page, 'quals'); await page.click('#qEdit'); await page.waitForTimeout(300)
  const cs = page.locator('input.qcs[data-cs="bane"]').first()
  await cs.fill('Rook'); await cs.press('Tab'); await page.click('#qSave'); await page.waitForTimeout(500)
  await go(page, 'editsched')
  const rook = '#eWeek section.day[data-day="0"] .puck[data-person="bane"]'
  await shot(page, 'r6-sched', await around(page, rook, 480, 360, 0.5, 0.5), [{ see: true, sel: rook }])
  await go(page, 'leavewar'); await page.waitForSelector(T('person-bane'))
  await shot(page, 'r6-lw', await around(page, T('person-bane'), 480, 360, 0.3, 0.5), [{ see: true, sel: T('person-bane') }])
  await go(page, 'admin'); await page.fill('#accFind', 'rook'); await page.waitForTimeout(400)
  await shot(page, 'r6-admin', await around(page, '#accList [data-person="bane"]', 640, 360, 0.5, 0.3), [{ see: true, sel: '#accList [data-person="bane"]' }])
  await page.context().close()
}
