import * as L from './gi-w3-lib.mjs'
const { open, fileInput, DESK, errs, shot, counts, fmt, toWeek, toBoard, csId } = L
const { ctx, page } = await open(DESK)
await fileInput(page, { type: 'Duty', people: ['Drifter', 'Ranger'], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range duty', oil: 'yes' })
await toWeek(page)
const sat = () => page.locator('#eWeek .day:not(.peek)').nth(5).locator('.sec-grnd .pl-row', { hasText: 'RANGE DUTY' }).locator('.puck', { hasText: 'Drifter' }).first()
await L.dragNameOnto(page, 'Hunter', sat())
console.log('toast', await L.toastText(page), '| question?', await page.locator('[data-testid="oilconf"]').count())
console.log('Hunter rec', await page.evaluate(() => window.INPUTS.filter(i => i.title === 'Range duty').map(i => window.PEOPLE[i.person].cs + ':' + JSON.stringify(i.oil))))
console.log('row', JSON.stringify(await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][5]; return [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim())) })))
console.log('publish sat', JSON.stringify(await L.signAndPublish(page, 5)))
const ids = await Promise.all(['Drifter', 'Hunter', 'Ranger'].map(c => csId(page, c)))
console.log('lw', JSON.stringify(await (async () => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
  return page.evaluate(([ids, d]) => Object.fromEntries(ids.map(id => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return [window.PEOPLE[id].cs, c ? { text: c.innerText.trim(), cls: c.className.slice(0, 80) } : 'NO CELL'] })), [ids, '2026-07-18'])
})()))
await shot(page, 'explore-lw')
console.log('LW buttons', await page.evaluate(() => [...document.querySelectorAll('#page-leavewar button, #page-leavewar [role=tab]')].map(b => (b.dataset.testid || '') + '|' + b.textContent.trim().slice(0, 20)).filter(x => /oil|track|award/i.test(x))))
console.log('errs', errs)
process.exit(0)
