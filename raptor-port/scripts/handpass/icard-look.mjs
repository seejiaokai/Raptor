// THE INPUT CARD AS BUILT, BESIDE THE APPROVED PICTURES ([INPUT-LIST-AS-DAY-CARD]; owner D718–D724, 10 Oct 26).
// The approved pictures (docs/mock/img/input-card-final/day-final.png, list-final.png) were DRAWN: the built app's own
// window and records with the card's markup injected (scripts/handpass/mk-final-card.mjs). This files the SAME six
// inputs through the app's own "+ Input" and photographs what the app itself now draws — the opened day and the
// Inputs list on a phone, at the pictures' own size, and the day and the table on a desktop. It asserts nothing;
// the host opens the pictures beside the approved ones (D624's manner).
//
//   node scripts/handpass/icard-look.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-input-card-check/look'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-18', DAY = '[data-testid="win-inputsday"]'
const errors = []

async function world(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push((phone ? 'phone' : 'desk') + ' pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push((phone ? 'phone' : 'desk') + ' console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push((phone ? 'phone' : 'desk') + ' ' + r.status() + ' ' + r.url()) })
  const tap = l => (phone ? l.tap() : l.click())
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
  const ranger = await id('Ranger'), blade = await id('Blade'), wisp = await id('Wisp')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await tap(page.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  const openDay = async () => {
    if (await page.locator(DAY).count()) return
    const cell = page.locator(`#inpCal [data-icday="${ISO}"]`)
    if (phone) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
    await page.locator(DAY).waitFor()
  }
  const file = async (type, who, from, to, title, rmk, several) => {
    await openDay()
    await tap(page.locator('#icPopAdd')); await page.locator('[data-testid="win-inputedit"]').waitFor()
    await page.selectOption('#inpEditType', type)
    if (several) {
      await tap(page.locator('[data-testid="win-inputedit"] [data-testid="pp-several"]'))
      for (const cs of several) { const b = page.locator(`[data-testid="win-inputedit"] [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await tap(b) }
    } else if (who) await page.selectOption('#inpEditPerson', who)
    await page.fill('#inpEditStart', from).catch(() => {}); await page.fill('#inpEditEnd', to).catch(() => {})
    if (title) await page.fill('#inpEditOwnTitle', title)
    if (rmk) await page.fill('#inpEditRmk', rmk)
    await tap(page.locator('#inpEditSave'))
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: 2500 }).then(() => true, () => false)) { await tap(sheet.locator('[data-testid="oil-yes"]')); await tap(sheet.locator('[data-testid="oilconf-save"]')) }
    await page.waitForTimeout(450)
  }
  await file('Event', 'allavail', '06:00', '18:00', 'Sports day', 'bring boots')
  await file('Meeting', null, '10:00', '11:00', 'Flight safety brief', '', ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch'])
  await file('Event', null, '09:00', '16:00', 'Squadron family day and open house visit', '')
  await file('Duty', ranger, '13:00', '15:00', '', '')
  await file('Training', blade, '14:00', '16:00', 'CRM refresher', '')
  await file('Other', wisp, '11:00', '12:00', '', 'Collecting a new ID card from the pass office before lunch')
  await openDay()
  return { ctx, page, tap, openDay }
}

for (const phone of [true, false]) {
  const tag = phone ? 'phone' : 'desk'
  const { ctx, page, tap, openDay } = await world(phone)
  /* 1 — the calendar's opened day */
  await openDay()
  await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor()
  await page.waitForTimeout(3600)                       // the passing "Input added" note is not part of the picture
  await page.screenshot({ path: join(OUT, `${tag}-day.png`) })
  const cards = await page.locator(`${DAY} [data-testid^="idy-row-"]`).evaluateAll(els => els.map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\n/g, ' | ') })))
  console.log(tag, 'day cards:', JSON.stringify(cards))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  /* 2 — the list */
  await tap(page.locator('#inListBtn'))
  if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn'))
  await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400)
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-testid="inl-day"], #inBody tr')].find(el => /16 Jul/.test(el.textContent))
    if (t) { t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150) }
  })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, `${tag}-list.png`) })
  if (phone) {
    const rows = await page.locator('[data-testid^="inl-row-"]').evaluateAll(els => els.slice(0, 12).map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\n/g, ' | ') })))
    console.log(tag, 'list cards:', JSON.stringify(rows))
    console.log(tag, 'page wider than the screen:', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
  }
  await ctx.close()
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors, no page errors, no 4xx')
