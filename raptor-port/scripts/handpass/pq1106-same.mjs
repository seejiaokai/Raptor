// The night of 6 Nov 26, job 3 — React Doctor's findings on People and Quals (HolidaysPanel, PeoplePick, QualsPage, Login,
// accounts): NOTHING A PERSON SEES MAY CHANGE. Every touched screen pictured on the build before and the build after, at
// his PC's 1536 (Chromium) and his iPhone's 402 (WebKit), the clock held still, then each pair compared (no pixel more
// than 24 colour levels off). First the same build twice — the comparison must see only the code (walk-scripts §8).
// Copied from job 2's method (scripts/handpass/inp1106-same.mjs on claude/inputs-batch-1106).
// Usage, from raptor-port/:  node scripts/handpass/pq1106-same.mjs <before dist> <after dist> <out folder>
import { chromium, webkit, LAUNCH, serveDist, pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
console.log('[pq1106-same v1]')
const [before, after, out = 'docs/img/handpass/2026-11-06-people-quals/same'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const ORIGIN = 'http://localhost:4389'
const NOW = new Date('2026-07-14T09:30:00+08:00')
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const tid = (p, t) => p.locator(`[data-testid="${t}"]:visible`).first()

/* each screen: how to reach it, freshly signed in as the admin (`signin` is the page before signing in) */
const SCREENS = [
  ['signin', null],
  ['signin-typed', null],
  ['quals', async p => { await p.evaluate(() => window.go('quals')) }],
  ['quals-edit', async p => { await p.evaluate(() => window.go('quals')); await p.clock.runFor(600); await p.click('#qEdit') }],
  ['quals-editquals', async p => { await p.evaluate(() => window.go('quals')); await p.clock.runFor(600); await p.click('#qEdit'); await p.clock.runFor(300); await p.click('#qEditQuals') }],
  ['quals-pinned', async p => { await p.evaluate(() => window.go('quals')); await p.clock.runFor(600); await p.evaluate(() => window.scrollTo(0, 500)) }],
  ['quals-wsos-search', async p => { await p.evaluate(() => window.go('quals')); await p.clock.runFor(600); await p.click('#qViewW'); await p.fill('#qFilter', 'a') }],
  ['holidays', async p => { await p.evaluate(() => window.go('leavewar')); await p.clock.runFor(2500); await tid(p, 'settings-open').click(); await p.clock.runFor(400); await tid(p, 'settings-days').click(); await p.clock.runFor(600); if (await p.locator('[data-testid="days-tabs"]:visible').count()) await tid(p, 'days-tab-holidays').click() }],
  ['holidays-form', async p => { await p.evaluate(() => window.go('leavewar')); await p.clock.runFor(2500); await tid(p, 'settings-open').click(); await p.clock.runFor(400); await tid(p, 'settings-days').click(); await p.clock.runFor(600); if (await p.locator('[data-testid="days-tabs"]:visible').count()) await tid(p, 'days-tab-holidays').click(); await p.clock.runFor(300); await tid(p, 'hol-add').click() }],
  ['input-window', async p => { await p.evaluate(() => window.go('inputs')); await p.clock.runFor(800); await p.click('#inListBtn'); await p.clock.runFor(300); await p.click('#inNew') }],
  ['input-several', async p => { await p.evaluate(() => window.go('inputs')); await p.clock.runFor(800); await p.click('#inListBtn'); await p.clock.runFor(300); await p.click('#inNew'); await p.clock.runFor(600); await p.selectOption('#inpEditType, select[aria-label="Type"]', { label: 'Meeting' }).catch(() => {}); await p.clock.runFor(300); await tid(p, 'pp-several').click() }],
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
      try {
        if (name === 'signin') { /* the card as it opens */ }
        else if (name === 'signin-typed') { await p.fill('#luser', 'ranger'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await p.clock.runFor(300) }
        else {
          await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
          await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.clock.runFor(1500)
          await p.addStyleTag({ content: QUIET }).catch(() => {})
          await reach(p)
        }
      } catch (e) { console.log(`  ${tag} ${size} ${name}: could not reach — ${e.message.split('\n')[0]}`) }
      await p.clock.runFor(1500)
      const f = path.join(out, `${tag}-${size}-${name}.png`)
      await p.screenshot({ path: f, fullPage: !phone && name !== 'quals-pinned' })
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
