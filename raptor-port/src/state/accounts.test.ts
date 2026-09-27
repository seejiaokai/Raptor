// @vitest-environment jsdom
/* [ACCOUNTS] (26 Sep 26) — accounts, the sign-in's five outcomes, the access requests,
   the guards, and the session they start. Rulings named per test: D165, D166, D204,
   D211, D200 (3). The register lines are AC1… (docs/superpowers/specs/2026-09-26-
   accounts-behaviour-register.md). */
import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { SESSION, ME, DEFAULT_ME, setSession } from './auth'
import { initStore, resetSession, notify, writeInputs } from './store'
import { commitSettingsIntent } from './people-settings-commit'
import {
  accountsLoad, signIn, sessionFor, addAccount, updateAccount, approveRequest, declineRequest,
  requestAccess, setGuestView, ACCOUNTS_LIST, ACCESS_REQS, GUESTVIEW, accountByName, accountById,
  addPersonAndAccount, approveRequestNew, requestByName, requestSummary, accessAlert, unseenRequests,
  markRequestsSeen, currentAdminAccountId,
} from './accounts'
import { commandStream } from '../command'
import { peopleStore, commitPeopleSettingsIntent } from './people-settings-commit'
import { putNewPerson } from './roster-add'
import { subscribe } from './store'
import { me, isMe, roleOf, viewerId } from './perms'
import { store } from '../engine/hooks'
import { INPUTS, DATES, mintInpIds } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { autoAcceptInput } from '../engine/slots'
import { afterSchedMutate } from './view'
import { resyncSchedBaseline } from './sched-commit'

/* the settings are stored through storeBackend — a fake here, never real localStorage */
const mem: Record<string, string> = {}
let writes = 0
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { writes++; mem[k] = v },
}
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
/* a sign-up as the card sends it ([ACCOUNTS-NEW-PERSON] — D214: callsign/name, initials, seat, CAT) */
const ask = (cs: string, o: { ini?: string; seat?: string; cat?: string } = {}) =>
  requestAccess({ cs, ini: o.ini ?? 'JB', seat: o.seat ?? 'FCP', cat: o.cat ?? 'C' })

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  initStore()               // loads the accounts itself since the walk's reload finding
  resetSession(null)
})
afterAll(() => { storeBackend.impl = null })

describe('AC1 — the sign-in stands for the defence-mail sign-in (D166 (2))', () => {
  it('the two sign-ins everyone uses still work, and a wrong password is still refused (24 Aug 26)', () => {
    expect(signIn('ad', 'a')).toMatchObject({ kind: 'ok', account: { id: 'acad' } })
    expect(signIn('AD', 'a')).toMatchObject({ kind: 'ok' })            // the name is not case-sensitive
    expect(signIn('ad', 'A')).toEqual({ kind: 'bad' })                 // the password is
    expect(signIn('us', 'us')).toMatchObject({ kind: 'ok', account: { pid: 'bane' } })
    expect(signIn('us', 'x')).toEqual({ kind: 'bad' })
  })
  it('an account the admin adds takes any password — the app keeps none (data-model §3)', () => {
    expect(signIn('hex', 'anything')).toMatchObject({ kind: 'ok', account: { pid: 'rocky' } })
    expect(signIn('hex', '')).toEqual({ kind: 'bad' })
    expect(signIn('', 'x')).toEqual({ kind: 'bad' })
  })
  it('no password is ever written to a stored record — not even the two seeds\' (Astra R1-7)', () => {
    signInAs('ad', 'a')
    expect(addAccount('pike@mail', 'pike', 'main')).toBe(null)
    const stored = mem['sqn142_accounts']
    expect(stored).toBeTruthy()
    expect(stored).not.toMatch(/pass/i)
    expect(JSON.parse(stored).every((a: any) => Object.keys(a).sort().join() === 'id,name,on,pid,role')).toBe(true)
  })
})

