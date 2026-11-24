/* THE TIMING WINDOW'S START (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26). Downloaded ONLY when the address
   carries `?timing` (main.tsx, behind ui/timing.ts's switch): without it, none of this file, nor the window it draws
   (TimingReadout.tsx) nor its styles, reaches a browser. It takes the stopwatch's finished results (ui/timing.ts — the
   window times nothing itself, so arriving late changes no figure: Fable's and Astra's scenario designs, 24 Nov 26, F2),
   reads the app's files and the computer at each drawing, and draws the window in a root of its own, outside the app's
   tree, so it never re-draws a page. It shows nothing about any person and writes nothing to storage.
   Written without JSX, and importing nothing the app's first download holds (TimingReadout.tsx's head). */
import type { createRoot as createRootT } from 'react-dom/client'
import type { phoneLayout as phoneLayoutT } from './floatwin'
import type { FREEZES as FREEZEST, timingSink as timingSinkT, TimingEvent } from './timing'
import { makeTimingReadout, type ReadoutParts } from './TimingReadout'
import { browserOf, type Files, type PageRow, type TimingView } from './timingtext'

/** Everything this file and the window need from the app, handed over by main.tsx — never imported: an import of any
 *  of them split the app's own first download from 15 files into 19 (the walk of 24 Nov 26, W1; TimingReadout.tsx's
 *  head). */
export type TimingParts = ReadoutParts & {
  createRoot: typeof createRootT
  phoneLayout: typeof phoneLayoutT
  FREEZES: typeof FREEZEST
  timingSink: typeof timingSinkT
}

const PAGE_NAMES: Record<string, string> = {
  viewsched: 'View-only Sched', editsched: 'Edit Schedule', inputs: 'Inputs', quals: 'Quals', logic: 'Logic',
  leavewar: 'Leave War', tracker: 'Tracker', help: 'Help', admin: 'Admin',
}
const KEEP_PAGES = 30
/** the window's own files, never counted among the app's: a visit without the switch would not have them */
const OWN_FILES = /timingwindow|TimingReadout/i

/* ------------------------------------------------------------------------------------------------ what was measured */
const M = {
  app: null as number | null,
  first: null as TimingView['first'],
  signin: null as number | null,
  pages: [] as PageRow[],
  seq: 0,
}
let version = 0
const listeners = new Set<() => void>()
function changed(): void { version++; for (const f of listeners) f() }
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f) } }
/** a re-draw asked for by something that happens often (a freeze, a file arriving, a resize): at most twice a second */
let soonPending = false
function changedSoon(): void { if (soonPending) return; soonPending = true; setTimeout(() => { soonPending = false; changed() }, 500) }

let afterFirst: (() => void) | null = null
function take(e: TimingEvent): void {
  if (e.kind === 'boot') M.app = e.t
  else if (e.kind === 'first') { M.first = { screen: e.screen, t: e.t }; afterFirst?.(); afterFirst = null }
  else if (e.kind === 'signin') M.signin = e.ms
  else {
    const name = PAGE_NAMES[e.page]
    if (!name) return
    M.pages = [{ id: ++M.seq, name, first: e.first, ms: e.ms, downloaded: e.downloaded }, ...M.pages].slice(0, KEEP_PAGES)
  }
  changed()
}

/* ------------------------------------------------------------------------------------------------- read at drawing */
function appFiles(): PerformanceResourceTiming[] {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return []
  return (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
    .filter(e => { try { const u = new URL(e.name); return u.origin === location.origin && /\.(js|css)$/.test(u.pathname) && !OWN_FILES.test(u.pathname) } catch { return false } })
}
function filesNow(): Files {
  const all = appFiles()
  const supported = all.length > 0 && all.every(e => typeof e.transferSize === 'number')
  let bytes = 0, kept = 0, asked = 0
  for (const e of all) {
    bytes += e.encodedBodySize || e.transferSize || 0
    /* kept and used without asking: nothing came down the line; asked again and told "unchanged": only its headers did */
    if (e.transferSize === 0 && e.encodedBodySize > 0) kept++
    else if (e.transferSize > 0 && e.transferSize < e.encodedBodySize) { kept++; asked++ }
  }
  return { supported, n: all.length, bytes, kept, asked }
}
function siteAnswered(): number | null {
  const nav = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined : undefined
  return nav && nav.responseStart > 0 ? nav.responseStart : null
}
/** the freeze counter, handed over with the rest (startTimingReadout) */
let F: TimingParts['FREEZES'] = { supported: false, n: 0, total: 0, max: 0, onChange: null }
function readNow(): TimingView {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return {
    site: siteAnswered(), app: M.app, first: M.first, signin: M.signin, pages: M.pages,
    freezes: { supported: F.supported, n: F.n, total: F.total, max: F.max },
    files: filesNow(),
    env: {
      browser: browserOf(navigator.userAgent),
      cores: nav.hardwareConcurrency || null,
      memGB: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
      screen: `${screen.width}×${screen.height}`,
      window: `${innerWidth}×${innerHeight}`,
      scale: devicePixelRatio || 1,
      openFor: performance.now(),
    },
  }
}

/** The plain text into the clipboard; where the browser refuses that, the older way. True only when it went in. */
async function copyOut(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch { /* the older way below */ }
  /* the older way takes the keyboard for a moment: it is handed back where it was (Fable F8) */
  const was = document.activeElement as HTMLElement | null
  const ta = document.createElement('textarea')
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta); ta.select()
  try { return document.execCommand('copy') } catch { return false } finally { ta.remove(); was?.focus?.({ preventScroll: true }) }
}

/** Called once by main.tsx, behind the switch, with the app's own parts: take the results, keep the figures current,
 *  draw the window. */
export function startTimingReadout(parts: TimingParts): void {
  const { createRoot, phoneLayout, FREEZES, timingSink } = parts
  F = FREEZES
  timingSink(take)
  /* a freeze, a file arriving, a resize: each re-draws the window at most twice a second — never on every one, which
     would itself cost time; so the figures it shows stay current without a page change (Astra's read, 8) */
  FREEZES.onChange = changedSoon
  try { new PerformanceObserver(() => changedSoon()).observe({ type: 'resource', buffered: false }) } catch { /* a browser without it: read at the next re-draw */ }
  addEventListener('resize', changedSoon)
  /* the window is drawn only once the app's first screen is (a task after it), so drawing it never adds to the start-up
     it reports; the results are taken from the start all the same */
  const mount = () => setTimeout(() => {
    const host = document.createElement('div')
    host.id = 'timingRoot'
    document.body.appendChild(host)
    createRoot(host).render(parts.React.createElement(makeTimingReadout(parts), { read: readNow, subscribe, version: () => version, startOpen: !phoneLayout(), copy: copyOut, now: () => new Date() }))
  }, 0)
  if (M.first) mount(); else afterFirst = mount
}
