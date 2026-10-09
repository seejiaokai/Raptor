import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
await L.fileNew(w, { iso: '2026-07-22', type: 'ATT C', doc: L.SAMPLE })
const att = await L.recBy(p, { type: 'ATT C', date: 'Jul 22' })
await L.switchUser(w, 'us')
await L.toList(w); await L.showEveryone(w)
await p.locator(`#inBody tr[data-iid="${att.iid}"] [data-testid="in-open"]`).click(); await L.win(p).waitFor(); await sleep(300)
console.log(JSON.stringify(await p.locator(L.WIN).evaluate(w => [...w.querySelectorAll('button')].map(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: e.innerText.trim().slice(0, 20), id: e.id || e.dataset.testid || e.className.slice(0, 20), inert: !!e.closest('[inert]'), vis: !!e.offsetParent, hittable: x === e || e.contains(x) } }))))
const add = p.locator(`${L.WIN} button`, { hasText: /Add/ }).first()
let chooser = false
p.once('filechooser', () => { chooser = true })
await add.click({ force: true, timeout: 2000 }).catch(e => console.log('addclick', String(e).slice(0, 80)))
await sleep(500)
console.log('file chooser opened by Add:', chooser)
const x = p.locator(`${L.WIN} .dchip button, ${L.WIN} [aria-label*="emove"]`).first()
console.log('x count', await x.count())
console.log('saved docId', (await L.recId(p, att.iid)).docId)
console.log(await p.locator(L.WIN).evaluate(w => ((w.querySelector('.inped-hint, .inped-note, .inped-warn') || {}).textContent || '')), '|', await p.evaluate(() => [...document.querySelectorAll('.inped-win *')].filter(e => /only for yourself/.test(e.textContent) && e.children.length === 0).map(e => e.className)))
await w.browser.close()
