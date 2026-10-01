/* contact sheets of walker B's pictures, so every one is looked at (scratch — not part of the walk's evidence) */
import { readdirSync, mkdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const DIR = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-01-warn-hide/b'
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/12e631ac-5278-4007-be37-7ec9956a5176/scratchpad/sheets'
mkdirSync(OUT, { recursive: true })
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null
const all = readdirSync(DIR).filter(f => f.endsWith('.png') && (!only || only.test(f)))
/* grouped by scenario, in the order taken */
const key = f => { const m = /^(dk|ph)-(\d+)-s([0-9a-z]+?)-/.exec(f); return m ? `${m[1]}-${m[3]}` : 'zz' }
const groups = {}
for (const f of all) (groups[key(f)] ||= []).push(f)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })
let n = 0
for (const [g, files] of Object.entries(groups)) {
  const phone = g.startsWith('ph')
  const per = phone ? 10 : 4, cols = phone ? 5 : 2, w = phone ? 290 : 740
  for (let i = 0; i < files.length; i += per) {
    const part = files.slice(i, i + per)
    const html = `<body style="margin:0;background:#222;color:#fff;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:4px">` +
      part.map(f => `<div><div style="padding:2px 0;color:#ff0">${f}</div><img src="data:image/png;base64,${readFileSync(DIR + '/' + f).toString('base64')}" style="width:${w}px;display:block"></div>`).join('') + '</div></body>'
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    const name = `${g}-${String(i / per + 1).padStart(2, '0')}.png`
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true })
    n++
  }
}
console.log(n, 'sheets →', OUT)
await browser.close()
