// shr-a-probe5 — walker A's look (no assertions): who "us" is, and the doors a member has to the schedule's day.
import { L, J, sleep, world, fixture, TAG } from './shr-a-lib.mjs'
console.log('shr-a-probe5 v1', TAG)
const w = await world(); const p = w.page
await fixture(w); await sleep(1200)
await L.signIn(w, 'us')
console.log('PAGE', await p.evaluate(() => window.CURPAGE))
console.log('WHO', await p.evaluate(() => [...document.querySelectorAll('[class*="badge"], [id*="user"], [class*="who"]')].filter(e => e.offsetWidth).map(e => e.id + '|' + e.className + '|' + e.textContent.trim().slice(0, 40)).slice(0, 10)))
await p.screenshot({ path: `${L.OUT}/home.png` })
await p.locator('#burger').click().catch(() => {}); await sleep(600)
console.log('MENU', J(await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => e.offsetWidth).map(e => (e.getAttribute('data-go') || e.id || '') + '|' + e.textContent.trim().slice(0, 30)))))
await p.screenshot({ path: `${L.OUT}/menu.png` })
await L.finish()
