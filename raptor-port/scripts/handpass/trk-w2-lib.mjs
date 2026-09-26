/* [HUMAN-RETEST] Tracker — walker w2's small helpers, on top of trk-lib.mjs.
   Everything here PRESSES the app's own controls the way a person does (a real
   pointer press, typed keys) or READS what the screen shows; the store is only
   ever read to check a claim (collectStudents = the Export's own collector). */
import { reveal, login, toTracker } from './trk-lib.mjs'

export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
export const popOpen = page => page.locator('#pop').isVisible().catch(() => false)
export const popTitle = async page => ((await page.locator('#popTitle').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()

/* The ball's TRUE centre — its hit disc (the first circle in the group), not
   the group's box, which the number badge and rings pull off-centre. */
export async function centreOf(page, id) {
  return page.evaluate(id => {
    const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
    const c = g.querySelector(':scope > circle'); const r = (c || g).getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, id)
}
/** A press on a ball's centre (grades the picked student). Brings it into view first. */
export async function tapBall(page, id, { noReveal = false } = {}) {
  if (!noReveal) await reveal(page, id)
  const c = await centreOf(page, id); if (!c) throw new Error('no ball ' + id)
  await page.mouse.click(c.x, c.y); await sleep(350)
}
/** A screen point inside wedge `wi` of a ball, where that wedge is what a press hits. */
export async function wedgePoint(page, id, wi) {
  return page.evaluate(({ id, wi }) => {
    const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
    const w = g.querySelector(`path.wedge[data-wi="${wi}"]`); if (!w) return null
    const c = g.querySelector(':scope > circle').getBoundingClientRect(); const cx = c.left + c.width / 2, cy = c.top + c.height / 2
    const r = w.getBoundingClientRect(); let best = null
    for (let fy = 0.05; fy < 0.96; fy += 0.05) for (let fx = 0.05; fx < 0.96; fx += 0.05) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy
      if (document.elementFromPoint(x, y) !== w) continue
      /* prefer the middle of the ring band, away from the edges */
      const d = Math.abs(Math.hypot(x - cx, y - cy) - c.width * 0.4)
      if (!best || d < best.d) best = { x, y, d }
    }
    return best
  }, { id, wi })
}
/** What each wedge of a ball is filled with, in roster order. */
export const wedges = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null
}, id)
/** Red failure ticks drawn on a ball. */
export const ticks = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  return g ? g.querySelectorAll('line.ftick').length : null
}, id)
/** The picked student's edge on a ball: which wedge, its fill and stroke. */
export const mine = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  const m = g && g.querySelector('path.mine')
  return m ? { wi: m.dataset.wi, fill: m.getAttribute('fill'), stroke: m.getAttribute('stroke'), width: m.getAttribute('stroke-width') } : null
}, id)
/** Every ball wearing the yellow "can be planned next" ring. */
export const ringed = page => page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].filter(g => g.querySelector('circle.avail')).map(g => g.dataset.id))
export const undoState = page => page.evaluate(() => {
  const u = document.getElementById('trUndoBtn'), r = document.getElementById('trRedoBtn')
  return { undo: u ? { off: u.disabled, t: u.title } : null, redo: r ? { off: r.disabled, t: r.title } : null }
})
export const stackDepth = page => page.evaluate(() => { const u = window.__undoForTests && window.__undoForTests(); return u ? { undo: u.undo, redo: u.redo } : null })
export const scrollOf = page => page.evaluate(() => { const b = document.getElementById('board'); return b ? { top: Math.round(b.scrollTop), left: Math.round(b.scrollLeft) } : null })
/** How far a ball's centre sits from the middle of the chart's box. */
export const offCentre = (page, id) => page.evaluate(id => {
  const bd = document.getElementById('board'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  if (!bd || !g) return null
  const c = g.querySelector(':scope > circle').getBoundingClientRect(), b = bd.getBoundingClientRect()
  return { dx: Math.round((c.left + c.width / 2) - (b.left + b.width / 2)), dy: Math.round((c.top + c.height / 2) - (b.top + b.height / 2)) }
}, id)

/** Type a date into a date box the way a person does: press the day part of
    the box, then type the digits (this browser's boxes read day/month/year). */
export async function typeDate(page, sel, iso, { delay = 45 } = {}) {
  const [y, m, d] = iso.split('-')
  const loc = page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  await page.mouse.click(b.x + 10, b.y + b.height / 2); await sleep(80)
  await page.keyboard.type(d + m + y, { delay })
  await sleep(300)
  return loc.inputValue()
}
/** Empty a date box by keyboard (press the day part, Backspace). */
export async function clearDate(page, sel) {
  const loc = page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  await page.mouse.click(b.x + 10, b.y + b.height / 2); await sleep(80)
  await page.keyboard.press('Backspace'); await sleep(300)
  return loc.inputValue()
}
/** Pick an option of a native dropdown the way a person does: press it, then choose. */
export async function pickFrom(page, sel, labelRe) {
  await page.click(sel); await sleep(150)
  const v = await page.evaluate(({ sel, src }) => { const re = new RegExp(src); const o = [...document.querySelector(sel).options].find(o => re.test(o.textContent)); return o ? o.value : null }, { sel, src: labelRe.source })
  if (v == null) throw new Error('no option ' + labelRe + ' in ' + sel)
  await page.selectOption(sel, v); await sleep(800)
}
/** What the Failures card shows: chips (text + tooltip) and the total. */
export const failCard = page => page.evaluate(() => ({
  chips: [...document.querySelectorAll('#failChips .failchip')].map(c => ({ t: c.textContent.trim(), title: c.title, date: c.dataset.date })),
  total: (document.getElementById('failTotal') || {}).textContent || '',
  head: ((document.querySelector('#failsCard h3') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
  none: !!document.querySelector('#failChips .mini'),
}))
/** The pop-up's failure list under the counter. */
export const popFails = page => page.evaluate(() => ({
  count: (document.getElementById('failCount') || {}).textContent || '',
  list: [...document.querySelectorAll('#popFailDates .fdate')].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
  failOn: (document.getElementById('popFailDate') || {}).value,
  doneOn: (document.getElementById('popDoneDate') || {}).value,
  caption: ((document.querySelector('#popDoneRow .mini') || {}).textContent || '').trim(),
}))
/** The four Currency boxes and what the card derives from them. */
export const currency = page => page.evaluate(() => {
  const v = id => (document.getElementById(id) || {}).value
  const kv = [...document.querySelectorAll('.c-curr .kv')].map(k => k.textContent.replace(/\s+/g, ' ').trim())
  return { lastSyll: v('lastSyll'), lastCurr: v('lastCurr'), downDays: v('downDays'), upchit: v('upchit'), kv }
})
/** The Pace card as shown. */
export const paceCard = page => page.evaluate(() => {
  const c = document.querySelector('.c-pace'); if (!c) return null
  return { epw: (document.getElementById('epwIn') || {}).value, a: (document.getElementById('targetIn') || {}).value, b: (document.getElementById('targetIn2') || {}).value, text: c.innerText.replace(/\s+/g, ' ').trim() }
})
export const lullChips = page => page.evaluate(() => [...document.querySelectorAll('#lullChips .lullchip')].map(c => c.textContent.replace('×', '').replace(/\s+/g, ' ').trim()))
/** Everything visible on screen that contains `re` (to find a message wherever it lands). */
export const visibleText = (page, src) => page.evaluate(src => {
  const re = new RegExp(src, 'i'); const out = []
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let n; while ((n = walk.nextNode())) {
    if (!re.test(n.textContent)) continue
    const el = n.parentElement; if (!el) continue
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    let vis = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'
    for (let a = el; a && vis; a = a.parentElement) if (getComputedStyle(a).display === 'none') vis = false
    out.push({ text: n.textContent.trim().slice(0, 140), id: el.id || '', cls: String(el.className || ''), visible: vis, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })
  }
  return out
}, src)
/** The stored students block (the Export's own read-only collector). */
export const stored = page => page.evaluate(async () => {
  const c = window.__coreForTests; if (!c) return null
  return await c.collectStudents()
})
/** Reload the page as a person does (F5), sign back in if asked, return to the Tracker. */
export async function reloadBack(page, who = 'a') {
  await page.reload(); await sleep(800)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (await page.locator('#luser').isVisible().catch(() => false)) await login(page, who)
  else await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await toTracker(page)
}
