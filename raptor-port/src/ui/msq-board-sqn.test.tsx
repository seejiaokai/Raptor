// @vitest-environment jsdom
/* THE BOARD'S SQUADRON NUMBER (batch 1's second half, the plan docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md
   §3 item 8; the approved drawing docs/mock/2026-11-22-msq-b1-screens/img/b1-2-d.png and -p.png): a small grey number
   beside the Scheduler Board's day title — the schedule in view's (ui/export.ts sqnNum('schedule')), so with 149 picked
   it reads 149. The drawing draws it on 142's own board with no condition, so it shows for every squadron in view.
   Geometry (nothing else in the bar moving, the phone's ellipsis) is the browser's: e2e/msq-job2.spec.ts.
   Red first: before the change the title carried no number. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { pickSquadron } from '../state/pick'
import { SchedBoard } from './SchedBoard'

useMsqWorld()
afterEach(() => cleanup())

const num = (c: HTMLElement) => c.querySelector('#schedBoard .sb-title .sb-sqn')?.textContent ?? null

describe('the board\'s squadron number', () => {
  it('reads 142 on 142\'s own board, beside the day title', () => {
    signInAs('saber')
    const { container } = render(<SchedBoard />)
    expect(num(container)).toBe('142')
  })
  it('reads 149 once Saber picks 149, and 142 again once he picks 142', () => {
    signInAs('saber')
    const { container } = render(<SchedBoard />)
    act(() => { void pickSquadron('u149') })
    expect(num(container)).toBe('149')
    act(() => { void pickSquadron('u142') })
    expect(num(container)).toBe('142')
  })
})
