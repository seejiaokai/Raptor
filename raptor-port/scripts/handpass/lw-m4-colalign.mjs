// His D1437 (27 Oct 26 — "the alignment of the title and the text is off … Check the desktop too"): every Approvals heading
// measured against the figures under it on every line — a heading set to the left against the left edge of its figures,
// one set to the right (DAYS, LVE BAL on a desktop; PLACED on a phone) against their right edge. Phones in WebKit (an
// iPhone's letters) at 402, 390 and 360; the desktop at his PC's 1536. PASS when every gap is within 1px.
// Also FAILS where two headings' words touch (28 Oct 26).
// Run from raptor-port/ against the build served on PORT: PORT=4174 node scripts/handpass/lw-m4-colalign.mjs
import { webkit, chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/sbs-after/colalign')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const runs = [
  ['phone-402', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 } }],
  ['phone-390', webkit, { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }],
  ['phone-360', webkit, { ...devices['iPhone 13'], viewport: { width: 360, height: 780 } }],
  ['desk-1536', chromium, { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 }],
]
let worst = 0
for (const [name, engine, opts] of runs) {
  const b = await engine.launch(engine === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await b.newContext(opts)
  const P = await ctx.newPage()
  await P.goto(`http://localhost:${PORT}/`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForTimeout(700)
  const r = await P.evaluate(() => {
    /* the box of an element's own words (not its cell's): a Range over its text */
    const words = (el) => { if (!el) return null; const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(); return b.width ? b : null }
    const phone = !!document.querySelector('.appr-cols.ph')
    const head = document.querySelector(phone ? '.appr-cols.ph' : '.appr-cols:not(.ph)')
    const hs = [...head.children]
    /* each heading's figures, by line */
    const cellsOf = phone
      ? (l) => [...l.querySelector('.appr-l2').children]
      : (l) => { const c = [...l.children]; return [c[0].querySelector('.appr-puck'), c[1], c[2].querySelector('.appr-dlink'), c[3], c[4], c[5], c[6]] }
    const out = []
    for (const [i, h] of hs.entries()) {
      const hb = words(h); if (!hb) continue
      const right = getComputedStyle(h).textAlign === 'right' || h.classList.contains('r')
      let worst = 0, sample = ''
      for (const l of document.querySelectorAll('[data-testid^="appr-line-"]')) {
        const c = cellsOf(l)[i]
        const t = c && (c.classList?.contains('appr-avail') ? (c.querySelector('.appr-av .appr-n') ?? c.querySelector('.appr-av')) : c)
        const cb = t && (t.classList?.contains('appr-puck') || t.classList?.contains('appr-box') ? t.getBoundingClientRect() : words(t))
        if (!cb || !cb.width) continue
        const gap = right ? cb.right - hb.right : cb.left - hb.left
        if (Math.abs(gap) > Math.abs(worst)) { worst = gap; sample = (t.innerText || '').replace(/\s+/g, ' ').slice(0, 18) }
      }
      out.push({ heading: h.innerText.trim(), side: right ? 'right' : 'left', worst: Math.round(worst * 10) / 10, sample })
    }
    /* and no two headings' words touching (28 Oct 26: at 360 "LOWEST AVAIL" ran into "PLACED" in WebKit's letters) */
    const rs = hs.map(h => { const rg = document.createRange(); rg.selectNodeContents(h); return { t: h.innerText.trim(), rs: [...rg.getClientRects()] } })
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) for (const a of rs[i].rs) for (const b of rs[j].rs)
      if (a.top < b.bottom && b.top < a.bottom && a.left < b.right + 4 && b.left < a.right + 4) out.push({ heading: rs[i].t + ' / ' + rs[j].t, side: 'TOUCHING', worst: 99, sample: '' })
    return out
  })
  await P.locator('.appr-cols').first().scrollIntoViewIfNeeded()
  await P.screenshot({ path: path.join(OUT, `${name}.png`) })
  for (const x of r) worst = Math.max(worst, Math.abs(x.worst))
  console.log(`${name}: ` + r.map(x => `${x.heading} ${x.side} ${x.worst > 0 ? '+' : ''}${x.worst}px${x.sample ? ` ("${x.sample}")` : ''}`).join(' · '))
  await b.close()
}
console.log(worst <= 1 ? 'PASS — every heading within 1px of its figures' : `FAIL — the worst gap is ${worst}px`)
process.exit(worst <= 1 ? 0 : 1)
