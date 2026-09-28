/* Walker A2 — inputs, the plan and the posting against the one Undo (28 Sep 26, Phase A of the change-recording re-test).
   Each scenario on its own fresh demo world.
   I1  Fable S9 + Astra 21 — the member's only door: Ranger files an LL for Wed 15 Jul on the Inputs page → the Leave
       War's Undo ("Undid: a personal input") → the Inputs table and View-only Sched's Unavailable no longer show it (the
       view stays on the war) → Redo brings it back → a reload keeps it; the history is session-only (both buttons off).
   I2  Fable S10 — an off-week input: Saber files an LL for Ranger on Tue 21 Jul (week 2, not loaded) → week 2 → Undo:
       it works, or it says "That change is on the saved copy of this week. Open a different week first, then undo it." →
       then week 1 → Undo → gone; week 2 again → no row on Tue 21.
   I3  Astra 24 — a plan change (the planning calendar's day title) then a schedule change (a note): Undo twice from the
       Leave War (schedule first, then the plan), Redo twice from the board (plan first, then the schedule).
   I4  Fable S31 — "Undo post out (PO)" against the app's Undo: a bid, then Echo posted out from 14 Oct → the war's Undo
       passes over the posting (D350: not an Undo step) and takes the BID back; the posting stays; the sheet's own
       "Undo post out (PO)" takes the posting back.
   Usage (from raptor-port/): node scripts/handpass/cr-a2-inputs.mjs [desktop|phone] [I1,I2,I3,I4] */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { PHONE, openA2, book, door, doorState, toasts, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, go,
  fileInput, inputsOf, inputsWindow, readUnav, login, spy, toWeek, closeBoardIfOpen } = L
const ONLY = (process.argv[3] || 'I1,I2,I3,I4').split(',')
const B = book('inputs')
const allErrors = []
let page
async function step(id, fn) {
  try { await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), page ? await B.shot(page, `THREW-${id}`) : '') }
  try { await closeSheets(page) } catch { }
}
const rowShown = async (iid) => (await page.locator(`#inBody tr[data-iid="${iid}"]`).count()) > 0
const unavTxt = async (sel) => JSON.stringify(await readUnav(page, sel))
async function frameDay(sel) { const d = page.locator(sel).first(); if (await d.count()) { await d.evaluate(e => { const u = e.querySelector('.sec-unav') || e; u.scrollIntoView({ block: 'center', inline: 'center' }) }); await page.waitForTimeout(300) } }

/* ============ I1 — the member's only door ============ */
if (ONLY.includes('I1')) {
  const o = await openA2('m'); page = o.page
  await step('I1', async () => {
    const f = await fileInput(page, { from: '2026-07-15', type: 'LL', remarks: 'A2 S9 LL' })
    const iid = f.iid
    await inputsWindow(page, '2026-07-13', '2026-07-19')
    const listed0 = await rowShown(iid)
    const p0 = await B.shot(page, 'I1-member-filed-on-inputs')
    await go(page, 'viewsched'); await page.waitForTimeout(400)
    const u0 = await unavTxt('#vWeek .day[data-day="2"]')
    await frameDay('#vWeek .day[data-day="2"]')
    const p0b = await B.shot(page, 'I1-view-wed-unavailable-shows-it')
    B.ck('I1-file', 'Ranger files an LL on Wed 15 Jul on the Inputs page: listed there and under Wednesday\'s Unavailable', f.added === 1 && listed0 && /LL/.test(u0), { f, listed: listed0, unav: u0 }, `${p0}, ${p0b}`)
    await lwOpen(page, '2026-07-15')
    const ds = await doorState(page, 'lw')
    const u = await door(page, 'lw', 'undo')
    const where = await page.evaluate(() => window.CURPAGE)
    const p1 = await B.shot(page, 'I1-lw-undo')
    const gone = !(await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid))
    B.ck('I1-undo', 'the war\'s Undo (his only door) names it and takes it back: "Undid: a personal input"; the view stays on the war (no jump — GU-E5)',
      u.pressed && gone && (u.toasts || []).some(t => /^Undid: a personal input/.test(t)) && /personal input/.test(ds.undo), { door: ds, toasts: u.toasts, gone, page: where }, p1)
    await inputsWindow(page, '2026-07-13', '2026-07-19')
    const listed1 = await rowShown(iid)
    const p2 = await B.shot(page, 'I1-inputs-after-undo')
    await go(page, 'viewsched'); await page.waitForTimeout(400)
    const u1 = await unavTxt('#vWeek .day[data-day="2"]')
    await frameDay('#vWeek .day[data-day="2"]')
    const p2b = await B.shot(page, 'I1-view-wed-after-undo')
    B.ck('I1-gone', 'after the Undo the Inputs table and Wednesday\'s Unavailable no longer show it', !listed1 && !/Ranger|bane/.test(u1.replace(/bane.*?:/, '')) && !/LL:bane/.test(u1), { listed: listed1, unav: u1 }, `${p2}, ${p2b}`)
    await lwOpen(page, '2026-07-15')
    const r = await door(page, 'lw', 'redo')
    const back = await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid)
    const p3 = await B.shot(page, 'I1-lw-redo')
    B.ck('I1-redo', 'Redo brings it back ("Redid: a personal input")', r.pressed && back && (r.toasts || []).some(t => /^Redid: a personal input/.test(t)), { toasts: r.toasts, back }, p3)
    await page.reload(); await page.waitForTimeout(1200)
    if (await page.locator('#luser:visible').count()) await login(page, 'm')
    await spy(page)
    await lwOpen(page, '2026-07-15')
    const after = await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid)
    const ds2 = await doorState(page, 'lw')
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
    const p4 = await B.shot(page, 'I1-after-reload')
    await inputsWindow(page, '2026-07-13', '2026-07-19')
    const listed2 = await rowShown(iid)
    const p4b = await B.shot(page, 'I1-inputs-after-reload')
    B.ck('I1-reload', 'a reload keeps the redone input (listed on the Inputs page); Undo and Redo are off (the history is per sign-in)', after && listed2 && /^off/.test(ds2.undo) && /^off/.test(ds2.redo), { kept: after, listed: listed2, doors: ds2 }, `${p4}, ${p4b}`)
  })
  allErrors.push(...o.errors); await o.browser.close()
}

