import * as C from './appr-a-common.mjs'
console.log('[appr-a-f5x v1]')
const TAG = process.env.F5X_TAG || 'fix1'
C.initLog(`appr-a-f5x-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
await P.locator(T('appr-pick')).click(); await C.sleep(900)
await P.locator(T('appr-pick')).focus(); await C.sleep(150)
for (let i = 0; i < 8; i++) {
  await P.keyboard.press('Tab'); await C.sleep(200)
  const f = await P.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { tid: e.dataset.testid || e.tagName, x: r.left, y: r.top, w: r.width, h: r.height, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 80), bg: cs.backgroundColor, focusVisible: e.matches(':focus-visible') } })
  C.note(JSON.stringify(f))
  if (/range-(title|day)/.test(f.tid)) await C.shot(P, `f5x-${TAG}-${f.tid.replace('appr-range-', '')}`, { x: Math.max(0, f.x - 40), y: Math.max(0, f.y - 30), width: 300, height: 110 })
}
C.note('errors ' + JSON.stringify(errs))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
