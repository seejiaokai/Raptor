import { openWorld, fileFixture, fileInput, inputsOf, readRows, shot, OUT, errs, browser, DI, toast, toastMark, toastsSince, undoRedo, drag, TITLE, csId } from './gi-w1-lib.mjs'
const sc = p => p.evaluate(([di]) => { const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; day.scrollIntoView({ inline: 'start', block: 'nearest' }); const sec = day.querySelector(`[data-secmove="${di}.ground"]`); window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) }, [2])
const rowL = p => p.locator('#eWeek .day:not(.peek) .sec-grnd .pl-row', { hasText: 'RANGE SAFETY' }).first()
for (const variant of ['rightclick', 'dragToRoster', 'onAddZone']) {
  const { ctx, page } = await openWorld()
  await fileFixture(page)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
  await sc(page); await page.waitForTimeout(300)
  const hunter = await csId(page, 'Hunter')
  const ph = page.locator('#eRoster').getByText('ALL AVAIL', { exact: true }).first()
  const target = variant === 'onAddZone' ? rowL(page).locator('.addz').first() : rowL(page).locator(`.puck[data-person="${hunter}"]`).first()
  await drag(page, ph, target)
  const names = async () => (await readRows(page)).weekGround[0]
  console.log(variant, 'after drop', JSON.stringify(await names()))
  await sc(page); await page.waitForTimeout(300)
  const m = await toastMark(page)
  const hp = rowL(page).locator(`.puck[data-person="${hunter}"]`).first()
  if (variant === 'rightclick') await hp.click({ button: 'right' })
  else if (variant === 'dragToRoster') { const r = await page.locator('#eRoster').boundingBox(); await drag(page, hp, { x: r.x + 100, y: r.y + 500 }) }
  else await drag(page, hp, { x: 900, y: 82 })
  await page.waitForTimeout(600)
  console.log(variant, 'after Hunter off', JSON.stringify(await names()), 'toast:', await toastsSince(page, m), 'INPUTS', (await inputsOf(page)).people.join())
  await ctx.close()
}
console.log('errs', errs)
await browser.close()
