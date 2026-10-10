import * as L from './ivet-B-lib.mjs'
const { sleep } = L
const browser = await L.launch()
const { page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', fresh: true, touch: true })
await L.toList(page, true)
for (let k = 0; k < 6; k++) await L.fileInput(page, true, { type: 'Training', d1: '2026-07-22', rmk: 'S59 crowd ' + k })
console.log('records on Jul 22', await page.evaluate(() => window.INPUTS.filter(r => r.date === 'Jul 22' || (r.endDate && 0)).map(r => r.type + '|' + window.PEOPLE[r.person]?.cs + '|' + (r.remarks||'')).join('; ')))
await L.toCal(page, true)
console.log('bars in 22 column + more', await page.evaluate(() => { const c = document.querySelector('#inpCal [data-icday="2026-07-22"]').getBoundingClientRect(); return [...document.querySelectorAll('.ib-bar, .ib-more')].filter(b => { const r = b.getBoundingClientRect(); return r.left >= c.left - 2 && r.left < c.right && r.top > c.top && r.top < c.bottom }).map(b => b.textContent.trim()) }))
await page.locator('.ib-more').first().tap(); await sleep(500)
console.log('cards', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(c => c.querySelector('[data-testid="idy-who"]').textContent + '|' + (c.querySelector('[data-testid="idy-rmk"]')?.textContent||''))))
await browser.close()
