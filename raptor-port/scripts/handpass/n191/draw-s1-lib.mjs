// draw-s1-lib - section 1 (Core, the guard rail) drawings for the section mock-up page (chat 191, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-sections-draw-brief.md). Shared helpers over n176's drawing libs (read only).
// The app is the REAL one served at 4700 (checked: it serves this folder's raptor-port/dist - never started or stopped
// here). Pictures go to docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s1-*.png, each with its -crop twin.
//  tring       THE MARK of this round: what is new in the app (not there today) - a teal dashed ring, 2px #0D9488, 4px clear
//              of the part, fixed to the screen, drawn just before the picture. No violet, no pink.
//  sshot       a picture pair: the whole screen s1-<name>.png and s1-<name>-crop.png, cut to the boxes given.
//  underCtl    the guard's note just under a top-bar control (left or right edge on the control's, 8px under the bar),
//              the approved place of p1b / p2b (D2590) - on a desktop, a tablet, a phone on its side (D2627 A14).
//  atFoot      the note at the app's own foot place (a phone, D2590, D2627 A14 / A15): the note's data-at set to the foot.
// Every new on-screen word comes from ./words-s1.mjs (S1).
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
export * from '../n176/draw-r6-misc-lib.mjs'
import { DRAWN, FACT, note, boxOf, place, wait } from '../n176/draw-r6-misc-lib.mjs'
export { S1 } from './words-s1.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const TMP1 = resolve(HERE, '../../../.tmp/n191-s1'); mkdirSync(TMP1, { recursive: true })
export const TEAL = '#0D9488'
export const tring = (s, b, tag = '') => s.page.evaluate(([b, c, tag]) => {
  const d = document.createElement('div'); d.className = '__s1ring'; d.dataset.tag = tag
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, outlineOffset: '0', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d); return { ring: { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }, around: b, tag }
}, [b, TEAL, tag])
export const untring = s => s.page.evaluate(() => document.querySelectorAll('.__s1ring').forEach(e => e.remove()))
export async function sshot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  const file = `s1-${name}`
  await page.screenshot({ path: `${DRAWN}/${file}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${DRAWN}/${file}-crop.png`, clip })
    FACT(`${file}.crop`, clip)
  }
  note('picture', `${file}.png` + (rects.length ? ' + -crop' : ''))
}
export async function underCtl(s, k, ctlSel, edge = null) {
  const ctl = await boxOf(s, ctlSel), bar = await boxOf(s, '.topbar')
  const left = edge ? edge === 'left' : ctl.x + ctl.w / 2 < s.W / 2
  const p = left ? { top: bar.y + bar.h + 8, left: ctl.x } : { top: bar.y + bar.h + 8, right: Math.round(s.W - (ctl.x + ctl.w)) }
  FACT(`${k}.placed`, { control: ctlSel, controlBox: ctl, edge: left ? 'left' : 'right', ...p })
  await place(s, p)
}
/* THE COORDINATOR'S RULE (chat 191, after s1-cal-noleave-p): a refusal note never covers the controls it names. On a
   phone, where the foot place would meet a control of the open window(s) - any visible button, box or list in a window,
   a sheet or the bell's list, plus `extra` (the page's own controls the note names) - the note stands instead just above
   the highest such control it would meet: its foot 8px above that control's top, 12px from each side, as the foot place.
   Asked again at each new place, upward, until it meets none (the first redraw stopped one step short: lifted off the
   form's Cancel and Save it landed on the "Create the 2028 leave period" button its own words name). Returns what it met. */
export const NAMED = '.floatwin button, .floatwin input, .floatwin select, .bidsheet button, .bidsheet input, [data-testid="bell-list"] button, [data-testid="bell-list"] .bl-line, .modal button'
export async function clearOfNamed(s, k, extra = '') {
  const r = await s.page.evaluate(sel => {
    const t = document.querySelector('#toastEl'), n = t.getBoundingClientRect()
    const hits = [...document.querySelectorAll(sel)].filter(e => { const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return false; for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return false } return b.left < n.right && b.right > n.left && b.top < n.bottom && b.bottom > n.top })
    return { met: hits.map(e => (e.getAttribute('data-testid') || e.id || e.textContent.trim().slice(0, 30) || e.tagName)), top: hits.length ? Math.min(...hits.map(e => e.getBoundingClientRect().top)) : null, H: innerHeight }
  }, NAMED + (extra ? ', ' + extra : ''))
  if (!r.met.length) { FACT(`${k}.clearOfNamed`, 'the foot place meets none of the open window\'s controls'); return r }
  const steps = [r.met]
  let top = r.top
  for (let i = 0; i < 8; i++) {
    await place(s, { bottom: Math.round(r.H - top + 8), left: 12, right: 12 })
    const again = await s.page.evaluate(sel => {
      const n = document.querySelector('#toastEl').getBoundingClientRect()
      const hits = [...document.querySelectorAll(sel)].filter(e => { const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return false; for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return false } return b.left < n.right && b.right > n.left && b.top < n.bottom && b.bottom > n.top })
      return { met: hits.map(e => (e.getAttribute('data-testid') || e.id || e.textContent.trim().slice(0, 30) || e.tagName)), top: hits.length ? Math.min(...hits.map(e => e.getBoundingClientRect().top)) : null }
    }, NAMED + (extra ? ', ' + extra : ''))
    if (!again.met.length) break
    steps.push(again.met); top = again.top
  }
  const b = await boxOf(s, '#toastEl')
  FACT(`${k}.clearOfNamed`, { met: steps, movedTo: 'just above the highest control met, asked again until clear', box: b })
  return r
}
/* the app's own phone foot place, read from ui/toast.ts placeToast: 12px from each side, 26px off the foot, no shift */
export async function atFoot(s, k) {
  await place(s, { bottom: 26, left: 12, right: 12 })
  await s.page.evaluate(() => { document.querySelector('#toastEl').dataset.at = 'foot' })
  await wait(s, 200)
  const b = await boxOf(s, '#toastEl'); FACT(`${k}.placed`, { where: 'the foot (ui/toast.ts placeToast\'s phone foot: 12px each side, 26px up)', box: b })
  return b
}
