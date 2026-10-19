import { open, go, version, shot, tapBox, bringLow } from './kbs-A-lib.mjs'
version('a12b')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(20)
await bringLow(cell, 800)
await page.evaluate(() => { window.__log = []; const h = e => window.__log.push(e.type + ' ' + (e.target.tagName + '.' + e.target.className) + ' t=' + Math.round(performance.now())); document.addEventListener('focusin', h, true); document.addEventListener('focusout', h, true); window.__box = [...document.querySelectorAll('#page-quals input.qinit:not(.qflt)')][20] })
await tapBox(page, cell); await page.waitForTimeout(500)
console.log('after tap active', await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className + ' sameBox=' + (document.activeElement === window.__box)))
await page.evaluate(() => { const v = window.__vv; window.__log.push('KEYS UP t=' + Math.round(performance.now())); v.height = innerHeight - 336; v.dispatchEvent(new Event('resize')) })
for (const ms of [50, 150, 300, 600]) { await page.waitForTimeout(ms); console.log(ms, await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className + ' sameBox=' + (document.activeElement === window.__box) + ' connected=' + window.__box.isConnected)) }
console.log(await page.evaluate(() => window.__log.join('\n')))
await browser.close()
