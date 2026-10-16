// [INPUTS-LIST-NEXT-YEAR] (17 Oct 26) — the Inputs list reads a next year's input in its own year. The demo squadron's
// OIL input for 15 Feb 2027 is stored as the Leave War stores a leave approved on a next year's period: a bare label
// ('Feb 15') and its anchor year (2027). Inputs → List → All dates, phone 390 and desktop 1500: its row is read and
// pictured. Asserts the right behaviour, so a PASS means correct: the row prints "15 Feb 2027" and stands after every
// row of this year; and under the list's default two weeks it is not shown.
//
//   node scripts/handpass/inputs-list-next-year.mjs [out dir]     (a "before" run takes a SIBLING folder: a run empties its own)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-inputs-list-next-year')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], results = []
const check = (name, ok, got) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name} — saw ${JSON.stringify(got)}`) }

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
  await page.click('#inListBtn'); await page.waitForTimeout(300)
  const iid = await page.evaluate(() => { const r = window.INPUTS.find(x => x.date === 'Feb 15' && +x.yr === 2027); return r ? String(r.iid) : null })
  check(`${size}: the demo holds a 15 Feb 2027 input stored as 'Feb 15' + 2027`, !!iid, iid)
  if (!iid) { await ctx.close(); continue }
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#inBody [data-iid], #inList [data-iid]')]
    .filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.getAttribute('data-iid'), text: (e.textContent || '').replace(/\s+/g, ' ').trim() })))
  const def = await rows()
  check(`${size}: under the default two weeks it is not listed`, !def.some(r => r.iid === iid), def.length)
  if (!(await page.locator('#inRangePop').count())) await page.click('#inRangeBtn')
  await page.click('#inRangeAll'); await page.waitForTimeout(300)
  const all = await rows()
  const at = all.findIndex(r => r.iid === iid)
  const row = all[at] || {}
  if (size === 'desktop') {
    check(`${size}: printed with its year`, /15 Feb 2027/.test(row.text || ''), row.text)
    const later = all.slice(at + 1).filter(r => !/2027/.test(r.text))
    check(`${size}: no row of this year stands after it`, at >= 0 && later.length === 0, later.map(r => r.text.slice(0, 40)))
  } else {
    /* on a phone a card carries no date: the day heading above it says it (D718, D723) — read the heading */
    const h = await page.evaluate(iid => {
      const card = document.querySelector(`#inList [data-iid="${iid}"]`); let e = card && card.previousElementSibling
      while (e && !e.classList.contains('icard-day')) e = e.previousElementSibling
      const heads = [...document.querySelectorAll('#inList .icard-day')].map(x => x.getAttribute('data-iso'))
      return { text: e ? (e.textContent || '').replace(/\s+/g, ' ') : null, iso: e && e.getAttribute('data-iso'), heads }
    }, iid)
    check(`${size}: its day heading says the year`, /15 Feb 2027/.test(h.text || ''), h.text)
    const later = h.heads.slice(h.heads.indexOf(h.iso) + 1).filter(x => x < h.iso)
    check(`${size}: no day of this year stands after it`, h.iso === '2027-02-15' && later.length === 0, later)
  }
  const sel = `#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`
  await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b' } }, sel)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  await page.screenshot({ path: join(OUT, `${size}-all-dates.png`) })
  await ctx.close()
}
await browser.close()
const log = [...results, ...errs.map(e => 'ERROR ' + e)].join('\n')
writeFileSync(join(OUT, 'results.txt'), log + '\n')
console.log(log)
