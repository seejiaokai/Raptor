// [LW-NAME-PUCKS]'s speed check (docs/performance.md §E, the change-checklist): what the name as a puck costs the Leave
// War grid — its node count (the grid and the phone's frozen copy) and the time from opening the tab to the names drawn,
// at 4x CPU, three runs a size. Not a gate: it prints numbers, run once on the build before and once after.
//   npm run build && npx vite preview --port 4173 --strictPort ; PORT=4173 node scripts/handpass/lw-name-pucks-perf.mjs
import { chromium, devices } from '@playwright/test'
const PORT = process.env.PORT || 4173
const SIZES = { desk: { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 }, phone: { ...devices['iPhone 13'], viewport: { width: 402, height: 874 } } }
const browser = await chromium.launch()
for (const [size, opts] of Object.entries(SIZES)) {
  const runs = []
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext(opts); const P = await ctx.newPage()
    await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
    await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
    await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(3000)
    const cdp = await ctx.newCDPSession(P); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const ms = await P.evaluate(async () => {
      const t0 = performance.now(); window.go('leavewar')
      await new Promise(r => { const f = () => document.querySelectorAll('.mx .who .whoedit').length > 20 ? r() : requestAnimationFrame(f); f() })
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      return Math.round(performance.now() - t0)
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); await P.waitForTimeout(3000)
    const nodes = await P.evaluate(() => ({ grid: document.querySelectorAll('.mx *').length, names: document.querySelectorAll('.mx .who .whoedit *').length, band: document.querySelectorAll('.mxband *').length }))
    runs.push({ ms, ...nodes }); await ctx.close()
  }
  console.log(size, JSON.stringify(runs))
}
await browser.close()
