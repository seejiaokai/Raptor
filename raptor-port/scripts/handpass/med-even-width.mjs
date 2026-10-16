// D977 (17 Oct 26) — the Medical tab's cards, one even width: on a phone exactly a third of the row, on a desktop one
// fixed width, words wrapping inside. Pictures of the tab at phone (390, and the narrowest 320) and desktop (1500), as
// of 30 Dec 2026 with a downchit filed for 28 Dec – 3 Jan through "+ Medical" (so a long period stands beside the demo's
// short ones), plus the as-of date "today" (the demo's cards). With MEASURE=1 it only prints each card's width and the
// width of its widest line (the hugging build), to choose the desktop width from what the cards hold.
// Asserts the ruling, so a PASS means correct: in each section every card is the same width, and between sections the
// columns line up (the first card of each section starts and ends at the same place); nothing runs past its card.
//
//   node scripts/handpass/med-even-width.mjs [out dir]  (the "before" run takes a SIBLING folder, …-before: a run empties its own folder)  (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-med-even-width')
const MEASURE = !!process.env.MEASURE
if (!MEASURE) { rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }) }
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], results = []
const check = (name, ok, got) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name} — saw ${JSON.stringify(got)}`) }

async function asOf(page, iso) {
  await page.click('#medCalBtn')
  for (let i = 0; i < 24 && !(await page.locator(`[data-medday="${iso}"]`).count()); i++) {
    const mon = ((await page.locator('.med-cal-head .ic-mon').textContent()) || '').trim().split(/\s+/)
    const at = `${mon[1]}-${String(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon[0]) + 1).padStart(2, '0')}`
    await page.click(at < iso.slice(0, 7) ? '#medCalNext' : '#medCalPrev')
  }
  await page.click(`[data-medday="${iso}"]`)
  await page.waitForTimeout(250)
}
const cards = page => page.evaluate(() => [...document.querySelectorAll('.medsec')].map(sec => ({
  sec: [...sec.classList].find(c => c.startsWith('med-') && c !== 'medsec'),
  cards: [...sec.querySelectorAll('.medcard')].map(c => {
    const b = c.getBoundingClientRect()
    const rg = document.createRange(); let ink = -1e9
    for (const el of c.querySelectorAll('.medcard-top>*, .medcard-row2>*, .medcard-r')) {
      rg.selectNodeContents(el); for (const r of rg.getClientRects()) if (r.width) ink = Math.max(ink, r.right)
    }
    return { text: (c.textContent || '').replace(/\s+/g, ' ').trim(), left: Math.round(b.left), width: Math.round(b.width), inkW: Math.round(ink - b.left), over: Math.round(ink - (b.right - 1)) }
  }),
})))

for (const [size, vp] of [['phone', { width: 390, height: 844 }], ['phone320', { width: 320, height: 700 }], ['desktop', { width: 1500, height: 950 }]]) {
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
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })

  const judge = async (when) => {
    const got = await cards(page)
    if (MEASURE) { console.log(size, when, JSON.stringify(got)); return }
    const all = got.flatMap(s => s.cards)
    for (const s of got) if (s.cards.length > 1) {
      const ws = [...new Set(s.cards.map(c => c.width))]
      check(`${size} ${when}: ${s.sec} — every card one width`, ws.length === 1, ws)
    }
    const firsts = got.filter(s => s.cards.length).map(s => [s.cards[0].left, s.cards[0].width])
    check(`${size} ${when}: the sections' first cards line up`, new Set(firsts.map(String)).size <= 1, firsts)
    const over = all.filter(c => c.over > 0).map(c => c.text)
    check(`${size} ${when}: nothing runs past its card`, over.length === 0, over)
  }
  await judge('today')
  if (!MEASURE) await page.screenshot({ path: join(OUT, `${size}-1-today.png`), fullPage: true })

  /* the long period beside the short ones: 28 Dec – 3 Jan, filed through "+ Medical" as a person files it */
  await page.click('#medNew')
  const win = page.locator('[data-testid="win-inputedit"]')
  await win.waitFor({ state: 'visible' })
  for (let i = 0; i < 24 && !(await page.locator('#inpEdCal [data-iso="2026-12-28"]').count()); i++) {
    const t = (await page.locator('#inpEdCal .dcal-title').first().textContent()) || ''
    await page.locator(`#inpEdCal button[aria-label="${/2027/.test(t) ? 'Previous' : 'Next'} month"]`).click()
  }
  await page.locator('#inpEdCal [data-iso="2026-12-28"]').click()
  await page.locator('#inpEdCal button[aria-label="Next month"]').click()
  await page.locator('#inpEdCal [data-iso="2027-01-03"]').click()
  await win.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.1 %%EOF') }])
  await page.locator('#inpEditSave').click()
  await win.waitFor({ state: 'detached' }).catch(() => {})
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  await asOf(page, '2027-01-02')
  await judge('as of 2 Jan 2027')
  if (!MEASURE) await page.screenshot({ path: join(OUT, `${size}-2-asof-2027-01-02.png`), fullPage: true })
  await ctx.close()
}
await browser.close()
if (!MEASURE) {
  const log = [...results, ...errs.map(e => 'ERROR ' + e)].join('\n')
  writeFileSync(join(OUT, 'results.txt'), log + '\n')
  console.log(log)
} else if (errs.length) console.log(errs.join('\n'))
