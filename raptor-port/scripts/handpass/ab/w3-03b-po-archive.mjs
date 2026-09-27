/* W3-03b — the drag-selection's Post out with "Archive on PO date" left ON (its default), dated 1 Sep 26 (before
   today, 26 Sep 26): is his row still on the war, with his leave (Fable S37 — "his row is kept on the war")?
   And the same through the bid sheet's PO. Usage: node scripts/handpass/ab/w3-03b-po-archive.mjs */
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, shot, resultBook, ROOT, rowRun, go } = L
const R = resultBook('W3-03b', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-03b.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
const rowThere = async (id) => page.locator(`[data-testid="row-${id}"]`).count()
await lwOpen(page, '2026-07-20')
/* Comet (beams): a bid on 20 Jul, then Post out from 1 Sep through the drag-selection, archive left ON */
await bidOn(page, 'beams', '2026-07-20', 'LL')
const sel = await L.dragRect(page, 'beams', '2026-07-21', 'beams', '2026-07-22')
await L.selPress(page, 'sel-postout')
await page.locator('[data-testid="sel-po-date"]').fill('2026-09-01'); await page.waitForTimeout(300)
const arch = await page.locator('[data-testid="sel-po-archive"]').isChecked()
await shot(page, 'w3-03b-sel-po-fold')
const c = await L.selPress(page, 'sel-po-confirm')
await page.waitForTimeout(800)
await lwOpen(page, '2026-07-20')
const there = await rowThere('beams')
await shot(page, 'w3-03b-after-sel-po')
R.note('sel-po', { sel: sel.open, archiveOn: arch, after: c.sheet.open, rowOnWar: there })
R.ck('S37-row-kept', there === 1, 'a man posted out (archive on) from a date already past keeps his row on the war with his July bid (Fable S37)', { row: there, july: there ? await rowRun(page, 'beams', ['2026-07-20', '2026-08-31', '2026-09-01']) : 'NO ROW' })
/* and through the bid sheet, Forge (chaps), 1 Sep, archive on */
await tapCell(page, 'chaps', '2026-07-23'); await sheetPress(page, 'bid-postout')
await page.locator('[data-testid="po-date"]').fill('2026-09-01'); await page.waitForTimeout(300)
const c2 = await sheetPress(page, 'po-confirm')
await lwOpen(page, '2026-07-20')
const there2 = await rowThere('chaps')
R.ck('S37-row-kept-bidsheet', there2 === 1, 'the same through the bid sheet\'s PO: his row stays on the war', { row: there2 })
await go(page, 'quals'); await page.waitForTimeout(800)
const quals = await page.evaluate(() => { const t = document.body.innerText; return { comet: /Comet/.test(t), forge: /Forge/.test(t) } })
await shot(page, 'w3-03b-quals')
R.note('quals-roster-shows', quals)
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
