/* w1 · S33 (Fable) + Astra rank 13 — a row moved past another and put exactly back, by hand and by Undo/Redo,
   on a FRESH demo world (nothing reloaded), MONDAY's first duty block on the board.
   Setup: publish Monday; AL1 changes the SECOND duty row's start time (so that row wears a solid AL1 mark).
   Then: sign (nothing to publish); drag the FIRST row below the second → one reorder; drag it back → nothing.
   RIGHT behaviour: AM21 a reorder is a real amendment item; AM20 put exactly back it nets to nothing and the
   sign-offs come back (AM11); a mark follows its ROW, not its position (addressing by id); AM23 the ⓘ and the
   Amendments panel agree with the head; the panel's words and its Discard button tell the truth (AM25/AM15b).
   Usage: node w1-s33-reorder.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishDay, publishAL, WIDTHS, widthArg, checker, toastSpy, toasts,
  dayInfo, closeDayInfo, panel, headLine, headN, markSummary, boardType, dragTo, shotUnion, shotBox, book } = L
const DI = 0
const rows = (page) => page.evaluate(i => window.DAYS[i].dutywaves[0].rows.map(r => `${r.role}|${r.str}-${r.end}`), DI)
const named = h => h.signs.filter(s => !/name/.test(s)).length

for (const w of widthArg()) {
  const C = checker('S33 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w] })
  await toastSpy(page)
  await editWeek(page)
  await signDay(page, DI); C.log('publish Monday', { ...(await publishDay(page, DI)), toasts: await toasts(page) })
  await board(page, DI)
  const r0 = await rows(page)
  C.log('duty rows (start)', r0)
  // AL1: change the SECOND row's start time
  const t1 = r0[1].split('|')[1].split('-')[0]
  const tNew = t1 === '09:10' ? '09:20' : '09:10'
  await boardType(page, `dr:${DI}.0.1.str`, tNew)
  await signDay(page, DI); C.log('publish AL1', { ...(await publishAL(page, DI)), toasts: await toasts(page) })
  const mAL = await markSummary(page, '#schedBoard')
  C.log('marks after AL1', mAL)
  r0.splice(0, r0.length, ...(await rows(page)))   // the rows as issued at AL1 are the ones the moves are compared to
  C.check('S33.0', mAL.solid.some(s => s.startsWith(`dr:${DI}.0.1.str`)), 'the second row\'s start time wears the SOLID AL1 mark', mAL.solid)
  await toasts(page)
  await signDay(page, DI)
  C.log('signed, nothing to publish', { strip: await headLine(page, DI), toasts: await toasts(page) })
  // move row 0 below row 1
  const g = (i) => page.locator(`#schedBoard [data-move="mv:d.${DI}.0.${i}"] .sb-grip:visible`).first()
  const r = (i) => page.locator(`#schedBoard [data-move="mv:d.${DI}.0.${i}"]:visible`).first()
  const d1 = await dragTo(page, g(0), r(1))
  const r1 = await rows(page), h1 = await headN(page, DI), m1 = await markSummary(page, '#schedBoard')
  const i1 = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.log('after the move', { drag: d1, rows: r1, head: h1.pending, names: named(h1), info: i1.pend, marks: m1 })
  C.check('S33.a', r1[0] === r0[1] && r1[1] === r0[0], 'the drag moved the first row below the second', { before: r0, after: r1 })
  C.check('S33.b', h1.pending === '1 pending' && named(h1) === 0, 'one reorder on a published day: "1 pending", sign-offs blank — AM21/AM11 (Astra 13)', { pend: h1.pending, names: named(h1) })
  C.check('S33.c', m1.solid.some(s => s.startsWith(`dr:${DI}.0.0.str`)) && !m1.solid.some(s => s.startsWith(`dr:${DI}.0.1.str`)), 'the AL1 mark FOLLOWED its row to the top (it is on row 1 now, not left at row 2) — addressing by id (Astra 13)', m1.solid)
  if (w === 'desktop') { const P = await panel(page); C.log('panel after the move', P) }
  await shotBox(page, `s33-${w}-1-after-move`, `#schedBoard [data-move="mv:d.${DI}.0.0"]`, '.sb-sec')
  // put it exactly back
  const d2 = await dragTo(page, g(0), r(1))
  const r2 = await rows(page), h2 = await headN(page, DI), m2 = await markSummary(page, '#schedBoard')
  const i2 = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.log('after the move back', { drag: d2, rows: r2, head: h2.pending, names: named(h2), info: i2.pend, marks: m2 })
  C.check('S33.d', JSON.stringify(r2) === JSON.stringify(r0), 'the second drag put the rows exactly back', r2)
  C.check('S33.e', !h2.pending && named(h2) === 4, 'put exactly back: nothing pending and the four sign-offs come back — AM20/AM11 (Astra 13)', { pend: h2.pending, names: named(h2) })
  C.check('S33.f', m2.solid.some(s => s.startsWith(`dr:${DI}.0.1.str`)) && !m2.dotted.length, 'the AL1 mark is back on the second row, nothing dotted — AM20', m2)
  C.check('S33.g', !i2.pend, 'the ⓘ panel agrees: no unpublished edit — AM23', i2.pend || '(none)')
  await shotUnion(page, `s33-${w}-2-strip-after-back`, ['#sbSignBar'])
  const ib = await dayInfo(page, DI, 'board'); await shotBox(page, `s33-${w}-2-dayinfo-after-back`, '#dayPop .airpop-head', '#dayPop > div'); await closeDayInfo(page)
  await closeBoard(page)
  if (w === 'desktop') {
    await editWeek(page)
    const P = await panel(page)
    C.log('panel after the move back', P)
    C.check('S33.h', P.pend === 'No pending changes', 'the Amendments panel says "No pending changes" (nothing is waiting anywhere) — AM25/AM23', P.pend)
    C.check('S33.i', P.discard && P.discard.disabled, '"Discard marks" is not offered when nothing is waiting — AM25', P.discard)
    await shotBox(page, `s33-${w}-3-panel-after-back`, '#alPanel')
  }
  // the same round trip by Undo / Redo
  await board(page, DI)
  await dragTo(page, g(0), r(1))
  const hm = await headN(page, DI)
  /* the board's OWN Undo/Redo — the page's buttons sit behind the open board's sticky bar */
  const undo = async () => { await page.locator('#sbUndo:visible').first().click(); await page.waitForTimeout(700) }
  const redo = async () => { await page.locator('#sbRedo:visible').first().click(); await page.waitForTimeout(700) }
  await undo(); const hu = await headN(page, DI), ru = await rows(page), tu = await toasts(page)
  await redo(); const hr = await headN(page, DI), rr = await rows(page), tr = await toasts(page)
  await undo(); const hu2 = await headN(page, DI), ru2 = await rows(page)
  C.log('undo/redo', { moved: hm.pending, undo: [hu.pending, named(hu), tu], redo: [hr.pending, named(hr), tr], undo2: [hu2.pending, named(hu2)] })
  C.check('r13.a', hm.pending === '1 pending' && !hu.pending && named(hu) === 4 && JSON.stringify(ru) === JSON.stringify(r0), 'Undo of the move: rows back, nothing pending, four names back — AM20/AM39b (Astra 13)', { moved: hm.pending, undo: hu.pending, names: named(hu) })
  C.check('r13.b', hr.pending === '1 pending' && named(hr) === 0 && JSON.stringify(rr) !== JSON.stringify(r0), 'Redo: the move and its reorder item come back, sign-offs blank — AM21 (Astra 13)', { redo: hr.pending, names: named(hr) })
  C.check('r13.c', !hu2.pending && named(hu2) === 4 && JSON.stringify(ru2) === JSON.stringify(r0), 'Undo again: clean — Astra 13', { pend: hu2.pending, names: named(hu2) })
  const i3 = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.check('r13.d', !i3.pend, 'and the ⓘ panel is clean too — AM23', i3.pend || '(none)')
  await closeBoard(page)
  C.log('book pending (record only)', (await book(page)).pending)
  C.check('S33.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
