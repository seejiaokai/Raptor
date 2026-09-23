/* Walker w3's shared helpers — [HUMAN-RETEST] Tracker, 23 Sep 26.
   Everything here acts through the app's own controls the way a person does:
   a real pointer press (mouse or a finger via the browser's own touch input),
   a dropdown pressed before its option is chosen, a menu opened before its
   item. The only reads of the app's state are for CHECKING what a screen
   claims (the driver's `core()`), never to set anything up. */
import { reveal, dlg } from './trk-lib.mjs'

export const sleep = ms => new Promise(r => setTimeout(r, ms))

/** the ball's element, by its event id */
export const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()

/** Tap a ball's CENTRE with the mouse (the selected student's own tap). */
export async function tapBall(page, id, { touch = false } = {}) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox()
  if (!b) throw new Error('no ball ' + id)
  if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(400)
  return b
}

/** A dropdown the way a person uses it: press it, then choose the option
    whose visible text matches. */
export async function pickFrom(page, sel, labelRe) {
  await page.click(sel); await sleep(150)
  const v = await page.evaluate(({ sel, src, flags }) => {
    const re = new RegExp(src, flags)
    const o = [...document.querySelector(sel).options].find(o => re.test(o.textContent))
    return o ? o.value : null
  }, { sel, src: labelRe.source, flags: labelRe.flags })
  if (v == null) throw new Error('no option ' + labelRe + ' in ' + sel)
  await page.selectOption(sel, v); await sleep(700)
  return v
}

/** Open one of the bar's ✎ menus (course | syl | file) and press an item. */
export async function menuItem(page, menu, itemId) {
  await page.click(`#${menu}MenuBtn`)
  await page.waitForSelector(`#${itemId}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${itemId}`)
  await sleep(300)
}

/** Is the app's own question box up? Its text if so. */
export async function dlgText(page) {
  if (!(await page.locator('#dlgModal').isVisible().catch(() => false))) return null
  return (await page.locator('#dlgMsg').innerText().catch(() => '')).trim()
}

/** Press a specific button of the question box by its label. */
export async function dlgPress(page, labelRe) {
  const b = page.locator('#dlgModal button:visible').filter({ hasText: labelRe }).first()
  if (!(await b.count())) throw new Error('no dlg button ' + labelRe)
  await b.click(); await sleep(350)
}

export { dlg }

/** A finger held down for `ms`, through the browser's own touch input (CDP
    Input.dispatchTouchEvent — the same path a phone's touchscreen takes).
    Returns after the finger lifts. */
export async function longPress(page, x, y, ms = 700) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  await sleep(ms)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach().catch(() => {})
  await sleep(250)
}

/** A finger drag from (x0,y0) to (x1,y1), in steps. */
export async function touchDrag(page, x0, y0, x1, y1, steps = 10) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
  await sleep(60)
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps, id: 1 }] })
    await sleep(30)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach().catch(() => {})
  await sleep(300)
}

/** Bounding box of the first match, rounded; null when absent/hidden. */
export async function box(page, sel) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return null
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    if (!r.width || !r.height || cs.display === 'none' || cs.visibility === 'hidden') return null
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) }
  }, sel)
}

/** Is it really visible to a person: has a box, and is the topmost thing at
    its own centre (nothing painted over it)? */
export async function onTop(page, sel) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return { exists: false }
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return { exists: true, shown: false }
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const hit = document.elementFromPoint(x, y)
    const name = e => e ? (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '')) : null
    return { exists: true, shown: true, top: !!hit && (el === hit || el.contains(hit)), hit: name(hit), inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth }
  }, sel)
}

/** The details bubble as a person sees it. */
export async function bubble(page) {
  return page.evaluate(() => {
    const b = document.getElementById('detailBubble')
    if (!b || getComputedStyle(b).display === 'none') return { shown: false }
    const r = b.getBoundingClientRect()
    return { shown: true, text: b.innerText.replace(/\s+/g, ' ').slice(0, 200), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
  })
}

/** Which of the phone's two halves are showing. */
export async function halves(page) {
  return page.evaluate(() => {
    const vis = sel => { const el = document.querySelector(sel); if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' }
    const root = document.querySelector('#page-tracker .tr-root')
    return { flow: vis('#page-tracker .boardcol'), info: vis('#page-tracker .sidecol'), tabs: vis('#viewtabs'), rootCls: root ? root.className : null, w: innerWidth }
  })
}

/** Remove the driver's default dialog handler (it dismisses everything) so a
    script can answer a native dialog itself. */
export function takeDialogs(page, handler) {
  page.removeAllListeners('dialog')
  page.on('dialog', handler)
}
