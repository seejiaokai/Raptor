// @vitest-environment jsdom
/* Fable, share 1 — proof: engine/slots.ts reconcileDayFiling is a WRITER that walks a per-day list (inputsOnDay(UNIT, the
   day)), not the first-day list (the plan's F4 rule). Ranger's Training 14–17 Jul lands in 142 (his first day's
   squadron), acc 'g'. A whole-day replacement of 149's Thu 16 Jul (a plan parked and switched back) runs the reconcile
   over 149's Thursday, where his input is 149's and no row of it stands in 149's week — so it deletes 142's accepted
   mark (a master admin), or the gate refuses the whole plan switch (149's own admin). */
import { afterEach, describe, expect, it } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, writeInputs } from './store'
import { INPUTS } from '../engine/inputs'
import { stashClear } from '../engine/weekstash'
import { DAYS } from '../engine/data'
import { PLANPUCKS } from './plan'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { draftDup, draftSelect, dayDrafts, curDraftId } from '../engine/drafts'
import { schedWrite, SCHED_TYPES } from './sched-commit'
import { afterSchedMutate } from './view'
import { globalUndo } from '../undo'
import { dayFilingFingerprint } from '../engine/publish'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0; stashClear() })

const THU = 3
const rec = () => INPUTS.find((r: any) => r.remarks === 'Course-F1') as any
function fileIt() {
  signInAs('saber')
  moveMan(PID.ranger, 'u149')
  expect(writeInputs(() => { INPUTS.unshift({ person: PID.ranger, type: 'Training', allday: true, date: 'Jul 14', endDate: 'Jul 17', yr: 2026, remarks: 'Course-F1' }) })).toBe(true)
  expect(rec().acc, "landed in 142, his first day's squadron").toBe('g')
}
function parkAndSwitchBack(): { ids: string[]; cur: any } {
  const first = curDraftId(THU)
  schedWrite(SCHED_TYPES.mutate, () => { draftDup(THU); afterSchedMutate() })
  const other = dayDrafts(THU).find((x: any) => x.id !== curDraftId(THU))
  if (other) schedWrite(SCHED_TYPES.mutate, () => { draftSelect(THU, other.id); afterSchedMutate() })
  return { ids: dayDrafts(THU).map((x: any) => x.id), cur: [first, curDraftId(THU)] }
}

describe("a whole-day replacement on 149's Thursday and 142's accepted mark", () => {
  it("(control) 149's own admin, no input across a move: the plan parks and switches with no refusal", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    signInAs('kestrel')
    const r = parkAndSwitchBack()
    expect(r.cur[1]).not.toBe(r.cur[0])
    expect((HOOKS.toast as any).mock.calls.map((c: any) => c[0])).toEqual([])
  })
  it("149's own admin: his Undo of his own edit on 149's Thursday goes through", () => {
    fileIt()
    signInAs('kestrel')
    const n = ((DAYS[THU] as any).ground || []).length
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[THU] as any).ground.push({ prog: 'F1-NEW', str: '', end: '', rmks: '', who: '', more: [] }); afterSchedMutate() })
    expect((HOOKS.toast as any).mock.calls.map((c: any) => c[0]), 'the edit').toEqual([])
    expect(((DAYS[THU] as any).ground || []).length).toBe(n + 1)
    globalUndo()
    expect(((DAYS[THU] as any).ground || []).length, 'his Undo took his row back').toBe(n)
  })
  it("(control) the same Undo with no input across a move: goes through", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    signInAs('kestrel')
    const n = ((DAYS[THU] as any).ground || []).length
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[THU] as any).ground.push({ prog: 'F1-NEW', str: '', end: '', rmks: '', who: '', more: [] }); afterSchedMutate() })
    expect(((DAYS[THU] as any).ground || []).length).toBe(n + 1)
    globalUndo()
    expect(((DAYS[THU] as any).ground || []).length).toBe(n)
  })
  it("149's Thursday's filing fingerprint does not carry 142's landing of his request", () => {
    fileIt()
    const iid = String(rec().iid)
    switchUnit('u149')
    expect(Object.keys(dayFilingFingerprint(THU)), "142's accepted mark frozen into 149's day").not.toContain(iid)
  })
  it("(which step) 149's own admin: the park passes, the switch back is the one refused", () => {
    fileIt()
    signInAs('kestrel')
    schedWrite(SCHED_TYPES.mutate, () => { draftDup(THU); afterSchedMutate() })
    expect((HOOKS.toast as any).mock.calls.map((c: any) => c[0]), 'the park').toEqual([])
    const cur = curDraftId(THU)
    const other = dayDrafts(THU).find((x: any) => x.id !== cur)
    schedWrite(SCHED_TYPES.mutate, () => { draftSelect(THU, other.id); afterSchedMutate() })
    expect(curDraftId(THU), 'the switch went through').toBe(other.id)
  })
  it("the master admin, 149 in view: 142's accepted mark is left alone", () => {
    fileIt()
    switchUnit('u149')
    expect(rec().acc).toBe('g')
    expect(String((DAYS[THU] as any).dt)).toMatch(/16/)
    parkAndSwitchBack()
    expect(rec().acc, "149's Thursday plan switch cleared 142's accepted mark").toBe('g')
  })
  it("149's own admin: his plan switch on 149's Thursday goes through", () => {
    fileIt()
    signInAs('kestrel')
    expect(UNIT).toBe('u149')
    const n0 = dayDrafts(THU).length
    const r = parkAndSwitchBack()
    expect(dayDrafts(THU).length, 'the plan was parked').toBe(n0 === 0 ? 2 : n0 + 1)
    expect(r.cur[1], 'and switched to the other plan').not.toBe(r.cur[0])
    expect((HOOKS.toast as any).mock.calls.map((c: any) => c[0]), 'nothing refused').toEqual([])
    expect(rec().acc, "142's accepted mark").toBe('g')
  })
})
