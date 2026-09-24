/* w1 · S1 follow-up — does a RELOAD clear the phantom dotted mark (so far only an unrelated edit did)?
   Everything week (a written world, so a reload keeps it — bug-check order §7.7), TUESDAY: the S1 steps (take-off
   and note → AL1 → take-off put back → Unpublish), then reload the page and look again.
   RIGHT behaviour: AM20 — the take-off equals the Original and wears no mark, before and after a reload.
   Usage: node w1-s01b-reload.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, login, editWeek, signDay, publishAL, unpublish, editText, STATE, WIDTHS, widthArg, checker, headN, markSummary, cellValue, shotBox } = L
const DI = 1, TO = 'ff:1.0.0.to', NOTE = 'dn:1.0', DAY = `#eWeek .day[data-day="${DI}"]`
for (const w of widthArg()) {
  const C = checker('S1b ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await editWeek(page)
  const to0 = await cellValue(page, TO)
  await editText(page, TO, '09:10'); await editText(page, NOTE, 'TUE NOTE — AL1 CHANGE')
  await signDay(page, DI); await publishAL(page, DI)
  await editText(page, TO, to0)
  await unpublish(page, DI)
  const m0 = await markSummary(page, DAY), h0 = await headN(page, DI)
  C.log('before the reload', { pend: h0.pending, dotted: m0.dotted })
  await page.reload(); await page.waitForTimeout(800)
  if (await page.locator('#luser:visible').count()) await login(page, 'a')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await editWeek(page)
  const m1 = await markSummary(page, DAY), h1 = await headN(page, DI)
  C.log('after the reload', { pend: h1.pending, dotted: m1.dotted, tag: h1.tag })
  C.check('S1b.a', h1.tag === 'ORIG' && h1.pending === '1 pending', 'the reload kept the day as it was (ORIG, "1 pending") — the saved world persisted', { tag: h1.tag, pend: h1.pending })
  C.check('S1b.b', !m1.dotted.some(s => s.startsWith(TO)), 'after a reload the take-off (equal to the Original) wears no mark — AM20', m1.dotted)
  await shotBox(page, `s1b-${w}-after-reload-line`, `${DAY} [data-txt="${TO}"]`, '.go')
  C.check('S1b.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
