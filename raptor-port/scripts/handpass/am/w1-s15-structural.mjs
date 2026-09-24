/* w1 · S15 (Fable) + Astra rank 34 — an ordinary edit, a removal, a reorder and an input filing on one
   published day, then Publish AL1, then Unpublish, then the reorder undone by hand.
   Everything week, THURSDAY (issued as its Original, Plan A live, two waves, an accepted appointment).
   On the board: change Wave 1's take-off; delete one aircraft line of Wave 2; take the accepted
   appointment off the day; drag Wave 1 below Wave 2.
   RIGHT behaviour: AM21 a removal and a reorder are real amendment items, listed as such; AM21b the input
   filing rides the AL; AM23 the head, panel and ⓘ agree; AM19 after AL1 every changed cell is SOLID AL1 and
   nothing dotted is left; AM37c Unpublish puts the changes back to pending with the Original current; AM5
   the view page then shows the Original WITH the deleted line; AM20 the wave dragged back nets its reorder out.
   Usage: node w1-s15-structural.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishAL, unpublish, openInputs, viewHead, go, STATE, WIDTHS, widthArg, checker,
  toastSpy, toasts, dayInfo, closeDayInfo, panel, headLine, headN, markSummary, boardType, dragTo, shotUnion, shotBox, book } = L
const DI = 3, DAYW = `#eWeek .day[data-day="${DI}"]`
const waves = (page) => page.evaluate(i => window.DAYS[i].waves.map(w => w.label + '[' + w.formations.map(f => f.cs + f.to + 'x' + f.aircraft.length).join(',') + ']'), DI)
const lines = (page) => page.evaluate(i => window.DAYS[i].waves.reduce((n, w) => n + w.formations.reduce((m, f) => m + f.aircraft.length, 0), 0), DI)

for (const w of widthArg()) {
  const C = checker('S15 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  C.log('start', { head: await headLine(page, DI), waves: await waves(page), lines: await lines(page) })
  const lines0 = await lines(page)
  await board(page, DI)
  // 1. an ordinary edit
  await boardType(page, `ff:${DI}.0.0.to`, '12:50')
  // 2. delete one aircraft line of Wave 2 (its second formation's second aircraft)
  const del = page.locator(`#schedBoard [data-ldel="${DI}.1.1.1"]:visible`).first()
  await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await del.click(); await page.waitForTimeout(700)
  const linesDel = await lines(page)
  C.log('after delete', { toasts: await toasts(page), lines: linesDel })
  C.check('S15.0', linesDel === lines0 - 1, 'the ✕ removed exactly one aircraft line (no confirm step)', { before: lines0, after: linesDel })
  // 3. take the accepted appointment off the day
  await openInputs(page, DI)
  const x = page.locator(`#schedBoard [data-acc="x"][data-accd="${DI}"]:visible`).first()
  if (await x.count()) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(700) }
  C.log('after input off', { toasts: await toasts(page) })
  // 4. drag Wave 1 below Wave 2
  const d = await dragTo(page, page.locator(`#schedBoard .sb-go[data-move="mv:w.${DI}.0"] .wvgrip:visible`).first(), page.locator(`#schedBoard .sb-go[data-move="mv:w.${DI}.1"] .sb-go-h:visible`).first())
  C.log('after reorder', { drag: d, waves: await waves(page), toasts: await toasts(page) })
  const hB = await headN(page, DI)
  await shotUnion(page, `s15-${w}-1-board-strip-4-changes`, ['#sbSignBar'])
  await closeBoard(page)
  await editWeek(page)
  const hW = await headN(page, DI), mW = await markSummary(page, DAYW)
  const iW = await dayInfo(page, DI); await closeDayInfo(page)
  const P1 = w === 'desktop' ? (await panel(page)).days.find(r => /^Thu/.test(r.text)) : null
  C.log('pending state', { week: hW.pending, board: hB.pending, info: iW.pend, panel: P1, dotted: mW.dotted })
  C.note('S15.a', 'the four changes (edit, removal, input off, reorder) as counted by the head / board / ⓘ / panel', { week: hW.pending, board: hB.pending, info: iW.pend || '(none)', panel: P1 && P1.text })
  /* taking the appointment off removes its ground row too, so TWO removals (the line and that row) are right */
  if (w === 'desktop') C.check('S15.b', P1 && /2 removals/.test(P1.text) && /1 reorder/.test(P1.text) && /1 input filing/.test(P1.text), 'the panel names the kinds: 2 removals (the line + the ground row of the input), 1 reorder, 1 input filing — AM21/AM21b/AM25', P1)
  C.check('S15.c', hW.pending === hB.pending && (!iW.pend || iW.pend.split(' ')[0] === hW.pending.split(' ')[0]), 'head, board and ⓘ give the same count — AM23', { week: hW.pending, board: hB.pending, info: iW.pend })
  C.check('S15.d', mW.dotted.filter(s => /\.to"|to="/.test(s) || s.startsWith('ff:')).length >= 1, 'the edited take-off is dotted (AL1 colour) — AM19', mW.dotted)
  // publish AL1
  await signDay(page, DI)
  const pub = await publishAL(page, DI)
  const tPub = await toasts(page)
  C.log('publish AL1', { ...pub, toasts: tPub })
  const hAL = await headN(page, DI), mAL = await markSummary(page, DAYW)
  C.check('S15.e', hAL.tag === 'AL1' && !hAL.pending && !mAL.dotted.length, 'after Publish AL1: tag AL1, nothing pending, NO dotted remnants — AM19 (Astra 34)', { tag: hAL.tag, pend: hAL.pending, dotted: mAL.dotted })
  C.check('S15.f', mAL.solid.some(s => /12:50/.test(s)), 'the edited take-off wears the SOLID AL1 mark — AM19 (Astra 34)', mAL.solid)
  C.log('solid marks after AL1 (week)', mAL.solid)
  const iAL = await dayInfo(page, DI); await closeDayInfo(page)
  C.log('ⓘ after AL1', iAL)
  if (w === 'desktop') { const P2 = await panel(page); const tag = P2.tags.find(t => /Thu/.test(t)); C.log('panel AL tag', tag)
    C.check('S15.g', tag && /2 removals/.test(tag) && /1 reorder/.test(tag) && /1 input filing/.test(tag) && /appr /.test(tag), 'the issued AL1 tag lists 2 removals, 1 reorder, 1 input filing and who approved it — AM25 (Astra 34)', tag) }
  await board(page, DI)
  const bm = await markSummary(page, '#schedBoard')
  C.check('S15.h', !bm.dotted.length && bm.solid.some(s => /12:50/.test(s)), 'the board: the take-off SOLID AL1, nothing dotted — AM19', bm)
  await shotBox(page, `s15-${w}-2-board-after-AL1`, `#schedBoard .sb-go`, null)
  await closeBoard(page)
  // Unpublish AL1
  await editWeek(page)
  const u = await unpublish(page, DI)
  C.log('unpublish', { ...u, toasts: await toasts(page) })
  const hU = await headN(page, DI), mU = await markSummary(page, DAYW)
  const iU = await dayInfo(page, DI); await closeDayInfo(page)
  C.log('after unpublish', { head: await headLine(page, DI), dotted: mU.dotted, info: iU.pend })
  C.check('S15.i', hU.tag === 'ORIG' && hU.pending === hW.pending, `after Unpublish: tag ORIG and the same "${hW.pending}" as before AL1 (the working copy kept all four) — AM37c`, { tag: hU.tag, pend: hU.pending })
  C.check('S15.j', !iU.pend || iU.pend.split(' ')[0] === hU.pending.split(' ')[0], 'ⓘ agrees with the head after the unpublish — AM23', { head: hU.pending, info: iU.pend })
  const vh = await viewHead(page, DI)
  const vLines = await page.evaluate(i => document.querySelectorAll(`#vWeek .day[data-day="${i}"] .go .seat[data-alc], #vWeek .day[data-day="${i}"] .go`).length, DI)
  const vRows = await page.evaluate(i => [...document.querySelectorAll(`#vWeek .day[data-day="${i}"] .go`)].map(g => (g.innerText.match(/\bVL\b|\bRU\b/g) || []).length), DI)
  C.log('view page after unpublish', { vh, perWaveCallsignMentions: vRows })
  C.note('S15.k', 'the view page shows the Original as issued (both waves in their original order, the deleted line still there)', { picker: vh.picker, head: vh.head, callsignsPerWave: vRows })
  await shotBox(page, `s15-${w}-3-view-after-unpublish`, `#vWeek .day[data-day="${DI}"] .go`, null)
  // drag the wave back
  await editWeek(page)
  await board(page, DI)
  const d2 = await dragTo(page, page.locator(`#schedBoard .sb-go[data-move="mv:w.${DI}.0"] .wvgrip:visible`).first(), page.locator(`#schedBoard .sb-go[data-move="mv:w.${DI}.1"] .sb-go-h:visible`).first())
  const hBk = await headN(page, DI)
  const iBk = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.log('wave dragged back', { drag: d2, waves: await waves(page), head: hBk.pending, info: iBk.pend })
  const n = s => +((s || '').split(' ')[0] || 0)
  C.check('S15.l', n(hBk.pending) === n(hU.pending) - 1, 'dragging the wave back takes exactly the reorder off the count — AM20', { before: hU.pending, after: hBk.pending })
  C.check('S15.m', !iBk.pend || n(iBk.pend) === n(hBk.pending), 'ⓘ agrees with the head — AM23', { head: hBk.pending, info: iBk.pend })
  await shotUnion(page, `s15-${w}-4-strip-wave-back`, ['#sbSignBar'])
  await closeBoard(page)
  C.log('book', await book(page))
  C.check('S15.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
