/* [PUCK-DOT-ZOOM] — one before/after sheet from zoom-dot.mjs's raw pictures: each scaling's puck as the screen draws
   it, enlarged about 4x with the pixels kept square.  Run: node scripts/handpass/zoom-dot-sheet.mjs <folder with before/ and after/> */
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const DIR = process.argv[2] || 'docs/img/handpass/2026-10-06-puck-dot'
const ROWS = [['z1_25', 'Your screen (125%)'], ['z0_8', 'Zoomed out to 80%'], ['z1', 'An unscaled screen (100%) — unchanged'], ['z2', 'A phone-type screen (2x) — unchanged']]
const img = (side, z) => `<img src="data:image/png;base64,${readFileSync(`${DIR}/${side}/${z}-raw.png`).toString('base64')}" style="image-rendering:pixelated;height:112px">`
const html = `<body style="margin:0;padding:22px;background:#14161b;color:#e8eaee;font:600 17px system-ui;width:1180px">
<div style="display:grid;grid-template-columns:300px 400px 400px;gap:16px 22px;align-items:center">
<div></div><div style="color:#9aa3ae">BEFORE</div><div style="color:#9aa3ae">AFTER</div>
${ROWS.map(([z, label]) => `<div>${label}</div><div>${img('before', z)}</div><div>${img('after', z)}</div>`).join('')}
</div></body>`
const browser = await chromium.launch({ headless: true, ...launchOptions })
const page = await browser.newPage({ viewport: { width: 1224, height: 800 }, deviceScaleFactor: 2 })
await page.setContent(html)
await page.locator('body').screenshot({ path: `${DIR}/before-after.png` })
await browser.close()
console.log(`${DIR}/before-after.png`)
