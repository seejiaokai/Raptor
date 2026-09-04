/* The editable week and its aircrew palette. The week renders through the
   same per-day diff swap as the view page, with ed = the Edit-mode switch;
   the palette renders the verbatim paletteHTML and re-hangs on every store
   change (its scroll survives unchanged markup, as the reference's setHTML
   guarantee had it — the diff here is the innerHTML comparison). */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { dayHTML, dayPreviewHTML } from './html'
import { daySnapOf } from '../engine/publish'
import { paletteHTML, paletteDay } from './palette-html'
import { ARM, CARRYDAY, CURPAGE, DPREV, PEEKLAND, WEEKJUMP, setCarryDay, setPeekLand, setWeekJump, scrollWeekToDay, scrollWeekToLanding } from '../state/view'
import { refreshHighlights } from './highlights'
import { beginGlide } from './weekglide'
import { weekScrollMax, panHold } from './pan'
import { mountPeek } from './peek'
import { editingText } from './textedit'
import { wireRowDrag } from './rowdrag'
import { useVersion } from './useStore'
import { canEditSched } from '../state/auth'
import { swapDay, chunksOfHTML, type DayChunks } from './dayswap'

/* the seven day strings of the edit week — ONE body for the live repaint and
   the idle warm build below, so the two can never draw a different week */
function editDayStrings(ed: boolean): string[] {
  return DAYS.map((_: any, di: number) => {
    /* lazy orphan prune: the previewed AL may have been unpublished or
       undone since the last paint — render the live day, not a ghost */
    if (DPREV.has(di) && !daySnapOf(di, DPREV.get(di))) DPREV.delete(di)
    return DPREV.has(di) ? dayPreviewHTML(di, DPREV.get(di), ed) : dayHTML(di, ed, true)
  })
}
/* THE EDIT SURFACES ARE BUILT ONCE, QUIETLY, AFTER LOGIN (owner, 3 Sep 26 —
   "faster on a slow computer"). Opening Edit Schedule was the worst wait on a
   weak machine: 2.4s at 4x throttle, 7.8s at 8x, because the first open built
   the seven days and the crew palette from nothing — and on a cold JIT. The
   rule that only the page on screen repaints (below) is untouched: this is not
   a repaint-while-hidden, it is one build, in browser idle time, so the tab's
   first click finds the week already standing and the ordinary per-day diff
   writes only what changed since. Scheduler admins only (the tab is hidden
   for a member), and only once the View page is up (login done, week loaded).
   requestIdleCallback is the whole gate: a browser without it (jsdom, the
   parity harness) never warms, so every existing test sees the old timing.
   The warm skips scroll landing, peek nodes and highlights — the live open
   does those, on a week that is then visible and measurable. */
function idleOnce(run: () => void): (() => void) | null {
  const w = window as any
  if (typeof w.requestIdleCallback !== 'function') return null
  const id = w.requestIdleCallback(run, { timeout: 4000 })
  return () => { if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(id) }
}
const canWarm = () => CURPAGE === 'viewsched' && canEditSched()
/* The string builders read HOOKS.editMode() for themselves (html.ts — every
   data-drag / contenteditable hangs off it), and that hook is "a scheduler AND
   the edit page is open". The warm runs while the VIEW page is open, so for
   the length of the build the hook answers as the edit page will — otherwise
   the warm draws the read-only week and the first click throws it all away
   (the `whole` rebuild on p.ed !== ed), which is exactly the cost this exists
   to remove. Restored in a finally, so no other paint can ever see it. */
function asIfEditOpen<T>(fn: () => T): T {
  const was = HOOKS.editMode
  HOOKS.editMode = () => canEditSched()
  try { return fn() } finally { HOOKS.editMode = was }
}

