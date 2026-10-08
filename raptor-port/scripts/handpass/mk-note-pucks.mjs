// THE MOCK-UP MAKER for [CAL-NOTE-WITH-PUCKS] (owner D684, 9 Oct 26 — "For the +note, perhaps just have a function to add
// pucks on the text written, instead of a +pucks button"). It drives the BUILT app to a day holding a note and a row of
// pucks (the real controls), pictures it AS IT IS TODAY, then re-arranges the same real elements in the page to draw
// the direction — so every puck, button and letter in the drawing is the app's own. A DRAWING: nothing here is built.
//
//   node scripts/handpass/mk-note-pucks.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/note-with-pucks'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
for (let i = 0; i < 40; i++) {
  const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
  if (!d) break
  await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
}
const ISO = '2026-07-21'
const openDay = async () => { await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } }); await page.locator('[data-testid="win-inputsday"]').waitFor(); await page.waitForTimeout(400) }
await openDay()
/* a note and a row of pucks, through the app's own controls */
await page.locator('#icAddPuck').tap()
await page.locator('.ic-poppuck-edit').fill('Brief the new guys, 0800')
await page.locator('.ic-poppuck-edit').press('Enter'); await page.waitForTimeout(250)
await page.locator('#icAddPucks').tap(); await page.locator('.ic-pick').waitFor()
const picks = page.locator('.ic-pick .ic-pickp')
for (const i of [3, 9, 14]) await picks.nth(i).tap()
await page.locator('#icPickOk').tap(); await page.waitForTimeout(400)
const win = page.locator('[data-testid="win-inputsday"]')
const shot = async name => { const b = await win.boundingBox(); await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: 0, y: 0, width: 390, height: Math.min(844, Math.round(b.y + 470)) } }) }
await shot('a-today')

/* THE DIRECTION, drawn with the same elements: the people sit ON the note; "+ Pucks" is gone from the bar */
await page.evaluate(() => {
  const secs = [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-sec')]
  const note = secs.find(s => s.querySelector('.ic-poppuck')), row = secs.find(s => s.querySelector('.ic-secpucks'))
  const grid = row.querySelector('.ic-secpk-grid'), add = row.querySelector('.ic-pkadd')
  const wrap = document.createElement('div')
  wrap.id = 'mockPeople'
  /* INSIDE the note's own box, under its words: a thin rule, the people three across, "+ people" after them */
  wrap.style.cssText = 'flex:1 0 100%;display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--edge)'
  grid.style.width = '100%'
  add.textContent = '+ people'
  wrap.append(grid, add)
  const box = note.querySelector('.ic-poppuck')
  box.style.flexWrap = 'wrap'
  box.append(wrap)
  row.remove()
  const pucksBtn = document.querySelector('#icAddPucks'); if (pucksBtn) pucksBtn.remove()
})
await page.waitForTimeout(200)
await shot('b-note-with-people')

/* ...and a note that is people only — no words (the question put to him) */
await page.evaluate(() => {
  const t = document.querySelector('[data-testid="win-inputsday"] .ic-poppuck-txt')
  t.textContent = 'no words'
  t.style.cssText += ';color:var(--ink-3);font-style:italic;font-weight:500'
})
await page.waitForTimeout(150)
await shot('c-people-only')
await ctx.close()

/* the month: how the day's cell shows a note and its people today — the direction keeps this look */
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p2 = await ctx2.newPage()
await p2.goto(URL)
await p2.fill('#luser', 'ad'); await p2.fill('#lpass', 'a')
await p2.click('#loginForm button[type=submit]')
await p2.waitForSelector('#vWeek .day')
await p2.evaluate(() => window.go('inputs'))
for (let i = 0; i < 40; i++) {
  const [name, year] = (await p2.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
  if (!d) break
  await p2.locator(d > 0 ? '#icNext' : '#icPrev').click()
}
await p2.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } })
await p2.locator('[data-testid="win-inputsday"]').waitFor()
await p2.locator('#icAddPuck').tap(); await p2.locator('.ic-poppuck-edit').fill('Brief the new guys, 0800'); await p2.locator('.ic-poppuck-edit').press('Enter'); await p2.waitForTimeout(250)
await p2.locator('#icAddPucks').tap(); await p2.locator('.ic-pick').waitFor()
for (const i of [3, 9, 14]) await p2.locator('.ic-pick .ic-pickp').nth(i).tap()
await p2.locator('#icPickOk').tap(); await p2.waitForTimeout(300)
await p2.locator('[data-testid="win-inputsday-x"]').tap(); await p2.waitForTimeout(400)
const cell = await p2.locator(`#inpCal [data-icday="${ISO}"]`).boundingBox()
await p2.screenshot({ path: join(OUT, 'd-month.png'), clip: { x: 0, y: Math.max(0, Math.round(cell.y - 40)), width: 390, height: Math.round(cell.height + 80) } })
await ctx2.close()
await browser.close()
console.log('drawn into', OUT)
