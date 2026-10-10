// ONE LOOK at the mock-up page docs/mock/input-card-ideas.html ([INPUT-LIST-AS-DAY-CARD], D718, D719) before it is
// handed over: opened as a file at a phone's width, pictured, and each idea's measured line read back. No server.
//   node scripts/handpass/mk-card-ideas-look.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const OUT = process.argv[2] || 'docs/mock/img/input-card-ideas'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
/* not `isMobile`: the file has no viewport tag of its own (the published page is given one), and a mobile browser would
   lay a tag-less page out 980 wide — the look would not be a phone's */
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(pathToFileURL(resolve('docs/mock/input-card-ideas.html')).href)
await page.waitForTimeout(700)
const read = () => page.evaluate(() => Object.fromEntries(['now', 'a', 'b', 'c'].map(k => [k, document.getElementById('m-' + k).textContent.replace(/\s+/g, ' ')])))
for (const [kind, view] of [['grey', 'day'], ['pill', 'day'], ['pill', 'list'], ['grey', 'list']]) {
  await page.locator(`#segKind [data-v="${kind}"]`).tap(); await page.locator(`#segView [data-v="${view}"]`).tap(); await page.waitForTimeout(150)
  console.log(kind, view, JSON.stringify(await read()))
  for (const k of ['now', 'a', 'b', 'c']) await page.locator('#f-' + k).screenshot({ path: join(OUT, `${k}-${kind}-${view}.png`) })
  console.log('  sideways scroll:', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
}
console.log('errors', JSON.stringify(errs))
await browser.close()
