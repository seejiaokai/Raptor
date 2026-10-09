/* THE DATE UNDER A POINT OF A MONTH — one body for every pointer machine of the two calendars (ui/calpick.ts: picking
   days; ui/caldrag.ts: moving a bar or a planning note).

   A date is an element carrying `data-icday`. On the SANS month nothing lies over the dates, so the element under the
   pointer is (or is inside) the date. On the Inputs month an input is a BAR lying across several dates (owner D626:
   "bars the way Google calendar does") — the element under the pointer is then the bar, which belongs to no one date.
   So the date is asked of everything stacked at the point, top first: the first that is, or is inside, a date of this
   month answers. That is the plan's "from the day grid's geometry" (§3.6) — and it is why a pick drawn across a bar
   carries on, and why a bar grabbed on its Wednesday knows it was grabbed on its Wednesday.

   Never the event's target: a captured or a touch pointer keeps reporting the element it went down on. Where the page
   has no layout to ask (a unit test), `fallback` — the event's target — is all there is. */
export function dayAtPoint(root: HTMLElement, x: number, y: number, fallback?: EventTarget | null): string | null {
  const doc = document as any
  const stack: unknown[] = typeof doc.elementsFromPoint === 'function' ? doc.elementsFromPoint(x, y) || []
    : typeof doc.elementFromPoint === 'function' ? [doc.elementFromPoint(x, y)]
      : [fallback]
  for (const hit of stack) {
    const cell = hit && typeof (hit as Element).closest === 'function' ? (hit as Element).closest('[data-icday]') as HTMLElement | null : null
    if (cell && root.contains(cell)) return cell.dataset.icday || null
  }
  return null
}

/** the date's own element in this month (the one a pointer machine lights), or null */
export const dayEl = (root: HTMLElement, iso: string | null): HTMLElement | null =>
  iso ? root.querySelector(`[data-icday="${iso}"]`) as HTMLElement | null : null
