/* w1 · S1 (Fable) — unpublish an AL after one of its changes was put back: the phantom dotted mark.
   Everything week, TUESDAY (issued as its Original, nothing pending). Through the app's own controls:
   change a flying line's take-off AND the day note → sign → Publish AL1 → put the take-off back to
   the Original's time → Unpublish (AL1 comes off).
   RIGHT behaviour (register): AM20 a pending mark means "differs from what was issued" — so after the
   unpublish only the NOTE differs from the Original and only the note may be dotted; the head, the ⓘ
   panel and the Amendments panel all say ONE (AM23); AM37c the AL's changes go back to pending and
   the Original is current again.
   Branch B (same world): re-issue AL1 at once, while the phantom still shows — AL1 must carry one item
   and must not paint an "issued at AL1" mark on the take-off it never changed (AM19/AM33).
   Branch A (a fresh copy of the world): the same steps, then an UNRELATED edit on another day — does
   the phantom only clear then (Fable's "disprove" line)?
   Usage: node w1-s01-phantom.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishAL, unpublish, book, editText, viewHead,
  STATE, WIDTHS, widthArg, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel, headLine, headN, markSummary, cellValue,
  shotBox, shotUnion } = L
const DI = 1, TO = 'ff:1.0.0.to', NOTE = 'dn:1.0', DAY = `#eWeek .day[data-day="${DI}"]`
const HEADSEL = [`${DAY} .day-head`, `${DAY} .signoff`]

/** The shared setup: two changes → AL1 → take-off put back → Unpublish. Returns the Original's take-off. */
async function toPhantom(page, C, w, pics) {
  await editWeek(page)
  C.log('start head', await headLine(page, DI))
  const to0 = await cellValue(page, TO), note0 = await cellValue(page, NOTE)
  C.log('original values', { take_off: to0, note: note0 })
  const toNew = to0 === '09:10' ? '09:20' : '09:10'
  await editText(page, TO, toNew)
  await editText(page, NOTE, 'TUE NOTE — AL1 CHANGE')
  C.log('after 2 edits', await headLine(page, DI))
  await signDay(page, DI)
  const p1 = await publishAL(page, DI)
  C.log('publish AL1', { ...p1, toasts: await toasts(page) })
  if (pics) {
    const hAL1 = await headN(page, DI), mAL1 = await markSummary(page, DAY)
    C.check('S1.a', hAL1.tag === 'AL1', 'Publish AL1 issues AL1 (tag AL1) — AM9/AM22', hAL1.tag)
    C.check('S1.b', mAL1.solid.some(s => s.startsWith(TO)) && mAL1.solid.some(s => s.startsWith(NOTE)) && !mAL1.dotted.length,
      'both changed cells wear the SOLID AL1 mark, nothing dotted — AM19', mAL1)
  }
  await editText(page, TO, to0)
  if (pics) {
    const hRev = await headN(page, DI), mRev = await markSummary(page, DAY)
    C.log('take-off put back', await headLine(page, DI))
    C.check('S1.c', hRev.pending === '1 pending', 'the take-off now differs from AL1 → "1 pending" — AM20/AM23', hRev.pending)
    C.check('S1.d', mRev.dotted.length === 1 && mRev.dotted[0].startsWith(TO) && mRev.dotted[0].endsWith('@AL2') && mRev.solid.some(s => s.startsWith(NOTE)),
      'take-off DOTTED in AL2 colour, note still SOLID AL1 — AM19', mRev)
    await shotUnion(page, `s1-${w}-1-before-unpublish-head`, HEADSEL)
    await shotBox(page, `s1-${w}-1-before-unpublish-line`, `${DAY} [data-txt="${TO}"]`, '.go')
  }
  const u = await unpublish(page, DI)
  C.log('unpublish', { ...u, toasts: await toasts(page) })
  if (pics) C.check('S1.f', u.pressed && !u.armedFirst, 'Unpublish took ONE tap (no OIL bid against on a weekday) — AM37', u)
  return to0
}

