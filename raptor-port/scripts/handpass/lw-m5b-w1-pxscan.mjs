// helper: crop + enlarge a region of a picture so two columns of buttons can be compared by eye
import { chromium } from '../drawcheck/lib.mjs'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const [file, x, y, w, h, out] = process.argv.slice(2)
const page = await (await browser.newContext({ viewport: { width: +w * 3, height: +h * 3 } })).newPage()
const url = 'data:image/png;base64,' + readFileSync(resolve(HERE, '../..', file)).toString('base64')
await page.setContent(`<body style="margin:0;background:#000"><div style="width:${w * 3}px;height:${h * 3}px;background:url(${url}) -${x * 3}px -${y * 3}px / ${1920 * 3}px auto no-repeat;image-rendering:pixelated"></div>`)
await page.waitForTimeout(300)
await page.screenshot({ path: resolve(HERE, '../..', out) })
await browser.close()
