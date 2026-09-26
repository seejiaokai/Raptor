/* RW-W3-12 — the re-walk's check of FR6 (register §12: "a war switch closes the open cell … AND THE EVENT SHEET"). The
   event sheet opens from a "+" on the EVENT 1 row. Desktop: the war picker is given the focus with the sheet up (the
   stand-in for any road that leaves the picker focused — the keyboard itself is held, rw-w3-05c) and an arrow key picks
   the other war. Phone (a touch device): a finger on the picker, then the war picked. Either way the event sheet must be
   gone, nothing written into the other war's event row, and nothing re-opened on coming back.
   Usage: node scripts/handpass/ab/rw-w3-12-event-sheet.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { chromium } = await import('@playwright/test')
const { existsSync, mkdirSync } = await import('node:fs')
const { lwOpen, closeSheets, sheetNow, shot, resultBook, ROOT, login } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-12-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-12-${W}.txt`)
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
const ctx = await browser.newContext(PHONE ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto((process.env.HP_URL || 'http://localhost:4175') + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `rw-w3-12-${W}-${n}`)
const warNow = async () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })
const eventRows = async () => page.evaluate(() => { let w = []; try { w = JSON.parse(localStorage.getItem('raptor:leavewar/wars') || '[]') } catch { } return (Array.isArray(w) ? w : Object.values(w)).map(x => `${x && x.period && x.period.name}: ${JSON.stringify((x && (x.events || x.eventRows || x.ev)) || {}).slice(0, 160)}`) })

await lwOpen(page, '2026-12-14')
const cell = page.locator('[data-testid="event-0-2026-12-16"]').first()
await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
const bb = await cell.boundingBox()
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(700)
const s0 = await sheetNow(page)
await pic('a-event-sheet')
const before = await eventRows()
const pk = page.locator('[data-testid="war-picker"]:visible').first()
if (PHONE) {
  const p = await pk.boundingBox()
  await page.touchscreen.tap(p.x + p.width / 2, p.y + p.height / 2); await page.waitForTimeout(400)
  const v = await pk.locator('option').evaluateAll(os => (os.find(o => o.text === 'JAN - DEC 27') || {}).value)
  await pk.selectOption(v)
} else {
  await pk.focus(); await page.keyboard.press('ArrowDown')
}
await page.waitForTimeout(1300)
const w = await warNow(), s1 = await sheetNow(page)
await pic('b-after-switch')
/* anything still up gets its Save / first write pressed, to see where it would land */
let pressed = null
if (s1.open !== 'nothing') { const b = page.locator('.bidsheet[role="dialog"]:visible button').filter({ hasText: /Save|Add|Done/ }).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(600); pressed = await sheetNow(page) } }
await closeSheets(page)
const sel = page.locator('[data-testid="war-picker"]:visible').first()
const v26 = await sel.locator('option').evaluateAll(os => (os.find(o => o.text === 'JAN - DEC 26') || {}).value)
await sel.selectOption(v26); await page.waitForTimeout(1300)
const s2 = await sheetNow(page)
const after = await eventRows()
R.note('FR6', { opened: s0.open, label: s0.label, war: w, sheetAfterSwitch: s1.open, pressed: pressed && pressed.open, sheetOnReturn: s2.open, eventRowsChanged: JSON.stringify(before) !== JSON.stringify(after) })
R.ck('FR6-event-sheet-closes', s0.open === 'event-sheet' && w === 'JAN - DEC 27' && s1.open === 'nothing' && s2.open === 'nothing' && JSON.stringify(before) === JSON.stringify(after),
  'the event sheet opened on a 26 day is gone after the war switch; nothing written; nothing re-opened on coming back (FR6, register §12)', { opened: s0.open, war: w, after: s1.open, back: s2.open })
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
