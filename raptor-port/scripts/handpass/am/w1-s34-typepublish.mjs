/* w1 · S34 (Fable) — type into a time box and press "Publish AL1" WITHOUT leaving the box first.
   Everything week, TUESDAY: change the note, sign all four → "Publish AL1" unlocked. Then click into the
   flying line's take-off box, type a new time, and press "Publish AL1" straight away.
   Done twice, each in its own copy of the world: on the BOARD (a time input) and on the WEEK (a time cell).
   RIGHT behaviour: AM10 the four sign-offs sign the content they saw; AM11 a content change wipes them.
   So the press must NOT issue AL1 on the old signatures — neither with the old time (the typed value lost)
   nor with the new time (published unsigned). Acceptable: the typed time is kept as a pending change and
   the publish refuses / the button locks.
   Usage: node w1-s34-typepublish.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, editText, book, STATE, WIDTHS, widthArg, checker, toastSpy, toasts,
  headLine, headN, cellValue, shotUnion } = L
const DI = 1, TO = 'ff:1.0.0.to', NOTE = 'dn:1.0'

for (const w of widthArg()) {
  const C = checker('S34 ' + w)
  for (const surf of ['board', 'week']) {
    const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
    await toastSpy(page)
    await editWeek(page)
    const to0 = await cellValue(page, TO)
    await editText(page, NOTE, 'TUE NOTE — S34')
    if (surf === 'board') await board(page, DI)
    await signDay(page, DI)
    const h0 = await headN(page, DI)
    C.log(`${surf}: signed, ready`, h0)
    C.check(`S34.${surf}.0`, h0.alpub && !h0.alpub.disabled, `${surf}: "Publish AL1" is unlocked after signing`, h0.alpub)
    await toasts(page)
    // type into the take-off box and press Publish AL1 without leaving the box
    const box = surf === 'board' ? page.locator(`#schedBoard [data-bfld="${TO}"]:visible`).first() : page.locator(`#eWeek [data-txt="${TO}"]:visible`).first()
    await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await box.click()
    if (surf === 'board') { await box.fill(''); await box.type('09:30', { delay: 10 }) } else { await page.keyboard.press('Control+A'); await page.keyboard.type('09:30', { delay: 10 }) }
    const btn = page.locator(`${surf === 'board' ? '#schedBoard' : `#eWeek .day[data-day="${DI}"]`} [data-alpub="${DI}"]:visible`).first()
    const focusBefore = await page.evaluate(() => (document.activeElement && (document.activeElement.dataset.bfld || document.activeElement.dataset.txt)) || document.activeElement?.tagName)
    await btn.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    await btn.click({ timeout: 4000 }).catch(e => C.log('click', 'the button went away under the press: ' + String(e).split('\n')[0].slice(0, 90)))
    await page.waitForTimeout(900)
    const t = await toasts(page)
    const h1 = await headN(page, DI), bk = await book(page)
    const val = await cellValue(page, TO)
    C.log(`${surf}: after the press`, { focusBefore, toasts: t, head: await headLine(page, DI), takeoff: val, als: bk.als, cur: bk.cur[DI] })
    const published = h1.tag === 'AL1'
    C.check(`S34.${surf}.a`, val === '09:30', `${surf}: the typed time is kept (not lost) — AM40`, { takeoff: val, before: to0 })
    C.check(`S34.${surf}.b`, !published || (published && h1.pending === '1 pending'), `${surf}: AL1 did NOT go out on the pre-typing signatures carrying the new time unsigned`, { tag: h1.tag, pend: h1.pending, toasts: t })
    C.check(`S34.${surf}.c`, !published, `${surf}: nothing was published by that press (the typed change broke the sign-offs first) — AM10/AM11`, { tag: h1.tag, toasts: t })
    await shotUnion(page, `s34-${w}-${surf}-after-press`, surf === 'board' ? ['#sbSignBar'] : [`#eWeek .day[data-day="${DI}"] .day-head`, `#eWeek .day[data-day="${DI}"] .signoff`])
    if (published) {
      // if it did go out: what does the issued AL1 carry — the old or the new time?
      await closeBoard(page)
      await editWeek(page)
      C.note(`S34.${surf}.d`, 'AL1 went out — what the issued day now carries and what is left pending', { head: await headLine(page, DI), takeoff: await cellValue(page, TO) })
    }
    C.check(`S34.${surf}.z`, !errors.length, `${surf}: no console errors`, errors)
    await browser.close()
  }
  C.summary()
}
