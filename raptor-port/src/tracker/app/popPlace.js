/* WHERE THE MARKING WINDOW OPENS (owner D1790, 8 Nov 26 — the pictures round's question 11, "All as recommended", A).
   Until then the window opened under the tap and, where it did not fit, flipped above it, held 8px from the screen's
   top — over the top bar, the Tracker bar and the Flow chart / Info / Show All tabs, and over the event itself, on every
   Find and every crew pick (each lands its event in the middle of the chart, D984). Now:
     1. it opens under the event when it fits there whole;
     2. else the chart slides the event up to the drawing's place, its top 22px under the chart box's top (the tabs'
        foot on a phone, the Tracker bar's on a desktop) — "only as far as needed" read as the approved drawing's 232px
        for ACG-09, the fresh reader's Q1 and Astra's read agreeing — and the window opens whole under it (A);
     3. an event too near the chart's end to slide that far: nothing moves, and the window is held between the chart
        box's top and the event, scrolling inside itself where it is taller than that room (the page's B);
     4. a screen too short for the window anywhere (a phone on its side): the event slides as high as it may and the
        window opens under it, scrolling inside itself — the bars and the event stay in view, as everywhere else.
   Pure: Pop.jsx measures, this decides, Pop.jsx slides the chart (its own smooth scroll) and places the window. */

/* the window's edge from the screen's edges; its gap from the event (under the event's edge, never over its foot — the
   old 12px under the tap's centre sat 2–3px over a ball 30 tall, notes-marks.md §1 (g)); the room kept between the chart
   box's top and an event slid up under it; the least height worth opening the window in above the event */
/* the room is the approved drawing's: ACG-09 slid to 187–216 under tabs ending at 165, its slide the notes' 232px (A) */
export const POP_EDGE = 8, POP_GAP = 4, POP_TOP_ROOM = 22, POP_MIN = 120;

/** @param {{ ball: {top:number,bottom:number}|null, tap: {x:number,y:number}, w: number, h: number,
 *            vw: number, vh: number, top: number, room: number }} g
 *  ball — the event on screen (null: the tap's point stands for it); w, h — the window's size; vw, vh — the screen's;
 *  top — the chart box's top edge on screen; room — how far the chart can still scroll down (0: it may not move).
 *  @returns {{ slide: number, x: number, y: number, maxH: number, how: 'below'|'slide'|'above'|'short' }} */
export function placePop(g) {
  const { ball, tap, w, h, vw, vh, top } = g;
  const room = Math.max(0, g.room || 0);
  const bTop = ball ? ball.top : tap.y - 12, bBot = ball ? ball.bottom : tap.y + 12;
  const foot = vh - POP_EDGE, ceil = top + POP_GAP;
  let x = tap.x;
  if (x + w > vw - POP_EDGE) x = vw - w - POP_EDGE;
  x = Math.max(POP_EDGE, x);
  const below = Math.max(ceil, bBot + POP_GAP);
  /* 1. it fits under the event as the chart stands */
  if (below + h <= foot) return { slide: 0, x, y: below, maxH: foot - below, how: 'below' };
  /* 2. A: the chart slides the event up under the tabs (as drawn: its top 22px under the chart box's top), and no
     further — the chart's end may stop it short of that, which is still A while the window then fits whole */
  const need = Math.ceil(below + h - foot);
  const upTo = Math.max(0, Math.floor(bTop - (top + POP_TOP_ROOM)));
  const can = Math.min(upTo, room);
  if (need <= can) return { slide: can, x, y: below - can, maxH: foot - (below - can), how: 'slide' };
  /* 3. B: held above the event, nothing moving — whole where it fits there; scrolling inside where the chart's end is
     what stopped the slide (less room left than the slide would use — a slide cut short included: Pop.jsx places
     again at rest with no room), Astra's read, finding 3 (8 Nov 26) */
  const aboveRoom = Math.floor(bTop - POP_GAP - ceil);
  if (aboveRoom >= h) return { slide: 0, x, y: bTop - POP_GAP - h, maxH: h, how: 'above' };
  if (room < Math.min(upTo, need) && aboveRoom >= POP_MIN) return { slide: 0, x, y: ceil, maxH: aboveRoom, how: 'above' };
  /* 4. too short a screen for it anywhere: the event as high as it may go, the window under it, scrolling inside —
     never past the screen's foot: where less than POP_MIN is left under it and more stands above, it goes above */
  const y = below - can, belowRoom = foot - y;
  if (belowRoom < POP_MIN && aboveRoom > belowRoom) return { slide: 0, x, y: ceil, maxH: Math.max(0, aboveRoom), how: 'above' };
  return { slide: can, x, y: Math.min(y, foot), maxH: Math.max(0, belowRoom), how: 'short' };
}
