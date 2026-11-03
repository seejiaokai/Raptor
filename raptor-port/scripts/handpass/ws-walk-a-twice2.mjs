/* walker A: A6 deeper — the strip's own position over time in a second swipe that does not cross. version 1 */
import { openPhone, goPage, weekId, park, startSampler, stopSampler, fingerCdp, path, sleep, OUT } from './ws-walk-a-lib.mjs'
import { writeFileSync } from 'node:fs'
console.log('ws-walk-a-twice2 v1')
const s = await openPhone('chromium')
const sel = '#eWeek'
let got = 0
try {
  await goPage(s.page, 'editsched')
  for (let k = 0; k < 20 && got < 2; k++) {
    await s.page.evaluate(w => window.loadWeek(w), '13/07/2026')
    await s.page.waitForFunction(w => window.CURWEEK === w, '13/07/2026')
    await s.page.waitForTimeout(600)
    await park(s.page, sel, 1)
    const from = await weekId(s.page)
    await startSampler(s.page, sel)
    await fingerCdp(s.cdp, path(60, 430, 320, 430, 8, 130), 40)
    await sleep(100)
    await fingerCdp(s.cdp, path(80, 430, 230, 430, 6, 80), 0)
    await sleep(1000)
    const tr = await stopSampler(s.page)
    const to = await weekId(s.page)
    if (to !== from) continue
    got++
    const t0 = tr.marks.find(m => m.ev === 'touchend').t
    console.log('NO-CROSS run', k, 'marks', tr.marks.map(m => `${m.ev.replace('touch', '')}@${Math.round(m.t - t0)}:x${m.x}:sl${m.sl == null ? '-' : Math.round(m.sl)}`).join(' '))
    console.log(' sl by time after lift1:', tr.frames.filter(f => f.t >= t0 - 60).filter((f, i) => i % 2 === 0).map(f => `${Math.round(f.t - t0)}:${Math.round(f.sl)}`).join(' '))
    writeFileSync(`${OUT}/A6-chromium-nocross-trace-${got}.json`, JSON.stringify({ from, to, marks: tr.marks, frames: tr.frames.map(f => ({ t: f.t, sl: f.sl, wk: f.wk, copies: f.copies.length })) }))
    await s.page.screenshot({ path: `${OUT}/A6-chromium-nocross-after-${got}.png` })
  }
  console.log('found', got)
} finally { await s.browser.close() }
