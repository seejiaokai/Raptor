/* [TRK-LEFTOVERS] walker b — the small helpers shared by trk-lo-2b-*.mjs, on top
   of trk-lib.mjs and trk-w2-lib.mjs. Every one PRESSES the app's own controls
   the way a person does (a real mouse click at desktop size, a real finger tap
   on the phone) or READS what the screen shows; the browser's storage is read
   only to CHECK what was saved, never written.

   The size comes from the command line: `node trk-lo-2b-<x>.mjs desk|phone`.
   Phone = 390×844 with touch; its side panel lives on the Info tab. */
import { reveal } from './trk-lib.mjs'
import { sleep, centreOf } from './trk-w2-lib.mjs'

export const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk'
export const PH = SIZE === 'phone'
export const TAG = PH ? 'ph' : 'dk'

/** The squadron's day (Singapore) — the app's own "today" (isoToday). */
export const todayIso = page => page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))
export function addDays(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
/** dd/mm/yy, the way the app prints a day */
export const short = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(2, 4) : ''

/** A press where a person presses: the mouse on a desktop, a finger on the phone. */
export async function press(page, x, y) {
  if (PH) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  await sleep(300)
}
export async function pressSel(page, sel, { dx = null } = {}) {
  const loc = page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox(); if (!b) throw new Error('nothing to press: ' + sel)
  await press(page, dx == null ? b.x + b.width / 2 : b.x + dx, b.y + b.height / 2)
}
/** The phone keeps the side panel on its Info tab and the chart on Flow. */
export async function toInfo(page) { if (PH) await pressSel(page, '#viewtabs [data-view="info"]') }
export async function toFlow(page) { if (PH) await pressSel(page, '#viewtabs [data-view="flow"]') }

/** Press a ball's centre (grades the picked student), bringing it into view first. */
export async function tapBall(page, id) {
  await toFlow(page)
  await reveal(page, id)
  const c = await centreOf(page, id); if (!c) throw new Error('no ball ' + id)
  await press(page, c.x, c.y); await sleep(200)
}

/** Everything saved for one student on the syllabus on screen — read from the
    browser's storage (what survives a reload), never from the screen. */
export async function stored(page, sid = null) {
  return page.evaluate(sid => {
    const s = sid || (document.getElementById('activeSel') || {}).value
    const get = re => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (re.test(k)) { try { return JSON.parse(localStorage.getItem(k)) } catch { return localStorage.getItem(k) } } } return null }
    const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return {
      sid: s,
      d: get(new RegExp('^raptor:tracker/v3:[^:]+:s[bc][0-9a-z]+:d:' + esc(s) + '$')),
      m: get(new RegExp('^raptor:tracker/v3:[^:]+:s[bc][0-9a-z]+:m:' + esc(s) + '$')),
      pace: get(new RegExp('^raptor:tracker/v3:[^:]+:pace:' + esc(s) + '$')),
      lulls: get(new RegExp('^raptor:tracker/v3:[^:]+:lulls:' + esc(s) + '$')),
    }
  }, sid)
}
/** The ↶ button's words and the depth of the two histories. */
export const undoNow = page => page.evaluate(() => {
  const u = document.getElementById('trUndoBtn'), r = document.getElementById('trRedoBtn')
  const h = window.__undoForTests ? window.__undoForTests() : {}
  return { t: u ? u.title : null, off: u ? u.disabled : null, rt: r ? r.title : null, roff: r ? r.disabled : null, depth: h.undo, redo: h.redo }
})
export const crewName = page => page.locator('#activeSel option:checked').innerText()

/** An empty point of the side panel (a card's padding) — where a person taps to
    leave a box. */
export async function blankPoint(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.c-plan h3') || document.querySelector('#side h3')
    const r = c.getBoundingClientRect()
    return { x: r.left + Math.min(r.width - 6, 180), y: r.top + r.height / 2 }
  })
}
/** An empty point on the chart (no ball, no line). */
export async function chartBlank(page) {
  return page.evaluate(() => {
    const b = document.getElementById('board').getBoundingClientRect()
    for (let fy = 0.15; fy < 0.9; fy += 0.05) for (let fx = 0.05; fx < 0.95; fx += 0.04) {
      const x = b.left + b.width * fx, y = b.top + b.height * fy, el = document.elementFromPoint(x, y)
      if (el && (el.id === 'flowSvg' || el.id === 'board' || (el.tagName.toLowerCase() === 'rect' && el.closest('#flowSvg') && !el.closest('.ball')))) return { x, y }
    }
    return null
  })
}

/** Is an element fully on screen and readable — inside the window, not cut by a
    scrolling or clipping ancestor, its text not cut short? */
export async function onScreen(page, sel) {
  return page.evaluate(sel => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : null
    if (!el) return { found: false }
    const r = el.getBoundingClientRect()
    const inWin = r.width > 0 && r.height > 0 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5
    /* a scrolling or clipping box between the line and the page cuts it — unless a
       fixed-position layer sits between them (it escapes the box's clip) */
    let clippedBy = null, fixedBelow = false
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (!fixedBelow && /(hidden|auto|scroll|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const ar = a.getBoundingClientRect()
        if (r.left < ar.left - 0.5 || r.right > ar.right + 0.5 || r.top < ar.top - 0.5 || r.bottom > ar.bottom + 0.5) { clippedBy = (a.id ? '#' + a.id : '') + '.' + String(a.className).split(' ')[0]; break }
      }
      if (cs.position === 'fixed') fixedBelow = true
    }
    /* and the line is what a finger or eye meets at its start, middle and end */
    const cy = r.top + r.height / 2
    const hits = [r.left + 3, r.left + r.width / 2, r.right - 3].map(x => { const t = document.elementFromPoint(x, cy); return !!t && (t === el || el.contains(t)) })
    return { found: true, text: el.textContent, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], inWin, clippedBy, cut: el.scrollWidth > el.clientWidth + 1, onTop: hits.every(Boolean), hits }
  }, sel)
}

/** Are the WORDS of an element readable — for each line of its text, is the
    element (not something drawn over it) what sits at the line's start, middle
    and end? Returns the points that are covered, and by what. */
export async function wordsShowing(page, sel) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return { found: false }
    const rg = document.createRange(); rg.selectNodeContents(el)
    const covered = []; let checked = 0
    /* a line that takes no presses (pointer-events: none — the hint bar) is skipped by
       elementFromPoint, so what it returns may lie UNDER the line: count it as drawn
       over the words only when its layer is stacked above the line's own */
    const zOf = n => { for (let a = n; a && a !== document.documentElement; a = a.parentElement) { const z = getComputedStyle(a).zIndex; if (z !== 'auto') return +z } return 0 }
    const passThrough = getComputedStyle(el).pointerEvents === 'none', zSelf = zOf(el)
    for (const r of rg.getClientRects()) {
      if (r.width < 2) continue
      const y = r.top + r.height / 2
      for (const x of [r.left + 2, r.left + r.width / 2, r.right - 2]) {
        checked++
        const t = document.elementFromPoint(x, y)
        if (t && passThrough && !(t === el || el.contains(t)) && zOf(t) <= zSelf) continue
        if (!t || !(t === el || el.contains(t))) covered.push({ x: Math.round(x), y: Math.round(y), by: t ? (t.id ? '#' + t.id : t.tagName.toLowerCase()) + (t.closest && t.closest('#pop') ? ' (in the grading pop-up)' : '') : 'nothing' })
      }
    }
    return { found: true, text: el.textContent, checked, covered }
  }, sel)
}
