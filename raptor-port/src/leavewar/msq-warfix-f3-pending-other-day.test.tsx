// @vitest-environment jsdom
/* W2-F3 (the reshape walk of 21 Nov 26, walker W2's W2-05) — A PENDING BID LEFT ON A DAY NOW ANOTHER SQUADRON'S.
   Ranger bids LL Fri 24 Jul in 142's war; then Move M (142 → 149 from Thu 16 Jul). The bid stays in 142's war, listed and
   counted in 142's Approvals; the walk found Approve AND Refuse both answering the generic "Couldn't decide that — the week
   is locked, or something else refused it", and no door that removes it (its dates link rings a striped cell that opened
   nothing). His D2243 Q3: nobody puts his leave into his old squadron's war for a day after his move — refused for
   everyone; a removal is never refused. Q3/Q6's sentence: "Ranger is 149's from Thu 16 Jul, so this can't go back into
   142's Leave War."
   So: Approve is refused in that sentence, in every door (Approvals, the day's list — its Approve greyed with it); Refuse,
   a change and not a removal, is refused in the app's generic "This change could not be saved." (no ruling gives words);
   and the removal is reachable — the striped day holding the war's own bid opens the day's list for an admin and for the
   man himself, its Delete working. The line stays listed and counted until it is removed (no ruling: recorded). */
import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { setCell, worldUnit, openDates, decideRequests, decideRequestById, clearRecordById, rawState, getState } from './state/store'
import { setHome, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs, on } from '../test-support/msq-world'
import { warHolding } from './engine'
import { recsAt, type RequestRec } from './engine/warrecs'
import { bidHeldWhy } from './sync'
import { pendingCount, linesOfWar } from './approvals'
import { Matrix } from './ui/Matrix'

useMsqWorld()
afterEach(() => { cleanup() })

const FRI = '2026-07-24'
const SENTENCE = "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War."
const NOT_SAVED = 'This change could not be saved.'
const reqs = (pid: string, date: string) => recsAt(warHolding(rawState().wars, date)!.recs, pid, date).filter((r): r is RequestRec => r.kind === 'request')
const lineOf = (pid: string) => linesOfWar(warHolding(getState().wars, FRI) as any).find(l => l.personId === pid && l.from === FRI)

/* Saber opens July; Ranger bids LL Fri 24 in 142's war; Move M; the clock to `day` */
function bidThenMoved(day = 16): string {
  signInAs('saber')
  expect(openDates('2026-07-01', '2026-07-31')).toBe('set')
  signInAs('ranger')
  expect(setCell('bane', FRI, 'LL')).toBe(true)
  signInAs('saber')
  expect(setHome('bane', 'u149').ok).toBe(true)
  if (day !== 15) { on(day); unitsLoad() }
  return reqs('bane', FRI)[0]!.id
}

describe('W2-F3 — a pending bid on a day now 149’s, in 142’s war', () => {
  it('Approve is refused in the ruled sentence — Approvals’ writer, the day’s list, and the greyed button’s title', () => {
    const id = bidThenMoved()
    signInAs('hunter')
    expect(worldUnit()).toBe('u142')
    const out = decideRequests([{ personId: 'bane', parts: [{ date: FRI, recId: id, code: 'LL', state: 'pending' }], to: 'approved' }])
    expect(out[0]).toEqual({ kind: 'refused', why: SENTENCE })
    expect(decideRequestById('bane', FRI, id, 'approved')).toBe(SENTENCE)
    expect(bidHeldWhy('bane', FRI, id)).toBe(SENTENCE)
    expect(reqs('bane', FRI).map(r => r.state), 'nothing changed').toEqual(['pending'])
  })
  it('Refuse (a change, not a removal) is refused in the generic words, never "the week is locked"', () => {
    const id = bidThenMoved()
    signInAs('hunter')
    const out = decideRequests([{ personId: 'bane', parts: [{ date: FRI, recId: id, code: 'LL', state: 'pending' }], to: 'refused' }])
    expect(out[0]).toEqual({ kind: 'refused', why: NOT_SAVED })
    expect(decideRequestById('bane', FRI, id, 'refused')).toBe(NOT_SAVED)
    expect(reqs('bane', FRI).map(r => r.state)).toEqual(['pending'])
  })
  it('it stays listed and counted until it is removed; the removal goes through', () => {
    const id = bidThenMoved()
    signInAs('hunter')
    const before = pendingCount()
    expect(lineOf('bane'), 'listed in 142’s Approvals').toBeTruthy()
    expect(clearRecordById('bane', FRI, id), 'a removal is never refused (D2243 Q3)').toBe(true)
    expect(reqs('bane', FRI)).toEqual([])
    expect(pendingCount()).toBe(before - 1)
    expect(lineOf('bane')).toBeUndefined()
  })
  it('the striped day holding the bid opens the day’s list for 142’s admin: Approve greyed with the sentence, Delete removes it', () => {
    const id = bidThenMoved()
    signInAs('hunter')
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-bane-${FRI}`)
    expect(cell.className, 'striped, away').toContain('gone')
    expect(cell.textContent, 'nothing drawn on the stripe (D2243 Q6)').toBe('')
    fireEvent.click(cell)
    const approve = screen.getByTestId(`dl-approve-${id}`) as HTMLButtonElement
    expect(approve.disabled).toBe(true)
    expect(approve.title).toBe(SENTENCE)
    fireEvent.click(screen.getByTestId(`dl-refuse-${id}`))
    expect(screen.getByText(NOT_SAVED)).toBeTruthy()
    fireEvent.click(screen.getByTestId(`dl-clear-${id}`))
    expect(reqs('bane', FRI)).toEqual([])
  })
  it('(control) a striped day holding nothing of the war’s own still opens nothing', () => {
    bidThenMoved()
    signInAs('hunter')
    render(<Matrix />)
    const cell = screen.getByTestId('cell-bane-2026-07-23')
    expect(cell.className).not.toContain(' act')
    fireEvent.click(cell)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('Ranger himself, still 142’s on Wed 15 with the move saved: his own striped day opens its list, and his Delete removes the bid', () => {
    const id = bidThenMoved(15)
    signInAs('ranger')
    expect(worldUnit()).toBe('u142')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-bane-${FRI}`))
    fireEvent.click(screen.getByTestId(`dl-clear-${id}`))
    expect(reqs('bane', FRI)).toEqual([])
  })
})
