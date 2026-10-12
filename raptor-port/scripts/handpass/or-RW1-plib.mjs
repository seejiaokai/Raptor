// RW1: phone helpers (390x844 by touch), copied from or-D-lib.mjs (not imported: that file opens a browser and writes D's log on import)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
export { OUTP, shotP, toastBoxOf, log, sleep, waitQuiet } from './or-RW1-lib.mjs'
import { sleep, OUTP } from './or-RW1-lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
mkdirSync(OUTP, { recursive: true })
export const errs = []
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const press = (loc, timeout) => loc.tap(timeout ? { timeout } : undefined)
export const launchP = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

export async function signIn(page, who, pass) {
  await page.waitForSelector('#loginForm, #vWeek .day', { timeout: 15000 })
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await page.locator('#loginForm button[type=submit]').tap()
  }
  await page.waitForSelector('#vWeek .day', { timeout: 15000 })
}
export async function openPhone(browser, { viewport = { width: 390, height: 844 }, who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00' } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `RW1 ${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await signIn(page, who, pass)
  return { ctx, page }
}
export async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
export async function fileInputP(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await press(p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await press(p.locator('#inListBtn')); await p.waitForTimeout(200) }
  await press(p.locator('#inNew')); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await press(p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(p.locator(`${WIN} [data-pp="${pid}"]`))
    if (spec.ph) await press(p.locator(`${WIN} [data-ph="${spec.ph}"]`))
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await press(p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await press((await one.count()) ? one : many)
      await press(sheet.locator('[data-testid="oilconf-save"]'))
    } else if (await p.locator('[data-testid="docconf"]').count()) await press(p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p) })), had)
}
export const inputP = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { type: r.type, title: r.title || '', date: r.date, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p) } : null }, iid)

export async function touchDrag(page, from, to, { hold = 450, steps = 12, settle = 350 } = {}) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  await sleep(hold)
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + 2, from.y + 2) }); await sleep(60)
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await sleep(25) }
  await sleep(250)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(settle)
}
export async function longPress(page, x, y, ms = 900) {
  const c = await page.context().newCDPSession(page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await sleep(ms)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {}); await sleep(500)
}
export const DI = 2
export async function goWeek(page) { await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.evaluate(() => window.go('editsched')); await sleep(600) }
export async function goBoard(page, di = DI) { if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await sleep(700) } await page.evaluate(di => window.openScheduler(di), di); await sleep(900) }
export async function unfoldWeek(page, di = DI) { const t = page.locator(`#page-editsched .day:not(.peek) [data-pitog="${di}"]`).first(); if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) } }
export async function unfoldBoard(page, di = DI) { const t = page.locator(`#schedBoard [data-pitog="${di}"]`).first(); if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) } }
/* a Ground Programme row on the week found by its text, scrolled near the top */
export async function weekRowTop(page, src, { top = 130 } = {}) {
  const ok = await page.evaluate(src => {
    const re = new RegExp(src, 'i')
    document.querySelectorAll('[data-ord="1"]').forEach(e => e.removeAttribute('data-ord'))
    const r = [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-grnd .pl-row')].find(x => re.test(x.innerText.replace(/\s+/g, ' ')))
    if (!r) return false
    r.setAttribute('data-ord', '1'); r.scrollIntoView({ block: 'center', inline: 'nearest' }); return true
  }, src)
  if (!ok) return null
  await sleep(400)
  await page.evaluate(top => { const r = document.querySelector('[data-ord="1"]'); window.scrollBy(0, r.getBoundingClientRect().top - top) }, top); await sleep(300)
  return page.locator('[data-ord="1"]')
}
