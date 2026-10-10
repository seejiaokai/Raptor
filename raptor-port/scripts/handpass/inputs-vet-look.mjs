// THE INPUTS CALENDAR AND THE INPUTS LIST, EVERY COMPONENT, FOR A DESIGN VET (owner, 10 Oct 26 — "can u vet how the
// inputs calendar and list is designed? Like every component including the text. I don't like too wordy interface" —
// D726). It photographs each state of the two screens on a desktop and on a phone, as built, and writes every word a
// reader meets in each state to one file, so the words can be read as a list. It asserts nothing.
//
//   node scripts/handpass/inputs-vet-look.mjs <out dir>          (LOOK_URL — the built bundle; default :4233)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-inputs-vet'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4233/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const WIN = '[data-testid="win-inputedit"]', DAY = '[data-testid="win-inputsday"]'
const words = [], errors = []

for (const phone of [false, true]) {
  const tag = phone ? 'phone' : 'desk'
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(tag + ' pageerror: ' + e.message))
  const tap = l => (phone ? l.tap() : l.click())
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await tap(page.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  /* one picture and the words on screen (what is drawn and not hidden), under a name */
  const snap = async (name, sel) => {
    await page.waitForTimeout(350)
    if (!phone) await page.mouse.move(2, 2)
    await page.screenshot({ path: join(OUT, `${tag}-${name}.png`) })
    const text = await page.evaluate(sel => {
      const root = sel ? document.querySelector(sel) : document.querySelector('.page.on, #page-inputs') || document.body
      if (!root) return '(nothing)'
      const out = []
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
      for (let n = tw.currentNode; n; n = tw.nextNode()) {
        if (!n.getClientRects().length) continue
        for (const a of ['placeholder', 'title', 'aria-label']) { const v = n.getAttribute && n.getAttribute(a); if (v && a !== 'aria-label') out.push(`[${a}] ${v}`) }
        for (const c of n.childNodes) if (c.nodeType === 3 && c.textContent.trim()) out.push(c.textContent.trim().replace(/\s+/g, ' '))
      }
      return [...new Set(out)].join('\n')
    }, sel || null)
    words.push(`\n## ${tag} — ${name}\n\n${text}`)
  }
  const step = async (name, fn) => { try { await fn() } catch (e) { errors.push(`${tag} ${name}: ${String(e.message).split('\n')[0]}`) } }
  const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }

  await step('cal', async () => { await page.waitForTimeout(600); await snap('1-cal-month') })
  await step('how', async () => { await tap(page.locator('.sc-how-btn, [aria-controls="ibHowList"]').first()); await snap('2-cal-how-this-works'); await tap(page.locator('.sc-how-btn, [aria-controls="ibHowList"]').first()) })
  await step('filters', async () => { if (phone) { await tap(page.locator('#inFiltersBtn')); await snap('3-cal-filters'); await tap(page.locator('#inFiltersBtn')) } })
  await step('gear', async () => { await tap(page.locator('#inGear')); await snap('4-cal-gear'); await esc() })
  await step('day', async () => {
    const cell = page.locator('#inpCal [data-icday="2026-07-23"]')
    if (phone) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
    await page.locator(DAY).waitFor(); await snap('5-day-opened', DAY)
  })
  await step('new', async () => { await tap(page.locator('#icPopAdd')); await page.locator(WIN).waitFor(); await snap('6-window-new', WIN)
    await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .win-body'); if (b) b.scrollTop = b.scrollHeight }); await snap('6b-window-new-foot', WIN)
    await tap(page.locator('#inpEditCancel')); await page.waitForTimeout(300) })
  await step('shared', async () => {
    await tap(page.locator(`${DAY} [data-testid^="idy-row-"]`).nth(1).locator('[data-testid="idy-open"]')); await page.locator(WIN).waitFor(); await snap('7-window-shared', WIN)
    await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .win-body'); if (b) b.scrollTop = b.scrollHeight }); await snap('7b-window-shared-foot', WIN)
    await tap(page.locator('#inpEditCancel')); await page.waitForTimeout(300)
  })
  await step('note', async () => { await tap(page.locator('#icAddPuck')); await snap('8-day-note', DAY); await esc() })
  await step('close day', async () => { if (await page.locator(DAY).count()) await esc(); if (await page.locator(DAY).count()) await esc() })
  await step('list', async () => { await tap(page.locator('#inListBtn')); await page.waitForTimeout(500); await snap('9-list-default') })
  await step('range', async () => { if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn')); await snap('10-list-dates-pop'); await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400) })
  await step('list all', async () => {
    await page.evaluate(() => { const t = [...document.querySelectorAll('[data-testid="inl-day"], #inBody tr')].find(el => /13 Jul/.test(el.textContent)); if (t) { t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -160) } })
    await snap('11-list-july')
  })
  await step('list top', async () => { await page.evaluate(() => window.scrollTo(0, 0)); if (phone) { await tap(page.locator('#inFiltersBtn')); await snap('12-list-filters'); await tap(page.locator('#inFiltersBtn')) } else await snap('12-list-top') })
  await step('type help', async () => { if (await page.locator('#inTypeHelp').count()) { await tap(page.locator('#inTypeHelp')); await snap('13-list-type-help'); await esc() } })
  await step('one-person window', async () => {
    const iid = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid ?? '')
    await tap(page.locator(`[data-iid="${iid}"]`).first().locator('[data-testid="in-open"], [data-testid="inl-open"]')); await page.locator(WIN).waitFor(); await snap('14-window-saved', WIN)
    await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .win-body'); if (b) b.scrollTop = b.scrollHeight }); await snap('14b-window-saved-foot', WIN)
    await tap(page.locator('#inpEditCancel'))
  })
  await ctx.close()
}
await browser.close()
writeFileSync(join(OUT, 'words.md'), '# Every word on the Inputs calendar and the Inputs list, state by state (as built, 10 Oct 26)\n' + words.join('\n') + '\n')
console.log(errors.length ? 'STEPS THAT DID NOT RUN:\n' + errors.join('\n') : 'every step ran')
