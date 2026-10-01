/* walker C — probe 3: on the scheduler's View-only Sched, where are the ✕ / ↺ buttons the page still holds? Reads only
   after one hide. */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
const s0 = await C.see(p, '#eWeek', 1, /Long work day/i, 'wolf')
await H.tapLine(p, '#eWeek', 1, s0.line.ix); await L.settle(p)
await W.boardOn(p, 1); await L.sleep(400); await W.boardOff(p)
await L.go(p, 'viewsched')
await H.openList(p, '#vWeek', 1)
const dump = () => p.evaluate(() => [...document.querySelectorAll('[data-woff]')].map(e => { const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const cs = getComputedStyle(e); let a = e, vis = true; while (a && a !== document.body) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden') { vis = false; break } a = a.parentElement } return { woff: e.dataset.woff, txt: e.innerText, in: [...(function* () { let x = e; while (x) { if (x.id) yield x.id; x = x.parentElement } })()].join('<'), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], offsetParent: !!e.offsetParent, visChain: vis, vis: cs.visibility, hitIsIt: hit === e, hitIn: hit ? (hit.closest('[id]') || {}).id : null } }))
console.log('ADMIN VIEW-ONLY', JSON.stringify(await dump(), null, 0))
await H.pic(p, 'probe3-admin-viewonly')
await C.badge(p)
await H.openList(p, '#vWeek', 1)
console.log('ADMIN MEMBER VIEW', JSON.stringify(await dump(), null, 0))
console.log('PAGES', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[id^="page-"], #schedBoard')].map(e => e.id + ':' + getComputedStyle(e).display + ':' + e.offsetWidth))))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
