// @vitest-environment jsdom
/* STORE.TS'S INPUT READERS ON THE DAY (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2
   A-i and A-iii, "A body that writes never iterates the touches list" — Fable F4; §3.4 "A leave across a move, loaded on
   142's week then 149's and back: its accepted mark unchanged").

   Ranger (142's member, person `bane`) moves to 149 from Thu 16 Jul; his leave runs Tue 14 – Tue 21 Jul, 142's on its
   days before the move and 149's after.
   - THE PROTECTED DAYS (state/store.ts protectedTouched — the input funnel's quarantine): an input is the schedule in
     view's on each protected day it covers, read ON that day. With 149 in view and its week of 20 Jul quarantined, his
     leave reaches that frozen week (his 20 Jul is 149's) and is refused — red on the code before (it read his first
     day, 142's, so 149's frozen week let it through); with 142 in view and 142's week of 20 Jul quarantined, his days
     there are 149's and 142's frozen week is not touched by them.
   - THE LANDING (the week load and the boot): its accepted mark is the first day's squadron's alone, so loading 149's
     week and coming back never clears it. The world: test-support/msq-world.ts. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, writeInputs, writeInputsBatch } from './store'
import { INPUTS, inpId } from '../engine/inputs'
import { stashPut, stashClear } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { PLANPUCKS } from './plan'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0; stashClear() })

/* a stashed week of the unit in view whose book is unsupported (quarantine-funnel.test.ts's own shape): its dates protected */
const quarantine = (key: string) => stashPut(key, JSON.stringify({ d: weekBundle(key).days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))
const hisLeave = (iid: string) => ({ person: PID.ranger, type: 'OL', allday: true, date: 'Jul 14', endDate: 'Jul 21', yr: 2026, iid, remarks: '' })
const filed = (iid: string) => INPUTS.some((r: any) => r.iid === iid)

describe("the protected days are read on each day — a leave across Ranger's move", () => {
  it("149 in view, its week of 20 Jul frozen: his leave reaching his 149 days there is refused", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    switchUnit('u149')
    quarantine('20/07/2026')
    writeInputsBatch(() => { INPUTS.unshift(hisLeave('zzday1')) })
    expect(filed('zzday1'), "149's frozen week let a leave on its days through").toBe(false)
  })
  it("142 in view, its week of 20 Jul frozen: his days there are 149's — 142's frozen week is not touched", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    quarantine('20/07/2026')
    writeInputsBatch(() => { INPUTS.unshift(hisLeave('zzday2')) })
    expect(filed('zzday2')).toBe(true)
  })
  it('(control) a leave of a man who stays in 142 onto 142\'s frozen week: refused, as always', () => {
    signInAs('saber')
    quarantine('20/07/2026')
    writeInputsBatch(() => { INPUTS.unshift({ ...hisLeave('zzday3'), person: PID.hunter }) })
    expect(filed('zzday3')).toBe(false)
  })
})

describe("the landing reads the first day — never the squadrons an input touches (Fable F4)", () => {
  it("his request across the move keeps its accepted mark through a load of 149's week and back", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    expect(writeInputs(() => { INPUTS.unshift({ person: PID.ranger, type: 'Training', allday: true, date: 'Jul 14', endDate: 'Jul 17', yr: 2026, remarks: 'Course' }) })).toBe(true)
    const rec = () => INPUTS.find((r: any) => r.person === PID.ranger && r.remarks === 'Course') as any
    const acc0 = rec().acc
    expect(acc0, 'landed on its first day, in 142').toBe('g')
    const iid = inpId(rec())
    switchUnit('u149')
    expect(rec().acc, "149's week load leaves 142's landing alone").toBe(acc0)
    switchUnit('u142')
    expect(rec().acc).toBe(acc0)
    expect(inpId(rec())).toBe(iid)
  })
})
