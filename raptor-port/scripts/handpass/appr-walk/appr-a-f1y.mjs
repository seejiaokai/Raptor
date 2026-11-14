import * as C from './appr-a-common.mjs'
console.log('[appr-a-f1y v1]')
const TAG = process.env.F1Y_TAG || 'fix1'
C.initLog(`appr-a-f1y-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
await setWin(1550, 560)
await P.locator(T('appr-pick')).click(); await C.sleep(900)
const probe = () => P.evaluate(sel => { const e = document.activeElement; if (!e || e === document.body) return { tid: 'none' }; const r = e.getBoundingClientRect(); const sc = document.querySelector(`${sel} .appr-scroll`) || document.querySelector(sel); const card = document.querySelector(`${sel} .appr-card`); const se = document.scrollingElement; const cb = card.getBoundingClientRect(); const scr = sc.getBoundingClientRect(); return { tid: (e.dataset.testid || e.tagName).replace('appr-range-day-2026-', ''), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), onScreen: r.top >= 0 && r.bottom <= innerHeight, inCard: r.top >= cb.top && r.bottom <= cb.bottom - 28, inBox: r.top >= scr.top && r.bottom <= scr.bottom, scTop: +sc.scrollTop.toFixed(1), cardScrollTop: card.scrollTop, winY: scrollY, winRoom: se.scrollHeight - se.clientHeight } }, C.PAGE)
await P.locator(T('appr-pick')).focus(); await C.sleep(150)
let p = null
for (let i = 0; i < 12; i++) { await P.keyboard.press('Tab'); await C.sleep(100); p = await probe(); if (/^01-/.test(p.tid)) break }
C.note('on day: ' + JSON.stringify(p))
const out = []
for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown']) { await P.keyboard.press(k); await C.sleep(250); const q = await probe(); out.push(q); C.note(k + ' -> ' + JSON.stringify(q)) }
await C.shot(P, `f1y-${TAG}-560-arrows`)
C.note('errors ' + JSON.stringify(errs))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
