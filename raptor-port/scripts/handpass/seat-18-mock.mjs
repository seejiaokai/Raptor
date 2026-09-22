/* Photograph the APPROVED mock-up so the owner can see it is intact.
   docs/mock/allavail-window.html — D41, "the design of record". */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const SHOTS = process.env.HP_SHOTS
for (const [tag, w, h] of [['desktop', 1440, 900], ['phone', 375, 812]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage()
  await p.goto('file:///C:/Users/User/projects/Raptor/raptor-port/docs/mock/allavail-window.html')
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${SHOTS}/MOCK-allavail-window-${tag}.png`, fullPage: false })
  console.log(tag, 'title:', await p.title())
}
await b.close()
