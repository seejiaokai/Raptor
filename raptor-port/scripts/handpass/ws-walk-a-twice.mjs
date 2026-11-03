/* walker A: the second swipe begun while the week is still settling onto Monday — what timing does this test browser give, and when does it cross? version 1 */
import { openPhone, goPage, weekId, park, startSampler, stopSampler, fingerCdp, path, sleep } from './ws-walk-a-lib.mjs'
console.log('ws-walk-a-twice v1')
const s = await openPhone('chromium')
const sel = '#eWeek'
try {
  await goPage(s.page, 'editsched')
  for (const wait of [100, 100, 100, 100, 100, 100, 120, 120, 120, 120, 120, 120, 140, 140, 140, 140, 140, 140, 170, 170, 170, 170, 170, 170]) {
    await s.page.evaluate(w => window.loadWeek(w), '13/07/2026')
    await s.page.waitForFunction(w => window.CURWEEK === w, '13/07/2026')
    await s.page.waitForTimeout(600)
    await park(s.page, sel, 1)
    const from = await weekId(s.page)
    await startSampler(s.page, sel)
    await fingerCdp(s.cdp, path(60, 430, 320, 430, 8, 130), 40)
    if (wait) await sleep(wait)
    await fingerCdp(s.cdp, path(80, 430, 230, 430, 6, 80), 0)
    await sleep(1000)
    const tr = await stopSampler(s.page)
    const to = await weekId(s.page)
    const ends = tr.marks.filter(m => m.ev === 'touchend'), starts = tr.marks.filter(m => m.ev === 'touchstart')
    const moves2 = tr.marks.filter(m => m.ev === 'touchmove' && m.t > starts[1].t)
    const pre = tr.frames.filter(f => f.t >= starts[1].t - 160 && f.t <= starts[1].t).map(f => Math.round(f.sl)).join(',')
    console.log('wait', wait, 'sl before:', pre, '|', '| gap lift1->start2 (page clock)', Math.round(starts[1].t - ends[0].t), 'ms | week at start2', starts[1].sl, '| 2nd swipe moves seen', moves2.map(m => m.x).join(','), 'end', ends[1] && ends[1].x, '|', to === from ? 'NO CROSS' : 'crossed to ' + to)
  }
} finally { await s.browser.close() }
