import { L, snap } from './h.mjs'
console.log('d2 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'leavewar'); await page.waitForTimeout(1500)
console.log(await page.evaluate(() => [...new Set([...document.querySelectorAll('#page-leavewar [data-testid]')].map(e => e.dataset.testid.replace(/\d{4}-\d\d-\d\d/, 'DATE')))].join(' | ')))
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-leavewar [data-testid^="fly-row"], #page-leavewar [data-testid^="group"]')].map(e => e.dataset.testid + ' :: ' + (e.innerText||'').slice(0,30).replace(/\s+/g,' ')).slice(0,30).join('\n')))
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-leavewar *')].filter(e => e.children.length <= 3 && /^(SXO|IP|OPS P|IWSO|OPS W|OCU|PERSONNEL|WSO)/i.test((e.innerText||'').trim().slice(0, 12)) && (e.innerText||'').length < 30).slice(0, 20).map(e => e.tagName + '.' + e.className + ' :: ' + e.innerText.replace(/\s+/g,' ')).join('\n')))
console.log(errors)
await browser.close()
