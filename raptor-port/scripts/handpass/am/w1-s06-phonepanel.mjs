/* w1 · S6 (Fable) — the Amendments panel on a phone. Phone only (390×844).
   Everything week + Tuesday brought to AL1 with a further change, so three published days have changes waiting
   (Mon, Tue, Sun) and two ALs are issued (Mon AL1, Tue AL1).
   What the register says: AM25 describes the panel (each day with changes, its own Publish ALn, every issued AL
   with its day and who approved it) — it names no width. No ruling either way on the phone (Fable Q3). This walk
   RECORDS what a phone offers instead: is the panel there, what summary and approver the phone can reach.
   Usage: node w1-s06-phonepanel.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, publishAL, editText, STATE, WIDTHS, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel, headLine, shot, shotBox } = L
const C = checker('S6 phone')
const { browser, page, errors } = await open({ ...WIDTHS.phone, state: STATE })
await toastSpy(page)
await editWeek(page)
await editText(page, 'dn:1.0', 'TUE NOTE — AL1'); await signDay(page, 1); C.log('Tue AL1', { ...(await publishAL(page, 1)), toasts: await toasts(page) })
await editText(page, 'dn:1.0', 'TUE NOTE — AL2 WAITING')
for (const di of [0, 1, 6]) C.log(`head d${di}`, await headLine(page, di))
const P = await panel(page)
C.log('panel element', P)
C.note('S6.a', 'the Amendments panel at 390px', P.present ? (P.visible ? 'VISIBLE' : 'in the page but HIDDEN (display:none)') : 'not in the page')
// walk the whole edit page top to bottom looking for the summary or an approver anywhere a person could see it
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
await shot(page, 's6-phone-1-edit-page-top')
const seen = await page.evaluate(() => {
  const vis = e => { const s = getComputedStyle(e); return !!(e.offsetWidth || e.offsetHeight) && s.visibility !== 'hidden' }
  const hits = []
  for (const e of document.querySelectorAll('body *')) {
    if (!vis(e) || e.children.length) continue
    const t = (e.innerText || '').trim()
    if (/days? with changes to publish|appr\b|approved by/i.test(t)) hits.push(t.slice(0, 80))
  }
  return hits
})
C.log('anything on the phone page naming the summary or an approver', seen)
C.note('S6.b', 'on the phone edit page, text naming "days with changes to publish" or who approved an AL', seen.length ? seen : 'NONE')
const iMon = await dayInfo(page, 0)
C.log('ⓘ Monday', iMon)
C.note('S6.c', 'the ⓘ panel lists the issued ALs — with or without who approved them?', iMon.als)
await shotBox(page, 's6-phone-2-dayinfo-mon', '#dayPop .airpop-head', '#dayPop > div')
await closeDayInfo(page)
C.note('S6.d', 'the only publish doors on the phone are each day\'s own head button (Mon "Publish AL2", Tue "Publish AL2", Sun "Publish AL1") — no single place lists every day with changes waiting', 'see the heads above')
C.check('S6.z', !errors.length, 'no console errors', errors)
C.summary()
await browser.close()
