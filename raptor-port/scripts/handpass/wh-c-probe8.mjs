/* walker C — probe 8 (phone): the "Jump to a date" calendar's markup. Reads only. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
const b = p.locator('[aria-label="Jump to a date"]:visible').first()
console.log('cal buttons visible', await p.locator('[aria-label="Jump to a date"]:visible').count())
await b.click(); await L.sleep(600)
await H.pic(p, 'probe8-weekcal')
console.log(JSON.stringify(await p.evaluate(() => { const c = [...document.querySelectorAll('[data-cal]')].filter(e => e.offsetParent !== null); const host = c[0] && c[0].closest('[class*=cal], [id]'); return { n: c.length, sample: c.slice(0, 8).map(e => e.dataset.cal + '|' + e.tagName + '.' + e.className), host: host ? host.tagName + '#' + host.id + '.' + host.className : null, html: host ? host.outerHTML.slice(0, 1500) : '' } }), null, 1))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
