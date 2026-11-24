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
  const { useEffect, useRef, useState, useSyncExternalStore, createElement: h } = React
  return function TimingReadout({ read, subscribe, version, startOpen, copy, now: clock }: ReadoutProps) {
    useSyncExternalStore(subscribe, version, version)
    const view = read()
    const [open, setOpen] = useState(startOpen)
    /* OPENING BY ITSELF NEVER TAKES THE CARET NOR COMES FORWARD (Fable F5; the code reads of chat 165): opened as the app
       starts, while he types his name in the sign-in card, it is a bystander opened quietly (FloatWindow.tsx). Opened
       from the corner button, it comes forward and takes the keyboard as any window does. */
    const [quiet, setQuiet] = useState(startOpen)
    const [copied, setCopied] = useState(false)
    useEffect(() => {
      if (!copied) return
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    }, [copied])
    /* EACH COPY PRESS SPEAKS FOR ITSELF, THE NEWEST ONLY (Astra's code read, chat 165, 2): two presses with the first
       still being answered — only the newest may say "Copied", and folding the window forgets both */
    const copyReq = useRef(0)
    /* FOLDED BY A PRESS, THE KEYS GO TO THE CORNER BUTTON (Astra's code read, 4): the window's opener was the corner
       button, gone while the window is up, so the keys were left on nothing */
    const pill = useRef<HTMLButtonElement | null>(null)
    const foldedByPress = useRef(false)
    useEffect(() => {
      if (open || !foldedByPress.current) return
      foldedByPress.current = false
      const at = document.activeElement
      if (!at || at === document.body) pill.current?.focus({ preventScroll: true })
    }, [open])
    if (!open) {
      const last = view.pages[0]
      return h('button', { type: 'button', className: 'abtn timing-pill', ref: pill, onClick: () => { setQuiet(false); setOpen(true) } }, 'Timing' + (last ? ' ' + secs(last.ms) : ''))
    }
    const onCopy = async () => {
      const mine = ++copyReq.current
      setCopied(false)
      const ok = await copy(copyText(read(), clock()))
      if (ok && mine === copyReq.current) setCopied(true)
    }
    const body = h('div', { className: 'tm-body' }, readoutSections(view).map(s => h('div', { key: s.head },
      h('div', { className: 'tm-h' }, s.head),
      s.empty && h('div', { className: 'tm-empty' }, s.empty),
      s.rows.map(r => h('div', { key: r.key, className: 'tm-r' + (r.gap ? ' tm-gap' : '') },
        h('span', null, r.label, r.tag && h('i', null, r.tag)),
        h('b', null, r.value))))))
    return h(FloatWin, {
      id: 'timing', title: 'Timing', sub: 'This computer only. Shown because the address ends in ?timing', className: 'timingwin',
      onClose: () => { copyReq.current++; setCopied(false); foldedByPress.current = true; setOpen(false) },
      /* up all session: Escape is its own only with the keys inside it (FloatWindow.tsx bystander — the walk of 24 Nov 26,
         W19 (f), and the code reads of chat 165) */
      bystander: true,
      quietOpen: quiet,
      tools: h('button', { type: 'button', className: 'abtn', onClick: onCopy }, copied ? 'Copied' : 'Copy all'),
      children: body,
    })
  }
}