/* ============ I2 — an off-week input, undone from the other week ============ */
if (ONLY.includes('I2')) {
  const o = await openA2('a'); page = o.page
  await step('I2', async () => {
    const f = await fileInput(page, { person: 'bane', from: '2026-07-21', type: 'LL', remarks: 'A2 S10 off-week LL' })
    const iid = f.iid
    B.ck('I2-file', 'Saber files an LL for Ranger on Tue 21 Jul (week 2, not loaded)', f.added === 1, f, await B.shot(page, 'I2-filed'))
    await go(page, 'editsched')
    const wk2 = page.locator('#weekBar [data-wk], [data-wk]', { hasText: 'Jul 20' }).first()
    let how = 'the week button "Jul 20"'
    if (!PHONE && await wk2.count() && await wk2.isVisible()) { await wk2.click(); await page.waitForTimeout(800) } else { await toWeek(page, '20/07/2026'); how = 'the week loaded through the bridge (no week button on a phone bar)' }
    const wkNow = await page.evaluate(() => window.CURWEEK)
    const ds = await doorState(page, 'top')
    const u = await door(page, 'top', 'undo')
    const still = await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid)
    const wkAfter = await page.evaluate(() => window.CURWEEK)
    await go(page, 'editsched'); await frameDay('#eWeek .day[data-day="1"]')
    const tue = await unavTxt('#eWeek .day[data-day="1"]')
    const p1 = await B.shot(page, 'I2-undo-on-week2')
    const refused = (u.toasts || []).some(t => /saved copy of this week/.test(t))
    const worked = (u.toasts || []).some(t => /^Undid/.test(t)) && !still
    B.ck('I2-week2', 'on week 2, Undo either takes the filing back or says plainly to open a different week first (never a wrong or silent result)',
      u.pressed && (worked || (refused && still)), { how, week: wkNow, door: ds, toasts: u.toasts, stillFiled: still, weekAfter: wkAfter, tueUnav: tue }, p1)
    if (refused) {
      const wk1 = page.locator('[data-wk]', { hasText: 'Jul 13' }).first()
      if (!PHONE && await wk1.count() && await wk1.isVisible()) { await wk1.click(); await page.waitForTimeout(800) } else await toWeek(page, '13/07/2026')
      const u2 = await door(page, 'top', 'undo')
      const gone = !(await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid))
      const p2 = await B.shot(page, 'I2-undo-on-week1')
      B.ck('I2-week1', 'back on week 1 the Undo takes the off-week filing back', u2.pressed && gone && (u2.toasts || []).some(t => /^Undid/.test(t)), { toasts: u2.toasts, gone }, p2)
    }
    await toWeek(page, '20/07/2026'); await go(page, 'editsched'); await frameDay('#eWeek .day[data-day="1"]')
    const tue2 = await unavTxt('#eWeek .day[data-day="1"]')
    const p3 = await B.shot(page, 'I2-week2-tue-no-row')
    B.ck('I2-row', 'week 2 opened again: Tue 21 Jul carries no row for Ranger\'s filing', !/bane/.test(tue2), { tue: tue2 }, p3)
    await page.reload(); await page.waitForTimeout(1200)
    if (await page.locator('#luser:visible').count()) await login(page, 'a')
    await toWeek(page, '20/07/2026'); await go(page, 'editsched')
    const tue3 = await unavTxt('#eWeek .day[data-day="1"]')
    B.ck('I2-reload', 'after a reload still no row on Tue 21 Jul', !/bane/.test(tue3) && !(await page.evaluate(i => window.INPUTS.some(x => x.iid === i), iid)), { tue: tue3 })
  })
  allErrors.push(...o.errors); await o.browser.close()
}

