import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.locator('#eWeek .day.peek[data-peek-day="0"]').first().click(); await sleep(1500)
await shot(p, 'x13-after-peek-click')
const info = await p.evaluate(() => ({ days: window.DAYS.map(d => d.waves.length), head: [...document.querySelectorAll('#eWeek .day-head')].slice(0, 3).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 80)), btns: [...document.querySelectorAll('#eWeek button, #vWeek button, .wkbar button, [data-wk]')].filter(e => e.offsetParent && /week|prev|next|‹|›|back/i.test(e.innerText + e.title + JSON.stringify(e.dataset))).map(e => e.className + '|' + JSON.stringify(e.dataset) + '|' + e.innerText.trim().slice(0, 30) + '|' + e.title.slice(0, 50)) }))
console.log(JSON.stringify(info, null, 1))
await b.close()
