/* walker C — contact sheets of the PHONE pictures, four across at full size (390 px each), so every one can be opened
   and looked at. Output goes to a scratch folder (WHC_SHEETS), not the repo. Reads the pictures only. */
import { readdirSync, mkdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const DIR = process.env.HP_SHOTS, OUT = process.env.WHC_SHEETS
mkdirSync(OUT, { recursive: true })
const re = new RegExp(process.env.WHC_MATCH || '^ph-')
const files = readdirSync(DIR).filter(f => re.test(f) && f.endsWith('.png') && !/probe|X-error/.test(f)).sort((a, b) => a.replace(/^..-\d+-/, '').localeCompare(b.replace(/^..-\d+-/, ''), 'en', { numeric: true }) || a.localeCompare(b))
const N = +(process.env.WHC_N || 4), W = +(process.env.WHC_W || 390)
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: N * (W + 8) + 8, height: 900 } })
let n = 0
for (let i = 0; i < files.length; i += N) {
  const set = files.slice(i, i + N)
  const html = `<body style="margin:0;background:#222;font:12px monospace;color:#fff"><div style="display:flex;gap:8px;padding:8px;align-items:flex-start">${set.map(f => `<div><div style="padding:2px 0">${f}</div><img src="data:image/png;base64,${readFileSync(DIR + '/' + f).toString('base64')}" style="width:${W}px;display:block"></div>`).join('')}</div></body>`
  await page.setContent(html); await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)); await page.waitForTimeout(150)
  const name = `sheet-${String(++n).padStart(2, '0')}.png`
  await page.screenshot({ path: `${OUT}/${name}`, fullPage: true })
  console.log(name, set.join(' | '))
}
await browser.close()
