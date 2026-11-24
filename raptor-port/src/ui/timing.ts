/* THE ?timing SWITCH AND ITS STOPWATCH (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26). Adding `?timing` to the
   app's address opens a window of how long the app took to start and to open each page ON THIS COMPUTER, so the slow
   office computer is measured itself, not only the 4× slowed stand-in. WITHOUT THE SWITCH NOTHING HERE RUNS: no mark is
   kept, no watcher or listener is started, the window (ui/timingwindow.tsx and TimingReadout.tsx, a download of its own) is never fetched,
   nothing is drawn or saved. It shows nothing about any person and writes nothing to storage. Read once, at load, like
   `?savefail` (D1666).

   WHY THE STOPWATCH IS HERE AND NOT IN THE WINDOW (Fable's and Astra's blind scenario designs, 24 Nov 26, F2): the window
   is a download of its own and may arrive after the sign-in or a page; a wait started only when it arrived would add its
   download to the time, or time nothing. So the marks are timed here, as they happen, and the window is handed finished
   results — those made before it arrived wait for it.

   HOW A TIME IS TAKEN — the end the speed plan's script uses (docs/superpowers/plans/2026-11-24-app-speed-plan.md §How it
   was measured): from the mark to the second frame after the page is the one on screen (its section `on`) with nothing
   loading over it — its loading claw, which ui/pageclaw.ts draws on the page BODY, not inside the page (F1), gone, and
   the section no longer marked busy. The frame that would finish it looks again (it may have been left in between).
   A ROW NEVER TIMED IS BETTER THAN A WRONG ONE — the figures choose the next speed fix: a page left before it is drawn,
   a page whose download failed (its failure card is not the page — F1b), a wait that spans the tab being hidden (F9),
   a page wait still running when someone signs in (F4) — none gives a row. The sign-in runs from the accepted press to
   the week's days drawn; left for another page first, it is never timed (F3); landing on another page (Retry's reopen,
   D1635), that page is timed from the press, as a page, and no week time follows (F3). */

export function timingSwitch(search: string): boolean {
  return /[?&]timing(=[^&]*)?(&|$)/.test(search)
}

let ON = typeof location !== 'undefined' && timingSwitch(location.search)
export const timingOn = (): boolean => ON

/** The moments the app notes, each with the clock at the moment. `first`: the loading claw goes, the first screen drawn
 *  under it — the sign-in card, or the week if no sign-in was asked. */
export type TimingMark =
  | { kind: 'boot', t: number }
  | { kind: 'first', t: number, screen: 'signin' | 'week' }
  | { kind: 'signin', t: number }
  | { kind: 'page', t: number, page: string }
/** What the window is handed: two points of the start-up, a sign-in's time (null: a new press withdrew the last one),
 *  and each page drawn — `downloaded`, the bytes that came down the line for it (the Leave War and the Tracker only).
 *  `behind`: the tab was not in front at some moment before the first screen — its start-up points are not timed. */
export type TimingEvent =
  | { kind: 'boot', t: number, behind?: true }
  | { kind: 'first', t: number, screen: 'signin' | 'week', behind?: true }
  | { kind: 'signin', ms: number | null }
  | { kind: 'page', page: string, first: boolean, ms: number, downloaded: number }

const browserFrame = (f: () => void): void => { if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => f()); else setTimeout(f, 16) }
let rafFn: (f: () => void) => void = browserFrame
let clockFn: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
export const now = (): number => clockFn()

/* ------------------------------------------------------------------------------------------- handing over to the window */
const waiting: TimingEvent[] = []
let sink: ((e: TimingEvent) => void) | null = null
function emit(e: TimingEvent): void { if (sink) sink(e); else waiting.push(e) }
/** The window takes the results: those waiting first, in order, then each as it comes. */
export function timingSink(f: (e: TimingEvent) => void): void {
  if (!ON) return
  sink = f
  for (const e of waiting.splice(0)) f(e)
}

/* ------------------------------------------------------------------------------------------------------- the stopwatch */
const GIVE_UP_MS = 120_000
/** the pages that come as a download of their own (ui/Shell.tsx, ui/pagedownload.ts) — the only ones a "downloaded" can be */
const OWN_DOWNLOAD = new Set(['leavewar', 'tracker'])
let pageGen = 0
let signinGen = 0
let signinT: number | null = null
let landing = false
let seen = new Set<string>(['viewsched'])

