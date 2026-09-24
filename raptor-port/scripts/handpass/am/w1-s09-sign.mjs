/* w1 · S9 (Fable) = Astra rank 8, + Astra rank 20 and rank 11 — sign-offs against edits, on TUESDAY of the
   everything week (issued as its Original, nothing pending), across the week and the board.
     D  sign all four on the BOARD with nothing to publish → "All signed — no changes to publish right now"
        (AM15b), the line "Published at Original — no changes to publish", no Publish button anywhere (AM15).
     A  then change a time on the WEEK → all four names blank on the week AND the board, "4 to sign" (AM11).
     B  change it back → the four names return on both surfaces without re-picking (AM11).
     C  edit first, then sign → "Published at Original · 1 change to publish — Publish AL1"; the "All signed"
        note must NOT fire (it is only for nothing-to-publish).
     r20 sign only three → every publish door (head, board strip, Amendments panel) stays locked (AM10).
     r11 the same change and its reverse by Undo / Redo: mark, count and sign-offs appear at B and restore at A.
   Usage: node w1-s09-sign.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, editText, STATE, WIDTHS, widthArg, checker, toastSpy, toasts,
  panel, headLine, headN, markSummary, cellValue, shotUnion } = L
const DI = 1, TO = 'ff:1.0.0.to', NOTE = 'dn:1.0', DAY = `#eWeek .day[data-day="${DI}"]`
const named = h => h.signs.filter(s => !/name/.test(s)).length

for (const w of widthArg()) {
  const C = checker('S9 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  const press = async (id) => { const b = page.locator(`#${id}:visible, #${id === 'undoBtn' ? 'sbUndo' : 'sbRedo'}:visible`).first(); await b.click(); await page.waitForTimeout(700) }
  await editWeek(page)
  const to0 = await cellValue(page, TO)
  C.log('start', await headLine(page, DI))
  // D — sign all four on the BOARD, nothing to publish
  await board(page, DI)
  await toasts(page)
  C.log('D signed on board', await signDay(page, DI))
  const tD = await toasts(page), bD = await headN(page, DI)
  C.log('D board strip', { strip: bD, toasts: tD })
  C.check('S9.D1', tD.some(t => /^All signed — no changes to publish right now$/.test(t)), 'signing the four on a published day with nothing to publish says "All signed — no changes to publish right now" — AM15b', tD)
  C.check('S9.D2', bD.signState === 'Published at Original — no changes to publish' && !bD.alpub, 'board line "Published at Original — no changes to publish", no Publish button — AM15', bD)
  await shotUnion(page, `s9-${w}-D-board-signed-p0`, ['#sbSignBar'])
  await closeBoard(page)
  await editWeek(page)
  const wD = await headN(page, DI)
  C.check('S9.D3', named(wD) === 4 && !wD.alpub && wD.signState === 'Published at Original — no changes to publish', 'the WEEK shows the same four names and no Publish button (signed on the board)', wD)
  if (w === 'desktop') C.check('S9.D4', !(await panel(page)).days.some(d => /^Tue/.test(d.text)), 'the Amendments panel offers nothing for Tuesday — AM15/AM25')
  // A — change a time on the week
  await editText(page, TO, '08:55')
  const wA = await headN(page, DI)
  C.log('A after the time change', wA)
  C.check('S9.A1', named(wA) === 0 && /^4 to sign/.test(wA.signState), 'a content change blanks all four sign-offs on the WEEK — AM11', wA.signs)
  C.check('S9.A1b', wA.pending === '1 pending' && wA.nys, 'and the head says "1 pending" / "Not yet signed" — AM23/AM24', wA)
  await shotUnion(page, `s9-${w}-A-week-after-edit`, [`${DAY} .day-head`, `${DAY} .signoff`])
  await board(page, DI)
  const bA = await headN(page, DI)
  C.check('S9.A2', named(bA) === 0 && /^4 to sign/.test(bA.signState), '…and on the BOARD — AM11', bA.signs)
  await closeBoard(page)
  await editWeek(page)
  // B — change it back
  await editText(page, TO, to0)
  const wB = await headN(page, DI)
  C.log('B after the time is put back', wB)
  C.check('S9.B1', named(wB) === 4 && wB.signState === 'Published at Original — no changes to publish' && !wB.pending, 'putting the content back restores all four names on the WEEK, nothing pending — AM11/AM20', wB)
  await shotUnion(page, `s9-${w}-B-week-restored`, [`${DAY} .day-head`, `${DAY} .signoff`])
  await board(page, DI)
  const bB = await headN(page, DI)
  C.check('S9.B2', named(bB) === 4 && !bB.alpub, '…and on the BOARD — AM11', bB)
  await closeBoard(page)
  await editWeek(page)
  // r11 — the same round trip by Undo / Redo
  await editText(page, TO, '08:55')
  const r11a = await headN(page, DI), m11a = await markSummary(page, DAY)
  await press('undoBtn')
  const r11b = await headN(page, DI), m11b = await markSummary(page, DAY), tU = await toasts(page)
  await press('redoBtn')
  const r11c = await headN(page, DI), m11c = await markSummary(page, DAY), tR = await toasts(page)
  await press('undoBtn')
  const r11d = await headN(page, DI), m11d = await markSummary(page, DAY)
  C.log('r11 edit / undo / redo / undo', { edit: [r11a.pending, named(r11a), m11a.dotted], undo: [r11b.pending, named(r11b), m11b.dotted, tU], redo: [r11c.pending, named(r11c), m11c.dotted, tR], undo2: [r11d.pending, named(r11d), m11d.dotted] })
  C.check('r11.a', r11a.pending === '1 pending' && named(r11a) === 0 && m11a.dotted.some(s => s.startsWith(TO)), 'at B: dotted mark, "1 pending", sign-offs blank — AM20/AM11', { pend: r11a.pending, names: named(r11a), dotted: m11a.dotted })
  C.check('r11.b', !r11b.pending && named(r11b) === 4 && !m11b.dotted.length && await cellValue(page, TO) === to0, 'Undo back to A: no mark, nothing pending, all four names back — AM20/AM11/AM39b', { pend: r11b.pending, names: named(r11b), dotted: m11b.dotted })
  C.check('r11.c', r11c.pending === '1 pending' && named(r11c) === 0 && m11c.dotted.some(s => s.startsWith(TO)), 'Redo to B: the mark, the count and the blank sign-offs come back — AM20/AM11', { pend: r11c.pending, names: named(r11c), dotted: m11c.dotted })
  C.check('r11.d', !r11d.pending && named(r11d) === 4 && !m11d.dotted.length, 'Undo again: clean, four names — AM11', { pend: r11d.pending, names: named(r11d) })
  // C — edit first, then sign
  await page.evaluate(() => {})   // (the signatures above are still in place — Clear first so C signs from empty)
  await page.locator(`#eWeek [data-signclear="${DI}"]:visible`).first().click(); await page.waitForTimeout(400)
  await editText(page, NOTE, 'TUE NOTE — EDIT THEN SIGN')
  await toasts(page)
  C.log('C signed after the edit', await signDay(page, DI))
  const tC = await toasts(page), wC = await headN(page, DI)
  C.log('C head', { wC, toasts: tC })
  C.check('S9.C1', wC.signState === 'Published at Original · 1 change to publish — Publish AL1' && wC.alpub && !wC.alpub.disabled, 'edit then sign: "Published at Original · 1 change to publish — Publish AL1", the button unlocked — AM15/AM10', wC)
  C.check('S9.C2', !tC.some(t => /All signed — no changes to publish/.test(t)), 'the "All signed — no changes" note does NOT fire when there is a change to publish — AM15b', tC)
  await shotUnion(page, `s9-${w}-C-edit-then-sign`, [`${DAY} .day-head`, `${DAY} .signoff`])
  // r20 — three of four
  await page.locator(`#eWeek [data-signclear="${DI}"]:visible`).first().click(); await page.waitForTimeout(400)
  for (const role of ['cur', 'sked', 'plan']) { const s = page.locator(`#eWeek select[data-sign="${role}"][data-signday="${DI}"]:visible`).first()
    const v = await s.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); await s.selectOption(v[0]); await page.waitForTimeout(250) }
  const w20 = await headN(page, DI)
  C.log('r20 three signed (week)', w20)
  C.check('r20.a', w20.alpub && w20.alpub.disabled && /APPROVED BY/.test(w20.alpub.title), 'three of four: the week head\'s "Publish AL1" is LOCKED and says what is missing (APPROVED BY) — AM10', w20.alpub)
  const tries = []
  const b20 = page.locator(`#eWeek [data-alpub="${DI}"]:visible`).first()
  await b20.click({ force: true }).catch(e => tries.push('week click refused: ' + String(e).slice(0, 60)))
  await page.waitForTimeout(500)
  if (w === 'desktop') { const P = await panel(page); const r = P.days.find(d => /^Tue/.test(d.text)); C.check('r20.b', r && r.disabled, 'three of four: the Amendments panel\'s "Publish AL1" is LOCKED — AM10', r)
    const pb = page.locator('#alPanel .al-pubday', { hasText: 'Tue' }).locator('button').first(); await pb.click({ force: true }).catch(e => tries.push('panel click refused')); await page.waitForTimeout(500) }
  await board(page, DI)
  const bb20 = await headN(page, DI)
  C.check('r20.c', bb20.alpub && bb20.alpub.disabled && /^1 to sign/.test(bb20.signState), 'three of four: the BOARD strip\'s "Publish AL1" is LOCKED, "1 to sign · APPROVED BY" — AM10', bb20)
  await page.locator(`#schedBoard [data-alpub="${DI}"]:visible`).first().click({ force: true }).catch(e => tries.push('board click refused'))
  await page.waitForTimeout(500)
  await shotUnion(page, `s9-${w}-r20-board-three-signed`, ['#sbSignBar'])
  const after20 = await headN(page, DI)
  C.check('r20.d', after20.tag === 'ORIG', 'pressing every locked door (forced clicks) published nothing — still ORIG — AM10', { tag: after20.tag, tries, toasts: await toasts(page) })
  await closeBoard(page)
  C.check('S9.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
