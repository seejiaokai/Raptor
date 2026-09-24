/* w1 · S3 (Fable) = Astra rank 4 — the ⓘ day panel's count against the day head's "N pending", in three
   setups on the everything week (each on its own published day, so one cannot offset another):
     A  SATURDAY (published Original, earns OIL): board → OIL Earn → take one earning man off an event →
        leave the mode. An OIL-only change (no ordinary cell edit).
     B  TUESDAY: the Personal Inputs panel — take an accepted input off the day, then put it back (and the
        other order where the day offers an unaccepted input).
     C  THURSDAY: drag Wave 1 below Wave 2 on the board, then drag it back (a reorder-and-back).
   RIGHT behaviour: AM23 "N pending" counts real differences from the issued version and agrees with the
   Amendments panel and every other count; the ⓘ panel is one of those counts. AM20 a round trip leaves
   nothing pending. AM47 an OIL change on the working copy moves no Leave War credit until published.
   Usage: node w1-s03-counts.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, openInputs, lwCell, go, STATE, WIDTHS, widthArg, checker, toastSpy, toasts,
  dayInfo, closeDayInfo, panel, headLine, headN, markSummary, shotBox, shotUnion, dragTo, book, norm } = L

/** every count a person can read for day di: week head, board strip, both ⓘ panels, the Amendments row */
async function counts(page, di, w) {
  const out = {}
  await editWeek(page)
  out.week = (await headN(page, di)).pending || '(none)'
  const iw = await dayInfo(page, di); out.infoWeek = iw.pend || '(none)'; await closeDayInfo(page)
  if (w === 'desktop') { const P = await panel(page); const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]
    out.panel = (P.days.find(d => (d.text || '').startsWith(dow)) || {}).text || '(not listed)'; out.panelLine = P.pend; out.discard = P.discard }
  await board(page, di)
  out.board = (await headN(page, di)).pending || '(none)'
  const ib = await dayInfo(page, di, 'board'); out.infoBoard = ib.pend || '(none)'; await closeDayInfo(page)
  return out
}
const num = s => { const m = /^(\d+)/.exec(s || ''); return m ? +m[1] : 0 }
const agree = c => { const n = [c.week, c.board, c.infoWeek, c.infoBoard].map(num); return n.every(x => x === n[0]) }

