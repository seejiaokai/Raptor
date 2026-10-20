/* [LOGIC-REDRAW-DROPS-TYPING]'s neighbours (21 Oct 26): after typing a new value in one setting, where does the keyboard
   land — (a) with Tab, (b) with a press on the next box? node scripts/handpass/logic-repro2.mjs [port] */
import { chromium } from 'playwright'
import { existsSync } from 'fs'

const PORT = process.argv[2] || '4290'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('logic'))
await page.waitForTimeout(2500)
await page.click('#lgEdit'); await page.waitForTimeout(300)
const where = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName} ${a.getAttribute('data-lgset') || a.id || a.getAttribute('aria-label') || ''} (box ${a.getAttribute('data-lgi') ?? '-'})` : 'none' })
const boxes = page.locator('#lgBody input[data-lgset]')
console.log('boxes:', await boxes.count())
const a = boxes.nth(1), b = boxes.nth(2)
console.log('box 1 is', await a.getAttribute('data-lgset'), '; box 2 is', await b.getAttribute('data-lgset'))

/* (a) click box 1, type, Tab */
await a.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(await a.inputValue() === '1h' ? '1h15' : '1h')
await page.keyboard.press('Tab'); await page.waitForTimeout(300)
console.log('(a) after typing in box 1 and Tab, the keyboard is on:', await where())

/* (b) click box 1, type, press box 2 */
await a.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(await a.inputValue() === '1h' ? '1h15' : '1h')
await b.click(); await page.waitForTimeout(300)
console.log('(b) after typing in box 1 and pressing box 2, the keyboard is on:', await where())
await page.keyboard.type('X'); await page.waitForTimeout(100)
console.log('    and a letter typed then lands in box 2:', JSON.stringify(await boxes.nth(2).inputValue()))

/* (c) keyboard only: Tab into box 1 from box 0, type, Tab */
await boxes.nth(0).focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Control+A'); await page.keyboard.type('1h30')
await page.keyboard.press('Tab'); await page.waitForTimeout(300)
console.log('(c) keyboard only — after typing in box 1 and Tab, the keyboard is on:', await where())
await browser.close()
