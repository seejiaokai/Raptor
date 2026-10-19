import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.locator('#eWeek .day.peek[data-peek-day="0"]').first().click(); await sleep(1500)
await p.evaluate(() => window.scrollTo(0, 0))
const nav = await p.evaluate(() => [...document.querySelectorAll('button, a, [role=button]')].filter(e => e.offsetParent && /week|calendar|prev|‹|›/i.test(e.innerText + ' ' + e.title + ' ' + e.getAttribute('aria-label'))).map(e => e.tagName + '|' + e.id + '|' + e.className + '|' + JSON.stringify(e.dataset) + '|' + e.innerText.trim().slice(0, 30) + '|' + (e.title || '').slice(0, 60)))
console.log(nav.join('\n'))
await shot(p, 'x14-top')
await b.close()
