/* One look at the page before it is published: the mock-up page opened from its file, pictured whole at a desktop
   width and at a phone's. Run: node docs/mock/2026-11-22-sched-right-edge/page-look.mjs <out folder> */
import { chromium } from '@playwright/test'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const out = process.argv[2] || HERE
const browser = await chromium.launch({ headless: true })
for (const [name, width] of [['desk', 1200], ['phone', 402]]) {
  const page = await (await browser.newContext({ viewport: { width, height: 900 }, colorScheme: 'dark' })).newPage()
  await page.goto(pathToFileURL(join(HERE, 'index.html')).href)
  await page.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; if (!i.complete) await new Promise(r => { i.onload = i.onerror = r }) } })
  console.log(name, await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth, broken: [...document.images].filter(i => !i.naturalWidth).length })))
  await page.screenshot({ path: join(out, `page-${name}.png`), fullPage: true })
  await page.close()
}
await browser.close()
