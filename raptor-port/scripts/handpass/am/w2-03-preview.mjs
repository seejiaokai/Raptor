/* w2-03 — LOOKING AT AN ISSUED VERSION, AND "LOAD ONTO WORKING COPY" (R14, S14, S18, S19, Astra 37).
   Rules: AM6 (load onto the working copy; viewers keep the issued version; the two-tap confirm), AM23 (one
   count), AM25 (the panel's Publish locked while previewing), AM28 (the selector's amber "👁 ALn", "← Back to
   live copy" on the week and the board, Publish AL hidden under a preview), AM37c (no Unpublish under a
   preview), AM51c (a past version shows no flags). RESTARM's own doctrine: "any navigation cancels it".
   Usage: node w2-03-preview.mjs [s18|s19|s14|all] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, board, closeBoard, check, note, summary, installToasts, takeToasts, h, bookDay, lookAt, altPlan, menu, menuClose, menuLook,
  pvBar, pvTap, audit, viewDay, viewPick, clip, screen, signDay, undoLabel, panelText, seatInert, editText, planMenuItems, STATE, DESK, PHONE } = L
const part = process.argv[2] || 'all'

/* what the week's day shows under a preview: every write door must be dead */
async function weekDoors(page, di) {
  return page.evaluate(i => {
    const s = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    const n = q => s.querySelectorAll(q).length
    return { cls: s.className, slot: n('[data-slot]'), ce: n('[contenteditable="true"]'), drag: n('[data-drag]'), fill: n('[data-fill]'),
      sign: n('.day-sign, select[data-sign]'), tpl: n('[data-daytplopen]'), alpub: n('[data-alpub]'), unpub: n('[data-unpub]'), beak: n('[data-beak]'),
      acc: n('[data-acc]'), warn: n('.dwbox, .daywarn'), rings: n('.boxred, .boxdash, .boxdot'), selector: (s.querySelector('.planselbtn') || {}).innerText || '',
      selPv: !!s.querySelector('.planselbtn.pv'), tag: (s.querySelector('.verchip') || {}).innerText || '', pend: (s.querySelector('.dpend') || {}).innerText || '' }
  }, di)
}
async function boardDoors(page) {
  return page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const vis = q => [...b.querySelectorAll(q)].filter(e => e.offsetWidth || e.offsetHeight)
    const dis = id => { const e = document.querySelector(id); return e ? (e.offsetWidth ? (e.disabled ? 'disabled' : 'ENABLED') : 'hidden') : 'absent' }
    return { tpl: dis('#sbTpl'), sortAll: dis('#sbSortAll'), oil: dis('#sbOil'), signBar: vis('#sbSignBar').length, selector: vis('[data-planmenu]').length,
      tag: vis('.verchip').length, slot: vis('#sbBoard [data-slot], [data-slot]').length, liveInputs: vis('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])').filter(e => !e.closest('#sbRoster') && !e.closest('.sb-top') && e.id !== 'sbSearch').length,
      fill: vis('[data-fill]').length, alpub: vis('[data-alpub]').length, unpub: vis('[data-unpub]').length, warnList: vis('#sbWarn .wrow, #sbWarn li').length,
      bar: vis('.dprev-bar').map(x => x.innerText.replace(/\s+/g, ' ').trim()).join(' / ') }
  })
}

