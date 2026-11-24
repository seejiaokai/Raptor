/* THE TIMING WINDOW (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26): the mock-up of 24 Nov 26
   (https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS) in one of the app's movable windows (FloatWindow.tsx), its words
   Fable's (ui/timingtext.ts). The ✕ folds it to a corner button carrying the newest page's time; open at the start on a
   computer, folded on a phone. Drawn only behind `?timing` (ui/timingwindow.tsx starts it, a download of its own); it
   times nothing itself — it shows what ui/timing.ts's stopwatch handed over.

   HANDED REACT AND THE WINDOW, NEVER IMPORTING THEM (the walk of 24 Nov 26, chat 164, W1): imported here, the bundler
   split the app's OWN first download from 15 files into 19 to share them with this one — for everyone, switch or not
   (D2481: without the switch nothing is downloaded). So the app hands them over (main.tsx), this file imports only its
   own words and styles, and it is written without JSX, which would bring React's JSX file in (timing.test.ts pins it). */
import type * as ReactNS from 'react'
import type { FloatWin as FloatWinT } from './FloatWindow'
import { copyText, readoutSections, secs, type TimingView } from './timingtext'
import './timing.css'

export type ReadoutParts = { React: typeof ReactNS, FloatWin: typeof FloatWinT }
export type ReadoutProps = {
  read: () => TimingView
  subscribe: (f: () => void) => () => void
  /** a number that changes whenever what `read` returns may have changed */
  version: () => number
  startOpen: boolean
  copy: (text: string) => Promise<boolean>
  now: () => Date
}

export function makeTimingReadout({ React, FloatWin }: ReadoutParts): (p: ReadoutProps) => ReactNS.ReactElement {
  const { useEffect, useState, useSyncExternalStore, createElement: h } = React
  return function TimingReadout({ read, subscribe, version, startOpen, copy, now: clock }: ReadoutProps) {
    useSyncExternalStore(subscribe, version, version)
    const view = read()
    const [open, setOpen] = useState(startOpen)
    const [copied, setCopied] = useState(false)
    useEffect(() => {
      if (!copied) return
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    }, [copied])
    /* OPENING BY ITSELF NEVER TAKES THE CARET (Fable F5): the app's windows take the keyboard as they open, right when a
       person opened one; this one opens by itself as the app starts, while he types his name in the sign-in card. Where
       the caret stood is put back after the window's own take (a parent's effect runs after its child's). Opened from
       the corner button, it takes the keyboard as any window does. */
    const [caretAtStart] = useState(() => (typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null))
    useEffect(() => {
      if (startOpen && caretAtStart && caretAtStart !== document.body && caretAtStart.isConnected) caretAtStart.focus({ preventScroll: true })
    }, [startOpen, caretAtStart])   // both fixed for the window's life: once, as it first opens
    if (!open) {
      const last = view.pages[0]
      return h('button', { type: 'button', className: 'abtn timing-pill', onClick: () => setOpen(true) }, 'Timing' + (last ? ' ' + secs(last.ms) : ''))
    }
    /* each press speaks for itself: "Copied" is taken away as the press is made, and shown again only if this copy went in */
    const onCopy = async () => { setCopied(false); if (await copy(copyText(read(), clock()))) setCopied(true) }
    const body = h('div', { className: 'tm-body' }, readoutSections(view).map(s => h('div', { key: s.head },
      h('div', { className: 'tm-h' }, s.head),
      s.empty && h('div', { className: 'tm-empty' }, s.empty),
      s.rows.map(r => h('div', { key: r.key, className: 'tm-r' + (r.gap ? ' tm-gap' : '') },
        h('span', null, r.label, r.tag && h('i', null, r.tag)),
        h('b', null, r.value))))))
    return h(FloatWin, {
      id: 'timing', title: 'Timing', sub: 'This computer only. Shown because the address ends in ?timing', className: 'timingwin',
      onClose: () => setOpen(false),
      /* up since the app started: anything opened after it answers Escape first (FloatWindow.tsx yieldsEscape — the
         walk of 24 Nov 26, W19 (f)) */
      yieldsEscape: true,
      tools: h('button', { type: 'button', className: 'abtn', onClick: onCopy }, copied ? 'Copied' : 'Copy all'),
      children: body,
    })
  }
}
