/* a phone on its side (844x390): the question on the board and the week, and the Insights window with Show all */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const pics = []; const log = []
const { browser, p } = await C.world({ w: 844, h: 390, phone: true })
try {
  await p.setViewportSize({ width: 844, height: 390 })
  await C.tracking(p, true)
  for (const ed of ['Board', 'Week']) {
    if (ed === 'Board') await C.board(p, 0); else await C.toWeek(p, 0)
    await C.fset(p, 'ff:0.0.0.msn', 'ACM'); await C.fset(p, 'fr:0.0.0.0', ed === 'Board' ? 'DS FOR RU' : 'DS FROM RU')
    const q = await C.question(p)
    await p.locator('.mission-role-question').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.sleep(300)
    const r = await C.reach(p)
    pics.push(await C.pic(p, 'l-' + ed + '-question'))
    await C.side(p, 'red')
    log.push(`${ed} at 844×390: questions ${q.nQ}; finger reach ${r}`)
  }
  // Insights window short screen
  await W.boardOff(p); await L.go(p, 'editsched')
  const barOn = await p.locator('#insightBtn:visible').count()
  if (barOn) await p.locator('#insightBtn').click(); else { await p.locator('#editSchedMore').click(); await C.sleep(250); await p.locator('#editSchedMoreInsights').click() }
  await p.waitForSelector('#insightBody', { state: 'visible' }); await C.sleep(400)
  await p.locator('[data-insights-all]:visible').first().click(); await C.sleep(300)
  await p.locator('#insightBody').evaluate(e => { const sc = e.closest('.modal, #insightModal') || e; (e.scrollHeight > e.clientHeight ? e : sc).scrollTop = 99999 }); await C.sleep(300)
  const cross = await p.locator('#insightClose').evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { onTop: h === e || e.contains(h), inScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, top: Math.round(r.top) } })
  pics.push(await C.pic(p, 'l-insights-scrolled'))
  await p.locator('#insightClose').click(); await C.sleep(300)
  log.push(`Insights at 844×390 (direct door ${barOn ? 'on the bar' : 'via ⋯ menu'}), scrolled to the bottom with Show all: close cross ${J(cross)}; window closed: ${await p.locator('#insightModal:visible').count() === 0}`)
  C.row('P3-short', 'PARTIAL-SIZE EXTRA: 844×390 — the question on the Board and Edit Schedule week and the Insights window scrolled to the bottom',
    log.join(' || '), 'CHECK', pics)
} catch (e) { C.row('P3-short', 'aborted', String(e.stack || e).slice(0, 900) + log.join(' || '), 'FAIL', [await C.pic(p, 'l-error')]) }
finally { await browser.close() }
console.log('ERRORS', J(C.ERR))
C.save('l')
