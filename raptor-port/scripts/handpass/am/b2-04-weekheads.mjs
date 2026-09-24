/* Walker B2, item 13 — the desktop edit week's day heads side by side (b2-02's head pictures caught the Amendments
   panel instead): Monday at AL4 beside Tuesday's ORIG, then Tuesday beside Wednesday's DRAFT. Reads only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./b2-lib.mjs')
const { openHi, editWeek } = L
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad'
const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: `${SCR}/b2-world-al4.json`, dpr: 1 })
await editWeek(page)
for (const [di, n] of [[0, 'mon-tue'], [1, 'tue-wed']]) {
  const hd = page.locator(`#eWeek .day[data-day="${di}"] .day-head`).first()
  await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'start' })); await page.waitForTimeout(400)
  const b = await hd.boundingBox()
  await page.screenshot({ path: `${process.env.HP_SHOTS}/b2-04-seal-al4-week-${n}.png`, clip: { x: 0, y: Math.max(0, b.y - 12), width: 1440, height: b.height + 70 } })
}
console.log('errors', JSON.stringify(errors))
await browser.close()
