// @vitest-environment jsdom
/* B1 — A DELETE REACHES EVERY SQUADRON'S PLANNING CALENDAR (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2 "A delete reaches every squadron's planning calendar
   (B1)", §6.4's B1 tests). The writer is the planning record ROUTED (§3.2 A-ii): the calendar loaded through the
   schedule's own store, any other squadron's through its stored half, state/plan-foreign.ts; the strip is
   state/person-delete.ts, inside the delete's own command; the gate's half is perms.ts section 7's deleteStripsOnly
   (its own table: delete-strips-other-calendar-gate.test.ts).

   The first describe is the full review's proof, copied word for word from
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b01-delete-other-sqn-calendar.test.ts.txt — only its harness
   changed to the one shared world (test-support/msq-world.ts, §9.1). Red on 53cb7022d (the base), green with the strip. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from '../state/store'
import { PLANPUCKS, addPlanPuck } from '../state/plan'
import { deletePerson } from '../state/person-delete'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
/* (the rest of §6.4's B1 tests, below the proof) */
import { vi } from 'vitest'
import { on, moveMan, PID } from '../test-support/msq-world'
import { writeInputs } from '../state/store'
import { editPlanPuck } from '../state/plan'
import { applyDelete, deleteCutoff } from '../state/person-delete'
import { storedPlan, storedCalendar, keptPlan } from '../state/plan-foreign'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { schedStore, schedApplyEnd, resyncBeforeEnlist } from '../state/sched-commit'
import { commit, onCommit, CmdRefused } from '../command'
import type { CommitEnvelope } from '../command/types'
import { PEOPLE } from '../engine/people'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0 })

const names = (pid: string) => PLANPUCKS.some((p: any) => p.date >= '2026-07-15' && (p.ids || []).includes(pid))

describe("B1 — a deleted 149 man leaves 149's calendar, whichever schedule is in view", () => {
  it('Saber deletes Osprey with 142 in view: his note on 20 Jul in 149 no longer names him', () => {
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    switchUnit('u149')
    expect(addPlanPuck('2026-07-20', 'Range day', ['osp9', 'mer9'])).toBe(true)
    expect(names('osp9')).toBe(true)
    switchUnit('u142')
    expect(deletePerson('osp9'), 'the delete said done').toBeNull()
    switchUnit('u149')
    expect(names('osp9'), "149's calendar still names the deleted man").toBe(false)
  })
  it('(control) the same delete with 149 in view takes him off', () => {
    signInAs('ad', 'a')
    switchUnit('u149')
    expect(addPlanPuck('2026-07-20', 'Range day', ['osp9', 'mer9'])).toBe(true)
    expect(deletePerson('osp9')).toBeNull()
    expect(names('osp9')).toBe(false)
  })
})

/* ---- §6.4's B1 tests beside the proof (helper "session") ---- */
/* a 149 note naming Osprey and Merlin on Mon 20 Jul, put there by Saber with 149 picked; 142 back in view */
function noteOn149(text = 'Range day'): string {
  signInAs('saber')
  switchUnit('u149')
  expect(addPlanPuck('2026-07-20', text, [PID.osprey, 'mer9'])).toBe(true)
  const id = PLANPUCKS.find((p: any) => p.text === text)!.id
  switchUnit('u142')
  return id
}
const on149 = (id: string) => storedCalendar('u149').pucks.find((p: any) => p.id === id)
const envelopes = (fn: () => unknown) => { const got: CommitEnvelope[] = []; const off = onCommit(e => { got.push(e) }); const r = fn(); off(); return { r, got } }

describe('B1 — an ordinary admin deletes a man moved 149 → 142, still on a future 149 note', () => {
  it("Hunter (142's plain admin, no right in 149) deletes him: 149's note keeps Merlin, his place a gap, nothing else", () => {
    const id = noteOn149()
    moveMan(PID.osprey, 'u142')                      // saved on Wed 15 Jul, counting from Thu 16 Jul
    on(17)
    signInAs('hunter')
    expect(UNIT).toBe('u142')
    const { r, got } = envelopes(() => deletePerson(PID.osprey))
    expect(r, 'the delete said done').toBeNull()
    const n = on149(id)
    expect(n.ids, 'a gap, never a splice').toEqual(['', 'mer9'])
    expect(n.text).toBe('Range day')
    const c = got.flatMap(e => e.changes).filter(x => x.collection === 'plan')
    expect(c.map(x => [x.op, x.id])).toEqual([['put', `u149@pp:${id}`]])
    expect((c[0]!.before as any).ids, 'its before-image is the note as stored').toEqual([PID.osprey, 'mer9'])
  })
  it('a note before his cutoff keeps him (the past keeps its record — D299)', () => {
    signInAs('saber')
    switchUnit('u149')
    expect(addPlanPuck('2026-07-14', 'Past day', [PID.osprey])).toBe(true)
    const id = PLANPUCKS.find((p: any) => p.text === 'Past day')!.id
    switchUnit('u142')
    expect(deletePerson(PID.osprey)).toBeNull()
    expect(on149(id).ids).toEqual([PID.osprey])
  })
  it('a note of him alone with no words goes with him', () => {
    signInAs('saber')
    switchUnit('u149')
    expect(addPlanPuck('2026-07-21', '', [PID.osprey])).toBe(true)
    const id = PLANPUCKS.find((p: any) => p.date === '2026-07-21')!.id
    switchUnit('u142')
    expect(deletePerson(PID.osprey)).toBeNull()
    expect(on149(id)).toBeUndefined()
  })
})

