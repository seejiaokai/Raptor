// His D1435 (27 Oct 26): on a phone Approve and Refuse are a little narrower, so a line's date stays on one line and a lit
// "Approved" does not move its edge under the finger. Measured in WebKit (an iPhone's wider letters) at 402, 390 and 360.
// Run from raptor-port/ against the build already served on PORT (default 4173): node scripts/handpass/lw-m4-btnwidth.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/sbs-after/btnwidth')
mkdirSync(OUT, { recursive: true })
const b = await webkit.launch()
let fails = 0
for (const width of [402, 390, 360]) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width, height: 844 } })
  const P = await ctx.newPage()
  const errs = []
  P.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await P.goto(`http://localhost:${PORT}/`)
  await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a')
  await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.click('[data-testid="lw-tab-approvals"]')
  await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
  await P.waitForTimeout(500)
  const lines = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].map(l => {
    const d = l.querySelector('[data-testid="appr-dates"]')
    const lh = parseFloat(getComputedStyle(d).lineHeight) || parseFloat(getComputedStyle(d).fontSize) * 1.25
    const ok = l.querySelector('[data-testid="appr-approve"]').getBoundingClientRect()
    const no = l.querySelector('[data-testid="appr-refuse"]').getBoundingClientRect()
    return { who: l.getAttribute('data-testid').slice(10), dates: d.textContent, wraps: d.getBoundingClientRect().height > lh * 1.5, okL: Math.round(ok.left), okW: Math.round(ok.width), noW: Math.round(no.width), right: Math.round(no.right) }
  }))
  await P.screenshot({ path: path.join(OUT, `w${width}-rest.png`) })
  /* light the first line's Approve, then its Refuse: does either button's edge move? */
  const first = lines[0]
  const sel = `[data-testid="appr-line-${first.who}"]`
  await P.click(`${sel} [data-testid="appr-approve"]`); await P.waitForTimeout(300)
  const lit = await P.evaluate(s => { const l = document.querySelector(s); const ok = l.querySelector('[data-testid="appr-approve"]').getBoundingClientRect(); return { okL: Math.round(ok.left), okW: Math.round(ok.width), text: l.querySelector('[data-testid="appr-approve"]').textContent } }, sel)
  await P.screenshot({ path: path.join(OUT, `w${width}-approved.png`) })
  await P.click(`${sel} [data-testid="appr-refuse"]`); await P.waitForTimeout(300)
  const ref = await P.evaluate(s => { const l = document.querySelector(s); const no = l.querySelector('[data-testid="appr-refuse"]').getBoundingClientRect(); return { noW: Math.round(no.width), text: l.querySelector('[data-testid="appr-refuse"]').textContent } }, sel)
  const wrapped = lines.filter(l => l.wraps)
  const moved = lit.okL !== first.okL || lit.okW !== first.okW || ref.noW !== first.noW
  const over = lines.filter(l => l.right > width)
  if (wrapped.length || moved || over.length || errs.length) fails++
  console.log(`${width}: ${lines.length} lines; dates on two lines: ${wrapped.map(l => l.dates).join(', ') || 'none'}; ` +
    `Approve ${first.okW} → "${lit.text}" ${lit.okW} (left ${first.okL} → ${lit.okL}); Refuse ${first.noW} → "${ref.text}" ${ref.noW}; ` +
    `past the screen's edge: ${over.length}; page errors: ${errs.length}`)
  await ctx.close()
}
await b.close()
console.log(fails ? `FAIL at ${fails} width(s)` : 'PASS at every width')
process.exit(fails ? 1 : 0)
