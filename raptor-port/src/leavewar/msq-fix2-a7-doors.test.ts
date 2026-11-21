// @vitest-environment jsdom
/* The fix read of the reshape (opus-3, fable-3, astra-3), helper "warA7" — what the readers' own proofs do not pin: the
   words each refusal answers, that nothing is half-written, that a removal still goes, and the commit gate's backstop
   judged by itself. A7, his D2243 Q3: nobody puts anything new into his old squadron's Leave War for a day after his move.
   The world: Wed 15 Jul 26; Saber (master admin, 142's war loaded) saves Ranger's move to 149 — 149's from Thu 16 Jul. */
import { describe, expect, it } from 'vitest'
import {
  setCell, worldUnit, recordsAt, moveCells, moveProblem, decideRequestById, changeAbsenceById, fileStraight,
  setDayAward, grantOilDays, grantOil, awardsOnDay, removeLedgerEntry, updateLedgerEntry,
} from './state/store'
import { absencesAt } from './state/merge'
import { warLeaveAdds, warCellDay } from './sync'
import { setHome } from '../state/units'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command'
import { globalUndo } from '../undo/timeline'
import { INPUTS, idsOf } from '../engine/inputs'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()

const TUE = '2026-07-14', WED = '2026-07-15', THU = '2026-07-16', FRI = '2026-07-17'
const NOT_SAVED = 'This change could not be saved.'
const SENTENCE = "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War."
const hisRows = (type?: string) => (INPUTS as any[]).filter(r => idsOf(r).map(String).includes('bane') && (!type || r.type === type))
const approve = (day: string): string => {
  expect(setCell('bane', day, 'LL')).toBe(true)
  const rec = recordsAt('bane', day).find(x => x.kind === 'request')!
  expect(decideRequestById('bane', day, rec.id, 'approved')).toBe(true)
  return String(absencesAt('bane', day)[0]!.id)
}
const move = () => { expect(setHome('bane', 'u149').ok).toBe(true) }
const env = (type: string, changes: unknown[]): any => ({
  seq: 1, at: '', origin: 'local', scope: { module: 'lw', warId: 'y2026' }, type, actor: deriveActor(), changes,
})

describe('the move door says why, before anything leaves its day', () => {
  it('a waiting bid: the preview and the move both answer "away" for the landing day, and the bid stays', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', TUE, 'LL')).toBe(true)
    move()
    expect(moveProblem([{ personId: 'bane', date: TUE }], 3)).toEqual({ reason: 'away', at: FRI })
    expect(moveCells([{ personId: 'bane', date: TUE }], 3)).toEqual({ reason: 'away', at: FRI })
    expect(recordsAt('bane', TUE).filter(x => x.kind === 'request')).toHaveLength(1)
    /* …and a landing still 142's goes as ever */
    expect(moveCells([{ personId: 'bane', date: TUE }], 1)).toBe('moved')
    expect(recordsAt('bane', WED).filter(x => x.kind === 'request')).toHaveLength(1)
  })
  it('approved leave: refused the same way, the leave where it stood; a plain admin is never told "moved"', () => {
    signInAs('saber')
    approve(TUE)
    move()
    expect(moveProblem([{ personId: 'bane', date: TUE }], 3)).toEqual({ reason: 'away', at: FRI })
    signInAs('hunter')
    expect(moveCells([{ personId: 'bane', date: TUE }], 2)).toEqual({ reason: 'away', at: THU })
    expect(absencesAt('bane', TUE)).toHaveLength(1)
    expect(hisRows('LL').filter(r => r.lw).map(r => r.date)).toEqual(['Jul 14'])
  })
})

describe('a duty filed across his move files the days still this squadron’s', () => {
  it('Hunter, OD over 15–17 Jul: one day filed, two left out and said, one input kept', () => {
    signInAs('saber'); move()
    signInAs('hunter')
    const f = fileStraight([WED, THU, FRI].map(date => ({ personId: 'bane', date })), 'OD')
    expect(f).toEqual({ done: 1, skipped: 2, why: [NOT_SAVED] })
    expect(hisRows('OD').map(r => [r.date, r.endDate])).toEqual([['Jul 15', undefined]])
  })
})

describe('approved leave on a day now 149’s, in 142’s war', () => {
  it('back to waiting is refused in the generic words and the leave stays approved; Delete still goes', () => {
    signInAs('saber')
    const iid = approve(FRI)
    move()
    expect(changeAbsenceById('bane', FRI, iid, 'pending')).toBe(NOT_SAVED)
    expect(changeAbsenceById('bane', FRI, iid, 'refused')).toBe(NOT_SAVED)
    expect(hisRows('LL').filter(r => r.lw)).toHaveLength(1)
    expect(recordsAt('bane', FRI).filter(x => x.kind === 'request')).toHaveLength(0)
    expect(changeAbsenceById('bane', FRI, iid, 'removed')).toBe(null)
    expect(hisRows('LL')).toHaveLength(0)
  })
  it('the Undo of its Delete is refused in the ruled sentence, and nothing comes back', () => {
    signInAs('saber')
    const iid = approve(FRI)
    move()
    expect(changeAbsenceById('bane', FRI, iid, 'removed')).toBe(null)
    const u = globalUndo() as { ok: boolean; reason?: string }
    expect(u.ok).toBe(false)
    expect(u.reason).toBe(SENTENCE)
    expect(hisRows('LL')).toHaveLength(0)
  })
})

