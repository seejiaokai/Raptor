/* w1 · Astra rank 39 — Monday's amendment state against NEXT week's Monday, at both widths.
   Everything week: Monday 13 Jul is at AL1 with one change waiting; look at its Original (a preview), then go
   to the week of 20 Jul through the app's calendar, then come back.
   RIGHT behaviour: AM51f anything that marks a day's divergence is anchored on the calendar DATE, never the
   weekday name; AM1/AM3 each day's versions are its own. So Monday 20 Jul shows none of 13 Jul's state (no tag,
   no count, no marks, no preview, no issued versions in its menu or ⓘ); a preview is dropped on a week change;
   and 13 Jul comes back exactly as it was.
   Usage: node w1-r39-nextmonday.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, planMenuItems, planMenuLook, go, STATE, WIDTHS, widthArg, checker, toastSpy,
  dayInfo, closeDayInfo, headLine, headN, markSummary, shotUnion } = L
const DAY0 = '#eWeek .day[data-day="0"]'

for (const w of widthArg()) {
  const C = checker('R39 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  const toWeek = async (iso) => {
    const cal = page.locator('.wk-cal:visible, .filt-cal:visible').first(); await cal.click(); await page.waitForTimeout(500)
    let d = page.locator(`[data-wcal="${iso}"]:visible`).first()
    for (let i = 0; i < 3 && !(await d.count()); i++) { await page.locator('#weekCal .rc-nav[aria-label="Next month"]:visible').first().click(); await page.waitForTimeout(250); d = page.locator(`[data-wcal="${iso}"]:visible`).first() }
    await d.click(); await page.waitForTimeout(1200)
    await editWeek(page)
    return page.evaluate(() => window.CURWEEK)
  }
  const h13 = await headN(page, 0), m13 = await markSummary(page, DAY0)
  C.log('13 Jul Monday', { head: await headLine(page, 0), marks: m13, dt: await page.evaluate(() => window.DAYS[0].dt) })
  await planMenuItems(page, 0); await planMenuLook(page, /^Original/)
  C.log('looking at 13 Jul Original', await page.evaluate(s => (document.querySelector(`${s} .dprev-bar`) || {}).innerText?.replace(/\s+/g, ' ').slice(0, 60), DAY0))
  const wk = await toWeek('2026-07-20')
  const dt = await page.evaluate(() => window.DAYS[0].dt)
  const h20 = await headN(page, 0), m20 = await markSummary(page, DAY0)
  const bar20 = await page.evaluate(s => !!document.querySelector(`${s} .dprev-bar`), DAY0)
  const i20 = await dayInfo(page, 0); await closeDayInfo(page)
  const menu20 = await planMenuItems(page, 0); await page.keyboard.press('Escape'); await page.mouse.click(3, 300); await page.waitForTimeout(250)
  C.log('next week Monday', { week: wk, dt, head: await headLine(page, 0), marks: m20, previewBar: bar20, info: i20, menu: menu20.map(x => x.text) })
  C.check('r39.a', /Jul 20/.test(dt), 'the calendar took the app to the week of 20 Jul (Monday reads Jul 20)', dt)
  C.check('r39.b', h20.tag !== 'AL1' && !h20.pending && !h20.nys && !m20.dotted.length && !m20.solid.length, 'Monday 20 Jul carries NONE of 13 Jul\'s state: no AL1 tag, no count, no "Not yet signed", no marks — AM51f/AM1 (Astra 39)', { tag: h20.tag, pend: h20.pending, nys: h20.nys, marks: m20 })
  C.check('r39.c', !bar20, 'the preview of 13 Jul\'s Original did not follow onto 20 Jul — AM51f', bar20)
  C.check('r39.d', !i20.als.length && !menu20.some(x => x.does.startsWith('look:')), 'its ⓘ lists no AL and its menu offers no issued version — AM3 (Astra 39)', { info: i20.als, menu: menu20.map(x => x.text) })
  await shotUnion(page, `r39-${w}-1-next-monday`, [`${DAY0} .day-head`, `${DAY0} .signoff`])
  await board(page, 0)
  const b20 = await headN(page, 0)
  C.check('r39.e', b20.tag !== 'AL1' && !b20.pending, 'the board for Monday 20 Jul: no AL1 tag, no count (Astra 39)', b20)
  await closeBoard(page)
  await go(page, 'viewsched')
  const v20 = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"]'); return { head: d.querySelector('.day-head').innerText.replace(/\s+/g, ' '), cls: d.className } })
  C.log('view page, Monday 20 Jul', v20)
  C.check('r39.f', !/AL1|pending/.test(v20.head), 'the view page\'s Monday 20 Jul names no AL1 and no pending (Astra 39)', v20)
  await editWeek(page)
  await toWeek('2026-07-13')
  const hBack = await headN(page, 0), mBack = await markSummary(page, DAY0)
  const barBack = await page.evaluate(s => !!document.querySelector(`${s} .dprev-bar`), DAY0)
  C.log('back to 13 Jul', { head: await headLine(page, 0), marks: mBack, previewBar: barBack })
  C.check('r39.g', hBack.tag === h13.tag && hBack.pending === h13.pending && JSON.stringify(mBack) === JSON.stringify(m13), 'back on 13 Jul, Monday is exactly as it was (AL1, "1 pending", the same marks) — Astra 39', { before: [h13.tag, h13.pending, m13], after: [hBack.tag, hBack.pending, mBack] })
  C.check('r39.h', !barBack, 'the preview opened before the week change is gone (a week change resets it)', barBack)
  await shotUnion(page, `r39-${w}-2-back-to-13`, [`${DAY0} .day-head`, `${DAY0} .signoff`])
  C.check('r39.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
