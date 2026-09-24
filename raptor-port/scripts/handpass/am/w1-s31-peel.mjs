/* w1 · S31 (Fable, the 11 Sep "BUG 1" check) + Astra rank 18 + Astra rank 35 + S32 (Fable) — TUESDAY of the
   everything week (issued Original, clean).
     build   note → AL1; then (rank 35a) edit the AL1 note and put it back → its SOLID AL1 tint returns (AM20);
             then note + take-off → AL2.
     r35b    after AL2, put the note back to AL1's value → it differs from the issued AL2 → dotted, "1 pending" (AM20).
     S31     Unpublish → AL1 current (AL2's changes back to pending); Unpublish → ORIG; [S32: put the working copy
             back to the Original exactly → nothing to publish, no Publish button anywhere (AM15)]; Unpublish → DRAFT.
             At every step: the tag, the ⓘ list, the plans menu and the view page name the SAME current version
             (never a tag the ⓘ list lacks); the Unpublish button names the version it would pull; dotted cells = count.
     r18     the Original, looked at after every step, never changes and carries no amendment marks (AM4/AM8).
   Usage: node w1-s31-peel.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishAL, unpublish, editText, planMenuItems, planMenuLook, viewHead, book,
  STATE, WIDTHS, widthArg, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel, headLine, headN, markSummary, cellValue, shotUnion } = L
const DI = 1, TO = 'ff:1.0.0.to', NOTE = 'dn:1.0', DAY = `#eWeek .day[data-day="${DI}"]`

for (const w of widthArg()) {
  const C = checker('S31 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  const note0 = await cellValue(page, NOTE), to0 = await cellValue(page, TO)
  /** look at the Original through the plans menu; return its text and any amendment marks on it */
  const lookOrig = async () => {
    const menu = await planMenuItems(page, DI)
    if (!menu.some(x => /^Original/.test(x.text) && x.does.startsWith('look:'))) { await page.keyboard.press('Escape'); await page.mouse.click(3, 300); return { none: true, menu: menu.map(x => x.text) } }
    await planMenuLook(page, /^Original/)
    const r = await page.evaluate(s => { const d = document.querySelector(s); const b = d.querySelector('.day-body')
      return { bar: (d.querySelector('.dprev-bar') || {}).innerText?.replace(/\s+/g, ' ') || '', text: (b ? b.innerText : '').replace(/\s+/g, ' ').trim(),
        marks: d.querySelectorAll('.day-body [data-alc], .day-body [data-alp]').length } }, DAY)
    const back = page.locator(`#eWeek [data-golive="${DI}"]:visible`).first(); if (await back.count()) { await back.click(); await page.waitForTimeout(500) }
    return r
  }
  /** the version the day claims to be, as every place names it */
  const where = async (step) => {
    const h = await headN(page, DI), m = await markSummary(page, DAY)
    const i = await dayInfo(page, DI); await closeDayInfo(page)
    const menu = await planMenuItems(page, DI); await page.keyboard.press('Escape'); await page.mouse.click(3, 300); await page.waitForTimeout(250)
    const issuedInMenu = menu.filter(x => x.does.startsWith('look:')).map(x => x.text.split(/\s|read-only/)[0])
    const v = await viewHead(page, DI); await editWeek(page)
    const out = { step, tag: h.tag, pend: h.pending, info: i.als.map(a => a.split(' ')[0]), infoNone: !!i.none, infoPend: i.pend, menu: issuedInMenu,
      view: v.picker, unpubTitle: h.unpub?.title || '(no Unpublish)', dotted: m.dotted, solid: m.solid, beak: h.beak?.text || '' }
    C.log(step, out)
    return out
  }
  const O0 = await lookOrig()
  C.log('the Original, first look', { marks: O0.marks, len: O0.text.length })
  C.check('r18.0', O0.marks === 0, 'the Original carries no amendment marks — AM8', O0.marks)
  // ---- build AL1 ----
  await editText(page, NOTE, 'TUE NOTE — AL1')
  await signDay(page, DI); C.log('publish AL1', { ...(await publishAL(page, DI)), toasts: await toasts(page) })
  const O1 = await lookOrig()
  C.check('r18.1', O1.text === O0.text && O1.marks === 0, 'after AL1 the Original is unchanged, no marks — AM4', { same: O1.text === O0.text, marks: O1.marks })
  // ---- rank 35a: edit the AL1 note and put it back BEFORE any AL2 ----
  await editText(page, NOTE, 'TUE NOTE — AL2')
  const m35a1 = await markSummary(page, DAY)
  await editText(page, NOTE, 'TUE NOTE — AL1')
  const m35a2 = await markSummary(page, DAY), h35a2 = await headN(page, DI)
  C.log('r35a', { edited: m35a1, putBack: m35a2, pend: h35a2.pending })
  C.check('r35.a1', m35a1.dotted.some(s => s.startsWith(NOTE) && s.endsWith('@AL2')), 'editing the AL1 note shows it DOTTED in AL2\'s colour — AM19', m35a1)
  C.check('r35.a2', m35a2.solid.some(s => s.startsWith(NOTE) && s.endsWith('@AL1')) && !m35a2.dotted.length && !h35a2.pending, 'putting it back to AL1\'s value brings the SOLID AL1 tint back, nothing pending — AM20 (Astra 35)', { marks: m35a2, pend: h35a2.pending })
  // ---- build AL2 ----
  await editText(page, NOTE, 'TUE NOTE — AL2')
  await editText(page, TO, '08:55')
  await signDay(page, DI); C.log('publish AL2', { ...(await publishAL(page, DI)), toasts: await toasts(page) })
  const S2 = await where('at AL2')
  C.check('S31.0', S2.tag === 'AL2' && S2.info.join() === 'AL1,AL2' && S2.menu.join() === 'Original,AL1,AL2' && /AL2/.test(S2.view.join()), 'at AL2: tag AL2; ⓘ lists AL1, AL2; the menu offers Original, AL1, AL2; the view page is "AL2 — as issued"', S2)
  C.check('S31.0b', /pull AL2 back/.test(S2.unpubTitle), 'the Unpublish button names AL2 — AM34', S2.unpubTitle)
  await shotUnion(page, `s31-${w}-1-at-al2`, [`${DAY} .day-head`, `${DAY} .signoff`])
  const O2 = await lookOrig()
  C.check('r18.2', O2.text === O0.text && O2.marks === 0, 'after AL2 the Original is unchanged, no marks — AM4', { same: O2.text === O0.text, marks: O2.marks })
  // ---- rank 35b: after AL2, the note back to AL1's value ----
  await editText(page, NOTE, 'TUE NOTE — AL1')
  const m35b = await markSummary(page, DAY), h35b = await headN(page, DI)
  C.log('r35b', { marks: m35b, pend: h35b.pending })
  C.check('r35.b', m35b.dotted.some(s => s.startsWith(NOTE) && s.endsWith('@AL3')) && h35b.pending === '1 pending', 'after AL2, the note back at AL1\'s value differs from the ISSUED AL2 → dotted AL3, "1 pending" (the AL1 tint does NOT return — that would hide a real change) — AM20', { marks: m35b, pend: h35b.pending })
  // ---- S31: peel AL2 ----
  const u1 = await unpublish(page, DI); C.log('unpublish #1', { ...u1, toasts: await toasts(page) })
  const S3 = await where('after unpublish #1 (AL2 off)')
  C.check('S31.1', S3.tag === 'AL1' && S3.info.join() === 'AL1' && S3.menu.join() === 'Original,AL1' && /AL1/.test(S3.view.join()), 'AL2 off: tag AL1; ⓘ lists AL1 only; the menu no longer offers AL2; the view page is "AL1 — as issued" — AM37c/AM34 (BUG 1)', S3)
  C.check('S31.1b', /pull AL1 back/.test(S3.unpubTitle), 'the Unpublish button now names AL1 — AM34', S3.unpubTitle)
  C.check('S31.1c', S3.pend === '1 pending' && S3.dotted.length === 1 && S3.dotted[0].startsWith(TO), 'working copy vs AL1: only the take-off differs → "1 pending", ONE dotted cell (the take-off); the note is back at AL1\'s value — AM20/AM23', { pend: S3.pend, dotted: S3.dotted, solid: S3.solid })
  C.check('S31.1d', S3.solid.some(s => s.startsWith(NOTE) && s.endsWith('@AL1')), 'the note wears its SOLID AL1 mark again (AL1 is current and issued it) — AM19', S3.solid)
  await shotUnion(page, `s31-${w}-2-after-unpub-1`, [`${DAY} .day-head`, `${DAY} .signoff`])
  const O3 = await lookOrig()
  C.check('r18.3', O3.text === O0.text && O3.marks === 0, 'after peeling AL2 the Original is unchanged — AM4', { same: O3.text === O0.text, marks: O3.marks })
  // ---- S31: peel AL1 ----
  const u2 = await unpublish(page, DI); C.log('unpublish #2', { ...u2, toasts: await toasts(page) })
  const S4 = await where('after unpublish #2 (AL1 off)')
  C.check('S31.2', S4.tag === 'ORIG' && S4.info.length === 0 && S4.infoNone && S4.menu.join() === 'Original' && /Original/.test(S4.view.join()), 'AL1 off: tag ORIG; ⓘ "No amendment has touched this day yet"; the menu offers only the Original; the view page is "Original — as issued" — AM37c (BUG 1)', S4)
  C.check('S31.2b', /pull Original back/.test(S4.unpubTitle), 'the Unpublish button now names the Original — AM34', S4.unpubTitle)
  C.check('S31.2c', S4.pend === '2 pending' && S4.dotted.length === 2, 'working copy vs the Original: the note and the take-off → "2 pending", two dotted cells — AM20/AM23', { pend: S4.pend, dotted: S4.dotted })
  const O4 = await lookOrig()
  C.check('r18.4', O4.text === O0.text && O4.marks === 0, 'after peeling AL1 the Original is unchanged — AM4', { same: O4.text === O0.text, marks: O4.marks })
  // ---- S32: put the working copy back to the Original exactly ----
  await editText(page, NOTE, note0)
  await editText(page, TO, to0)
  const h32 = await headN(page, DI), m32 = await markSummary(page, DAY)
  C.log('S32 back to the Original', { head: await headLine(page, DI), marks: m32, correcting: (await book(page)).correcting })
  C.check('S32.a', !h32.pending && !h32.alpub && !m32.dotted.length, 'the correction nets to nothing: no count, no Publish button, no dotted cell — AM15/AM20', { pend: h32.pending, alpub: h32.alpub, dotted: m32.dotted })
  await toasts(page)
  await signDay(page, DI)
  const t32 = await toasts(page), h32b = await headN(page, DI)
  C.check('S32.b', h32b.signState === 'Published at Original — no changes to publish' && !h32b.alpub && t32.some(t => /All signed — no changes to publish right now/.test(t)), 'signed: "Published at Original — no changes to publish", the "All signed" note, still no Publish button — AM15/AM15b', { line: h32b.signState, toasts: t32 })
  await board(page, DI)
  const b32 = await headN(page, DI)
  C.check('S32.c', !b32.alpub, 'no Publish button on the board either — AM15', b32)
  await closeBoard(page)
  if (w === 'desktop') C.check('S32.d', !(await panel(page)).days.some(d => /^Tue/.test(d.text)), 'the Amendments panel offers nothing for Tuesday — AM15/AM25')
  await shotUnion(page, `s32-${w}-nets-to-nothing`, [`${DAY} .day-head`, `${DAY} .signoff`])
  // ---- S31: peel the Original ----
  await editWeek(page)
  const u3 = await unpublish(page, DI); C.log('unpublish #3', { ...u3, toasts: await toasts(page) })
  const S5 = await where('after unpublish #3 (Original off)')
  C.check('S31.3', S5.tag === 'DRAFT' && S5.beak === 'Publish day' && S5.unpubTitle === '(no Unpublish)' && S5.menu.length === 0 && S5.infoNone, 'the Original off: dashed DRAFT, "Publish day", no Unpublish, the menu offers no issued version, ⓘ lists none — AM37c', S5)
  C.note('S31.3v', 'the view page after the day went back to a draft', S5.view)
  await shotUnion(page, `s31-${w}-3-draft`, [`${DAY} .day-head`, `${DAY} .signoff`])
  const O5 = await lookOrig()
  C.note('r18.5', 'with the Original off, the menu offers no Original to look at (it lives in the retired log only)', O5.none ? O5.menu : O5)
  C.check('S31.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
