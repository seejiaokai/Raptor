// The OIL award editor's click outside (D2176) from the tracker's other doors — over Approvals and over Balances — on a
// PC and a phone: a press on the tracker's title closes the editor; a change then a press outside drops the change; the
// tracker closed returns to the page it was opened over. node lw-clickaway-doors.mjs [port] [outdir]
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium, devices } = require('@playwright/test')
const PORT = process.argv[2] || '4197'
const OUT = path.resolve(here, process.argv[3] || '../../docs/img/handpass/2026-11-17-lw-four-items/clickaway-doors')
fs.rmSync(OUT, { recursive: true, force: true })
const results = []
const EDIT = '[data-testid="oil-entry-l4"]', TITLE = '[data-testid="oil-sheet"] .bidsheet-hd .who'

async function run(kind) {
  const dir = path.join(OUT, kind); fs.mkdirSync(dir, { recursive: true })
  const browser = await chromium.launch()
  const ctx = kind === 'phone'
    ? await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 })
    : await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  let n = 0
  const pic = async name => { n++; await page.screenshot({ path: path.join(dir, `${String(n).padStart(2, '0')}-${name}.png`) }) }
  const ok = (id, pass, note) => { results.push({ kind, id, pass, note }); console.log(`${pass ? 'PASS' : 'FAIL'} ${kind} ${id} — ${note}`) }
  const press = async (sel) => {
    const loc = page.locator(sel).first()
    await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
    await page.waitForTimeout(150)
    const b = await loc.boundingBox()
    if (kind === 'phone') await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    await page.waitForTimeout(350)
  }
  const editorOn = () => page.evaluate(() => document.querySelector('[data-testid="oil-edit-award"]')?.closest('.oil-e')?.getAttribute('data-testid') ?? null)
  const openTracker = async () => {
    await page.locator('[data-testid="oil-tracker"]').click()
    await page.waitForSelector('[data-testid="oil-sheet"]')
    const first = page.locator('[data-testid="oil-range-first"]')
    if (await first.count()) await first.click()
    await page.waitForTimeout(400)
  }

  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')

  for (const door of ['approvals', 'balances']) {
    await page.click(`[data-testid="lw-tab-${door}"]`)
    await page.waitForTimeout(800)
    await openTracker()
    await press(EDIT)
    const a = await editorOn()
    await press(TITLE)
    const b = await editorOn()
    ok(`${door}-1`, a === 'oil-entry-l4' && b === null, `over ${door}: the editor opened on ${a}; after a press on the title: ${b ?? 'closed'}`)
    await pic(`${door}-1-closed`)
    await press(EDIT)
    await page.locator('[data-testid="oil-edit-reason"]').fill('CNY workplan — moved')
    await press(TITLE)
    const r = await page.locator(`${EDIT} .l2`).innerText()
    ok(`${door}-2`, (await editorOn()) === null && !r.includes('moved'), `over ${door}: a change, then a press outside: editor ${await editorOn() ?? 'closed'}, the reason "${r.trim()}"`)
    await pic(`${door}-2-dropped`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    const sheet = await page.locator('[data-testid="oil-sheet"]').count()
    const under = await page.locator(`[data-testid="${door}-page"]:not([hidden])`).count()
    ok(`${door}-3`, sheet === 0 && under === 1, `Escape: tracker ${sheet ? 'still open' : 'closed'}, ${door} page ${under ? 'in sight' : 'NOT in sight'}`)
    await pic(`${door}-3-back`)
  }
  ok('ERR', errors.length === 0, `page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  await browser.close()
}

await run('desktop')
await run('phone')
const fails = results.filter(r => !r.pass)
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\n${results.length - fails.length} PASS / ${fails.length} FAIL`)
