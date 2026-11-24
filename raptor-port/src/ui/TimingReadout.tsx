/* THE TIMING WINDOW (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26). Downloaded ONLY when the address carries
   `?timing` (main.tsx, behind ui/timing.ts's switch): without it, none of this file reaches a browser. It takes the
   app's marks (ui/timing.ts), times each to the moment its screen is drawn, and shows them in one of the app's movable
   windows (FloatWindow.tsx) — the mock-up of 24 Nov 26 (https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS), its words
   Fable's (ui/timingtext.ts). The ✕ folds it to a corner button; open at the start on a computer, folded on a phone.
   Its own root, outside the app's tree, so it never re-draws a page. It TIMES nothing itself: the stopwatch is
   ui/timing.ts, which times each moment as it happens and hands finished results here, so the window arriving late
   changes no figure (Fable's and Astra's scenario designs, 24 Nov 26, F2). It shows nothing about any person and
   writes nothing to storage. */
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { FloatWin } from './FloatWindow'
import { phoneLayout } from './floatwin'
import { FREEZES, timingSink, type TimingEvent } from './timing'
import { browserOf, copyText, readoutSections, secs, type Files, type PageRow, type TimingView } from './timingtext'
import './timing.css'

const PAGE_NAMES: Record<string, string> = {
  viewsched: 'View-only Sched', editsched: 'Edit Schedule', inputs: 'Inputs', quals: 'Quals', logic: 'Logic',
  leavewar: 'Leave War', tracker: 'Tracker', help: 'Help', admin: 'Admin',
}
const KEEP_PAGES = 30

/* ------------------------------------------------------------------------------------------------ what was measured */
const M = {
  app: null as number | null,
  first: null as TimingView['first'],
  signin: null as number | null,
  pages: [] as PageRow[],
}
let version = 0
const listeners = new Set<() => void>()
function changed(): void { version++; for (const f of listeners) f() }
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f) } }
/** a re-draw asked for by something that happens often (a freeze, a file arriving, a resize): at most twice a second */
let soonPending = false
function changedSoon(): void { if (soonPending) return; soonPending = true; setTimeout(() => { soonPending = false; changed() }, 500) }

function take(e: TimingEvent): void {
  if (e.kind === 'boot') M.app = e.t
  else if (e.kind === 'first') { M.first = { screen: e.screen, t: e.t }; afterFirst?.(); afterFirst = null }
  else if (e.kind === 'signin') M.signin = e.ms
  else {
    const name = PAGE_NAMES[e.page]
    if (!name) return
    M.pages = [{ name, first: e.first, ms: e.ms, downloaded: e.downloaded }, ...M.pages].slice(0, KEEP_PAGES)
  }
  changed()
}

/** the app's own code and style files — never the window's own two, which a visit without the switch would not have */
function appFiles(): PerformanceResourceTiming[] {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return []
  return (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
    .filter(e => { try { const u = new URL(e.name); return u.origin === location.origin && /\.(js|css)$/.test(u.pathname) && !/TimingReadout/.test(u.pathname) } catch { return false } })
}

/* ------------------------------------------------------------------------------------------------- read at drawing */
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
function readNow(): TimingView {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return {
    site: siteAnswered(), app: M.app, first: M.first, signin: M.signin, pages: M.pages,
    freezes: { supported: FREEZES.supported, n: FREEZES.n, total: FREEZES.total, max: FREEZES.max },
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

/* --------------------------------------------------------------------------------------------------------- the window */
export function TimingReadout({ read, subscribe: sub, startOpen, copy, now: clock }: {
  read: () => TimingView
  subscribe: (f: () => void) => () => void
  startOpen: boolean
  copy: (text: string) => Promise<boolean>
  now: () => Date
}) {
  useSyncExternalStore(sub, () => version, () => version)
  const view = read()
  const [open, setOpen] = useState(startOpen)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])
  /* OPENING BY ITSELF NEVER TAKES THE CARET (Fable F5): the app's windows take the keyboard as they open, right when a
     person opened one; this one opens by itself as the app starts, while he types his name in the sign-in card. Where the
     caret stood is put back after the window's own take (a parent's effect runs after its child's). Opened from the
     corner button, it takes the keyboard as any window does. */
  const [caretAtStart] = useState(() => (typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null))
  useEffect(() => {
    if (startOpen && caretAtStart && caretAtStart !== document.body && caretAtStart.isConnected) caretAtStart.focus({ preventScroll: true })
  }, [startOpen, caretAtStart])   // both fixed for the window's life: once, as it first opens
  if (!open) {
    const last = view.pages[0]
    return <button type="button" className="abtn timing-pill" onClick={() => setOpen(true)}>{'Timing' + (last ? ' ' + secs(last.ms) : '')}</button>
  }
  /* each press speaks for itself: "Copied" is taken away as the press is made, and shown again only if this copy went in */
  const onCopy = async () => { setCopied(false); if (await copy(copyText(read(), clock()))) setCopied(true) }
  return (
    <FloatWin id="timing" title="Timing" sub="This computer only. Shown because the address ends in ?timing" className="timingwin"
      onClose={() => setOpen(false)}
      tools={<button type="button" className="abtn" onClick={onCopy}>{copied ? 'Copied' : 'Copy all'}</button>}>
      <div className="tm-body">
        {readoutSections(view).map(s => (
          <div key={s.head}>
            <div className="tm-h">{s.head}</div>
            {s.empty && <div className="tm-empty">{s.empty}</div>}
            {s.rows.map((r, i) => (
              <div key={i} className={'tm-r' + (r.gap ? ' tm-gap' : '')}>
                <span>{r.label}{r.tag && <i>{r.tag}</i>}</span><b>{r.value}</b>
              </div>
            ))}
          </div>
        ))}
      </div>
    </FloatWin>
  )
}

/** Called once by main.tsx, behind the switch: take the marks, count the freezes as they come, draw the window. */
export function startTimingReadout(): void {
  timingSink(take)
  /* a freeze, a file arriving, a resize: each re-draws the window at most twice a second — never on every one, which
     would itself cost time; so the figures it shows stay current without a page change (Astra's read, 8) */
  FREEZES.onChange = changedSoon
  try { new PerformanceObserver(() => changedSoon()).observe({ type: 'resource', buffered: false }) } catch { /* a browser without it: read at the next re-draw */ }
  addEventListener('resize', changedSoon)
  /* the window is drawn only once the app's first screen is (a frame after it), so drawing it never adds to the start-up
     it reports; the marks are taken from the start all the same */
  const mount = () => setTimeout(() => {
    const host = document.createElement('div')
    host.id = 'timingRoot'
    document.body.appendChild(host)
    createRoot(host).render(<TimingReadout read={readNow} subscribe={subscribe} startOpen={!phoneLayout()} copy={copyOut} now={() => new Date()} />)
  }, 0)
  if (M.first) mount(); else afterFirst = mount
}
let afterFirst: (() => void) | null = null
