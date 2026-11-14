console.log('rcf-w2-dbg3 v1')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg3')
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep } = W
const { DI, sortie, ground, toastText } = F
const browser = await W.launch()
const { page } = await W.world(browser)
const bane = await W.pid(page, 'Ranger')
await W.openBoard(page, DI)
const s1 = await sortie(page, { who: bane, to: '1200', ld: '1300' })
const st = () => page.evaluate(([d]) => window.DAYS[d].waves[0].formations[0].aircraft[0].p, [DI])
console.log('before', await st())
const pk = page.locator(`#schedBoard [data-slot="${DI}.0.0.0.p"] .puck:visible`).first()
console.log('puck box', JSON.stringify(await pk.boundingBox()))
const nb = await page.locator('#schedBoard .sb-warn').first().boundingBox()
console.log('warn box', JSON.stringify(nb))
const a = await pk.boundingBox()
await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
for (let i = 1; i <= 12; i++) { await page.mouse.move(a.x + a.width / 2 + 5 * i, a.y + a.height / 2 + 10 * i); await sleep(25) }
await sleep(150)
await W.shot(page, 'mid-drag')
await page.mouse.up(); await sleep(700)
console.log('after drag-to-empty-in-main', JSON.stringify(await st()), await toastText(page))
await W.shot(page, 'after')
await browser.close()
