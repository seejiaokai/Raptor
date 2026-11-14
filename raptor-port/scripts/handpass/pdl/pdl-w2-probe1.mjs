/* pdl-w2-probe1 v1 — look at the demo world: week, days, people */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe1')
console.log('pdl-w2-probe1 v1', process.env.HP_SHOTS)
const X = await import('../rcf/rcf-w1-lib.mjs')
const { L, sleep } = X
const w = await X.world('desktop')
const { page } = w
const info = await page.evaluate(() => ({
  week: window.CURWEEK, days: window.DAYS.map((d, i) => ({ i, dt: d.dt, waves: d.waves.length, ground: d.ground.length, duty: d.dutywaves.length, sims: d.sims.oft.length + d.sims.amt.length, pub: (window.SCHED.cur || {})[i] || null })),
  people: Object.entries(window.PEOPLE).map(([k, p]) => k + ':' + p.cs + ':' + (p.role || p.cat || '')).slice(0, 80),
  npeople: Object.keys(window.PEOPLE).length,
  keys: Object.keys(window.VCONF || {}),
  vconf: window.VCONF
}))
console.log(JSON.stringify(info, null, 1))
await L.go(page, 'editsched'); await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/editsched.png' })
await L.go(page, 'logic'); await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/logic.png' })
console.log(await page.evaluate(() => document.querySelector('#lgBody').innerText.slice(0, 1500)))
await w.browser.close()
