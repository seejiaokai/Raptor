// The bid bubble's reading and its words (the grid draws the bubble — ui/Matrix.tsx). Moved whole out of Matrix.tsx on
// 31 Oct 26, so that file exports only components (React Doctor's only-export-components, D1534).

/** The bid bubble's reading of the grid at one moment (D1227): each row-day at its level (0 clear, 1 amber, 2 red) with its
 *  figure (`have` — D1345, D1364), the days drawn then — the two Available rows are read over the drawn days only — and the
 *  count of the war's gestures (`seq`, so the bubble can tell a filing made since from a bid — D1351). A row-day still
 *  clear is read too, with its figure, so a row a bid turns amber or red can say what it stood at before (D1364). */
export type BubbleFlags = { m: Map<string, { label: string; lv: number; have?: number }>; drawn: Set<string>; seq?: number }
/** How a bid made a row worse: it TURNED it (to amber or red, or amber to red), or took it LOWER where it already stood
 *  at that level (D1345) — with the figures of the row-day it hurt most, before and after (D1364), where both are known. */
export type Worse = { lv: 'amber' | 'red'; how: 'turns' | 'lower'; before?: number; after?: number }
/** The rows a bid made WORSE between two readings, each at its worst — a row-day turned amber or red, or amber to red; or
 *  (D1345, his report of 25 Oct 26) one already amber or red whose figure went lower. A row that turns on one day and
 *  only goes lower on another reads as turned; red outranks amber; on a tie the day it went lowest speaks. Exported for its
 *  unit test (bidbubble.test.tsx). */
export function worsenedRows(before: BubbleFlags, now: BubbleFlags): Map<string, Worse> {
  const worst = new Map<string, Worse>()
  const rank = (w: Worse) => (w.lv === 'red' ? 2 : 0) + (w.how === 'turns' ? 1 : 0)
  for (const [k, { label, lv, have }] of now.m) {
    if (lv < 1) continue
    /* an Available row's day not drawn when the "before" was read has no "before" — a month drawn while a bid window was
       open (the page behind it scrolls) is never "turned" by the bid (the code read of 23 Oct 26) */
    if ((k.startsWith('availp|') || k.startsWith('availw|')) && !before.drawn.has(k.slice(7))) continue
    const was = before.m.get(k)
    let how: Worse['how'] | null = null
    if (lv > (was?.lv ?? 0)) how = 'turns'
    else if (was && have !== undefined && was.have !== undefined && have < was.have) how = 'lower'
    if (!how) continue
    const figs = was?.have !== undefined && have !== undefined ? { before: was.have, after: have } : have !== undefined ? { after: have } : {}
    const w: Worse = { lv: lv === 2 ? 'red' : 'amber', how, ...figs }
    const had = worst.get(label)
    if (!had || rank(w) > rank(had) || (rank(w) === rank(had) && (w.after ?? Infinity) < (had.after ?? Infinity))) worst.set(label, w)
  }
  return worst
}
/** What was placed or filed, as the bubble names it (D1351, D1356, D1378): a bid, a course, an overseas duty, an Other, an Attach. */
export type FiledKind = 'CSE' | 'OD' | 'OTH' | 'ATCH' | null
/** THE BUBBLE'S PARTS (D1360, D1364 — his "Day-line pairs" and "Yes, figures everywhere", 25 Oct 26, narrowing D1345's and
 *  D1351's words): what was placed — "This bid", or after a filing "This overseas duty", "This course", "This Other" — then
 *  each row it lowered with its figures in the bid window's day-line form, "Available P 27 → 26", each pair in its colour;
 *  where the figure before is not known (a row read only now) its figure alone. Exported for its unit test. */
export function bubbleParts(worse: Map<string, Worse>, filed: FiledKind): { lead: string; pairs: { label: string; fig: string; lv: 'amber' | 'red' }[] } {
  const lead = filed === 'OD' ? 'This overseas duty' : filed === 'CSE' ? 'This course' : filed === 'OTH' ? 'This Other' : filed === 'ATCH' ? 'This Attach' : 'This bid'
  /* the bid window's own figures: halves ".5" (D1246) */
  const f = (n: number) => String(Math.round(n * 2) / 2)
  const pairs = [...worse].map(([label, w]) => ({
    label, lv: w.lv,
    fig: w.before !== undefined && w.after !== undefined ? `${f(w.before)} → ${f(w.after)}` : w.after !== undefined ? f(w.after) : w.lv,
  }))
  return { lead, pairs }
}
/** The bubble in words — "This bid: IP 16 → 15 · SXO 12 → 11" (D1360) — for a screen reader and the tests. */
export function bubbleWords(worse: Map<string, Worse>, filed: FiledKind): string {
  const { lead, pairs } = bubbleParts(worse, filed)
  return `${lead}: ${pairs.map(p => `${p.label} ${p.fig}`).join(' · ')}`
}
