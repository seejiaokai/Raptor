/* walker A: why does the A2 flick (30px / 60ms) not cross — what does the page see? version 1 */
import { openPhone, goPage, weekId, park, settle, startSampler, stopSampler, fingerCdp, path, sleep, now } from './ws-walk-a-lib.mjs'
console.log('ws-walk-a-flick v1')
const s = await openPhone('chromium')
const sel = '#eWeek'
const variants = [
  ['30px, 2 moves over 60ms (A2)', path(150, 430, 180, 430, 2, 60), 0],
  ['30px, 1 move at 16ms', [[150, 430, 0], [180, 430, 16]], 0],
  ['40px, 1 move at 16ms (the spec recipe)', [[150, 430, 0], [190, 430, 16]], 0],
  ['30px, 3 moves over 45ms', path(150, 430, 180, 430, 3, 45), 0],
  ['30px, 2 moves over 30ms', path(150, 430, 180, 430, 2, 30), 0],
  ['30px, 5 moves over 60ms', path(150, 430, 180, 430, 5, 60), 0],
  ['26px, 1 move', [[150, 430, 0], [176, 430, 16]], 0],
  ['36px, 2 moves over 40ms', path(150, 430, 186, 430, 2, 40), 0],
]
try {
  await goPage(s.page, 'editsched')
  for (const [name, pts, rest] of variants) {
    for (let k = 0; k < 2; k++) {
      await s.page.evaluate(w => window.loadWeek(w), '13/07/2026')
      await s.page.waitForFunction(w => window.CURWEEK === w, '13/07/2026')
      await s.page.waitForTimeout(600)
      await park(s.page, sel, 0)
      const from = await weekId(s.page)
      await startSampler(s.page, sel)
      const log = await fingerCdp(s.cdp, pts, rest)
      await sleep(900)
      const tr = await stopSampler(s.page)
      const to = await weekId(s.page)
      const t0 = tr.marks.find(m => m.ev === 'touchstart')?.t
      console.log(name, 'try', k + 1, '->', to === from ? 'NO CROSS' : 'crossed', '| lift after', Math.round(log.lift - log.start), 'ms |', tr.marks.map(m => `${m.ev.replace('touch', '')}@${Math.round(m.t - t0)}:${m.x}`).join(' '))
    }
  }
} finally { await s.browser.close() }
