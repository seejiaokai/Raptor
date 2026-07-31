/* The read-only week. Day markup comes from the verbatim dayHTML builder, so
   what renders is byte-identical to the reference. The B54 guarantees are
   honoured the same way the reference honours them: each pass compares every
   day's markup with what was last written and swaps ONLY the changed
   <section class="day"> nodes, holding the week's scroll position. React
   owns the container; the day internals migrate to components in later
   surfaces. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { dayHTML } from './html'
import { useVersion } from './useStore'

export function ViewWeek() {
  const version = useVersion()
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef<string[] | null>(null)

  useEffect(() => {
    const root = ref.current!
    const html = DAYS.map((_: any, di: number) => dayHTML(di, false))
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
    prev.current = html
  }, [version])

  return <div className="week" id="vWeek" ref={ref} />
}
