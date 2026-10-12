import * as L from './on-C-lib.mjs'
const { tid, shot } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const F = []
const tr = await L.fileIt(page, L.FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
F.push('pub ' + JSON.stringify(await L.signAndPublish(page, L.FRI_DI)))
/* look at the issued Original version (the app's own read-only look) */
await L.toWeek(page)
const m = page.locator(`[data-planmenu="${L.FRI_DI}"]`).first(); await m.scrollIntoViewIfNeeded(); await m.click(); await page.waitForTimeout(500)
await page.locator('.wavemenu button', { hasText: /^Original/ }).first().click(); await page.waitForTimeout(900)
const head = await page.evaluate(di => { const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]; return d.innerText.slice(0, 260).replace(/\s+/g, ' ') }, L.FRI_DI)
F.push('week while looking at Original: ' + head)
const restore = await page.locator('.dprev-restore').count()
F.push('a "load onto working copy" button on the look: ' + restore + (restore ? ' text "' + (await page.locator('.dprev-restore').first().innerText()).replace(/\s+/g, ' ') + '"' : ''))
await shot(page, 'C6-1-looking-at-original')
const boardTry = await page.evaluate(() => { try { return typeof window.openScheduler } catch (e) { return 'err' } })
/* the week is a look at an issued version: is the week itself locked? what controls does a person have? */
F.push('controls in the looked-at day: ' + await page.evaluate(di => { const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]; return JSON.stringify({ editable: d.querySelectorAll('[contenteditable=true]').length, buttons: d.querySelectorAll('button').length }) }, L.FRI_DI))
/* now the holiday */
await L.fileOutHoliday(page, L.FRI, 'National Day')
const listUp = await tid(page, 'win-oilday').count()
const lines = await (async () => { await page.locator('.bellbtn:visible').first().click(); await page.waitForTimeout(400); const l = await tid(page, 'bell-list').locator('.bl-line').allInnerTexts().catch(() => []); return l.map(x => x.replace(/\s+/g, ' ')) })()
F.push(`holiday declared while the look is on: the one list up = ${listUp}; Saber's bell lines ${JSON.stringify(lines)}; bell lit = ${await page.locator('.bellbtn.on:visible').count()}`)
await shot(page, 'C6-2-after-holiday-bell')
console.log('FACTS\n' + F.join('\n'))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
