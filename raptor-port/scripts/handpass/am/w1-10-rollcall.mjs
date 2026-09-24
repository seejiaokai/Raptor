/* w1 · ROLL-CALL rows R1–R6, R10, R11 (evidence sheet §4) + S5 (Fable) = Astra rank 2 — "Not yet signed" on
   the board. Everything week, at desktop and phone.
   PART 1 — the day heads (R1), the sign-off strip and its Clear (R2), the board's strip (R4/R6), the
   Amendments panel (R10), the ⓘ panel on week / board / view page (R11).
   PART 2 — R3/R5/R6 cells: ONE change on EVERY kind of cell of published SATURDAY, made on the board —
   callsign, take-off, flying remarks, day note, Common Programme time, duty time, sim label, ground name,
   a flying seat emptied, a duty seat emptied, a Common Programme seat emptied, a sim seat emptied, a
   ground seat swapped to another man — then: is each one DOTTED (AM19) on the week and on the board?
   Sign, Publish AL1: is each one SOLID in AL1's colour on the week, the board and the view page?
   Usage: node w1-10-rollcall.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishAL, head, go, put, viewHead, planMenuItems,
  STATE, WIDTHS, widthArg, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel, headLine, headN, markSummary, boardType,
  shotBox, shotUnion, book } = L

/** the mark state of one address on the current surface: every element carrying it, dotted/solid/none */
async function markAt(page, root, key) {
  return page.evaluate(([r, k]) => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const els = [...document.querySelectorAll(`${r} [data-bfld="${k}"], ${r} [data-txt="${k}"], ${r} [data-slot="${k}"]`)].filter(vis)
    if (!els.length) return 'NOTHING DRAWN'
    const one = e => e.hasAttribute('data-alp') ? 'dotted@AL' + e.getAttribute('data-aln') : e.hasAttribute('data-alc') ? 'solid@AL' + e.getAttribute('data-alc') : 'unmarked'
    return [...new Set(els.map(one))].join('+')
  }, [root, key])
}

