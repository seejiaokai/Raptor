console.log('rcf-rw-r4b v1 — where does "A standby row that flies" still stand on the Logic page (desktop)')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/r4b')
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, sleep } = R
const browser = await W.launch()
const { page } = await W.world(browser)
await page.locator('a[data-page="logic"]:visible').first().click()
await page.waitForSelector('#page-logic.on'); await sleep(600)
await page.evaluate(() => document.querySelectorAll('#page-logic details').forEach(d => { d.open = true })); await sleep(300)
const info = await page.evaluate(() => {
  const els = [...document.querySelectorAll('#page-logic *')].filter(e => (e.innerText || '').replace(/[\s ]+/g, ' ').includes('A standby row that flies'))
  const small = els.filter(e => !els.some(o => o !== e && e.contains(o)))
  return small.map((e, i) => { e.setAttribute('data-rwf', 'x' + i); return { i, tag: e.tagName, cls: e.className, vis: e.getBoundingClientRect().width > 0, inDetails: !!e.closest('details'), text: (e.innerText || e.textContent || '').replace(/[\s ]+/g, ' ').trim().slice(0, 400), parent: (e.parentElement.innerText || '').replace(/[\s ]+/g, ' ').trim().slice(0, 500) } })
})
console.log(JSON.stringify(info, null, 1))
for (const it of info) if (it.vis) { const l = page.locator(`[data-rwf="x${it.i}"]`); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200); await l.screenshot({ path: `${process.env.HP_SHOTS}/old-phrase-${it.i}.png` }) }
await browser.close()
