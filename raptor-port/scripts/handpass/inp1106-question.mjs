// [INP-CARD-COLUMNS] (his D1305, D1310) — the night of 6 Nov 26, job 2: the pictures for his question. His iPhone's size
// (402 × 874, WebKit, 3×), the Inputs list, all dates, the same stretch of cards three ways, each a stylesheet laid over
// the built list (the build itself unchanged): TODAY; A — the three columns as drawn (built, then taken back on the
// branch: the cards it makes a line taller); R — the recommendation: the columns sized to the letters, and a card that
// carries no document mark (a commitment, a course, an overseas duty) closing the document column. Every card one line
// taller than today is outlined, its words on the picture (D1222). Usage, from raptor-port/:
//   node scripts/handpass/inp1106-question.mjs <dist> <out folder>
import { webkit, serveDist } from '../drawcheck/lib.mjs'
import { readFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
console.log('[inp1106-question v2]')
const [dist = 'dist', out = 'docs/img/handpass/2026-11-06-inputs-batch/question'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
const A = readFileSync(path.join(here, 'inp1106-cols-A.css'), 'utf8')
const R = A + '\n.icard-corner{grid-template-columns:auto 3.6em 6.4em minmax(6.2em,max-content)}\n.icard-corner:not(:has(.icard-nodoc,.icard-doc)){grid-template-columns:auto 3.6em 0 minmax(6.2em,max-content)}'
const ORIGIN = 'http://localhost:4388'
const br = await webkit.launch()
const heights = {}
// TODAY lays main's one-row corner back over the build (as the probe's `old`), so any build of this branch can serve
const TODAY = '.icard-corner{display:inline-flex !important;gap:8px}'
for (const [name, css, label] of [['today', TODAY, 'Today: each mark stands where the words before it end'],
  ['a-as-drawn', A, 'A, as drawn: three columns, every empty one keeping its room'],
  ['r-recommended', R, 'Recommended: columns sized to the letters; a card with no document mark closes that column']]) {
  for (const [shot, who] of [['appointments', 'Bolt'], ['four-names', 'Drifter, Echo, Ranger, Saber']]) {
    const ctx = await br.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true })
    await serveDist(ctx, ORIGIN, dist)
    const page = await ctx.newPage()
    await page.goto(ORIGIN + '/?fresh=1')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(800)
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
    await page.click('#inListBtn'); await page.waitForTimeout(400)
    await page.click('#inRangeBtn'); await page.waitForTimeout(300); await page.click('#inRangeAll'); await page.waitForTimeout(700)
    if (css) await page.addStyleTag({ content: css })
    await page.waitForTimeout(200)
    const hs = await page.evaluate(() => [...document.querySelectorAll('#inList .icard')].map(c => Math.round(c.getBoundingClientRect().height)))
    if (name === 'today') heights[shot] = hs
    const base = heights[shot]
    const n = await page.evaluate(([who, hs, base, label]) => {
      const cards = [...document.querySelectorAll('#inList .icard')]
      const t = cards.find(c => c.querySelector('.icard-who').textContent === who)
      window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 330)
      let grew = 0
      cards.forEach((c, i) => {
        if (base && hs[i] > base[i] + 1) {
          grew++
          c.style.outline = '2px solid #ff4fa3'; c.style.outlineOffset = '1px'
          const r = c.getBoundingClientRect()
          if (r.top > 60 && r.bottom < innerHeight - 80) {
            const l = document.createElement('div'); l.className = 'mock-lab'; l.textContent = 'a line taller than today'
            Object.assign(l.style, { position: 'absolute', left: (r.left + 12) + 'px', top: (r.bottom + scrollY - 9) + 'px', zIndex: 99998, background: '#ff4fa3', color: '#1a0010', font: '700 10px system-ui, sans-serif', padding: '1px 6px', borderRadius: '4px', pointerEvents: 'none' })
            document.body.appendChild(l)
          }
        }
      })
      const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = label + (base ? ` — ${grew} of ${cards.length} cards a line taller` : '')
      Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: '24px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '6px 9px', font: '600 12px system-ui, sans-serif', pointerEvents: 'none' })
      document.body.appendChild(d)
      return grew
    }, [who, hs, name === 'today' ? null : base, label])
    await page.waitForTimeout(250)
    await page.screenshot({ path: path.join(out, `${name}-${shot}.png`) })
    console.log(name, shot, 'cards a line taller:', name === 'today' ? '-' : n)
    await ctx.close()
  }
}
await br.close()
