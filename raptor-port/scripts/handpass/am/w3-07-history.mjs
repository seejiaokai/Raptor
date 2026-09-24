/* w3-07 — S35 (Fable): the Edit history after a session that publishes, amends, unpublishes, loads a version and
   switches plans, at desktop AND phone. Records which of those left a line and which did not, and what the
   mark titles and the History bubble say on a pending and an issued detail.
     Register: AM49 (the list records who changed which detail, when and what it was before; this sitting only),
     AM35 (a correction nobody else saw is silent — no line for Unpublish is by rule), AM39b (the undo bubble).
   Usage: node w3-07-history.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, signDay, publishDay, publishAL, editText, shot, menuLook, tapUnpub,
  histList, pressHist, board, closeBoard, planMenuItems, planMenuPick } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']

for (const w of which) {
  const { check, note, summary } = checker('w3-07 ' + w)
  const P = s => `w3-07-${w}-${s}`
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const said = {}
  try {
    await editWeek(page)
    const titles0 = await page.evaluate(() => ({
      issued: [...document.querySelectorAll('#eWeek [data-alc]')].filter(e => !e.classList.contains('verchip')).slice(0, 3).map(e => `${(e.innerText || e.value || '').trim().slice(0, 24)} → "${e.title}"`),
      pending: [...document.querySelectorAll('#eWeek [data-alp]')].slice(0, 3).map(e => `${(e.innerText || e.value || '').trim().slice(0, 24)} → "${e.title}"`) }))
    note('S35 mark titles at the start (Monday AL1 + a pending change)', titles0)
    check('S35: an issued mark\'s title says which AL changed it ("Changed at AL1")', titles0.issued.length > 0 && titles0.issued.every(t => /Changed at AL\d/.test(t)), JSON.stringify(titles0.issued))
    /* 1 Publish day (Friday) */
    await signDay(page, 4); await publishDay(page, 4); said.publishDay = await toasts(page)
    /* 2 an edit on Tuesday, then Publish AL1 */
    await editText(page, 'dn:1.0', 'S35 TUESDAY CHANGE'); await signDay(page, 1); await publishAL(page, 1); said.publishAL = await toasts(page)
    /* 3 Unpublish Tuesday's AL1 */
    await tapUnpub(page, 1); said.unpublish = await toasts(page)
    /* 4 Monday: look at its Original, Load onto working copy (two taps — it carries a pending change) */
    await menuLook(page, 0, /^Original/)
    const ld = page.locator('#eWeek [data-restore="0"]:visible').first()
    if (await ld.count()) { await ld.click(); await page.waitForTimeout(500) }
    const ld2 = page.locator('#eWeek [data-restore="0"]:visible').first()
    if (await ld2.count()) { await ld2.click(); await page.waitForTimeout(700) }
    said.load = await toasts(page)
    /* 5 Thursday: switch to Plan B */
    await planMenuItems(page, 3); await planMenuPick(page, /^Plan B/); said.switchPlan = await toasts(page)
    /* 6 Friday (published): + Alt Plan */
    await planMenuItems(page, 4); await planMenuPick(page, /\+ Alt Plan/); said.altPlan = await toasts(page)
    /* 7 an Undo and a Redo */
    const u = await pressHist(page, 'undo'), r = await pressHist(page, 'redo'); said.undo = u.toasts; said.redo = r.toasts
    note('what each action said (toasts)', said)
    const hl = await histList(page, P('a-edit-history'))
    note('S35 the Edit history rows', hl.rows)
    note('S35 footnote', hl.foot)
    const rows = (hl.rows || []).join(' ¶ ')
    check('AM49: the day-note edit is listed (who, when, what it was before)', /Day note.*→.*S35 TUESDAY CHANGE/i.test(rows), rows.slice(0, 300))
    check('S35: "loaded onto the working copy" is listed', /loaded onto the working copy/i.test(rows), '')
    check('S35: the plan switch is listed', /Switched to "Plan/i.test(rows), '')
    check('S35: the new plan is listed', /Plan .* created/i.test(rows), '')
    check('R12/AM49: every Edit history line fits the list (none is cut off at the right edge)', !(hl.clipped || []).length, JSON.stringify(hl.clipped))
    const R = hl.rows || []
    note('S35 (record): a line for Publish day / Publish AL1 / Unpublish / Undo-Redo?', {
      publishDay: R.filter(x => /published — APPROVED|Publish day|published as|was published/i.test(x)).length || 'NONE',
      publishAL: R.filter(x => /Published AL\d|Publish AL\d|issued as AL/i.test(x)).length || 'NONE',
      unpublish: R.filter(x => /Unpublish(?!ed edit)|pulled back|taken back|withdrawn/i.test(x)).length || 'NONE (silent by AM35)',
      undoRedo: R.filter(x => /^\w+\s+(Undo|Redo)|Undid|Redid/i.test(x)).length || 'NONE' })

    /* the mark titles on the edit week: an issued mark (Monday's AL1 note was loaded away — use Sunday? find any) and a pending one */
    const titles = await page.evaluate(() => ({
      issued: [...document.querySelectorAll('#eWeek [data-alc]')].filter(e => !e.classList.contains('verchip')).slice(0, 3).map(e => `${(e.innerText || '').trim().slice(0, 24)} → "${e.title}"`),
      pending: [...document.querySelectorAll('#eWeek [data-alp]')].slice(0, 4).map(e => `${(e.innerText || e.value || '').trim().slice(0, 24)} → "${e.title}"`) }))
    note('S35 mark titles on the edit week', titles)
    check('S35: a pending mark\'s title says which AL it goes out as ("Edited — goes out as ALn")', titles.pending.length > 0 && titles.pending.every(t => /Edited — goes out as AL\d/.test(t)), JSON.stringify(titles.pending))

    /* the History bubble on the board: Tuesday's note (edited this sitting) */
    await board(page, 1)
    await page.locator('#schedBoard #sbHist:visible').click(); await page.waitForTimeout(400)
    const cell = page.locator('#schedBoard [data-txt="dn:1.0"]:visible, #schedBoard [data-bfld="dn:1.0"]:visible, #schedBoard textarea[data-key="dn:1.0"]:visible').first()
    let bub = 'NO CELL'
    if (await cell.count()) {
      await cell.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
      if (w === 'phone') await cell.tap().catch(async () => { await cell.click() }); else await cell.hover()
      await page.waitForTimeout(600)
      bub = await page.evaluate(() => { const b = document.querySelector('.histbub'); return b && b.offsetWidth ? (b.innerText || '').replace(/\s+/g, ' ').trim() : 'NO BUBBLE' })
      await shot(page, P('b-board-history-bubble'))
    }
    note('S35 the History bubble on Tuesday\'s note', bub)
    check('AM49: with History on, the note tells its story (what it was, who, when)', /S35 TUESDAY CHANGE|ORDERS/.test(bub), bub)
    await page.locator('#schedBoard #sbHist:visible').click(); await page.waitForTimeout(300)
    await closeBoard(page)
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
