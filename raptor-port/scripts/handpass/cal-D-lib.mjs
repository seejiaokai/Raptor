// Walker D's shared helpers (cal-D-*). Drives the frozen build at BASE. Fixtures go through the app's own controls;
// the probe bridge is used only to get to a place and to READ state (the few seeded exceptions say so in the row).
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = 'http://localhost:4214/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const PIC = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/D'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(PIC, { recursive: true }); mkdirSync(PARTS, { recursive: true })

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  short: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const tid = (page, id) => page.locator(`[data-testid="${id}"]`)
export const isTouch = size => size === 'phone' || size === 'short' || size === 'side'
export const press = (size, loc, opt) => (isTouch(size) ? loc.tap(opt) : loc.click(opt))

export async function world(browser, size = 'desk', who = 'ad', { fresh = true } = {}) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.fill('#luser', who === 'ad' ? 'ad' : 'us'); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page, errors }
}
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function toMonth(page, size, y, m) {
  const sans = await tid(page, 'sanscal').count()
  const label = sans ? tid(page, 'sc-month') : page.locator('.ic-mon'), prev = sans ? tid(page, 'sc-prev') : page.locator('#icPrev'), next = sans ? tid(page, 'sc-next') : page.locator('#icNext')
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await label.innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MON.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(size, d > 0 ? next : prev)
    await page.waitForTimeout(80)
  }
  throw new Error('never reached month')
}
export async function openSans(page, size, y = 2026, m = 7) {
  await page.evaluate(() => window.go('inputs'))
  await page.click('#inSansMode')
  await tid(page, 'sanscal').waitFor()
  await toMonth(page, size, y, m)
  await page.waitForTimeout(300)
}
export const cell = (page, iso) => page.locator(`[data-icday="${iso}"]`)
export async function shot(page, name, full = false) {
  await page.mouse.move(0, 0).catch(() => {})
  const p = join(PIC, name + '.png')
  await page.screenshot({ path: p, fullPage: full })
  return p
}
export async function drag(page, size, a, b, steps = 6) {
  // a,b: points {x,y}. mouse: down/move/up; touch: hold 450ms then move (CDP).
  if (!isTouch(size)) {
    await page.mouse.move(a.x, a.y); await page.mouse.down()
    await page.mouse.move(b.x, b.y, { steps }); await page.mouse.up()
  } else {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
    await page.waitForTimeout(520)
    for (let i = 1; i <= steps; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(a.x + ((b.x - a.x) * i) / steps), y: Math.round(a.y + ((b.y - a.y) * i) / steps), id: 1 }] })
      await page.waitForTimeout(20)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
  }
}
export const centre = async (loc) => { const r = await loc.boundingBox(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } }
export const corner = async (loc) => { const r = await loc.boundingBox(); return { x: Math.round(r.x + 8), y: Math.round(r.y + 8) } }

// results table
export const RES = []
export function row(id, did, saw, verdict, pics = []) { RES.push({ id, did, saw, verdict, pics }); console.log(`[${id}] ${verdict}: ${saw}`) }
export function saveRes(name, extra = {}) {
  const f = join(PARTS, 'cal-D.json')
  let all = {}
  try { all = JSON.parse(readFileSync(f, 'utf8')) } catch {}
  all.rows = (all.rows || []).filter(r => !RES.some(n => n.id === r.id)).concat(RES)
  Object.assign(all, extra)
  writeFileSync(f, JSON.stringify(all, null, 1))
}
export { chromium, devices }

// type a Required figure on the Leave War's Required row (desktop: the cell's box; phone: the number pad)
export async function typeReq(page, size, rowId, iso, n) {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  const c = tid(page, `${rowId}-${iso}`)
  await lwMonth(page, iso)
  await c.waitFor({ state: 'attached', timeout: 8000 })
  await c.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await press(size, c)
  if (isTouch(size)) {
    for (const ch of String(n)) await tid(page, `fly-pad-${ch}`).tap()
    await tid(page, 'fly-pad-done').tap()
  } else {
    await page.keyboard.type(String(n)); await page.keyboard.press('Enter')
  }
  await page.waitForTimeout(250)
}
export async function backToSans(page, size, y = 2026, m = 7) {
  await page.evaluate(() => window.go('inputs'))
  await page.click('#inSansMode'); await tid(page, 'sanscal').waitFor()
  await toMonth(page, size, y, m); await page.waitForTimeout(250)
}

