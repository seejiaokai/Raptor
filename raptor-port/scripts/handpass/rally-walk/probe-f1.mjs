/* walker B's F1 (19 Oct 26): on the phone board, tap R then tap B at once — B ends focused and empty. This probe logs, in the
   page, every pointerdown / focusin / focusout / change / click on the two boxes, whether the B pressed is still the B in the
   page afterwards, and B's value at each step. Run: HP_URL=http://localhost:4298 node scripts/handpass/rally-walk/probe-f1.mjs */
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
console.log('probe-f1 v1')
const BASE = process.env.HP_URL || 'http://localhost:4298'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
await p.goto(BASE + '/'); await p.waitForSelector('#luser')
await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached' })
await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(700)
await p.evaluate(() => window.openScheduler(1)); await p.waitForSelector('#sbBoard .sb-line'); await p.waitForTimeout(900)
await p.evaluate(() => {
  window.__log = []; let n = 0
  const tag = el => { if (!el || !el.dataset) return String(el && el.nodeName); if (!el.__id) el.__id = ++n; return (el.dataset.bfld || el.className || el.nodeName) + '#' + el.__id + (el.isConnected ? '' : '(gone)') }
  for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'focusin', 'focusout', 'change', 'click', 'input'])
    document.addEventListener(ev, e => { const t = e.target; if (t && t.dataset && /ff:1\.0\.1\.(rl|br)/.test(t.dataset.bfld || '')) window.__log.push(`${ev} ${tag(t)} val="${t.value}" active=${tag(document.activeElement)}`) }, true)
  window.__tagB = () => { const b = document.querySelector('#sbBoard [data-bfld="ff:1.0.1.br"]'); return tag(b) + ' val="' + b.value + '"' }
})
const box = k => p.locator(`#sbBoard [data-bfld="ff:1.0.1.${k}"]`).first()
const tapAt = async (loc, scroll) => { if (scroll) await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); const b = await loc.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
await tapAt(box('rl'), true); await p.waitForTimeout(300)
console.log('after R tap: B is', await p.evaluate(() => window.__tagB()))
await tapAt(box('br'), false); await p.waitForTimeout(800)
console.log('after B tap: B is', await p.evaluate(() => window.__tagB()), '| active', await p.evaluate(() => { const a = document.activeElement; return a && (a.dataset?.bfld || a.nodeName) + ' val="' + a.value + '"' }))
console.log((await p.evaluate(() => window.__log)).join('\n'))
await browser.close()
