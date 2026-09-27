/* RW copy of w3-04c-tracker-n19.mjs (re-walk regression, 26 Sep 26): pictures to rewalk/w3, results to 2026-09-26-absence-rewalk-w3-04c-*.txt. */
/* W3-04c — N19 on the OIL TRACKER's award editor (Astra 30: "through both day award and tracker"): a 0.5-day award
   given on the bid sheet, then its days typed as 0.25 / 0.75 / −1 / "abc" / 1.25 on the tracker — each refused with a
   sentence and nothing written; then 2 lands. Assertions of the RIGHT behaviour.
   Usage: node scripts/handpass/ab/w3-04c-tracker-n19.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, shot, resultBook, ROOT, recsOf, closeSheets, lwHist } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-04c-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-04c-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await lwOpen(page, '2026-07-20')
const g = await L.lwAward(page, 'mamba', '2026-07-26', '0.5', 'W3 N19 tracker')
R.note('award', g)
const openTracker = async () => {
  await closeSheets(page)
  if (!(await page.locator('[data-testid="oil-row-mamba"]').count())) { await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await page.waitForTimeout(1500) }
}
const out = []
for (const v of ['0.25', '0.75', '-1', 'abc', '1.25', '2']) {
  await openTracker()
  const btn = page.locator('[data-testid^="oil-note-mamba-"][data-testid$="2026-07-26"]').first()
  if (!(await btn.count())) { out.push({ v, err: 'NO NOTE BUTTON' }); continue }
  await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await btn.click(); await page.waitForTimeout(400)
  const days = page.locator('[data-testid="oil-note-days"]')
  await days.fill(v)
  await page.locator('[data-testid="oil-note-save"]').click(); await page.waitForTimeout(600)
  const err = (await page.locator('[data-testid="oil-note-err"]').allInnerTexts()).join(' ')
  const still = await days.count()
  if (v === '0.25' || v === 'abc') await shot(page, `w3-04c-${W}-tracker-${v}`)
  const rec = (await recsOf(page, 'mamba', ['2026-07-26']))['2026-07-26']
  out.push({ v, err, stillOpen: still, rec })
  if (still) { await days.focus(); await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
}
R.note('tracker-values', out)
for (const o of out) {
  if (o.v === '2') R.ck(`tracker-${o.v}`, /\/d2$/.test(o.rec), '2 days is a half-step: the award now reads 2', o)
  else R.ck(`tracker-${o.v}`, !!o.err && !!o.stillOpen && /\/d0\.5$/.test(o.rec), `${o.v} is refused on the tracker with a sentence, the award stays 0.5 — never rounded`, o)
}
await page.locator('[data-testid="oil-close"]:visible').first().click().catch(() => {}); await page.waitForTimeout(500)
const u = await lwHist(page, 'undo')
R.ck('tracker-undo', /\/d0\.5$/.test((await recsOf(page, 'mamba', ['2026-07-26']))['2026-07-26']), 'one Undo takes the tracker\'s 2 back to 0.5', u)
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
