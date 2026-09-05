/* The read-only week. Day markup comes from the verbatim dayHTML builder, so
   what renders is byte-identical to the reference. The B54 guarantees are
   honoured the same way the reference honours them: each pass compares every
   day's markup with what was last written and swaps ONLY the changed
   <section class="day"> nodes, holding the week's scroll position. React
   owns the container; the day internals migrate to components in later
   surfaces. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { CARRYDAY, CURPAGE, DPREV, PEEKLAND, VWORK, WEEKJUMP, setCarryDay, setPeekLand, setWeekJump, scrollWeekToDay, scrollWeekToLanding } from '../state/view'
import { daySnapOf, dayApproved } from '../engine/publish'
import { isDraftVer } from '../engine/drafts'
import { dayHTML, dayIssuedHTML, withDaySnap } from './html'
import { refreshHighlights } from './highlights'
import { beginGlide } from './weekglide'
import { weekScrollMax, panHold } from './pan'
import { mountPeek } from './peek'
import { useVersion } from './useStore'
import { swapDay, chunksOfHTML, type DayChunks } from './dayswap'

export function ViewWeek() {
  const version = useVersion()
  const ref = useRef<HTMLDivElement>(null)
  /* html: the seven day strings last written; chunks: each day's canonical
     block list for the per-block swap (ui/dayswap.ts) — null for a day a
     whole rebuild wrote, derived from its string the first time it changes */
  const prev = useRef<{ html: string[], chunks: (DayChunks | null)[] } | null>(null)
  /* which (desktop-ness × CURWEEK) key the trailing peek nodes currently
     reflect — '' means none are mounted. See ui/peek.ts:mountPeek. */
  const peekKeyRef = useRef<string>('')

  useEffect(() => {
    /* the reference renders only the page on screen (renderSchedule is called
       for CURPAGE alone); building a hidden week's markup on every store tick
       is pure waste on a throttled phone. The prev cache stays coherent: the
       DOM was not touched while hidden, so the next visible pass diffs
       against exactly what is on screen. */
    if (CURPAGE !== 'viewsched') return
    const root = ref.current!
    /* WHAT EACH DAY RENDERS (owner, 15 Aug 26 — reworked the same day it
       shipped, on the publish confusion):
       · A PUBLISHED day defaults to the ISSUED document — the frozen
         snapshot, so a scheduler's in-progress edits are invisible here
         until the next AL is published. The viewer's one way off that
         default is the day head's own picker (VWORK), which swaps in the
         live working copy under a banner + "Working draft" stamp that say
         exactly what it is. Stored alternative drafts are hidden once a day
         is published, so a d: preview left in DPREV is IGNORED (not
         deleted — the edit page may own it) and the issued default renders.
       · An UNPUBLISHED day renders live, with the drafts-only picker: a
         'd:<id>' DPREV entry renders through the same withDaySnap freeze
         the edit surfaces use, banner and all. ONLY draft vers: the view
         page never grew the ORIG/AL preview machinery, so a preview left
         armed on the edit page stays the edit page's business. Same lazy
         orphan prune as EditWeek — a deleted or undone-away draft renders
         the live day, not a ghost. */
    const html = DAYS.map((_: any, di: number) => {
      if (dayApproved(di)) return VWORK.has(di) ? dayHTML(di, false) : dayIssuedHTML(di)
      const ver = DPREV.get(di)
      if (!isDraftVer(ver)) return dayHTML(di, false)
      if (!daySnapOf(di, ver)) { DPREV.delete(di); return dayHTML(di, false) }
      return withDaySnap(di, ver, () => dayHTML(di, false))
    })
    const p = prev.current
    const sl = root.scrollLeft
    /* capture the outgoing week for the cross-week glide BEFORE the DOM is
       mutated below — null unless this repaint is a phone week cross */
    const runGlide = beginGlide(root)
    /* `< html.length`, not `!==`: once the desktop peek preview (ui/peek.ts)
       appends its own trailing day sections after these seven, root always
       carries MORE children than html.length on an ordinary repaint — that
       is expected, not a sign the live days need rebuilding from scratch.
       Only fewer-than-expected (first mount, or something having wiped the
       week) still forces the full rebuild. */
    const whole = !p || p.html.length !== html.length || root.children.length < html.length
    /* a changed day rewrites only its changed BLOCKS (ui/dayswap.ts) — see
       EditWeek for the reasoning; both weeks swap the same way */
    let chunks: (DayChunks | null)[]
    let wrote = whole   // did this repaint write the week's DOM? (see the hold below)
    if (!whole) {
      const secs = [...root.children] as HTMLElement[]
      chunks = html.map((h, i) => { if (h === p!.html[i]) return p!.chunks[i] ?? null; wrote = true; return swapDay(secs[i]!, h, p!.chunks[i] || chunksOfHTML(p!.html[i]!)) })
    } else {
      root.innerHTML = html.join('')
      chunks = html.map(() => null)
    }
    /* Mount/refresh the trailing peek nodes — a no-op DOM-wise on an ordinary
       repaint (same key, already present), so this never costs the perf-B
       guarantee above. Self-heals the `whole` branch just above, which wipes
       any existing peek nodes as a side effect of resetting innerHTML. */
    peekKeyRef.current = mountPeek(root, html.length, peekKeyRef.current)
    /* A continuous-nav week load lands on the right day — Monday (swiped
       forward), the last day (swiped back), or a specific day index (a calendar
       day-pick) — REPLACING the scroll hold in this same repaint so the new
       week never flashes the day it left. Consumed once. It must not re-pin sl
       first, and the landing writes run with smooth briefly off: .week carries
       scroll-behavior:smooth, so a re-pin plus a landing were TWO animated
       writes, and the second one swept the whole week in the wrong direction
       (owner, 23 Aug 26 — the swipe-across-weeks double sweep). */
    if (WEEKJUMP != null) {
      const was = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      if (WEEKJUMP === 'mon') root.scrollLeft = 0
      else if (WEEKJUMP === 'sun') root.scrollLeft = weekScrollMax(root)
      else scrollWeekToDay(root, WEEKJUMP)
      root.style.scrollBehavior = was
      setWeekJump(null)
    } else if (PEEKLAND != null) {
      /* clicking a peek day: land the now-live day at the exact viewport x the
         clicked preview day sat at, so it "becomes real" in place — the same
         alternative-landing slot as WEEKJUMP above, never both in one repaint. */
      const was = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      scrollWeekToLanding(root, PEEKLAND.di, PEEKLAND.x)
      root.style.scrollBehavior = was
      setPeekLand(null)
    } else {
      /* a within-week repaint holds the week's scroll position (B54) — or the
         glide's destination if one is in flight, so a mid-glide repaint lands on
         the intended day instead of freezing between two (see panHold). */
      /* only a repaint that REWROTE the week holds its scroll (EditWeek has the
         full note): a no-change repaint writing scrollLeft back to itself stops
         an iPhone's still-settling snap where it stands (5 Sep 26). */
      if (wrote) root.scrollLeft = panHold(sl)
      /* ...unless a page switch left a day to carry (owner, 9 Aug 26): the
         other week was parked on it, and this one lands there rather than
         wherever it was last left. Consumed once — a repaint that is not a
         page switch must keep holding scroll, which is the B54 guarantee the
         line above exists for. */
      if (CARRYDAY != null) { scrollWeekToDay(root, CARRYDAY); setCarryDay(null) }
    }
    prev.current = { html, chunks }
    /* the reference re-hangs selection/highlight classes after every render */
    refreshHighlights()
    /* now the new week is written and landed on its near edge — slide it in */
    if (runGlide) runGlide()
  }, [version])

  return <div className="week" id="vWeek" ref={ref} />
}
