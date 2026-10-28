// His question (27 Oct 26): "what if the lowest avail like OPS P is created as a name in manning and this leave caused it
// to decrease. how would it show" — on a PHONE. Through the app's own windows: a Manning row renamed "OPS P" with an amber
// and a red point (its info → edit form), pending LL placed by the admin for several men on one day until the row turns,
// then Approvals at his iPhone's width (402). Run from raptor-port/ against the build served on PORT.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/sbs-after/opsp'
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'
const L = await import('./lw-m4-lib.mjs')
const { T, vis, txt, press } = L
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 1536, height: 860 }, deviceScaleFactor: 3 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const w = { ctx, page, cdp: null, errs, phone: false, size: 'desk' }
const P = page
await L.signIn(w, 'admin')
/* the IP row becomes "OPS P", amber at 14, red at 10 — through its own window and its edit form */
await P.locator('[data-testid="manning-info-ip"]').first().click(); await P.waitForTimeout(600)
await press(w, T('counter-edit-open')); await P.waitForTimeout(600)
await P.fill(T('cform-name'), 'OPS P')
await P.fill(T('cform-amber'), '14'); await P.fill(T('cform-red'), '10'); await P.waitForTimeout(200)
await press(w, T('cform-save')); await P.waitForTimeout(800)
for (let i = 0; i < 2 && (await vis(P, T('manning-sheet'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
console.log('the row now reads:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="counter-name"], [data-testid^="manning-info"]')].map(e => e.closest('tr,div')?.innerText?.replace(/\s+/g, ' ').slice(0, 40)).filter(t => /OPS P/.test(t || '')).slice(0, 2)))
/* pending LL on one day for several pilots, "Approve what I enter" off, until the day line names a turned row */
const day = '2026-02-10'
const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 12).map(r => r.dataset.testid.slice(4)))
let n = 0
for (const who of rows) {
  await L.openCell(w, who, day)
  if (!(await vis(P, T('bid-picker')))) continue
  if (n === 0) await L.approveWhatIEnter(w, false)
  const dl = await txt(P, T('bid-dayline'))
  if (!(await L.placeLeave(w, 'LL'))) await L.closeWin(w)
  n++
  console.log(`#${n} ${who}: ${dl}`)
  if (n >= 8) break
}
/* his iPhone's width: Approvals, the 10 Feb lines */
await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(800)
await P.evaluate(() => window.scrollTo(0, 0))
await L.openApprovals(w)
const line = P.locator('[data-testid^="appr-line-"]', { hasText: '10 Feb' }).filter({ hasText: 'OPS P' }).first()
if (await line.count()) {
  await line.scrollIntoViewIfNeeded(); await P.waitForTimeout(300)
  const box = await line.boundingBox()
  const cols = await P.locator('.appr-cols.ph').first().boundingBox()
  await P.screenshot({ path: path.join(L.OUT, 'phone-opsp-line.png'), clip: { x: 0, y: Math.max(0, box.y - 70), width: 402, height: box.height + 150 } })
  console.log('line:', (await line.innerText()).replace(/\s+/g, ' '), '| columns heading at', Math.round(cols?.y ?? -1))
} else console.log('no 10 Feb line with OPS P — lines:', (await L.apprLines(P)).filter(l => /10 Feb/.test(l.text)).map(l => l.text).join(' / '))
await P.screenshot({ path: path.join(L.OUT, 'phone-opsp-screen.png') })
console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors')
await b.close()
process.exit(0)
