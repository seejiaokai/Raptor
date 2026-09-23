/* w3 item 18 — R11 / Fable #30: reload (or close) with an unsaved chart
   edit → the browser asks first (Playwright receives a `beforeunload` dialog);
   with nothing unsaved it does not. Staying keeps the edit; leaving loses it,
   and the chart still draws (its position lingers in the layout — harmless?). */
import { open, shot, save, log, login, toTracker, DESK } from './trk-lib.mjs'
import { sleep, menuItem, dlg, takeDialogs } from './trk-w3-lib.mjs'

const L = log()
const { browser, ctx, page, errors } = await open({ size: DESK, who: 'a' })
let seen = [], answer = 'dismiss'
takeDialogs(page, d => { seen.push(d.type() + (d.message() ? ': ' + d.message() : '')); (answer === 'accept' ? d.accept() : d.dismiss()).catch(() => {}) })

/* 1. nothing unsaved → reload → no question */
seen = []
await page.reload(); await login(page, 'a'); await toTracker(page)
L.ok('1. nothing unsaved: a reload asks nothing', !seen.length, JSON.stringify(seen))

/* 2. an unsaved chart edit → reload → asked; say STAY */
await menuItem(page, 'syl', 'arrangeBtn')
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'UNLOAD-1' }); await sleep(300)
await menuItem(page, 'syl', 'arrangeBtn')
L.note('2. unsaved edit made — ✓ Save changes shown', String(await page.locator('#saveChanges').count()))
seen = []; answer = 'dismiss'
await page.reload({ timeout: 4000 }).catch(e => L.note('2. reload after "stay"', 'did not complete (the page stayed): ' + e.message.split('\n')[0].slice(0, 80)))
await sleep(500)
L.ok('2. with an unsaved edit a reload ASKS first (beforeunload)', seen.some(s => /^beforeunload/.test(s)), JSON.stringify(seen))
L.ok('2. …answering "stay" keeps the page and the edit', (await page.locator('#flowSvg .ball[data-id="UNLOAD-1"]').count()) === 1 && (await page.locator('#saveChanges').count()) === 1, `UNLOAD-1 ${await page.locator('#flowSvg .ball[data-id="UNLOAD-1"]').count()}, Save ${await page.locator('#saveChanges').count()}`)
await shot(page, 'w3-18-stayed')

/* 3. reload again, say LEAVE */
seen = []; answer = 'accept'
await page.reload(); await login(page, 'a'); await toTracker(page)
L.ok('3. answering "leave": the page reloads and the unsaved ball is gone', seen.some(s => /^beforeunload/.test(s)) && !(await page.locator('#flowSvg .ball[data-id="UNLOAD-1"]').count()), JSON.stringify(seen) + ` · UNLOAD-1 ${await page.locator('#flowSvg .ball[data-id="UNLOAD-1"]').count()}`)
const balls = await page.locator('#flowSvg .ball').count()
await menuItem(page, 'syl', 'arrangeBtn'); await page.click('#fitBtn'); await sleep(400)
L.ok('3. …the chart still draws and ⤢ Fit works (the lost ball\'s position does not upset it)', balls > 100 && await page.evaluate(() => !!document.querySelector('#viewport')), `${balls} balls`)
await shot(page, 'w3-18-after-leave-fit')
await menuItem(page, 'syl', 'arrangeBtn')

/* 4. closing the tab with an unsaved edit */
await menuItem(page, 'syl', 'arrangeBtn')
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'UNLOAD-2' }); await sleep(300)
await menuItem(page, 'syl', 'arrangeBtn')
seen = []; answer = 'accept'
await page.close({ runBeforeUnload: true }); await sleep(800)
L.ok('4. closing the tab with an unsaved edit asks first', seen.some(s => /^beforeunload/.test(s)), JSON.stringify(seen))
L.note('errors', errors.filter(e => !/NATIVE DIALOG/.test(e)).join(' | ') || 'none')
save('w3-18-unload', { rows: L.rows })
await browser.close()
