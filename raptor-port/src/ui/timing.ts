/* THE ?timing SWITCH (owner D2481, D2483 — [APP-SPEED] step 1, 24 Nov 26): adding `?timing` to the app's address opens a
   window of how long the app took to start and to open each page ON THIS COMPUTER, so the slow office computer is
   measured itself, not only the 4× slowed stand-in. WITHOUT THE SWITCH NOTHING HERE RUNS: no mark is kept, no watcher is
   started, the readout (ui/TimingReadout.tsx, a download of its own) is never fetched, nothing is drawn or saved.
   This file is the only part in the app's first download — the switch's test, the four marks and the freeze counter,
   which must start before the app's own code runs to see its first long stalls. Everything else waits in the readout.
   It shows nothing about any person and writes nothing to storage. Like `?savefail` (D1666) it is read once, at load. */

export function timingSwitch(search: string): boolean {
  return /[?&]timing(=[^&]*)?(&|$)/.test(search)
}

let ON = typeof location !== 'undefined' && timingSwitch(location.search)
export const timingOn = (): boolean => ON

/** The four moments the app notes, each with `performance.now()` at the moment. `first`: the loading claw goes, the
 *  first screen drawn under it — the sign-in card, or the week if no sign-in was asked. */
export type TimingMark =
  | { kind: 'boot', t: number }
  | { kind: 'first', t: number, screen: 'signin' | 'week' }
  | { kind: 'signin', t: number }
  | { kind: 'page', t: number, page: string }

const waiting: TimingMark[] = []
let sink: ((m: TimingMark) => void) | null = null

/** Note a moment — nothing at all without the switch. Marks made before the readout has arrived wait for it. */
export function timingMark(m: TimingMark): void {
  if (!ON) return
  if (sink) sink(m); else waiting.push(m)
}
/** The readout takes the marks: those waiting first, in order, then each as it comes. */
export function timingSink(f: (m: TimingMark) => void): void {
  if (!ON) return
  sink = f
  for (const m of waiting.splice(0)) f(m)
}
export const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

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

/** Tests only: turn the switch on or off, and start the marks afresh. */
export function setTimingOnForTest(v: boolean): void {
  ON = v
  waiting.length = 0
  sink = null
}
