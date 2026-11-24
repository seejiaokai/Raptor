/* THE TIMING WINDOW (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26). Downloaded ONLY when the address carries
   `?timing` (main.tsx, behind ui/timing.ts's switch): without it, none of this file reaches a browser. It takes the
   app's marks (ui/timing.ts), times each to the moment its screen is drawn, and shows them in one of the app's movable
   windows (FloatWindow.tsx) — the mock-up of 24 Nov 26 (https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS), its words
   Fable's (ui/timingtext.ts). The ✕ folds it to a corner button; open at the start on a computer, folded on a phone.
   Its own root, outside the app's tree, so it never re-draws a page; it reads the page only to see when one is drawn.
   It shows nothing about any person and writes nothing to storage.

   HOW A TIME IS TAKEN — the same end the speed notes' scripts use (docs/superpowers/plans/2026-11-24-app-speed-plan.md
   §How it was measured): from the mark to the second frame after the page is the one on screen and no loading claw
   stands over it — the first frame after shows it, the second proves it was painted. The sign-in ends on the week's
   days drawn, on the same two frames. The first screen is the moment the start-up claw is taken away (main.tsx), which
   is when the app has drawn itself under it. */
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { FloatWin } from './FloatWindow'
import { phoneLayout } from './floatwin'
import { FREEZES, now, timingSink, type TimingMark } from './timing'
import { browserOf, copyText, readoutSections, secs, type Files, type PageRow, type TimingView } from './timingtext'
import './timing.css'

const PAGE_NAMES: Record<string, string> = {
  viewsched: 'View-only Sched', editsched: 'Edit Schedule', inputs: 'Inputs', quals: 'Quals', logic: 'Logic',
  leavewar: 'Leave War', tracker: 'Tracker', help: 'Help', admin: 'Admin',
}
/** a page asked for this close after a sign-in is the sign-in's own landing, timed once there, not twice */
const SIGNIN_LANDING_MS = 50
const GIVE_UP_MS = 120_000
const KEEP_PAGES = 30

/* ------------------------------------------------------------------------------------------------ what was measured */
const M = {
  app: null as number | null,
  first: null as TimingView['first'],
  signin: null as number | null,
  lastSignin: -Infinity,
  pages: [] as PageRow[],
  seen: new Set<string>(['viewsched']),
}
let version = 0
const listeners = new Set<() => void>()
function changed(): void { version++; for (const f of listeners) f() }
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f) } }

/** Watch for a condition, then two frames more: the time from `t0` to then. A newer watch of the same kind replaces it. */
const watches: Record<string, number> = {}
function timeUntil(kind: string, t0: number, shown: () => boolean, done: (ms: number) => void): void {
  const id = (watches[kind] = (watches[kind] || 0) + 1)
  const step = () => {
    if (watches[kind] !== id) return
    if (now() - t0 > GIVE_UP_MS) return
    if (!shown()) { requestAnimationFrame(step); return }
    requestAnimationFrame(() => requestAnimationFrame(() => { if (watches[kind] === id) done(now() - t0) }))
  }
  requestAnimationFrame(step)
}
const pageShown = (p: string) => {
  const s = document.getElementById('page-' + p)
  return !!s && s.classList.contains('on') && !s.querySelector('.pgclaw:not(.gone)')
}
const weekShown = () => !!document.querySelector('#page-viewsched.on #vWeek .day')

/** what came down the line for the app's own code and styles since `t0` (the page's own download) */
function downloadedSince(t0: number): number {
  let b = 0
  for (const e of appFiles()) if (e.startTime >= t0) b += e.transferSize || 0
  return b
}
function appFiles(): PerformanceResourceTiming[] {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return []
  return (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
    .filter(e => { try { const u = new URL(e.name); return u.origin === location.origin && /\.(js|css)$/.test(u.pathname) } catch { return false } })
}

function take(m: TimingMark): void {
  if (m.kind === 'boot') { M.app = m.t; changed(); return }
  if (m.kind === 'first') { M.first = { screen: m.screen, t: m.t }; changed(); afterFirst?.(); afterFirst = null; return }
  if (m.kind === 'signin') {
    M.lastSignin = m.t
    timeUntil('signin', m.t, weekShown, ms => { M.signin = ms; changed() })
    return
  }
  /* a page asked for */
  const name = PAGE_NAMES[m.page]
  if (!name || m.t - M.lastSignin < SIGNIN_LANDING_MS) return
  const first = !M.seen.has(m.page)
  timeUntil('page', m.t, () => pageShown(m.page), ms => {
    M.seen.add(m.page)
    M.pages = [{ name, first, ms, downloaded: first ? downloadedSince(m.t) : 0 }, ...M.pages].slice(0, KEEP_PAGES)
    changed()
  })
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
      zoom: devicePixelRatio || 1,
    },
  }
}

/** The plain text into the clipboard; where the browser refuses that, the older way. True only when it went in. */
async function copyOut(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch { /* the older way below */ }
  const ta = document.createElement('textarea')
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta); ta.select()
  try { return document.execCommand('copy') } catch { return false } finally { ta.remove() }
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
  if (!open) {
    const last = view.pages[0]
    return <button type="button" className="abtn timing-pill" onClick={() => setOpen(true)}>{'Timing' + (last ? ' ' + secs(last.ms) : '')}</button>
  }
  const onCopy = async () => { if (await copy(copyText(read(), clock()))) setCopied(true) }
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
  /* a freeze re-draws the window at most twice a second — never on every one, which would itself cost time */
  let pending = false
  FREEZES.onChange = () => { if (pending) return; pending = true; setTimeout(() => { pending = false; changed() }, 500) }
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