/* ============ I3 — a plan change then a schedule change ============ */
if (ONLY.includes('I3')) {
  const o = await openA2('a'); page = o.page
  await step('I3', async () => {
    const DAY = '2026-07-16'
    await go(page, 'inputs')
    await page.locator('#inCalBtn').click(); await page.waitForTimeout(600)
    for (let i = 0; i < 14 && !(await page.locator(`[data-icday="${DAY}"]`).count()); i++) { await page.locator('#icPrev').click(); await page.waitForTimeout(150) }
    await page.locator(`[data-icday="${DAY}"]`).first().click(); await page.waitForTimeout(500)
    const t = page.locator('#icRmkEdit')
    await t.fill('A2 PLAN TITLE'); await t.press('Enter'); await page.waitForTimeout(300)
    await t.blur().catch(() => {}); await page.waitForTimeout(300)
    const p0 = await B.shot(page, 'I3-plan-title')
    await page.locator('#icPopClose').click().catch(() => {}); await page.waitForTimeout(300)
    const plan0 = await page.evaluate(d => (window.DAYRMK || {})[d] || null, DAY)
    B.ck('I3-plan', 'the planning calendar: a day title typed for Thu 16 Jul', /A2 PLAN TITLE/.test(plan0 || ''), { plan: plan0 }, p0)
    await go(page, 'editsched')
    const n = page.locator('#eWeek [data-txt="dn:0"]:visible, #eWeek [data-txt^="dn:"]:visible').first()
    const key = await n.getAttribute('data-txt')
    await n.click(); await n.fill('A2 SCHED NOTE'); await n.blur(); await page.waitForTimeout(400)
    const note = async () => page.locator(`#eWeek [data-txt="${key}"]`).first().evaluate(e => e.textContent || '')
    B.ck('I3-note', 'then a note on the schedule', /A2 SCHED NOTE/.test(await note()), { key })
    await lwOpen(page, '2026-07-16')
    const u1 = await door(page, 'lw', 'undo')
    const pg1 = await page.evaluate(() => window.CURPAGE)
    const n1 = await note().catch(() => '?'), plan1 = await page.evaluate(d => (window.DAYRMK || {})[d] || null, DAY)
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150)
    const p1 = await B.shot(page, 'I3-lw-undo-1')
    B.ck('I3-undo1', 'the first Undo (Leave War) takes the NOTE back (newest first); the plan title stays', u1.pressed && !/A2 SCHED NOTE/.test(n1) && /A2 PLAN TITLE/.test(plan1 || ''), { toasts: u1.toasts, page: pg1, note: n1, plan: plan1 }, p1)
    const u2 = await door(page, 'lw', 'undo')
    const pg2 = await page.evaluate(() => window.CURPAGE)
    const plan2 = await page.evaluate(d => (window.DAYRMK || {})[d] || null, DAY)
    const p2 = await B.shot(page, 'I3-lw-undo-2')
    B.ck('I3-undo2', 'the second Undo takes the plan title back', u2.pressed && !/A2 PLAN TITLE/.test(plan2 || ''), { toasts: u2.toasts, page: pg2, plan: plan2 }, p2)
    B.note('I3-where', `after each Undo the page was: ${pg1}, ${pg2} — neither jumped to the schedule or the planning calendar (Astra 24 expects the view to go to where the change was — AM39b; GU-E5 is the input-only sibling)`)
    await go(page, 'editsched')
    await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
    const r1 = await door(page, 'board', 'redo')
    const plan3 = await page.evaluate(d => (window.DAYRMK || {})[d] || null, DAY)
    const p3 = await B.shot(page, 'I3-board-redo-1')
    B.ck('I3-redo1', 'the board\'s Redo first brings the plan title back (most recently undone)', r1.pressed && /A2 PLAN TITLE/.test(plan3 || ''), { toasts: r1.toasts, plan: plan3 }, p3)
    const r2 = await door(page, 'board', 'redo')
    const n4 = await page.evaluate(k => { const e = document.querySelector(`#schedBoard [data-txt="${k}"], #schedBoard [data-bfld="${k}"]`); return e ? (e.value ?? e.textContent) : (window.DAYS[0] && JSON.stringify(window.DAYS[0].notes || '')) }, key)
    const p4 = await B.shot(page, 'I3-board-redo-2')
    await closeBoardIfOpen(page)
    const n5 = await note().catch(() => '?')
    B.ck('I3-redo2', 'the board\'s second Redo brings the schedule note back', r2.pressed && /A2 SCHED NOTE/.test(n5), { toasts: r2.toasts, onBoard: n4, onWeek: n5 }, p4)
  })
  allErrors.push(...o.errors); await o.browser.close()
}

