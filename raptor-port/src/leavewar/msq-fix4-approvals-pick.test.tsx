// @vitest-environment jsdom
/* THE APPROVALS PAGE FOLLOWS THE PICK AT ONCE (D2197; the fix read's A2 — docs/superpowers/briefs/2026-11-23-msq-b1-fixread-astra.md
   finding 2; the re-walk's N1 — docs/handpass/2026-11-23-msq-b1-fixes.md §3). With Leave War → Approvals open, a pick of the
   other squadron left the page drawing the old squadron's war: the top bar said 142, 149's Osprey request was shown, and
   Approve on it did nothing — until Grid was pressed or the page left. Two roots, one each shape:
   - the war store's change count started again at 0 whenever a squadron's war was loaded in place (leavewar/state/store.ts
     initStore), so after a few changes it could read the same number it read before the pick — the page, which redraws
     when that number moves, never redrew (the walker's shape: the war opened on the first squadron earlier in the sign-in);
   - the page keeps its drawn rows across changes by the period's id, and two squadrons' periods with the same dates share
     an id, so the old squadron's rows stayed beside the new one's (Astra's shape).
   Red first: the old squadron's lines stayed on the page. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { enterSquadron, notify } from '../state/store'
import { getState, getVersion, setCell, worldUnit } from './state/store'
import { swapWarWorld } from './sync'
import { ApprovalsPage } from './ui/ApprovalsPage'

useMsqWorld()
afterEach(() => cleanup())

const lines = (c: HTMLElement, pid: string) => c.querySelectorAll(`[data-testid="appr-line-${pid}"]`).length
const DAY = '2026-02-10'
/* a member's bid, placed by him in his own squadron's war (signing in loads it) */
function bid(who: 'ranger' | 'osprey', pid: string): void {
  signInAs(who)
  expect(setCell(pid, DAY, 'LL'), `${who} bids`).toBe(true)
}

describe('Approvals open, the other squadron picked: the page shows the picked squadron\'s war at once (A2, N1)', () => {
  it('Astra\'s shape — the same period dates in both wars: 142\'s rows go when 149 is picked', () => {
    bid('ranger', PID.ranger)
    bid('osprey', PID.osprey)
    const period149 = getState().period.id
    signInAs('saber')
    expect(getState().period.id, 'the two wars\' periods share an id').toBe(period149)
    const page = render(<ApprovalsPage shown />)
    expect(lines(page.container, PID.ranger)).toBeGreaterThan(0)
    act(() => { enterSquadron('u149'); notify() })
    expect(worldUnit()).toBe('u149')
    expect(lines(page.container, PID.osprey), '149\'s request shown').toBeGreaterThan(0)
    expect(lines(page.container, PID.ranger), 'no 142 line under 149').toBe(0)
  })
  it('the war\'s change count never reads the same across a squadron\'s war loaded in place (the walker\'s shape)', () => {
    signInAs('saber')
    const seen = new Set<number>([getVersion()])
    for (const u of ['u149', 'u142', 'u149', 'u142']) {
      act(() => { swapWarWorld(u) })
      expect(seen.has(getVersion()), `the count after loading ${u}'s war is new`).toBe(false)
      seen.add(getVersion())
    }
  })
  it('the walker\'s route: 142\'s Approvals seen first, then 149\'s open, 142 picked — 142\'s requests at once, none of 149\'s', () => {
    bid('ranger', PID.ranger)
    bid('osprey', PID.osprey)
    signInAs('saber')
    const first = render(<ApprovalsPage shown />)
    expect(lines(first.container, PID.ranger)).toBeGreaterThan(0)
    first.unmount()
    act(() => { enterSquadron('u149'); notify() })
    const page = render(<ApprovalsPage shown />)
    expect(lines(page.container, PID.osprey)).toBeGreaterThan(0)
    act(() => { enterSquadron('u142'); notify() })
    expect(worldUnit()).toBe('u142')
    expect(lines(page.container, PID.osprey), 'no 149 line under 142').toBe(0)
    expect(lines(page.container, PID.ranger), '142\'s request shown').toBeGreaterThan(0)
  })
})
