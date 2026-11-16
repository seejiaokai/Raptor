/* wwf host mock v1 (16 Nov 26, chat 87) — the Opus read's F2, a picture for his question: the Logic page's crew-rest
   "How it works" as built (on the frozen build of 7eade5b52, unchanged by the fixes), then with the proposed sentence
   drawn in (the page's own list item, the words set in place — nothing built). Phone (iPhone size) and desktop.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/wwf/wwf-host-logic-mock.mjs */
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const PHONE = process.env.PHONE === '1'
process.env.WWW_DIST ||= 'C:/Users/User/AppData/Local/Temp/walk-7eade5b52'
process.env.WWW_BUNDLE ||= 'index-Dqzz8EGM.js'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'logic-mock-' + (PHONE ? 'p' : 'd')
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-16-warn-words-followups', 'host', process.env.WWW_RUN)
const X = await import('../www/www-lib.mjs')
const { say, sleep, L } = X
const w = await X.open({ phone: PHONE })
const { page } = w
await L.go(page, 'logic'); await sleep(700)
const sum = page.locator('details[data-how="crewrest"] > summary')
await sum.scrollIntoViewIfNeeded(); await sum.click(); await sleep(400)
const box = page.locator('details[data-how="crewrest"]').locator('xpath=ancestor::*[contains(@class,"lgchk") or self::li or self::div][1]')
const target = (await box.count()) ? box.first() : page.locator('details[data-how="crewrest"]')
await target.scrollIntoViewIfNeeded()
await target.screenshot({ path: X.SHOTS + '/logic-crewrest-today.png' })
const txt = await page.locator('details[data-how="crewrest"] li').nth(1).innerText()
say('line 2 today:', txt)
await page.evaluate(() => {
  const li = document.querySelectorAll('details[data-how="crewrest"] li')[1]
  const s = document.createElement('span')
  s.textContent = ' A standby shift, or a desk made from an SC shift template, with START typed and END blank is left out until its END is typed.'
  s.style.cssText = 'outline:2px solid #f5b400;outline-offset:1px'
  li.appendChild(s)
})
await sleep(200)
await target.screenshot({ path: X.SHOTS + '/logic-crewrest-proposed.png' })
say('errors', JSON.stringify(w.errs || []))
await X.fin(w)
