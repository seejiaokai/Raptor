import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00', oil: 'yes' })
console.log(JSON.stringify(await L.recAll(p, { type: 'Duty', date: 'Jul 18' })))
await L.switchUser(w, 'us')
await L.toList(w)
const recs = await L.recAll(p, { type: 'Duty', date: 'Jul 18' })
const ranger = await L.pid(p, 'Ranger')
const mine = recs.find(r => r.person === ranger)
console.log('mine', mine && mine.iid)


console.log(await p.evaluate(() => [...document.querySelectorAll('#inList [data-testid^="inl-row-"]')].map(e => e.innerText.replace(/\n/g, ' | ')).slice(0, 30)))
await L.openByText(w, "Ace, Ranger, Saber")
await L.pic(w, 'x2-list')

console.log(await p.locator(L.WIN).innerText())
console.log(await p.locator(L.WIN).evaluate(w => ({ save: !!w.querySelector('#inpEditSave'), del: !!w.querySelector('#inpEditDel'), cal: !!w.querySelector('#inpEdCal'), revise: !!w.querySelector('[data-testid="oil-revise"]'), takeout: !!w.querySelector('[data-testid="inped-takeout"]'), ro: (w.querySelector('[data-testid="inped-ro"]') || {}).textContent })))
await L.pic(w, 'x2-win')
console.log(w.errors)
await w.browser.close()
