/* A DELETE REACHES EVERY SQUADRON'S PLANNING CALENDAR — THE GATE LINE (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2 B1 — core, phase 1; the writer, state/plan-foreign.ts,
   is helper "session"'s, phase 2, with its own tests through the real delete).

   perms.ts section 7 (unitRecordViolation → deleteStripsOnly) lets a delete change another squadron's planning row its
   admin holds no right in only when this same command deletes that man, and each such row, dated on or after his cutoff,
   is its before-image with his id blanked and trailing blanks trimmed — or removed where that leaves it neither words nor
   people. The command judged is a REAL delete (Hunter, 142's plain admin, deletes Ranger, 142's member) with one 149
   note's change added beside it, judged as the commit gate judges it. The world: test-support/msq-world.ts. */
import { describe, expect, it, beforeEach } from 'vitest'
import { useMsqWorld, PID, signInAs } from '../test-support/msq-world'
import { ownershipViolation } from './perms'
import { deletePerson } from './person-delete'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command/types'

useMsqWorld()

let del: CommitEnvelope
let cutoff = ''
beforeEach(() => {
  signInAs('hunter')
  const got: CommitEnvelope[] = []
  const off = onCommit(env => { got.push(env) })
  expect(deletePerson(PID.ranger), 'Hunter deletes Ranger').toBeNull()
  off()
  del = got.find(e => e.changes.some(c => c.collection === 'people' && c.id === PID.ranger))!
  expect(del, 'the delete\'s own command').toBeTruthy()
  cutoff = (del.changes.find(c => c.collection === 'people' && c.id === PID.ranger)!.after as any).deletedFrom
  expect(cutoff).toBe('2026-07-15')
})

/* a 149 note, by its stored row's shape (state/plan.ts — `pp:<id>`, one record each, its own `ord`) */
const note = (ids: string[], date = '2026-07-20', text = 'Sim brief') => ({ id: 'p1', date, text, ids, ord: 'a0' })
const change = (before: any, after: any, local = 'pp:p1') => ({ op: after == null ? 'delete' : 'put', collection: 'plan', id: `u149@${local}`, before, after }) as any
const judge = (...extra: any[]) => ownershipViolation({ ...del, changes: [...del.changes, ...extra] })
const judgeAlone = (...extra: any[]) => ownershipViolation({ ...del, changes: extra })

describe('his delete takes him off a 149 note, and only that', () => {
  it('blanked from a 149 note dated after his cutoff: allowed (red on the old gate — no right in 149)', () => {
    expect(judge(change(note([PID.osprey, PID.ranger]), note([PID.osprey])))).toBeNull()
  })
  it('a gap, never a splice: blanked from the front, the others keep their places', () => {
    expect(judge(change(note([PID.ranger, PID.osprey]), note(['', PID.osprey])))).toBeNull()
  })
  it('a note on his cutoff day itself: allowed', () => {
    expect(judge(change(note([PID.ranger, PID.osprey], cutoff), note(['', PID.osprey], cutoff)))).toBeNull()
  })
  it('a note left with neither words nor people goes; one with words stays, its people empty', () => {
    expect(judge(change(note([PID.ranger], '2026-07-20', ''), null))).toBeNull()
    expect(judge(change(note([PID.ranger]), note([])))).toBeNull()
    expect(judge(change(note([PID.ranger]), null))).toMatch(/another unit's records \(u149\)/)
  })
})

describe('anything else of a 149 row: refused', () => {
  it('its words, its day or its order changed beside the blank', () => {
    expect(judge(change(note([PID.osprey, PID.ranger]), { ...note([PID.osprey]), text: 'Changed' }))).toMatch(/another unit's records \(u149\)/)
    expect(judge(change(note([PID.osprey, PID.ranger]), { ...note([PID.osprey]), date: '2026-07-21' }))).toMatch(/another unit's records \(u149\)/)
    expect(judge(change(note([PID.osprey, PID.ranger]), { ...note([PID.osprey]), ord: 'z9' }))).toMatch(/another unit's records \(u149\)/)
  })
  it('another man taken off, or another man added', () => {
    expect(judge(change(note([PID.osprey, PID.ranger]), note([PID.ranger])))).toMatch(/another unit's records \(u149\)/)
    expect(judge(change(note([PID.osprey, PID.ranger]), note([PID.osprey, PID.kestrel])))).toMatch(/another unit's records \(u149\)/)
  })
  it('a note dated before his cutoff', () => {
    expect(judge(change(note([PID.osprey, PID.ranger], '2026-07-10'), note([PID.osprey], '2026-07-10')))).toMatch(/another unit's records \(u149\)/)
  })
  it('a note that does not name him, a new note, or a day title', () => {
    expect(judge(change(note([PID.osprey]), note([])))).toMatch(/another unit's records \(u149\)/)
    expect(judge(change(null, note([PID.osprey])))).toMatch(/another unit's records \(u149\)/)
    expect(judge(change('Ops day', null, 'dm:2026-07-20'))).toMatch(/another unit's records \(u149\)/)
  })
  it('the same strip with no delete of him in the command', () => {
    expect(judgeAlone(change(note([PID.osprey, PID.ranger]), note([PID.osprey])))).toMatch(/another unit's records \(u149\)/)
  })
})
