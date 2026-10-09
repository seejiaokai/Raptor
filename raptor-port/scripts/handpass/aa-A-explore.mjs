import { world, closeAll, toInputs, openNew, setTimes, pic, T, sleep, closeWins, readInputs, observe } from './aa-A-lib.mjs'
const w = await world({ who: 'ad', size: 'd' })
const page = w.page
await toInputs(page)
for (const [who, d1, d2] of [['dj', '20', '21'], ['allavail', '22', '23']]) {
  await closeWins(page)
  await openNew(page, `2026-07-${d1}`)
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', who)
  const ad = page.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', 'x30 two-tap ' + who)
  await page.locator(`#inpEdCal [data-cal="2026-07-${d1}"]`).click(); await sleep(250)
  const l1 = await page.evaluate(() => document.querySelector('#inpEdCal')?.parentElement?.innerText.replace(/\s+/g, ' ').slice(-40))
  await page.locator(`#inpEdCal [data-cal="2026-07-${d2}"]`).click(); await sleep(250)
  const l2 = await page.evaluate(() => document.querySelector('#inpEdCal')?.parentElement?.innerText.replace(/\s+/g, ' ').slice(-40))
  console.log(who, 'after tap on', d1, ':', l1, '| after tap on', d2, ':', l2)
  await page.locator('#inpEditSave').click(); await sleep(700)
  const r = await readInputs(page, 'x30 two-tap ' + who)
  console.log(who, 'saved:', JSON.stringify(r.map(x => ({ n: x.name, r: x.remarks }))), JSON.stringify((await observe(page)).msgs.filter(m => /one day|Input/.test(m)).slice(0, 3)))
  console.log(who, 'record dates:', JSON.stringify(await page.evaluate(w => window.INPUTS.filter(x => (x.remarks || '').includes('x30 two-tap ' + w)).map(x => ({ date: x.date, end: x.endDate || x.end2 || x.to, keys: Object.keys(x).join(',') })), who)))
}
await closeAll()
