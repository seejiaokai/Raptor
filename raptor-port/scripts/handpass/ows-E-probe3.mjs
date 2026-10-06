/* walker E — probe (phone): which real control opens the Saturday board from the edit week */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, W, L, P } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(500)
await W.showDay(p, 5)
const btns = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] button, #eWeek .day[data-day="5"] [data-sbopen], #eWeek .day[data-day="5"] [data-open]')].filter(e => e.offsetParent !== null).map(e => ({ tag: e.tagName, txt: (e.innerText || '').trim().slice(0, 30), attrs: [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(' ') })))
console.log(JSON.stringify(btns, null, 1))
const pic = await P(p, 'probe-phone-week')
// try the day header
const hdr = p.locator('#eWeek .day[data-day="5"] .day-head, #eWeek .day[data-day="5"] h3, #eWeek .day[data-day="5"] [data-daytitle]').first()
console.log('hdr', await hdr.count())
const o = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] *')].filter(e => /openScheduler|sbopen|data-sb/.test(e.outerHTML.slice(0, 200))).slice(0, 5).map(e => e.outerHTML.slice(0, 160)))
console.log(JSON.stringify(o))
await browser.close()
