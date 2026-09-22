/* [OIL-SEATS-CAN-EARN] walk — THE DOOR CHECK, both orders.
   bug-check-order.md §5/§7.4. Every gesture that can put a placeholder on a
   seat, driven in BOTH orders, on a jet (must refuse, WITH THE REASON ON
   SCREEN — D33) and on a seat it is legal on (must take). */
import { open, board, tap, shot, STATE } from './lib.mjs'
import { seatHolds, toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const JET = `${di}.1.0.1.p`          // empty SC MAIN cockpit seat
const DESK = `d:${di}.1.1.+`         // empty AVALON OPS O duty position

/* ---- ORDER 1: ARM THE SEAT FIRST, then choose from the palette ---------- */
console.log('=== ORDER 1 — arm the seat, then pick the puck ===')
await tap(page, `[data-slot="${JET}"]`)
await page.waitForTimeout(300)
const armedJet = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
const palRow = await page.evaluate(() => {
  const out = {}
  for (const id of ['allavail', 'all']) {
    const e = document.querySelector(`#sbRoster .rpuck[data-person="${id}"]`)
    if (!e) { out[id] = 'NOT ON PALETTE'; continue }
    const cs = getComputedStyle(e)
    out[id] = {
      cls: e.className,
      title: e.getAttribute('title') || e.parentElement?.getAttribute('title') || null,
      text: (e.innerText || '').trim(),
      opacity: cs.opacity, deco: cs.textDecorationLine, filter: cs.filter,
      pointer: cs.pointerEvents, visible: e.offsetParent !== null,
    }
  }
  return out
})
console.log('armed:', armedJet)
console.log('palette rows while a JET is armed:', JSON.stringify(palRow, null, 1))
await shot(page, 'DOOR-01-jet-armed-palette')
/* press it anyway — what does the app say? */
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(500)
console.log('after pressing ALL AVAIL on an armed jet: seat=', await seatHolds(page, JET), 'said=', await toast(page))
await shot(page, 'DOOR-02-jet-after-press')
await page.keyboard.press('Escape'); await page.waitForTimeout(200)

/* the same order on a seat it IS allowed on */
await tap(page, `[data-fill="${DESK}"]`)
await page.waitForTimeout(300)
const palOk = await page.evaluate(() => {
  const e = document.querySelector('#sbRoster .rpuck[data-person="allavail"]')
  const cs = getComputedStyle(e)
  return { cls: e.className, title: e.getAttribute('title'), opacity: cs.opacity, deco: cs.textDecorationLine }
})
console.log('palette row while a DESK is armed:', JSON.stringify(palOk))
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(500)
console.log('desk after press:', await seatHolds(page, DESK))
await page.keyboard.press('Escape'); await page.waitForTimeout(200)

/* ---- ORDER 2: DRAG FROM THE ROSTER onto the seat ------------------------ */
console.log('\n=== ORDER 2 — drag the puck from the crew palette onto the seat ===')
async function dragOnto(pid, key) {
  const src = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  const dst = page.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { err: 'no box', a: !!a, b: !!b }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + 20, a.y + 20, { steps: 4 })
  await page.waitForTimeout(150)
  /* what the app shows MID-DRAG, hovering the target — the drag ghost's reason */
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
  await page.waitForTimeout(250)
  const mid = await page.evaluate(() => {
    const g = document.querySelector('.dragghost, .ghost, [class*=ghost], .dropbar, .dropmsg')
    const t = [...document.querySelectorAll('[class*=no],[class*=bar],[class*=deny]')].filter(e => e.offsetParent !== null && /jet|crew a jet/i.test(e.innerText || '')).map(e => e.innerText.trim())
    return { ghost: g ? (g.innerText || '').trim().slice(0, 160) : null, ghostCls: g ? g.className : null, jetWords: t.slice(0, 3),
      bodyHasWords: /cannot crew a jet/i.test(document.body.innerText) }
  })
  await page.mouse.up()
  await page.waitForTimeout(500)
  return { mid, said: await toast(page), holds: await seatHolds(page, key) }
}
console.log('drag ALL AVAIL -> JET :', JSON.stringify(await dragOnto('allavail', JET), null, 1))
await shot(page, 'DOOR-03-after-drag-to-jet')
console.log('drag ALL -> JET      :', JSON.stringify(await dragOnto('all', JET), null, 1))

/* ---- ORDER 3: the append cells that would not arm ----------------------- */
console.log('\n=== The append cells that refused to arm in the roll-call ===')
for (const key of [`s:${di}.oft.0.+`, `s:${di}.amt.1.+`, `a:${di}.1.+`, `g:${di}.0.+`, `d:${di}.0.0.+`]) {
  const info = await page.evaluate(k => {
    const b = document.querySelector('#schedBoard')
    const e = b.querySelector(`[data-fill="${k}"]`)
    if (!e) return 'NOT DRAWN'
    const r = e.getBoundingClientRect()
    const mid = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return { box: { w: Math.round(r.width), h: Math.round(r.height) },
      pucksInside: e.querySelectorAll('[data-person]').length,
      atCentre: mid ? (mid.className || mid.tagName) + ' / ' + (mid.textContent || '').trim().slice(0, 24) : null,
      centreIsMe: mid === e || e.contains(mid) }
  }, key)
  console.log(' ', key, JSON.stringify(info))
}
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
