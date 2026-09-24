/* w1 — what is actually PAINTED on an emptied cockpit seat of a published day (the attribute alone is not a
   mark a person can see). Everything week, SATURDAY: right-click COBRA's rear seat empty on the week, measure the
   seat's outline / border / badge; sign + Publish AL1; measure again. Pictures of both. No writes through window. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, publishAL, STATE, WIDTHS, widthArg, shotBox, toastSpy, toasts } = L
const KEY = '5.0.1.0.w'
const paint = (page) => page.evaluate(k => {
  const e = [...document.querySelectorAll(`#eWeek [data-slot="${k}"]`)].find(x => x.offsetWidth || x.offsetHeight)
  if (!e) return 'no seat'
  const c = getComputedStyle(e), a = getComputedStyle(e, '::after')
  return { attrs: { alp: e.getAttribute('data-alp'), aln: e.getAttribute('data-aln'), alc: e.getAttribute('data-alc') }, text: e.innerText,
    outline: `${c.outlineStyle} ${c.outlineColor}`, border: `${c.borderTopStyle} ${c.borderTopColor}`, after: a.content, afterBg: a.backgroundColor, deco: `${c.textDecorationLine} ${c.textDecorationColor}` }
}, KEY)
for (const w of widthArg()) {
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  console.log(w, 'before', JSON.stringify(await paint(page)))
  const s = page.locator(`#eWeek .seat[data-slot="${KEY}"]:visible`).first()
  await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click({ button: 'right' }); await page.waitForTimeout(600)
  console.log(w, 'emptied (pending)', JSON.stringify(await paint(page)), await toasts(page))
  await shotBox(page, `es-${w}-1-week-emptied-pending`, `#eWeek [data-slot="${KEY}"]`, '.go')
  await signDay(page, 5); await publishAL(page, 5); await toasts(page)
  console.log(w, 'after AL1', JSON.stringify(await paint(page)))
  await shotBox(page, `es-${w}-2-week-emptied-AL1`, `#eWeek [data-slot="${KEY}"]`, '.go')
  console.log('errors', errors)
  await browser.close()
}
