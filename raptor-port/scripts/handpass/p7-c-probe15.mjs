/* p7 walker C — probe 15: the phone week views — where on and around the count chip a finger must land for the window
   to open (several points, two finger sizes), on View-only Sched and on Edit Schedule; and why the board differs. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: true })
await W.boardOn(p, 2)
const z = p.locator('#schedBoard [data-fill="g:2.0.+"]:visible').first()
await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
const a = await p.locator('#schedBoard [data-fill="g:2.0.+"] .addz').first().boundingBox()
await p.touchscreen.tap(a.x + a.width / 2, a.y + a.height / 2); await L.sleep(600)
await p.locator('#sbRoster .rpuck[data-person="allavail"]').first().tap(); await L.sleep(600)
await p.keyboard.press('Escape')
const cdp = await p.context().newCDPSession(p)
const styleOf = scope => p.evaluate(s => { const c = document.querySelector(s + ' .oilcount'); if (!c) return null; const cs = getComputedStyle(c); const pk = c.closest('.seat') ? c.closest('.seat').querySelector('.puck') : null; const pr = pk ? pk.getBoundingClientRect() : null; const r = c.getBoundingClientRect()
  return { chip: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], cursor: cs.cursor, tabindex: c.getAttribute('tabindex'), role: c.getAttribute('role'), tag: c.tagName, puck: pr ? [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width), Math.round(pr.height)] : null, parent: c.parentElement.className } }, scope)
async function sweep(label, scope) {
  const c = p.locator(`${scope} .oilcount:visible`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  console.log(label, JSON.stringify(await styleOf(scope)))
  const b = await c.boundingBox()
  for (const [name, dx, dy] of [['centre', b.width / 2, b.height / 2], ['bottom edge', b.width / 2, b.height - 1], ['bottom-right corner', b.width - 2, b.height - 2], ['6 px below the chip', b.width / 2, b.height + 6]]) {
    for (const r of [1, 12]) {
      await C.closeWin(p)
      const x = b.x + dx, y = b.y + dy
      await p.evaluate(() => { window.__md = null; document.addEventListener('click', e => { window.__md = `${Math.round(e.clientX)},${Math.round(e.clientY)}→${(e.target.className || e.target.tagName).toString().slice(0, 20)}` }, { capture: true, once: true }) })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1, radiusX: r, radiusY: r, force: 0.5 }] }); await L.sleep(70)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await L.sleep(650)
      const w = await C.win(p)
      console.log(`  ${label} · finger at the chip's ${name} (${Math.round(x)},${Math.round(y)}), contact radius ${r}px → window ${w.open ? 'OPEN' : 'not open'}; the click arrived at ${await p.evaluate(() => window.__md)}`)
      await C.closeWin(p)
      for (let i = 0; i < 2 && await p.evaluate(() => document.querySelectorAll('.puck.sel').length); i++) { await p.keyboard.press('Escape'); await L.sleep(150) }
    }
  }
}
await p.locator('#schedBoard .oilcount:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' }))
await sweep('BOARD', '#schedBoard')
await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, 2, '#vWeek')
await sweep('VIEW-ONLY SCHED', '#vWeek .day[data-day="2"]')
await L.go(p, 'editsched'); await W.showDay(p, 2, '#eWeek')
await sweep('EDIT SCHEDULE', '#eWeek .day[data-day="2"]')
console.log('errors', errors)
await browser.close()
