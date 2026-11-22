// @vitest-environment jsdom
/* THE HOST'S MERGE TEST — A5's foreign Delete strips every planning calendar naming him (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §10 "Tests that rest on two jobs": "A5's 'a foreign Delete
   strips every calendar naming him' (war's foreign Delete + session's B1 strip): the host, at merge, after both").
   Helper "war" built the foreign posting pass (leavewar/sync.ts runForeignPostings — both halves of a Delete, the Raptor
   half through state/person-delete.ts applyDelete); helper "session" built B1's strip inside applyDelete (every other
   squadron's calendar that names him from his cutoff, through its stored half, state/plan-foreign.ts). Neither job could
   write this alone: it is written by the host on the branch holding both (chat 128, 21 Nov 26). */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PEOPLE } from '../engine/people'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { useMsqWorld, signInAs as msqSignIn } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from '../state/store'
import { PLANPUCKS, addPlanPuck } from '../state/plan'
import { unitsLoad } from '../state/units'
import { worldUnit } from './state/store'
import { postOut } from './sync'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0 })

const signInAs = (name: string, pass = 'x') => { msqSignIn(name, pass) }
const noteNames = (date: string, pid: string) => PLANPUCKS.some((p: any) => p.date === date && (p.ids || []).includes(pid))

describe("A5 × B1 — Osprey's 149 Delete posting, run by the foreign pass with 142 loaded, takes him off 149's calendar", () => {
  it("only Saber (142) opens the app on his date: Osprey is deleted, and 149's notes from his date no longer name him", () => {
    signInAs('ad', 'a')                                        // Saber, the master admin, 142 in view
    switchUnit('u149')
    expect(addPlanPuck('2026-07-20', 'Range day', ['osp9', 'mer9']), "a 149 note after his date").toBe(true)
    expect(addPlanPuck('2026-07-14', 'Brief', ['osp9', 'mer9']), 'and one before it').toBe(true)
    switchUnit('u142')
    signInAs('ad9', 'a9')                                      // Kestrel, 149's admin, posts him out by Delete
    expect(worldUnit()).toBe('u149')
    expect(postOut('osp9', '2026-07-16', 'delete')).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('ad', 'a')                                        // his date: only Saber signs in, 142's war loaded
    expect(worldUnit(), "142's war is the one loaded").toBe('u142')
    expect((PEOPLE as any).osp9?.deleted, 'the foreign pass ran the Delete').toBe(true)
    switchUnit('u149')
    expect(noteNames('2026-07-20', 'osp9'), "149's note from his date no longer names him").toBe(false)
    expect(noteNames('2026-07-20', 'mer9'), 'Merlin stays on it').toBe(true)
    expect(noteNames('2026-07-14', 'osp9'), 'the note before his date keeps him (D299)').toBe(true)
  })
})
