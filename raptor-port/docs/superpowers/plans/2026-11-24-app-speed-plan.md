# The app's speed — the measurements of 24 Nov 26, the order of work and the ideas that wait ([APP-SPEED], D2480)

Written by chat 160 on 24 Nov 26; the backlog item `[APP-SPEED]` in `OUTSTANDING.md` points here. No size of fix is promised by
these figures: each step is measured again first, as `raptor-port/docs/performance.md` Part 1 requires.

**His ask (24 Nov 26):** ways to improve the app's speed — less loading time, or perceived; interface speeds; especially on a slow computer. **His go:** *"Ok as recommended. Anyway once it is in the app it has no sign in"* (D2480).

**Measured 24 Nov 26 (chat 160) — ROUGH: another chat's full unit suite was running on his PC; best of three fresh starts; re-measure before any step, paired, as `raptor-port/docs/performance.md` Part 1 requires.** The built app of `main` that morning, real Chromium, CPU slowed 4×, a 1366×768 desktop and a 390×844 phone, signed in as the admin, each page opened by `window.go` and timed to the second frame after it (the script and how to run it: §How it was measured, below):

| | Desktop | Phone |
|---|---|---|
| open the app → the sign-in card (no network cost: served from the PC) | 1.4 s | 1.4 s |
| sign in → the week | 2.8 s | 2.7 s |
| View-only Sched → Edit Schedule (first, then again) | 1.7 s, 1.9 s | 0.8 s |
| Edit Schedule → View-only Sched | 3.2 s (3.2 to 3.4 in all three runs) | 0.85 s |
| Inputs | 1.4 s | 0.7 s |
| Quals · Logic | 0.8 s · 0.9 s | 0.5 s · 0.5 s |
| the Leave War, first open · coming back | 2.2 to 3.2 s · 1.7 s | 3.2 s · 1.7 s |
| the Tracker, first open · coming back | 2.7 s · 1.2 s | 3.1 s · 0.9 s |

Up to the week (desktop): script 0.9 s, style 0.4 s, layout 1.25 s — arranging the page is the largest piece; the page holds 10,748 elements on the desktop, 8,352 on the phone. The first download before the sign-in card: about 616 KB of script and 59 KB of styles compressed (2.2 MB unpacked), twelve script files; the Leave War about 137 KB more, the Tracker about 123 KB. **Two things to check first:** (a) coming back to the Leave War at 1.7 s against the 0.4 s the speed ledger recorded on 5 Sep 26 (entry 15) — slipped since, or noise; (b) Edit Schedule at 1.7 to 1.9 s against the 1.37 s of 3 Sep 26 (entry 11).

**The order (D2480):**
1. **A hidden timing readout** — a switch on the app's address, like `?savefail` (D1666), that shows how long start-up and each page open took on the machine in hand, so the slow office computer is measured itself and the 4× stand-in is checked; it shows nothing to anyone without the switch. Opus.
2. **The week draws the days in view first, the rest a moment later, and both schedule pages are kept ready** (one job; high-risk, Fable with other readers beside it — D2258): Edit Schedule is already parked ready (ledger 11); View-only Sched appears rebuilt on each return — to confirm by measurement before anything is built. Bound by the speed notes' invariants and dead ends (paint isolation on the edit week measured equal or worse; the week parked in-flow, never `display:none`), every scroll position, the foot scroll bar and the glides kept; his iPhone look before done.
3. **No file re-checks on repeat visits** — the built files carry their content in their names, so the host can tell browsers to keep them; by Vercel's documented default a browser asks about each on every visit (NOT checked on the live site, which is behind his sign-in). A small host setting; lasts only until the hosting moves. Opus.

