import { L, snap } from './h.mjs'
const { browser, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'quals')
await page.screenshot({ path: process.env.HP_SHOTS + '/explore9a.png' })
const t = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-person="salsa"], [data-pid="salsa"], tr')].filter(x => /Saint/.test(x.innerText||'')).slice(0,3); return e.map(x => x.tagName + '.' + x.className + ' :: ' + x.outerHTML.slice(0, 1500)) })
console.log(t.join('\n---\n'))
console.log(errors)
await browser.close()
