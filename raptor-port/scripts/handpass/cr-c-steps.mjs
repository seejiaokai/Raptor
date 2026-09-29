/* Phase C of the change-recording re-test — THE NEW BEHAVIOURS, walked on the real production build (plan §5; the
   scenario lists: Fable S1–S3, S5, S6, S17–S20, S22, S29; Astra 1, 7, 8, 21; walkers A2-F1, A2-F4, A2-F6). Each check
   ASSERTS the right behaviour (PASS = the app did what it should); re-running this IS the re-walk. Each scenario on a
   fresh demo world, made through the app's own controls (bug-check order §7.7).
   C1  S17 + A2-F4 — a Quals tick undone from the Leave War: lands on Quals, says "Undid: Ranger's quals", the tick back;
       Redo; the history line (S29).
   C2  S19 — a LoX column removed, then Undo on Quals: the column is back on the page.
   C3  S18 — a Logic rule changed, then Undo from Edit Schedule: lands on Logic, the box shows the old value.
   C4  S20 — Outlaw suspended on Admin → Users, then Undo there: "Undid: suspending Outlaw's sign-in", enabled again.
   C5  S1 — a person added (a posting on the war — D350): Undo greyed, its hover says why.
   C6  S3 / Astra 1 — Hex renamed on Quals, "Hex" given to a new person, Undo: refused whole, naming the callsign.
   C7  S22 — Hex suspended by hand, then archived, then Undo: refused, "Hex is archived — restore him …".
   C8  D352 — bidding closed on the Leave War, Undo from Edit Schedule: lands on the war, the stage's own words.
   C9  A2-F6 — a take-off time changed on the edit week, then Undo: "Undid: a take-off time".
   C10 S6 / Astra 15 — the admin's member view: his own admin step on Quals' pair refuses "Switch back…" every press.
   C11 S2 — a member files an LL, marks every change seen, then Undo on Inputs: the LL goes (the seen mark is no step).
   Usage (from raptor-port/): node scripts/handpass/cr-c-steps.mjs [desktop|phone] [C1,C2,…]   (CR_REWALK writes a2-rewalk) */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { PHONE, openA2, book, door, toasts, go, fileInput, closeSheets, switchView, stageGo, stageNow, elogTail } = L
const ONLY = (process.argv[3] || 'C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11').split(',')
const B = book('c-steps')
const allErrors = []
let page
async function step(id, fn) {
  try { await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), page ? await B.shot(page, `THREW-${id}`) : '') }
  try { await closeSheets(page) } catch { }
}
const cur = () => page.evaluate(() => window.CURPAGE)
const said = (r) => (r.toasts || []).join(' | ')
const tap = async (sel) => { const l = page.locator(sel).first(); if (PHONE) await l.tap().catch(() => l.click()); else await l.click(); await page.waitForTimeout(500) }
async function world(who) {
  const o = await openA2(who); page = o.page; allErrors.push(o.errors); return o
}
async function qualsEditing(tab = 'P') {
  await go(page, 'quals')
  await tap(tab === 'W' ? '#qViewW' : '#qViewP')
  if (await page.locator('#qEdit:visible').count()) await tap('#qEdit')
}
async function usersPane() {
  await go(page, 'admin')
  if (!(await page.locator('#accList').isVisible().catch(() => false))) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(400) }
}
const cellGlyph = (sel) => page.evaluate(s => { const c = document.querySelector(s); return c ? (c.querySelector('.qchk') ? (c.textContent || '✓').trim() || '✓' : '') : null }, sel)

if (ONLY.includes('C1')) { const o = await world('a'); await step('C1', async () => {
  await qualsEditing('P')
  const cell = 'td[data-q="bane|nvg"]'
  const g0 = await cellGlyph(cell)
  await tap(cell)
  const g1 = await cellGlyph(cell)
  await page.locator(cell).first().scrollIntoViewIfNeeded().catch(() => {})
  B.ck('C1.1', 'the tick changed on Quals', g1 !== g0, `before "${g0}" after "${g1}"`, await B.shot(page, 'C1-ticked'))
  await go(page, 'leavewar')
  const u = await door(page, 'top', 'undo')
  const page1 = await cur(); const g2 = await cellGlyph(cell)
  await page.locator(cell).first().scrollIntoViewIfNeeded().catch(() => {})
  B.ck('C1.2', 'Undo on the Leave War lands on Quals (AM39b, A2-F4)', page1 === 'quals', `page ${page1}`, await B.shot(page, 'C1-undone-on-quals'))
  B.ck('C1.3', 'it says what came back — "Ranger’s quals" (B8)', /Undid: Ranger.s quals/.test(said(u)), said(u))
  B.ck('C1.4', 'the tick is back as it was', g2 === g0, `now "${g2}"`)
  const r = await door(page, 'top', 'redo')
  B.ck('C1.5', 'Redo puts it back', (await cellGlyph(cell)) === g1 && /Redid: Ranger.s quals/.test(said(r)), said(r))
  const tail = await elogTail(page, 4)
  B.note('C1.6', `the change history's last lines (S29 — a roster undo writes its line dated today): ${JSON.stringify(tail.map(t => t.lbl + ' @' + t.date))}`)
}); await o.browser.close() }

