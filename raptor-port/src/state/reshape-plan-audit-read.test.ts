// @vitest-environment jsdom
/* THE FRESH OPUS READER'S PROOFS FOR THE PLAN AUDIT'S BLIND READ ([MSQ-PLAN-AUDIT], his D2242) — 20 Nov 26.
   Written blind on a5271a17c, NOT RUN by the reader (the export has no node_modules). Copy this file to
   raptor-port/src/zz-repro-o/opus-plan-audit-read.test.ts and run, from raptor-port/:
     npx vitest run src/zz-repro-o/opus-plan-audit-read.test.ts
   O1 (a) and (b), O2 and O4 assert what the rulings require and are expected to FAIL on a5271a17c (each claim is the LAST
   expectation of its case; an earlier "setup" expectation that fails means the harness needs adjusting, not the claim).
   O3 is a GUARD: it passes today and must stay green through the plan's PE1 fix of mayEditSched (D292). */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { initStore, resetSession, notify, switchRoleView, writeInputsBatch } from '../state/store'
import { signIn, sessionFor, accountsLoad, levelIn } from '../state/accounts'
import { setSession } from '../state/auth'
import { mayEditSched } from '../state/perms'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setGrant, setHome, unitsLoad, homeOn } from '../state/units'
import { openApprovals, apprSeenAt } from '../state/apprseen'
import { initStore as lwInitStore, setPeople, worldUnit } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, oilOpenOn } from '../leavewar/sync'
import { saveOilDay } from '../ui/oilday'
import { rosterToday } from '../engine/roster'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
let ISNAP = ''

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                    // Wed 15 Jul 26
  if (!ISNAP) ISNAP = JSON.stringify(INPUTS)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

describe('O1 — a home move is never one a Plan holder may make of himself or of a master admin (D2205, D166 pattern)', () => {
  it('(a) Saber gives Hunter Plan of 149; Hunter moves HIMSELF into 149: refused', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok, 'setup: Plan given by the master admin').toBe(true)
    signInAs('ad2', 'a2')
    const r = setHome('prowler', 'u149')
    unitsLoad()
    expect(r.ok, `his own move: ${JSON.stringify(r)}; his squadron tomorrow ${homeOn('prowler', '2026-07-16')}`).toBe(false)
  })
  it('(b) Saber gives Hunter Plan of 149; Hunter moves SABER, the master admin, into 149: refused (D2205 — "M3 holds against a planner too")', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok, 'setup').toBe(true)
    signInAs('ad2', 'a2')
    const r = setHome('stiff', 'u149')
    unitsLoad()
    expect(r.ok, `the master admin moved by a planner: ${JSON.stringify(r)}; Saber tomorrow ${homeOn('stiff', '2026-07-16')}`).toBe(false)
  })
  it('(control) Saber moves Hunter into 149: allowed', () => {
    signInAs('ad', 'a')
    expect(setHome('prowler', 'u149').ok).toBe(true)
  })
})

describe('O3 (GUARD — green today; keep it green through PE1) — the member view is a member\'s (D292)', () => {
  it('Saber, then Hunter holding Plan of 149, switched to the member view: no edit mode', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(mayEditSched()).toBe(true)
    switchRoleView()
    expect(mayEditSched(), "Saber's member view").toBe(false)
    signInAs('ad2', 'a2')
    expect(mayEditSched()).toBe(true)
    switchRoleView()
    expect(mayEditSched(), "Hunter's member view (Plan of 149 held)").toBe(false)
    expect(levelIn('acad2', 'u149', rosterToday()), 'his Plan is still there underneath').toBe('admin')
  })
})
