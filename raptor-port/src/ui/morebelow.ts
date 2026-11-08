/* "↓ N MORE" — HOW MANY LINES OF A LIST ARE NOT WHOLLY IN VIEW (his D1295, answered by D1788, 8 Nov 26). One counter for
   every list that says so at its foot: the bell's list (`ui/topbits.tsx`) and the Leave War's day window
   (`leavewar/ui/DayPanel.tsx`). It counts every line whose bottom is past the scroller's bottom + 1px — the line cut at
   the foot as well as every line wholly below — so the cue says "↓ 1 more" while half a line still shows and goes exactly
   at the list's end (D1788: counted as wholly out of view it would read "↓ 0 more" over a half-shown line).

   WHEN IT COUNTS. On the list's own scroll; after EVERY render (a layout effect with no list of what it watches), so the
   count is taken again once the cue stands in its place — the cue's own height takes room from the list, and the first
   count of the drawing, taken before the cue was in, printed one too few; and when the scroller's box changes size (a
   phone's window pulled from its lower rest to its tall one, a desktop window resized), which moves no scroll and draws
   nothing. A count that did not change sets nothing, so the recount after a render ends there. */

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

/** The lines (matching `lineSel`) inside `scroller` whose bottom is past its bottom + 1px */
export function countNotWhollyInView(scroller: HTMLElement, lineSel: string): number {
  const bottom = scroller.getBoundingClientRect().bottom + 1
  let n = 0
  for (const l of Array.from(scroller.querySelectorAll<HTMLElement>(lineSel))) if (l.getBoundingClientRect().bottom > bottom) n++
  return n
}

/** How many lines of the list scrolling in `scroller` are not wholly in view; 0 while `on` is false or nothing is cut.
    `scroller` may be any element the list scrolls in, found after the first render (a ref filled by the parent). */
export function useMoreBelow(scroller: RefObject<HTMLElement | null>, lineSel: string, on = true): number {
  const [below, setBelow] = useState(0)
  /* after every render, with the cue (if any) in place */
  useLayoutEffect(() => {
    const s = scroller.current
    setBelow(on && s ? countNotWhollyInView(s, lineSel) : 0)
  })
  /* the list's own scroll, and its box changing size */
  useEffect(() => {
    const s = scroller.current
    if (!on || !s) return
    const recount = () => setBelow(countNotWhollyInView(s, lineSel))
    s.addEventListener('scroll', recount, { passive: true })
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(recount) : null
    ro?.observe(s)
    return () => { s.removeEventListener('scroll', recount); ro?.disconnect() }
  }, [scroller, lineSel, on])
  return below
}