/* ============ I4 — the posting and the app's Undo ============ */
if (ONLY.includes('I4')) {
  const o = await openA2('a'); page = o.page
  await step('I4', async () => {
    const P = 'freak', BID = '2026-10-07', PO = '2026-10-14'
    await tapCell(page, P, BID); await sheetPress(page, 'bid-LL')
    let s = await sheetNow(page); if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text || '')) await sheetPress(page, 'bid-LL')
    await closeSheets(page)
    const b0 = (await recsOf(page, P, [BID]))[BID]
    B.ck('I4-bid', 'Echo: an LL bid on Wed 7 Oct', /request:LL/.test(b0), { rec: b0 })
    await tapCell(page, P, PO)
    await sheetPress(page, 'bid-postout')
    const dt = await page.locator('[data-testid="po-date"]:visible').first().inputValue().catch(() => '')
    const line = await page.locator('[data-testid="po-line"]:visible').first().innerText().catch(() => '')
    const p0 = await B.shot(page, 'I4-postout-sheet')
    await sheetPress(page, 'po-confirm')
    await closeSheets(page)
    await lwOpen(page, PO)
    const po = await page.locator(`[data-testid="potag-${P}-${PO}"]`).count()
    const ds = await doorState(page, 'lw')
    const p1 = await B.shot(page, 'I4-posted-out')
    B.ck('I4-post', 'Echo posted out from 14 Oct (Overseas Sqn) through the war\'s PO sheet; the PO mark shows', po > 0, { date: dt, line, poMark: po, doors: ds }, `${p0}, ${p1}`)
    const u = await door(page, 'lw', 'undo')
    const b1 = (await recsOf(page, P, [BID]))[BID]
    await lwOpen(page, PO)
    const po1 = await page.locator(`[data-testid="potag-${P}-${PO}"]`).count()
    const p2 = await B.shot(page, 'I4-app-undo')
    B.ck('I4-undo', 'the app\'s Undo passes over the posting (D350) and takes the earlier BID back; the posting stays', u.pressed && !/request:LL/.test(b1) && po1 > 0,
      { titleBefore: u.title, toasts: u.toasts, bid: b1, poStill: po1 }, p2)
    const ds2 = await doorState(page, 'lw')
    B.ck('I4-greyed', 'with only the posting left, Undo is off — and its hover says why (a posting is not an Undo step, D350)', /^off/.test(ds2.undo) && /post|can.t be undone|not/i.test(ds2.undo.replace(/^off /, '')), { doors: ds2 })
    const t = await tapCell(page, P, PO)
    const hasUndoPo = (t.buttons || []).some(b => /postout-undo/.test(b))
    const r = await sheetPress(page, 'postout-undo')
    await closeSheets(page)
    await lwOpen(page, PO)
    const po2 = await page.locator(`[data-testid="potag-${P}-${PO}"]`).count()
    const p3 = await B.shot(page, 'I4-sheet-undo-post-out')
    B.ck('I4-sheet', 'the posting sheet\'s own "Undo post out (PO)" takes the posting back', t.open === 'postout-sheet' && hasUndoPo && r.pressed && po2 === 0, { opened: t.open, buttons: t.buttons, poAfter: po2 }, p3)
    const ds3 = await doorState(page, 'lw')
    B.note('I4-after', { doors: ds3, note: '"Undo post out" is not an Undo step either (it writes the posting record) — the war\'s Undo stays as it was' })
  })
  allErrors.push(...o.errors); await o.browser.close()
}

B.note('errors', allErrors)
B.save(allErrors)
console.log(`${B.rows.filter(r => r.ok === true).length} PASS · ${B.rows.filter(r => r.ok === false).length} FAIL`)
