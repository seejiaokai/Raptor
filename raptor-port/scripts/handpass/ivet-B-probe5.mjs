import * as L from './ivet-B-lib.mjs'
const { sleep } = L
const browser = await L.launch()
const { page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', fresh: true, touch: true })
await L.toList(page, true)
for (let k = 0; k < 6; k++) await L.fileInput(page, true, { type: 'Training', d1: '2026-07-22', rmk: 'S59 crowd ' + k })
await L.toCal(page, true)
console.log(await page.evaluate(() => [...document.querySelectorAll('#inpCal *')].filter(e => e.children.length === 0 && /more|\+\d/.test(e.textContent)).map(e => e.tagName + '.' + e.className + '|' + e.getAttribute('data-testid') + '|' + e.textContent.trim()).join('\n')))
await page.screenshot({ path: L.OUT + '/probe5.png' })
await browser.close()
