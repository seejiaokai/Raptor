import * as L from './it-B-lib.mjs'
const W = await L.mk('desk')
const p = W.page
const ranger = await L.csId(p, 'Ranger')
await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
await L.openBoard(W, 2)
if (await p.locator('#schedBoard [data-pitog]').count()) { await p.locator('#schedBoard [data-pitog]').first().click(); await L.sleep(500) }
const out = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow')].map(r => ({ text: r.innerText.replace(/\s+/g, ' ').slice(0, 120), btns: [...r.querySelectorAll('button')].map(b => b.outerHTML.slice(0, 140)) })))
console.log(JSON.stringify(out, null, 1))
await L.shot(p, 'probe7-board-inputs')
// toasts spy
await p.evaluate(() => { window.__t = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.textContent && window.__t[window.__t.length - 1] !== t.textContent) window.__t.push(t.textContent) }).observe(document.body, { subtree: true, childList: true, characterData: true }) })
const x = p.locator(`#schedBoard [data-acc="x"][data-acck="${r.iid}"]`).first()
console.log('takeoff btn', await x.count())
if (await x.count()) { await x.click(); await L.sleep(800) }
console.log('toasts', JSON.stringify(await p.evaluate(() => window.__t)))
const out2 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow')].map(r => ({ text: r.innerText.replace(/\s+/g, ' ').slice(0, 120), btns: [...r.querySelectorAll('button')].map(b => b.outerHTML.slice(0, 140)) })))
console.log(JSON.stringify(out2, null, 1))
await L.shot(p, 'probe7-after-takeoff')
await W.browser.close()
