// [GROUP-INPUT-ONE-ROW] — shared helpers for the pictures of the schedule's ONE row for a shared input (D661, D734–D741).
// The pictures are a MOCK-UP: the real built app is driven through its own controls to file the inputs, and then the
// rows the schedule draws today (one a man) are re-arranged ON THE PAGE into the row as ruled. Nothing of the app is changed.
//   LOOK_URL=http://localhost:4180/  (the "raptor-preview" server of .claude/launch.json)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const OUT = 'docs/mock/img/group-input-one-row'
mkdirSync(OUT, { recursive: true })
export const BASE = process.env.LOOK_URL || 'http://localhost:4180/'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
export const PHONE = { width: 390, height: 844 }, DESK = { width: 1440, height: 900 }
export const errs = []

/* a browser context, signed in, in a memory-only world (?fresh=1); pictures at 2x so they stay sharp on his phone */
export async function open(viewport, who = 'ad', pass = 'a', touch = false, { clock = '2026-06-22T09:00:00' } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  /* the demo week is 13 Jul 26: with the PC's own date an input filed now reads LATE on every row, which is true and beside
     the point of these pictures - so the browser's clock is set three weeks before the week (timers still run) */
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
/* file one input through the Inputs page's "+ Input" window, as a person would.
   spec: {type, person (cs), people:[cs…] (Several people), from, to (iso), title, rmk, timed:[s,e], oil:'yes'|'no'} */
export async function fileInput(p, spec, touch = false) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await press(touch, p.locator('#inListBtn')); await p.waitForTimeout(200) }
  await press(touch, p.locator('#inNew')); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(touch, p.locator(`${WIN} [data-pp="${pid}"]`))
  }
  if (spec.from) await pick(p, spec.from, touch)
  if (spec.to) await pick(p, spec.to, touch)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(touch, p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await press(touch, (await one.count()) ? one : many)
      await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
    } else if (await p.locator('[data-testid="docconf"]').count()) await press(touch, p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, grp: r.grp || null, acc: r.acc || null })), had)
}
