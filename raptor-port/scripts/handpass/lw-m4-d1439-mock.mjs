// His D1439 ("Both", 27 Oct 26): on a phone the top of Approvals takes less room — the "+N pending in <period> ›" link on the
// title's line, shortened, and only the months holding requests on the row of New and All. This DRAWS it on the real app
// (the mockups-on-the-real-app method) for his look before it is built (D853): today beside proposed, at 402 / 390 / 360 in
// WebKit (an iPhone's engine), in two states — the demo as it is (two months hold requests) and a busy one (seven months).
// Every height is measured in the same run: the card's top to the column headings, today and proposed.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-m4-d1439-mock.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/d1439')
mkdirSync(OUT, { recursive: true })

/* THE TRANSFORM — one stylesheet and one text change, nothing restyled: the dimmed month chips (a month with nothing pending,
   the app's own `dim`) are taken out, so the remaining chips flow onto New and All's row in the grid's own columns; the head
   keeps its own wrapping, so the link stands on the title's line when it fits and on a line of its own when it does not
   (D1439's reading). The link's words lose "pending" — the period's name stays as the admin named it. */
const PROPOSED_CSS = `#page-leavewar .appr-page.ph .appr-f.dim { display: none !important; }
#page-leavewar .appr-page.ph .appr-head { row-gap: 2px; }`
const MARK_CSS = `#page-leavewar .appr-page.ph [data-mock-mark] { outline: 2px solid #ff3d8b; outline-offset: 3px; border-radius: 6px; position: relative; }
#page-leavewar .appr-page.ph [data-mock-mark]::before { content: attr(data-mock-mark); position: absolute; right: -2px; top: -15px; font: 800 11px/1 system-ui; color: #ff3d8b; }`
/* letters about a seventh wider than the test browser's (the guide's trap: a fit in WebKit's letters is not a fit on his iPhone) */
const WIDE_CSS = `#page-leavewar .appr-page.ph .appr-head, #page-leavewar .appr-page.ph .appr-head * { letter-spacing: .07em; }`

