/* [TRK-CHART-FPS] (D992, 18 Oct 26) — frame-rate measure of the Tracker chart: a finger scroll and a two-finger pinch, on a phone-sized touch page,
   with the CPU slowed by FPS_CPU (default 4). Prints frames drawn per second during each gesture and the slowest frames.
   Run: HP_URL=http://localhost:<port> FPS_CPU=<1|2|4> node scripts/handpass/trk-fps-measure.mjs (a preview serving the build to measure). */
const lib = await import('./trk-lib.mjs')
const { open, PHONE } = lib
const CPU = +(process.env.FPS_CPU || 4)
const wait = ms => new Promise(r => setTimeout(r, ms))
const { browser, page } = await open({ size: PHONE, who: 'a', touch: true })
const cdp = await page.context().newCDPSession(page)
await page.waitForSelector('#flowSvg .ball'); await wait(800)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })
const startRec = () => page.evaluate(() => { window.__f = []; window.__on = true; const tick = t => { if (!window.__on) return; window.__f.push(t); requestAnimationFrame(tick) }; requestAnimationFrame(tick) })
const stopRec = () => page.evaluate(() => { window.__on = false; const f = window.__f, d = []; for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]); d.sort((a, b) => a - b); const span = f[f.length - 1] - f[0]; return { frames: f.length, fps: +(1000 * (f.length - 1) / span).toFixed(1), median: +d[d.length >> 1].toFixed(1), p90: +d[Math.floor(d.length * 0.9)].toFixed(1), worst: +d[d.length - 1].toFixed(1), over33: d.filter(x => x > 33).length } })
const b = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + Math.min(r.height, innerHeight - r.top) / 2 } })
const zoomNow = () => page.evaluate(() => document.querySelector('#board .flowwrap').style.zoom)
const results = {}
for (const run of [1, 2]) {
  /* SCROLL: one finger up 400px over 40 moves, 16ms apart */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 600 }); await wait(400)
  await startRec()
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.cx + 60, y: b.cy + 150, id: 1 }] })
  for (let i = 1; i <= 40; i++) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.cx + 60, y: b.cy + 150 - i * 10, id: 1 }] }) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  results['scroll' + run] = await stopRec(); await wait(1500)
  /* PINCH: two fingers spread from 60px apart to 260px over 40 moves, then back */
  const z0 = await zoomNow()
  await startRec()
  const pts = s => [{ x: b.cx - s / 2, y: b.cy, id: 2 }, { x: b.cx + s / 2, y: b.cy, id: 3 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(60) })
  for (let i = 1; i <= 40; i++) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(60 + i * 5) }) }
  for (let i = 39; i >= 0; i--) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(60 + i * 5) }) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  results['pinch' + run] = { ...(await stopRec()), zoomBefore: z0, zoomAfter: await zoomNow() }; await wait(1000)
}
/* the cost of one pinch step on its own: a zoom change, laid out and drawn (forced), timed in the page */
results.zoomStepMs = await page.evaluate(async () => {
  const w = document.querySelector('#board .flowwrap'), z = +w.style.zoom || 1, out = []
  for (let i = 0; i < 10; i++) { const t = performance.now(); w.style.zoom = String(z * (1 + (i % 2 ? 0.02 : -0.02))); void document.getElementById('board').scrollWidth; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); out.push(+(performance.now() - t).toFixed(1)) }
  w.style.zoom = String(z); return out
})
results.scrollStepMs = await page.evaluate(async () => {
  const bd = document.getElementById('board'), out = []
  for (let i = 0; i < 10; i++) { const t = performance.now(); bd.scrollTop += (i % 2 ? 8 : -8); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); out.push(+(performance.now() - t).toFixed(1)) }
  return out
})
results.nodes = await page.evaluate(() => document.querySelectorAll('#flowSvg *').length)
console.log(JSON.stringify({ cpu: CPU, ...results }, null, 1))
await browser.close()
