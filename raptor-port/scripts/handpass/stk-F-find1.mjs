/* Walker F — evidence for the finding "a Tab commit leaves the warning list stale": the same out-of-order Rally line
   committed by Tab and by Enter, on the Board's warning list and on the week's day bar, with pictures. */
import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const { row, judge, sleep, pic } = F
const c = await F.open('desk'); const { p } = c
const pcs = []
const checks = []
try {
  await X.flyWave(p, 4, { cs: 'VL', to: '12:00', ld: '13:00', crew: ['bane', 'freak'], gi: 0 })
  await X.ensureLines(p, 'board', 4, 2, 0)
  await X.setLine(p, 'board', 4, 0, '08:00 IN TIME')
  const panel = () => p.evaluate(() => (document.querySelector('#sbWarn') || {}).innerText.replace(/\s+/g, ' ').slice(0, 150))
  const model = async () => (await X.warns(p, 4)).filter(w => w.code === 'REPORT_ORDER').map(w => w.msg)
  /* Board, Tab */
  await X.setLine(p, 'board', 4, 1, '10:00 RALLY')        // typed, then Tab
  const b1 = await panel(), m1 = await model()
  pcs.push(await pic(p, 'find1-board-after-TAB'))
  /* Board, Enter on a new value */
  const el = p.locator('#schedBoard [data-itline="4|0|1"]:visible').first(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('10:05 RALLY', { delay: 8 }); await p.keyboard.press('Enter'); await sleep(900)
  const b2 = await panel(), m2 = await model()
  pcs.push(await pic(p, 'find1-board-after-ENTER'))
  /* Board, Tab again with a value that clears it */
  await X.setLine(p, 'board', 4, 1, '09:00 RALLY')
  const b3 = await panel(), m3 = await model()
  pcs.push(await pic(p, 'find1-board-clearing-TAB'))
  checks.push(['Board: Rally 10:00 typed and committed with Tab — the app holds the red warning (' + JSON.stringify(m1) + ') — the Board’s warning list reads: ' + JSON.stringify(b1), m1.length === 1 && /rally 10:00/.test(m1[0]) && /rally 10:00/.test(b1), ''])
  checks.push(['Board: the same kind of edit committed with Enter (Rally 10:05) — the list reads: ' + JSON.stringify(b2), /rally 10:05/.test(b2), JSON.stringify(m2)])
  checks.push(['Board: Rally corrected to 09:00 with Tab — the app holds ' + JSON.stringify(m3) + ' — the list reads: ' + JSON.stringify(b3), m3.length === 0 && !/rally 10/.test(b3), ''])
  /* the week's day bar */
  await X.boardOff(p); await F.go(p, 'editsched')
  const bar = async () => (await F.H.readList(p, '#eWeek', 4)).bar
  await X.setLine(p, 'week', 4, 1, '10:10 RALLY')
  const w1 = await bar(), wm1 = await model()
  await p.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="4"]'); if (b) b.scrollIntoView({ block: 'start', inline: 'center' }) }); await sleep(300)
  pcs.push(await pic(p, 'find1-week-after-TAB'))
  const el2 = p.locator('#eWeek [data-itline="4|0|1"]:visible').first(); await el2.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('10:20 RALLY', { delay: 8 }); await p.keyboard.press('Enter'); await sleep(900)
  const w2 = await bar()
  await p.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="4"]'); if (b) b.scrollIntoView({ block: 'start', inline: 'center' }) }); await sleep(300)
  pcs.push(await pic(p, 'find1-week-after-ENTER'))
  checks.push(['Week: Rally 10:10 committed with Tab — the app holds ' + JSON.stringify(wm1) + ' — Friday’s day bar reads: ' + JSON.stringify(w1), wm1.length === 1 && /issue|warning/.test(w1), ''])
  checks.push(['Week: Rally 10:20 committed with Enter — Friday’s day bar reads: ' + JSON.stringify(w2), /issue|warning/.test(w2), ''])
  judge('F-1 (Tab leaves warnings stale)', 'one out-of-order Rally line committed by Tab, by Enter and by clicking away, Board warning list and week day bar read each time', checks, pcs)
} catch (e) { row('F-1', 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await pic(p, 'find1-err') }
await c.browser.close()
F.savePart('find1-' + (process.env.F_RUN || 'x'), { errors: c.errors, pics: F.pics })
