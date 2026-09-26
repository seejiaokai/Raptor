// @vitest-environment jsdom
/* [ACCOUNTS] (26 Sep 26) — accounts, the sign-in's five outcomes, the access requests,
   the guards, and the session they start. Rulings named per test: D165, D166, D204,
   D211, D200 (3). The register lines are AC1… (docs/superpowers/specs/2026-09-26-
   accounts-behaviour-register.md). */
import { beforeEach, afterAll, describe, expect, it } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { SESSION, ME, DEFAULT_ME, setSession } from './auth'
import { initStore, resetSession, notify, writeInputs } from './store'
import { commitSettingsIntent } from './people-settings-commit'
import {
  accountsLoad, signIn, sessionFor, addAccount, updateAccount, approveRequest, declineRequest,
  requestAccess, setGuestView, ACCOUNTS_LIST, ACCESS_REQS, GUESTVIEW, accountByName, accountById,
} from './accounts'
import { me, isMe, roleOf, viewerId } from './perms'
import { store } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'

/* the settings are stored through storeBackend — a fake here, never real localStorage */
const mem: Record<string, string> = {}
let writes = 0
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { writes++; mem[k] = v },
}
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  initStore()
  accountsLoad()
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
    expect(requestAccess('Viper', 'Jo Bloggs')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(1)
    expect(ACCESS_REQS[0]).toMatchObject({ name: 'viper@mail', cs: 'Viper', full: 'Jo Bloggs' })
    expect(requestAccess('Viper', 'Jo Bloggs')).toMatch(/already asked/)
    expect(signInAs('viper@mail')).toEqual({ kind: 'waiting', name: 'viper@mail' })
    signInAs('ad', 'a')
    expect(approveRequest(ACCESS_REQS[0].id, 'pike', 'main')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(0)
    expect(accountByName('viper@mail')).toMatchObject({ pid: 'pike', role: 'main', on: true })
    expect(signInAs('viper@mail')).toMatchObject({ kind: 'ok' })
    expect(ME).toBe('pike')
  })
  it('a typed callsign never claims a puck — the admin must pick one', () => {
    signInAs('viper@mail'); requestAccess('Ranger', 'Someone')
    signInAs('ad', 'a')
    expect(approveRequest(ACCESS_REQS[0].id, '', 'main')).toMatch(/Pick the callsign/)
    expect(approveRequest(ACCESS_REQS[0].id, 'bane', 'main')).toMatch(/already has an account/)   // Ranger is us's
  })
  it('declined, he may ask again; adding an account for a waiting name answers the request', () => {
    signInAs('viper@mail'); requestAccess('Viper', 'Jo')
    signInAs('ad', 'a')
    expect(declineRequest(ACCESS_REQS[0].id)).toBe(null)
    expect(signInAs('viper@mail')).toEqual({ kind: 'new', name: 'viper@mail' })
    requestAccess('Viper', 'Jo')
    signInAs('ad', 'a')
    expect(addAccount('viper@mail', 'pike', 'main')).toBe(null)
    expect(ACCESS_REQS).toHaveLength(0)
  })
  it('the guest switch is off by default; on, a waiting person signs in as a guest', () => {
    expect(GUESTVIEW).toBe(false)
    signInAs('viper@mail'); requestAccess('Viper', 'Jo')
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
    signInAs('viper@mail'); requestAccess('V', 'J')
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
})
