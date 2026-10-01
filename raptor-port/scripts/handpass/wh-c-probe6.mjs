/* walker C — probe 6: the changes window's own markup (reads only, after one hide). */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
const s0 = await C.see(p, '#eWeek', 1, /Long work day/i)
await H.tapLine(p, '#eWeek', 1, s0.line.ix); await L.settle(p)
await p.locator('#histBtn').click(); await L.sleep(800)
console.log(JSON.stringify(await p.evaluate(() => { const e = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /Mark all as seen/i.test(x.innerText || ''))[0]; if (!e) return 'no button'; const chain = []; let a = e; while (a && a !== document.body) { chain.push(a.tagName + '#' + a.id + '.' + String(a.className).slice(0, 40)); a = a.parentElement } const win = e.closest('[id]'); return { chain, winId: win && win.id, html: (win ? win.outerHTML : '').slice(0, 3500) } }), null, 1))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
