// Walker A: contact sheets for LOOKING (kept in the scratchpad, not the repo): every picture of one step stacked in one image.
// node or-A-sheet.mjs <tag> [<tag> ...]
import { launch, OUT } from './or-A-lib.mjs'
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad/sheets'
mkdirSync(SCR, { recursive: true })
const ORDER = ['week-ground', 'board-ground', 'board-personal', 'board-oil-ground', 'board-oil-personal', 'month', 'card', 'list']
const all = readdirSync(OUT).filter(f => f.endsWith('.png'))
const browser = await launch()
const page = await browser.newPage({ viewport: { width: 1120, height: 600 } })
for (const tag of process.argv.slice(2)) {
  const mine = all.filter(f => f.startsWith(tag + '-') && !all.some(g => g !== f && g.length > 0 && false))
  /* exact tag only: the file is `${tag}-<kind>.png` where kind is in ORDER */
  const pics = ORDER.map(k => `${tag}-${k}.png`).filter(f => all.includes(f))
  const extra = all.filter(f => f.startsWith(tag + '-') && !ORDER.some(k => f === `${tag}-${k}.png`) && /^[^-]+(-[^-]+)?-/.test(f) && f.slice(tag.length + 1).split('-').length <= 2 && !/-(week|board|month|card|list)/.test(f.slice(tag.length)))
  const files = pics
  const html = '<body style="margin:0;background:#222;color:#ddd;font:12px sans-serif;width:1110px">' + files.map(f => `<div style="padding:2px 6px">${f}</div><img src="file:///${join(OUT, f).replace(/\\/g, '/')}" style="display:block;max-width:1100px">`).join('') + '</body>'
  const hp = join(SCR, `${tag}.html`)
  writeFileSync(hp, html)
  await page.goto('file:///' + hp.replace(/\\/g, '/'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(SCR, `${tag}.png`), fullPage: true })
  console.log(tag, files.length, 'pictures')
}
await browser.close()
