/* w1 · S2 (Fable) = Astra rank 3 — "Discard marks" when the only pending edits are on PUBLISHED days.
   Desktop only (the Amendments panel is hidden under 820px — S6 walks the phone).
   A FRESH demo world (a new browser context, nothing reloaded — bug-check order §7.7), so no draft
   day carries an edit: publish Monday, change one cell, press the panel's "Discard marks".
   RIGHT behaviour: a published day's divergence is never discarded (the only way to change a published
   day is the next AL — engine F-01), so the control must not offer, or claim, what it cannot do
   (AM25 the panel; AM15b "wherever correct behaviour could read as a bug because it is silent, the
   app says so"; AM23 the counts agree). Then the mixed case: one draft-day edit as well.
   Usage: node w1-s02-discard.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, publishDay, editText, WIDTHS, checker, toastSpy, toasts, panel, headLine, headN, markSummary, shotBox, shotUnion, book } = L
const C = checker('S2 desktop')
const { browser, page, errors } = await open({ ...WIDTHS.desktop })
await toastSpy(page)
await editWeek(page)
const undoLbl = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? (b.disabled ? 'DISABLED ' : '') + (b.title || b.innerText) : 'no undo button' })
C.log('fresh panel', await panel(page))
C.log('fresh heads', [await headLine(page, 0), await headLine(page, 1)])
// Monday: sign, Publish day, change one cell
await signDay(page, 0)
const pd = await publishDay(page, 0)
C.log('publish Monday', { ...pd, toasts: await toasts(page) })
const note0 = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt).find(k => k.startsWith('dn:0.')))
await editText(page, note0, 'MON NOTE — PENDING ON A PUBLISHED DAY')
const P1 = await panel(page), h1 = await headN(page, 0)
C.log('after the edit', { head: await headLine(page, 0), panel: P1, undo: await undoLbl(), pendingKeys: (await book(page)).pending })
C.check('S2.a', P1.days.length === 1 && /^Mon · 1 change$/.test(P1.days[0].text), 'panel: "1 day with changes to publish · Mon · 1 change" — AM25', P1)
await shotBox(page, 's2-desktop-1-panel-before', '#alPanel')
// press Discard marks
const disabledBefore = P1.discard && P1.discard.disabled
C.check('S2.b', disabledBefore === true, 'with pending ONLY on a published day, "Discard marks" is not offered (disabled) — nothing it may clear (F-01, AM25)', P1.discard)
const undoBefore = await undoLbl()
if (!disabledBefore) { await page.locator('#alDrop').click(); await page.waitForTimeout(700) }
const t = await toasts(page)
const P2 = await panel(page), h2 = await headN(page, 0), m2 = await markSummary(page, '#eWeek .day[data-day="0"]')
C.log('after Discard', { toasts: t, head: await headLine(page, 0), panel: P2, marks: m2, undo: await undoLbl() })
C.check('S2.c', !t.some(x => /Pending marks cleared/.test(x)), 'no "Pending marks cleared" message when nothing was cleared — AM15b', t)
C.check('S2.d', h2.pending === '1 pending' && m2.dotted.length === 1, 'Monday still "1 pending" with its dotted cell (a published change is never discarded) — F-01/AM40', { pend: h2.pending, dotted: m2.dotted })
C.note('S2.e', 'the Undo button before / after the Discard press (a no-op should not add an undo step)', { before: undoBefore, after: await undoLbl() })
await shotBox(page, 's2-desktop-2-panel-after', '#alPanel')
await shotBox(page, 's2-desktop-2-mon-note-after', `#eWeek .day[data-day="0"] [data-txt="${note0}"]`, null, { pad: 40 })   // the note itself, still dotted
await shotUnion(page, 's2-desktop-2-mon-head-after', ['#eWeek .day[data-day="0"] .day-head'])
// did the empty Discard put a do-nothing step on Undo? One Undo press should take back Monday's note edit.
await page.locator('#undoBtn').click(); await page.waitForTimeout(700)
const tu = await toasts(page)
const noteAfterUndo = await page.evaluate(k => document.querySelector(`#eWeek [data-txt="${k}"]`)?.innerText.trim(), note0)
C.log('one Undo after the empty Discard', { toasts: tu, note: noteAfterUndo, head: await headLine(page, 0) })
C.check('S2.e2', !/PENDING ON A PUBLISHED DAY/.test(noteAfterUndo || ''), 'the FIRST Undo after the empty Discard takes back the note edit (the Discard left no empty undo step) — AM39b', { note: noteAfterUndo, toasts: tu })
if (!/PENDING ON A PUBLISHED DAY/.test(noteAfterUndo || '')) { await page.locator('#redoBtn').click(); await page.waitForTimeout(700) }
else { await page.locator('#undoBtn').click(); await page.waitForTimeout(700); await page.locator('#redoBtn').click(); await page.waitForTimeout(700) }
C.log('after redo', { toasts: await toasts(page), head: await headLine(page, 0) })
// the mixed case: one draft-day edit (Tuesday is still a draft in the fresh world)
const tueNote = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt]')].map(e => e.dataset.txt).find(k => k.startsWith('dn:1.')))
await editText(page, tueNote, 'TUE DRAFT EDIT')
const P3 = await panel(page)
C.log('mixed: panel', P3)
C.log('mixed: heads', [await headLine(page, 0), await headLine(page, 1)])
await page.locator('#alDrop').click(); await page.waitForTimeout(700)
const t3 = await toasts(page)
const P4 = await panel(page), hMon = await headN(page, 0), hTue = await headN(page, 1)
C.log('mixed: after Discard', { toasts: t3, panel: P4, mon: await headLine(page, 0), tue: await headLine(page, 1), pendingKeys: (await book(page)).pending })
C.check('S2.f', hTue.pending === '', 'the DRAFT day\'s edit mark is cleared (its count goes) — Discard\'s real job', hTue.pending)
C.check('S2.g', hMon.pending === '1 pending', 'Monday (published) keeps its change — F-01', hMon.pending)
C.note('S2.h', 'the message in the mixed case (does it say the published day\'s change was kept?)', t3)
const P5 = await panel(page)
C.log('final panel', P5)
C.check('S2.i', !(P5.discard && P5.discard.disabled === false && P5.days.length && !/unpublished days/.test(P5.pend)) || P5.discard.disabled,
  'after the draft marks are gone, Discard is no longer offered — AM25', P5)
await shotBox(page, 's2-desktop-3-panel-final', '#alPanel')
C.check('S2.z', !errors.length, 'no console errors', errors)
C.summary()
await browser.close()
