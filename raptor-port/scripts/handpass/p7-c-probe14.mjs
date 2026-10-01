/* p7 walker C — probe 14: the phone, View-only Sched — what a finger tap on the count chip delivers to the page
   (which events, on which element), three ways of tapping; and the same on the board, where the window opens. */
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
const spy = () => p.evaluate(() => { window.__ev = []; if (window.__evOn) return; window.__evOn = true
  for (const t of ['touchstart', 'touchend', 'touchcancel', 'pointerdown', 'pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click'])
    document.addEventListener(t, e => window.__ev.push(`${e.type}${e.pointerType ? '(' + e.pointerType + ')' : ''}@${Math.round(e.clientX ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : -1))},${Math.round(e.clientY ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : -1))}→${(e.target.className || e.target.tagName).toString().slice(0, 24)}${e.defaultPrevented ? ' [prevented]' : ''}`), true) })
const evs = () => p.evaluate(() => { const a = window.__ev; window.__ev = []; return a })
const cdp = await p.context().newCDPSession(p)
async function tryAll(label, scope) {
  const c = p.locator(`${scope} .oilcount:visible`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  const b = await c.boundingBox(); const x = b.x + b.width / 2, y = b.y + b.height / 2
  await spy()
  console.log(label, 'chip box', JSON.stringify(b), 'aim', Math.round(x), Math.round(y), 'viewport', JSON.stringify(await p.evaluate(() => ({ iw: innerWidth, ih: innerHeight, vvScale: visualViewport.scale, vvW: visualViewport.width, vvLeft: visualViewport.offsetLeft, vvTop: visualViewport.offsetTop, docW: document.documentElement.scrollWidth, sx: scrollX, sy: scrollY, puck: (() => { const pk = document.querySelector('#vWeek .day[data-day="2"] [data-person="allavail"]'); if (!pk) return null; const r = pk.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] })() }))))
  for (const [how, fn] of [
    ['locator.tap()', async () => c.tap({ timeout: 3000 })],
    ['touchscreen.tap(x,y)', async () => p.touchscreen.tap(x, y)],
    ['a held touch: down, 90 ms, up', async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await L.sleep(90); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }],
    ['mouse click', async () => p.mouse.click(x, y)],
  ]) {
    await C.closeWin(p); await p.evaluate(() => { window.__ev = [] })
    /* let go of any selection the last try left */
    await fn().catch(e => console.log('   err', e.message.split('\n')[0])); await L.sleep(700)
    const w = await C.win(p)
    console.log(`${label} · ${how}: window ${w.open ? 'OPEN' : 'not open'}; selected pucks ${await p.evaluate(() => document.querySelectorAll('.puck.sel').length)}; events: ${(await evs()).join(' , ')}`)
    await C.closeWin(p)
    const sel = p.locator('.puck.sel:visible').first(); if (await sel.count()) { await p.keyboard.press('Escape'); await L.sleep(200) }
  }
}
await p.locator('#schedBoard .oilcount:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' }))
await tryAll('BOARD', '#schedBoard')
await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, 2, '#vWeek')
await tryAll('VIEW-ONLY SCHED', '#vWeek .day[data-day="2"]')
console.log('errors', errors)
await browser.close()