const b = await webkit.launch()
const table = []
let problems = 0
for (const busy of [false, true]) {
  for (const width of [402, 390, 360]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width, height: 874 } })
    const P = await ctx.newPage()
    const errs = []
    P.on('pageerror', e => errs.push(String(e).slice(0, 160)))
    await P.goto(`http://localhost:${PORT}/?fresh=1`)
    await P.waitForSelector('#luser')
    await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a')
    await P.click('#loginForm button[type=submit]')
    await P.waitForSelector('#vWeek .day', { state: 'attached' })
    await P.evaluate(() => window.go('leavewar'))
    await P.waitForSelector('[data-testid="lw-tab-approvals"]')
    if (busy) {
      /* five more months each get one pending request, placed through the war's own cell writer (an admin's bid): with the
         demo's Jan and Feb that is seven months holding requests — more than one row of chips */
      const placed = await P.evaluate(() => {
        const ok = []
        for (const [p, d] of [['bane', '2026-03-16'], ['bane', '2026-04-14'], ['bane', '2026-06-10'], ['bane', '2026-08-12'], ['bane', '2026-10-14']])
          ok.push(window.lwSetCell(p, d, 'LL'))
        return ok
      })
      if (placed.some(x => !x)) { console.log(`busy: a request was refused (${placed})`); problems++ }
    }
    await P.click('[data-testid="lw-tab-approvals"]')
    await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
    await P.waitForTimeout(600)
    /* the card's top to the column headings' top: what the ruling saves */
    const measure = () => P.evaluate(() => {
      const card = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect()
      const cols = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect()
      const title = document.querySelector('.appr-title').getBoundingClientRect()
      const link = document.querySelector('[data-testid="appr-elsewhere"]')
      const lr = link && link.getBoundingClientRect()
      const chips = [...document.querySelectorAll('.appr-filters .appr-f')].filter(c => c.getBoundingClientRect().width > 0)
      const rows = new Set(chips.concat([document.querySelector('[data-testid="appr-approve-all"]')]).map(c => Math.round(c.getBoundingClientRect().top))).size
      const broken = chips.filter(c => c.getBoundingClientRect().height > 40).map(c => c.textContent)
      return { top: Math.round(cols.top - card.top), linkOnTitle: lr ? Math.abs(lr.bottom - title.bottom) < 6 : null,
        linkRight: lr ? Math.round(lr.right) : null, cardRight: Math.round(card.right), rows, months: chips.filter(c => /appr-m-/.test(c.dataset.testid || '')).length, broken }
    })
    const clip = () => P.evaluate(() => {
      const card = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect()
      const line = document.querySelectorAll('[data-testid^="appr-line-"]')[1]?.getBoundingClientRect()
      return { x: Math.max(0, card.left - 6), y: Math.max(0, card.top - 6), /* the clip is in the viewport's own frame: nothing is scrolled first */ width: card.width + 12, height: (line ? line.top : card.top + 420) - card.top + 12 }
    })
    const before = await measure()
    const tag = `${busy ? 'busy' : 'demo'}-${width}`
    await P.screenshot({ path: path.join(OUT, `${tag}-today.png`), clip: await clip() })

    /* proposed: the link's words shortened (re-applied right before each picture — the app may repaint), the dim chips out */
    await P.addStyleTag({ content: PROPOSED_CSS })
    const shorten = () => P.evaluate(() => {
      for (const l of document.querySelectorAll('[data-testid="appr-elsewhere"]')) l.textContent = l.textContent.replace(/ pending in /, ' in ')
      return [...document.querySelectorAll('[data-testid="appr-elsewhere"]')].map(l => l.textContent)
    })
    const words = await shorten()
    await P.waitForTimeout(150)
    const after = await measure()
    await P.screenshot({ path: path.join(OUT, `${tag}-proposed-plain.png`), clip: await clip() })
    await P.addStyleTag({ content: MARK_CSS })
    await P.evaluate(() => {
      const l = document.querySelector('[data-testid="appr-elsewhere"]'); if (l) l.setAttribute('data-mock-mark', 'A')
      const m = [...document.querySelectorAll('.appr-filters .appr-f')].find(c => /appr-m-/.test(c.dataset.testid || '') && c.getBoundingClientRect().width > 0)
      if (m) m.setAttribute('data-mock-mark', 'B')
    })
    await shorten()
    const still = await P.evaluate(() => document.querySelectorAll('[data-mock-mark]').length)
    if (still < 1) { console.log(`${tag}: the marks did not survive`); problems++ }
    await P.screenshot({ path: path.join(OUT, `${tag}-proposed.png`), clip: await clip() })
    /* the same proposed top in letters a seventh wider: does the link still sit on the title's line? */
    await P.addStyleTag({ content: WIDE_CSS })
    await P.waitForTimeout(100)
    const wide = await measure()
    if (width === 402) await P.screenshot({ path: path.join(OUT, `${tag}-proposed-wide-letters.png`), clip: await clip() })
    if (errs.length) { console.log(`${tag}: page errors ${errs.join(' | ')}`); problems++ }
    if (after.broken.length) { console.log(`${tag}: a chip broke onto two lines: ${after.broken}`); problems++ }
    if (after.linkRight != null && after.linkRight > after.cardRight) { console.log(`${tag}: the link runs past the card`); problems++ }
    table.push({ state: busy ? 'busy (7 months)' : 'demo (2 months)', width, words: words.join(' '), todayTop: before.top, proposedTop: after.top, saved: before.top - after.top,
      chipRowsToday: before.rows, chipRowsProposed: after.rows, linkOnTitle: after.linkOnTitle, linkOnTitleWideLetters: wide.linkOnTitle })
    await ctx.close()
  }
}
await b.close()
for (const r of table) console.log(JSON.stringify(r))
writeFileSync(path.join(OUT, 'measures.json'), JSON.stringify(table, null, 2))
console.log(problems ? `PROBLEMS: ${problems}` : 'drawn, no problems')
process.exit(problems ? 1 : 0)
