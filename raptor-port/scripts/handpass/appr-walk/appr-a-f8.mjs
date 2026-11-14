// The fix read's finding, re-walked (13 Nov 26): on a narrow PC, the box scrolled sideways to reach Approve and Refuse,
// "Pick dates…" opens its calendar in sight, and a chip shows the new list from the box's left. Real window at 125%, the
// sideways place reached by the real wheel with Shift held.
import * as C from './appr-a-common.mjs'
console.log('[appr-a-f8 v1]')
C.initLog('appr-a-f8-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
const X = () => P.evaluate(sel => { const sc = document.querySelector(`${sel} .appr-scroll`); const s = sc.getBoundingClientRect(); const pk = document.querySelector('[data-testid="appr-range-picker"]'); const p = pk && pk.getBoundingClientRect(); return { left: sc.scrollLeft, room: sc.scrollWidth - sc.clientWidth, pickIn: p ? +(Math.min(p.right, s.left + sc.clientWidth) - Math.max(p.left, s.left)).toFixed(0) : null, pickW: p ? +p.width.toFixed(0) : null } }, C.PAGE)
for (const w of [820, 1000]) {
  await setWin(w, 760)
  const m = await C.scMid(P); await P.mouse.move(m.x, m.y)
  await P.keyboard.down('Shift'); for (let i = 0; i < 8; i++) { await P.mouse.wheel(0, 120); await C.sleep(80) } await P.keyboard.up('Shift')
  await C.sleep(300); const a = await X()
  await C.shot(P, `f8-${w}-0-sideways`)
  await P.locator(T('appr-pick')).click(); await C.sleep(600)
  const b = await X(); await C.shot(P, `f8-${w}-1-pick-open`)
  C.check(`F8-${w}-pick`, a.left > 100 && b.left === 0 && b.pickIn >= b.pickW - 1, `scrolled sideways by ${a.left} of ${a.room}; "Pick dates…" pressed: the box at ${b.left} sideways, the calendar ${b.pickIn} of its ${b.pickW}px in sight`)
  await P.locator(T('appr-pick')).click(); await C.sleep(400)
  await P.mouse.move(m.x, m.y)
  await P.keyboard.down('Shift'); for (let i = 0; i < 8; i++) { await P.mouse.wheel(0, 120); await C.sleep(80) } await P.keyboard.up('Shift')
  await C.sleep(300); const c = await X()
  await P.locator(T('appr-m-2026-02')).click(); await C.sleep(600)
  const d = await X(); await C.shot(P, `f8-${w}-2-feb`)
  C.check(`F8-${w}-chip`, c.left > 100 && d.left === 0, `scrolled sideways by ${c.left}; Feb pressed: the new list from the box's left (${d.left})`)
  await P.locator(T('appr-all')).click(); await C.sleep(400)
}
C.note('errors ' + JSON.stringify(errs)); C.check('F8-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
