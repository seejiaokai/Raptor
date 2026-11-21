// @vitest-environment jsdom
/* The Leave War re-walk of the fix read (F2-16-ad2-person-d), his D2243 Q6: leave approved before a man's move is "kept out
   of sight in the old war until the Transfer batch carries it". The grid hid it; his person window in the old war still
   listed it ("LL Mon 20 Jul 1 Approved"). The list shows his approved leave only on the days still this war's squadron's. */
import { describe, expect, it } from 'vitest'
import { setCell, recordsAt, decideRequestById, worldUnit } from '../state/store'
import { setHome } from '../../state/units'
import { useMsqWorld, signInAs } from '../../test-support/msq-world'
import { personLeave } from './personleave'

useMsqWorld()

const approve = (day: string) => {
  expect(setCell('bane', day, 'LL')).toBe(true)
  const rec = recordsAt('bane', day).find(x => x.kind === 'request')!
  expect(decideRequestById('bane', day, rec.id, 'approved')).toBe(true)
}
const approved = () => personLeave('bane', null).filter(l => l.state === 'approved').map(l => [l.from, l.to])

describe('the person window in his old squadron’s war', () => {
  it('lists his approved leave before his move day, and none of it from that day', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    approve('2026-07-14'); approve('2026-07-20'); approve('2026-07-24')
    expect(approved()).toEqual([['2026-07-14', '2026-07-14'], ['2026-07-20', '2026-07-20'], ['2026-07-24', '2026-07-24']])
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(approved()).toEqual([['2026-07-14', '2026-07-14']])
  })
  it('a leave running across the move shows its days still this squadron’s', () => {
    signInAs('saber')
    approve('2026-07-15'); approve('2026-07-16'); approve('2026-07-17')
    expect(approved()).toEqual([['2026-07-15', '2026-07-17']])
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(approved()).toEqual([['2026-07-15', '2026-07-15']])
  })
})
