/* p7 walker C — probe 13: the phone — a finger tap on the ALL AVAIL count chip on View-only Sched (does the window open?). */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: true })
await C.toastSpy(p)
/* fixture on the phone itself: Wednesday board, MAINT CONF's "+ add" → ALL AVAIL (arming opens the crew drawer) */
await W.boardOn(p, 2)
const z = p.locator('#schedBoard [data-fill="g:2.0.+"]:visible').first()
await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
const pt = await p.evaluate(() => { const z = document.querySelector('#schedBoard [data-fill="g:2.0.+"]'); const a = z.querySelector('.addz'); const zr = z.getBoundingClientRect(); const ar = a.getBoundingClientRect(); const seats = [...z.querySelectorAll('.seat')]; const last = seats.length ? seats[seats.length - 1].getBoundingClientRect() : null
  return ar.width > 4 && ar.height > 4 ? { x: ar.left + ar.width / 2, y: ar.top + ar.height / 2, how: 'addz' } : { x: Math.min(zr.right - 6, (last ? last.right : zr.left) + 18), y: last ? last.top + last.height / 2 : zr.top + zr.height / 2, how: 'beside' } })
await p.touchscreen.tap(pt.x, pt.y); await L.sleep(600)
console.log('armed', await p.evaluate(() => window.armedKey()), pt.how)
await p.locator('#sbRoster .rpuck[data-person="allavail"]').first().tap(); await L.sleep(600)
console.log('row', JSON.stringify(await p.evaluate(() => window.DAYS[2].ground[0])), await C.toasts(p))
await p.keyboard.press('Escape')
for (const [surf, scope] of [['board', '#schedBoard'], ['viewsched', '#vWeek .day[data-day="2"]'], ['editsched', '#eWeek .day[data-day="2"]']]) {
  if (surf !== 'board') { await W.boardOff(p); await L.go(p, surf); await W.showDay(p, 2, surf === 'viewsched' ? '#vWeek' : '#eWeek') }
  /* shut the crew drawer if it is open (its own tab) */
  const c = p.locator(`${scope} .oilcount:visible`).first()
  console.log(surf, 'chips', await c.count())
  if (!(await c.count())) continue
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  const info = await c.evaluate(e => { const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const h = document.elementFromPoint(x, y); return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], at: h ? h.tagName + '.' + h.className : null, same: h === e || e.contains(h) } })
  console.log(surf, 'chip box / what is under its middle', JSON.stringify(info))
  await c.tap({ timeout: 3000 }).catch(e => console.log('tap err', e.message.split('\n')[0])); await L.sleep(700)
  let w = await C.win(p)
  console.log(surf, 'after a finger TAP: window open', w.open, w.open ? JSON.stringify(w.rect) : '', 'selected pucks', await p.evaluate(() => document.querySelectorAll('.puck.sel').length))
  await L.shot(p, `probe13-${surf}-tap`)
  if (!w.open) { await c.click({ timeout: 3000 }).catch(e => console.log('click err', e.message.split('\n')[0])); await L.sleep(700); w = await C.win(p); console.log(surf, 'after a mouse CLICK: window open', w.open, w.open ? JSON.stringify(w.rect) : ''); await L.shot(p, `probe13-${surf}-click`) }
  await C.closeWin(p)
}
console.log('errors', errors)
await browser.close()
