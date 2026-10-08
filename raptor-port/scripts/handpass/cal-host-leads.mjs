// THE HOST'S OWN RUN of three leads in the calendar job's bug check (docs/handpass/2026-10-08-inputs-sans-calendar-check.md)
// — each driven through the app's real controls on the built bundle, each a PASS only when the RIGHT thing happens, so
// running it again on the fixed build is the re-walk (bug-check order §5).
//
//   A5  the "Calendar" window's month prints a holiday's short form, as the SANS month and the Inputs month do
//   M1  Escape closes the window in FRONT, not an input editor behind it                       (Astra's lead)
//   M2  a change of the picked people alone is unsaved work: opening another input asks first   (Astra's lead)
//
//   npm run build && npx vite preview --port 4180 --strictPort
//   node scripts/handpass/cal-host-leads.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/cal-host-leads'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const tid = (page, id) => page.locator(`[data-testid="${id}"]`)
const results = []
const judge = (id, ok, said) => { results.push({ id, ok, said }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${said}`) }
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

async function world(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page, errors }
}
/* walk a month label ("August 2026" / "Aug 2026") to a year and month with its two arrows */
async function toMonth(page, label, prev, next, y, m) {
  const at = async () => { const [mm, yy] = (await label.textContent()).trim().toLowerCase().split(/\s+/); return +yy * 12 + MON.findIndex(x => x.startsWith(mm.slice(0, 3))) }
  let d = y * 12 + (m - 1) - await at()
  for (; d > 0; d--) await next.click()
  for (; d < 0; d++) await prev.click()
  await page.waitForTimeout(200)
}

const browser = await chromium.launch(launchOptions)

/* ---- A5: one holiday, three months -------------------------------------------------------------------------------- */
{
  const { ctx, page, errors } = await world(browser)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  await tid(page, 'settings-open').click()
  await tid(page, 'settings-days').click()
  await tid(page, 'win-days').waitFor()
  if (await tid(page, 'days-tabs').count()) await tid(page, 'days-tab-holidays').click()
  await tid(page, 'hol-add').click()
  await tid(page, 'hol-name').fill('National Day')
  await tid(page, 'hol-short').fill('ND')
  await toMonth(page, tid(page, 'holcal-month'), tid(page, 'holcal-prev-month'), tid(page, 'holcal-next-month'), 2026, 8)
  await tid(page, 'holcal-day-2026-08-05').click()
  await page.screenshot({ path: join(OUT, 'a5-1-form.png') })
  await tid(page, 'hol-save').click()
  await page.waitForTimeout(400)
  /* the "Calendar" window's own month */
  if (await tid(page, 'days-tabs').count()) await tid(page, 'days-tab-month').click()
  await toMonth(page, tid(page, 'days-month'), tid(page, 'days-prev'), tid(page, 'days-next'), 2026, 8)
  const cal = (await tid(page, 'days-tag-2026-08-05').textContent().catch(() => '(no tag)')).trim()
  await page.screenshot({ path: join(OUT, 'a5-2-calendar-month.png') })
  /* the Leave War's Event row for the date */
  const lw = await page.evaluate(() => {
    const c = document.querySelector('[data-testid^="event-"][data-testid$="-2026-08-05"], [data-testid="event-0-2026-08-05"]')
    return c ? c.textContent.trim() : '(not drawn)'
  })
  await tid(page, 'win-days').locator('.win-x, [aria-label="Close"]').first().click().catch(() => {})
  /* the SANS month and the Inputs month */
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  await toMonth(page, page.locator('#inpCal .ic-mon'), page.locator('#icPrev'), page.locator('#icNext'), 2026, 8)
  const inp = (await tid(page, 'ib-tag-2026-08-05').textContent().catch(() => '(no tag)')).trim()
  await page.screenshot({ path: join(OUT, 'a5-3-inputs-month.png') })
  await page.locator('#inSansMode').click()
  await tid(page, 'sanscal').waitFor()
  await toMonth(page, tid(page, 'sc-month'), tid(page, 'sc-prev'), tid(page, 'sc-next'), 2026, 8)
  const sans = (await tid(page, 'sc-tag-2026-08-05').textContent().catch(() => '(no tag)')).trim()
  await page.screenshot({ path: join(OUT, 'a5-4-sans-month.png') })
  judge('A5', cal === 'ND' && inp === 'ND' && sans === 'ND',
    `Calendar month "${cal}" · Inputs month "${inp}" · SANS month "${sans}" · Leave War row "${lw}" (all should read ND)` + (errors.length ? ' · ERRORS ' + errors.join(' | ') : ''))
  await ctx.close()
}

/* ---- M1: Escape with a window in front of an input editor ------------------------------------------------------------ */
{
  const { ctx, page, errors } = await world(browser)
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  await toMonth(page, page.locator('#inpCal .ic-mon'), page.locator('#icPrev'), page.locator('#icNext'), 2026, 7)
  await page.locator('.ib-bar[data-iid]').first().click()
  await tid(page, 'win-inputedit').waitFor()
  await page.locator('#inpEditRmk').fill('host: unsaved remark')
  await page.locator('#inGear').click()
  await tid(page, 'win-inputsset').waitFor()
  await tid(page, 'iset-cancel').focus()
  const before = await page.evaluate(() => ({ focus: document.activeElement?.getAttribute('data-testid') || document.activeElement?.id, edit: !!document.querySelector('[data-testid="win-inputedit"]'), set: !!document.querySelector('[data-testid="win-inputsset"]') }))
  await page.screenshot({ path: join(OUT, 'm1-1-both-up.png') })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => ({ edit: !!document.querySelector('[data-testid="win-inputedit"]'), set: !!document.querySelector('[data-testid="win-inputsset"]'), rmk: document.querySelector('#inpEditRmk')?.value ?? null }))
  await page.screenshot({ path: join(OUT, 'm1-2-after-escape.png') })
  judge('M1', before.edit && before.set && after.edit && !after.set && after.rmk === 'host: unsaved remark',
    `focus on ${before.focus}; before: editor ${before.edit}, settings ${before.set}; after Escape: editor ${after.edit}, settings ${after.set}, remark ${JSON.stringify(after.rmk)} (the settings window should close, the editor and its remark stay)` + (errors.length ? ' · ERRORS ' + errors.join(' | ') : ''))
  await ctx.close()
}

/* ---- M2: only the picked people changed, then another input is opened ------------------------------------------------ */
{
  const { ctx, page, errors } = await world(browser)
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  await toMonth(page, page.locator('#inpCal .ic-mon'), page.locator('#icPrev'), page.locator('#icNext'), 2026, 7)
  await page.locator('[data-icday="2026-07-23"]').focus()
  await page.keyboard.press('Enter')
  await tid(page, 'win-inputsday').waitFor()
  await tid(page, 'win-inputsday').locator('[data-testid="idy-people"]').first().click()
  await tid(page, 'win-inputedit').waitFor()
  const title0 = (await page.locator('[data-testid="win-inputedit"] .win-ttl').first().textContent()).trim()
  const picked0 = await page.locator('#inpEditPop .pp-pucks button[aria-pressed="true"]').count()
  await page.locator('#inpEditPop .pp-pucks button[aria-pressed="false"]').first().click()
  const picked1 = await page.locator('#inpEditPop .pp-pucks button[aria-pressed="true"]').count()
  await page.screenshot({ path: join(OUT, 'm2-1-one-more-picked.png') })
  /* another input's bar, clear of both windows */
  const other = await page.evaluate(() => {
    const wins = [...document.querySelectorAll('.floatwin')].map(w => w.getBoundingClientRect())
    for (const b of document.querySelectorAll('.ib-bar[data-iid]')) {
      const r = b.getBoundingClientRect(); const x = r.left + Math.min(12, r.width / 2), y = r.top + r.height / 2
      if (r.width < 8 || wins.some(w => x >= w.left && x <= w.right && y >= w.top && y <= w.bottom)) continue
      const hit = document.elementFromPoint(x, y)
      if (hit && (hit === b || b.contains(hit))) return { x, y, iid: b.getAttribute('data-iid') }
    }
    return null
  })
  if (!other) judge('M2', false, 'no other bar is clear of the two windows — move a window and run again')
  else {
    await page.mouse.click(other.x, other.y)
    await page.waitForTimeout(400)
    const asked = await tid(page, 'inped-swap').count()
    const picked2 = await page.locator('#inpEditPop .pp-pucks button[aria-pressed="true"]').count()
    const title2 = (await page.locator('[data-testid="win-inputedit"] .win-ttl').first().textContent().catch(() => '(closed)')).trim()
    await page.screenshot({ path: join(OUT, 'm2-2-after-other-bar.png') })
    judge('M2', asked === 1 && picked2 === picked1,
      `shared input "${title0}": ${picked0} picked, one added (${picked1}); pressed another bar (${other.iid}) → question shown: ${asked === 1}; window now "${title2}", ${picked2} picked (it should ASK, and keep the ${picked1})` + (errors.length ? ' · ERRORS ' + errors.join(' | ') : ''))
  }
  await ctx.close()
}

await browser.close()
const bad = results.filter(r => !r.ok).length
console.log(`\n${results.length - bad} of ${results.length} as they should be`)
process.exit(bad ? 1 : 0)