describe('OIL awards on a day now 149’s', () => {
  it('every door that gives one answers the generic words and writes nothing', () => {
    signInAs('saber'); move()
    expect(setDayAward('bane', FRI, 1, { note: 'x' })).toBe(NOT_SAVED)
    expect(grantOilDays([{ personId: 'bane', date: WED }, { personId: 'bane', date: FRI }], 1, { note: 'x' })).toBe(NOT_SAVED)
    expect(grantOil(['bane'], 1, FRI, 'worked')).toBe(NOT_SAVED)
    expect(awardsOnDay('bane', WED).length + awardsOnDay('bane', FRI).length).toBe(0)
    /* a day still 142's takes one as ever */
    expect(setDayAward('bane', WED, 1, { note: 'x' })).toBe(null)
    expect(awardsOnDay('bane', WED)).toHaveLength(1)
  })
  it('one given before the move was saved is not changed there; taking it away goes, and its Undo says the sentence', () => {
    signInAs('saber')
    expect(setDayAward('bane', FRI, 1, { note: 'x' })).toBe(null)
    const id = awardsOnDay('bane', FRI)[0]!.id
    move()
    expect(updateLedgerEntry(id, { reason: 'y' })).toBe(NOT_SAVED)
    expect(awardsOnDay('bane', FRI)[0]!.reason).toBe('x')
    expect(removeLedgerEntry(id)).toBe(true)
    expect(awardsOnDay('bane', FRI)).toHaveLength(0)
    const u = globalUndo() as { ok: boolean; reason?: string }
    expect(u.ok).toBe(false)
    expect(u.reason).toBe(SENTENCE)
    expect(awardsOnDay('bane', FRI)).toHaveLength(0)
  })
})

describe('the commit gate’s backstop, judged by itself (perms.ts 7b)', () => {
  it('leave a war approved: a day added that is 149’s is refused; a removal, a cut in two and a slide between 142’s days pass', () => {
    signInAs('saber')
    approve(TUE); approve(THU); approve(FRI)
    move()
    const tue = hisRows('LL').find(r => r.date === 'Jul 14')!, late = hisRows('LL').find(r => r.date === 'Jul 16')!
    expect(late.endDate).toBe('Jul 17')
    const A7 = /Leave War takes no leave there/
    /* slid onto Fri 17 Jul */
    const slid = { ...tue, date: 'Jul 17' }
    expect(warLeaveAdds([{ op: 'put', collection: 'inputs', id: tue.iid, before: tue, after: slid } as any])).toEqual([{ pid: 'bane', iso: FRI, unit: 'u142', id: String(tue.iid) }])
    expect(ownershipViolation(env('lw.move', [{ op: 'put', collection: 'inputs', id: tue.iid, before: tue, after: slid }]))).toMatch(A7)
    /* put back by a restore: no before-image */
    expect(ownershipViolation(env('lw.edit', [{ op: 'put', collection: 'inputs', id: 'inew', before: null, after: { ...slid, iid: 'inew' } }]))).toMatch(A7)
    /* taken away */
    expect(ownershipViolation(env('lw.edit', [{ op: 'delete', collection: 'inputs', id: late.iid, before: late }])) ?? '').not.toMatch(A7)
    /* cut in two — a new record of a day the leave already held adds nothing */
    const first = { ...late }; delete first.endDate
    const second = { ...late, date: 'Jul 17', iid: 'icut' }; delete second.endDate
    const cut = [
      { op: 'put', collection: 'inputs', id: late.iid, before: late, after: first },
      { op: 'put', collection: 'inputs', id: 'icut', before: null, after: second },
    ]
    expect(warLeaveAdds(cut as any)).toEqual([])
    expect(ownershipViolation(env('inputs.save', cut)) ?? '').not.toMatch(A7)
    /* slid from Tue 14 to Wed 15 Jul — both 142's */
    expect(ownershipViolation(env('lw.move', [{ op: 'put', collection: 'inputs', id: tue.iid, before: tue, after: { ...tue, date: 'Jul 15' } }])) ?? '').not.toMatch(A7)
  })
  it('an OIL award: given or changed on a day that is 149’s is refused; taken away passes', () => {
    signInAs('saber'); move()
    const e = { id: 'ol-x', personId: 'bane', counter: 'oil', amount: 1, date: FRI, reason: 'x', approvedBy: 'Saber' }
    expect(warCellDay({ op: 'put', collection: 'lw.ledger', id: 'ol-x', before: null, after: e } as any)).toEqual({ pid: 'bane', iso: FRI })
    const A7 = /only loses entries/
    expect(ownershipViolation(env('lw.award', [{ op: 'put', collection: 'lw.ledger', id: 'ol-x', before: null, after: e }]))).toMatch(A7)
    expect(ownershipViolation(env('lw.award', [{ op: 'put', collection: 'lw.ledger', id: 'ol-x', before: e, after: { ...e, amount: 2 } }]))).toMatch(A7)
    expect(ownershipViolation(env('lw.award', [{ op: 'delete', collection: 'lw.ledger', id: 'ol-x', before: e }])) ?? '').not.toMatch(A7)
    expect(ownershipViolation(env('lw.award', [{ op: 'put', collection: 'lw.ledger', id: 'ol-y', before: null, after: { ...e, id: 'ol-y', date: WED } }])) ?? '').not.toMatch(A7)
  })
})
