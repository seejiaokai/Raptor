import * as L from './it-B-lib.mjs'
const W = await L.mk('desk')
const p = W.page
const ranger = await L.csId(p, 'Ranger')
await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
await L.retitle(W, r.iid, '2026-07-15', 'Games afternoon')
await L.retitle(W, r.iid, '2026-07-15', '')
await L.editWeek(p); await L.showDay(p, 2)
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /hist|change|clock/i.test((b.title || '') + (b.getAttribute('aria-label') || '') + b.id + b.className)).map(b => b.tagName + '#' + b.id + '.' + b.className + ' title=' + b.title + ' aria=' + b.getAttribute('aria-label'))))
const hb = p.locator('button[title*="istory" i]:visible, button[aria-label*="istory" i]:visible, #histBtn:visible, #chgBtn:visible').first()
console.log('hist btn', await hb.count())
if (await hb.count()) { await hb.click(); await L.sleep(600) }
await L.shot(p, 'probe9-hist-open')
console.log(await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 800) : 'no chgwin' }))
const tab = p.locator('.chgwin button', { hasText: /All changes/ }).first()
if (await tab.count()) { await tab.click(); await L.sleep(500) }
console.log(await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 1200) : 'no chgwin' }))
await L.shot(p, 'probe9-allchanges')
console.log(await p.evaluate(() => [...document.querySelectorAll('[class*=hdot], [class*=golddot], [class*=gdot], [data-hist], [data-hdot]')].slice(0, 10).map(e => e.tagName + '.' + e.className + ' ' + Object.keys(e.dataset).join(','))))
await W.browser.close()
