/* [SAVE-NOTE-COVERS] — one contact sheet per size from a folder of sn-cover.mjs pictures, so every picture of a walk
   can be opened and looked at (bug-check-order §10, anti-pattern 21).   node scripts/handpass/sn-sheet.mjs <folder> */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const dir = process.argv[2]
const files = readdirSync(dir).filter(f => /\.png$/.test(f) && !/^sheet-/.test(f) && !/-scrolled\.png$/.test(f) && !/board|calendar|medical|window|menu/.test(f))
const sizes = [...new Set(files.map(f => f.replace(/-(viewsched|editsched|inputs|quals|logic|leavewar|tracker|help|admin)\.png$/, '')))]
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
for (const s of sizes) {
  const mine = files.filter(f => f.startsWith(s + '-'))
  const wide = /^desk|side/.test(s)
  const page = await browser.newPage({ viewport: { width: wide ? 1400 : 1240, height: 800 } })
  await page.setContent(`<body style="margin:0;background:#333;font:13px sans-serif;color:#fff"><div style="display:grid;grid-template-columns:${wide ? '1fr' : '1fr 1fr 1fr'};gap:10px;padding:10px">${mine.map(f =>
    `<figure style="margin:0"><figcaption>${f.replace('.png', '')}</figcaption><img style="width:100%;display:block" src="data:image/png;base64,${readFileSync(dir + '/' + f).toString('base64')}"></figure>`).join('')}</div></body>`)
  await page.screenshot({ path: `${dir}/sheet-${s}.png`, fullPage: true })
  await page.close()
  console.log(`sheet-${s}.png — ${mine.length} pictures`)
}
await browser.close()