for (const w of widthArg()) {
  const C = checker('ROLL ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  // ============================ PART 1 — heads, strips, panels ============================
  for (let di = 0; di < 7; di++) C.log(`R1 head d${di}`, await headLine(page, di))
  const hMon = await headN(page, 0)
  C.check('R1.a', hMon.tag === 'AL1' && hMon.pending === '1 pending' && hMon.nys && hMon.alpub?.text === 'Publish AL2' && hMon.alpub.disabled && hMon.unpub,
    'week head, Monday (AL1 + one pending): tag AL1, "1 pending", "Not yet signed", "Publish AL2" locked, Unpublish — AM22/AM23/AM24/AM9/AM32', hMon)
  const hWed = await headN(page, 2)
  C.check('R1.b', hWed.tag === 'DRAFT' && hWed.beak?.text === 'Publish day' && !hWed.unpub && !hWed.nys, 'week head, Wednesday (never published): dashed DRAFT, "Publish day", no Unpublish, no "Not yet signed" — AM8/AM22/AM24', hWed)
  const hThu = await headN(page, 3)
  C.check('R1.c', hThu.tag === 'ORIG' && /Plan A/.test(hThu.selector) && !hThu.alpub, 'week head, Thursday (published, Plan A live): ORIG, selector names "Plan A", no Publish AL (nothing to publish) — AM28/AM15', hThu)
  await shotUnion(page, `rc-${w}-R1-mon-head`, ['#eWeek .day[data-day="0"] .day-head', '#eWeek .day[data-day="0"] .signoff'])
  await shotUnion(page, `rc-${w}-R1-wed-head`, ['#eWeek .day[data-day="2"] .day-head', '#eWeek .day[data-day="2"] .signoff'])
  const mm = await planMenuItems(page, 0)
  C.log('R1 ACT plans menu (Mon)', mm)
  C.check('R1.d', mm.some(x => /Original/.test(x.text) && x.does.startsWith('look:')) && mm.some(x => x.does === '+alt'), 'the plans selector opens its menu: issued versions to look at, "+ Alt Plan" — AM28', mm.map(x => x.text + '→' + x.does))
  await shotBox(page, `rc-${w}-R1-mon-planmenu`, '.wm', '.wmenu, .popmenu, [class*=menu]')
  await page.keyboard.press('Escape'); await page.mouse.click(3, 300); await page.waitForTimeout(300)
  // R2: the sign strip on Tuesday (ORIG, nothing pending): sign two, Clear
  for (const role of ['cur', 'sked']) { const s = page.locator(`#eWeek select[data-sign="${role}"][data-signday="1"]:visible`).first()
    const v = await s.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); await s.selectOption(v[0]); await page.waitForTimeout(250) }
  const h2 = await headN(page, 1)
  C.log('R2 two signed (Tue)', h2)
  const clr = page.locator('#eWeek [data-signclear="1"]:visible').first()
  C.check('R2.a', /^2 to sign/.test(h2.signState) && await clr.count() === 1, 'the strip counts what is left ("2 to sign") and offers Clear once anything is signed — AM10', { state: h2.signState, clear: await clr.count() })
  await shotUnion(page, `rc-${w}-R2-tue-two-signed`, ['#eWeek .day[data-day="1"] .day-head', '#eWeek .day[data-day="1"] .signoff'])
  await clr.click(); await page.waitForTimeout(400)
  const h2b = await headN(page, 1)
  C.check('R2.b', h2b.signs.every(s => /name/.test(s)) && /^4 to sign/.test(h2b.signState), 'Clear empties every sign-off', h2b.signs)
  // R4/R6 + S5: the board's strip for Monday
  await board(page, 0)
  const bMon = await headN(page, 0)
  C.log('R4 board strip (Mon)', bMon)
  C.check('R4.a', bMon.tag === 'AL1' && bMon.pending === '1 pending' && bMon.alpub?.text === 'Publish AL2' && bMon.unpub, 'board strip, Monday: tag, "1 pending", "Publish AL2", Unpublish — the same builders as the week — AM22/AM23', bMon)
  C.check('S5', bMon.nys === hMon.nys, '"Not yet signed" shows on the board exactly as on the week head (the board IS the working copy) — AM24', { week: hMon.nys, board: bMon.nys })
  await shotUnion(page, `rc-${w}-S5-board-strip-mon`, ['#sbSignBar'])
  const iB = await dayInfo(page, 0, 'board'); C.log('R11 ⓘ board (Mon)', iB); await closeDayInfo(page)
  await closeBoard(page)
  await editWeek(page)
  await shotUnion(page, `rc-${w}-S5-week-head-mon`, ['#eWeek .day[data-day="0"] .day-head'])
  // R10
  const P = await panel(page)
  C.log('R10 panel', P)
  if (w === 'desktop') {
    C.check('R10.a', P.visible && P.days.some(d => /^Mon · 1 change$/.test(d.text) && d.btn === 'Publish AL2' && d.disabled) && P.tags.some(t => /^AL1 Mon · 1 item · appr /.test(t)),
      'the Amendments panel: Mon "1 change" with its own locked "Publish AL2"; the issued AL1 with who approved it — AM25', P)
    await shotBox(page, `rc-${w}-R10-panel`, '#alPanel')
  } else C.note('R10.p', 'the Amendments panel at phone width', P.present ? (P.visible ? 'visible' : 'in the page but HIDDEN') : 'not in the page')
  // R11 on the week and the view page
  const iW = await dayInfo(page, 0); C.log('R11 ⓘ week (Mon)', iW)
  await shotBox(page, `rc-${w}-R11-dayinfo-week-mon`, '#dayPop .airpop-head', '#dayPop > div'); await closeDayInfo(page)
  C.check('R11.a', /at AL1/.test(iW.stat) && iW.als.length === 1 && /^AL1 1 item/.test(iW.als[0]) && /1 unpublished edit/.test(iW.pend), 'ⓘ (week, Monday): "Published … at AL1", "AL1 · 1 item", "1 unpublished edit" — AM23', iW)
  await go(page, 'viewsched')
  const iV = await dayInfo(page, 0); C.log('R11 ⓘ view page (Mon)', iV); await closeDayInfo(page)
  C.note('R11.v', 'ⓘ on the VIEW page shows the working copy\'s unpublished-edit count to anyone who opens it', iV.pend || '(none)')
  // ============================ PART 2 — every kind of cell on Saturday ============================
  await editWeek(page)
  C.log('R3 sat head (start)', await headLine(page, 5))
  await board(page, 5)
  const TEXT = [['ff:5.0.0.cs', 'VIPR', 'flying callsign'], ['ff:5.0.1.to', '14:10', 'flying take-off'], ['fr:5.0.0.0', 'RC RMK', 'flying remarks'],
    ['dn:5.1', 'DUTY CREW ON CALL X', 'day note'], ['ap:5.1.str', '15:10', 'Common Programme time'], ['dr:5.0.0.str', '08:10', 'duty desk time'],
    ['sr:5.oft.0.label', 'EP-7', 'sim label'], ['gr:5.1.prog', 'ADMIN 2', 'ground name']]
  for (const [k, v] of TEXT) await boardType(page, k, v)
  const SEATS = [['5.0.1.0.w', 'flying seat emptied'], ['d:5.0.2', 'duty seat emptied'], ['a:5.1.1', 'Common Programme seat emptied'], ['s:5.oft.0.w', 'sim seat emptied'], ['g:5.1', 'ground seat emptied then refilled']]
  for (const [k] of SEATS) {
    const s = page.locator(`#schedBoard .seat[data-slot="${k}"]:visible`).first()
    if (!(await s.count())) { C.note('R5.x', 'seat not found to clear', k); continue }
    await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click({ button: 'right' }); await page.waitForTimeout(500)
  }
  C.log('seat clears', await toasts(page))
  const refill = await put(page, '[data-fill="g:5.1.+"]', ['razer', 'bane', 'dice', 'snap', 'ammo', 'glass'])
  C.log('ground seat refilled with', refill)
  const ALL = [...TEXT.map(([k, , what]) => [k, what]), ...SEATS]
  const hS = await headN(page, 5)
  C.log('R3 sat head after 13 changes (board)', hS)
  const rows = []
  for (const [k, what] of ALL) rows.push({ k, what, board: await markAt(page, '#schedBoard', k) })
  await shotBox(page, `rc-${w}-R5-board-flying`, '#schedBoard [data-bfld="ff:5.0.0.cs"]', '.sb-go')
  await shotBox(page, `rc-${w}-R5-board-duty`, '#schedBoard [data-bfld="dr:5.0.0.str"]', '.sb-sec')
  await shotBox(page, `rc-${w}-R5-board-sim`, '#schedBoard [data-bfld="sr:5.oft.0.label"]', '.sb-sec')
  await shotBox(page, `rc-${w}-R5-board-ground`, '#schedBoard [data-bfld="gr:5.1.prog"]', '.sb-sec')
  await shotBox(page, `rc-${w}-R5-board-programme`, '#schedBoard [data-bfld="ap:5.1.str"]', '.sb-sec')
  await closeBoard(page)
  await editWeek(page)
  for (const r of rows) r.week = await markAt(page, '#eWeek .day[data-day="5"]', r.k)
  await shotBox(page, `rc-${w}-R3-week-flying`, '#eWeek .day[data-day="5"] [data-txt="ff:5.0.0.cs"]', '.go')
  await shotBox(page, `rc-${w}-R3-week-duty`, '#eWeek .day[data-day="5"] [data-txt="dr:5.0.0.str"]', '.dsec')
  await shotBox(page, `rc-${w}-R3-week-ground`, '#eWeek .day[data-day="5"] [data-txt="gr:5.1.prog"]', '.dsec')
  for (const r of rows) C.log(`R3/R5 ${r.what}`, `week=${r.week} · board=${r.board}`)
  for (const r of rows) {
    const ok = (s) => /dotted@AL1/.test(s)
    C.check(`R3.${r.k}`, ok(r.week) || (r.week === 'NOTHING DRAWN' && false), `WEEK — a pending change on a ${r.what} is DOTTED in AL1's colour — AM19`, r.week)
    C.check(`R5.${r.k}`, ok(r.board), `BOARD (${w}) — a pending change on a ${r.what} is DOTTED in AL1's colour — AM19`, r.board)
  }
  const hW = await headN(page, 5)
  C.log('sat head (week) after the changes', hW)
  if (w === 'desktop') C.log('sat Amendments row', (await panel(page)).days.find(d => /^Sat/.test(d.text || '')))
  const iS = await dayInfo(page, 5); C.log('sat ⓘ after the changes', iS); await closeDayInfo(page)
  // sign + publish AL1 on the week
  await signDay(page, 5)
  const pub = await publishAL(page, 5)
  C.log('publish AL1 (Sat)', { ...pub, toasts: await toasts(page) })
  for (const r of rows) r.weekAL = await markAt(page, '#eWeek .day[data-day="5"]', r.k)
  await board(page, 5)
  for (const r of rows) r.boardAL = await markAt(page, '#schedBoard', r.k)
  await shotBox(page, `rc-${w}-R5-board-duty-AL1`, '#schedBoard [data-bfld="dr:5.0.0.str"]', '.sb-sec')
  await closeBoard(page)
  for (const r of rows) {
    C.check(`R3i.${r.k}`, /solid@AL1/.test(r.weekAL), `WEEK after Publish AL1 — the ${r.what} wears the SOLID AL1 mark — AM19`, r.weekAL)
    C.check(`R5i.${r.k}`, /solid@AL1/.test(r.boardAL), `BOARD after Publish AL1 — the ${r.what} wears the SOLID AL1 mark — AM19`, r.boardAL)
  }
  const vh = await viewHead(page, 5)
  const vm = await markSummary(page, '#vWeek .day[data-day="5"]')
  C.log('R7 view page Saturday after AL1', { vh, solid: vm.solid.length, list: vm.solid, dotted: vm.dotted })
  C.note('R7.sat', `the VIEW page's issued AL1 face shows ${vm.solid.length} solid AL1 marks for 13 changes (the emptied list seats have no cell to carry one)`, vm.solid)
  await shotBox(page, `rc-${w}-R7-view-sat-duty`, '#vWeek .day[data-day="5"] .dutyblk, #vWeek .day[data-day="5"] [class*=duty]', null)
  C.log('book', await book(page))
  C.check('R.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
