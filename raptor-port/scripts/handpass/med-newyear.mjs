// [MED-NEWYEAR] (17 Oct 26) — a medical input across New Year, FILED THROUGH THE REAL WINDOW, on the Medical tab. The item
// said a downchit for 28 Dec – 3 Jan never shows there; its evidence was a row planted without its year ("Jan 3" read in
// 2026, so it ended before it began). This walk files the same dates the way a person does — the Medical tab's
// "+ Medical", the window's own calendar, a document, Save — and reads the tab "as of" three dates through its own picker.
// Asserts the right behaviour, so a PASS means correct:
//   30 Dec 2026 and 2 Jan 2027 — the card stands under Medically Down, reading "28 Dec – 3 Jan 2027";
//   5 Jan 2027 — it has moved to Pending Upchit, and is no longer under Medically Down.
// Phone (390) and desktop (1500), each in a fresh browser context (a fresh world: the filing is that context's only one).
//
//   node scripts/handpass/med-newyear.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-med-newyear')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], results = []
const check = (name, ok, got) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name} — saw ${JSON.stringify(got)}`) }

/* which section the new card stands in, and its words — read off the cards the tab draws */
const cardIn = (page, iid) => page.evaluate(iid => {
  const out = {}
  for (const sec of ['med-down', 'med-pend', 'med-done']) {
    const c = document.querySelector(`.medsec.${sec} .medcard[data-medcard="${iid}"]`)
    if (c) out[sec] = (c.textContent || '').replace(/\s+/g, ' ').trim()
  }
  return out
}, iid)

async function asOf(page, iso) {
  await page.click('#medCalBtn')
  for (let i = 0; i < 24 && !(await page.locator(`[data-medday="${iso}"]`).count()); i++) {
    const mon = (await page.locator('.med-cal-head .ic-mon').textContent()) || ''
    const [mn, yr] = mon.trim().split(/\s+/), want = iso.slice(0, 7)
    const at = `${yr}-${String(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mn) + 1).padStart(2, '0')}`
    await page.click(at < want ? '#medCalNext' : '#medCalPrev')
  }
  await page.click(`[data-medday="${iso}"]`)
  await page.waitForTimeout(250)
  return ((await page.locator('#medCalBtn').textContent()) || '').trim()
}

for (const [size, vp] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1500, height: 950 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size}: page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size}: console ${m.text()}`) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
  await page.click('#inMedBtn')
  await page.waitForSelector('#medView', { state: 'visible' })

  /* the filing, as a person makes it */
  const had = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await page.click('#medNew')
  const win = page.locator('[data-testid="win-inputedit"]')
  await win.waitFor({ state: 'visible' })
  const type = await win.locator('#inpEditType').inputValue()
  for (let i = 0; i < 24 && !(await page.locator('#inpEdCal [data-iso="2026-12-28"]').count()); i++) {
    const t = (await page.locator('#inpEdCal .dcal-title').first().textContent()) || ''
    await page.locator(`#inpEdCal button[aria-label="${/2027/.test(t) ? 'Previous' : 'Next'} month"]`).click()
  }
  await page.locator('#inpEdCal [data-iso="2026-12-28"]').click()
  for (let i = 0; i < 3 && !(await page.locator('#inpEdCal [data-iso="2027-01-03"]').count()); i++)
    await page.locator('#inpEdCal button[aria-label="Next month"]').click()
  await page.locator('#inpEdCal [data-iso="2027-01-03"]').click()
  await win.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.1 %%EOF') }])
  await page.screenshot({ path: join(OUT, `${size}-1-window.png`) })
  await page.locator('#inpEditSave').click()
  await win.waitFor({ state: 'detached' }).catch(() => {})
  const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(String(r.iid))).map(r => ({ iid: String(r.iid), type: r.type, date: r.date, endDate: r.endDate, yr: r.yr })), had)
  check(`${size}: one ${type} filed through "+ Medical"`, made.length === 1, made)
  if (made.length !== 1) { results.push(`NOT WALKED ${size}: the filing did not land`); await ctx.close(); continue }
  const iid = made[0].iid

  for (const [n, iso, want] of [['2', '2026-12-30', 'med-down'], ['3', '2027-01-02', 'med-down'], ['4', '2027-01-05', 'med-pend']]) {
    const said = await asOf(page, iso)
    const where = await cardIn(page, iid)
    check(`${size}: as of ${iso} (the button reads "${said}") the card is under ${want} only`, Object.keys(where).join() === want, where)
    if (want === 'med-down') check(`${size}: as of ${iso} the card's period runs across New Year`, /28 Dec\D+3 Jan 2027/.test(where[want] || ''), where[want])
    await page.evaluate(iid => document.querySelector(`.medcard[data-medcard="${iid}"]`)?.scrollIntoView({ block: 'center' }), iid)
    await page.evaluate(iid => { const c = document.querySelector(`.medcard[data-medcard="${iid}"]`); if (c) c.style.outline = '3px solid #ff3b6b' }, iid)
    await page.screenshot({ path: join(OUT, `${size}-${n}-asof-${iso}.png`) })
  }
  await ctx.close()
}
await browser.close()
const log = [...results, ...errs.map(e => 'ERROR ' + e)].join('\n')
writeFileSync(join(OUT, 'results.txt'), log + '\n')
console.log(log)
