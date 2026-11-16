// print1: D2005 — a published day keeps its flags after a Logic setting changes; View-only Sched's print and the CSV export. ENGINE=chromium|webkit. v1
import { launch, go, pic, say, rec, state, press, errors, IMG } from './wlib.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const ENGINE = process.env.ENGINE || 'chromium'
const T = ENGINE === 'webkit' ? 'wk' : 'cr'
say('print1 v1', ENGINE)
const { browser, ctx, page } = await launch(ENGINE, false, true)
await page.addInitScript(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc')
  Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', { configurable: true, get() { return d.get.call(this) }, set(v) { window.__printHtml = v; return d.set.call(this, v) } })
})
await page.reload(); await page.waitForTimeout(800)
if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(800) }
await go(page, 'editsched')
const D = '#eWeek .day[data-day="0"]'
// eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
for (let i = 0; i < 4; i++) { const sel = page.locator(`${D} select[data-sign]`).nth(i); await sel.scrollIntoViewIfNeeded(); await sel.selectOption({ index: 1 }); await page.waitForTimeout(250) }
await press(page, page.locator(`${D} .dbeak`).first(), false); await page.waitForTimeout(900)
rec('P0 Monday published', /Unpublish/.test(await page.locator(`${D} .dbeak`).first().innerText()), 'Publish pressed after four sign-offs')
const flagsOf = () => page.evaluate(() => { const w = window; const arr = (w.WARN || []); return { n: arr.length, sample: arr.slice(0, 3).map(x => JSON.stringify(x).slice(0, 80)) } })
async function snapshot(tag) {
  await go(page, 'viewsched')
  await page.evaluate(() => window.scrollTo(0, 0))
  await pic(page, `p-${T}-viewonly-${tag}`)
  await go(page, 'editsched')
  // CSV
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#exportSched:visible').first().click()])
  const f = path.join(IMG, `p-${T}-${tag}.csv`)
  await dl.saveAs(f)
  const csv = (await import('node:fs')).readFileSync(f, 'utf8')
  // print
  await page.evaluate(() => { window.__printHtml = null })
  await page.locator('#exportPdf:visible').first().click(); await page.waitForTimeout(1500)
  const html = await page.evaluate(() => window.__printHtml)
  writeFileSync(path.join(IMG, `p-${T}-${tag}-print.html`), html || '')
  return { csv, html }
}
const before = await snapshot('before')
const mon = (before.csv.split('\n').filter(l => /Mon|13 Jul|Monday/i.test(l)).length)
say('CSV lines', before.csv.split('\n').length, 'lines mentioning Monday', mon, 'print html length', (before.html || '').length)
say('CSV head', before.csv.split('\n').slice(0, 3).join(' || ').slice(0, 300))
const flagWords = s => (s.match(/rest|conflict|breach|warning|double|LATE/gi) || []).length
say('flag-ish words in csv/print:', flagWords(before.csv), flagWords(before.html || ''))
// render the print html as a printed page
const pp = await ctx.newPage()
await pp.setViewportSize({ width: 1100, height: 900 })
await pp.setContent(before.html || '<p>no print html captured</p>')
await pp.emulateMedia({ media: 'print' })
await pp.screenshot({ path: path.join(IMG, `p-${T}-print-before.png`), fullPage: false })
// change crew rest in Logic
await go(page, 'logic')
await page.locator('button:visible', { hasText: /^\s*\S?\s*Edit\s*$/ }).first().click(); await page.waitForTimeout(500)
await pic(page, `p-${T}-logic-edit`)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const cr = page.locator('input.lgin').first()
const crBefore = await cr.inputValue()
await cr.fill('20h'); await cr.press('Enter'); await page.waitForTimeout(600)
await cr.blur().catch(() => {})
say('crew rest', crBefore, '->', await cr.inputValue())
await pic(page, `p-${T}-logic-crewrest-changed`)
await page.locator('button:visible', { hasText: /^Done$/ }).first().click(); await page.waitForTimeout(500)
const issuesBar = async (pg, sel) => pg.locator(sel).first().innerText().catch(() => 'n/a')
await go(page, 'editsched')
const edAfter = (await page.locator(`${D} .wbar, ${D} [class*="issues"], ${D} [class*="warn"]`).first().innerText().catch(() => 'n/a')).replace(/\s+/g, ' ')
const after = await snapshot('after')
const stripGen = s => (s || '').replace(/Generated [^<]*/g, 'Generated X')
rec('P1 print identical after the Logic change', stripGen(after.html) === stripGen(before.html), `print html before ${(before.html || '').length} chars, after ${(after.html || '').length} chars`)
rec('P2 CSV identical after the Logic change', after.csv === before.csv, `csv before ${before.csv.length} chars, after ${after.csv.length} chars`)
await go(page, 'viewsched'); await page.evaluate(() => window.scrollTo(0, 0))
const vo = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day')].slice(0, 2).map(d => d.innerText.replace(/\s+/g, ' ').match(/\d+ issues?[^A-Z]{0,30}/g)))
say('view-only issue bars after:', JSON.stringify(vo), 'working-copy bar:', edAfter.slice(0, 80))
await pic(page, `p-${T}-viewonly-after-logic`)
await go(page, 'editsched')
const ed2 = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')].slice(0, 2).map(d => (d.innerText.replace(/\s+/g, ' ').match(/\d+ issues?[^A-Z]{0,30}/g) || []).join('')))
say('edit-page issue bars after:', JSON.stringify(ed2))
const pp2 = await ctx.newPage(); await pp2.setViewportSize({ width: 1100, height: 900 }); await pp2.setContent(after.html || ''); await pp2.emulateMedia({ media: 'print' }); await pp2.screenshot({ path: path.join(IMG, `p-${T}-print-after.png`) })
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
