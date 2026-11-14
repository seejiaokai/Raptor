console.log('rcf-w2-dbg2 v1')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg2')
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep } = W
const { DI, sortie, ground, readAll, toastText } = F
const browser = await W.launch()
const { page } = await W.world(browser)
const bane = await W.pid(page, 'Ranger'), stiff = await W.pid(page, 'Saber')
await W.openBoard(page, DI)
const s1 = await sortie(page, { who: bane, to: '1200', ld: '1300' })
const g1 = await ground(page, { prog: 'BRIEFING', str: '1200', end: '1230', who: bane })
async function drag(from, to, label) {
  const a = await from.boundingBox(), b = typeof to.x === 'number' ? to : await to.boundingBox()
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2, bx = b.x + (b.width || 0) / 2, by = b.y + (b.height || 0) / 2
  await page.mouse.move(ax, ay); await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(ax + (bx - ax) * i / 12, ay + (by - ay) * i / 12); await sleep(25) }
  await sleep(150); await page.mouse.up(); await sleep(500)
  console.log(label, 'toast:', await toastText(page))
}
const state = () => page.evaluate(([d]) => ({ f: window.DAYS[d].waves[0].formations[0].aircraft[0].p, g: window.DAYS[d].ground[0].who }), [DI])
console.log('before', JSON.stringify(await state()))
// drag Saber from the roster onto the sortie seat puck (swap)
await drag(page.locator(`#sbRoster .rpuck[data-person="${stiff}"]:visible`).first(), page.locator(`#schedBoard [data-slot="${DI}.0.0.0.p"] .puck:visible`).first(), 'roster->seat')
console.log('after roster->seat', JSON.stringify(await state()))
// drag the ground puck to empty space (removal)
const gp = page.locator(`#schedBoard [data-slot="g:${DI}.0"] .puck:visible`).first()
const nb = await page.locator('#schedBoard .sb-warn').first().boundingBox()
await drag(gp, { x: nb.x + 40, y: nb.y + nb.height + 6 }, 'ground puck->empty')
console.log('after removal', JSON.stringify(await state()))
await W.shot(page, 'after')
await browser.close()
