/* TEST WORLDS ONLY — never imported by the app (test-support/no-app-import.test.ts holds that).

   THE ONE MULTI-SQUADRON TEST WORLD (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §2,
   Piece 0). The full review's three proof sets each carried a harness of their own (a-_harness, b-_harness, c-harness in
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/); every piece of the reshape needs the same thing — one man moved
   142 → 149, with the day before, the move day and the day after — so the pieces, their helpers and the walkers'
   scenarios all test against this one world.

   What it gives:
   - `useMsqWorld()` — registers the hooks: the demo's two squadrons and seeded sign-ins in a fresh memory store each
     test, the roster and the inputs put back, both Leave War worlds (142's loaded, 149's behind the world door), the one
     Undo, the saved baselines settled (test-support/world.ts), the clock on Wed 15 Jul 26, 09:00;
   - the five seeded sign-ins by name — Saber (master admin, 142), Hunter (142's second admin; his person is `prowler`),
     Ranger (142's member), Kestrel (149's admin), Osprey (149's member);
   - a clock: `on(day, h, m)` a day of July 2026, `at(iso, h, m)` any day, and `pastMidnight()`, which moves the clock to
     00:00:01 of the next day and fires the APP'S OWN midnight wake (leavewar/sync.ts installPostingClock — the page
     shown or focused on a new day), never `notify()` itself (Fable F8: a proof that calls notify proves nothing about the
     wake). It needs a window — a raptor test file opts in with the `@vitest-environment jsdom` pragma;
   - `moveMan(pid, unit)` — a squadron move through the REAL door, `state/units.ts setHome`, saved by whoever is signed
     in (the master admin when nobody is), counting from tomorrow (D2119);
   - `acrossMove(pid, from, to)` — the move saved today, and the three days a table test reads: the day before it counts,
     the move day, the day after;
   - `bystanderAdminOf(unit, exclude)` — a seeded admin who plays no part in a scenario (§9.2: the setup-only test
     changes name one, and the host checks no assertion reads it). */
import { vi, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, ACCOUNTS_LIST, isAdminAccount } from '../state/accounts'
import { setSession, SESSION } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setConflictChecker } from '../command'
import { initStore as lwInitStore, setPeople, lwHistInit } from '../leavewar/state/store'
import { memoryBackend, type StorageBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, installPostingClock } from '../leavewar/sync'
import { setUnitSeeds, unitsLoad, setHome, homeOn, todayIso, type UnitSave } from '../state/units'
import { settleWorld } from './world'

/* the memory store behind the app's storage, emptied each test */
export const mem: Record<string, string> = {}
/* each squadron's Leave War world (142's is the loaded one at sign-in for a 142 man) */
export let worlds: Record<string, StorageBackend> = {}

/* ---- the seeded sign-ins (state/accounts.ts SEED; passwords are the seeds' own, code only) ---- */
export const SIGN = {
  saber: ['ad', 'a'],      // master admin, 142 (person `stiff`)
  hunter: ['ad2', 'a2'],   // 142's second admin, not a master (person `prowler`)
  ranger: ['us', 'us'],    // 142's member (person `bane`)
  kestrel: ['ad9', 'a9'],  // 149's admin (person `kes9`)
  osprey: ['us9', 'us9'],  // 149's member (person `osp9`)
} as const
export const PID = { saber: 'stiff', hunter: 'prowler', ranger: 'bane', kestrel: 'kes9', osprey: 'osp9' } as const
export const ACCT = { saber: 'acad', hunter: 'acad2', ranger: 'acus', kestrel: 'acad9', osprey: 'acus9' } as const
export type Who = keyof typeof SIGN

export function signInAs(who: Who | string, pass?: string) {
  const [name, pw] = who in SIGN ? SIGN[who as Who] : [who, pass ?? 'x']
  const r = signIn(name, pw)
  resetSession(sessionFor(r))
  raptorNotify()
  return r
}
export function signOut(): void { setSession(null); resetSession(null); raptorNotify() }

/* ---- the clock ---- */
export function at(iso: string, h = 9, m = 0): void {
  const [y, mo, d] = iso.split('-').map(Number)
  vi.setSystemTime(new Date(y!, mo! - 1, d!, h, m, 0))
}
/* a day of July 2026 (the demo weeks: Mon 13 – Sun 19 Jul, Mon 20 – Sun 26 Jul) */
export const on = (day: number, h = 9, m = 0): void => at(`2026-07-${String(day).padStart(2, '0')}`, h, m)