export function EditWeek() {
  const version = useVersion()
  const ref = useRef<HTMLDivElement>(null)
  /* html: the seven day strings last written; chunks: each day's canonical
     block list for the per-block swap (ui/dayswap.ts) — null for a day a
     whole rebuild wrote, derived from its string the first time it changes */
  const prev = useRef<{ ed: boolean, html: string[], chunks: (DayChunks | null)[] } | null>(null)
  const warm = useRef<{ armed: boolean, cancel: (() => void) | null }>({ armed: false, cancel: null })
  useEffect(() => {
    if (warm.current.armed || !canWarm()) return
    const cancel = idleOnce(() => {
      const root = ref.current
      if (!root || prev.current || CURPAGE === 'editsched') return   // opened meanwhile — the live paint owns it
      const ed = canEditSched()
      const html = asIfEditOpen(() => editDayStrings(ed))
      root.innerHTML = html.join('')
      prev.current = { ed, html, chunks: html.map(() => null) }
      /* the desktop next-week preview is a SECOND seven days of markup (ui/peek.ts)
         — the traced open still spent ~1s at 4x building it after the warm had
         built the live week, so it warms here too. mountPeek reads no layout
         (a key off desktop-ness × CURWEEK), so a hidden root is fine; the live
         open's own mountPeek then finds the key unchanged and does nothing. */
      peekKeyRef.current = asIfEditOpen(() => mountPeek(root, html.length, peekKeyRef.current))
    })
    /* armed only once an idle slot is actually booked — a browser without the
       API leaves this un-armed (and never warms), rather than armed-and-empty */
    if (cancel) warm.current = { armed: true, cancel }
  }, [version])
  useEffect(() => () => { if (warm.current.cancel) warm.current.cancel() }, [])
  /* which (desktop-ness × CURWEEK) key the trailing peek nodes currently
     reflect — '' means none are mounted. See ui/peek.ts:mountPeek. */
  const peekKeyRef = useRef<string>('')

  useEffect(() => {
    /* only the page on screen is rendered (as the reference's renderSchedule
       gate has it). The week behind the open board still repaints for real
       mutations because safety flows deliberately address that mounted DOM;
       boardTab's narrow notification lane prevents day-only swipes from
       reaching this effect at all. */
    if (CURPAGE !== 'editsched') return
    const root = ref.current!
    /* never repaint under the caret — the deferred commit repaints once focus
       has left every text field (the reference's txtCommit guarantee) */
    if (editingText()) return
    const ed = HOOKS.editMode()
    const html = editDayStrings(ed)
    const p = prev.current
    const sl = root.scrollLeft
    /* capture the outgoing week for the cross-week glide BEFORE the DOM is
       mutated below — null unless this repaint is a phone week cross */
    const runGlide = beginGlide(root)
    /* `< html.length`, not `!==` — see ViewWeek for the full reasoning: once
       the desktop peek preview (ui/peek.ts) appends its own trailing day
       sections, root always carries more children than html.length on an
       ordinary repaint. */
    const whole = !p || p.ed !== ed || p.html.length !== html.length || root.children.length < html.length
    /* a changed day rewrites only its changed BLOCKS (ui/dayswap.ts) — a drop
       into one row re-parses, re-styles and lays out one ~150-element block
       instead of the ~1,500-element day (the 6 Sep 26 drop round) */
    let chunks: (DayChunks | null)[]
    if (!whole) {
      const secs = [...root.children] as HTMLElement[]
      chunks = html.map((h, i) => h === p!.html[i] ? (p!.chunks[i] ?? null) : swapDay(secs[i]!, h, p!.chunks[i] || chunksOfHTML(p!.html[i]!)))
    } else {
      root.innerHTML = html.join('')
      chunks = html.map(() => null)
    }
    /* mount/refresh the trailing peek nodes — see ViewWeek for the full
       reasoning (a no-op on an ordinary repaint; self-heals the `whole`
       branch's wipe). */
    peekKeyRef.current = mountPeek(root, html.length, peekKeyRef.current)
    /* a continuous-nav week load lands on Monday / the last day / a specific day
       index, REPLACING the scroll hold — no sl re-pin first, and smooth briefly
       off for the landing writes, or the two animated writes sweep the whole
       week the wrong way (owner, 23 Aug 26). See ViewWeek for the full
       reasoning; consumed in this same repaint. */
    if (WEEKJUMP != null) {
      const was = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      if (WEEKJUMP === 'mon') root.scrollLeft = 0
      else if (WEEKJUMP === 'sun') root.scrollLeft = weekScrollMax(root)
      else scrollWeekToDay(root, WEEKJUMP)
      root.style.scrollBehavior = was
      setWeekJump(null)
    } else if (PEEKLAND != null) {
      /* clicking a peek day — see ViewWeek for the full reasoning; the same
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
      root.scrollLeft = panHold(sl)
      /* the carried day from a page switch — see ViewWeek for the reasoning;
         both weeks consume it the same way so the hop works in both directions */
      if (CARRYDAY != null) { scrollWeekToDay(root, CARRYDAY); setCarryDay(null) }
    }
    prev.current = { ed, html, chunks }
    refreshHighlights()
    /* now the new week is written and landed on its near edge — slide it in */
    if (runGlide) runGlide()
  }, [version])

  /* drag-to-reorder, attached ONCE and delegated on the week root so it survives
     every per-day repaint underneath it (same reason as the board's wiring). On
     the week only the section (.dsec) and wave (.go) grips exist — line reorder
     stays board-only — so the row branch of the machine simply never fires here. */
  useEffect(() => wireRowDrag(ref.current!), [])

  return <div className="week" id="eWeek" ref={ref} />
}

const rosterHTML = () => `<div class="ros-tab" id="rosTab" title="Aircrew palette"><b>${ARM ? 'PLAN' : 'AIRCREW'}</b></div>`
  + `<div class="ros-body">${paletteHTML(paletteDay())}</div>`

export function EditRoster() {
  const version = useVersion()
  const ref = useRef<HTMLElement>(null)
  const prev = useRef<string>('')
  /* the same one-time idle warm as the week above — the palette is the other
     half of what the first Edit click used to build from nothing */
  const warm = useRef<{ armed: boolean, cancel: (() => void) | null }>({ armed: false, cancel: null })
  useEffect(() => {
    if (warm.current.armed || !canWarm()) return
    const cancel = idleOnce(() => {
      const el = ref.current
      if (!el || prev.current || CURPAGE === 'editsched') return
      const html = asIfEditOpen(rosterHTML)
      el.innerHTML = html; prev.current = html
    })
    if (cancel) warm.current = { armed: true, cancel }
  }, [version])
  useEffect(() => () => { if (warm.current.cancel) warm.current.cancel() }, [])

  useEffect(() => {
    if (CURPAGE !== 'editsched') return
    const el = ref.current!
    const html = rosterHTML()
    if (html !== prev.current) { el.innerHTML = html; prev.current = html }
  }, [version])

  return <aside className="sb-roster eroster" id="eRoster" ref={ref} />
}
