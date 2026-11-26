// draw-s4-sheet - a contact sheet of section 4's crops, for the drawer's own check (not for the page):
//   node raptor-port/scripts/handpass/n191/draw-s4-sheet.mjs <out.png> <name> <name> …   (names without -crop.png)
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const DRAWN = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q3/drawn')
const [out, ...names] = process.argv.slice(2)
const html = `<body style="margin:0;background:#333;font:14px sans-serif;color:#fff;display:flex;flex-wrap:wrap;gap:10px;padding:10px;align-items:flex-start">` +
  names.map(n => `<div><div>${n}</div><img src="${pathToFileURL(resolve(DRAWN, n + '-crop.png'))}" style="width:${/-p-/.test(n) ? 402 : 596}px;display:block"></div>`).join('') + `</body>`
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1260, height: 800 } })
const { writeFileSync } = await import('node:fs'); const f = out.replace(/\.png$/, '.html'); writeFileSync(f, html)
await p.goto(pathToFileURL(resolve(f)).href); await p.waitForLoadState('networkidle'); await p.screenshot({ path: out, fullPage: true }); await b.close()