// read what the SANS month says for a date (text off the screen) and the opened day's working + list
export async function readDate(page, iso) {
  return page.evaluate(i => {
    const t = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    const c = document.querySelector(`[data-icday="${i}"]`)
    return { need: t('sc-need-' + i), f: t('sc-f-' + i), o: t('sc-o-' + i), a: t('sc-a-' + i), tag: t('sc-tag-' + i), cls: c ? c.className : null }
  }, iso)
}
export async function readDayWin(page) {
  return page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-sansday"]'); if (!w) return null
    const t = id => { const e = w.querySelector(`[data-testid="${id}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    return { title: (w.querySelector('.win-ttl') || {}).innerText, work: t('sd-work'), list: t('sd-list'), rows: [...w.querySelectorAll('[data-testid^="sd-row-"]')].map(r => r.innerText.replace(/\s+/g, ' ').trim()), groups: [...w.querySelectorAll('[data-testid^="sd-group-"]')].map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)) }
  })
}
// file a SANS commitment from the opened day: person (by id), letters {f,o,a}; admin picker by select
export async function fileCommit(page, size, personId, letters, { remarks = '', several = null } = {}) {
  await press(size, tid(page, 'sd-add'))
  await page.waitForSelector('#inpEditSave', { state: 'visible' })
  if (personId && !several) await page.selectOption('#inpEditPerson', personId)
  const lab = { f: 'Fly', o: 'OFT', a: 'AMT' }
  for (const k of ['f', 'o', 'a']) {
    const box = page.locator('#inpEditSans').getByLabel(lab[k], { exact: true })
    const want = !!letters[k]
    if ((await box.isChecked()) !== want) await box.setChecked(want)
  }
  if (remarks) await page.fill('#inpEditRmk', remarks)
}

export const SANSMEN = ['vinci', 'yeti', 'romeo', 'ipman', 'krait', 'cards', 'wrangler', 'badger', 'waldo', 'nick', 'bullet']
// fill one day with a spread of commitments through "+ Commitment"
export async function fillBusy(page, size, iso, plan) {
  // plan: [[personId, {f,o,a}], ...]
  for (const [id, letters] of plan) {
    if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, iso), { position: { x: 8, y: 8 }, timeout: 8000 }); await tid(page, 'win-sansday').waitFor({ timeout: 8000 }) }
    await fileCommit(page, size, id, letters)
    await page.click('#inpEditSave'); await page.waitForTimeout(350)
    if (await page.locator('#inpEditSave').isVisible().catch(() => false)) { await page.screenshot({ path: PIC + '/fillbusy-stuck.png' }); throw new Error('editor did not close for ' + id) }
  }
}
export async function noLongerSans(page, id) {
  await page.evaluate(() => window.go('quals')); await page.waitForTimeout(600)
  await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(250)
  const c = page.locator(`[data-q="${id}|san"]`); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(150)
  await page.click('#qSave'); await page.waitForTimeout(400)
}

// set a day's Required figures as "need over what is available": dP pilots, dW WSOs still needed with nobody committed
export async function setNeed(page, size, iso, dP, dW) {
  const g = await page.evaluate(i => window.lwDayFacts(i), iso)
  await typeReq(page, size, 'req-p', iso, g.availP + dP); await page.keyboard.press('Escape').catch(() => {})
  await typeReq(page, size, 'req-w', iso, g.availW + dW); await page.keyboard.press('Escape').catch(() => {})
  return g
}
// file a SANS commitment over a run of days by dragging the month (mouse) then the editor
export async function fileRun(page, size, from, to, personId, letters, extra = {}) {
  if (from === to) {
    if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, from), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
    else await press(size, cell(page, from), { position: { x: 8, y: 8 } })
    await page.waitForTimeout(250)
    await press(size, tid(page, 'sd-add'))
  } else {
    const a = await centre(cell(page, from)), b = await centre(cell(page, to))
    await drag(page, size, a, b)
  }
  await page.waitForSelector('#inpEditSave', { state: 'visible', timeout: 8000 })
  if (personId) await page.selectOption('#inpEditPerson', personId)
  const lab = { f: 'Fly', o: 'OFT', a: 'AMT' }
  for (const k of ['f', 'o', 'a']) {
    const box = page.locator('#inpEditSans').getByLabel(lab[k], { exact: true })
    const want = !!letters[k]
    if ((await box.isChecked()) !== want) await box.setChecked(want)
  }
  if (extra.remarks) await page.fill('#inpEditRmk', extra.remarks)
  await page.click('#inpEditSave'); await page.waitForTimeout(400)
  if (await tid(page, 'win-sansday').count()) { await press(size, tid(page, 'win-sansday-x')); await page.waitForTimeout(200) }
}
export async function lwWorking(page, size, rowId, iso) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]')
  const c = tid(page, `${rowId}-${iso}`); await lwMonth(page, iso); await c.waitFor({ state: 'attached', timeout: 8000 }); await c.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await press(size, c); await page.waitForTimeout(400)
  const t = await page.evaluate(() => { const w = document.querySelector('[data-testid="fly-working"]'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : null })
  return t
}

const MKEY = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
export async function lwMonth(page, iso) {
  if (await tid(page, 'req-p-' + iso).count()) return
  const b = tid(page, 'month-' + MKEY[+iso.slice(5, 7) - 1])
  if (await b.count()) { await b.click(); await page.waitForTimeout(900) }
}
