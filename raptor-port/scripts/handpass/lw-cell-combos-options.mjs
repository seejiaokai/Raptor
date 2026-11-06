// [LW-CELL-COMBOS] step 2 — the candidate fixes, each a markup change and a stylesheet laid over the real build, so the
// measuring script (OPT=<name>) measures every combination under it exactly as it measured today, and the drawing script
// pictures it. Drawn for him first (D1625); nothing here is built. New classes are prefixed `cc-`.
//
// TWO ENTRIES ON ONE DAY (question 1)
//   stack  — any two entries stand one above the other, as a morning and an afternoon do today (his D1146 look, before
//            D1167): two whole days the first on top; a whole day beside a half takes the free half.
//   edge   — the first entry keeps the cell and its letters, a step smaller; the second is a 3.5px edge in its own colour
//            down the cell's right side — full height for a whole day, the top half a morning, the bottom half an
//            afternoon — no letters (his round-3 option C, D1167).
// CORNER TAGS OVER LETTERS (question 2)
//   flags  — on a day that holds a box, every corner tag is a small flag in its own colour, no words: grey "more on this
//            day", amber "needs an admin", grey PO (posted out); his last day in is a 2px yellow line down the day's
//            right edge. The boxes and their letters
//            keep their full size; the old step-aside paddings go. A day with nothing on it keeps its "PO".
//   poflags — only the two PO tags become flags; "+n" and "!" keep their words and a whole day's letters drop below them
//            at the half box's size.
// FIT (fixed without a question)
//   fit    — a box wearing the Inputs page's 2px left edge centres its letters in the room right of that edge; a
//            four-letter code and a starred one go one step smaller in a whole-day box.
// ZOOMED RIGHT OUT (question 3) — `cc-far` on the grid table: colours only (the drawing script).
export const OPTIONS = {
  today: { css: '', map: null },
  stack: { css: '', map: 'stack' },
  edge: { css: 'edge', map: 'edge' },
  A: { css: 'flags fit', map: 'stack flags' },
  'A-poflags': { css: 'poflags makeway fit', map: 'stack poflags makeway' },
  B: { css: 'edge flags fit', map: 'edge flags' },
}
const P = '#page-leavewar .mx td'
const GREY = 'rgba(150, 162, 178, .95)', AMBER = '#F2C879'
/* a corner flag: a 7px right-angled triangle drawn by the tag's own borders, in the corner the tag already stands in */
const FLAG = (sel, colour, side) => `${sel} { font-size: 0 !important; padding: 0 !important; width: 0 !important; height: 0 !important; background: none !important; border-radius: 0 !important; box-shadow: none !important; border-style: solid !important; border-color: transparent !important; border-width: 0 0 0 7px !important; border-${side}-width: 7px !important; border-${side}-color: ${colour} !important; }`
export const CSS = {
  edge: `
${P} .c.cc-main { left: 2px; right: 6.5px; top: 2px; bottom: 2px; border-radius: 4px 2px 2px 4px; font-size: 7.5px !important; letter-spacing: 0 !important; }
${P} .c.cc-main.wide { font-size: 6.5px !important; letter-spacing: -.02em !important; }
${P} .c.cc-main.w4 { font-size: 6px !important; letter-spacing: -.04em !important; }
${P} .c.cc-edge { left: auto !important; right: 2px; width: 3.5px; top: 2px; bottom: 2px; padding: 0 !important; border-radius: 1px 3px 3px 1px; font-size: 0 !important; }
${P} .c.cc-edge.cc-am { bottom: calc(50% + .5px); }
${P} .c.cc-edge.cc-pm { top: calc(50% + .5px); }
${P} .c.cc-edge.s-a { background: rgba(var(--h), .9); }
${P} .c.cc-edge.k-unav.s-a { background: rgba(200, 212, 228, .85) !important; }`,
  /* his last day in: a 2px yellow line down the day's right edge, in the gap between days, so it covers no letter and
     never looks like the amber "needs an admin" flag (both are #F2C879 today, told apart only by "!" and "PO") */
  flags: `
${P}.cc-flags .polast { font-size: 0 !important; padding: 0 !important; top: 0 !important; bottom: 0 !important; right: 0 !important; width: 2px !important; height: auto !important; border-radius: 0 !important; background: #F2C879 !important; }
${FLAG(`${P}.cc-flags .potag`, GREY, 'bottom')}
${FLAG(`${P}.cc-flags .mk.warn`, AMBER, 'top')}
${FLAG(`${P}.cc-flags .mk.more`, GREY, 'top')}
${P}.cc-flags .mk { top: 0 !important; right: 0 !important; bottom: auto !important; }
${P}.cc-flags.pohi .potag { top: 0 !important; bottom: auto !important; }
${FLAG(`${P}.cc-flags.pohi .potag`, GREY, 'top')}
${P}.cc-flags .c:is(.top, .bot) { padding: 0 !important; }
${P}.cc-flags .c.wide:is(.top, .bot) { font-size: 6.5px !important; }
${P}.cc-flags .c.w4:is(.top, .bot) { font-size: 6px !important; letter-spacing: -.03em !important; }`,
  poflags: `
${P}.cc-flags .polast { font-size: 0 !important; padding: 0 !important; top: 0 !important; bottom: 0 !important; right: 0 !important; width: 2px !important; height: auto !important; border-radius: 0 !important; background: #F2C879 !important; }
${FLAG(`${P}.cc-flags .potag`, GREY, 'bottom')}
${P}.cc-flags.pofin .mk { right: 2px; }`,
  makeway: `
${P}.cc-tt .c.whole { align-items: flex-end; padding-bottom: 1px; font-size: 7.5px !important; letter-spacing: 0 !important; }
${P}.cc-tt .c.whole.wide { font-size: 6.5px !important; letter-spacing: -.02em !important; }
${P}.cc-tt .c.whole.w4 { font-size: 6px !important; letter-spacing: -.04em !important; }`,
  fit: `
${P} .c:is(.raptor, .moved):is(.whole, .top, .bot, .cc-main) { padding-left: 2px !important; padding-right: 0 !important; }
${P} .c.whole.w4 { font-size: 7px !important; letter-spacing: -.05em !important; }
${P} .c.whole.cc-star { font-size: 8.5px !important; letter-spacing: -.01em !important; }`,
}
/* the markup each option draws, from today's: boxes [{ c, place }], tiles, extra classes on the cell */
export function remap(map, cb) {
  const out = { ...cb, boxes: cb.boxes.map(b => ({ ...b })), extraTd: [] }
  const has = m => (map || '').split(' ').includes(m)
  if (has('stack') && out.boxes.length === 2) {
    const [a, b] = out.boxes
    if (a.place === 'left' && b.place === 'right') { a.place = 'top'; b.place = 'bot' }
    else if (a.place === 'left' && b.place === 'right-am') { b.place = 'top'; a.place = 'bot' }
    else if (a.place === 'left' && b.place === 'right-pm') { a.place = 'top'; b.place = 'bot' }
  }
  if (has('edge') && out.boxes.length === 2 && out.boxes[0].place === 'left') {
    const [a, b] = out.boxes
    a.place = 'whole'; a.extra = ' cc-main'
    b.extra = ` cc-edge${b.place === 'right-am' ? ' cc-am' : b.place === 'right-pm' ? ' cc-pm' : ''}`; b.place = 'right'; b.noText = true
  }
  if ((has('flags') || has('poflags')) && out.boxes.length) out.extraTd.push('cc-flags')
  if (has('makeway') && out.boxes.some(b => b.place === 'whole') && (cb.tiles.includes('more') || cb.tiles.includes('warn'))) out.extraTd.push('cc-tt')
  return out
}
