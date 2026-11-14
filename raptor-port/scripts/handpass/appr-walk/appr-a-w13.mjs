import * as C from './appr-a-common.mjs'
console.log('[appr-a-w13 v1]')
const TAG = process.env.W13_TAG || 'after'
C.initLog(`appr-a-w13-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
await P.locator(T('lw-tab-balances')).first().click(); await C.sleep(1200)
const SC = '[data-testid="bal-scroll"].bp-scroll'
const m = () => P.evaluate(sc => {
  const e = document.querySelector(sc); const se = document.scrollingElement
  if (!e) return { none: true, count: document.querySelectorAll('[data-testid="bal-scroll"]').length, room: se.scrollHeight - se.clientHeight }
  const r = e.getBoundingClientRect()
  return { inner: innerHeight, trueH: window.visualViewport ? +(window.visualViewport.height * window.visualViewport.scale).toFixed(2) : null, winRoom: +(se.scrollHeight - se.clientHeight).toFixed(2), scrollY: scrollY, top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), st: +e.scrollTop.toFixed(2), room: +(e.scrollHeight - e.clientHeight).toFixed(2), n: document.querySelectorAll('[data-testid="bal-scroll"]').length }
}, SC)
C.note('first: ' + JSON.stringify(await m()))
await C.shot(P, `w13-${TAG}-balances-917`)
const hs = [905, 906, 907, 908, 909, 910, 911]
for (const h of hs) {
  await setWin(1550, h)
  const m0 = await m()
  const r = await P.evaluate(sc => { const e = document.querySelector(sc); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, SC)
  await P.evaluate(sc => { document.querySelector(sc).scrollTop = 0 }, SC); await C.sleep(150) // placing the list at its top BEFORE the step
  await P.mouse.move(r.x, r.y)
  for (let i = 0; i < 14; i++) { await P.mouse.wheel(0, 400); await C.sleep(60) }
  await C.sleep(500)
  const foot = await m()
  await P.mouse.wheel(0, -200); await C.sleep(300)
  const up = await m()
  const frac = m0.trueH != null && Math.abs(m0.trueH - Math.round(m0.trueH)) > 0.01
  C.note(`h${h}: true ${m0.trueH}${frac ? ' (fraction)' : ''}, winRoom ${m0.winRoom}, list room ${m0.room}, at foot ${foot.st}/${foot.room} winY ${foot.scrollY}, up ${up.st} winY ${up.scrollY}, scroller bottom ${m0.bottom}`)
  C.check(`W13-h${h}-room`, m0.winRoom <= 0 && foot.winRoom <= 0, `window room ${m0.winRoom}/${foot.winRoom}`)
  C.check(`W13-h${h}-wheel`, foot.st >= foot.room - 1 && foot.scrollY === 0 && up.st < foot.st && up.scrollY === 0, `foot ${foot.st} of ${foot.room}, then up at once ${foot.st} -> ${up.st}, window ${up.scrollY}`)
}
await C.shot(P, `w13-${TAG}-balances-911`)
C.note('errors ' + JSON.stringify(errs)); C.check('W13-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
