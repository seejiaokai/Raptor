// The person window's LVE tile, its "incl. [0] carried fwd · till 31 Dec" line (his iPhone picture, 29 Oct 26 — "dec word is
// exiting the box can u design something better"). Drawn on the REAL window (the built app, Saber's window from the Balances
// page), each option a small change to the tile's own line — the app's own parts, nothing new (D1496). A letter stand-in for
// his iPhone's wider letters is chosen first by measure: the one under which today's line runs past the tile as far as his
// picture shows (6 to 10 points), never one that hides it (§7.9: a stand-in is believed once calibrated).
//   cd raptor-port ; node docs/mock/lw-overhaul/lw-cf-line-draw.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../../../scripts/drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/cfline'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4195'
const b = await chromium.launch(LAUNCH)
const OPTS = {
  /* today, as built */
  today: '',
  /* A: the date on a line of its own under the carried line, in the same grey; the tile one line taller */
  A: `.r17-lve{grid-template-rows:22px 12px 30px 14px 12px}
      .r17-till{grid-row:5;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}`,
  /* A2: A, and the three columns of App bal · Pending · War bal a little closer (24 → 14), so a long War bal ("−12.5", bold
     20) stays inside the tile on a 375 phone in an iPhone's wider letters */
  A2: `.r17-lve{grid-template-rows:22px 12px 30px 14px 12px}
      .r17-till{grid-row:5;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
      .r17-lve .r17-sum{column-gap:14px !important}`,
  /* A3: A, and the three columns spread across the tile — App bal at its left, War bal at its right edge, Pending between —
     the gaps never under 8 */
  A3: `.r17-lve{grid-template-rows:22px 12px 30px 14px 12px}
      .r17-till{grid-row:5;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
      .r17-lve .r17-sum{column-gap:8px !important;justify-content:space-between !important}`,
  /* B3: B, with A3's spread columns */
  B3: `.r17-lve .r17-sum{column-gap:8px !important;justify-content:space-between !important}`,
  /* B: one line, fewer words — "carried" as the Balances page's heading has it */
  B: '',
  /* C: the date beside the carried box's figure, the words after it: "incl. [0] till 31 Dec" over nothing — no: the
     carried line keeps its words and the date moves up into the LVE label's line, after "2 taken" */
  C: `.r17-lve .k .r17-till{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap;margin-left:auto}`,
}
const res = {}
for (const font of ['', 'Arial', 'Verdana']) {
  for (const vp of [{ width: 402, height: 874 }, { width: 375, height: 812 }]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' })
    await serveDist(ctx, ORIGIN, DIST)
    if (font) await ctx.addInitScript(f => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = `#page-leavewar *, #page-leavewar *::after { font-family: ${f} !important }`; document.head.appendChild(s) }) }, font)
    const p = await ctx.newPage()
    await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
    await p.goto(ORIGIN + '/')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { timeout: 20000 })
    await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 })
    await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-cols'); await p.waitForTimeout(400)
    await p.locator('[data-testid="bal-name-stiff"]').tap()
    await p.waitForSelector('[data-testid="pw-tile-LVE"]'); await p.waitForTimeout(500)
    const over = await p.evaluate(() => {
      const t = document.querySelector('[data-testid="pw-tile-LVE"]'), cf = t.querySelector('.r17-cf')
      const range = document.createRange(); range.selectNodeContents(cf)
      return +(range.getBoundingClientRect().right - (t.getBoundingClientRect().right - 9)).toFixed(1)
    })
    const tag = `${font || 'own'}-${vp.width}`
    res[tag] = { overToday: over }
    for (const [name, css] of Object.entries(OPTS)) {
      if (name !== 'today' && !(font === 'Arial' || font === '' || font === 'Verdana')) continue
      await p.evaluate(({ name, css }) => {
        document.getElementById('cfmock')?.remove()
        const s = document.createElement('style'); s.id = 'cfmock'; s.textContent = css + '[data-testid="pw-tile-LVE"]{outline:2px dashed #ff5fa8;outline-offset:2px}'; document.head.appendChild(s)
        const t = document.querySelector('[data-testid="pw-tile-LVE"]'), cf = t.querySelector('.r17-cf')
        t.querySelector('.r17-till')?.remove()
        // the words after the box: " carried fwd" and " · till 31 Dec", two text nodes — kept once, then rewritten as one
        if (!t.dataset.tail) t.dataset.tail = [...cf.childNodes].filter(n => n.nodeType === 3 && n.previousSibling).map(n => n.textContent).join('')
        ;[...cf.childNodes].filter(n => n.nodeType === 3 && n.previousSibling).forEach(n => n.remove())
        const tail = document.createTextNode(''); cf.appendChild(tail)
        const orig = t.dataset.tail, till = (orig.match(/till .*/) || [''])[0]
        if (name === 'today') tail.textContent = orig
        if (name === 'A' || name === 'A2' || name === 'A3') { tail.textContent = ' carried fwd'; const d = document.createElement('span'); d.className = 'r17-till'; d.textContent = till; t.appendChild(d) }
        if (name === 'B' || name === 'B3') tail.textContent = ' carried · ' + till
        if (name === 'C') { tail.textContent = ' carried fwd'; const d = document.createElement('span'); d.className = 'r17-till'; d.textContent = till; t.querySelector('.k').appendChild(d) }
      }, { name, css })
      await p.waitForTimeout(120)
      const m = await p.evaluate(() => {
        const t = document.querySelector('[data-testid="pw-tile-LVE"]'), tr = t.getBoundingClientRect()
        let worst = -99
        for (const el of t.querySelectorAll('.r17-cf, .r17-till, .k')) { const r = document.createRange(); r.selectNodeContents(el); worst = Math.max(worst, r.getBoundingClientRect().right - (tr.right - 9)) }
        const bal = document.querySelector('.zz-balgrid').getBoundingClientRect()
        const war = t.querySelector('[data-testid="pw-LVE-war"]'), was = war.textContent
        war.textContent = '17.5'
        const w4 = +(war.getBoundingClientRect().right - (tr.right - 9)).toFixed(1)
        war.textContent = '−12.5'
        const warOver = w4 + ' / ' + (war.getBoundingClientRect().right - (tr.right - 9)).toFixed(1)
        war.textContent = was
        return { warOver, over: +worst.toFixed(1), tileH: Math.round(tr.height), tilesTop: bal.top, tilesBottom: bal.bottom, left: bal.left, right: bal.right }
      })
      res[tag][name] = { over: m.over, warOver: m.warOver, tileH: m.tileH }
      await p.screenshot({ path: join(OUT, `${tag}-${name}.png`), clip: { x: Math.max(0, m.left - 10), y: m.tilesTop - 46, width: Math.min(vp.width, m.right - m.left + 20), height: m.tilesBottom - m.tilesTop + 56 } })
    }
    await ctx.close()
  }
}
await b.close()
writeFileSync(join(OUT, 'measure.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify(res, null, 1))
