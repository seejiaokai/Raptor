import { L } from './h.mjs'
const { browser, page } = await L.open({ width: 1400, height: 900 })
await L.board(page, 4)
await L.tap(page, '[data-wvadd="4"]')
await page.getByRole('button', { name: 'Flying wave' }).click()
await page.waitForTimeout(600)
const chain = await page.evaluate(() => { let e = document.querySelector('#schedBoard [data-slot="4.0.0.0.w"]'); const o = []; while (e && e.id !== 'schedBoard') { o.push(e.tagName + '.' + e.className.split(' ').join('.') + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)); e = e.parentElement } return o })
console.log(chain.join('\n'))
await browser.close()
