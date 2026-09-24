/* w2-09 — Astra rank 5: on a published day, Plan A = the issued document and Plan B differs ONLY in an OIL
   decision (a change with no cell). Switch A→B and B→A and read the switch toast's words and number against
   the day head, the board, the Amendments panel and the ⓘ panel (AM23 — one count everywhere).
   Astra rank 27: content changes PLUS an input filing, then look at the Original and Load: the confirm must
   count only the content it discards, and the filing must stay (publish.ts dayDiscardCount).
   Usage: node w2-09-oil-plan-and-filing.mjs [a5|a27|all] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, board, closeBoard, check, note, summary, installToasts, takeToasts, h, bookDay, altPlan, switchTo, lookAt, pvBar, pvTap,
  clip, screen, panelText, dayInfo, oilMode, openInputs, editText, STATE, DESK } = L
const part = process.argv[2] || 'all'
const nOf = s => +((String(s).match(/(\d+)/) || [0, 0])[1])

if (part === 'all' || part === 'a5') {
  console.log('\n##### Astra 5 — Saturday, plans differing only in an OIL decision — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  await altPlan(page, 5); await takeToasts(page)
  let hd = await h(page, 5)
  check('d.A5 setup: Plan A (stowed) and Plan B (live), both = the issued Original, nothing pending', /Plan B/.test(hd.selector) && !hd.pending, JSON.stringify({ sel: hd.selector.trim(), pend: hd.pending }))
  /* Plan B: the OIL Earn mode on the board, switch one man OFF, leave the mode */
  await board(page, 5)
  const on = await oilMode(page, true)
  note('d.A5 OIL Earn mode on', JSON.stringify({ items: on.items, people: on.people }))
  const man = page.locator('#schedBoard [data-oilp].on:visible').first()
  const who = await man.getAttribute('data-oilp')
  await man.evaluate(e => e.scrollIntoView({ block: 'center' })); await man.click(); await page.waitForTimeout(600)
  const nowOff = await page.evaluate(p => { const e = document.querySelector(`#schedBoard [data-oilp="${p}"]`); return e ? e.className : 'gone' }, who)
  check(`d.A5 switched ${who} off earning on Plan B`, /\boff\b/.test(nowOff), nowOff)
  await oilMode(page, false)
  const bh = await h(page, 5)
  await screen(page, 'd-96-A5-board-planB-oil-change')
  await closeBoard(page); await editWeek(page)
  hd = await h(page, 5)
  const pt = await panelText(page)
  const satLine = (pt.match(/Sat · [^A-Z]*/) || [''])[0].trim()
  check('d.A5 Plan B: the head reads "1 pending" and the panel says "Sat · 1 change · what this day earns changed"', /1\s*pending/.test(hd.pending) && /Sat · 1 change · what this day earns changed/.test(pt), `head "${hd.pending}" board "${bh.pending}" · panel "${satLine}"`)
  check('d.A5 Plan B: "Not yet signed" on the week, "Publish AL1" offered (locked until signed)', hd.nys && hd.alpub && /Publish AL1/.test(hd.alpub.text), JSON.stringify({ nys: hd.nys, alpub: hd.alpub }))
  /* A: the issued document itself */
  await switchTo(page, 5, /Plan A/)
  let t = await takeToasts(page); hd = await h(page, 5)
  check('d.A5 switch to Plan A: toast "… · matches Original — nothing pending", head clean', t.some(x => /matches Original — nothing pending/.test(x)) && !hd.pending, `toast ${JSON.stringify(t)} head "${hd.pending}"`)
  /* B again: the OIL decision is the one difference */
  await switchTo(page, 5, /Plan B/)
  t = await takeToasts(page); hd = await h(page, 5)
  const pt2 = await panelText(page)
  const info = await dayInfo(page, 5)
  console.log('A5 toast', JSON.stringify(t), 'head', hd.pending, 'info', info.slice(0, 160))
  check('d.A5/AM23 switch to Plan B: the toast reports the ONE difference, as the head does ("1 pending")', /1\s*pending/.test(hd.pending) && t.some(x => /1 difference from Original pending/.test(x)), `toast ${JSON.stringify(t)} · head "${hd.pending}" · panel "${(pt2.match(/Sat · [^A-Z]*/) || [''])[0].trim()}"`)
  check('d.A5/AM23 the ⓘ panel agrees with the head (1 unpublished edit)', /1 unpublished edit/.test(info), info.slice(0, 200))
  await clip(page, 'd-97-A5-sat-planB-after-switch', '#eWeek .day[data-day="5"] .day-head', { pad: 8, extraH: 120 })
  check('d.A5: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

if (part === 'all' || part === 'a27') {
  console.log('\n##### Astra 27 — content changes + an input filing, then Load the Original — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  /* two content changes on Tuesday (Original, nothing pending) */
  await editText(page, 'dn:1.0', 'A27 NOTE EDIT')
  const area = page.locator('#eWeek .day[data-day="1"] .areacell[data-area="1.0.0"]').first()
  await area.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await area.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('WEST', { delay: 15 }); await area.evaluate(e => e.blur()); await page.waitForTimeout(600)
  let hd = await h(page, 1)
  check('d.A27 setup: two content changes → "2 pending"', /2\s*pending/.test(hd.pending), hd.pending)
  /* an input filing: take Saint's accepted Appointment back off the day (its accept control on the board) */
  await board(page, 1)
  await openInputs(page, 1)
  const undoAcc = page.locator('#schedBoard [data-acc="x"][data-accd="1"]:visible').first()
  const had = await undoAcc.count()
  if (had) { await undoAcc.evaluate(e => e.scrollIntoView({ block: 'center' })); await undoAcc.click(); await page.waitForTimeout(700) }
  const tAcc = await takeToasts(page)
  await closeBoard(page); await editWeek(page)
  hd = await h(page, 1)
  const pt = await panelText(page)
  const tueLine = (pt.match(/Tue · [^A-Z]*/) || [''])[0].trim()
  note('d.A27 after un-accepting the Appointment', `accept control found ${had} · toast ${JSON.stringify(tAcc)} · head "${hd.pending}" · panel "${tueLine}"`)
  check('d.A27 the panel counts an input filing for Tue', /input filing/.test(tueLine), tueLine)
  const headN = nOf(hd.pending)
  /* look at the Original and press Load: the confirm must count only what the load DISCARDS */
  await lookAt(page, 1, /^Original/)
  await pvTap(page, 1, 'data-restore')
  let bar = await pvBar(page, 1)
  const confirmN = nOf(bar && bar.load)
  note('d.A27 the armed confirm', JSON.stringify(bar))
  check('d.A27 the confirm counts the content only — fewer than the head, which also counts the filing', bar && /Discard \d+ edits? & load — confirm/.test(bar.load) && confirmN < headN, `confirm ${confirmN} · head ${headN}`)
  await clip(page, 'd-98-A27-tue-armed', '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 90 })
  await pvTap(page, 1, 'data-restore')
  const t = await takeToasts(page); hd = await h(page, 1)
  const pt2 = await panelText(page)
  const tueLine2 = (pt2.match(/Tue · [^A-Z]*/) || [''])[0].trim()
  const inp = await page.evaluate(() => (window.INPUTS || []).filter(i => i && i.date === 'Jul 14' && i.type === 'Appointment').map(i => ({ person: i.person, acc: i.acc || null })))
  note('d.A27 after the load', `toast ${JSON.stringify(t)} · head "${hd.pending}" · panel "${tueLine2}" · the Appointment input ${JSON.stringify(inp)}`)
  check(`d.A27 the load says how many edits it replaced (${confirmN}), matching the confirm`, t.some(x => new RegExp(`${confirmN} unpublished edits? replaced`).test(x)), JSON.stringify(t))
  check('d.A27 the input filing STAYS after the load (the load replaces content, not filings)', /input filing/.test(tueLine2) && nOf(hd.pending) >= 1, `head "${hd.pending}" · panel "${tueLine2}"`)
  await clip(page, 'd-99-A27-tue-after-load', '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 90 })
  check('d.A27: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-09-oil-plan-and-filing') ? 1 : 0
