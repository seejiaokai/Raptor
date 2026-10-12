import { open, fileInput, toWeek, toBoard, shot, saveRes, errs, browser, toast, inputsOf, dragOntoRow } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'L13 meeting' })
R.addToast = await dragOntoRow(page, 'Hex', 'L13 MEETING')
await toWeek(page)
const row = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-grnd .pl-row', { hasText: 'L13 MEETING' })
await row.locator('.puck', { hasText: 'Hunter' }).first().click({ button: 'right' }); await page.waitForTimeout(600)
R.rcToast = await toast(page)
/* control: a plain ground row's remark typed, then History on */
const ctl = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-grnd .pl-row', { hasText: 'NAV-SYS' }).locator('[data-txt$=".rmks"]').first()
await ctl.scrollIntoViewIfNeeded(); await ctl.click(); await page.keyboard.type('control remark'); await page.keyboard.press('Tab'); await page.waitForTimeout(600)
await page.locator('#histBtn').click(); await page.waitForTimeout(1200)
R.histOn = await page.locator('#histBtn').getAttribute('aria-pressed')
R.allDots = await page.evaluate(() => [...document.querySelectorAll('[data-histdot]')].map(e => ({ row: e.closest('.pl-row, .sb-arow')?.innerText.replace(/\s+/g, ' ').slice(0, 50) || null, puck: e.closest('.puck')?.innerText.replace(/\s+/g, ' ').trim() || null, attr: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 80), vis: !!e.offsetParent })))
await row.scrollIntoViewIfNeeded()
await page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-grnd').screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/L/l13-2b-ground-history-on-control.png' })
R.chgList = await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 600) : null })
/* All changes tab */
const tab = page.locator('.chgwin .win-tab', { hasText: /All changes/ }); if (await tab.count()) { await tab.first().click(); await page.waitForTimeout(500) }
R.allChanges = await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 900) : null })
await shot(page, 'l13-6-allchanges')
/* hover the L13 row's pucks and name for a bubble */
const names = [['name', row.locator('.nm .ntx').first()], ['Hex puck', row.locator('.puck', { hasText: 'Hex' }).first()], ['Drifter puck', row.locator('.puck', { hasText: 'Drifter' }).first()], ['start box', row.locator('[data-txt$=".str"]').first()]]
R.hovers = []
for (const [n, loc] of names) { await loc.hover().catch(() => {}); await page.waitForTimeout(500); R.hovers.push({ n, bubble: await page.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim())) }) }
saveRes('L13b', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
