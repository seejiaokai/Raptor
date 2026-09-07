// The balance bar the figure drag raises (owner, 6 Sep 26).

import { useEffect, useRef } from 'react'
import type { CounterName, Figure } from '../engine'
import { figureCtxOf } from '../state/store'
import { CreditForm } from './CreditForm'
import { KEYBOARD_MIN } from './Sheet'

/**
 * The docked bar after a drag down a figure column (owner, 6 Sep 26): "N
 * people · +CCL", the credit form, Save, ✕. NOT a Sheet — a Sheet's touch
 * shield would swallow presses on the very boxes being selected, and its
 * popup family dismisses on scroll. This is a viewport-docked panel in the
 * move banner's slot and recipe (matrix.css `.balbar`), so it stays up while
 * the grid scrolls under it and sits above a phone's keyboard.
 */
export function BalanceBar({ figure, ids, onDone, onClose }: {
  figure: Figure & { counter: CounterName }
  ids: string[]
  onDone: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDockAboveKeyboard(ref)
  // Autofocus the number on a computer only: on a phone the keyboard would
  // cover half the run that was just selected before the person has looked.
  const fine = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches
  const n = ids.length
  return (
    <div className="balbar" data-testid="balance-bar" role="group" aria-label={`${figure.label}: ${n} ${n === 1 ? 'person' : 'people'}`} ref={ref}>
      {/* KEYED ON THE POOL ALONE (review, 6 Sep 26). The key was the pool AND
          the run, so a second drag that EXTENDED the run remounted the form and
          threw away whatever had been typed into it — on OIL that is the amount,
          the date, the reason and the given-by, gone because two more people
          were added. The run is a prop; only a change of POOL is a different
          credit and deserves a fresh form. */}
      <CreditForm
        key={figure.id}
        counter={figure.counter}
        ids={ids}
        who={<>{n} {n === 1 ? 'person' : 'people'} · <b className="pool">{figure.title}</b></>}
        today={figureCtxOf().asOf!}
        initialAmount=""
        autoFocus={fine}
        onDone={onDone}
        onCancel={onClose}
      />
    </div>
  )
}

/** Keep the bar above the phone's keyboard. A `position: fixed; bottom` panel
 *  is anchored to the LAYOUT viewport, which iOS does not shrink for the
 *  keyboard — the visual viewport does, so the bar's bottom follows that gap
 *  while a keyboard is up. `KEYBOARD_MIN` is Sheet's own threshold, imported
 *  rather than restated, so a URL bar showing or hiding never moves either of
 *  them and the two cannot fall out of step. */
function useDockAboveKeyboard(ref: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const vv = window.visualViewport
    const el = ref.current
    if (!vv || !el) return
    const GAP = 14
    const place = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop
      el.style.bottom = window.innerHeight - vv.height > KEYBOARD_MIN ? `${Math.max(0, covered) + GAP}px` : ''
    }
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => { vv.removeEventListener('resize', place); vv.removeEventListener('scroll', place) }
  }, [ref])
}
