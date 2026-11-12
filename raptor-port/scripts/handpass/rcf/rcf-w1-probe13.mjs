/* probe 13: is the Undo button covered by the search box on the board, with and without OIL Earn open */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe13-' + KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 5)
const probe = async (tag) => {
  const r = await page.evaluate(() => {
    const out = {}
    for (const id of ['undoBtn', 'redoBtn', 'searchB', 'sbOil', 'sbDone']) {
      const e = [...document.querySelectorAll('#' + id)].find(x => x.offsetWidth)
      if (!e) { out[id] = 'none'; continue }
      const b = e.getBoundingClientRect()
      const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
      out[id] = `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)} top=${top ? (top.id || top.className || top.tagName) : 'null'}`
    }
    out.vw = innerWidth + 'x' + innerHeight
    return out
  })
  console.log(tag, JSON.stringify(r))
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${tag}.png` })
}
await probe('closed')
const b = page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
if (w.phone) await b.tap(); else await b.click(); await sleep(800)
await probe('oil-open')
await w.browser.close()
