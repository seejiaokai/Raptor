// @vitest-environment jsdom
/* W2-F1 (the reshape walk of 21 Nov 26, walker W2's W2-01) — A PHONE TAP ON A DAY THAT OPENS NOTHING MUST OPEN NOTHING.
   On the iPhone size in WebKit a tap on Ranger's striped Fri 17 Jul opened "Piston Thu 16 Jul" — the man above, the day
   before. Reproduced on this branch's own build (22 Nov 26, scripts kept at D:\raptor-work\fix\warfix\tap.mjs): the tap
   lands on the striped cell (elementFromPoint says so), which takes no click; WebKit then hands a finger's tap to the
   nearest thing that does take one (its own touch adjustment — a day box is about 21 × 18 px on a phone), and the nearest
   was a neighbour's box. Chromium does not. Tried in the page, same tap: a click handler on the striped cell itself, or on
   its ROW, and nothing opens; one on the table alone changes nothing. So each man's row takes the click and does nothing
   with it — one handler a row, none a cell (performance.md §E) — and a tap on any box of his that opens nothing stays his.
   What jsdom can pin is the handler WebKit looks for: React puts a click listener on the row's own node. */
import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { setHome, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs, on } from '../test-support/msq-world'
import { Matrix } from './ui/Matrix'

useMsqWorld()
afterEach(() => { cleanup() })

describe('W2-F1 — a man’s row takes the tap its boxes do not', () => {
  it('every person’s row carries a click handler of its own, so a phone never hands the tap to a neighbour', () => {
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); unitsLoad()
    signInAs('hunter')
    render(<Matrix />)
    const row = screen.getByTestId('row-bane')
    expect(typeof row.onclick, 'the row answers a click itself').toBe('function')
    const cell = screen.getByTestId('cell-bane-2026-07-17')
    expect(cell.className).toContain('gone')
    fireEvent.click(cell)
    expect(document.querySelector('.bidsheet'), 'and the tap opens nothing').toBeNull()
  })
})
