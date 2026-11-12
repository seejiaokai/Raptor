/* rcsb-w1-oldwords v1 — W1: where does "printed B" appear in the app's pages (context), and does "printed B and its OIL" appear anywhere. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/oldwords')
console.log('rcsb-w1-oldwords v1')
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, j } = C
const w = await R.world('pc')
const { page } = w
await R.setLogic(w, 'oilFullMin', '5h')
for (const pg of ['logic', 'editsched', 'viewsched', 'leavewar', 'admin', 'help', 'inputs', 'quals']) {
  await L.go(page, pg); await sleep(700)
  const r = await page.evaluate(() => {
    const t = document.body.innerText.replace(/[\s ]+/g, ' ')
    const all = [...t.matchAll(/printed B/gi)].map(m => t.slice(Math.max(0, m.index - 90), m.index + 120))
    return { exact: /printed B and its OIL/i.test(t), n: all.length, ctx: all.slice(0, 3) }
  })
  console.log(pg, j(r))
}
await w.browser.close()
