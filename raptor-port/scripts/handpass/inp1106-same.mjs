// The night of 6 Nov 26, job 2 — React Doctor's findings on the Inputs pages: NOTHING A PERSON SEES MAY CHANGE. Every
// Inputs screen pictured on the build before the fixes and the build after, at his PC's 1536 (Chromium) and his iPhone's
// 402 (WebKit), the clock held still so the two match pixel for pixel, then each pair compared (no pixel more than 24
// colour levels off). First the same build twice — the comparison must see only the code (walk-scripts §8).
// Usage, from raptor-port/:  node scripts/handpass/inp1106-same.mjs <before dist> <after dist> <out folder>
import { chromium, webkit, LAUNCH, serveDist, pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
console.log('[inp1106-same v2]')
const [before, after, out = 'docs/img/handpass/2026-11-06-inputs-batch/same'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const ORIGIN = 'http://localhost:4389'
// the demo's July holds its inputs (13–25 Jul): the month opens on it, so its bars, an opened day's cards and the List's
// cards are all on the pictures — two equal pictures of an empty month prove nothing (walk-scripts §8)
const NOW = new Date('2026-07-14T09:30:00+08:00')
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* each screen: how to reach it from the Inputs page, freshly signed in as the admin */
const SCREENS = [
  ['month', async p => {}],
  ['day-open', async (p, phone) => { const c = p.locator('#inpCal [data-icday="2026-07-14"]'); if (phone) await c.tap({ position: { x: 10, y: 10 } }); else await c.click({ position: { x: 10, y: 10 } }); await sleep(700) }],
  ['list', async p => { await p.click('#inListBtn'); await sleep(300); await p.click('#inRangeBtn'); await sleep(200); await p.click('#inRangeAll'); await sleep(600) }],
  ['list-sorted', async (p, phone) => { await p.click('#inListBtn'); await sleep(300); await p.click('#inRangeBtn'); await sleep(200); await p.click('#inRangeAll'); await sleep(600); if (!phone) { await p.click('#intbl thead th[data-sort="type"]'); await sleep(300) } }],
  ['new-input', async p => { await p.click('#inListBtn'); await sleep(300); await p.click('#inNew'); await sleep(700) }],
  ['sans', async p => { await p.click('#inSansMode'); await sleep(700) }],
  ['medical', async p => { await p.click('#inMedBtn'); await sleep(700) }],
]

async function shoot(dist, tag) {
  const pics = {}
  for (const [size, engine] of [['desk', 'chromium'], ['phone', 'webkit']]) {
    const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
    for (const [name, reach] of SCREENS) {
      const phone = size === 'phone'
      const ctx = await br.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
      await serveDist(ctx, ORIGIN, dist)
      const p = await ctx.newPage()
      const errs = []; p.on('pageerror', e => errs.push(e.message))
      await p.clock.install({ time: NOW }); await p.clock.pauseAt(NOW)
      await p.goto(ORIGIN + '/?fresh=1')
      await p.addStyleTag({ content: QUIET }).catch(() => {})
      await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
      await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.clock.runFor(1500)
      await p.evaluate(() => window.go('inputs')); await p.clock.runFor(1000)
      await p.addStyleTag({ content: QUIET }).catch(() => {})
      try { await reach(p, phone) } catch (e) { console.log(`  ${tag} ${size} ${name}: could not reach — ${e.message.split('\n')[0]}`) }
      await p.clock.runFor(1500)
      const f = path.join(out, `${tag}-${size}-${name}.png`)
      await p.screenshot({ path: f, fullPage: !phone })
      pics[`${size}-${name}`] = f
      if (errs.length) console.log(`  ${tag} ${size} ${name}: page errors — ${errs.slice(0, 2).join(' | ')}`)
      await ctx.close()
    }
    await br.close()
  }
  return pics
}
const A = await shoot(before, 'before'), A2 = await shoot(before, 'before-again'), B = await shoot(after, 'after')
const cmp = await chromium.launch(LAUNCH)
let same = 0, diff = 0
for (const k of Object.keys(A)) {
  const self = await pictureDiff(cmp, A[k], A2[k]), d = await pictureDiff(cmp, A[k], B[k])
  const ok = d.same !== false && !(d.share > 0)
  ok ? same++ : diff++
  console.log(`${ok ? 'SAME ' : 'DIFF '} ${k}  before vs before-again: ${JSON.stringify(self)}  before vs after: ${JSON.stringify(d)}`)
}
await cmp.close()
console.log(`${same} the same, ${diff} differ`)
