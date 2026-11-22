/* A WAR TAKES A MAN'S DAY ONLY WHERE THAT DAY IS ITS SQUADRON'S — 7b's CONTENTS LINE (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2 A7 — core, phase 1; his D2243: refused for everyone,
   master admins included; a removal never refused).

   perms.ts warUnitViolation judges a war change about man P on day d, where d is not the loaded war's squadron's, by its
   contents before and after: a delete, or a list whose every entry left stood unchanged in the same order, passes; any
   addition or change is refused. The probe that reads (pid, day) off a war change is helper "war"'s (leavewar/sync.ts,
   with A1); here a test probe reads a war cell's id (`<period>:<pid>:<date>`, leavewar/state/store.ts) as the war does.
   Until a probe is installed the line judges nothing. The world: test-support/msq-world.ts — 142's war loaded, Wed 15
   Jul 26; Ranger moved to 149 from Thu 16 Jul. */
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { useMsqWorld, PID, ACCT, acrossMove, signOut } from '../test-support/msq-world'
import { ownershipViolation, setLwManDayProbe, lwUnitNow } from './perms'
import type { Change } from '../command/types'

useMsqWorld()

const cellDay = (c: Change) => {
  if (c.collection !== 'lw.cell') return null
  const parts = String(c.id).split(':')
  const iso = parts.pop(), pid = parts.pop()
  return pid && iso ? { pid, iso } : null
}
let move = { before: '', moveDay: '', after: '' }
beforeEach(() => {
  move = acrossMove(PID.ranger, 'u142', 'u149')
  signOut()
  setLwManDayProbe(cellDay)
  expect(lwUnitNow(), '142\'s war is the one loaded').toBe('u142')
})
afterEach(() => setLwManDayProbe(null))

const actor = (who: 'hunter' | 'saber') => ({ id: ACCT[who], role: 'admin', session: null, personId: PID[who] })
const env = (who: 'hunter' | 'saber', ...changes: any[]): any => ({ seq: 1, at: '', actor: actor(who), origin: 'user', scope: { module: 'leavewar' }, type: 'lw.cell', changes, emit: true })
const LVE = { kind: 'LVE', st: 'appr', by: PID.hunter }
const CCL = { kind: 'CCL', st: 'req', by: PID.ranger }
const cell = (iso: string, before: any, after: any) => ({ op: after == null ? 'delete' : 'put', collection: 'lw.cell', id: `P26:${PID.ranger}:${iso}`, before, after })

describe('on a day now 149\'s, 142\'s war only loses entries', () => {
  it('one entry of a two-entry cell taken off, and the last entry: allowed', () => {
    expect(ownershipViolation(env('hunter', cell(move.after, [LVE, CCL], [CCL])))).toBeNull()
    expect(ownershipViolation(env('hunter', cell(move.after, [LVE], null)))).toBeNull()
  })
  it('an entry added, a new cell, or an entry changed: refused (red on the old gate)', () => {
    expect(ownershipViolation(env('hunter', cell(move.after, [LVE], [LVE, CCL])))).toMatch(/only loses entries/)
    expect(ownershipViolation(env('hunter', cell(move.after, null, [LVE])))).toMatch(/only loses entries/)
    expect(ownershipViolation(env('hunter', cell(move.after, [LVE, CCL], [{ ...LVE, st: 'rej' }, CCL])))).toMatch(/only loses entries/)
    expect(ownershipViolation(env('hunter', cell(move.after, [LVE, CCL], [CCL, LVE])))).toMatch(/only loses entries/)
  })
  it('the master admin too (D2243): refused', () => {
    expect(ownershipViolation(env('saber', cell(move.moveDay, null, [LVE])))).toMatch(/only loses entries/)
  })
  it('the day before the move is still 142\'s: an entry added there, allowed', () => {
    expect(ownershipViolation(env('hunter', cell(move.before, [LVE], [LVE, CCL])))).toBeNull()
  })
  it('with no probe installed the line judges nothing (helper "war" installs it with A1)', () => {
    setLwManDayProbe(null)
    expect(ownershipViolation(env('hunter', cell(move.after, null, [LVE])))).toBeNull()
  })
  it('the app itself is not asked', () => {
    const e = env('hunter', cell(move.after, null, [LVE]))
    expect(ownershipViolation({ ...e, actor: { id: 'system', role: 'system', session: null } })).toBeNull()
  })
})
