/* W5's end gap, looked into: a timeline of one page change (chat 164) — when its section turns on, each frame, long tasks. */
import { serve, browserOf, fresh, DESK, signIn, outsideTime, openBy, readout, pageRows, waitRows, sleep } from './timing-walk-lib.mjs'
const srv = await serve(); const cr = await browserOf()
const { ctx, page } = await fresh(cr, DESK, { cpu: 4 })
await page.addInitScript(() => {
  const w = window; w.__tl = []; const L = (k, extra) => w.__tl.push([k, Math.round(performance.now()), extra || ''])
  addEventListener('click', e => L('click', 'stamp ' + Math.round(e.timeStamp)), true)
  new PerformanceObserver(l => { for (const e of l.getEntries()) L('longtask', Math.round(e.startTime) + '+' + Math.round(e.duration)) }).observe({ type: 'longtask' })
  addEventListener('DOMContentLoaded', () => {
    new MutationObserver(ms => { for (const m of ms) { const t = m.target; if (t.id && t.id.startsWith('page-')) L(t.id + (t.classList.contains('on') ? ' on' : ' off') + (t.hasAttribute('aria-busy') ? ' busy' : '')) } }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-busy'] })
  })
  w.__frames = () => { let n = 0; const f = () => { const s = document.querySelector("#page-" + (window.__want || "leavewar")); L("frame", s ? s.getElementsByTagName("*").length + " nodes in the page" : ""); if (++n < 40) requestAnimationFrame(f) }; requestAnimationFrame(f) }
})
await page.goto(srv.base + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
await signIn(page); await outsideTime(page, 'viewsched'); await sleep(800)
for (const p of ['leavewar', 'admin']) { await openBy(page, p); await outsideTime(page, p); await sleep(1500) }
const n = pageRows(await readout(page)).length
await page.evaluate(() => { window.__tl = []; window.__frames() })
await openBy(page, 'leavewar')
const out = await outsideTime(page, 'leavewar')
const r = await waitRows(page, n)
const tl = await page.evaluate(() => window.__tl)
const c = tl.find(x => x[0] === 'click')
console.log('readout', pageRows(r)[0]?.value, 'outside', out)
for (const x of tl.filter(x => x[0] !== 'frame' || true).slice(0, 60)) console.log(String(x[1] - c[1]).padStart(6), x[0], x[2])
await cr.close(); await srv.close()