**Not built (the agent's reading of his remark, D2480):** the sign-in card shown before the app's code arrives — the app has no sign-in once it is in Power Apps.

**Waiting, not started:** (i) each page downloaded only when it is needed — today only the Leave War and the Tracker are separate; helps a weak signal more than a slow computer; (ii) the Leave War and the Tracker fetched ahead after sign-in, with check (a) above; (iii) a lighter look on weak machines — less frosted glass, fewer shadows and glides — HIS CALL (smooth motion is part of quality, D991), raised only if step 1 shows those effects cost real time; (iv) the five held-back wins, [PERF-RESIDUALS], two of them his call. **At the database step:** opening on the copy already on the device and refreshing behind it, beside the load-by-need plan of [DB-STEP] — whether the IT side allows schedule data kept on a device is not known.

**Before building anything a person would see:** a mock-up first (D1625). **Place:** a job of its own, in a fresh chat, beside the multi-squadron build.

## How it was measured — the script

The times in the backlog item `[APP-SPEED]` came from the script below (chat 160). It serves `raptor-port/dist` itself
on a free port — it builds nothing and leaves no server behind — opens real Chromium with the CPU slowed, signs in as
the seeded admin, opens each page by `window.go` and times it to the second frame after the page reports itself current
and no page claw is up. It prints the best of N fresh starts beside every reading, for a 1366×768 desktop and a 390×844
phone.

**Run it** from `raptor-port/`, on a build already made (`npm run build` — the checks lock first, `shipping.md` §The
checks), saved as a `.cjs` file outside the repo: `node <file>.cjs "<full path to raptor-port>" 4 3` — the folder, the
slow-down, the number of starts.

**What it is not:** a paired before-and-after run, a split by phase beyond the four totals Chromium reports, or a
measure of the network (the files come from the PC). The readings of 24 Nov were taken while another chat ran the full
unit suite, so they are rough. `raptor-port/docs/performance.md` Part 1 is the law for any figure a fix is judged by.

```js
/* A rough timing of the built app on a slowed browser (4x CPU), best of N fresh starts.
   Serves raptor-port/dist itself on a free port — builds nothing, leaves no server behind. */
const path = require('path')
const fs = require('fs')
const http = require('http')
const { createRequire } = require('module')
const ROOT = process.argv[2]
const RATE = Number(process.argv[3] || 4)
const N = Number(process.argv[4] || 3)
const req = createRequire(path.join(ROOT, 'package.json'))
const { chromium } = req('playwright')
const DIST = path.join(ROOT, 'dist')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }
const server = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0])
  if (p === '/') p = '/index.html'
  const f = path.join(DIST, p)
  if (!f.startsWith(DIST) || !fs.existsSync(f)) { s.writeHead(404); s.end(); return }
  s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(s)
})
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

const paint = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now())))))
async function metrics(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics')
  const m = Object.fromEntries(metrics.map(x => [x.name, x.value]))
  return { script: m.ScriptDuration, style: m.RecalcStyleDuration, layout: m.LayoutDuration, task: m.TaskDuration }
}
async function openPage(page, to) {
  const t0 = Date.now()
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p && !document.querySelector('.pgclaw:not(.gone)'), to, { timeout: 120000 })
  await paint(page)
  return Date.now() - t0
}
async function one(browser, base, viewport) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 120)))
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Performance.enable')
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE })
  const r = {}
  let t0 = Date.now()
  await page.goto(base + '/')
  await page.waitForSelector('#luser', { state: 'visible', timeout: 120000 })
  await paint(page)
  r.toSignIn = Date.now() - t0
  r.mSignIn = await metrics(cdp)
  await page.fill('#luser', 'ad')
  await page.fill('#lpass', 'a')
  t0 = Date.now()
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 120000 })
  await paint(page)
  r.signInToWeek = Date.now() - t0
  r.mWeek = await metrics(cdp)
  r.nodes = await page.evaluate(() => document.querySelectorAll('*').length)
  r.edit1 = await openPage(page, 'editsched')
  r.view2 = await openPage(page, 'viewsched')
  r.edit2 = await openPage(page, 'editsched')
  r.inputs = await openPage(page, 'inputs')
  r.quals = await openPage(page, 'quals')
  r.logic = await openPage(page, 'logic')
  r.leavewar1 = await openPage(page, 'leavewar')
  r.tracker1 = await openPage(page, 'tracker')
  r.leavewar2 = await openPage(page, 'leavewar')
  r.tracker2 = await openPage(page, 'tracker')
  r.backToView = await openPage(page, 'viewsched')
  r.errors = errors
  await ctx.close()
  return r
}
server.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + server.address().port
  const browser = await chromium.launch(launchOptions)
  const out = {}
  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['phone', { width: 390, height: 844 }]]) {
    const runs = []
    for (let i = 0; i < N; i++) runs.push(await one(browser, base, viewport))
    const best = {}
    for (const k of Object.keys(runs[0])) {
      if (typeof runs[0][k] === 'number') best[k] = Math.min(...runs.map(r => r[k])) + ' (all: ' + runs.map(r => r[k]).join(', ') + ')'
    }
    best.scriptToSignIn = Math.min(...runs.map(r => r.mSignIn.script)).toFixed(2)
    best.taskToSignIn = Math.min(...runs.map(r => r.mSignIn.task)).toFixed(2)
    best.scriptToWeek = Math.min(...runs.map(r => r.mWeek.script)).toFixed(2)
    best.styleToWeek = Math.min(...runs.map(r => r.mWeek.style)).toFixed(2)
    best.layoutToWeek = Math.min(...runs.map(r => r.mWeek.layout)).toFixed(2)
    best.errors = runs.flatMap(r => r.errors).slice(0, 3)
    out[name] = best
  }
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
  server.close()
})
```
