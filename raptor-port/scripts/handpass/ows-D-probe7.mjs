import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, P } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const b = await p.evaluate(() => [...document.querySelectorAll('#page-editsched button, .weekbar button, [data-wk], #wkCal, [id*=Cal]')].filter(e => e.offsetParent !== null).slice(0, 25).map(e => `${e.tagName}|${e.id}|${e.className}|${(e.innerText || '').trim().slice(0, 20)}|${e.getAttribute('aria-label') || ''}|${e.dataset.wk || ''}`))
console.log(JSON.stringify(b, null, 0))
const cal = p.locator('button[aria-label*="alendar"], #weekCalBtn, .weekcal-btn, [data-testid*="week-cal"]').first()
console.log('cal count', await cal.count())
await browser.close()
