/* W3-04d — N19's other half: an award's CODE follows its quantity ("under a day reads HO, a day or more reads FO" —
   BidPicker's own words for the ruling). Change the DAYS of an existing award on the OIL tracker and on the tap list:
   does the box still say the right code? Assertions of the RIGHT behaviour.
   Usage: node scripts/handpass/ab/w3-04d-code-follows-days.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, shot, resultBook, ROOT, recsOf, closeSheets, tapCell, sheetNow, bidOn, lwCell, figures } = L
const PHONE = W === 'phone'
const R = resultBook(`W3-04d-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-04d-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await lwOpen(page, '2026-07-20')

/* 1 — the tracker: a half-day award (HO) made worth 2 days */
await L.lwAward(page, 'mamba', '2026-07-26', '0.5', 'W3 half day')
const c0 = await lwCell(page, 'mamba', '2026-07-26')
await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await page.waitForTimeout(1500)
const btn = page.locator('[data-testid^="oil-note-mamba-"][data-testid$="2026-07-26"]').first()
await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await btn.click(); await page.waitForTimeout(400)
await page.locator('[data-testid="oil-note-days"]').fill('2')
await page.locator('[data-testid="oil-note-save"]').click(); await page.waitForTimeout(600)
await shot(page, `w3-04d-${W}-tracker-2-days`)
await page.locator('[data-testid="oil-close"]:visible').first().click().catch(() => {}); await page.waitForTimeout(500)
await lwOpen(page, '2026-07-26')
const c1 = await lwCell(page, 'mamba', '2026-07-26')
const s1 = await tapCell(page, 'mamba', '2026-07-26')
await shot(page, `w3-04d-${W}-tracker-2-days-sheet`)
await closeSheets(page)
const f1 = await figures(page, 'mamba')
R.ck('N19-code-follows-tracker', /FO/.test(c1.box), 'a half-day award made 2 days on the tracker reads FO on the grid (a day or more reads FO)', { before: c0.box, after: c1.box, rec: (await recsOf(page, 'mamba', ['2026-07-26']))['2026-07-26'], sheet: (s1.text || '').slice(0, 160), oil: f1.oil })
await L.lwShot(page, `w3-04d-${W}-grid-after-tracker`, 'mamba', '2026-07-26')

/* 2 — the tap list: a 1-day award (FO) beside a bid, made worth half a day */
await L.lwAward(page, 'nact', '2026-07-27', '1', 'W3 full day')
await bidOn(page, 'nact', '2026-07-27', 'LL')
const s2 = await tapCell(page, 'nact', '2026-07-27')
const edit = page.locator('[data-testid^="dl-oil-edit-"]:visible').first()
await edit.click(); await page.waitForTimeout(300)
const id = (await edit.getAttribute('data-testid')).replace('dl-oil-edit-', '')
await page.locator(`[data-testid="oil-edit-days-${id}"]`).fill('0.5')
await page.locator(`[data-testid="oil-edit-save-${id}"]`).click(); await page.waitForTimeout(500)
const s3 = await sheetNow(page)
await shot(page, `w3-04d-${W}-taplist-half`)
await closeSheets(page)
const c2 = await lwCell(page, 'nact', '2026-07-27')
R.ck('N19-code-follows-taplist', /HO/.test(s3.lines.join(' ')) || /HO/.test(c2.box), 'a 1-day award made half a day on the tap list reads HO (under a day reads HO)', { lines: s3.lines, box: c2.box, rec: (await recsOf(page, 'nact', ['2026-07-27']))['2026-07-27'] })
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
