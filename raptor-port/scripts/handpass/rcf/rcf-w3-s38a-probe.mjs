/* rcf-w3 s38a probe v1 — Logic page dump */
process.env.RCF_RUN = 'probe'
const W = await import('./rcf-w3-lib.mjs')
const { L, say } = W
import { writeFileSync } from 'node:fs'
console.log('rcf-w3-s38a v1')
const { browser, page } = await W.openWorld()
await page.locator('a[data-page="logic"]:visible').first().click()
await page.waitForSelector('#page-logic.on')
await page.waitForTimeout(500)
const n = await page.locator('#page-logic details').count()
const sums = await page.evaluate(() => [...document.querySelectorAll('#page-logic details')].map((d, i) => i + ':' + ((d.querySelector('summary') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60) + (d.open ? ' [open]' : '')))
say('folds', n); say(sums.join('\n'))
const inputs = await page.evaluate(() => [...document.querySelectorAll('#page-logic input, #page-logic select')].filter(e => e.offsetWidth > 0).map(e => e.tagName + ' ' + (e.id || '') + ' ' + e.getAttributeNames().filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(' ') + ' val=' + e.value + ' | ' + ((e.closest('label,.lrow,.row,li,div') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 70)))
say(inputs.join('\n'))
await page.evaluate(() => document.querySelectorAll('#page-logic details').forEach(d => d.open = true))
const txt = await page.evaluate(() => document.querySelector('#page-logic').innerText)
writeFileSync(W.SHOTS + '/logic-text.txt', txt)
await browser.close()
