// "Make public" on a scheduler note — pictures for him (3 Nov 26, [DATA-ONE-MASTER-CHECK] A2): what the button does, and
// that the choice is forgotten after a reload. Reads and presses only through the app's own controls.
//   node scripts/handpass/notepub-pics.mjs [out dir]      (empties its own folder first)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-11-03-data-one-master-check/notepub')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4241/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(e.message))
const signIn = async () => {
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
}
const go = async p => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await page.waitForTimeout(600) }
let n = 0
/* a picture of the area round one element, the element ringed */
const shot = async (sel, name, pad = 60) => {
  const el = page.locator(sel).first()
  await el.scrollIntoViewIfNeeded()
  await el.evaluate(e => { e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '3px' })
  const b = await el.boundingBox()
  const clip = { x: Math.max(0, b.x - pad * 4), y: Math.max(0, b.y - pad * 2), width: Math.min(1440, b.width + pad * 8), height: Math.min(900, b.height + pad * 4) }
  await page.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-${name}.png`), clip })
  await el.evaluate(e => { e.style.outline = ''; e.style.outlineOffset = '' })
}
const say = (...a) => console.log(...a)

await signIn()
await go('editsched')
const key = await page.evaluate(() => { const e = [...document.querySelectorAll('.blknote.ed[data-txt]')].find(x => x.getBoundingClientRect().height > 0); return e && e.getAttribute('data-txt') })
say('note box', key)
if (!key) { say('NOT WALKED — no scheduler note box on Edit Schedule'); process.exit(1) }
const box = `.blknote.ed[data-txt="${key}"]`
await page.click(box); await page.keyboard.type('Crew brief 0730 in the crew room')
await page.click('body', { position: { x: 5, y: 880 } }); await page.waitForTimeout(400)
const head = `.blknote-h:has([data-notepub="${key.split(':')[0]}"])`
say('header before:', await page.locator(`[data-notepub]`).first().evaluate(e => e.closest('.blknote-h').textContent.trim()))
await shot(box, 'edit-scheduler-note-make-public', 30)
await page.click(`[data-notepub]`); await page.waitForTimeout(400)
say('header after press:', await page.locator(`[data-notepub]`).first().evaluate(e => e.closest('.blknote-h').textContent.trim()))
await shot(box, 'edit-after-press-public', 30)
await go('viewsched')
const vis = await page.evaluate(() => [...document.querySelectorAll('.blknote')].filter(x => x.getBoundingClientRect().height > 0).map(x => x.textContent.trim()))
say('view-only notes shown:', JSON.stringify(vis))
if (vis.some(t => t.includes('Crew brief 0730'))) await shot('.blknote:has-text("Crew brief 0730")', 'viewonly-note-shown', 30)
/* the reload */
await page.reload(); await signIn(); await go('viewsched')
const vis2 = await page.evaluate(() => [...document.querySelectorAll('.blknote')].filter(x => x.getBoundingClientRect().height > 0).map(x => x.textContent.trim()))
say('view-only notes after reload:', JSON.stringify(vis2))
await page.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-viewonly-after-reload.png`) })
await go('editsched')
say('edit header after reload:', await page.locator(`[data-notepub]`).first().evaluate(e => e.closest('.blknote-h').textContent.trim()))
say('note text after reload:', await page.locator(box).first().textContent())
await shot(box, 'edit-after-reload-private-again', 30)
say('page errors:', errs.length)
await browser.close()
