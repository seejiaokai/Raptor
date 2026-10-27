// His D1444 and D1445 (28 Oct 26, "all as recommended"), BUILT — measured and pictured as the drawing was
// (scripts/handpass/lw-m4-d1439-mock.mjs, docs/img/handpass/2026-10-27-lw-m4/d1439/): in WebKit (an iPhone's engine) at 402,
// 390 and 360, the demo (two months holding requests) and a busy world (seven months), the card's top to the column
// headings measured the same way and the same pictures taken, so each pairs with its drawing (lw-m4-d1444-pairs.py).
// And the slim Approvals bar's fill (D1445) on a phone at 402 x 874 x 3 (as r22-6-phone) and a desktop at 1536 x 860 x 1.25
// (as r22-4-desk). Run from raptor-port/ against the build served on PORT (default 4173):
//   node scripts/handpass/lw-m4-d1444-after.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/d1444')
mkdirSync(OUT, { recursive: true })
const b = await webkit.launch()
let problems = 0
const table = []
async function signIn(ctx) {
  const P = await ctx.newPage()
  P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  return P
}
async function approvals(P) {
  await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
  await P.waitForTimeout(600)
}
/* the drawing's own measure and clip (lw-m4-d1439-mock.mjs), unchanged */
const measure = P => P.evaluate(() => {
  const card = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect()
  const cols = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect()
  const title = document.querySelector('.appr-title').getBoundingClientRect()
  const link = document.querySelector('[data-testid="appr-elsewhere"]')
  const lr = link && link.getBoundingClientRect()
  const chips = [...document.querySelectorAll('.appr-filters .appr-f')].filter(c => c.getBoundingClientRect().width > 0)
  const rows = new Set(chips.concat([document.querySelector('[data-testid="appr-approve-all"]')]).map(c => Math.round(c.getBoundingClientRect().top))).size
  const broken = chips.filter(c => c.getBoundingClientRect().height > 40).map(c => c.textContent)
  return { top: Math.round(cols.top - card.top), linkOnTitle: lr ? Math.abs(lr.bottom - title.bottom) < 6 : null, words: link ? link.textContent : null,
    linkRight: lr ? Math.round(lr.right) : null, cardRight: Math.round(card.right), rows,
    months: chips.filter(c => /appr-m-/.test(c.dataset.testid || '')).map(c => c.textContent), broken }
})
const clip = P => P.evaluate(() => {
  const card = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect()
  const line = document.querySelectorAll('[data-testid^="appr-line-"]')[1]?.getBoundingClientRect()
  return { x: Math.max(0, card.left - 6), y: Math.max(0, card.top - 6), width: card.width + 12, height: (line ? line.top : card.top + 420) - card.top + 12 }
})
for (const busy of [false, true]) {
  for (const width of [402, 390, 360]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width, height: 874 } })
    const P = await signIn(ctx)
    if (busy) {
      const placed = await P.evaluate(() => [['bane', '2026-03-16'], ['bane', '2026-04-14'], ['bane', '2026-06-10'], ['bane', '2026-08-12'], ['bane', '2026-10-14']]
        .map(([p, d]) => window.lwSetCell(p, d, 'LL')))
      if (placed.some(x => !x)) { console.log(`busy: a request was refused (${placed})`); problems++ }
    }
    await approvals(P)
    const m = await measure(P)
    const tag = `${busy ? 'busy' : 'demo'}-${width}`
    await P.screenshot({ path: path.join(OUT, `${tag}-built.png`), clip: await clip(P) })
    if (m.broken.length) { console.log(`${tag}: a chip broke onto two lines: ${m.broken}`); problems++ }
    if (m.linkRight != null && m.linkRight > m.cardRight) { console.log(`${tag}: the link runs past the card`); problems++ }
    table.push({ state: busy ? 'busy (7 months)' : 'demo (2 months)', width, words: m.words, top: m.top, chipRows: m.rows, months: m.months.join(' '), linkOnTitle: m.linkOnTitle })
    await ctx.close()
  }
}
/* the slim bar (D1445): a request's dates tapped, the grid with the bar — on a phone as r22-6-phone, on a desktop as r22-4-desk */
const bars = []
for (const [kind, opts] of [['phone', { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 }], ['desk', { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 }]]) {
  const ctx = await b.newContext(opts)
  const P = await signIn(ctx)
  await approvals(P)
  await P.locator('[data-testid="approvals-page"] [data-testid="appr-dates"]').first().click()
  await P.waitForSelector('[data-testid="appr-slim"]'); await P.waitForTimeout(800)
  const s = await P.evaluate(() => { const e = document.querySelector('[data-testid="appr-slim"]'); const c = getComputedStyle(e); const r = e.getBoundingClientRect()
    return { fill: c.backgroundColor, edge: c.borderTopColor, left: Math.round(r.left), right: Math.round(innerWidth - r.right), tall: Math.round(r.height), foot: Math.round(innerHeight - r.bottom), words: e.innerText.replace(/\s+/g, ' ').trim() } })
  if (s.fill !== 'rgb(22, 27, 34)') { console.log(`${kind}: the bar's fill is ${s.fill}`); problems++ }
  bars.push({ kind, ...s })
  await P.screenshot({ path: path.join(OUT, `slim-${kind}.png`) })
  await ctx.close()
}
await b.close()
for (const r of table) console.log(JSON.stringify(r))
for (const r of bars) console.log(JSON.stringify(r))
writeFileSync(path.join(OUT, 'measures.json'), JSON.stringify({ top: table, slim: bars }, null, 2))
console.log(problems ? `PROBLEMS: ${problems}` : 'measured and pictured, no problems')
process.exit(problems ? 1 : 0)