const sectionOf = (p: string) => (typeof document === 'undefined' ? null : document.getElementById('page-' + p))
function pageState(p: string): 'shown' | 'failed' | 'waiting' {
  const s = sectionOf(p)
  if (!s || !s.classList.contains('on')) return 'waiting'
  if (s.querySelector('[data-testid="page-load-fail"]')) return 'failed'
  if (s.hasAttribute('aria-busy') || document.querySelector(`.pgclaw[data-page="${p}"]:not(.gone)`)) return 'waiting'
  return 'shown'
}
const weekState = (): 'shown' | 'waiting' => (typeof document !== 'undefined' && document.querySelector('#page-viewsched.on #vWeek .day') ? 'shown' : 'waiting')

/** Poll frame by frame until `state` says shown, then two frames more, looking again at the last; `alive` false at any
 *  frame ends it with nothing. */
function watch(t0: number, state: () => 'shown' | 'failed' | 'waiting', alive: () => boolean, done: (ms: number) => void): void {
  const poll = () => {
    if (!alive() || now() - t0 > GIVE_UP_MS) return
    const s = state()
    if (s === 'failed') return
    if (s === 'waiting') { rafFn(poll); return }
    rafFn(() => rafFn(() => {
      if (!alive()) return
      if (state() === 'shown') done(now() - t0)
      else rafFn(poll)
    }))
  }
  rafFn(poll)
}

/** what came down the line for the app's own code and styles while a page was awaited (its own download, or the
 *  background fetch of it still arriving) — never the window's own files, and never a file the site answered
 *  "unchanged": it comes with no body, only its answer's header, and was not downloaded (the walk of 24 Nov 26, W14).
 *  Chrome gives a file it already held its body's size all the same (answered "unchanged", or taken from its memory —
 *  W7), so a file counts only when what came down the line is more than its body: the body came with it. And never
 *  exactly 300: the web standard's fixed figure for an "unchanged" answer's header, which a file whose body is under 300
 *  would otherwise pass (chat 165's OPEN 7, proved by chat 167; the same rule as timingtext.ts filesOf — not imported
 *  from there, which would put the readout's words into the app's first download). */
const UNCHANGED_HEADER = 300
/* the OTHER page's own files (named by the bundler after the page: LeaveWarPage-…, TrackerPage-…) are never this page's:
   the Leave War's background download still arriving as the Tracker opened was counted as the Tracker's (Astra's code
   read, chat 165, 3) */
const OTHER_PAGE: Record<string, RegExp> = { leavewar: /\/TrackerPage-/, tracker: /\/LeaveWarPage-/ }
function downloadedBetween(page: string, t0: number, t1: number): number {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return 0
  let b = 0
  for (const e of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
    if (!/\.(js|css)(\?|$)/.test(e.name) || /timingwindow|TimingReadout/i.test(e.name)) continue
    if (OTHER_PAGE[page]?.test(e.name)) continue
    if (e.responseEnd >= t0 && e.startTime <= t1 && e.encodedBodySize > 0 && (e.transferSize || 0) > e.encodedBodySize && e.transferSize !== UNCHANGED_HEADER) b += e.transferSize
  }
  return b
}

function timePage(page: string, from: number): void {
  const gen = ++pageGen
  const first = !seen.has(page)
  watch(from, () => pageState(page), () => gen === pageGen, ms => {
    seen.add(page)
    emit({ kind: 'page', page, first, ms, downloaded: first && OWN_DOWNLOAD.has(page) ? downloadedBetween(page, from, from + ms) : 0 })
  })
}

/* THE PRESS'S OWN MOMENT (the walk of 24 Nov 26, chat 164, W5): a press made while the computer is still busy waits
   before the app hears it — at 4× slow-down a tap on View-only Sched waited 0.86 s — and on the slow office computer
   that wait is part of what he sits through. So a sign-in or a page asked for while a press (a click, a key) is being
   answered is timed from the press as the browser received it — the event's own time stamp, on the same clock as the
   marks — not from the moment the app got to it. Held for the task that answers the press only; a stamp that is not on
   this clock (after the mark, or more than a minute before it) is not used. */
let pressT: number | null = null
function heard(e: Event): void {
  pressT = e.timeStamp
  setTimeout(() => { pressT = null }, 0)
}
const fromPress = (t: number): number => (pressT != null && pressT <= t && t - pressT < 60_000 ? pressT : t)

