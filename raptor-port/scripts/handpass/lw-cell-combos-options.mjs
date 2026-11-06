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
//
// D — HIS IDEA (6 Nov 26, "manipulate the words such that it can also be tilted 90 degrees to the left … read down to
// up"): C, but two whole days stay SIDE BY SIDE, each the full height (his D1167), their words turned to read from the
// bottom up — so a whole day keeps looking whole and each code has the cell's height to stand in.
//   tilt   — writing-mode vertical-rl turned half a turn (reads bottom to top, letters' tops to the left); the Inputs
//            edge drawn on the far side so that, turned, it is still on the box's left.
//
// C — THE REVISED DESIGN (after the design review of 6 Nov 26, and his question "so whole day, AM and PM will always be
// top and bottom half?"): every box keeps telling whole from half by its size.
//   floor  — a whole day beside a half: the whole day keeps the whole cell, its ring right round it, its letters in the
//            free half; the half sits over its own half, inset, with a dark keyline ("a whole day under a morning").
//   split  — two whole days: one tile split in two — the halves touch, their outer corners round, their inner corners
//            square — where a morning and an afternoon stay two separate rounded boxes with a gap.
//   pile   — three or more entries: the box shown steps in and wears a hard grey offset behind it, a stack of cards;
//            no "+n" tag.
//   alarm  — "needs an admin" keeps its "!" in the amber tab, with a dark keyline so it never melts into an amber box;
//            the box's letters step left of it.
//   gone   — a day after a posting out: the box itself carries the posting hatch; no PO tag.
//   last   — his last day in: a 2px yellow line down the day's right edge, the box stepped clear of it; no PO tag.
export const OPTIONS = {
  today: { css: '', map: null },
  stack: { css: '', map: 'stack' },
  edge: { css: 'edge', map: 'edge' },
  A: { css: 'flags fit', map: 'stack flags' },
  'A-poflags': { css: 'poflags makeway fit', map: 'stack poflags makeway' },
  B: { css: 'edge flags fit', map: 'edge flags' },
  C: { css: 'floor marks fit scale', map: 'floor marks' },
  D: { css: 'floor marks fit tilt scale', map: 'tilt floor marks' },
  E: { css: 'floor marks fit tilt scale postrip', map: 'tilt floor marks postrip' },
  /* his D1727 with the agent's fallback: the turned PO strip on a PO day holding ONE box; a PO day holding two entries keeps D's
     yellow line (last day) or the stripes on the boxes (posted out), where the strip leaves the codes no room */
  F: { css: 'floor marks fit tilt scale postrip', map: 'tilt floor marks postrip postone' },
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
  floor: `
${P} .c.cc-floor { inset: 2px !important; border-radius: 4px !important; padding: 0 !important; font-size: 7.5px !important; letter-spacing: 0 !important; }
${P} .c.cc-floor.wide { font-size: 6.5px !important; letter-spacing: -.02em !important; }
${P} .c.cc-floor.w4 { font-size: 6px !important; letter-spacing: -.04em !important; }
${P} .c.cc-floor.cc-lo { align-items: flex-end; padding-bottom: 1.5px !important; }
${P} .c.cc-floor.cc-hi { align-items: flex-start; padding-top: 1.5px !important; }
${P} .c.cc-roof { left: 4px !important; right: 4px !important; border-radius: 3px !important; padding: 0 !important; z-index: 1; font-size: 6.5px !important; letter-spacing: 0 !important; }
${P} .c.cc-roof.wide { font-size: 5.5px !important; letter-spacing: -.02em !important; }
${P} .c.cc-roof.w4 { font-size: 5px !important; letter-spacing: -.04em !important; }
${P} .c.cc-roof.cc-am { top: 4px !important; bottom: calc(50% + .5px) !important; }
${P} .c.cc-roof.cc-pm { top: calc(50% + .5px) !important; bottom: 4px !important; }
${P} .c.cc-roof.s-a { box-shadow: inset 0 0 0 1px rgba(var(--h), .85), 0 0 0 1px #0E141B !important; background: rgba(var(--h), max(var(--fill), .55)); }
${P} .c.cc-roof.k-unav.s-a { background: #2A323C !important; box-shadow: inset 0 0 0 1.5px rgba(200, 212, 228, .78), 0 0 0 1px #0E141B !important; }
${P} .c.cc-split.top { bottom: 50% !important; border-radius: 4px 4px 0 0 !important; }
${P} .c.cc-split.bot { top: 50% !important; border-radius: 0 0 4px 4px !important; }
${P} .c.cc-split.wide { font-size: 6.5px !important; }
${P} .c.cc-split.w4 { font-size: 6px !important; letter-spacing: -.03em !important; }`,
  marks: `
${P}.cc-pile .mk.more { display: none !important; }
/* a mark that takes room from a box steps its letters down one size */
${P}.cc-pile .c.whole { font-size: 8.5px !important; letter-spacing: 0 !important; }
${P}.cc-pile .c.whole.wide { font-size: 7.5px !important; letter-spacing: -.02em !important; }
${P}.cc-pile .c.whole.w4 { font-size: 6px !important; letter-spacing: -.04em !important; }
${P}.cc-pile .c:is(.top, .bot) { font-size: 7px !important; }
${P}.cc-pile .c:is(.top, .bot).wide { font-size: 5.5px !important; }
${P}.cc-pile .c:is(.top, .bot).w4 { font-size: 5px !important; letter-spacing: -.04em !important; }
${P}.cc-last .c.whole.wide { font-size: 8px !important; }
${P}.cc-last .c.whole.w4 { font-size: 6.5px !important; }
${P}.cc-pile.cc-last .c.whole.wide { font-size: 7px !important; }
${P}.cc-pile.cc-last .c.whole.w4 { font-size: 5.5px !important; }
${P}.cc-last.cc-alarm .c.whole:not(.cc-floor) { padding-top: 2.5px !important; }
${P}.cc-last .c:is(.top, .bot).w4 { font-size: 5.5px !important; }
${P}.cc-pile .c.whole { right: 4.5px !important; bottom: 4.5px !important; }
${P}.cc-pile .c.top { right: 4.5px !important; }
${P}.cc-pile .c.bot { right: 4.5px !important; bottom: 3px !important; }
${P}.cc-pile .c.s-a { box-shadow: inset 0 0 0 1px rgba(var(--h), .85), 2.5px 2.5px 0 rgba(150, 162, 178, .9) !important; }
${P}.cc-pile .c.s-w { box-shadow: 2.5px 2.5px 0 rgba(150, 162, 178, .9) !important; }
${P}.cc-pile .c.k-unav.s-a { box-shadow: inset 0 0 0 1.5px rgba(200, 212, 228, .78), 2.5px 2.5px 0 rgba(150, 162, 178, .9) !important; }
/* the "!" tab, a little smaller than today's, so it stays above a whole day's letters (which sit mid-height); a box whose
   letters are in the top half steps them left of it, one size smaller */
${P}.cc-alarm .mk.warn { top: 0 !important; right: 0 !important; bottom: auto !important; font-size: 6.5px !important; line-height: 1 !important; padding: .5px 1.5px !important; box-shadow: 0 0 0 1px #0E141B !important; color: #1A1206 !important; z-index: 2; }
${P}.cc-alarm .c.whole:not(.cc-floor) { padding-top: 1.5px !important; }
${P}.cc-alarm .c:is(.top, .cc-floor.cc-hi):not(.cc-roof) { padding-right: 4.5px !important; font-size: 6.5px !important; letter-spacing: 0 !important; }
${P}.cc-alarm .c:is(.top, .cc-floor.cc-hi):not(.cc-roof).wide { font-size: 5.5px !important; letter-spacing: -.02em !important; }
${P}.cc-alarm .c:is(.top, .cc-floor.cc-hi):not(.cc-roof).w4 { font-size: 5px !important; letter-spacing: -.04em !important; }
${P}.cc-alarm .c.cc-roof.cc-am { left: 3px !important; right: 6.5px !important; }
${P}.cc-alarm .c.cc-roof.cc-am.w4 { font-size: 4.5px !important; }
${P}.cc-gone .potag { display: none !important; }
${P}.cc-gone .c { background-image: repeating-linear-gradient(135deg, rgba(14, 20, 27, .3) 0 1.5px, transparent 1.5px 4px) !important; }
${P}.cc-last .polast { display: none !important; }
${P}.cc-last { box-shadow: inset -2px 0 0 #F2C879; }
${P}.cc-last .c:not(.left) { right: 3.5px !important; }
${P}.cc-last.cc-alarm .mk.warn { right: 2px !important; }
${P}.cc-pile.cc-last .c:is(.whole, .top, .bot) { right: 6px !important; }
${P} .c:where(.top, .bot) { padding: 0 !important; }`,
  /* HIS D1726: zoomed out, every code's letters shrink by one same scale. A box set at 10px (a whole day's two letters)
     is held at 9px by the iPhone's smallest-letter floor at any zoom below 0.9, so LL and OL grew bigger than the rest;
     set at 8.9px whenever the grid is zoomed below 1 (`cc-small` on the grid's table — Matrix knows its zoom), the
     floor never applies. A desktop at 1 keeps 10px. */
  scale: `
#page-leavewar table.mx.cc-small td .c.whole:not(.wide) { font-size: 8.9px !important; }`,
  /* HIS IDEA (6 Nov 26, "how about PO is also tilted"): the PO keeps its word, turned to read bottom to top in a 6px strip
     down the day's right edge — yellow on his last day in, grey on a day after a posting out — and the boxes step left of
     it, their letters one size smaller. The turned pair of two whole days has no room for a strip beside it, so there the
     PO stays D's yellow line or the hatch on the box. */
  postrip: `
${P}.cc-postrip { box-shadow: none !important; }
${P}.cc-postrip .c { background-image: none !important; }
${P}.cc-postrip :is(.potag, .polast) { display: flex !important; align-items: center; justify-content: center; top: 2px !important; bottom: 2px !important; right: 1px !important; left: auto !important; width: 5px !important; height: auto !important; padding: 0 !important; border-radius: 2px !important; writing-mode: vertical-rl; transform: rotate(180deg); font-size: 5px !important; letter-spacing: .04em !important; line-height: 1 !important; box-shadow: none !important; }
${P}.cc-postrip .polast { background: #F2C879 !important; color: #04222b !important; }
${P}.cc-postrip .potag { background: rgba(150, 162, 178, .95) !important; color: #0d1117 !important; }
${P}.cc-postrip .c:is(.whole, .top, .bot, .cc-floor) { right: 7px !important; }
${P}.cc-postrip .c.cc-roof { left: 3px !important; right: 8px !important; font-size: 6px !important; }
${P}.cc-postrip .c.cc-roof.wide { font-size: 4.5px !important; }
${P}.cc-postrip .c.cc-roof.w4 { font-size: 4px !important; }
${P}.cc-postrip.cc-pile .c:is(.whole, .top, .bot) { right: 7px !important; }
${P}.cc-postrip .c.whole:not(.cc-floor) { font-size: 8.5px !important; letter-spacing: 0 !important; }
${P}.cc-postrip .c.whole.wide:not(.cc-floor) { font-size: 6.5px !important; letter-spacing: -.02em !important; }
${P}.cc-postrip .c.whole.w4:not(.cc-floor) { font-size: 5px !important; letter-spacing: -.04em !important; }
${P}.cc-postrip .c:is(.top, .bot).wide { font-size: 5px !important; }
${P}.cc-postrip .c:is(.top, .bot).w4 { font-size: 4px !important; letter-spacing: -.04em !important; }
/* the "!" on a PO day stands at the top of the PO strip — the day's right edge one status column, "!" above, PO below */
${P}.cc-postrip.cc-alarm .mk.warn { right: 1px !important; top: 2px !important; width: 5px !important; height: 7px !important; padding: 0 !important; display: flex !important; align-items: center; justify-content: center; font-size: 6px !important; border-radius: 2px !important; }
${P}.cc-postrip.cc-alarm :is(.potag, .polast) { top: 10px !important; font-size: 5px !important; }
${P}.cc-postrip.cc-alarm .c { padding-right: 0 !important; }`,
  tilt: `
${P} .c.cc-tilt { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 7.5px !important; letter-spacing: 0 !important; padding: 0 !important; }
${P} .c.cc-tilt.wide { font-size: 7px !important; letter-spacing: -.02em !important; }
${P} .c.cc-tilt.w4 { font-size: 6.5px !important; letter-spacing: -.04em !important; }
${P} .c.cc-tilt.left { border-radius: 2px 4px 4px 2px !important; }
${P} .c.cc-tilt.right { border-radius: 4px 2px 2px 4px !important; }
${P} .c.cc-tilt:is(.raptor, .moved)::before { left: auto !important; right: 0 !important; }
${P} .c.cc-tilt:is(.raptor, .moved) { padding: 0 2px 0 0 !important; }
${P} .c.cc-tilt.w4 { font-size: 6px !important; }
${P}.cc-alarm .c.cc-tilt.right { top: 7.5px !important; font-size: 6.5px !important; }
${P}.cc-alarm .c.cc-tilt.right.wide { font-size: 5.5px !important; }
${P}.cc-alarm .c.cc-tilt.right.w4 { font-size: 4.5px !important; }`,
  fit: `
${P} .c:is(.raptor, .moved):is(.whole, .top, .bot, .cc-main) { padding-left: 2px !important; }
${P} .c.whole.w4 { font-size: 7px !important; letter-spacing: -.05em !important; }
${P} .c.whole.cc-star { font-size: 8.5px !important; letter-spacing: -.01em !important; }
${P} .c.cc-star:is(.top, .bot) { font-size: 6px !important; letter-spacing: 0 !important; }
${P} .c.cc-star.cc-roof { font-size: 5.5px !important; }`,
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
  if (has('tilt') && out.boxes.length === 2 && out.boxes[0].place === 'left' && out.boxes[1].place === 'right') {
    out.boxes[0].extra = ' cc-tilt'; out.boxes[1].extra = ' cc-tilt'
  }
  if (has('floor') && out.boxes.length === 2 && !(has('tilt') && out.boxes[1].place === 'right')) {
    const [a, b] = out.boxes
    if (a.place === 'left' && b.place === 'right') { a.place = 'top'; a.extra = ' cc-split'; b.place = 'bot'; b.extra = ' cc-split' }
    else if (a.place === 'left' && (b.place === 'right-am' || b.place === 'right-pm')) {
      const am = b.place === 'right-am'
      a.place = 'whole'; a.extra = ` cc-floor ${am ? 'cc-lo' : 'cc-hi'}`
      b.place = am ? 'top' : 'bot'; b.extra = ` cc-roof ${am ? 'cc-am' : 'cc-pm'}`
      out.boxes = [a, b]
    }
  }
  if (has('postrip') && out.boxes.length && (!has('postone') || out.boxes.length === 1) && (cb.tiles.includes('po') || cb.tiles.includes('last')) && !out.boxes.some(b => (b.extra || '').includes('cc-tilt'))) out.extraTd.push('cc-postrip')
  if (has('marks') && out.boxes.length) {
    if (cb.tiles.includes('more')) out.extraTd.push('cc-pile')
    if (cb.tiles.includes('warn')) out.extraTd.push('cc-alarm')
    if (cb.tiles.includes('po')) out.extraTd.push('cc-gone')
    if (cb.tiles.includes('last')) out.extraTd.push('cc-last')
  }
  if ((has('flags') || has('poflags')) && out.boxes.length) out.extraTd.push('cc-flags')
  if (has('makeway') && out.boxes.some(b => b.place === 'whole') && (cb.tiles.includes('more') || cb.tiles.includes('warn'))) out.extraTd.push('cc-tt')
  return out
}
