/* The read-only week. Day markup comes from the verbatim dayHTML builder, so
   what renders is byte-identical to the reference. The B54 guarantees are
   honoured the same way the reference honours them: each pass compares every
   day's markup with what was last written and swaps ONLY the changed
   <section class="day"> nodes, holding the week's scroll position. React
   owns the container; the day internals migrate to components in later
   surfaces. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { CARRYDAY, CURPAGE, DPREV, setCarryDay, scrollWeekToDay } from '../state/view'
import { daySnapOf } from '../engine/publish'
import { isDraftVer } from '../engine/drafts'
import { dayHTML, withDaySnap } from './html'
import { refreshHighlights } from './highlights'
import { useVersion } from './useStore'

export function ViewWeek() {
  const version = useVersion()
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef<string[] | null>(null)

  useEffect(() => {
    /* the reference renders only the page on screen (renderSchedule is called
       for CURPAGE alone); building a hidden week's markup on every store tick
       is pure waste on a throttled phone. The prev cache stays coherent: the
       DOM was not touched while hidden, so the next visible pass diffs
       against exactly what is on screen. */
    if (CURPAGE !== 'viewsched') return
    const root = ref.current!
    /* DRAFT previews reach the view page too (owner, 15 Aug 26 — "on view
       schedule mode, you can also view the different drafts"): a 'd:<id>'
       DPREV entry renders through the same withDaySnap freeze the edit
       surfaces use, banner and all, with the day's own compact drafts select
       (dayHTML's view branch) still on its head to switch back. ONLY draft
       vers: the view page deliberately never grew the ORIG/AL version
       machinery, so a preview left armed on the edit page stays the edit
       page's business and this week keeps rendering live for it. Same lazy
       orphan prune as EditWeek — a deleted or undone-away draft renders the
       live day, not a ghost. */
    const html = DAYS.map((_: any, di: number) => {
      const ver = DPREV.get(di)
      if (!isDraftVer(ver)) return dayHTML(di, false)
      if (!daySnapOf(di, ver)) { DPREV.delete(di); return dayHTML(di, false) }
      return withDaySnap(di, ver, () => dayHTML(di, false))
    })
    const p = prev.current
    /* both paths hold the week's scroll position (B54) */
    const sl = root.scrollLeft
    let whole = !p || p.length !== html.length || root.children.length !== html.length
    if (!whole) {
      const secs = [...root.children] as HTMLElement[]
      html.forEach((h, i) => { if (h !== p![i]) secs[i].outerHTML = h })
    } else {
      root.innerHTML = html.join('')
    }
    root.scrollLeft = sl
    /* ...unless a page switch left a day to carry (owner, 9 Aug 26): the
       other week was parked on it, and this one lands there rather than
       wherever it was last left. Consumed once — a repaint that is not a
       page switch must keep holding scroll, which is the B54 guarantee the
       line above exists for. */
    if (CARRYDAY != null) { scrollWeekToDay(root, CARRYDAY); setCarryDay(null) }
    prev.current = html
    /* the reference re-hangs selection/highlight classes after every render */
    refreshHighlights()
  }, [version])

  return <div className="week" id="vWeek" ref={ref} />
}
