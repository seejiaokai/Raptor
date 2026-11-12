console.log('rcf-rw-r5probe v1 — how to reach the next week')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/r5-probe2')
const X = await import('./rcf-w1-lib.mjs')
const { L, sleep } = X
const w = await X.world('desktop')
const { page } = w
await L.go(page, 'editsched'); await sleep(500)
console.log('week', await page.evaluate(() => window.CURWEEK), await page.evaluate(() => window.DAYS[0].dt))
const cal = page.locator('.wk-cal:visible, .filt-cal:visible').first()
console.log('cal btn count', await cal.count(), await cal.evaluate(e => e.outerHTML.slice(0, 200)))
await cal.click(); await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/cal-open.png' })
console.log('wcal', await page.evaluate(() => [...document.querySelectorAll('[data-wcal]')].map(e => e.dataset.wcal + (e.offsetWidth ? '' : '(hidden)')).slice(0, 60).join(' ')))
console.log('weekCal html', await page.evaluate(() => { const c = document.querySelector('#weekCal'); return c ? c.outerHTML.slice(0, 600) : 'none' }))
console.log('navs', await page.evaluate(() => [...document.querySelectorAll('.rc-nav, [aria-label*="onth"]')].map(e => e.outerHTML.slice(0, 120))))
console.log('week arrows', await page.evaluate(() => [...document.querySelectorAll('[data-wknav], [data-wkprev], [data-wknext], .wk-arrow, [aria-label*="eek"]')].map(e => e.outerHTML.slice(0, 140))))
await w.browser.close()