if (ONLY.includes('C2')) { const o = await world('a'); await step('C2', async () => {
  await qualsEditing('P')
  if ((await page.locator('#qEditQuals').getAttribute('aria-pressed')) !== 'true') await tap('#qEditQuals')
  const cols = () => page.evaluate(() => [...document.querySelectorAll('#qtbl thead th[data-col]')].map(t => t.dataset.col))
  const c0 = await cols()
  await tap('#qtbl thead th[data-col="tf"] .qdel')
  if ((await cols()).includes('tf')) await tap('#qtbl thead th[data-col="tf"] .qdel')
  const c1 = await cols()
  B.ck('C2.1', 'TF removed from the LoX', !c1.includes('tf'), c1.join(','), await B.shot(page, 'C2-tf-removed'))
  const u = await door(page, 'top', 'undo')
  const c2 = await cols()
  B.ck('C2.2', 'Undo brings TF back ON THE QUALS PAGE (Fable S19 — the page read its own copy)', c2.includes('tf'), `${c2.join(',')} · ${said(u)}`, await B.shot(page, 'C2-tf-back'))
  B.ck('C2.3', 'the words: "the LoX columns"', /the LoX columns/.test(said(u)), said(u))
}); await o.browser.close() }

if (ONLY.includes('C3')) { const o = await world('a'); await step('C3', async () => {
  await go(page, 'logic')
  await tap('#lgEdit')
  /* a box holding a plain number or a clock time (the first run took the first box, which reads "1h" — no change
     could be typed into it, and C3 proved nothing) */
  const k = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-lgset]')].find(i => /^(\d+|\d{1,2}:\d{2})$/.test(i.value)); return b ? b.getAttribute('data-lgset') : null })
  const box = page.locator(`[data-lgset="${k}"]`).first()
  const v0 = await box.inputValue()
  const next = /^\d+$/.test(v0) ? String(+v0 + 1) : /^(\d{1,2}):(\d{2})$/.test(v0) ? (() => { const [h, m] = v0.split(':').map(Number); const t = h * 60 + m + 5; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` })() : v0
  await box.fill(next); await box.press('Tab'); await page.waitForTimeout(700)
  const v1 = await page.locator(`[data-lgset="${k}"]`).first().inputValue()
  B.ck('C3.1', `the rule ${k} changed ${v0} → ${next}`, v1 !== v0, `box now "${v1}"`, await B.shot(page, 'C3-rule-changed'))
  await tap('#lgDone').catch(() => {})
  await go(page, 'editsched')
  const u = await door(page, 'top', 'undo')
  const p = await cur()
  B.ck('C3.2', 'Undo from Edit Schedule lands on Logic', p === 'logic', `page ${p}`)
  /* the proof is the rule's own box: into Edit, the box on screen, its value read (the first run read the page's text) */
  if (await page.locator('#lgEdit:visible').count()) await tap('#lgEdit')
  const bx = page.locator(`[data-lgset="${k}"]`).first()
  await bx.scrollIntoViewIfNeeded().catch(() => {})
  const v2 = await bx.inputValue().catch(() => 'NO BOX')
  B.ck('C3.3', 'the rule’s box shows its old value again (Fable S18 — a stale box)', v2 === v0, `box "${v2}", was "${v0}"`, await B.shot(page, 'C3-undone-on-logic'))
  await tap('#lgDone').catch(() => {})
  B.ck('C3.4', 'the words: "a rule on the Logic page"', /a rule on the Logic page/.test(said(u)), said(u))
}); await o.browser.close() }

if (ONLY.includes('C4')) { const o = await world('a'); await step('C4', async () => {
  await usersPane()
  const dots = () => page.evaluate(() => { const r = document.querySelector('.acc-row[data-person="casper"]'); return r ? (r.querySelector('.od-dots, .acc-dots') || r).innerHTML.replace(/\s+/g, ' ').slice(0, 400) : 'no row' })
  const d0 = await dots()
  await tap('.acc-row[data-person="casper"] .acc-tap'); await tap('#accEdOnOff')
  const d1 = await dots()
  B.ck('C4.1', 'Outlaw suspended (his sign-in dot changes)', d1 !== d0, '', await B.shot(page, 'C4-suspended'))
  const u = await door(page, 'top', 'undo')
  const d2 = await dots()
  B.ck('C4.2', 'Undo on Admin → Users enables him again', d2 === d0, `${said(u)}`, await B.shot(page, 'C4-undone'))
  B.ck('C4.3', 'the words: "suspending Outlaw’s sign-in"', /suspending Outlaw.s sign-in/.test(said(u)), said(u))
}); await o.browser.close() }

if (ONLY.includes('C5')) { const o = await world('a'); await step('C5', async () => {
  await usersPane()
  await page.fill('#accAddCs', 'Nomex'); await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await tap('#accAdd'); await toasts(page)
  const added = await page.locator('.acc-row', { hasText: 'Nomex' }).count()
  const u = await door(page, 'top', 'undo', { press: false })
  B.ck('C5.1', 'the person is added', added > 0, `rows ${added}`, await B.shot(page, 'C5-added'))
  B.ck('C5.2', 'Undo is greyed, and its hover says why (D350 — B3)', u.disabled && /aren.t undone here/.test(u.title || ''), `disabled ${u.disabled} · "${u.title}"`)
}); await o.browser.close() }

if (ONLY.includes('C6')) { const o = await world('a'); await step('C6', async () => {
  await qualsEditing('W')
  const cs = page.locator('input[data-cs="rocky"]').first()
  await cs.fill('Quasar'); await cs.press('Tab'); await page.waitForTimeout(600); await toasts(page)
  await usersPane()
  await page.fill('#accAddCs', 'Hex'); await page.selectOption('#accAddSeat', 'RCP'); await page.selectOption('#accAddCat', 'C')
  await tap('#accAdd'); await toasts(page)
  const u = await door(page, 'top', 'undo')
  B.ck('C6.1', 'Undo of the rename is refused whole, naming the callsign (D286 — B5)', /Hex is taken on the roster now/.test(said(u)), said(u), await B.shot(page, 'C6-refused'))
  await page.locator('.acc-row .acc-name', { hasText: /^Quasar$/ }).first().scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(3500)   // the bubble's few seconds, so the rows show
  const pq = await B.shot(page, 'C6-list-after')
  const hexes = await page.locator('.acc-row .acc-name', { hasText: /^Hex$/ }).count()
  const q = await page.locator('.acc-row .acc-name', { hasText: /^Quasar$/ }).count()
  B.ck('C6.2', 'nothing moved: one Hex (the new man), Quasar still Quasar', hexes === 1 && q === 1, `Hex ×${hexes}, Quasar ×${q}`, pq)
  B.ck('C6.3', 'the step stays next — Undo still on', u.disabledAfter === false, `disabled after ${u.disabledAfter}`)
}); await o.browser.close() }

if (ONLY.includes('C7')) { const o = await world('a'); await step('C7', async () => {
  await usersPane()
  await tap('.acc-row[data-person="rocky"] .acc-tap'); await tap('#accEdOnOff'); await toasts(page)
  await tap('.acc-row[data-person="rocky"] .acc-tap'); await tap('#accEdArchive'); await toasts(page)
  const u = await door(page, 'top', 'undo')
  B.ck('C7.1', 'Undo of the suspension, behind the archive, refused (D322 — B5)', /Hex is archived — restore him/.test(said(u)), said(u), await B.shot(page, 'C7-refused'))
}); await o.browser.close() }

if (ONLY.includes('C8')) { const o = await world('a'); await step('C8', async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(800)
  const s0 = await stageNow(page)
  await stageGo(page, 'advance'); await page.waitForTimeout(600)
  const s1 = await stageNow(page)
  await go(page, 'editsched')
  const u = await door(page, 'top', 'undo')
  const p = await cur(); const s2 = await stageNow(page).catch(() => '?')
  B.ck('C8.1', `the stage moved ${s0} → ${s1}, and Undo from Edit Schedule lands on the Leave War (B7)`, p === 'leavewar', `page ${p}`, await B.shot(page, 'C8-undone-on-war'))
  B.ck('C8.2', 'the stage is back', s2 === s0, `now ${s2}`)
  B.ck('C8.3', 'D352 — its own words, and what the war is now', /Undid: closing bidding — bidding is open again for everyone/.test(said(u)), said(u))
}); await o.browser.close() }

if (ONLY.includes('C9')) { const o = await world('a'); await step('C9', async () => {
  await go(page, 'editsched')
  const box = page.locator('#eWeek .day[data-day="0"] [data-txt$=".to"]').first()
  await box.scrollIntoViewIfNeeded()
  const was = (await box.innerText()).trim()
  await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(was === '10:45' ? '11:05' : '10:45'); await page.keyboard.press('Tab'); await page.waitForTimeout(700)
  const u = await door(page, 'top', 'undo')
  B.ck('C9.1', 'a take-off time undone says "a take-off time" (A2-F6, [AMEND-SMALL-SEEN] 2)', /Undid: a take-off time/.test(said(u)), said(u), await B.shot(page, 'C9-takeoff-undone'))
  B.ck('C9.2', 'and the time is back', (await box.innerText()).trim() === was, `now "${(await box.innerText()).trim()}"`)
}); await o.browser.close() }

if (ONLY.includes('C10')) { const o = await world('a'); await step('C10', async () => {
  await qualsEditing('P')
  await tap('td[data-q="bane|nvg"]'); await toasts(page)
  await switchView(page)
  await go(page, 'quals')
  const u1 = await door(page, 'top', 'undo'), u2 = await door(page, 'top', 'undo')
  B.ck('C10.1', 'his own admin step, in the member view, refuses "Switch back…" — every press (D292, D148)', /Switch back to the admin view/.test(said(u1)) && /Switch back to the admin view/.test(said(u2)), `${said(u1)} / ${said(u2)}`, await B.shot(page, 'C10-member-view'))
  await switchView(page)
  await go(page, 'quals')
  const u3 = await door(page, 'top', 'undo')
  B.ck('C10.2', 'switched back, the same Undo takes it', /Undid: Ranger.s quals/.test(said(u3)), said(u3))
}); await o.browser.close() }

if (ONLY.includes('C11')) { const o = await world('m'); await step('C11', async () => {
  const f = await fileInput(page, { from: '2026-07-15', type: 'LL', remarks: 'C11 LL' })
  await go(page, 'viewsched')
  /* the day's own change count opens the changes window for a member (D171) — not the day's status badge, which on a
     phone opens the day summary sheet (the first run tapped that, and the sheet blocked the Undo) */
  const chip = (await page.locator('#vWeek [data-chgday][data-chgtab="new"]').count()) ? page.locator('#vWeek [data-chgday][data-chgtab="new"]').first() : page.locator('#vWeek [data-chgday]').first()
  if (await chip.count()) { await chip.scrollIntoViewIfNeeded().catch(() => {}); await chip.click(); await page.waitForTimeout(500) }
  const seen = page.locator('button.cw-seen:not([disabled])').first()
  const hadSeen = await seen.count()
  if (hadSeen) { await seen.click(); await page.waitForTimeout(400) }
  await page.keyboard.press('Escape').catch(() => {})
  await closeSheets(page)
  await go(page, 'inputs')
  const u = await door(page, 'top', 'undo')
  B.ck('C11.1', 'after "Mark all as seen", Undo on Inputs takes his LL — the seen mark is no step (B1, Fable S2)', hadSeen > 0 && /Undid: a personal input/.test(said(u)) && (await cur()) === 'inputs' && !(await page.evaluate(i => window.INPUTS.some(r => r.iid === i), f.iid)), `${said(u)} · seen pressed: ${hadSeen} · iid ${f.iid}`, await B.shot(page, 'C11-undone'))
}); await o.browser.close() }

B.save(allErrors.flat())
const fails = B.rows.filter(r => r.ok === false).length
console.log(`\n${B.rows.filter(r => r.ok).length} PASS · ${fails} FAIL · errors: ${allErrors.flat().length ? allErrors.flat().slice(0, 3).join(' | ') : 'none'}`)
process.exit(fails ? 1 : 0)