/* ======================= S18 — load the CURRENT version with nothing pending ================== */
if (part === 'all' || part === 's18') for (const w of ['desktop', 'phone']) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### S18 — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page); await editWeek(page)
  const bk0 = JSON.stringify(await bookDay(page, 1)), u0 = await undoLabel(page)
  check(`${P}.S18 look at Tue's Original (menu → Issued · read-only)`, await lookAt(page, 1, /^Original/))
  let bar = await pvBar(page, 1); let hd = await h(page, 1)
  console.log('S18 bar', JSON.stringify(bar), 'head', JSON.stringify(hd))
  check(`${P}.R14 the bar says what it is: "👁 Viewing the issued Original — read-only…" with "← Back to live copy" and "Load onto working copy"`,
    bar && /Viewing the issued Original — read-only\. This is what was sent out; it never changes\./.test(bar.text) && bar.back === '← Back to live copy' && bar.load === 'Load onto working copy', JSON.stringify(bar))
  check(`${P}.R14/AM28 the selector reads the amber "👁 Original"; the tag still names the live ORIG`, /👁 Original/.test(hd.selector) && hd.tag === 'ORIG', `${hd.selector.trim()} · ${hd.tag}`)
  await clip(page, `${P}-40-S18-tue-preview-original`, '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 70 })
  await pvTap(page, 1, 'data-restore')
  const t = await takeToasts(page); bar = await pvBar(page, 1); hd = await h(page, 1)
  check(`${P}.S18 Load of the CURRENT version with nothing pending says so ("… is already at Original") and closes the preview (AM6)`,
    t.some(x => /is already at Original/.test(x)) && !bar && /Live working copy/.test(hd.selector), `toast ${JSON.stringify(t)} bar ${JSON.stringify(bar)} sel ${hd.selector.trim()}`)
  check(`${P}.S18 nothing changed and no undo step was added`, JSON.stringify(await bookDay(page, 1)) === bk0 && (await undoLabel(page)) === u0, `undo "${u0}" → "${await undoLabel(page)}"`)
  check(`${P}.S18: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= S19 — every write door is dead under a preview (week, board, panel) === */
if (part === 'all' || part === 's19') {
  console.log('\n##### S19 — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  await signDay(page, 0)
  let hd = await h(page, 0)
  check('d.S19 setup: Mon signed on the live copy → "Publish AL2" enabled', hd.alpub && !hd.alpub.disabled, JSON.stringify(hd.alpub))
  const live = await weekDoors(page, 0)
  note('d.S19 the LIVE Mon for comparison', JSON.stringify(live))
  let pt = await panelText(page)
  check('d.S19 the panel offers Mon\'s Publish AL2 (signed, live)', /Mon · 1 change/.test(pt), pt.slice(0, 200))
  const panelBtn = () => page.evaluate(() => { const r = [...document.querySelectorAll('#alPanel .al-pubday')].find(x => /Mon/.test(x.innerText)); const b = r && r.querySelector('button'); return b ? { disabled: b.disabled, title: b.title, cls: b.className } : null })
  check('d.S19 the panel\'s Mon button is enabled while live', (await panelBtn())?.disabled === false, JSON.stringify(await panelBtn()))
  /* look at Mon's Original on the WEEK */
  check('d.S19 look at Mon\'s Original', await lookAt(page, 0, /^Original/))
  const pv = await weekDoors(page, 0)
  console.log('S19 week under preview', JSON.stringify(pv))
  check('d.S19/AM28 week head under a preview: no Publish AL, no Unpublish, no Publish day', pv.alpub === 0 && pv.unpub === 0 && pv.beak === 0, JSON.stringify({ alpub: pv.alpub, unpub: pv.unpub, beak: pv.beak }))
  check('d.S19 week under a preview: no sign strip, no Templates', pv.sign === 0 && pv.tpl === 0, JSON.stringify({ sign: pv.sign, tpl: pv.tpl }))
  check('d.S19 week under a preview: no seat, drop zone, drag handle or editable text', pv.slot === 0 && pv.fill === 0 && pv.drag === 0 && pv.ce === 0 && pv.acc === 0, JSON.stringify(pv))
  check('d.S19/Astra37 a past version shows no warnings list and no flag rings (AM51c)', pv.warn === 0 && pv.rings === 0, `warn ${pv.warn} rings ${pv.rings} (live: warn ${live.warn} rings ${live.rings})`)
  const inert = await seatInert(page, '#eWeek .day[data-day="0"]')
  check('d.S19 a seat in the preview: tap arms nothing, right-click clears nothing', inert.ok, JSON.stringify(inert))
  /* type at the frozen note */
  const before = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
  const noteEl = page.locator('#eWeek .day[data-day="0"] .allhands').first()
  await noteEl.click({ position: { x: 60, y: 30 } }); await page.keyboard.type('ZZZ'); await page.waitForTimeout(400)
  check('d.S19 typing at the frozen note changes nothing', before === await page.evaluate(() => JSON.stringify(window.DAYS[0])))
  const pb = await panelBtn()
  check('d.S19/AM25 the panel\'s Mon "Publish AL2" is LOCKED while Mon is previewed, and says why', pb && pb.disabled && /viewing a past version/.test(pb.title), JSON.stringify(pb))
  await screen(page, 'd-41-S19-week-preview-original-and-panel')
  /* ← Back to live copy (week) */
  await pvTap(page, 0, 'data-golive')
  hd = await h(page, 0)
  check('d.R14 "← Back to live copy" on the WEEK returns to the live copy (bar gone, selector "Live working copy", Publish AL2 back)', !(await pvBar(page, 0)) && /Live working copy/.test(hd.selector) && hd.alpub, `${hd.selector.trim()} alpub ${JSON.stringify(hd.alpub)}`)
  /* the BOARD: open it live, then look at the Original from the board's own selector */
  await board(page, 0)
  await planMenuItems(page, 0)
  check('d.S19 look at the Original from the BOARD\'s selector', await menuLook(page, /^Original/))
  const bd = await boardDoors(page)
  console.log('S19 board under preview', JSON.stringify(bd))
  check('d.S19 board under a preview: Templates, Sort all (and OIL Earn if drawn) disabled', bd.tpl === 'disabled' && bd.sortAll === 'disabled' && (bd.oil === 'disabled' || bd.oil === 'absent'), JSON.stringify({ tpl: bd.tpl, sortAll: bd.sortAll, oil: bd.oil }))
  check('d.S19 board under a preview: no sign strip, no Publish AL, no Unpublish', bd.signBar === 0 && bd.alpub === 0 && bd.unpub === 0, JSON.stringify(bd))
  check('d.S19 board under a preview: no seat address, no drop zone, no live field', bd.slot === 0 && bd.fill === 0 && bd.liveInputs === 0, JSON.stringify({ slot: bd.slot, fill: bd.fill, liveInputs: bd.liveInputs }))
  check('d.R14 board under a preview: the bar with "← Back to live copy" and "Load onto working copy"', /Viewing the issued Original/.test(bd.bar) && /Back to live copy/.test(bd.bar) && /Load onto working copy/.test(bd.bar), bd.bar)
  check('d.R14/AM28 board under a preview still shows the plans selector (amber "👁 Original") and the version tag, as the week does', bd.selector > 0 && bd.tag > 0, `selector ${bd.selector} tag ${bd.tag}`)
  const binert = await seatInert(page, '#schedBoard .pv-frozen')
  check('d.S19 a board seat in the preview: tap arms nothing, right-click clears nothing', binert.ok, JSON.stringify(binert))
  /* a drag from the crew palette onto a frozen seat */
  const beforeB = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
  const src = page.locator('#sbRoster .rpuck:visible').first(), dst = page.locator('#schedBoard .pv-frozen .seat:visible').nth(1)
  if (await src.count() && await dst.count()) {
    const a = await src.boundingBox(), b = await dst.boundingBox()
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.mouse.move(a.x + 20, a.y + 10, { steps: 4 })
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(600)
  }
  check('d.S19 a drag from the crew palette onto a frozen seat changes nothing', beforeB === await page.evaluate(() => JSON.stringify(window.DAYS[0])))
  await screen(page, 'd-42-S19-board-preview-original')
  pt = await panelBtn()
  check('d.S19/AM25 the panel\'s Mon button is locked while the BOARD previews Mon', pt && pt.disabled, JSON.stringify(pt))
  /* ← Back to live copy (board) */
  await pvTap(page, 0, 'data-golive')
  const bl = await boardDoors(page)
  check('d.R14 "← Back to live copy" on the BOARD returns to the live copy (sign strip, selector, Publish AL2 back)', !bl.bar && bl.signBar > 0 && bl.alpub > 0, JSON.stringify({ bar: bl.bar, signBar: bl.signBar, alpub: bl.alpub }))
  await closeBoard(page); await editWeek(page)
  /* "+ Alt Plan" from the menu while previewing drops the preview */
  await lookAt(page, 0, /^Original/)
  await planMenuItems(page, 0)
  await L.menuAlt(page)
  const t = await takeToasts(page); hd = await h(page, 0)
  check('d.S19 "+ Alt Plan" chosen while previewing drops the preview and makes Plan B live', !(await pvBar(page, 0)) && /Plan B/.test(hd.selector), `bar ${JSON.stringify(await pvBar(page, 0))} sel ${hd.selector.trim()} toast ${JSON.stringify(t)}`)
  check('d.S19: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= S19 at 390px — the week and the phone board (the Amendments panel is hidden
   under 820px, so its lock is a desktop-only check) ============================================== */
if (part === 'all' || part === 's19p') {
  console.log('##### S19 — phone 390 #####')
  const { browser, page, errors } = await open({ ...PHONE, state: STATE })
  await installToasts(page); await editWeek(page)
  await signDay(page, 0)
  check("p.S19 look at Mon's Original on the phone week", await lookAt(page, 0, /^Original/))
  const pv = await weekDoors(page, 0)
  check('p.S19 phone week under a preview: no Publish AL / Unpublish / sign strip / Templates / seat / drop zone / editable text', pv.alpub === 0 && pv.unpub === 0 && pv.beak === 0 && pv.sign === 0 && pv.tpl === 0 && pv.slot === 0 && pv.fill === 0 && pv.ce === 0 && pv.drag === 0, JSON.stringify(pv))
  check('p.S19/Astra37 phone: a past version shows no warnings list and no flag rings', pv.warn === 0 && pv.rings === 0, `warn ${pv.warn} rings ${pv.rings}`)
  const inert = await seatInert(page, '#eWeek .day[data-day="0"]')
  check('p.S19 phone: a seat in the preview is inert', inert.ok, JSON.stringify(inert))
  await clip(page, 'p-47-S19-phone-week-preview', '#eWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 160 })
  await pvTap(page, 0, 'data-golive')
  check('p.R14 phone week "← Back to live copy" returns to the live copy', !(await pvBar(page, 0)) && /Live working copy/.test((await h(page, 0)).selector))
  await board(page, 0)
  await planMenuItems(page, 0); await menuLook(page, /^Original/)
  const bd = await boardDoors(page)
  console.log('S19p board', JSON.stringify(bd))
  check('p.S19 phone board under a preview: Templates and Sort all disabled; no sign strip, Publish AL, Unpublish, seat address, drop zone or live field', bd.tpl !== 'ENABLED' && bd.sortAll !== 'ENABLED' && bd.signBar === 0 && bd.alpub === 0 && bd.unpub === 0 && bd.slot === 0 && bd.fill === 0 && bd.liveInputs === 0, JSON.stringify(bd))
  check('p.R14/AM28 phone board under a preview still shows the plans selector and the version tag, as the week does', bd.selector > 0 && bd.tag > 0, `selector ${bd.selector} tag ${bd.tag}`)
  const binert = await seatInert(page, '#schedBoard .pv-frozen')
  check('p.S19 phone board: a frozen seat is inert', binert.ok, JSON.stringify(binert))
  await screen(page, 'p-48-S19-phone-board-preview')
  await pvTap(page, 0, 'data-golive')
  const bl = await boardDoors(page)
  check('p.R14 phone board "← Back to live copy" returns to the live copy (sign strip and selector back)', !bl.bar && bl.signBar > 0 && bl.selector > 0, JSON.stringify({ bar: bl.bar, signBar: bl.signBar, selector: bl.selector }))
  check('p.S19: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= S14 — the two-tap confirm, desktop → 390px, week and board ============ */
if (part === 'all' || part === 's14') {
  console.log('\n##### S14 — desktop → phone #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  /* Mon at AL1 with 3 pending: the time (fixture) + the note + the area */
  await editText(page, 'dn:0.0', 'MON NOTE — W2 EDIT')
  const area = page.locator('#eWeek .day[data-day="0"] .areacell[data-area="0.0.0"]').first()
  await area.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await area.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('WEST', { delay: 15 }); await area.evaluate(e => e.blur()); await page.waitForTimeout(600)
  let hd = await h(page, 0)
  check('d.S14 setup: Mon reads "3 pending"', /3\s*pending/.test(hd.pending), hd.pending)
  await lookAt(page, 0, /^Original/)
  await pvTap(page, 0, 'data-restore')
  let bar = await pvBar(page, 0); hd = await h(page, 0)
  check('d.S14/AM6 first tap ARMS: "Discard 3 edits & load — confirm" + "Keep editing" (nothing loaded yet)', bar && bar.load === 'Discard 3 edits & load — confirm' && bar.keep === 'Keep editing', JSON.stringify(bar))
  check('d.S14/AM23 the confirm count agrees with the head ("3 pending")', /3\s*pending/.test(hd.pending), hd.pending)
  await clip(page, 'd-43-S14-week-armed-desktop', '#eWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 90 })
  /* armed, then change WEEK and back (desktop — the phone bar has no week chips): the preview and its arm reset */
  await page.locator('[data-wk]:visible').filter({ hasText: /Jul 20/ }).first().click(); await page.waitForTimeout(900)
  await page.locator('[data-wk]:visible').filter({ hasText: /Jul 13/ }).first().click(); await page.waitForTimeout(900)
  bar = await pvBar(page, 0)
  check('d.S11 a week change and back clears the preview and its arm', !bar, JSON.stringify(bar))
  hd = await h(page, 0)
  check('d.S14 the week change kept the 3 unpublished edits (persisted working copy)', /3\s*pending/.test(hd.pending), hd.pending)
  await lookAt(page, 0, /^Original/); await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check('d.S14 re-armed before narrowing the window', bar && /Discard 3 edits/.test(bar.load), JSON.stringify(bar))
  /* narrow the SAME session to 390px */
  await page.setViewportSize(PHONE); await page.waitForTimeout(900)
  await page.locator('#eWeek .day[data-day="0"]').evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await page.waitForTimeout(400)
  let au = await audit(page, '#eWeek .day[data-day="0"] .dprev-bar', ['[data-golive]', '[data-restore]', '[data-restcancel]'])
  console.log('S14 week bar @390', JSON.stringify(au))
  check('p.S14 at 390px the armed bar keeps all three buttons on screen, uncovered, not overlapping', au.items && au.items.length === 3 && au.items.every(i => i.inside && i.hit) && au.over.length === 0, JSON.stringify(au))
  await clip(page, 'p-44-S14-week-armed-390', '#eWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 150 })
  /* Keep editing → the arm clears, the preview stays */
  await pvTap(page, 0, 'data-restcancel')
  bar = await pvBar(page, 0)
  check('p.S11/S14 "Keep editing" clears the arm (button back to "Load onto working copy"), preview stays', bar && bar.load === 'Load onto working copy' && !bar.keep, JSON.stringify(bar))
  /* arm again, then NAVIGATE (to View-only Sched and back): RESTARM's doctrine — any navigation cancels it */
  await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check('p.S14 armed again', bar && /Discard 3 edits/.test(bar.load), JSON.stringify(bar))
  await go(page, 'viewsched'); await go(page, 'editsched'); await page.waitForTimeout(300)
  bar = await pvBar(page, 0)
  note('p.S11 after a page change and back', JSON.stringify(bar))
  check('p.S11 a page change cancels the armed confirm ("any navigation cancels it")', !bar || !bar.keep, JSON.stringify(bar))
  /* Back to live clears the arm and the preview */
  if (bar) await pvTap(page, 0, 'data-golive')
  bar = await pvBar(page, 0); hd = await h(page, 0)
  check('p.S11 "← Back to live copy" drops the preview (and the arm with it)', !bar && /Live working copy/.test(hd.selector), hd.selector.trim())
  await lookAt(page, 0, /^Original/)
  bar = await pvBar(page, 0)
  check('p.S11 re-opening the preview starts un-armed', bar && bar.load === 'Load onto working copy', JSON.stringify(bar))
  /* arm, then look at a different version from the selector: the arm must not follow */
  await pvTap(page, 0, 'data-restore')
  await planMenuItems(page, 0); await menuLook(page, /^AL1/)
  bar = await pvBar(page, 0)
  check('p.S11 arming on Original then switching the preview to AL1 leaves AL1 un-armed', bar && /Viewing the issued AL1/.test(bar.text) && bar.load === 'Load onto working copy', JSON.stringify(bar))
  /* the BOARD at 390: under a preview the day's date opens the day details, not the board — so back to
     live first, open the board, then look at the Original from the board's own selector, arm */
  await pvTap(page, 0, 'data-golive')
  await board(page, 0)
  await planMenuItems(page, 0); await menuLook(page, /^Original/)
  await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check('p.S14 the phone BOARD arms the same way: "Discard 3 edits & load — confirm" + "Keep editing"', bar && bar.surface === 'board' && bar.load === 'Discard 3 edits & load — confirm' && bar.keep === 'Keep editing', JSON.stringify(bar))
  au = await audit(page, '#schedBoard', ['.dprev-bar [data-golive]', '.dprev-bar [data-restore]', '.dprev-bar [data-restcancel]'])
  console.log('S14 board bar @390', JSON.stringify(au))
  check('p.S14 on the phone board all three buttons are on screen, uncovered, not overlapping', au.items && au.items.length === 3 && au.items.every(i => i.inside && i.hit) && au.over.length === 0, JSON.stringify(au))
  const barTop = await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => x.offsetWidth); return b ? Math.round(b.getBoundingClientRect().top) : null })
  note('p.S14 the board bar sits at y', String(barTop))
  await screen(page, 'p-45-S14-board-armed-390')
  /* the SECOND tap loads: the working copy becomes the Original's content; viewers still see AL1 */
  await pvTap(page, 0, 'data-restore')
  const t = await takeToasts(page)
  bar = await pvBar(page, 0); hd = await h(page, 0)
  check('p.S14/AM6 the second tap loads the Original onto the working copy and says so, naming what viewers still see',
    !bar && t.some(x => /Original loaded onto the working copy — viewers still see AL1 until you publish · 3 unpublished edits replaced/.test(x)), `toast ${JSON.stringify(t)}`)
  check('p.S14/AM6 the tag still says AL1; the head now counts the Original-vs-AL1 difference ("1 pending")', hd.tag === 'AL1' && /1\s*pending/.test(hd.pending), `${hd.tag} ${hd.pending}`)
  await screen(page, 'p-46-S14-board-after-load-390')
  await closeBoard(page)
  let v = await viewDay(page, 0)
  check('p.S14/AM6 the view page still shows "AL1 — as issued" with AL1\'s note', v.picker && v.picker.opts[0] === '*AL1 — as issued' && await page.evaluate(() => document.querySelector('#vWeek .day[data-day="0"]').innerText.includes('MON NOTE — AL1')), JSON.stringify(v.picker))
  /* S18 on a published AL1 day: load AL1 over the one difference (armed), then load AL1 again → "already at AL1" */
  await editWeek(page)
  await lookAt(page, 0, /^AL1/)
  await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check('p.S18 AL1 with 1 difference pending arms first ("Discard 1 edit & load — confirm")', bar && bar.load === 'Discard 1 edit & load — confirm', JSON.stringify(bar))
  await pvTap(page, 0, 'data-restore')
  hd = await h(page, 0)
  check('p.S18 confirmed: Mon is back at AL1 with nothing pending', !hd.pending && hd.tag === 'AL1', JSON.stringify({ pend: hd.pending, tag: hd.tag }))
  const u0 = await undoLabel(page); await takeToasts(page)
  await lookAt(page, 0, /^AL1/)
  await pvTap(page, 0, 'data-restore')
  const t2 = await takeToasts(page)
  check('p.S18 loading AL1 again with nothing pending: "Monday is already at AL1", preview closed, no undo step', t2.some(x => /is already at AL1/.test(x)) && !(await pvBar(page, 0)) && (await undoLabel(page)) === u0, `toast ${JSON.stringify(t2)} undo "${u0}"→"${await undoLabel(page)}"`)
  check('S14: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-03-preview') ? 1 : 0
