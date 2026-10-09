import * as L from './ivet-B-lib.mjs'
const { sleep, WIN } = L
const browser = await L.launch()
const { page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
await L.toList(page, true); await L.plus(page, true)
await page.selectOption('#inpEditType', 'ATT C')
await L.pick(page, '2026-07-14', true)
await L.attach(page, L.makePdf('probe.pdf'))
await page.locator('#inpEditSave').tap(); await sleep(800)
await page.locator('#inMedBtn').tap(); await sleep(1500)
console.log(await page.evaluate(() => [...document.querySelectorAll('.medcard')].map(e => e.outerHTML.slice(0, 900)).join('\n---\n')))
await page.screenshot({ path: L.OUT + '/probe2b.png' })
await browser.close()
