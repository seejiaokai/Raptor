import { world, pic, sleep, go } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p15'
const { page } = w
await go(page, 'leavewar'); await sleep(1000)
await page.getByRole('button', { name: /OIL tracker/i }).first().click(); await sleep(900)
await page.locator('[data-testid="oil-sheet"]').getByText('Reaper', { exact: true }).first().click(); await sleep(800)
await pic(w, 'credit-dialog')
console.log(await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .bidsheet, .sheet, .floatwin, [data-testid]')].filter(e => /credit|award|amount/i.test(e.innerText || '')).map(e => (e.dataset.testid || '') + '|' + e.className.slice(0, 40) + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 400)).slice(-4)))
console.log(await page.evaluate(() => [...document.querySelectorAll('input, select, textarea, button')].filter(e => e.offsetParent && /oil|credit|award/i.test((e.dataset.testid || '') + e.id + e.name)).map(e => e.tagName + '|' + (e.dataset.testid || e.id) + '|' + e.type + '|' + e.value + '|' + e.innerText.slice(0, 30)).slice(0, 30)))
await w.browser.close()
