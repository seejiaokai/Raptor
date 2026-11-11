/* Q9 of the rules check (11 Nov 26): cuts the marked desktop picture of the published day down to the part the
 * question is about — the day's status block and its warnings list — so it reads on a phone (D1222). It draws the
 * saved picture in a blank page and takes a clipped screenshot; nothing of the app is touched. */
import { chromium } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIR = join(HERE, '..', '..', 'docs', 'img', 'handpass', '2026-11-11-rules-check-q9')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage({ viewport: { width: 2880, height: 2316 }, deviceScaleFactor: 1 })
const cut = async (src, out, clip) => {
  const b64 = readFileSync(join(DIR, src)).toString('base64')
  await page.setContent(`<body style="margin:0;background:#0b0d12"><img src="data:image/png;base64,${b64}" style="display:block"></body>`)
  await page.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0)
  await page.screenshot({ path: join(DIR, out), clip })
  console.log('wrote', out)
}
// the status block (left) and the warnings list (right), in the saved picture's own pixels
await cut('b-after-marked-desk.png', 'b-after-marked-desk-status.png', { x: 20, y: 30, width: 2210, height: 330 })
await cut('b-after-marked-desk.png', 'b-after-marked-desk-warnings.png', { x: 2250, y: 30, width: 620, height: 700 })
await browser.close()
