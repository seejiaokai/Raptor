/* walker C — probe 5: two schedulers in two tabs of one browser. Does tab A learn of B's hide by itself (the sync dot),
   and what does the changes window look like? */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const { browser, ctx, p, errors } = await H.world({ who: 'a' })
console.log('HEX ROW', await C.makeHexAdmin(p))
await L.go(p, 'editsched')
const q = await C.secondPage(ctx, errors, C.HEX)
console.log('B is', JSON.stringify(await q.evaluate(() => ({ badge: (document.querySelector('#roleBadge') || {}).innerText, me: window.raptorMe ? window.raptorMe() : null, tabs: [...document.querySelectorAll('[data-go]')].filter(e => e.offsetParent !== null).map(e => e.dataset.go) }))))
console.log('A is', JSON.stringify(await p.evaluate(() => ({ badge: (document.querySelector('#roleBadge') || {}).innerText, me: window.raptorMe ? window.raptorMe() : null }))))
await L.go(q, 'editsched')
const RE = /Long work day/i
const a0 = await C.see(p, '#eWeek', 1, RE, 'wolf'), b0 = await C.see(q, '#eWeek', 1, RE, 'wolf')
console.log('A0', C.say(a0), '\nB0', C.say(b0))
await H.tapLine(p, '#eWeek', 1, a0.line.ix); await L.settle(p)
console.log('A hid. sync dot A:', JSON.stringify(await p.evaluate(() => { const e = document.querySelector('#fastSync'); return e ? e.title + '|' + e.innerText + '|' + e.className : null })))
for (const s of [1, 4, 8]) { await L.sleep(s * 1000); console.log(`B after ~${s}s more, no refresh:`, C.say(await C.see(q, '#eWeek', 1, RE, 'wolf'))) }
/* B's 1-second sync */
await q.locator('#fastSync').click(); await L.sleep(3000)
console.log('B with fast sync on, 3s:', C.say(await C.see(q, '#eWeek', 1, RE, 'wolf')), JSON.stringify(await q.evaluate(() => { const e = document.querySelector('#fastSync'); return e.title + '|' + e.className })))
await H.pic(q, 'probe5-B-after-sync')
const ch = await C.changesText(p)
console.log('CHANGES WINDOW (A)', JSON.stringify(ch).slice(0, 1500))
await H.pic(p, 'probe5-A-changes')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