for (const w of widthArg()) {
  const C = checker('S3 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)

  // ------------------------------------------------ A: Saturday, an OIL-only change ---------------
  C.log('A sat head (start)', await headLine(page, 5))
  await board(page, 5)
  const oilBtn = async () => {
    const d = page.locator('#sbOil:visible'); if (await d.count()) return d.first()
    return page.locator('#schedBoard [data-oilmode="5"]:visible').first()
  }
  let b = await oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(800)
  C.log('A mode on', await toasts(page))
  const man = await page.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const p = [...document.querySelectorAll('#schedBoard .oilpk.on[data-oilp]')].filter(vis).find(e => /earns a full day/.test(e.title))
    return p ? { pid: p.dataset.oilp, item: p.dataset.oilitem, title: p.title } : null
  })
  C.log('A the man', man)
  b = await oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(600)
  await closeBoard(page)
  const lw0 = man ? await lwCell(page, [man.pid], '2026-07-18') : null
  C.log('A Leave War before', lw0)
  await go(page, 'editsched')
  await board(page, 5)
  b = await oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(800)
  const pk = page.locator(`#schedBoard .oilpk.on[data-oilp="${man.pid}"][data-oilitem="${man.item}"]:visible`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await pk.click(); await page.waitForTimeout(700)
  C.log('A tapped him off', { toasts: await toasts(page), nowOff: await page.locator(`#schedBoard .oilpk.off[data-oilp="${man.pid}"][data-oilitem="${man.item}"]`).count() })
  await shotBox(page, `s3-${w}-A-oil-tapped`, `#schedBoard .oilpk[data-oilp="${man.pid}"][data-oilitem="${man.item}"]`, '.sb-arow, .sb-row, .sb-sec')
  b = await oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(700)
  await toasts(page)
  const cA = await counts(page, 5, w)
  C.log('A counts', cA)
  C.check('S3.A1', num(cA.week) === 1 && num(cA.board) === 1, 'Saturday head and board strip say "1 pending" after the OIL-only change — AM23/AM48a', cA)
  if (w === 'desktop') C.check('S3.A2', /^Sat · 1 change · what this day earns changed$/.test(cA.panel), 'Amendments panel: "Sat · 1 change · what this day earns changed" — AM25', cA.panel)
  C.check('S3.A3', agree(cA), 'the ⓘ panel (week AND board) says the same number as the head — AM23', cA)
  await shotUnion(page, `s3-${w}-A-board-strip`, ['#sbSignBar'])
  const ib = await dayInfo(page, 5, 'board'); await shotBox(page, `s3-${w}-A-dayinfo`, '#dayPop .airpop-head', '#dayPop > div'); await closeDayInfo(page)
  await closeBoard(page)
  const lw1 = await lwCell(page, [man.pid], '2026-07-18')
  C.log('A Leave War after (not published)', lw1)
  C.check('S3.A4', JSON.stringify(lw0) === JSON.stringify(lw1), 'his Leave War cell has NOT moved — a working-copy change earns/loses nothing until published — AM47', { before: lw0, after: lw1 })
  await go(page, 'editsched')

  // ------------------------------------------------ B: Tuesday, an input off and back on ------------
  await board(page, 1)
  await openInputs(page, 1)
  const accs = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-acc]')].filter(e => e.offsetWidth || e.offsetHeight)
    .map(e => ({ acc: e.dataset.acc, day: e.dataset.accd, key: e.dataset.acck, text: e.innerText.trim(), row: (e.closest('.sb-arow, .sbi-row, .sb-row') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 60) })))
  C.log('B the input controls on Tuesday', accs)
  const ground = () => page.evaluate(() => window.DAYS[1].ground.map(g => `${g.prog}|${g.str}-${g.end}|${(window.PEOPLE[g.who] || {}).cs || g.who || ''}`))
  C.log('B Tuesday ground rows (start)', await ground())
  await shotBox(page, `s3-${w}-B-ground-start`, '#schedBoard [data-bfld^="gr:1."]', '.sb-sec')
  const undoOne = accs.find(a => a.acc === 'x')
  const acceptOne = accs.find(a => a.acc === 'g' || a.acc === 'u')
  const rows = []
  if (undoOne) {
    await page.locator(`#schedBoard [data-acc="x"][data-acck="${undoOne.key}"]:visible`).first().click(); await page.waitForTimeout(700)
    rows.push({ step: 'taken off', toasts: await toasts(page), ground: await ground(), c: await counts(page, 1, w) })
    await shotUnion(page, `s3-${w}-B-taken-off-strip`, ['#sbSignBar'])
    await openInputs(page, 1)
    const back = page.locator(`#schedBoard [data-acck="${undoOne.key}"]:visible`).filter({ hasText: /Accept|Ground/ }).first()
    if (await back.count()) { await back.click(); await page.waitForTimeout(700) }
    rows.push({ step: 'put back', toasts: await toasts(page), ground: await ground(), c: await counts(page, 1, w) })
    await shotBox(page, `s3-${w}-B-ground-after`, '#schedBoard [data-bfld^="gr:1."]', '.sb-sec')
    await shotUnion(page, `s3-${w}-B-put-back-strip`, ['#sbSignBar'])
    const ibB = await dayInfo(page, 1, 'board'); await shotBox(page, `s3-${w}-B-dayinfo`, '#dayPop .airpop-head', '#dayPop > div'); await closeDayInfo(page)
  }
  for (const r of rows) C.log('B ' + r.step, r)
  if (rows.length === 2) {
    const [off, on] = rows
    C.note('S3.B0', 'taking the accepted input off published Tuesday — what the counts say', off.c)
    C.check('S3.B1', off.c.week !== '(none)', 'taking an accepted input off a published day raises a pending change (an input filing) — AM14/AM21b', off.c)
    C.check('S3.B2', on.c.week === '(none)' && on.c.board === '(none)', 'putting it back nets to NOTHING pending on the head and the board — AM20', on.c)
    C.check('S3.B3', on.c.infoWeek === '(none)' && on.c.infoBoard === '(none)', 'the ⓘ panel agrees: no unpublished edit — AM23', on.c)
    if (w === 'desktop') C.check('S3.B4', on.c.panel === '(not listed)', 'the Amendments panel no longer lists Tuesday — AM25', on.c)
    C.log('B marks on the board after the round trip', await markSummary(page, '#schedBoard'))
  } else C.note('S3.B', 'no accepted input with an Undo control was found on Tuesday', accs)
  if (acceptOne) C.note('S3.Bx', 'Tuesday also offers an unaccepted input (the accept→unaccept order)', acceptOne)

  // ------------------------------------------------ C: Thursday, a wave reorder and back ------------
  await board(page, 3)
  const order = () => page.evaluate(() => window.DAYS[3].waves.map(x => x.label + ':' + (x.formations[0] || {}).cs + (x.formations[0] || {}).to))
  const o0 = await order()
  const d1 = await dragTo(page, page.locator('#schedBoard .sb-go[data-move="mv:w.3.0"] .wvgrip:visible').first(), page.locator('#schedBoard .sb-go[data-move="mv:w.3.1"] .sb-go-h:visible').first())
  const o1 = await order()
  C.log('C wave order', { drag: d1, before: o0, afterDrag: o1, toasts: await toasts(page) })
  const cC1 = await counts(page, 3, w)
  C.log('C after one reorder', cC1)
  await shotUnion(page, `s3-${w}-C-after-reorder-strip`, ['#sbSignBar'])
  /* with two waves, dragging the UPPER wave below the lower one again restores the order — the same
     downward gesture as the first drag (an upward drag on a phone starts inside the bottom auto-scroll band) */
  const d2 = await dragTo(page, page.locator('#schedBoard .sb-go[data-move="mv:w.3.0"] .wvgrip:visible').first(), page.locator('#schedBoard .sb-go[data-move="mv:w.3.1"] .sb-go-h:visible').first())
  const o2 = await order()
  C.log('C second drag', d2)
  const cC2 = await counts(page, 3, w)
  C.log('C wave order back', { order: o2, counts: cC2, toasts: await toasts(page) })
  C.check('S3.C0', JSON.stringify(o0) !== JSON.stringify(o1) && JSON.stringify(o2) === JSON.stringify(o0), 'the drag moved the wave and the second drag put it exactly back', { o0, o1, o2 })
  C.check('S3.C1', num(cC1.week) === 1, 'one wave reorder on a published day = "1 pending" (a reorder is an amendment item) — AM21/AM21b', cC1)
  C.check('S3.C2', cC2.week === '(none)' && cC2.board === '(none)', 'the reorder-and-back nets to NOTHING pending — AM20', cC2)
  C.check('S3.C3', cC2.infoWeek === '(none)' && cC2.infoBoard === '(none)', 'the ⓘ panel agrees: no unpublished edit — AM23', cC2)
  const ibC = await dayInfo(page, 3, 'board'); await shotBox(page, `s3-${w}-C-dayinfo`, '#dayPop .airpop-head', '#dayPop > div'); await closeDayInfo(page)
  await shotUnion(page, `s3-${w}-C-back-strip`, ['#sbSignBar'])
  await closeBoard(page)
  C.log('book (record only)', await book(page))
  C.check('S3.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
