import { world, toLeaveWar, tid, press, pic, sleep, closeAll } from './cal-C-lib.mjs'
const { page } = await world('desk'); await toLeaveWar(page)
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].filter(e => { const r = e.getBoundingClientRect(); return r.x > 470 && r.y > 500 && r.y < 560 && r.width > 0 }).slice(0, 6).map(e => e.getAttribute('data-testid') + ' ' + Math.round(e.getBoundingClientRect().x) + ',' + Math.round(e.getBoundingClientRect().y))))
await closeAll()