describe('B1 — a refused delete leaves the other calendar untouched', () => {
  it("Hunter's delete of Osprey (149's) is refused at its door: nothing reaches 149's calendar", () => {
    const id = noteOn149()
    signInAs('hunter')
    expect(deletePerson(PID.osprey), 'refused').not.toBeNull()
    expect(on149(id).ids).toEqual([PID.osprey, 'mer9'])
    expect((PEOPLE as any)[PID.osprey].deleted).toBeFalsy()
  })
  it("Saber's delete refused AFTER the strip ran (a refusal later in its command): 149's note and the kept copy as they were", () => {
    const id = noteOn149()
    const join = vi.spyOn(storedPlan('u149'), 'join')
    const kept = JSON.stringify(keptPlan('u149'))
    const r = commit({
      type: 'person.delete', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist()
        txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore)
        applyDelete(PID.osprey, deleteCutoff(null))
        throw new CmdRefused('refused later in the command')
      },
    })
    expect((r as any).ok).toBe(false)
    expect(join, 'the strip ran inside the refused command').toHaveBeenCalled()
    expect(JSON.stringify(keptPlan('u149'))).toBe(kept)
    expect(on149(id).ids).toEqual([PID.osprey, 'mer9'])
    expect(storedPlan('u149').records().get(`plan/u149@pp:${id}`)?.value, 'the stored half rolled back too').toMatchObject({ ids: [PID.osprey, 'mer9'] })
    expect((PEOPLE as any)[PID.osprey].deleted).toBeFalsy()
  })
})

describe('B1 — the cleaned note afterwards', () => {
  it('edited with 149 picked: saved as a change of the note as the delete left it', () => {
    const id = noteOn149()
    expect(deletePerson(PID.osprey)).toBeNull()
    switchUnit('u149')
    const { r, got } = envelopes(() => writeInputs(() => { editPlanPuck(id, 'Range day, later') }))
    expect(r).toBe(true)
    const c = got.flatMap(e => e.changes).find(x => x.collection === 'plan')!
    expect(c).toMatchObject({ op: 'put', id: `u149@pp:${id}` })
    expect((c.before as any).ids).toEqual(['', 'mer9'])
    expect((c.after as any).text).toBe('Range day, later')
  })
})

describe("B1 — the delete's other door: applyDelete inside another command (a posting's — leavewar/sync.ts)", () => {
  const asPosting = (extra: () => void = () => {}) => {
    const cutoff = deleteCutoff(null)
    return commit({
      type: 'person.delete', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist()
        txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore)
        applyDelete(PID.osprey, cutoff)
        extra()
        finishPeopleWrite(); schedApplyEnd()
      },
    })
  }
  it('strips the other calendar through the same join', () => {
    const id = noteOn149()
    moveMan(PID.osprey, 'u142')
    on(17)
    signInAs('hunter')
    expect((asPosting() as any).ok).toBe(true)
    expect(on149(id).ids).toEqual(['', 'mer9'])
  })
  it('a forged delete that changes anything else of the row is refused whole', () => {
    const id = noteOn149()
    moveMan(PID.osprey, 'u142')
    on(17)
    signInAs('hunter')
    const s = storedPlan('u149')
    const r = asPosting(() => { s.put(`pp:${id}`, { ...(s.get(`pp:${id}`) as any), text: 'Changed by the delete' }) })
    expect((r as any).ok).toBe(false)
    expect(on149(id)).toMatchObject({ text: 'Range day', ids: [PID.osprey, 'mer9'] })
    expect((PEOPLE as any)[PID.osprey].deleted).toBeFalsy()
  })
})
