// Chat 195, 28 Nov 26 — crops F1's two sketches (desk and phone) from the questions page's working copy, the "Mine"
// place marked, to answer his question "where would u put the mine button in desktop and phone?".
// Run from raptor-port/: node docs/mock/2026-11-26-combined-row/shot-f1-mine.mjs
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const dir = 'docs/mock/2026-11-26-combined-row'
const url = pathToFileURL(path.resolve(dir, 'questions-page.html')).href
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
for (const [w, name, sel] of [[1280, 'f1-mine-desk', '#f1 .sk-desk'], [430, 'f1-mine-phone', '#f1 .sk-phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 2 })
  p.on('pageerror', e => errs.push(String(e)))
  await p.goto(url)
  await p.waitForTimeout(400)
  const el = p.locator(sel).first()
  await el.scrollIntoViewIfNeeded()
  // ring the Mine control: on the desk the tab, on the phone the switch's half
  await el.evaluate(sk => {
    const t = [...sk.querySelectorAll('.s-tabs span, .s-seg span')].find(s => s.textContent.trim() === 'Mine')
    if (t) { t.style.outline = '3px dashed #ffd400'; t.style.outlineOffset = '2px' }
  })
  // the sketch is scaled inside its wrapper, so the wrapper is what is pictured, whole
  await el.locator('xpath=..').screenshot({ path: `${dir}/img/${name}.png` })
  await p.close()
}
await b.close()
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no errors')
