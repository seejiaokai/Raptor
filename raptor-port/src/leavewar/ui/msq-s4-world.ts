/* TEST WORLD ONLY — section 4 of the multi-squadron build, the Leave War's posting sheet (his D2653 way C, D2732).

   Its own set-up, used by its test files alone (the plan §21.4 point 1: the core's shared world is not on `main`, and two
   chats never share one file). THREE SQUADRONS, as every test of this build has (D2630) — 142 and 149 the demo's own,
   150 made here through the real doors — and the cast of section 4's page:
   - Saber, master admin, home 142 (`stiff`); Hunter, 142's admin (`prowler`); Kestrel, 149's admin (`kes9`);
     Ranger, 142's member (`bane`);
   - Mako, made here by Saber through Admin → Users' New person (`addPersonAndAccount`) as an admin, then named 150's
     first admin by "+ New squadron" (`addUnit`) — so 150 has him and nobody else: posting him out would leave 150 with no
     admin, the app's last-admin line (D306);
   - Cinch (`snap`), an aircrew man, and Cotter (`spanner`), ground crew, the men being posted.
   Copied in shape from test-support/msq-world.ts (the demo's sign-ins in a fresh memory store each test, the roster and
   inputs put back, 142's Leave War loaded and wired to the app), never imported from it. */
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import { storeBackend, HOOKS } from '../../engine/hooks'
import { PEOPLE, indexCallsigns } from '../../engine/people'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../../state/store'
import { accountsLoad, signIn, sessionFor, addPersonAndAccount, accountOfPid } from '../../state/accounts'
import { setSession } from '../../state/auth'
import { setUnitSeeds, unitsLoad, addUnit } from '../../state/units'
import { initStore as lwInitStore, setPeople, lwHistInit } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from '../sync'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { settleWorld } from '../../test-support/world'

const mem: Record<string, string> = {}
export const SIGN = { saber: ['ad', 'a'], hunter: ['ad2', 'a2'], ranger: ['us', 'us'], kestrel: ['ad9', 'a9'] } as const
export const PID = { saber: 'stiff', hunter: 'prowler', ranger: 'bane', kestrel: 'kes9', cinch: 'snap', cotter: 'spanner' } as const
export const ids = { mako: '', u150: '' }

export function signInAs(who: keyof typeof SIGN | 'mako'): void {
  const [n, p] = who === 'mako' ? ['mako', 'x'] : SIGN[who]
  resetSession(sessionFor(signIn(n, p)))
  raptorNotify()
}

let PEOPLE0 = ''
let INPUTS0 = ''
export function useS4World(): void {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    if (!PEOPLE0) { PEOPLE0 = JSON.stringify(PEOPLE); INPUTS0 = JSON.stringify(INPUTS) }
  })
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))   // Wed 15 Jul 26, 09:00 — the demo's weeks
    Object.keys(mem).forEach(k => delete mem[k])
    storeBackend.impl = {
      getItem: (k: string) => (k in mem ? mem[k]! : null),
      setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
      keys: () => Object.keys(mem),
    } as any
    const p0 = JSON.parse(PEOPLE0)
    for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
    Object.assign(PEOPLE, p0); indexCallsigns()
    INPUTS.length = 0
    for (const r of JSON.parse(INPUTS0)) INPUTS.push(r)
    setUnitSeeds(true)
    setWarWorldDoor(null)
    lwInitStore(memoryBackend())
    raptorInitStore()
    accountsLoad()
    unitsLoad()
    resetSession(null)
    setPeople(projectPeople())
    wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    settleWorld()
    vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
    /* 150 and its one admin, Mako — through the real doors, as Saber */
    signInAs('saber')
    expect(addPersonAndAccount('mako', { cs: 'Mako', ini: 'MKO', seat: 'FCP', cat: 'IP' }, 'admin')).toBeNull()
    const mako = Object.keys(PEOPLE).find(k => (PEOPLE as any)[k]?.cs === 'Mako')!
    const acct = accountOfPid(mako)!
    const u = addUnit('150', 'p1', acct.id)
    expect(u, '150 made, Mako its first admin').toMatchObject({ ok: true })
    unitsLoad()
    ids.mako = mako; ids.u150 = String((u as any).id)
    setPeople(projectPeople())
    raptorNotify()
  })
  afterEach(() => {
    setSession(null); resetSession(null)
    _resetTimeline()
    vi.restoreAllMocks()
  })
  afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
}
