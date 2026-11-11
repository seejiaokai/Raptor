console.log('rcf-w2-dbg5 v1 — Logic page SC MAIN clashes')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg5')
const W = await import('./rcf-w2-lib.mjs')
const { L, sleep } = W
const browser = await W.launch()
const { page } = await W.world(browser)
await page.locator('a[data-page="logic"]:visible').first().click()
await page.waitForSelector('#page-logic.on'); await sleep(500); await page.locator('#lgEdit').click(); await sleep(400)
const html = await page.evaluate(() => {
  const els = [...document.querySelectorAll('#page-logic [data-lgname]')].filter(e => e.dataset.lgname === 'SC MAIN clashes')
  const e = els[0]; if (!e) return 'not found'

  return e.outerHTML.slice(0, 2500)
})
console.log(html)
await W.shot(page, 'logic')
await browser.close()
