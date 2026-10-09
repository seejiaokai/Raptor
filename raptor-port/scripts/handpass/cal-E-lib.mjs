// Walker E's shared helpers: a fresh browser context, signed in, the Inputs page, pictures, error watching.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const URL = 'http://localhost:4211/'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/E'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(OUT, { recursive: true }); mkdirSync(PARTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  short: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const big = s => s === 'desk' || s === 'wide'

export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export async function world(browser, size = 'desk', who = 'ad', opts = {}) {
  const ctx = await browser.newContext({ ...SIZES[size], ...(opts.ctx || {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url()) })
  await page.goto(URL + (opts.plain ? '' : '?fresh=1'))
  await page.fill('#luser', who === 'ad' ? 'ad' : 'us'); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page, errors, size }
}

export async function toInputs(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
}
export async function toMonth(page, y, m, size) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MON.findIndex(x => x.startsWith(name)))
    if (!d) return
    const loc = page.locator(d > 0 ? '#icNext' : '#icPrev')
    await loc.click()
  }
  throw new Error('month never reached')
}
export const cell = (p, iso) => p.locator(`#inpCal [data-icday="${iso}"]`)
export const bar = (p, iid) => p.locator(`.ib-bar[data-iid="${iid}"]`)
export async function press(page, size, loc, opts) { return big(size) ? loc.click(opts) : loc.tap(opts) }

export async function shot(page, name, full = false) {
  await page.mouse.move(0, 1).catch(() => {})
  const p = join(OUT, name + '.png')
  await page.screenshot({ path: p, fullPage: full })
  return name + '.png'
}

// results: a list of rows kept in a json file per scenario batch, merged at the end
export function saveRows(batch, rows) {
  writeFileSync(join(PARTS, `cal-E-rows-${batch}.json`), JSON.stringify(rows, null, 2))
}
export function loadRows(batch) {
  try { return JSON.parse(readFileSync(join(PARTS, `cal-E-rows-${batch}.json`), 'utf8')) } catch { return [] }
}
export const row = (id, did, saw, verdict, pics) => ({ id, did, saw, verdict, pics })

// file an input THROUGH THE BRIDGE as seeded background (named as such in the row)
export async function seedFile(page, rows) {
  return page.evaluate(rows => {
    const w = window, P = w.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    return rows.map((r, i) => {
      const iid = 'e-' + Date.now().toString(36) + '-' + i
      w.fileInput({ iid, person: r.pid || crew[r.who % crew.length], type: r.type, date: r.from, endDate: r.to, yr: 2026, allday: !r.timed, s: r.timed ? r.timed[0] : 360, e: r.timed ? r.timed[1] : 1080, remarks: r.remarks, ...(r.more || {}) })
      return iid
    })
  }, rows)
}
export const recOf = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)
export const cs = (page, id) => page.evaluate(id => window.PEOPLE[id]?.cs, id)
export async function launch() { return chromium.launch(launchOptions) }
export { chromium, devices }

// make an input THROUGH THE APP'S OWN DOOR: the date's corner -> the opened day's "+ Input" -> the editor -> Add. Returns the new iid.
export async function makeInput(page, size, iso, { type = 'Duty', remarks = '', person } = {}) {
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  const isOpen = (await cell(page, iso).getAttribute('class')).includes('is-open') && (await page.locator('#icPopAdd').count()) > 0
  if (!isOpen) await press(page, size, cell(page, iso), { position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').waitFor()
  await press(page, size, page.locator('#icPopAdd'))
  await page.waitForSelector('#inpEditPop')
  await page.selectOption('#inpEditType', { label: type })
  if (person) await page.selectOption('#inpEditPerson', person)
  if (remarks) await page.fill('#inpEditRmk', remarks)
  await press(page, size, page.locator('#inpEditSave'))
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  const nu = after.filter(i => !before.includes(i))
  return nu
}
export const closeDay = async page => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click().catch(() => {}); await page.waitForTimeout(300) } }
export async function mouseDrag(page, from, to, steps = 8) {
  await page.mouse.move(from.x, from.y); await page.mouse.down()
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps }); await page.mouse.move(to.x, to.y, { steps }); await page.mouse.up()
}
export const centreOf = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, b } }
export const dayCentre = async (page, iso, low = false) => { const b = await cell(page, iso).boundingBox(); return { x: b.x + b.width / 2, y: low ? b.y + b.height - 12 : b.y + b.height / 2, b } }
export async function fingerDrag(ctx, page, pts, hold = 0) {
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(pts[0].x), y: Math.round(pts[0].y), id: 1 }] })
  if (hold) await page.waitForTimeout(hold)
  for (const q of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(q.x), y: Math.round(q.y), id: 1 }] }); await page.waitForTimeout(16) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
}
export const lerp = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n }))
