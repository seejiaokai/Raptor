/* trace of the keyboard's moves around a Tab out of a changed Logic box (21 Oct 26, debugging the fix) */
import { chromium } from 'playwright'
import { existsSync } from 'fs'
const PORT = process.argv[2] || '4290'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
await page.goto(`http://localhost:${PORT}/`)
console.log('bundle:', await page.evaluate(() => [...document.scripts].map(s => s.src).join(' ')))
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('logic')); await page.waitForTimeout(2500)
await page.click('#lgEdit'); await page.waitForTimeout(300)
await page.evaluate(() => {
  const t0 = performance.now(), log = window.__log = []
  const d = el => el ? `${el.tagName}${el.dataset?.lgset ? ':' + el.dataset.lgset : ''}${el.isConnected ? '' : '(gone)'}` : 'null'
  for (const ev of ['focusin', 'focusout', 'change', 'keydown'])
    document.addEventListener(ev, e => log.push(`${Math.round(performance.now() - t0)} ${ev} ${d(e.target)} → ${d(e.relatedTarget)}`), true)
  new MutationObserver(() => log.push(`${Math.round(performance.now() - t0)} list redrawn`)).observe(document.getElementById('lgBody'), { childList: true })
  const pd = Event.prototype.preventDefault
  Event.prototype.preventDefault = function () { if (this.type === 'keydown') log.push(`preventDefault on ${this.key} — ${new Error().stack.split('\n').slice(2, 5).join(' | ')}`); return pd.call(this) }
  const dp = EventTarget.prototype.dispatchEvent
  EventTarget.prototype.dispatchEvent = function (e) { if (e.type === 'change') log.push(`change dispatched by script — ${new Error().stack.split('\n').slice(2, 5).join(' | ')}`); return dp.call(this, e) }
  const f = HTMLElement.prototype.focus
  HTMLElement.prototype.focus = function (...a) { log.push(`${Math.round(performance.now() - t0)} focus() called on ${d(this)} — ${new Error().stack.split('\n').slice(2, 5).join(' | ')}`); return f.apply(this, a) }
})
const a = page.locator('#lgBody input[data-lgset="maxRun"]')
await a.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('7')
await page.keyboard.press('Tab'); await page.waitForTimeout(400)
console.log((await page.evaluate(() => window.__log)).join('\n'))
console.log('ends on:', await page.evaluate(() => document.activeElement?.dataset?.lgset || document.activeElement?.tagName))
await browser.close()