for (const w of widthArg()) {
  const C = checker('S1 ' + w)
  // ---------------- main world: the phantom, then branch B (re-issue while it shows) ---------------
  {
    const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
    await toastSpy(page)
    const to0 = await toPhantom(page, C, w, true)
    const hU = await headN(page, DI), mU = await markSummary(page, DAY)
    C.log('after unpublish', await headLine(page, DI))
    C.log('marks after unpublish', mU)
    C.log('book pending (record only)', (await book(page)).pending.filter(k => /^[a-z]+:1\./.test(k)))
    C.check('S1.e', hU.tag === 'ORIG', 'the Original is current again (tag ORIG) — AM37c', hU.tag)
    C.check('S1.g', hU.pending === '1 pending', 'head says "1 pending" (only the note differs from the Original) — AM23', hU.pending)
    const dottedTO = mU.dotted.filter(s => s.startsWith(TO)), dottedNote = mU.dotted.filter(s => s.startsWith(NOTE))
    C.check('S1.h', dottedNote.length === 1, 'the NOTE is dotted (differs from the Original) — AM37c/AM19', mU.dotted)
    C.check('S1.i', dottedTO.length === 0, 'the TAKE-OFF wears NO mark (it is back at the Original\'s time) — AM20',
      { takeoff: await cellValue(page, TO), original: to0, dotted: mU.dotted })
    C.check('S1.j', mU.dotted.length === 1, 'the number of dotted cells equals the head count (1) — AM23', `${mU.dotted.length} dotted vs "${hU.pending}"`)
    C.check('S1.k', hU.alpub && hU.alpub.text === 'Publish AL1', 'the next publish is offered as AL1 again (same label) — AM33/AM37c', hU.alpub)
    C.check('S1.l', /^4 to sign/.test(hU.signState), 'unpublish cleared the sign-offs — AM34', hU.signState)
    await shotUnion(page, `s1-${w}-2-after-unpublish-head`, HEADSEL)
    await shotBox(page, `s1-${w}-2-after-unpublish-line`, `${DAY} [data-txt="${TO}"]`, '.go')
    await shotUnion(page, `s1-${w}-2-after-unpublish-note`, [`${DAY} .day-head`, `${DAY} [data-txt="${NOTE}"]`])
    const di1 = await dayInfo(page, DI)
    C.log('ⓘ after unpublish', di1)
    C.check('S1.m', /^1 unpublished edit$/.test((di1.pend || '').trim()), 'the ⓘ panel agrees with the head (one unpublished edit) — AM23', di1.pend || '(none)')
    await shotBox(page, `s1-${w}-3-dayinfo`, '#dayPop .airpop-head', '#dayPop > div')
    await closeDayInfo(page)
    if (w === 'desktop') {
      const P = await panel(page)
      C.log('panel', P)
      const tue = P.days.find(d => /^Tue/.test(d.text || ''))
      C.check('S1.n', tue && /^Tue · 1 change$/.test(tue.text), 'Amendments panel lists "Tue · 1 change" — AM25/AM23', tue || P.days)
    }
    await board(page, DI)
    const bm = await markSummary(page, '#schedBoard'), bh = await headN(page, DI)
    C.log('board head', await headLine(page, DI))
    C.log('board marks', bm)
    C.check('S1.o', !bm.dotted.some(s => s.startsWith(TO)), 'the board: the take-off box (drawn on both aircraft rows of the formation) wears NO mark — AM20', bm.dotted)
    C.check('S1.p', bh.pending === '1 pending', 'the board strip says "1 pending" too — AM23', bh.pending)
    await shotBox(page, `s1-${w}-4-board-line`, `#schedBoard [data-bfld="${TO}"]`, '.sb-go')
    await shotBox(page, `s1-${w}-4-board-strip`, '#sbSignBar', null)
    await closeBoard(page)
    // Branch B — re-issue AL1 straight away, the phantom still showing
    await editWeek(page)
    await signDay(page, DI)
    C.log('re-signed', await headLine(page, DI))
    const p2 = await publishAL(page, DI)
    const t2 = await toasts(page)
    C.log('re-publish AL1 (phantom still showing)', { ...p2, toasts: t2 })
    const hR = await headN(page, DI), mR = await markSummary(page, DAY)
    C.log('after re-issue', { head: await headLine(page, DI), marks: mR })
    C.check('S1.r', hR.tag === 'AL1', 'the correction re-issues under the SAME label, AL1 — AM33', hR.tag)
    C.check('S1.s', t2.some(t => /Published AL1 · 1 item /.test(t)), 'the re-issue carries ONE item (the note) — AM23', t2)
    C.check('S1.t', !mR.solid.some(s => s.startsWith(TO)) && !mR.dotted.some(s => s.startsWith(TO)),
      'the take-off wears NO "changed at AL1" mark — AL1 never changed it (AM19/AM20)', mR)
    C.check('S1.t2', hR.pending === '', 'nothing is left pending after the re-issue — AM23', hR.pending)
    await shotBox(page, `s1-${w}-5-reissued-line`, `${DAY} [data-txt="${TO}"]`, '.go')
    const di2 = await dayInfo(page, DI)
    C.log('ⓘ after re-issue', di2)
    C.check('S1.t3', di2.als.length === 1 && /AL1 1 item/.test(di2.als[0]) && !di2.pend, 'ⓘ lists AL1 · 1 item and no unpublished edit — AM23/AM35', di2)
    await closeDayInfo(page)
    const v = await viewHead(page, DI)
    const vm = await markSummary(page, `#vWeek .day[data-day="${DI}"]`)
    C.log('view page', { v, vm })
    C.check('S1.u', vm.solid.length === 1 && /TUE NOTE/.test(vm.solid[0]) && !vm.dotted.length,
      'the view page: exactly ONE AL1 mark (the note), none on the take-off, nothing dotted — AM19/AM5', vm)
    await shotBox(page, `s1-${w}-6-view-line`, `#vWeek .day[data-day="${DI}"] .go`, null)
    C.check('S1.z', !errors.length, 'no console errors (main world)', errors)
    await browser.close()
  }
  // ---------------- Branch A: a fresh copy of the world — does an unrelated edit clear the phantom? ---
  {
    const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
    await toastSpy(page)
    await toPhantom(page, C, w, false)
    const m0 = await markSummary(page, DAY)
    C.log('A: after unpublish', m0)
    await editText(page, 'dn:4.0', 'FRI UNRELATED EDIT')
    const m1 = await markSummary(page, DAY)
    C.log('A: after an unrelated edit on Friday', { head: await headLine(page, DI), marks: m1 })
    C.note('S1.q', 'the phantom on the take-off clears only after an UNRELATED edit elsewhere',
      `before: ${m0.dotted.some(s => s.startsWith(TO)) ? 'dotted' : 'clean'} · after Friday edit: ${m1.dotted.some(s => s.startsWith(TO)) ? 'still dotted' : 'cleared'}`)
    await shotBox(page, `s1-${w}-7-after-unrelated-edit`, `${DAY} [data-txt="${TO}"]`, '.go')
    C.check('S1.z2', !errors.length, 'no console errors (branch A)', errors)
    await browser.close()
  }
  C.summary()
}
