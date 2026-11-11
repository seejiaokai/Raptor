/* rcf-w1 probe 7 — why the event sheet does not open to remove a PH */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe7')
console.log('rcf-w1-probe7 v1')
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world('desktop')
const { page } = w
const ISO = '2026-07-17'
console.log(JSON.stringify(await X.lwEvent(w, ISO, 'PH')))
await W4.lwOpen(page, ISO)
const ev = page.locator(`[data-testid="event-0-${ISO}"]`).first()
console.log('event cell', await ev.innerText(), await ev.getAttribute('class'), JSON.stringify(await ev.boundingBox()))
await ev.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
await ev.click(); await sleep(800)
await X.pic(page, 'after-click')
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].map(e => e.getAttribute('data-testid') + ':' + (e.offsetWidth ? 'v' : 'h')).filter(s => !/^event-0-/.test(s)).join(' ')))
console.log(await page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return e ? e.outerHTML.slice(0, 200) : '' }))
await w.browser.close()