describe('AC2 — signing in makes you that callsign (D166 (3)); every "who" names it (D166 (5))', () => {
  it('the admin is Saber, the member Ranger — one person, one account', () => {
    signInAs('ad', 'a')
    expect(ME).toBe('stiff'); expect(me()).toBe('stiff'); expect(roleOf()).toBe('admin')
    expect(HOOKS.whoami()).toBe(PEOPLE.stiff.cs)
    expect(HOOKS.whoamiId()).toBe('stiff')
    signInAs('us', 'us')
    expect(ME).toBe('bane'); expect(roleOf()).toBe('member')
    expect(HOOKS.whoami()).toBe(PEOPLE.bane.cs)
  })
  it('signing out puts back the headless default and nobody is signed in', () => {
    signInAs('hex')
    resetSession(null)
    expect(SESSION).toBe(null); expect(ME).toBe(DEFAULT_ME)
  })
  it('the Leave War follows the signed-in person, never null for a session (D166 (4))', () => {
    /* viewerId() is what the sync mirrors into the war's viewer (leavewar/sync.ts); the
       mirror itself is walked on the running app (the unit store does not wire the sync) */
    signInAs('hex'); expect(viewerId()).toBe('rocky')
    signInAs('nobody@mail'); expect(viewerId()).toBe('')                // pending: matches no row
    signInAs('ad', 'a'); setGuestView(true); signInAs('nobody@mail')
    signInAs('ad', 'a'); setGuestView(false)
  })
})

