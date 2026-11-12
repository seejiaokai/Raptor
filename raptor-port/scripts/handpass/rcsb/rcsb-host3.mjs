/* rcsb-host3 v1 — the host reproduces W1's "AL1 · 14 changes, then 16 after Undo + Redo" (S3) and reads which lines
   the two extra are. usage (from raptor-port/): node scripts/handpass/rcsb/rcsb-host3.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-13-rules-check-small-batch/host/s3')
console.log('rcsb-host3 v1')
const C = await import('./w1/rcsb-w1-common.mjs')
const { R, X, L, sleep, j } = C
const w = await R.world('pc')
const { page } = w
const SUN = 6
const ranger = w.ID('Ranger')
await C.build(w, SUN, '10:00', '11:30', ranger)
await C.publish(w, SUN)
await R.setLogic(w, 'oilFullMin', '7h')
await L.go(page, 'editsched'); await sleep(500)
await C.publish(w, SUN)
async function lines(tag) {
  await L.go(page, 'editsched'); await sleep(500)
  const b = page.locator(`#eWeek .day[data-day="${SUN}"] .dpend:visible`).first()
  const headTxt = await b.innerText()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await b.click(); await sleep(800)
  const tab = page.locator('.chgwin:visible').getByText(/All changes/).first()
  if (await tab.count()) { await tab.click(); await sleep(500) }
  const body = await page.locator('.chgwin:visible').first().innerText()
  await R.shot(page, tag + '-changes')
  await page.keyboard.press('Escape'); await sleep(400)
  if (await page.locator('.chgwin:visible').count()) { await page.keyboard.press('Escape'); await sleep(400) }
  console.log(tag, 'HEAD', JSON.stringify(headTxt.replace(/\s+/g, ' ')))
  return { head: headTxt.replace(/\s+/g, ' '), body }
}
const a = await lines('h3a-after-al1')
await X.undoBtn(w, 'undo'); await sleep(500)
const u = await lines('h3b-after-undo')
await X.undoBtn(w, 'redo'); await sleep(500)
const r = await lines('h3c-after-redo')
writeFileSync(process.env.HP_SHOTS + '/h3-lines.txt', ['== after AL1', a.head, a.body, '== after undo', u.head, u.body, '== after redo', r.head, r.body].join('\n\n'))
console.log('errors', w.errors.length)
await w.browser.close()