/** Note a moment — nothing at all without the switch. */
export function timingMark(m: TimingMark): void {
  if (!ON) return
  markTap?.(m)
  if (m.kind === 'boot' || m.kind === 'first') {
    emit(behindBeforeFirst ? { ...m, behind: true } : m)
    if (m.kind === 'first') firstDrawn = true
    return
  }
  const t = fromPress(m.t)
  /* asked for while the tab is hidden (a page the app changes by itself — the role check at midnight): a hidden tab
     draws nothing, so the wait would hold the time it stays hidden — never timed (the fresh Opus read, chat 165, F2) */
  if (tabHidden()) { pageGen++; signinGen++; if (m.kind === 'signin') seen = new Set(['viewsched']); return }
  if (m.kind === 'signin') {
    pageGen++                                  // a page wait from before (a sign-out's own move) ends here (F4)
    /* a new sign-in draws every page afresh (a sign-out that could not reload — a save waiting — drew the app again from
       nothing): each page's next open is a first one (the fresh Opus read, chat 165, F3) */
    seen = new Set(['viewsched'])
    const gen = ++signinGen
    signinT = t
    landing = true
    setTimeout(() => { landing = false }, 0)   // a page asked for in the same task is where the sign-in lands
    emit({ kind: 'signin', ms: null })
    watch(t, weekState, () => gen === signinGen, ms => emit({ kind: 'signin', ms }))
    return
  }
  /* a page asked for */
  if (landing && signinT != null) {
    if (m.page === 'viewsched') return         // the ordinary landing: the sign-in's own wait times it
    signinGen++                                // landing elsewhere (Retry's reopen): no week time follows (F3)
    timePage(m.page, signinT)                  // that page, from the press
    return
  }
  signinGen++                                  // left before the week was drawn: the sign-in is never timed (F3)
  timePage(m.page, t)
}

/* a hidden tab draws no frames: every wait across it is dropped (F9). AND THE START-UP (the walk of 24 Nov 26, chat 164,
   W24): opened in a tab behind another, the first screen waited for him to switch to it — "Sign-in shown at 36.3 s". A
   tab not in front at any moment before the first screen gives the app's load and the first screen no figure; the
   site's answer (the network's) and the sign-in (pressed in the tab itself) are not delayed by it and keep theirs. */
const tabHidden = (): boolean => typeof document !== 'undefined' && document.visibilityState === 'hidden'
let behindBeforeFirst = tabHidden()
let firstDrawn = false
let armed = false
function arm(): void {
  if (armed || typeof document === 'undefined') return
  armed = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return
    pageGen++; signinGen++
    if (!firstDrawn) behindBeforeFirst = true
  })
  /* first in line for every press (the capture phase, on the window), so its stamp is held before any handler marks */
  addEventListener('click', heard, true)
  addEventListener('keydown', heard, true)
}
if (ON) arm()

/** BRIEF FREEZES: the moments the computer was too busy to answer for more than a twentieth of a second (the browser's
 *  own "long task" report — Chromium's; Safari and Firefox give none, and the window says so by name). Started as this
 *  file is read, so it sees the app's own start; `buffered` hands over any the browser kept from before. */
export const FREEZES = { supported: false, n: 0, total: 0, max: 0, onChange: null as null | (() => void) }
function watchFreezes(): void {
  const PO = typeof PerformanceObserver !== 'undefined' ? PerformanceObserver : null
  if (!PO || !(PO.supportedEntryTypes || []).includes('longtask')) return
  FREEZES.supported = true
  try {
    new PO(list => {
      for (const e of list.getEntries()) { FREEZES.n++; FREEZES.total += e.duration; FREEZES.max = Math.max(FREEZES.max, e.duration) }
      FREEZES.onChange?.()
    }).observe({ type: 'longtask', buffered: true })
  } catch { FREEZES.supported = false }
}
if (ON) watchFreezes()

/* ---------------------------------------------------------------------------------------------------------- for tests */
let markTap: ((m: TimingMark) => void) | null = null
/** Tests only: turn the switch on or off and start everything afresh. */
export function setTimingOnForTest(v: boolean): void {
  ON = v
  waiting.length = 0
  sink = null
  markTap = null
  pageGen++; signinGen++
  signinT = null; landing = false
  seen = new Set(['viewsched'])
  behindBeforeFirst = tabHidden(); firstDrawn = false
  if (v) arm()
}
/** Tests only: hand-stepped frames and clock (null: the browser's own). */
export function setFrameForTest(raf: ((f: () => void) => void) | null, clock: (() => number) | null): void {
  rafFn = raf || browserFrame
  clockFn = clock || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()))
}
/** Tests only: the sign-in's landing window closed, as the timer of 0 would close it. */
export function flushLandingForTest(): void { landing = false }
/** Tests only: see each mark as it is made. */
export function setMarkTapForTest(f: ((m: TimingMark) => void) | null): void { markTap = f }
