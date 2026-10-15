/* PICTURES of the Logic page as it is (15 Oct 26), for [LOGIC-PAGE-LAYOUT]'s mock-up (D809, D925): the page's first
   screens and its full length, phone (390 x 844, 3x) and desktop (1440 x 900, 2x), with "Edit rules" off and on.
   usage: node scripts/handpass/pics-logic-today.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-logic-page/today'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = [], facts = {}
for (const [key, dev] of [['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }], ['desk', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }]]) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('logic')); await p.waitForFunction(() => window.CURPAGE === 'logic'); await p.waitForTimeout(800)
  facts[key] = await p.evaluate(() => ({ height: document.documentElement.scrollHeight, words: document.body.innerText.split(/\s+/).length }))
  await p.screenshot({ path: `${out}/${key}-first-screen.png` })
  await p.screenshot({ path: `${out}/${key}-full.png`, fullPage: true })
  const edit = p.getByRole('button', { name: /Edit rules/ }).first()
  if (await edit.count()) {
    if (key === 'phone') await edit.tap(); else await edit.click()
    await p.waitForTimeout(500)
    facts[key].editHeight = await p.evaluate(() => document.documentElement.scrollHeight)
    await p.screenshot({ path: `${out}/${key}-edit-first-screen.png` })
    await p.screenshot({ path: `${out}/${key}-edit-full.png`, fullPage: true })
  }
  await ctx.close()
}
console.log(JSON.stringify({ facts, errors }))
await b.close()
