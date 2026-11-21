// @vitest-environment jsdom
/* ENTERING A SQUADRON — ONE ENTRY FOR THE OPEN PAGE (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §3.2 A-iv; §3.4's enterSquadron tests that phase 2 can hold; §10: built in phase 2 with the midnight trigger OFF and its
   hold answering "none" — the trigger switched on in phase 3, after helper "undo & roles" merges, the Undo-across-the-swap
   tests and A2's proof with it).

   state/store.ts enterSquadron moves the schedule in view, the Leave War's world and the Tracker's door together, in a
   fixed order; resetSession enters at sign-in and records his home at entry, never the pick. Here the trigger is switched
   on only by the tests that drive the clock past midnight (pastMidnight — the app's own wake, never notify()), as phase 3
   will switch it on for the app. The world: test-support/msq-world.ts (Wed 15 Jul 26). */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, moveMan, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, enterSquadron, homeAtEntry, setEntryTrigger, setEntryHold, notify } from './store'
import { PLANPUCKS } from './plan'
import { setGrant, unitsLoad, addUnit, unitRows } from './units'
import { setMaster } from './accounts'
import { worldUnit } from '../leavewar/state/store'
import { swapWarWorld } from '../leavewar/sync'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => {
  setEntryTrigger(false); setEntryHold(null)
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans(); PLANPUCKS.length = 0
})

describe('at sign-in', () => {
  it("enters his own squadron — the schedule in view and the Leave War — and records his home at entry", () => {
    signInAs('kestrel')
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u149', 'u149', 'u149'])
    signInAs('ranger')
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u142', 'u142', 'u142'])
  })
  it('his home at entry is his home, never the pick (Opus L2)', () => {
    signInAs('saber')
    switchUnit('u149')                       // as step 5's menu will pick
    expect(UNIT).toBe('u149')
    expect(homeAtEntry()).toBe('u142')
  })
  it('enterSquadron moves the three in its order: the schedule to the unit asked, the war and the Tracker to his own page', () => {
    signInAs('ranger')
    const e = enterSquadron('u149')
    expect(e.unit).toBe('u149')
    expect(e.own, 'a member\'s own pages stay his home').toBe('u142')
    expect(worldUnit()).toBe('u142')
    expect(['none', 'later', 'same', 'bound', 'kept']).toContain(e.tracker)
  })
})

describe('the midnight trigger is OFF in phase 2', () => {
  it("Ranger's move to 149 takes effect at midnight: the page stays on 142 until phase 3 switches the trigger on", () => {
    signInAs('ranger')
    moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    pastMidnight()
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u142', 'u142', 'u142'])
  })
})

describe('with the trigger on (as phase 3 will have it)', () => {
  it('fired by the clock alone: past his move day\'s midnight the schedule and the war are 149\'s, his home at entry with them', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    setEntryTrigger(true)
    expect(UNIT).toBe('u142')
    pastMidnight()
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u149', 'u149', 'u149'])
  })
  it('nothing moves before his move counts, and a notify of an ordinary day enters nothing', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    setEntryTrigger(true)
    notify()
    expect([UNIT, worldUnit()]).toEqual(['u142', 'u142'])
  })
  it('the hold: while it answers anything but "none" the page waits; once it lets go, the next notify enters', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    setEntryTrigger(true)
    let held: 'none' | 'war' = 'war'
    setEntryHold(() => held)
    pastMidnight()
    expect([UNIT, worldUnit()], 'an open window holds the swap').toEqual(['u142', 'u142'])
    held = 'none'
    notify()
    expect([UNIT, worldUnit()]).toEqual(['u149', 'u149'])
  })
  it("the blind read's R6, the war's half (dormant): a Leave War loaded for a squadron not his page's is entered again", () => {
    signInAs('ranger')
    setEntryTrigger(true)
    expect(swapWarWorld('u149')).toBe(true)  // as a right changed mid-day could leave it
    expect(worldUnit()).toBe('u149')
    notify()
    expect([UNIT, worldUnit()]).toEqual(['u142', 'u142'])
  })
  it("a Plan holder's pick moves to his new home at his own move — his Plan ended by it (D2203, D2243 Q4)", () => {
    signInAs('saber')
    const place = unitRows().places[0]!.id
    const made = addUnit('150', place, ACCT.kestrel)
    expect(made.ok, `a third squadron: ${made.message ?? ''}`).toBe(true)
    const u150 = made.id!
    unitsLoad()
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok, 'Saber gives Hunter Plan of 149').toBe(true)
    const mv = moveMan(PID.hunter, u150)
    expect(mv.ok, `Hunter's move to 150, from tomorrow: ${mv.message ?? ''}`).toBe(true)
    signInAs('hunter')
    switchUnit('u149')                       // his pick, as step 5's menu will give him
    setEntryTrigger(true)
    pastMidnight()
    expect(UNIT, 'never left on 149\'s pages with no right there').toBe(u150)
    expect(worldUnit()).toBe(u150)
  })
  it("a master admin's pick of another squadron stays at his own midnight move; his own pages follow it (D2197)", () => {
    signInAs('saber')
    const made = addUnit('150', unitRows().places[0]!.id, ACCT.kestrel)
    expect(made.ok, made.message ?? '').toBe(true)
    unitsLoad()
    /* (Hunter, a master admin for this case — the mark given by Saber, D2205 — moved to 150 by Saber, from tomorrow) */
    const mark = setMaster(ACCT.hunter, true)
    expect(mark.ok, `Saber makes Hunter a master admin: ${mark.message ?? ''}`).toBe(true)
    const mv = moveMan(PID.hunter, made.id!)
    expect(mv.ok, `Hunter's move to 150: ${mv.message ?? ''}`).toBe(true)
    signInAs('hunter')
    switchUnit('u149')
    setEntryTrigger(true)
    pastMidnight()
    expect(UNIT, 'the pick of 149 stays').toBe('u149')
    expect(worldUnit(), 'his own pages follow the pick').toBe('u149')
    expect(homeAtEntry()).toBe(made.id)
  })
})
