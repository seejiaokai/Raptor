/* pdl-w2-probe2 v1 — week chips, next weeks' contents */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe2')
console.log('pdl-w2-probe2 v1', process.env.HP_SHOTS)
const X = await import('../rcf/rcf-w1-lib.mjs')
const { L, sleep } = X
const w = await X.world('desktop')
const { page } = w
await L.go(page, 'editsched'); await sleep(500)
const chips = await page.evaluate(() => [...document.querySelectorAll('.wk-chip, [data-wk], [data-week]')].map(e => e.className + '|' + e.innerText + '|' + [...e.attributes].map(a => a.name + '=' + a.value).join(';')).slice(0, 20))
console.log(JSON.stringify(chips, null, 1))
const toWeek = async (iso) => {
  await page.locator('.wk-cal:visible, .filt-cal:visible').first().click(); await sleep(500)
  const sel = `#weekCal [data-iso="${iso}"]`
  for (let i = 0; i < 3 && !(await page.locator(sel).count()); i++) { await page.locator('#weekCal [data-testid="wcal-next"]').first().click(); await sleep(400) }
  await page.locator(sel).first().click(); await sleep(1200)
}
for (const iso of ['2026-07-20', '2026-07-27']) {
  await toWeek(iso)
  const r = await page.evaluate(() => ({ week: window.CURWEEK, days: window.DAYS.map((d, i) => `${i}:${d.dt} w${d.waves.length} g${d.ground.length} d${d.dutywaves.length} s${d.sims.oft.length + d.sims.amt.length}`) }))
  console.log(JSON.stringify(r))
  await page.screenshot({ path: process.env.HP_SHOTS + '/wk-' + iso + '.png' })
}
await w.browser.close()
