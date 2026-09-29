/* J6 — read the schedule, desktop and phone (View-only Sched, everyone). The demo week has no published day, so the
   admin publishes Tuesday first and the member (Ranger) signs in on the SAME page. Then the other ways to move
   about: the day arrows, the next-week preview, and on a phone a swipe and the menu's date picker. */
export default async function ({ fresh, go, shot, switchTo, publishDay, around, PHONE }) {
  let page = await fresh()
  await publishDay(page, 1)
  await switchTo(page, 'us')
  await go(page, 'viewsched')
  await shot(page, 'read-1', { x: 0, y: 56, w: 640, h: 480 }, [
    { n: 1, sel: '#weekSeg .wk-cal' }, { n: 2, sel: '#weekSeg button[data-wk="20/07/2026"]', pos: 'b' },
    { see: true, sel: '#weekSeg button.on' },
  ])
  await page.click('#weekSeg .wk-cal'); await page.waitForSelector('#weekCal .weekcal-box')
  await shot(page, 'read-2', { x: 400, y: 215, w: 640, h: 480 }, [{ n: 3, sel: '#weekCal button[data-wcal="2026-07-15"]' }])
  await page.keyboard.press('Escape'); await page.mouse.click(1300, 120); await page.waitForTimeout(400)
  const pick = '#vWeek .day[data-day="1"] select[data-vwork="1"]'
  await page.selectOption(pick, 'working'); await page.waitForTimeout(500)
  await shot(page, 'read-3', { x: 576, y: 132, w: 560, h: 420 }, [
    { n: 4, sel: pick, pos: 'b' }, { see: true, sel: '.day[data-day="1"] .dbeak.work' },
  ])
  await page.selectOption(pick, 'issued'); await page.waitForTimeout(400)
  await page.click('#vWeek .day[data-day="1"] .daywarn'); await page.waitForTimeout(400)
  await shot(page, 'read-4', { x: 576, y: 132, w: 560, h: 420 }, [
    { n: 5, sel: '#vWeek .day[data-day="1"] .daywarn' }, { see: true, sel: '.day[data-day="1"] .dwbox.open .witem' },
  ])
  // the other ways to move about — desktop: the day arrow, the next-week preview
  await page.click('#weekNext'); await page.waitForTimeout(700)
  await shot(page, 'read-w1', { x: 800, y: 380, w: 640, h: 520 }, [{ n: 1, sel: '#weekNext', pos: 'l' }, { see: true, sel: '#hsLbl' }])
  await page.$eval('#vWeek', e => { e.scrollLeft = 2784 }); await page.waitForTimeout(900)
  const peekHead = '#vWeek .day.peek[data-peek-day="0"] > *:first-child'
  await page.$eval(peekHead, e => e.scrollIntoView({ inline: 'end', block: 'nearest' })); await page.waitForTimeout(900)
  await shot(page, 'read-w2', await around(page, peekHead, 640, 480, 0.5, 0.2), [{ n: 1, sel: peekHead }])
  await page.context().close()
  // a phone: one day fills the screen; swipe to the next; the menu's date picker
  page = await fresh('us', { viewport: PHONE, phone: true })
  await page.evaluate(() => scrollTo(0, 0))
  const PH = { x: 0, y: 0, w: 390, h: 844 }
  await shot(page, 'read-p1', PH, [{ n: 1, sel: '#viewChrome .filt-cal' }, { see: true, sel: '.day[data-day="0"] .daywarn' }])
  await page.$eval('#vWeek', e => e.scrollBy({ left: e.clientWidth })); await page.waitForTimeout(900)
  await page.evaluate(() => scrollTo(0, 0))
  await shot(page, 'read-p2', PH, [{ see: true, sel: '#vWeek select[data-vwork="1"]:visible, #vWeek .day[data-day="1"] .day-head' }])
  await page.click('#burger'); await page.waitForTimeout(500)
  await shot(page, 'read-p3', PH, [{ n: 1, sel: '#burger', pos: 'r' }, { n: 2, sel: '#drawerPickWeek' }])
  await page.context().close()
}