describe('AC3 — a new user joins either way (D204)', () => {
  it('on no list → pending; asks once, as himself; then waiting; the admin approves → in', () => {
    expect(signInAs('viper@mail')).toEqual({ kind: 'new', name: 'viper@mail' })
    expect(roleOf()).toBe('pending'); expect(me()).toBe(null)
    expect(ask('Viper')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(1)
    expect(ACCESS_REQS[0]).toMatchObject({ name: 'viper@mail', cs: 'Viper', ini: 'JB', seat: 'FCP', cat: 'C', seenBy: [] })
    expect(ask('Viper')).toMatch(/already asked/)
    expect(signInAs('viper@mail')).toEqual({ kind: 'waiting', name: 'viper@mail' })
    signInAs('ad', 'a')
    expect(approveRequest(ACCESS_REQS[0].id, 'pike', 'main')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(0)
    expect(accountByName('viper@mail')).toMatchObject({ pid: 'pike', role: 'main', on: true })
    expect(signInAs('viper@mail')).toMatchObject({ kind: 'ok' })
    expect(ME).toBe('pike')
  })
  it('a typed callsign never claims a puck — the admin must pick one', () => {
    signInAs('viper@mail'); ask('Ranger')
    signInAs('ad', 'a')
    expect(approveRequest(ACCESS_REQS[0].id, '', 'main')).toMatch(/Pick the callsign/)
    expect(approveRequest(ACCESS_REQS[0].id, 'bane', 'main')).toMatch(/already has an account/)   // Ranger is us's
  })
  it('declined, he may ask again; adding an account for a waiting name answers the request', () => {
    signInAs('viper@mail'); ask('Viper')
    signInAs('ad', 'a')
    expect(declineRequest(ACCESS_REQS[0].id)).toBe(null)
    expect(signInAs('viper@mail')).toEqual({ kind: 'new', name: 'viper@mail' })
    ask('Viper')
    signInAs('ad', 'a')
    expect(addAccount('viper@mail', 'pike', 'main')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(0)
  })
  it('renaming an account onto a waiting name answers the request too (Fable scenario S1)', () => {
    signInAs('viper@mail'); ask('Viper')
    signInAs('ad', 'a')
    expect(updateAccount('achex', { name: 'viper@mail' })).toBe(null)
    expect(ACCESS_REQS, 'the request is answered, not left to be refused').toHaveLength(0)
    expect(signIn('viper@mail', 'x')).toMatchObject({ kind: 'ok', account: { id: 'achex' } })
  })
  it('a stored request under a name that has an account is never listed (the load, in memory)', () => {
    mem['sqn142_accessreqs'] = JSON.stringify([{ id: 'r1', name: 'hex', cs: 'H', full: 'H', at: 1 }, { id: 'r2', name: 'kite@mail', cs: 'K', full: 'K', at: 2 }])
    accountsLoad()
    expect(ACCESS_REQS.map(r => r.name)).toEqual(['kite@mail'])
    /* a request an older build stored (a name, no seat — D56: read, never migrated) loads with
       its missing parts blank, for the admin to pick when he approves */
    expect(ACCESS_REQS[0]).toMatchObject({ cs: 'K', ini: '', seat: '', cat: '', seenBy: [] })
  })
  it('the guest switch is off by default; on, a waiting person signs in as a guest', () => {
    expect(GUESTVIEW).toBe(false)
    signInAs('viper@mail'); ask('Viper')
    signInAs('ad', 'a'); expect(setGuestView(true)).toBe(null)
    expect(signInAs('viper@mail')).toEqual({ kind: 'guest', name: 'viper@mail' })
    expect(roleOf()).toBe('guest'); expect(me()).toBe(null); expect(HOOKS.whoami()).toBe('Guest')
  })
  it('a person on no list cannot do an admin\'s work, nor ask for someone else', () => {
    signInAs('viper@mail')
    expect(addAccount('x@mail', 'pike', 'main')).toMatch(/Only an admin/)
    expect(setGuestView(true)).toMatch(/Only an admin/)
    /* the gate itself refuses a request that names someone else (perms.ts COMMAND_OPS) */
    const r: any = commitSettingsIntent('access.request', { owner: 'someone@else' }, () => store.set('accessreqs', []))
    expect(r.ok).toBe(false)
  })
})

describe('AC4 — the guards (each refusal says why)', () => {
  it('an admin never changes his own account', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acad', { role: 'main' })).toMatch(/your own account/)
    expect(updateAccount('acad', { on: false })).toMatch(/your own account/)
  })
  it('switched off → the switched-off screen; switched back on → in', () => {
    signInAs('ad', 'a')
    expect(updateAccount('achex', { on: false })).toBe(null)
    expect(signInAs('hex')).toEqual({ kind: 'off', name: 'hex' })
    expect(roleOf()).toBe('off')
    signInAs('ad', 'a'); expect(updateAccount('achex', { on: true })).toBe(null)
    expect(signInAs('hex')).toMatchObject({ kind: 'ok' })
  })
  it('at least one admin who can sign in always remains', () => {
    /* an admin session whose own account is not in the list (so "not your own" does
       not stand in the way) cannot demote the last admin */
    setSession({ user: 'someone', role: 'admin', pid: 'nact', name: 'someone' })
    expect(updateAccount('acad', { role: 'main' })).toMatch(/At least one admin/)
    expect(updateAccount('acad', { on: false })).toMatch(/At least one admin/)
  })
  it('one person one account; one sign-in name one account', () => {
    signInAs('ad', 'a')
    expect(addAccount('other@mail', 'bane', 'main')).toMatch(/already has an account/)
    expect(addAccount('HEX', 'pike', 'main')).toMatch(/hex already has an account/)
  })
  it('an archived callsign keeps its account (posting out archives automatically)', () => {
    PEOPLE.rocky.archived = true
    try { expect(signIn('hex', 'x')).toMatchObject({ kind: 'ok' }) } finally { PEOPLE.rocky.archived = false }
  })
  it('a relinked puck is the new person at the next sign-in; a callsign rename moves nothing', () => {
    signInAs('ad', 'a'); expect(updateAccount('achex', { pid: 'pike' })).toBe(null)
    signInAs('hex'); expect(ME).toBe('pike')
    expect(accountById('achex')!.pid).toBe('pike')
  })
})

describe('AC5 — the records load safely (a settings loader never writes)', () => {
  it('loading writes nothing', () => {
    const before = writes
    accountsLoad(); accountsLoad()
    expect(writes).toBe(before)
  })
  it('a stored list with no admin gets the seed admin ADDED, every real account kept (Fable R2-6)', () => {
    mem['sqn142_accounts'] = JSON.stringify([{ id: 'a1', name: 'm1', role: 'main', pid: 'pike', on: true }, { id: 'a2', name: 'm2', role: 'main', pid: 'dj', on: true }])
    accountsLoad()
    expect(ACCOUNTS_LIST.map(a => a.name).sort()).toEqual(['ad', 'm1', 'm2'])
  })
  it('…and the seed admin WINS a collision on its name, its person or its id (Astra R3-4)', () => {
    mem['sqn142_accounts'] = JSON.stringify([
      { id: 'a1', name: 'ad', role: 'main', pid: 'pike', on: true },
      { id: 'a2', name: 'm2', role: 'main', pid: 'stiff', on: true },
      { id: 'acad', name: 'm3', role: 'main', pid: 'dj', on: true },
      { id: 'a4', name: 'm4', role: 'main', pid: 'nact', on: true },
    ])
    accountsLoad()
    expect(ACCOUNTS_LIST.find(a => a.name === 'ad')).toMatchObject({ id: 'acad', role: 'admin', pid: 'stiff', on: true })
    expect(ACCOUNTS_LIST.map(a => a.name).sort()).toEqual(['ad', 'm4'])
  })
  it('bad entries are dropped, one by one', () => {
    mem['sqn142_accounts'] = JSON.stringify([null, { id: '', name: 'x' }, { id: 'ok', name: 'Ok', role: 'admin', pid: 'nact' }, { id: 'd', name: 'ok', role: 'main', pid: 'dj' }])
    accountsLoad()
    expect(ACCOUNTS_LIST).toEqual([{ id: 'ok', name: 'ok', role: 'admin', pid: 'nact', on: true }])
  })
})

describe('AC6 — an account change is one command; its keys roll back together (Astra R2-3)', () => {
  it('a failure inside the intent command leaves every key as it was', () => {
    signInAs('ad', 'a')
    const before = mem['sqn142_accounts'] ?? null
    const r: any = commitSettingsIntent('access.approve', null, () => {
      store.set('accounts', [{ id: 'zz', name: 'zz', role: 'admin', pid: 'dj', on: true }])
      throw new Error('boom')
    })
    expect(r.ok).toBe(false)
    /* a key the rollback puts back to "none" may be stored as null — the same meaning */
    expect(JSON.parse(mem['sqn142_accounts'] ?? 'null')).toEqual(JSON.parse(before ?? 'null'))
  })
})

describe('AC7 — a member\'s command changes only his own records (perms.ts ownershipViolation)', () => {
  it('a guest files nothing; a member files only for himself', () => {
    signInAs('viper@mail'); ask('V')
    signInAs('ad', 'a'); setGuestView(true)
    signInAs('viper@mail')
    const n = INPUTS.length
    writeInputs(() => { INPUTS.unshift({ iid: 'zzguest', person: 'bane', type: 'LL', date: '14/07/2026', remarks: '' } as any) })
    expect(INPUTS.length).toBe(n)
    signInAs('us', 'us')
    writeInputs(() => { INPUTS.unshift({ iid: 'zzother', person: 'stiff', type: 'LL', date: '14/07/2026', remarks: '' } as any) })
    expect(INPUTS.some((r: any) => r.iid === 'zzother')).toBe(false)
    expect(isMe('bane')).toBe(true); expect(isMe('stiff')).toBe(false)
  })
  /* Fable's and Astra's code reads (26 Sep 26): the bare "the schedule changed" command is
     the one schedule command a member's actor can open — as a top-level command it changes
     nothing of the schedule for him; his own input's landing (inside his input command) still does */
  it("a member's own activity input lands on the ground programme; a bare schedule change by him rolls back", () => {
    mintInpIds(); resyncSchedBaseline()
    signInAs('us', 'us')
    const di = 1, before = JSON.stringify(DAYS[di].ground || [])
    const ok = writeInputs(() => {
      const row: any = { person: 'bane', type: 'Meeting', date: DATES[di], allday: false, s: 900, e: 960, remarks: 'walked brief', mod: '2026-01-01' }
      INPUTS.unshift(row); autoAcceptInput(row, true)
    })
    expect(ok, 'his own input and its landing are one allowed command').toBe(true)
    expect(JSON.stringify(DAYS[di].ground || [])).not.toBe(before)
    expect(JSON.stringify(DAYS[di].ground)).toContain('bane')
    const notes = JSON.stringify(DAYS[di].notes || [])
    ;(DAYS[di] as any).notes = [...(DAYS[di].notes || []), { rid: 'nmember', t: 'a member writing the schedule directly' }]
    afterSchedMutate()
    expect(JSON.stringify(DAYS[di].notes || []), 'rolled back to the last committed schedule').toBe(notes)
  })
})

/* ---- [ACCOUNTS-NEW-PERSON] (26 Sep 26) — D214, D216, D217, D225, D226, D227 ----
   Register lines NP3–NP6, NP8. The one add itself (the callsign rule, personnel) is
   roster-add.test.ts; here, the person WITH his account, approving with New person, the
   sign-up's fields and the admins' bell. */
const csOf = (cs: string) => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs)
const drop = (...css: string[]) => { for (const cs of css) { const id = csOf(cs); if (id) delete (PEOPLE as any)[id]; delete (ID_BY_CS as any)[cs.toLowerCase()] } }
const NEW = { cs: 'Blaze', ini: 'rtk', seat: 'RCP', cat: 'D' }
const fresh = () => { drop('Blaze', 'Vyper', 'Viper', 'Gecko', 'Chris'); initStore(); resetSession(null) }

describe('NP4 — the sign-up asks what the admin asks (D214, D222, D225, D226)', () => {
  beforeEach(fresh)
  it('refuses a missing pick or an over-long name with its reason; initials may be blank', () => {
    signInAs('fresh@mail')
    expect(requestAccess({ cs: '', ini: '', seat: 'FCP', cat: 'C' })).toBe('Type the callsign or name')
    expect(requestAccess({ cs: 'Christopher Tan', ini: '', seat: 'FCP', cat: 'C' })).toMatch(/at most 14 letters/)
    expect(requestAccess({ cs: 'Chris', ini: '', seat: '', cat: '' })).toBe('Pick pilot, WSO or personnel')
    expect(requestAccess({ cs: 'Chris', ini: '', seat: 'FCP', cat: '' })).toBe('Pick the CAT')
    expect(ACCESS_REQS).toHaveLength(0)
    expect(requestAccess({ cs: 'Chris', ini: '', seat: 'GND', cat: 'C' }), 'personnel: no CAT; blank initials').toBe(null)
    expect(ACCESS_REQS[0]).toMatchObject({ cs: 'Chris', ini: '', seat: 'GND', cat: '' })
  })
  it('never tells a person not yet let in whether a callsign is taken', () => {
    signInAs('fresh@mail')
    expect(ask('Ranger')).toBe(null)
    expect(ACCESS_REQS[0].cs).toBe('Ranger')
  })
  it('requestSummary — one line for the waiting screen and the admin: blank parts drop out', () => {
    signInAs('fresh@mail'); ask('Viper', { ini: 'jkb' })
    expect(requestSummary(ACCESS_REQS[0])).toBe('JKB · Pilot · CAT C')
    signInAs('bolt@mail'); requestAccess({ cs: 'Bolt', ini: '', seat: 'GND', cat: '' })
    expect(requestSummary(ACCESS_REQS.find(r => r.name === 'bolt@mail')!)).toBe('Personnel')
  })
})

describe('NP3 — a new person with his account is ONE step (D214, D217)', () => {
  beforeEach(fresh)
  it('person and account together, one account.addNew command, and he signs in as himself', () => {
    signInAs('ad', 'a')
    const n = commandStream().length
    expect(addPersonAndAccount('Blaze@Mail', NEW, 'main')).toBe(null)
    const pid = csOf('Blaze')!
    expect(PEOPLE[pid]).toMatchObject({ cs: 'Blaze', initials: 'RTK', seat: 'RCP', q: 'D', flight: '-' })
    expect(accountByName('blaze@mail')).toMatchObject({ pid, role: 'main', on: true })
    const envs = commandStream().slice(n)
    expect(envs.map(e => e.type)).toEqual(['account.addNew'])
    expect(envs[0].changes.map(c => `${c.collection}/${c.id}`).sort()).toEqual([`people/${pid}`, 'settings/accounts'])
    expect(signInAs('blaze@mail')).toMatchObject({ kind: 'ok' })
    expect(ME).toBe(pid)
  })
  it('D217: a blank sign-in makes a roster-only person — no account, a person.add command', () => {
    signInAs('ad', 'a')
    const accounts = ACCOUNTS_LIST.length, n = commandStream().length
    expect(addPersonAndAccount('  ', { cs: 'Gecko', ini: '', seat: 'FCP', cat: 'OCU' }, 'main')).toBe(null)
    expect(csOf('Gecko')).toBeTruthy()
    expect(ACCOUNTS_LIST.length).toBe(accounts)
    expect(commandStream().slice(n).map(e => e.type)).toEqual(['person.add'])
  })
  it('a refusal on either half leaves NOTHING — no person, no account', () => {
    signInAs('ad', 'a')
    const people = Object.keys(PEOPLE).length, accounts = JSON.stringify(ACCOUNTS_LIST)
    expect(addPersonAndAccount('hex', NEW, 'main')).toBe('hex already has an account')
    expect(addPersonAndAccount('blaze@mail', { ...NEW, cs: 'Saber' }, 'main')).toMatch(/already taken/)
    expect(addPersonAndAccount('blaze@mail', { ...NEW, cat: '' }, 'main')).toBe('Pick the CAT')
    expect(addPersonAndAccount('blaze@mail', NEW, 'boss' as any)).toBe('Pick member or admin')
    expect(Object.keys(PEOPLE).length).toBe(people)
    expect(JSON.stringify(ACCOUNTS_LIST)).toBe(accounts)
  })
  it('a sign-in name that has asked is answered by the add, in the same step', () => {
    signInAs('blaze@mail'); ask('Blaze')
    signInAs('ad', 'a')
    expect(addPersonAndAccount('blaze@mail', NEW, 'main')).toBe(null)
    expect(requestByName('blaze@mail')).toBeUndefined()
  })
  it("a throw after the person is written, before the account, rolls BOTH back (Astra's plan read 7)", () => {
    signInAs('ad', 'a')
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const people = peopleStore.capture(), stored = mem['sqn142_accounts'] ?? null
    try {
      const r: any = commitPeopleSettingsIntent('account.addNew', null, () => { putNewPerson(NEW); throw new Error('boom') })
      expect(r.ok).toBe(false)
      expect(csOf('Blaze')).toBeUndefined()
      expect(peopleStore.capture()).toBe(people)
      expect(JSON.parse(mem['sqn142_accounts'] ?? 'null')).toEqual(JSON.parse(stored ?? 'null'))
    } finally { err.mockRestore() }
  })
  it('a throw after BOTH are written rolls both back, and no screen hears of the half-made person', () => {
    signInAs('ad', 'a')
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    let heard = 0; const off = subscribe(() => { heard++ })
    try {
      const r: any = commitPeopleSettingsIntent('account.addNew', null, () => {
        const pid = putNewPerson(NEW)
        store.set('accounts', [...ACCOUNTS_LIST, { id: 'acx', name: 'blaze@mail', role: 'main', pid, on: true }])
        throw new Error('boom')
      })
      expect(r.ok).toBe(false)
      expect(csOf('Blaze')).toBeUndefined()
      accountsLoad()
      expect(accountByName('blaze@mail')).toBeUndefined()
      expect(heard, 'the Leave War / Tracker projections run on notify — they never saw him').toBe(0)
    } finally { off(); err.mockRestore() }
  })
  it("the ownership check refuses a member's person-and-account write after both halves changed", () => {
    signInAs('us', 'us')
    const people = Object.keys(PEOPLE).length
    /* the gate lets his own-row people command through; the invariant then reads what it DID */
    const r: any = commitPeopleSettingsIntent('people.edit', { owner: 'bane' }, () => {
      const pid = putNewPerson(NEW)
      store.set('accounts', [...ACCOUNTS_LIST, { id: 'acx', name: 'blaze@mail', role: 'main', pid, on: true }])
    })
    expect(r.ok).toBe(false)
    expect(Object.keys(PEOPLE).length).toBe(people)
    accountsLoad()
    expect(accountByName('blaze@mail')).toBeUndefined()
  })
})

describe('NP5 — approving with New person, filled from what he gave (D214, D204)', () => {
  beforeEach(fresh)
  it("the admin's corrections win; person, account and the request answered in one step", () => {
    signInAs('viper@mail'); ask('Viper', { ini: 'jkb', seat: 'RCP', cat: 'C' })
    signInAs('ad', 'a')
    const rq = ACCESS_REQS[0], n = commandStream().length
    expect(approveRequestNew(rq.id, { cs: 'Vyper', ini: rq.ini, seat: rq.seat, cat: 'D' }, 'main')).toBe(null)
    const pid = csOf('Vyper')!
    expect(PEOPLE[pid]).toMatchObject({ cs: 'Vyper', initials: 'JKB', seat: 'RCP', q: 'D' })
    expect(csOf('Viper'), 'what he typed never became a person by itself').toBeUndefined()
    expect(accountByName('viper@mail')).toMatchObject({ pid })
    expect(ACCESS_REQS).toHaveLength(0)
    const envs = commandStream().slice(n)
    expect(envs.map(e => e.type)).toEqual(['access.approveNew'])
    expect(envs[0].changes.map(c => `${c.collection}/${c.id}`).sort()).toEqual([`people/${pid}`, 'settings/accessreqs', 'settings/accounts'])
  })
  it("a typed callsign that is someone's is refused as New person; the request stays", () => {
    signInAs('viper@mail'); ask('Ranger')
    signInAs('ad', 'a')
    const rq = ACCESS_REQS[0]
    expect(approveRequestNew(rq.id, { cs: rq.cs, ini: rq.ini, seat: rq.seat, cat: rq.cat }, 'main')).toMatch(/Ranger is already taken/)
    expect(ACCESS_REQS).toHaveLength(1)
    expect(approveRequestNew('rq-gone', NEW, 'main')).toBe('That request is gone')
  })
})

describe("NP6 — each admin's bell is his own (D216, D227)", () => {
  beforeEach(fresh)
  it('lights for every admin until HE has seen the list; a later request lights it again', () => {
    signInAs('ad', 'a')
    expect(addAccount('b@mail', 'pike', 'admin')).toBe(null)
    expect(accessAlert()).toBe(false)
    signInAs('kite@mail'); ask('Kite')
    signInAs('ad', 'a'); expect(accessAlert()).toBe(true)
    const n = commandStream().length
    expect(markRequestsSeen()).toBe(null)
    expect(commandStream().slice(n).map(e => e.type)).toEqual(['access.seen'])
    expect(accessAlert()).toBe(false)
    expect(markRequestsSeen()).toBe(null)
    expect(commandStream().length, 'nothing new — nothing written').toBe(n + 1)
    signInAs('b@mail'); expect(accessAlert(), 'the other admin has not seen it').toBe(true)
    markRequestsSeen(); expect(accessAlert()).toBe(false)
    signInAs('ad', 'a'); expect(accessAlert()).toBe(false)
    signInAs('wren@mail'); ask('Wren')
    signInAs('ad', 'a'); expect(accessAlert(), 'a new request lights it again').toBe(true)
    expect(unseenRequests().map(r => r.cs)).toEqual(['Wren'])
  })
  it('survives a reload; a request answered before it was seen puts the bell out', () => {
    signInAs('kite@mail'); ask('Kite')
    signInAs('ad', 'a'); markRequestsSeen()
    accountsLoad(); expect(accessAlert()).toBe(false)
    signInAs('wren@mail'); ask('Wren')
    signInAs('ad', 'a'); expect(accessAlert()).toBe(true)
    declineRequest(ACCESS_REQS.find(r => r.cs === 'Wren')!.id)
    expect(accessAlert()).toBe(false)
  })
  it("never a member's, a pending person's, or a made-up admin with no account (Astra's plan read 6)", () => {
    signInAs('kite@mail'); ask('Kite')
    signInAs('us', 'us'); expect(accessAlert()).toBe(false); expect(markRequestsSeen()).toBe(null)
    signInAs('wren@mail'); expect(accessAlert()).toBe(false)
    resetSession({ user: 'principal:kite@mail', role: 'admin', pid: null, name: 'kite@mail' })
    expect(currentAdminAccountId()).toBe(null)
    expect(accessAlert()).toBe(false)
    markRequestsSeen()
    expect(ACCESS_REQS[0].seenBy).toEqual([])
  })
})

describe('NP8 — only an admin adds a person, approves or marks seen', () => {
  beforeEach(fresh)
  it('a member and a pending person are refused at the function, and nothing moves', () => {
    signInAs('viper@mail'); ask('Viper')
    const rq = ACCESS_REQS[0]
    for (const who of [() => signInAs('us', 'us'), () => signInAs('nobody@mail')]) {
      who()
      const people = Object.keys(PEOPLE).length
      expect(addPersonAndAccount('blaze@mail', NEW, 'main')).toMatch(/Only an admin/)
      expect(addPersonAndAccount('', NEW, 'main')).toBe('Only an admin can add someone')
      expect(approveRequestNew(rq.id, NEW, 'main')).toMatch(/Only an admin/)
      expect(Object.keys(PEOPLE).length).toBe(people)
      expect(ACCESS_REQS).toHaveLength(1)
    }
  })
})
