import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00', oil: 'yes' })
await L.switchUser(w, 'us')
await L.openByText(w, 'Ace, Ranger, Saber')
const dis = await p.locator(L.WIN).evaluate(w => [...w.querySelectorAll('input,select,textarea,button')].map(e => (e.id || e.dataset.testid || e.dataset.pp || e.className.slice(0, 20)) + ':' + (e.disabled ? 'D' : 'e')).join(' '))
console.log(dis)
const info = await p.evaluate(() => [...document.querySelectorAll('[data-testid="oil-revise"], [data-testid="inped-takeout"]')].map(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { id: e.dataset.testid, vis: !!e.offsetParent, r: [r.left, r.top, r.width, r.height].map(Math.round), hit: x ? (x.id || x.className || x.tagName) : null, hitIsSelf: x === e || e.contains(x), parent: e.parentElement.className, txt: e.parentElement.innerText.replace(/\n/g, ' ').slice(0, 60) } }))
console.log(JSON.stringify(info, null, 1))
await L.pic(w, 'x3-open')
await p.locator('[data-testid="oil-revise"]').first().scrollIntoViewIfNeeded()
const info2 = await p.evaluate(() => [...document.querySelectorAll('[data-testid="oil-revise"], [data-testid="inped-takeout"]')].map(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { id: e.dataset.testid, r: [r.left, r.top, r.width, r.height].map(Math.round), hit: x ? (x.id || x.className || x.tagName) : null, hitIsSelf: x === e || e.contains(x) } }))
console.log(JSON.stringify(info2))
await L.pic(w, 'x3-scrolled')
console.log(w.errors)
await w.browser.close()
