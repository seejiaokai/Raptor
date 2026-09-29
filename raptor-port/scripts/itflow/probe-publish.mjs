import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto('http://localhost:4185/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
const sels = await page.$$eval('select[data-signday="1"]', a => a.map(s => ({ k: s.dataset.sign, opts: [...s.options].slice(0, 4).map(o => o.value + '=' + o.text) })))
console.log(JSON.stringify(sels))
for (const s of sels) {
  const v = await page.$eval(`select[data-sign="${s.k}"][data-signday="1"]`, el => [...el.options].find(o => o.value)?.value)
  await page.selectOption(`select[data-sign="${s.k}"][data-signday="1"]`, v); await page.waitForTimeout(300)
}
await page.screenshot({ path: `${OUT}/a-signed.png` })
await page.click('button[data-beak="1"]'); await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/b-after-publish-click.png` })
const dlg = await page.$$eval('[role=dialog], .modal, .sheet', a => a.map(e => e.className + ': ' + e.innerText.slice(0, 300)))
console.log(JSON.stringify(dlg, null, 1))
console.log('errors', errs)
await browser.close()
