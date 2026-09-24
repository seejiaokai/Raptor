/* w1 · a finding from S15 — a "pending" chip on the VIEW page's ISSUED face. Reproduced on its own:
     world 1: TUESDAY (issued Original) — take its accepted appointment off the day (a filing change) →
              the view page's Tuesday head, as admin and then as the squadron member (log out, log in).
     world 2: TUESDAY — change only the day note → the view page's Tuesday head (the control case).
   RIGHT behaviour: AM5 viewers see the issued version, frozen; AM24 working-copy state ("Not yet signed",
   pending) never shows on the issued face; AM51e the issued face is the same for admin and member.
   Usage: node w1-v01-viewchip.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, login, editWeek, board, closeBoard, openInputs, editText, go, STATE, WIDTHS, widthArg, checker, toastSpy, toasts,
  headLine, dayInfo, closeDayInfo, shotUnion } = L
const DI = 1
const vhead = (page) => page.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`)
  return { chip: (d.querySelector('.dpend') || {}).innerText?.replace(/\s+/g, ' ') || '', nys: !!d.querySelector('.nysmark'), cls: d.className,
    head: d.querySelector('.day-head').innerText.replace(/\s+/g, ' ').trim(),
    ground: [...d.querySelectorAll('.gp-row, .grow, [class*=ground] .pl-row, .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => /APPOINTMENT/.test(t)) } }, DI)

for (const w of widthArg()) {
  const C = checker('VIEWCHIP ' + w)
  // ---- world 1: a filing change on published Tuesday ----
  {
    const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
    await toastSpy(page)
    await go(page, 'viewsched')
    const v0 = await vhead(page)
    C.log('view Tue before', v0)
    await editWeek(page)
    await board(page, DI)
    await openInputs(page, DI)
    await page.locator(`#schedBoard [data-acc="x"][data-accd="${DI}"]:visible`).first().click(); await page.waitForTimeout(700)
    C.log('appointment taken off', await toasts(page))
    await closeBoard(page)
    await editWeek(page)
    C.log('edit week head', await headLine(page, DI))
    await go(page, 'viewsched')
    const v1 = await vhead(page)
    C.log('view Tue after (admin)', v1)
    await shotUnion(page, `v01-${w}-1-view-tue-admin`, [`#vWeek .day[data-day="${DI}"] .day-head`])
    C.check('V1.a', !v1.chip && !v1.nys, 'the ISSUED face (admin) shows no pending chip and no "Not yet signed" — AM5/AM24', v1)
    const i1 = await dayInfo(page, DI); await closeDayInfo(page)
    C.log('view ⓘ (admin)', i1)
    // log out → log in as the squadron member (a written world: a reload keeps it)
    if (await page.locator('#logout:visible').count()) await page.locator('#logout:visible').first().click()
    else { await page.locator('#burger:visible').first().click(); await page.waitForTimeout(400); await page.locator('#drawerLogout:visible').first().click() }   // the phone keeps Logout in its menu
    await page.waitForTimeout(800)
    await login(page, 'm')
    await toastSpy(page)
    await go(page, 'viewsched')
    const v2 = await vhead(page)
    C.log('view Tue after (member)', v2)
    await shotUnion(page, `v01-${w}-2-view-tue-member`, [`#vWeek .day[data-day="${DI}"] .day-head`])
    C.check('V1.b', !v2.chip && !v2.nys, 'the ISSUED face (member) shows no pending chip — AM5/AM24/AM51e', v2)
    const i2 = await dayInfo(page, DI); await closeDayInfo(page)
    C.log('view ⓘ (member)', i2)
    C.note('V1.c', 'the member\'s ⓘ on the issued face', i2)
    C.check('V1.z', !errors.length, 'no console errors (world 1)', errors)
    await browser.close()
  }
  // ---- world 2: an ordinary note edit (the control) ----
  {
    const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
    await editWeek(page)
    await editText(page, 'dn:1.0', 'TUE NOTE — CONTROL EDIT')
    C.log('edit week head (note edit)', await headLine(page, DI))
    await go(page, 'viewsched')
    const v3 = await vhead(page)
    C.log('view Tue after a note edit (admin)', v3)
    C.check('V2.a', !v3.chip && !v3.nys, 'control: after an ordinary edit the ISSUED face shows no pending chip — AM5/AM24', v3)
    await shotUnion(page, `v01-${w}-3-view-tue-note-edit`, [`#vWeek .day[data-day="${DI}"] .day-head`])
    C.check('V2.z', !errors.length, 'no console errors (world 2)', errors)
    await browser.close()
  }
  C.summary()
}
