// Walker B helpers — phone by touch + short screens. Copied in shape from oilnotify-look.mjs and gi-w2lib.mjs.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4231/'
export const OUT = 'docs/img/handpass/2026-10-13-oil-ask-notify/B'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const SIZES = {
  p844: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  p568: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  l390: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
}
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17'
export const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); try { appendFileSync('docs/handpass/parts/on-B.log', s + '\n') } catch {} }
export const rec = (id, o) => { log('RESULT ' + id + ' ' + JSON.stringify(o)); try { appendFileSync('docs/handpass/parts/on-B.jsonl', JSON.stringify({ id, ...o }) + '\n') } catch {} }

export async function world(sizeKey, { who = 'ad', pass = 'a', fresh = false } = {}) {
  const size = SIZES[sizeKey]
  const touch = !!size.isMobile
  const ctx = await browser.newContext(size)
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const VW = size.viewport.width, VH = size.viewport.height
  const press = loc => (touch ? loc.tap() : loc.click())
  const tid = t => page.locator(`[data-testid="${t}"]`)
  const shot = async (name, clip) => { await page.screenshot({ path: join(OUT, `${name}.png`), ...(clip ? { clip } : {}) }); log('picture', name + '.png'); return name + '.png' }
  const hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  const unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  const toast = () => page.evaluate(() => (document.getElementById('toastEl')?.innerText || '').trim())
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  await page.waitForSelector('#loginForm, #vWeek .day', { state: 'attached', timeout: 15000 })
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await press(page.locator('#loginForm button[type=submit]'))
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })

  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal, #inCalBtn').first().waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${SAT}"]`)
  }
  const openDay = async iso => {
    if (await page.locator('[data-testid="win-inputsday"]').count()) return
    await page.locator(`[data-icday="${iso}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }
  // fileIt: spec.oil = 'yes' | 'no' | 'skip' (default yes). 'skip' leaves it unanswered if the app lets (it does not on a weekend).
  const fileIt = async (iso, spec) => {
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await toMonth(); await openDay(iso)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop #inpEditType')
    await page.selectOption('#inpEditPop #inpEditType', spec.type)
    if (spec.people.length > 1) {
      await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await press(b) }
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
    const ad = page.locator('#inpEditPop #inpEditAllday')
    if (spec.from) {
      if (await ad.count() && await ad.isChecked()) await press(ad)
      await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
      await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
    } else if (await ad.count() && !(await ad.isChecked())) await press(ad)
    if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
    await press(page.locator('#inpEditSave'))
    await page.waitForTimeout(450)
    for (let k = 0; k < 4; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        const one = sheet.locator(spec.oil === 'no' ? '[data-testid="oil-no"]' : '[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
        await press((await one.count()) ? one : many)
        await press(sheet.locator('[data-testid="oilconf-save"]'))
      } else if (await page.locator('[data-testid="docconf"]').count()) await press(page.locator('[data-testid="docconf-nodoc"]'))
      else break
      await page.waitForTimeout(350)
    }
    await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => log('STILL OPEN', 'the input window'))
    await page.waitForTimeout(300)
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
    await closeDay()
    return made[0]
  }
  // the usual Saturday: Range brief (Ranger, Yes) + Hangar open day (Tally) on the Scheduler Board
  const usualSat = async () => {
    const iid = await fileIt(SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
    await page.evaluate(() => window.go('editsched'))
    await page.waitForTimeout(500)
    await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
    await page.waitForTimeout(400)
    await page.locator(`#sbBoard [data-gradd="${SAT_DI}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
    await page.waitForTimeout(300)
    const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
    await type(`gr:${SAT_DI}.1.prog`, 'Hangar open day')
    await type(`gr:${SAT_DI}.1.str`, '13:00')
    await type(`gr:${SAT_DI}.1.end`, '15:00')
    await page.evaluate(di => { window.fillSlot(`g:${di}.1.+`, 'nick'); window.afterSchedMutate() }, SAT_DI)   // SETUP (allowed)
    await page.waitForTimeout(400)
    await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
    return iid
  }
  const groundNow = () => page.evaluate(di => (window.DAYS[di].ground || []).map(r => {
    const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''
    return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}`
  }), SAT_DI)
  const oilOf = iid => page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid)
  // measure: box inside screen + what is under its centre
  const measure = async sel => page.evaluate(([sel, VW, VH]) => {
    const el = document.querySelector(sel); if (!el) return null
    const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), inside: r.left >= -0.5 && r.top >= -0.5 && r.right <= VW + 0.5 && r.bottom <= VH + 0.5, onTop: hit === el || el.contains(hit) }
  }, [sel, VW, VH])
  // the first of several selectors that exists, for rows with testids
  const measureT = t => measure(`[data-testid="${t}"]`)
  const touchDrag = async (from, to, { hold = 450, steps = 14, settle = 500 } = {}) => {
    const c = await ctx.newCDPSession(page)
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
  const centreOf = async sel => { const b = await page.locator(sel).first().boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null }
  return { ctx, page, errors, press, tid, shot, hush, unhush, toast, toMonth, openDay, closeDay, fileIt, usualSat, groundNow, oilOf, measure, measureT, touchDrag, centreOf, VW, VH, touch }
}
export const done = async w => { log('ERRORS', w.errors); await w.ctx.close() }

// make Fri 17 a public holiday through Inputs gear -> Calendar... -> Holidays -> + Add (the worked example's way)
export async function makeHoliday(w, name = 'National Day', iso = FRI) {
  const { page, press, tid } = w
  await page.evaluate(() => window.go('inputs'))
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(tid('iset-days')); await page.waitForTimeout(600)
  const tab = tid('days-tab-holidays'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
  await press(tid('hol-add')); await page.waitForTimeout(500)
  await press(tid('hol-kind-ph'))
  await tid('hol-name').fill(name)
  for (let i = 0; i < 24 && !(await tid(`holcal-day-${iso}`).count()); i++) await press(tid('holcal-next-month'))
  await press(tid(`holcal-day-${iso}`)); await page.waitForTimeout(200)
  await press(tid('hol-save')); await page.waitForTimeout(800)
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250)
  return await tid('win-oilday').count()
}
export async function closeCal(w) {
  await w.page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {}); await w.page.waitForTimeout(250)
  await w.page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await w.page.waitForTimeout(250)
}
