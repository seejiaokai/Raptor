import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'ad', 'a', true)
await p.evaluate(() => window.go('admin')); await p.waitForTimeout(800)
await L.shot(p, 'x10-admin-phone')
console.log(await p.evaluate(() => { const e = document.querySelector('#accAddCs'); const r = e.getBoundingClientRect(); let a = e, chain = []; while (a && a !== document.body) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden' || a.hidden) chain.push(a.tagName + '#' + a.id + '.' + a.className + ' display=' + cs.display); a = a.parentElement } return JSON.stringify({ r, chain }) }))
console.log(await p.evaluate(() => [...document.querySelectorAll('#page-admin button, #page-admin [role=tab], #page-admin summary')].slice(0, 20).map(b => b.id + ':' + b.textContent.trim().slice(0, 30)).join(' | ')))
await browser.close()
