/* w1 · Astra rank 12 — add a row then delete it; delete an ISSUED row, then Undo; recreate equivalent content.
   Everything week, TUESDAY (issued Original, clean), on the board.
   RIGHT behaviour: AM21 "a row added and removed again before the next AL is no change at all"; a removal of an
   issued row is ONE removal item; Undo puts it back clean (AM39b); rebuilding equivalent content by hand must
   not mark any OTHER row (Astra: "must not corrupt identity or mark another row").
   Usage: node w1-r12-addremove.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, put, tap, STATE, WIDTHS, widthArg, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel,
  headN, markSummary, boardType, shotBox, book } = L
const DI = 1
const lines = (page) => page.evaluate(i => window.DAYS[i].waves.map(w => w.formations.map(f => f.aircraft.length).join('+')).join(' | '), DI)
const ground = (page) => page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${(window.PEOPLE[g.who] || {}).cs || g.who || ''}`), DI)

for (const w of widthArg()) {
  const C = checker('R12 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  await board(page, DI)
  const l0 = await lines(page)
  // A — add a line, then delete it
  const nForm = await page.evaluate(i => window.DAYS[i].waves[0].formations.length, DI)
  await tap(page, `[data-gline="${DI}.0"]`); await page.waitForTimeout(500)
  const lA = await lines(page), hA = await headN(page, DI)
  C.log('A added a line', { lines: lA, head: hA.pending, toasts: await toasts(page) })
  await tap(page, `[data-ldel="${DI}.0.${nForm}.0"]`); await page.waitForTimeout(500)
  const lB = await lines(page), hB = await headN(page, DI)
  const iB = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.log('A deleted it again', { lines: lB, head: hB.pending, info: iB.pend, toasts: await toasts(page) })
  C.check('r12.a', lB === l0 && !hB.pending, 'a line added and removed again before the next AL is NO change — nothing pending — AM21 (Astra 12)', { lines: lB, pend: hB.pending })
  C.check('r12.a2', !iB.pend, 'and the ⓘ panel agrees — AM23', iB.pend || '(none)')
  // B — delete an issued line, then Undo
  await tap(page, `[data-ldel="${DI}.0.1.1"]`); await page.waitForTimeout(500)
  const hC = await headN(page, DI)
  const pC = w === 'desktop' ? ((await panel(page)).days.find(d => /^Tue/.test(d.text)) || {}).text : null
  C.log('B deleted an issued line', { lines: await lines(page), head: hC.pending, panel: pC, toasts: await toasts(page) })
  C.check('r12.b', hC.pending === '1 pending' && (w !== 'desktop' || /^Tue · 1 change · 1 removal$/.test(pC || '')), 'deleting an issued line = ONE removal item — AM21 (Astra 12)', { pend: hC.pending, panel: pC })
  await page.locator('#sbUndo:visible').first().click(); await page.waitForTimeout(700)
  const hD = await headN(page, DI), lD = await lines(page)
  C.log('B undo', { lines: lD, head: hD.pending, toasts: await toasts(page) })
  C.check('r12.c', lD === l0 && !hD.pending, 'Undo puts the line back and nothing is pending — AM39b (Astra 12)', { lines: lD, pend: hD.pending })
  // C — delete an issued ground row and rebuild the same content by hand
  const g0 = await ground(page)
  C.log('C ground rows (start)', g0)
  const who = g0[1].split('|')[2]
  const whoId = await page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), who)
  await tap(page, `[data-grdel="${DI}.1"]`); await page.waitForTimeout(500)
  await tap(page, `[data-gradd="${DI}"]`); await page.waitForTimeout(500)
  const gN = (await ground(page)).length - 1
  await boardType(page, `gr:${DI}.${gN}.prog`, g0[1].split('|')[0])
  await boardType(page, `gr:${DI}.${gN}.str`, '08:45')
  const pw = await put(page, `[data-fill="g:${DI}.${gN}.+"]`, [whoId])
  const g1 = await ground(page), hE = await headN(page, DI), mE = await markSummary(page, '#schedBoard')
  const pE = w === 'desktop' ? ((await panel(page)).days.find(d => /^Tue/.test(d.text)) || {}).text : null
  C.log('C rebuilt', { put: pw, ground: g1, head: hE.pending, panel: pE, dotted: mE.dotted })
  const otherMarked = mE.dotted.filter(s => /^gr:|^g:/.test(s) && !s.startsWith(`gr:${DI}.${gN}.`) && !s.startsWith(`g:${DI}.${gN}`))
  C.check('r12.d', otherMarked.length === 0, 'rebuilding the same content marks NO other ground row — Astra 12', { otherMarked, allDotted: mE.dotted })
  C.note('r12.e', 'the count after deleting an issued ground row and rebuilding an identical one by hand (identity-based: a removal + a new row)', { head: hE.pending, panel: pE })
  await shotBox(page, `r12-${w}-ground-rebuilt`, `#schedBoard [data-bfld="gr:${DI}.${gN}.prog"]`, '.sb-sec')
  await closeBoard(page)
  C.check('r12.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
