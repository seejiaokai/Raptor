import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const ranger = await L.pid(p, 'Ranger')
await L.fileNew(w, { iso: '2026-07-21', type: 'Duty', person: ranger, s: '09:00', e: '10:00' })
const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 21', person: ranger })
await L.openFromList(w, rec.iid)
await p.fill('#inpEditRmk', 'draft remark')
const badge = p.locator('#roleBadge')
console.log('badge count', await badge.count(), 'visible', await badge.isVisible().catch(() => false))
const bb = await badge.boundingBox().catch(() => null)
console.log('box', bb)
console.log(await p.evaluate(() => { const b = document.querySelector('#roleBadge'); if (!b) return null; const r = b.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { hit: x ? (x.id || x.className) : null, self: x === b || b.contains(x) } }))
await L.pic(w, 'x10-open')
await p.locator('#burger').tap().catch(e => console.log('burger', String(e).slice(0, 100))); await sleep(500)
await L.pic(w, 'x10-burger')
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.id || '') + ':' + b.innerText.trim().slice(0, 25)).join(' | ')))
await w.browser.close()
