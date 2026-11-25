/* Captures Edit Schedule's Thursday 16 Jul (the demo week) from the running app, in three real states, for the end-time
   try-out page (index.html beside this file): the draft day, the same day signed and published, and the published day
   with one change waiting (a pending amendment). It also takes the app's stylesheets whole. Nothing here builds: run it
   from raptor-port/ against a preview of the existing build:
     npx vite preview --port 4795 --strictPort      (any free port; PORT=4795 below)
     node docs/mock/2026-11-25-endtime-tryout/capture.mjs
   Output: capture/*.html and capture/app.css beside this file; build.mjs folds them into index.html. */
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'capture')
mkdirSync(OUT, { recursive: true })
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium } = req('@playwright/test')
const PORT = process.env.PORT || 4795
const DI = 3   // Thursday 16 Jul, the demo week's fourth day

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1536, height: 900 } })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('pageerror', e.message))
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('editsched'))
await page.waitForFunction(() => window.CURPAGE === 'editsched')
await page.waitForTimeout(800)

const sec = () => page.locator(`#eWeek section.day[data-day="${DI}"]`)
const grab = async (name) => {
  const html = await sec().evaluate(s => s.outerHTML)
  writeFileSync(join(OUT, `${name}.html`), html)
  await sec().screenshot({ path: join(OUT, `${name}.png`) })
  console.log(name, html.length)
}

/* the stylesheets, whole, in document order */
const css = await page.evaluate(() => [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n') } catch (e) { return '' } }).join('\n'))
writeFileSync(join(OUT, 'app.css'), css)
const frame = await page.evaluate(() => {
  const p = document.querySelector('#page-editsched'), ib = p.querySelector('.edit-inner'), eb = p.querySelector('.edit-board')
  return { page: p.className, inner: ib.className, board: eb.className, week: document.querySelector('#eWeek').className,
    names: [...document.querySelectorAll(`#eWeek section.day[data-day="3"] select[data-sign]`)].map(s => s.dataset.sign + ':' + [...s.options].slice(1, 6).map(o => o.textContent).join('/')) }
})
writeFileSync(join(OUT, 'frame.json'), JSON.stringify(frame, null, 1))
await grab('1-draft')

/* sign the four boxes, each with the first name it offers, then publish the day */
for (const k of ['cur', 'sked', 'plan', 'appr']) {
  const sel = sec().locator(`select[data-sign="${k}"]`)
  if (!(await sel.count())) { console.log('no select', k); continue }
  const v = await sel.evaluate(s => s.options[1] && s.options[1].value)
  await sel.selectOption(v)
  await page.waitForTimeout(250)
}
await grab('2-signed')
await sec().locator(`[data-beak="${DI}"]`).click()
await page.waitForTimeout(900)
await page.screenshot({ path: join(OUT, 'after-publish-page.png') })
console.log('note after publish:', await page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' }))
await grab('3-published')

/* change one time on the published day: VL's take-off 12:45 → 12:50 */
const to = sec().locator('[data-txt$=".to"]').first()
await to.click()
await page.keyboard.press('Control+A')
await page.keyboard.type('12:50')
await page.keyboard.press('Enter')
await page.waitForTimeout(900)
await grab('4-amend')

/* sign the amendment and publish it as AL1, noting the passing note each publish raises */
const note = () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' })
for (const k of ['cur', 'sked', 'plan', 'appr']) {
  const sel = sec().locator(`select[data-sign="${k}"]`)
  const v = await sel.evaluate(s => s.options[2] ? s.options[2].value : s.options[1].value)
  await sel.selectOption(v)
  await page.waitForTimeout(250)
}
await grab('5-amend-signed')
await sec().locator(`[data-alpub="${DI}"]`).click()
await page.waitForTimeout(900)
console.log('note after AL1:', await note())
await grab('6-al1')
await browser.close()
