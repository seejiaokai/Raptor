import * as C from './appr-a-common.mjs'
const ENG = process.env.W12_ENGINE || 'webkit'
console.log('[appr-a-w12 v1]', ENG)
C.initLog(`appr-a-w12-${ENG}-log.txt`)
const { browser, page } = await C.launchPhone(ENG)
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T, pre = `w12-${ENG}-`
const view = () => P.evaluate(sel => {
  const vv = window.visualViewport; const se = document.scrollingElement
  const ls = [...document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`)]; const last = ls[ls.length - 1]; const lr = last?.getBoundingClientRect()
  return { innerW: innerWidth, innerH: innerHeight, vvH: vv ? +vv.height.toFixed(1) : null, scrollY: +scrollY.toFixed(1), room: +(se.scrollHeight - se.clientHeight).toFixed(1), docH: se.scrollHeight, lines: ls.length, lastBottom: lr ? +lr.bottom.toFixed(1) : null, lastTop: lr ? +lr.top.toFixed(1) : null, scroller: !!document.querySelector(`${sel} .appr-scroll`), bodyClass: document.body.className, card: (() => { const c = document.querySelector(`${sel} .appr-card`); if (!c) return null; const r = c.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1) } })() }
}, C.PAGE)
// scroll by real wheel / finger
async function scrollBy(dy) {
  if (ENG === 'chromium') {
    const cdp = P._cdp || (P._cdp = await P.context().newCDPSession(P))
    const y0 = await P.evaluate(() => scrollY)
    await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 500, yDistance: -dy, speed: 1200, gestureSourceType: 'touch' }).catch(e => C.note('gesture error ' + String(e).slice(0, 100)))
    await C.sleep(500)
    if ((await P.evaluate(() => scrollY)) === y0) { P._wheelUsed = true; await P.mouse.move(200, 500); await P.mouse.wheel(0, dy) }
  } else { await P.evaluate(d => window.scrollBy(0, d), dy) /* mobile WebKit takes no wheel and no scripted touch scroll (walk-scripts 4): the page is moved by the script's own scrollBy — said in the report */ }
  await C.sleep(700)
}
const g0 = await C.geo(P); const v0 = await view()
C.note('initial: ' + JSON.stringify(v0))
C.check('W12-layout', v0.innerW <= 700 && !v0.scroller && g0.scroller === null && v0.lines === 19 && !/lw-appr-on/.test(v0.bodyClass), `phone ${v0.innerW}x${v0.innerH}: no inner scroller (geo.scroller ${JSON.stringify(g0.scroller)}), lines ${v0.lines}, body "${v0.bodyClass}"`)
await C.shot(P, pre + '0-top')
// flick to foot and back
for (let i = 0; i < 12; i++) await scrollBy(500)
const v1 = await view(); await C.shot(P, pre + '1-foot')
C.note('at foot: ' + JSON.stringify(v1))
C.check('W12-foot', v1.scrollY > 100 && v1.room >= 0 && Math.abs(v1.scrollY - v1.room) <= 2 && v1.lastBottom !== null && v1.lastBottom <= v1.vvH + 0.5 && v1.lastTop >= 0, `page scrolled as a whole to its foot: scrollY ${v1.scrollY} of ${v1.room}; last line ${v1.lastTop}-${v1.lastBottom} within the screen (${v1.vvH}), card bottom ${v1.card?.bottom}`)
for (let i = 0; i < 12; i++) await scrollBy(-500)
const v2 = await view(); await C.shot(P, pre + '2-back-top')
C.check('W12-top', v2.scrollY <= 1, `flicked back: scrollY ${v2.scrollY}`)
// every line reachable: scroll each line into view by wheel/finger? check each line's box vs doc: top within [0, docH] trivial; instead check last line reachable shown above
// decide a line (tap)
const idx = 3
const before = await C.lineInfo(P, idx)
await C.nthLine(P, idx).locator(T('appr-approve')).scrollIntoViewIfNeeded()
const pre1 = await view()
await C.nthLine(P, idx).locator(T('appr-approve')).tap(); await C.sleep(120)
await C.shot(P, pre + '3-decide-right-after')
await C.sleep(700); await C.shot(P, pre + '3-decide-settled')
const after = await C.lineInfo(P, idx); const v3 = await view()
C.note('decide: ' + JSON.stringify({ before: before.approve, after: after.approve, pressed: after.apPressed, scrollY: [pre1.scrollY, v3.scrollY], counts: await C.counts(P) }))
C.check('W12-decide', after.approve === 'Approved' && Math.abs(v3.scrollY - pre1.scrollY) <= 1, `tap Approve: "${before.approve}" -> "${after.approve}", page did not jump (scrollY ${pre1.scrollY} -> ${v3.scrollY}), counts ${JSON.stringify(await C.counts(P))}`)
// month chip
await P.locator(T('appr-m-2026-02')).scrollIntoViewIfNeeded()
await P.locator(T('appr-m-2026-02')).tap(); await C.sleep(120); await C.shot(P, pre + '4-month-right-after'); await C.sleep(700); await C.shot(P, pre + '4-month-settled')
const v4 = await view(); const chipOn = await P.evaluate(() => [...document.querySelectorAll('.appr-filters .appr-f.on')].map(e => e.innerText.trim()))
C.note('after Feb chip: ' + JSON.stringify({ lines: v4.lines, chipOn, scrollY: v4.scrollY, room: v4.room, scroller: v4.scroller }))
C.check('W12-month', v4.lines > 0 && v4.lines < 19 && chipOn.includes('Feb') && !v4.scroller, `Feb chip: ${v4.lines} lines, chip on ${JSON.stringify(chipOn)}, still no inner scroller`)
// shortened list: scroll to foot, last line reachable
for (let i = 0; i < 6; i++) await scrollBy(500)
const v5 = await view(); await C.shot(P, pre + '5-month-foot')
C.check('W12-month-foot', v5.lastBottom <= v5.vvH + 0.5 && v5.lastTop >= 0, `Feb list foot: last line ${v5.lastTop}-${v5.lastBottom} within ${v5.vvH}, scrollY ${v5.scrollY}/${v5.room}`)
await P.locator(T('appr-all')).scrollIntoViewIfNeeded(); await P.locator(T('appr-all')).tap(); await C.sleep(800)
// dates and Back (the month chip changed the dates, so the earlier decided line has left the list — D1421; decide a fresh one first)
const idx2 = 4
await C.nthLine(P, idx2).locator(T('appr-approve')).scrollIntoViewIfNeeded()
await C.nthLine(P, idx2).locator(T('appr-approve')).tap(); await C.sleep(700)
C.note('fresh decided line ' + idx2 + ': ' + JSON.stringify(await C.lineInfo(P, idx2)))
const dl = C.nthLine(P, 6).locator(T('appr-dates'))
await dl.scrollIntoViewIfNeeded()
const yBefore = (await view()).scrollY
await dl.tap(); await C.sleep(150); await C.shot(P, pre + '6-dates-right-after'); await C.sleep(1100); await C.shot(P, pre + '6-grid-settled')
const slim = await P.locator(T('appr-slim')).count()
C.note('after dates tap: slim bar ' + slim + ' ring ' + JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('.lw-ring')].map(e => e.dataset.testid).slice(0, 3))))
await P.locator(T('appr-back')).tap(); await C.sleep(150); await C.shot(P, pre + '7-back-right-after'); await C.sleep(1000); await C.shot(P, pre + '7-back-settled')
const g8 = await C.geo(P); const v8 = await view()
const decided = await C.lineInfo(P, idx2)
C.note(`back: Approvals up lines ${v8.lines} scrollY ${v8.scrollY} (was ${yBefore}) scroller ${v8.scroller} decided line "${decided.approve}"`)
C.check('W12-back', slim === 1 && v8.lines > 0 && !v8.scroller && decided.approve === 'Approved', `dates -> grid with slim bar (${slim}), Back -> Approvals: ${v8.lines} lines, no inner scroller, decided line "${decided.approve}", scrollY ${yBefore} -> ${v8.scrollY}`)
C.note('errors ' + JSON.stringify(errs)); C.check('W12-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
