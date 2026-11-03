/* THE SMOOTHER CROSS — the picture for his question (Fable, 3 Nov 26, his "see if there's a smoother way"). Real day cards
   from the built app at his iPhone's size: the seven of the week of 13 Jul, last week's Sunday 12 Jul and next week's
   Monday 20 Jul, laid out as two strips — today's (seven cards; a cross is the app's own slide of two pictures) and the
   proposed one (nine cards; a cross is the phone's own scroll onto a preview card at either end, the week then loaded in
   place under it). The two end cards are marked NEW. Everything in the cards is real; the strips and marks are drawn. */
import { openPhone, goPage, park, sleep } from './ws-walk-a-lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = require('playwright')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-swipe/smoother'
mkdirSync(OUT, { recursive: true })
const s = await openPhone('chromium')
const { page } = s
await goPage(page, 'editsched')
const cards = {}
async function grab(wk, days) {
  await page.evaluate(w => window.loadWeek(w), wk)
  await page.waitForTimeout(600)
  for (const d of days) {
    await park(page, '#eWeek', d)
    const el = page.locator(`#eWeek .day[data-day="${d}"]`)
    const box = await el.boundingBox()
    const name = `${wk.replace(/\//g, '-')}-${d}.png`
    await page.screenshot({ path: `${OUT}/${name}`, clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 300) } })
    cards[`${wk}:${d}`] = name
  }
}
await grab('13/07/2026', [0, 1, 2, 3, 4, 5, 6])
await grab('06/07/2026', [6])
await grab('20/07/2026', [0])
await s.browser.close()

const W = 120, H = 96
const card = (k, mark) => `<div class="c ${mark ? 'new' : ''}"><img src="${cards[k]}"></div>`
const week = ['13/07/2026:0', '13/07/2026:1', '13/07/2026:2', '13/07/2026:3', '13/07/2026:4', '13/07/2026:5', '13/07/2026:6']
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#141a21;color:#e3e8ee;font:600 15px system-ui;padding:18px 22px;width:1240px}
h2{font-size:17px;margin:0 0 8px}
.row{display:flex;align-items:flex-start;gap:8px;margin:0 0 6px}
.c{width:${W}px;height:${H}px;overflow:hidden;border-radius:6px;border:2px solid #2a3542;background:#0d1116;position:relative;flex:none}
.c img{width:${W}px;display:block}
.c.new{border-color:#3cc2e8;box-shadow:0 0 0 2px #3cc2e8 inset}
.c.new::before{content:"NEW";position:absolute;top:4px;right:4px;background:#3cc2e8;color:#06202a;font:800 10px system-ui;padding:2px 5px;border-radius:4px}
.gap{width:${W}px;height:${H}px;flex:none;border:2px dashed #3a4654;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#7d8a98;font-size:12px;text-align:center}
.note{color:#9aa7b4;font-weight:500;font-size:13.5px;margin:0 0 18px;line-height:1.45}
.phone{position:absolute;left:0;top:0;width:${W}px;height:${H}px;border:3px solid #f5a524;border-radius:6px;pointer-events:none;box-sizing:border-box}
.tag{display:inline-block;background:#f5a524;color:#1b1200;font:800 10px system-ui;padding:2px 6px;border-radius:4px;margin-right:6px;vertical-align:middle}
.key{color:#9aa7b4;font-weight:500;font-size:13px;margin:0 0 10px}
</style>
<h2>1 · Today: the strip ends at Monday and Sunday</h2>
<div class="row">
  <div class="gap">nothing here:<br>Safari stretches<br>Monday</div>
  ${week.map(k => card(k)).join('')}
  <div class="gap">nothing here:<br>Safari stretches<br>Sunday</div>
</div>
<p class="note">Swiping past Monday or Sunday pulls on nothing, so Safari rubber-bands the day. The app reads the pull, builds the other week, and slides two pictures of days across by itself. That slide is the app's own motion (about 60 frames a second), not the phone's scroll (120 on your iPhone), and its pace is fixed, not your finger's.</p>
<h2>2 · Proposed: one preview card at each end</h2>
<div class="row">
  ${card('06/07/2026:6', true)}
  ${week.map(k => card(k)).join('')}
  ${card('20/07/2026:0', true)}
</div>
<p class="note">Swiping past Monday just scrolls onto last week's Sunday, the same way a swipe inside the week moves a day: Safari's own scroll, at the phone's full frame rate, at your finger's speed. The moment it comes to rest on the end card the app loads that week underneath, in place, so the card you are looking at becomes live. Nothing slides, nothing springs back. The two end cards (marked NEW) are read-only previews drawn like the desktop's next-week preview, so until the week has loaded a tap on them does nothing.</p>
<p class="key"><span class="tag">YOUR SCREEN</span> is one card wide; the strips are drawn to show how the cards sit beside each other. Every card is a real picture of the built app at your iPhone's size; the strips, the dashed boxes and the NEW marks are drawn in.</p>
`
writeFileSync(`${OUT}/strips.html`, html)
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1284, height: 600 }, deviceScaleFactor: 2 })
await p.goto('file:///' + OUT + '/strips.html')
await p.waitForTimeout(500)
await p.screenshot({ path: `${OUT}/smoother-cross.png`, fullPage: true })
await b.close()
console.log('ok', Object.keys(cards).length)
