// THE FIRST LOOK AT THE DESIGN VET'S BUILD (owner D726–D729, 10 Oct 26 — docs/superpowers/plans/2026-10-10-inputs-vet-plan.md):
// every changed screen of the BUILT app, at a desktop and at a phone, photographed beside the drawing it was built
// from (docs/mock/img/inputs-vet/, docs/mock/img/card-questions/). A look, not the walk: nothing is judged here but by
// opening the pictures. The walk proper is scripts/handpass/ivet-walk.mjs.
//
//   node scripts/handpass/ivet-look.mjs <out dir>          (LOOK_URL — the built bundle; default :4174)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-inputs-vet-check/look'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4174/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const WIN = '[data-testid="win-inputedit"]', DAY = '[data-testid="win-inputsday"]'
const errors = []

async function world(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const tag = phone ? 'phone' : 'desk'
  page.on('pageerror', e => errors.push(tag + ' pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(tag + ' console: ' + m.text()) })
  const tap = l => (phone ? l.tap() : l.click())
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
  await page.evaluate(() => window.go('inputs'))
  const toJuly = async () => {
    for (let i = 0; i < 40; i++) {
      const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
      const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
      if (!d) break
      await tap(page.locator(d > 0 ? '#icNext' : '#icPrev'))
    }
  }
  await toJuly()
  const pic = async name => { await page.waitForTimeout(350); if (!phone) await page.mouse.move(2, 2); await page.screenshot({ path: join(OUT, `${tag}-${name}.png`) }) }
  const openDay = async iso => {
    if (await page.locator(DAY).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    const cell = page.locator(`#inpCal [data-icday="${iso}"]`)
    if (phone) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
    await page.locator(DAY).waitFor()
  }
  /* file one input through the app's own "+ Input" of a day */
  const file = async ({ iso, till, type, who, several, title, rmk, from, to }) => {
    await openDay(iso)
    await tap(page.locator('#icPopAdd')); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', type)
    if (several) {
      await tap(page.locator(`${WIN} [data-testid="pp-several"]`))
      for (const cs of several) { const b = page.locator(`${WIN} [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await tap(b) }
    } else if (who) await page.selectOption('#inpEditPerson', await id(who))
    if (till) { await tap(page.locator('#inpEdCal .rc-d', { hasText: new RegExp('^' + till + '$') })); await page.waitForTimeout(150) }
    if (from) { await page.fill('#inpEditStart', from).catch(() => {}); await page.fill('#inpEditEnd', to).catch(() => {}) }
    if (title) await page.fill('#inpEditOwnTitle', title)
    if (rmk) await page.fill('#inpEditRmk', rmk)
    await tap(page.locator('#inpEditSave'))
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: 1200 }).then(() => true, () => false)) { await tap(sheet.locator('[data-testid="oil-yes"]')); await tap(sheet.locator('[data-testid="oilconf-save"]')) }
    await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => errors.push(tag + ': the window stayed open after Save: ' + JSON.stringify({ iso, type, who })))
    await page.waitForTimeout(300)
  }
  const list = async () => {
    if (await page.locator(DAY).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    await tap(page.locator('#inListBtn'))
    if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn'))
    await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400)
  }
  return { ctx, page, tap, pic, openDay, file, list, toJuly }
}

for (const phone of [false, true]) {
  const { ctx, page, tap, pic, openDay, file, list } = await world(phone)
  /* a group of nine beside the demo's meeting of four, and two inputs of several days (the mock-ups' own) */
  await file({ iso: '2026-07-23', type: 'Event', several: ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch', 'Echo', 'Wisp'], title: 'Squadron photo', from: '15:00', to: '15:30' })
  await file({ iso: '2026-07-27', till: '29', type: 'Training', who: 'Ranger', title: 'Range week' })
  await file({ iso: '2026-07-27', till: '30', type: 'Duty', who: 'Blade', rmk: 'bring ID card' })
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  /* THE MONTH: the count first, a timed bar lighter; the key says "duty"; the fold's four lines */
  await pic('month')
  await tap(page.locator('[data-testid="ib-how"]')); await pic('month-how'); await tap(page.locator('[data-testid="ib-how"]'))
  /* A DAY OPENED: "till" once */
  await openDay('2026-07-27'); await page.waitForTimeout(3600); await pic('day-27jul')
  await openDay('2026-07-13'); await page.waitForTimeout(3600); await pic('day-13jul')
  await openDay('2026-07-23'); await page.waitForTimeout(3600); await pic('day-23jul')
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  /* THE GEAR */
  if (phone) { /* the gear is on the tools row */ }
  await tap(page.locator('#inGear')); await page.waitForTimeout(400); await pic('gear'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  /* THE LIST */
  await list()
  await page.evaluate(() => window.scrollTo(0, 0)); await pic('list-top')
  if (!phone) {
    /* July at the head of the table, as the drawing has it */
    await page.evaluate(() => { for (const tr of document.querySelectorAll('#inBody tr')) { const s = (tr.querySelector('td[data-label="Start"]')?.textContent || '').trim(); if (!/ Jul\b/.test(s)) tr.style.display = 'none' } window.scrollTo(0, 0) })
    await pic('list-july')
    await page.evaluate(() => { for (const tr of document.querySelectorAll('#inBody tr')) { const s = (tr.querySelector('td[data-label="Start"]')?.textContent || '').trim(); if (!/^2[2-9] Jul\b/.test(s)) tr.style.display = 'none' } window.scrollTo(0, 0) })
    await pic('list-22-29jul')
    await page.evaluate(() => { for (const tr of document.querySelectorAll('#inBody tr')) tr.style.display = '' })
  } else {
    await page.evaluate(() => { const t = [...document.querySelectorAll('[data-testid="inl-day"]')].find(el => /23 Jul/.test(el.textContent)); t?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130) })
    await pic('list-23jul')
    await page.evaluate(() => { const t = [...document.querySelectorAll('[data-testid="inl-day"]')].find(el => /27 Jul/.test(el.textContent)); t?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130) })
    await pic('list-27jul')
    await page.evaluate(() => window.scrollTo(0, 0))
    await tap(page.locator('#inFiltersBtn')); await pic('list-filters'); await tap(page.locator('#inFiltersBtn'))
  }
  /* "+ INPUT" → THE WINDOW: no date, no paragraph; the "?" beside Type */
  await tap(page.locator('#inNew')); await page.locator(WIN).waitFor(); await pic('new-window')
  await tap(page.locator('#inTypeHelp')); await page.waitForTimeout(300); await pic('new-window-help')
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  errors.push(`${phone ? 'phone' : 'desk'} NOTE after Escape on the help card: card ${await page.locator('#inTypePop').count()} window ${await page.locator(WIN).count()}`)
  await tap(page.locator('#inpEditCancel')); await page.waitForTimeout(250)
  /* A SAVED INPUT'S WINDOW: one person (no paragraph) and shared ("Date changes apply to all N.") */
  const one = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid)
  const grp = await page.evaluate(() => window.INPUTS.find(r => r.grp && r.type === 'Meeting')?.iid)
  for (const [name, iid] of [['saved-one', one], ['saved-shared', grp]]) {
    await page.evaluate(iid => { const el = document.querySelector(`[data-iid="${iid}"]`) || [...document.querySelectorAll('[data-iid]')].find(e => window.INPUTS.find(r => r.iid === e.getAttribute('data-iid'))?.grp === window.INPUTS.find(r => r.iid === iid)?.grp); el?.scrollIntoView({ block: 'center' }) }, iid)
    const target = await page.evaluateHandle(iid => { const want = window.INPUTS.find(r => r.iid === iid); return [...document.querySelectorAll('[data-iid]')].find(e => { const r = window.INPUTS.find(x => x.iid === e.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) }) }, iid)
    const opener = target.asElement() && await target.asElement().$('[data-testid="in-open"], [data-testid="inl-open"]')
    if (!opener) { errors.push(`${phone ? 'phone' : 'desk'}: no row for ${name}`); continue }
    await tap(opener); await page.locator(WIN).waitFor(); await page.waitForTimeout(300)
    await pic(name)
    await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .inped-body'); if (b) b.scrollTop = b.scrollHeight })
    await pic(name + '-foot')
    await tap(page.locator('#inpEditCancel')); await page.waitForTimeout(250)
  }
  /* THE EMPTY LIST */
  await page.evaluate(() => window.scrollTo(0, 0))
  await tap(page.locator('#inRangeBtn'))
  await tap(page.locator('#inRangeCal [data-cal="2026-07-01"]')); await tap(page.locator('#inRangeCal [data-cal="2026-07-03"]'))
  if (phone) await page.mouse.click(5, 5).catch(() => {}); else await page.mouse.click(700, 700)
  await pic('list-empty')
  await ctx.close()
}
await browser.close()
console.log(errors.length ? 'NOTES / ERRORS:\n' + errors.join('\n') : 'no page errors')
