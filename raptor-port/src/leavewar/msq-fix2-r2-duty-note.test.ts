// @vitest-environment jsdom
/* The second re-walk's I3 (picture R2L/img/i3/OD/I3-OD-02-pressed-d.png): Hunter files an OD over 15–17 Jul for Ranger, 149's
   from Thu 16 Jul — Wed 15 filed, the two days after left out — and the passing note read "1 day filed. This change could
   not be saved.." with two full stops (the same for a course and an Other). One full stop; no other word changed. */
import { describe, expect, it } from 'vitest'
import { fileStraight } from './state/store'
import { dutyFiledNote } from './sync'
import { useMsqWorld, signInAs, PID, moveMan } from '../test-support/msq-world'

useMsqWorld()

describe('the note of a duty filed with days left out', () => {
  it('Hunter’s OD across Ranger’s move: "1 day filed. This change could not be saved." — one full stop', () => {
    signInAs('saber'); expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    signInAs('hunter')
    for (const code of ['OD', 'CSE', 'OTH']) {
      const days = code === 'OD' ? ['2026-07-15', '2026-07-16', '2026-07-17'] : code === 'CSE' ? ['2026-07-14', '2026-07-16'] : ['2026-07-13', '2026-07-17']
      const r = fileStraight(days.map(date => ({ personId: PID.ranger, date })), code)
      expect(r.done, code).toBe(1)
      expect(dutyFiledNote(r), code).toBe('1 day filed. This change could not be saved.')
    }
  })
  it('the other reasons read as they did: their own words, then one full stop', () => {
    expect(dutyFiledNote({ done: 2, skipped: 1, why: ['12 Feb already holds an OD — left as it is'] })).toBe('2 days filed. 12 Feb already holds an OD — left as it is.')
    expect(dutyFiledNote({ done: 1, skipped: 1, why: [] })).toBe('1 day filed. 1 day was not yours to change.')
    expect(dutyFiledNote({ done: 1, skipped: 2, why: [] })).toBe('1 day filed. 2 days were not yours to change.')
  })
})
