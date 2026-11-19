/* HOW THE GRID PUTS ITS FIRST DAY BACK AFTER A REDRAW (Matrix.tsx, the anchor layout effect) — the decision alone, so a
   unit test can hold it (jsdom has no layout). Three answers:
   - 'skip'  — write nothing: on a touch screen a scroll write kills an inertial fling dead (iOS), so a redraw the
               person's own flick brought is left alone, unless a jump just ran or the months drawn on the left shifted;
   - 'edge'  — put the day back ON the frozen edge exactly (landOnEdge: rounded down, 0–1px clear, never under);
   - 'shift' — move by how far the day moved, when that is more than a pixel (the old rule).
   'edge' is for a landing a JUMP made, and only that ([LW-MONTHJUMP-SUBPIXEL]; fix read 3 — both readers): the day
   resting within a pixel of the edge is not enough, since the person's own scroll can leave a day there, and putting
   that back wrote a sub-pixel scroll the old rule never wrote — on a phone, in a coast's lull, stopping the fling.
   `landed` — the day is where a jump put it: set by the jump, cleared by the person's own scroll (wheel, pointer,
   touch, key). On a touch screen only inside the jump's own window too (`fromJump`); a desktop keeps a jumped day exact
   through the whole-year fill that follows, a month a beat. */
export type Reanchor = 'skip' | 'edge' | 'shift'
export function reanchorMode(o: { coarse: boolean; fromJump: boolean; colShift: boolean; edge: boolean; landed: boolean }): Reanchor {
  if (o.coarse && !o.fromJump && !o.colShift) return 'skip'
  if (o.edge && o.landed && (o.fromJump || !o.coarse)) return 'edge'
  return 'shift'
}
