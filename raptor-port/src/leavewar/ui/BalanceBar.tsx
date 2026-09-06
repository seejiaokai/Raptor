// The balance bar the figure drag raises (owner, 6 Sep 26).

import { useEffect, useRef } from 'react'
import type { CounterName, Figure } from '../engine'
import { figureCtxOf } from '../state/store'
import { CreditForm } from './CreditForm'

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
      <CreditForm
        key={`${figure.id}|${ids.join('|')}`}
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
 *  while a keyboard is up. The same threshold as Sheet's own hook, so a URL
 *  bar showing or hiding does not move it. */
function useDockAboveKeyboard(ref: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const vv = window.visualViewport
    const el = ref.current
    if (!vv || !el) return
    const KEY = 120, GAP = 14
    const place = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop
      el.style.bottom = window.innerHeight - vv.height > KEY ? `${Math.max(0, covered) + GAP}px` : ''
    }
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => { vv.removeEventListener('resize', place); vv.removeEventListener('scroll', place) }
  }, [ref])
}
