import { world, sleep, browser, PHONE } from './or-E-lib.mjs'
const w = await world({ size: PHONE, touch: true, who: 'ad', pass: 'a', tag: 'x3' })
const { page, press } = w
const rid = await w.csId('Ranger')
// (a) Saber files a Saturday Training for Ranger and closes the question
await w.toMonth(); await w.openDay('2026-07-18')
await press(page.locator('#icPopAdd')); await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
await page.locator('#inpEditPop #inpEditType').selectOption('Training')
await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
for (const id of await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))) if (id !== rid) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
if (await page.locator(`#inpEditPop [data-pp="${rid}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${rid}"]`))
await page.locator('#inpEditPop #inpEditOwnTitle').first().fill('Sat A')
await page.locator('#inpEditPop #inpEditStart').fill('09:00'); await page.locator('#inpEditPop #inpEditEnd').fill('10:00')
await press(page.locator('#inpEditSave')); await sleep(600)
console.log('(a) sheet', await page.locator('[data-testid="oilconf"]').count())
await press(page.locator('[data-testid="oilconf"] button').first()); await sleep(500)
console.log('(a) after cross: sheet', await page.locator('[data-testid="oilconf"]').count(), 'form', await page.locator('#inpEditPop:visible').count(), 'rec', JSON.stringify(await w.rec('Sat A')))
// close the form, check records
const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(300) }
await w.closeDay().catch(() => {})
console.log('(a) after closing the form: rec', JSON.stringify(await w.rec('Sat A')))
// (b) file on a weekday (Wed 15) for Ranger, then re-date to Sat 18 in the window
await w.fileIt({ pick: ['Ranger'], title: 'Wed B', from: '09:00', to: '10:00', kind: 'Training', oil: 'no' })
console.log('(b) filed', JSON.stringify(await w.rec('Wed B')))
await w.toMonth(); await w.openDay('2026-07-15')
const r = await w.rec('Wed B')
await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${r.iid}"]`).first()); await page.waitForSelector('#inpEditPop #inpEditStart')
// change the date through the calendar in the window
const cell = page.locator('#inpEdCal [data-cal="2026-07-18"]').first()
console.log('(b) cal cell present', await cell.count())
if (await cell.count()) { await cell.scrollIntoViewIfNeeded(); await press(cell); await sleep(300) }
await press(page.locator('#inpEditSave')); await sleep(600)
console.log('(b) sheet after re-date save', await page.locator('[data-testid="oilconf"]').count(), JSON.stringify(await w.rec('Wed B')))
if (await page.locator('[data-testid="oilconf"]').count()) { await press(page.locator('[data-testid="oilconf"] button').first()); await sleep(500); console.log('(b) after cross: form', await page.locator('#inpEditPop:visible').count(), JSON.stringify(await w.rec('Wed B'))) }
await browser.close()
