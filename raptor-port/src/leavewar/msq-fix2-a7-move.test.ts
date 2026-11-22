// @vitest-environment jsdom
/* opus3 (blind fix read, share 3): A7 through the war's MOVE door — a bid or an approved leave slid from a day still
   142's onto a day now 149's, in 142's war (D2243 Q3: nobody puts his leave into his old squadron's war for a day after
   his move). */
import { describe, expect, it } from 'vitest'
import { getState, setCell, worldUnit, recordsAt, moveCells, moveProblem, decideRequestById } from './state/store'
import { absencesAt } from './state/merge'
import { setHome, homeOn } from '../state/units'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()

const TUE = '2026-07-14', FRI = '2026-07-17'

describe('opus3 — A7 through the move door', () => {
  it('a waiting bid slid from Tue 14 Jul (142) to Fri 17 Jul (149) in 142’s war is either moved nowhere or kept', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', TUE, 'LL')).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', FRI)).toBe('u149')
    expect(homeOn('bane', TUE)).toBe('u142')
    const problem = moveProblem([{ personId: 'bane', date: TUE }], 3)
    const r = moveCells([{ personId: 'bane', date: TUE }], 3)
    const left = recordsAt('bane', TUE).filter(x => x.kind === 'request')
    const landed = recordsAt('bane', FRI).filter(x => x.kind === 'request')
    expect(landed.length, 'nothing lands on a day now 149’s').toBe(0)
    expect(left.length, 'the bid is not lost: it stays on Tue 14 Jul').toBe(1)
  })

  it('an approved leave slid from Tue 14 Jul to Fri 17 Jul in 142’s war does not land on a day now 149’s', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', TUE, 'LL')).toBe(true)
    const rec = recordsAt('bane', TUE).find(x => x.kind === 'request')!
    expect(decideRequestById('bane', TUE, rec.id, 'approved')).toBe(true)
    expect(absencesAt('bane', TUE).length, 'approved: the leave stands as an absence').toBe(1)
    expect(setHome('bane', 'u149').ok).toBe(true)
    const problem = moveProblem([{ personId: 'bane', date: TUE }], 3)
    const r = moveCells([{ personId: 'bane', date: TUE }], 3)
    const inputs = (getState() as any).people ? null : null
    void inputs
    expect(r, '142’s war refuses to move his leave onto a day now 149’s').not.toBe('moved')
    expect(absencesAt('bane', FRI).length, 'no leave of his on Fri 17 Jul in 142’s war').toBe(0)
  })
})

import { changeAbsenceById } from './state/store'
import { globalUndo } from '../undo/timeline'

describe('opus3 — A7 through the approved-leave sheet and its Undo', () => {
  const approveFri = () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', FRI, 'LL')).toBe(true)
    const rec = recordsAt('bane', FRI).find(x => x.kind === 'request')!
    expect(decideRequestById('bane', FRI, rec.id, 'approved')).toBe(true)
    const a = absencesAt('bane', FRI)
    expect(a.length).toBe(1)
    expect(setHome('bane', 'u149').ok).toBe(true)
    return String(a[0]!.id)
  }
  it('sending his approved Fri 17 Jul leave back to waiting, after the move: refused, or done whole — never the leave lost with no bid', () => {
    const iid = approveFri()
    const r = changeAbsenceById('bane', FRI, iid, 'pending')
    const bids = recordsAt('bane', FRI).filter(x => x.kind === 'request')
    expect(absencesAt('bane', FRI).length + bids.length, 'the leave is either still approved or back as a bid').toBe(1)
  })
  it('the Undo of deleting that leave after the move would put leave back on a day now 149’s: refused (D2243 Q3)', () => {
    const iid = approveFri()
    expect(changeAbsenceById('bane', FRI, iid, 'removed')).toBe(null)
    expect(absencesAt('bane', FRI).length).toBe(0)
    const u = globalUndo()
    expect(u.ok, 'refused').toBe(false)
    expect(absencesAt('bane', FRI).length, 'nothing put back').toBe(0)
  })
})
