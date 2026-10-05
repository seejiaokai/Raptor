/* H-F2 — the phone board's Desktop layout: the ⋯ menu at three positions of the sideways pan. Fresh phone world. */
import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: true })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(800)
await W.boardOn(p, 0); await L.sleep(800)
const tap = async sel => { const el = p.locator(sel).first(); const b = await el.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(600) }
await tap('#sbMore')
const labels0 = await p.evaluate(() => [...document.querySelectorAll('#sbMoreMenu button')].map(b => b.id + ':' + b.innerText.trim()))
console.log('menu items in phone layout', labels0)
await tap('#sbMoreWide'); await K.sleep(900)
const wide = await p.evaluate(() => ({ cls: document.querySelector('#schedBoard').className, vw: innerWidth, scrollW: document.querySelector('#schedBoard').scrollWidth, clientW: document.querySelector('#schedBoard').clientWidth }))
console.log('wide', JSON.stringify(wide))
const pc0 = await K.pic(p, 'HF2-0-desktop-layout')
const moreBox = () => p.evaluate(() => { const r = document.querySelector('#sbMore').getBoundingClientRect(); return { x: r.left, right: r.right, w: r.width, top: r.top, h: r.height, sl: document.querySelector('#schedBoard').scrollLeft, max: document.querySelector('#schedBoard').scrollWidth - document.querySelector('#schedBoard').clientWidth } })
const m0 = await moreBox()
console.log('more at scroll', JSON.stringify(m0))
const x0 = m0.x + m0.sl   // the button's place on the board at scroll 0
const setScroll = async v => { await p.evaluate(v => { document.querySelector('#schedBoard').scrollLeft = v }, v); await K.sleep(500) }
const targets = [['a-near-left', 8], ['b-middle', 170], ['c-right-edge', 390 - m0.w - 2]]
const rows = []
for (const [name, tx] of targets) {
  let want = Math.round(x0 - tx)
  await setScroll(Math.max(0, want))
  const m = await moreBox()
  const onScreen = m.x >= 0 && m.right <= 390
  // press the ⋯ button for real (a finger at its centre), then measure the menu
  const hitMore = await p.evaluate(() => { const e = document.querySelector('#sbMore'); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
  if (onScreen) await p.touchscreen.tap(m.x + m.w / 2, m.top + m.h / 2)
  await K.sleep(600)
  const menu = await p.evaluate(() => {
    const mn = document.querySelector('#sbMoreMenu'); if (!mn) return null
    const r = mn.getBoundingClientRect()
    const items = [...mn.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); const cx = q.left + q.width / 2, cy = q.top + q.height / 2; const inScreen = cx >= 0 && cx < innerWidth && cy >= 0 && cy < innerHeight; const h = inScreen ? document.elementFromPoint(cx, cy) : null; return { id: b.id, text: b.innerText.trim(), box: [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)], own: !!h && (h === b || b.contains(h)), wholeOnScreen: q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight } })
    return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw: innerWidth, vh: innerHeight, items, wholeOnScreen: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }
  })
  const pc = await K.pic(p, `HF2-${name}`)
  const pass = !!menu && menu.wholeOnScreen && menu.items.length >= 3 && menu.items.every(i => i.own && i.wholeOnScreen)
  console.log(name, JSON.stringify({ m, hitMore, menu }))
  rows.push({ name, m, hitMore, menu, pass, pc })
  if (menu) { await p.touchscreen.tap(m.x + m.w / 2, m.top + m.h / 2); await K.sleep(500) }   // ⋯ again shuts it
  if (await p.locator('#sbMoreMenu:visible').count()) { await p.keyboard.press('Escape'); await K.sleep(300) }
}
const fmt = r => `[${r.name}] ⋯ at ${Math.round(r.m.x)}..${Math.round(r.m.right)} (board scrolled ${Math.round(r.m.sl)} of ${Math.round(r.m.max)}), a finger on ⋯ lands on it: ${r.hitMore}; menu ${r.menu ? 'box ' + JSON.stringify(r.menu.box) + ' on a ' + r.menu.vw + 'x' + r.menu.vh + ' screen, whole on screen: ' + r.menu.wholeOnScreen + '; items: ' + r.menu.items.map(i => `${i.text} box ${JSON.stringify(i.box)} lands:${i.own} whole:${i.wholeOnScreen}`).join(' | ') : 'NOT OPEN'}`
K.note('H-F2', 'phone-390', 'Phone 390x844: Edit Schedule -> Monday on the Scheduler Board -> ⋯ -> Desktop layout; board panned by setting its own scroll position so ⋯ sits near the left / middle / hard against the right edge (wholly on screen); at each ⋯ pressed with a finger tap and the menu measured',
  rows.map(fmt).join('  ||  '), rows.every(r => r.pass) ? 'PASS' : 'FAIL', [pc0, ...rows.map(r => r.pc)])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