let WAKE_OFF: (() => void) | null = null
/* past midnight, by the app's own wake: the clock moved to 00:00:01 of the next day, then the page focused — the
   posting clock (installed by the world) sees a new day and calls the Raptor side's notify(), as it does in the app
   when its timer fires or the page is shown again on a new day */
export function pastMidnight(): string {
  if (typeof window === 'undefined') throw new Error('pastMidnight needs a window — add the @vitest-environment jsdom pragma')
  if (!WAKE_OFF) throw new Error('pastMidnight needs the world\'s posting clock — call it inside useMsqWorld()')
  const d = new Date()
  vi.setSystemTime(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 1))
  window.dispatchEvent(new Event('focus'))
  return todayIso()
}

/* ---- a move, through the real door ---- */
const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y!, m! - 1, d! + n)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
/* his squadron move, saved now by whoever is signed in (the master admin when nobody is), counting from tomorrow */
export function moveMan(pid: string, unit: string): UnitSave {
  if (!SESSION) signInAs('saber')
  const r = setHome(pid, unit)
  unitsLoad()
  return r
}
/* the move saved today, and the three days a table reads: before (today — his old squadron's last day), the move day,
   the day after. Asserts he was `from`'s and the save went through. */
export function acrossMove(pid: string, from: string, to: string): { before: string; moveDay: string; after: string } {
  const today = todayIso()
  expect(homeOn(pid, today), `${pid} is ${from}'s before the move`).toBe(from)
  const r = moveMan(pid, to)
  expect(r, `${pid}'s move to ${to} saved`).toMatchObject({ ok: true })
  return { before: today, moveDay: addDays(today, 1), after: addDays(today, 2) }
}

/* a seeded admin (not a master — a master counts at home only, never as another squadron's admin, the plan §5.2) whose
   account is not in `exclude`: the first admin a setup-only change names (§9.2), so no assertion reads him */
export function bystanderAdminOf(unit: string, exclude: readonly string[] = []): string {
  const a = ACCOUNTS_LIST.find(x => isAdminAccount(x) && !x.master && x.on && !exclude.includes(x.id))
  if (!a) throw new Error(`no seeded admin is free to stand by for ${unit} — every one plays a part in this scenario`)
  return a.id
}

/* ---- the world, fresh each test ---- */
let PEOPLE0 = ''
let INPUTS0 = ''
export function useMsqWorld(): void {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    if (!PEOPLE0) { PEOPLE0 = JSON.stringify(PEOPLE); INPUTS0 = JSON.stringify(INPUTS) }
  })
  beforeEach(() => {
    on(15)                                                                  // Wed 15 Jul 26, 09:00
    Object.keys(mem).forEach(k => delete mem[k])
    storeBackend.impl = {
      getItem: (k: string) => (k in mem ? mem[k]! : null),
      setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
      keys: () => Object.keys(mem),
    } as any
    /* the roster and the inputs put back (a delete marks a man deleted in memory; a filing pushes onto the list) */
    const p0 = JSON.parse(PEOPLE0)
    for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
    Object.assign(PEOPLE, p0); indexCallsigns()
    const i0: unknown = JSON.parse(INPUTS0)
    INPUTS.length = 0
    if (Array.isArray(i0)) for (const r of i0) INPUTS.push(r)
    setUnitSeeds(true)
    worlds = { u142: memoryBackend(), u149: memoryBackend() }
    setWarWorldDoor(null)
    lwInitStore(worlds.u142!)
    raptorInitStore()
    accountsLoad()
    unitsLoad()
    resetSession(null)
    setPeople(projectPeople())
    wireLeaveWarSync()
    setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    settleWorld()
    WAKE_OFF = typeof window === 'undefined' ? null : installPostingClock()
    vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
  })
  afterEach(() => {
    if (WAKE_OFF) { WAKE_OFF(); WAKE_OFF = null }
    setConflictChecker(null)
    setSession(null); resetSession(null)
    _resetTimeline()
    vi.restoreAllMocks()
  })
  afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
}
