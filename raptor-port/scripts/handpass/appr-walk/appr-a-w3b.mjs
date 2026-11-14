import * as C from './appr-a-common.mjs'
console.log('[appr-a-w3b v1]')
const TAG = process.env.W3B_TAG || 'after'
C.initLog(`appr-a-w3b-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
await setWin(1550, 560)
await P.locator(T('appr-pick')).click(); await C.sleep(800)
const st = () => P.evaluate(sel => {
  const card = document.querySelector(`${sel} .appr-card`), pg = document.querySelector(sel), sc = document.querySelector(`${sel} .appr-scroll`)
  const d30 = document.querySelector('[data-testid="appr-range-day-2026-01-30"]'); const r = d30?.getBoundingClientRect()
  const se = document.scrollingElement
  return { winY: scrollY, winRoom: se.scrollHeight - se.clientHeight, cardScrollTop: card?.scrollTop, pageScrollTop: pg?.scrollTop, scTop: sc?.scrollTop, inner: innerHeight, d30: r ? { t: +r.top.toFixed(0), b: +r.bottom.toFixed(0) } : null, hitAtD30: r ? (() => { const h = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); return h ? (h.dataset.testid || h.className || h.tagName) : 'none' })() : null }
}, C.PAGE)
C.note('picker open at 560: ' + JSON.stringify(await st()))
const pk = await P.locator(T('appr-range-picker')).boundingBox()
await P.mouse.move(pk.x + 150, pk.y + 100)
for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, 120); await C.sleep(200) }
C.note('after 4 wheel ticks over the picker: ' + JSON.stringify(await st()))
await P.mouse.move(700, 400)
for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, 120); await C.sleep(200) }
C.note('after 4 wheel ticks beside the picker (700,400): ' + JSON.stringify(await st()))
await C.shot(P, `w3b-${TAG}-560-after-wheels`)
// keyboard: tab into the picker's last days
await P.locator(T('appr-range-day-2026-01-12')).focus();
for (let i = 0; i < 12; i++) await P.keyboard.press('Tab')
C.note('after 12 Tab: ' + JSON.stringify(await st()) + ' focus=' + await P.evaluate(() => document.activeElement?.dataset?.testid))
await C.shot(P, `w3b-${TAG}-560-after-tab`)
C.note('errors ' + JSON.stringify(errs))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
