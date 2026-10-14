/* W3 walker's helpers, part 2 — keyboard rounds on a sheet. Nothing here edits the app. */
import { L } from './lib.mjs'

/** what the keyboard is on, with whether it is inside `sheet` and whether it wears a ring */
export const kb = (w, sheet) => w.page.evaluate(sel => {
  const e = document.activeElement, root = document.querySelector(sel)
  if (!e || e === document.body) return { t: 'nothing (the page)', inside: false, x: false, box: false, ring: 'NO RING' }
  const st = getComputedStyle(e)
  const ring = st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0 ? `${st.outlineStyle} ${st.outlineWidth} ${st.outlineColor}` : (st.boxShadow && st.boxShadow !== 'none' ? 'shadow ' + st.boxShadow.slice(0, 50) : 'NO RING')
  const nm = e.getAttribute('data-testid') || e.id || String(e.className || '').split(' ')[0] || e.tagName.toLowerCase()
  return { t: `${e.tagName.toLowerCase()}[${nm}] "${(e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 28)}"`, inside: !!(root && root.contains(e)), x: e.classList.contains('x') || e.classList.contains('win-x'), box: !!(root && e === root.querySelector('.airpop-box')), ring }
}, sheet)

/** Tab round + Shift+Tab, by keyboard only. Returns facts; the caller judges. */
export async function tabRound(w, sheet) {
  const p = w.page
  const first = await kb(w, sheet)
  const stops = []
  for (let i = 0; i < 16; i++) {
    await p.keyboard.press('Tab')
    const d = await kb(w, sheet)
    stops.push(d)
    if (stops.length > 1 && d.t === stops[0].t) break
  }
  /* the round's first control: where the keyboard stood at open, or the first Tab's stop where it stood on the sheet itself */
  const firstControl = first.box || !first.inside ? stops[0].t : first.t
  /* go back to the first control by Shift+Tab, then one more Shift+Tab: that is "Shift+Tab from the first control" */
  for (let i = 0; i < 10; i++) { const k = await kb(w, sheet); if (k.t === firstControl) break; await p.keyboard.press('Shift+Tab') }
  const back = await kb(w, sheet)
  await p.keyboard.press('Shift+Tab')
  const shift = await kb(w, sheet)
  const ixX = stops.findIndex(s => s.x)
  const closed = stops.length > 1 && stops[stops.length - 1].t === stops[0].t
  const after = ixX >= 0 && stops[ixX + 1] ? stops[ixX + 1].t : null
  return { first, firstControl, stops, firstTab: stops[0], xIndex: ixX, round: (closed ? stops.slice(0, -1) : stops).map(s => s.t), closed, afterX: after, xIsLast: ixX >= 0 && after === firstControl, allInside: stops.every(s => s.inside), rings: stops.map(s => s.ring), standsOn: back, shiftTab: shift }
}

/** T1's rows for one sheet, judged against the brief (X1: opens on its first answer; others: on the sheet, first Tab on the first own control) */
export function t1rows(surface, t, { answer = false } = {}) {
  const ok = (key, expected, saw, pass) => L.row(surface, key, expected, saw, pass ? 'PASS' : 'FAIL')
  const cyan = r => /rgb\(59, 198, 232\)/.test(r)
  ok('T1 - where the keyboard is as it opens', answer ? 'on its first answer' : 'on the sheet itself', t.first.t + ' · ring ' + t.first.ring, answer ? /oil-yes/.test(t.first.t) : t.first.box)
  ok('T1 - the first Tab', 'the first own control, never the ✕', t.firstTab.t, !t.firstTab.x)
  ok('T1 - the round', 'the ✕ is the LAST stop before the round starts again; Tab never leaves the sheet', `round: ${t.round.join(' → ')} → (again); ✕ at place ${t.xIndex + 1} of ${t.round.length}; the stop after the ✕ is ${t.afterX} and the round's first control is ${t.firstControl}; every stop inside: ${t.allInside}`, t.xIsLast && t.allInside)
  ok('T1 - Shift+Tab from the first control', 'goes to the ✕', `from ${t.standsOn.t} to ${t.shiftTab.t}`, t.shiftTab.x)
  ok('T1 - the ring', 'a cyan ring on every stop', t.rings.join(' | '), t.rings.every(cyan))
}
