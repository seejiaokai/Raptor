// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS A: THE COMMIT GATE (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §3 R1, R2 and §8 "The gate (V6)"). Each case is forged past the
   doors as a command, the way state/reshape-plan-audit.test.ts forges them, and read by the gate's own reason ("by
   name"), so a refusal for some other reason never passes for this one.
   His rulings: D2626 — Plan of a squadron is given and ended by that squadron's own admins or a master admin; D2730 Q8,
   D2806 — only they make its admins; D2730 Q10 — only one who can still sign in; D2730 Q12 — the re-link. The world:
   withThird (his D2630), Wed 15 Jul 26 — Hunter 142's admin with Plan of 149, Kestrel 149's own admin, Mako 150's own
   admin, Saber the master admin, Ranger 142's member, Osprey 149's member. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT, third } from '../test-support/msq-world'
import { accountsLoad, updateAccount, saveAccess, stampMoments, accountById, linkablePeople, ACCOUNT_PFX, levelIn } from './accounts'
import { unitsLoad, todayIso, addUnit, unitRows, homeOn } from './units'
import { GRANT_PFX } from './units-model'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { switchRoleView } from './store'
import { setSession, SESSION } from './auth'
import { globalUndo, globalRedo } from '../undo/timeline'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
const WHO = /Plan given, changed or taken by one who may not give it/
const MADE = (u: string) => new RegExp(`a man made an admin of ${u} by one who may not give its Plan`)
/* a forged command: rows written past every door, the gate the one judge */
const forge = (type: string, rows: Array<[string, unknown]>): any => {
  const r: any = commitSettingsIntent(type, null, () => { for (const [k, v] of rows) store.set(k, v) })
  reload()
  return r
}
const give = (id: string, account: string, unit: string, extra: Record<string, unknown> = {}) =>
  forge('grant.set', [[GRANT_PFX + id, { id, account, unit, level: 'admin', from: todayIso(), fromAt: Date.now(), ...extra }]])
const hunterPlan = () => unitRows().grants.find(g => g.account === ACCT.hunter && g.unit === 'u149')!
const accRow = (id: string): any => store.get(ACCOUNT_PFX + id, null)
const said = (r: any) => String(r?.message ?? '')

describe('V6 — who gives and ends Plan of 149, at the gate (D2626)', () => {
  it('Kestrel, 149\'s own admin, gives Mako Plan of 149 as one grant row and nothing else: saved', () => {
    signInAs('kestrel')
    const r = give('gu1', ACCT.mako, 'u149')
    expect(r.ok, said(r)).toBe(true)
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBe('admin')
  })
  it('Kestrel ends Hunter\'s Plan of 149 as one grant row: saved', () => {
    signInAs('kestrel')
    const r = forge('grant.remove', [[GRANT_PFX + hunterPlan().id, null]])
    expect(r.ok, said(r)).toBe(true)
  })
  /* the forged give and end, by each who may not */
  const mayNot: Array<[string, () => void]> = [
    ['Hunter, holding Plan of 149', () => signInAs('hunter')],
    ['Mako, 150\'s own admin', () => signInAs('mako')],
    ['Ranger, made an admin of 142', () => { signInAs('saber'); expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull(); signInAs('ranger') }],
  ]
  it.each(mayNot)('%s: a forged give of Plan of 149, and a forged end of Hunter\'s, refused by name', (_n, as) => {
    as()
    const g = give('gu2', ACCT.mako, 'u149')
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(WHO)
    const e = forge('grant.remove', [[GRANT_PFX + hunterPlan().id, null]])
    expect(e.ok).toBe(false)
    expect(said(e)).toMatch(WHO)
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'Hunter\'s Plan stands').toBe('admin')
  })
  it('pin: Saber in the member view: a forged give refused (the role in force is a member\'s)', async () => {
    signInAs('saber')
    await switchRoleView()
    const g = give('gu3', ACCT.mako, 'u149')
    expect(g.ok).toBe(false)
  })
  it('Kestrel switched off, his session still open (Osprey made an admin first): a forged give refused by name', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey an admin of 149').toBeNull()
    const ks = SESSION
    signInAs('saber')
    expect(updateAccount(ACCT.kestrel, { on: false })).toBeNull()
    reload()
    expect(accountById(ACCT.kestrel)!.on).toBe(false)
    /* Kestrel's own session, still held on his device */
    setSession(ks)
    const g = give('gu4', ACCT.mako, 'u149')
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(WHO)
  })
  it('the moved admin, not re-made: Hunter moved to 149, his admin session still open, gives Plan of 149: refused by name', () => {
    signInAs('hunter')
    const hs = SESSION
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.hunter, todayIso())).toBe('u149')
    setSession(hs)
    const g = give('gu5', ACCT.mako, 'u149')
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(WHO)
  })
  it('pin: Saber\'s one Save making Ranger an admin and giving him Plan of 149: saved', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin', grants: { u149: 'plan' } })).toBeNull()
    reload()
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBe('admin')
  })
  it('a give to a moved "admin" who is a member where he now is: Saber\'s forged Plan of 142 to Hunter, moved to 149, refused by the receiver\'s name', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(16); reload()
    expect(accountById(ACCT.hunter)!.role, 'his account still reads admin').toBe('admin')
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'a member of 149 in force').toBe('member')
    const g = give('gu6', ACCT.hunter, 'u142')
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(/Plan on an account that is not an admin's/)
  })
  it('pin: one command making its own actor an admin of 149 and giving Plan of 149: refused (judged as he stood before it)', () => {
    signInAs('hunter')
    const hs = SESSION
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(16); reload()
    setSession(hs)
    const prev = accRow(ACCT.hunter)
    const remade = stampMoments(prev, { ...prev, role: 'admin', adminOf: 'u149', adminFrom: todayIso() })
    const r = forge('account.access', [
      [ACCOUNT_PFX + ACCT.hunter, remade],
      [GRANT_PFX + 'gu7', { id: 'gu7', account: ACCT.mako, unit: 'u149', level: 'admin', from: todayIso(), fromAt: Date.now() }],
    ])
    expect(r.ok).toBe(false)
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBeNull()
  })
})

describe('V6 — the first-admin mark (the plan §19.2 "The `first` mark")', () => {
  it('Kestrel writes a Plan of 149 carrying first: refused by name', () => {
    signInAs('kestrel')
    const g = give('gf1', ACCT.mako, 'u149', { first: true })
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(/first-admin mark written outside "\+ New squadron"/)
  })
  it('Saber writes a Plan of 149 carrying first: refused by name', () => {
    signInAs('saber')
    const g = give('gf2', ACCT.mako, 'u149', { first: true })
    expect(g.ok).toBe(false)
    expect(said(g)).toMatch(/first-admin mark written outside "\+ New squadron"/)
  })
  it('pin: a kept first — Mako\'s first row of 150 written again unchanged by Saber: saved', () => {
    signInAs('saber')
    const row = unitRows().grants.find(g => g.unit === third.u150 && (g as any).first === true)
    expect(row, 'setup: Mako\'s first row of 150').toBeTruthy()
    const r = forge('grant.set', [[GRANT_PFX + row!.id, { ...(store.get(GRANT_PFX + row!.id, null) as any) }]])
    expect(r.ok, said(r)).toBe(true)
  })
  it('pin: "+ New squadron" with Kestrel its first admin, its Undo and its Redo: saved', () => {
    signInAs('saber')
    const made = addUnit('151', 'p1', ACCT.kestrel)
    expect(made.ok, JSON.stringify(made)).toBe(true)
    const u = String((made as any).id)
    reload()
    expect(unitRows().grants.some(g => g.unit === u && (g as any).first === true)).toBe(true)
    const un = globalUndo()
    expect(un.ok, JSON.stringify(un)).toBe(true)
    reload()
    expect(unitRows().units.some(x => x.id === u)).toBe(false)
    const re = globalRedo()
    expect(re.ok, JSON.stringify(re)).toBe(true)
    reload()
    expect(unitRows().grants.some(g => g.unit === u && (g as any).first === true)).toBe(true)
  })
})

describe('V6 — the re-link (D2730 Q12) and Q8 at the gate (D2806)', () => {
  it('Ranger, made 142\'s admin, re-links Hunter\'s sign-in (holding Plan of 149) to another 142 man, dropping the Plan: refused by name', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    reload()
    /* Hunter's View of 150 ended first, so the Plan is the one right his sign-in holds */
    signInAs('mako')
    expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'none' } })).toBeNull()
    signInAs('ranger')
    const other = linkablePeople(undefined, 'u142').find(p => homeOn(p, todayIso()) === 'u142')
    expect(other, 'setup: a 142 man with no sign-in').toBeTruthy()
    const prev = accRow(ACCT.hunter)
    const relinked = stampMoments(prev, { ...prev, pid: other!, pidFrom: todayIso() })
    /* the re-link with its drop of the Plan: the drop is an end of Plan by one who may not (the Plan who-check) */
    const r = forge('account.update', [[ACCOUNT_PFX + ACCT.hunter, relinked], [GRANT_PFX + hunterPlan().id, null]])
    expect(r.ok).toBe(false)
    expect(said(r)).toMatch(WHO)
    /* …and the re-link alone, the Plan row left standing: G4 names it */
    const r2 = forge('account.update', [[ACCOUNT_PFX + ACCT.hunter, relinked]])
    expect(r2.ok).toBe(false)
    expect(said(r2)).toMatch(/re-linked by one who may not end it/)
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'Hunter\'s sign-in keeps its Plan').toBe('admin')
  })
  it('Q8: Hunter, holding Plan of 149, forges Osprey\'s account to admin: refused by name', () => {
    signInAs('hunter')
    const prev = accRow(ACCT.osprey)
    const r = forge('account.update', [[ACCOUNT_PFX + ACCT.osprey, stampMoments(prev, { ...prev, role: 'admin' })]])
    expect(r.ok).toBe(false)
    expect(said(r)).toMatch(MADE('u149'))
    expect(accountById(ACCT.osprey)!.role).toBe('main')
  })
  it('pin: Q8 — Kestrel, 149\'s own admin, the same forged command: saved', () => {
    signInAs('kestrel')
    const prev = accRow(ACCT.osprey)
    const r = forge('account.update', [[ACCOUNT_PFX + ACCT.osprey, stampMoments(prev, { ...prev, role: 'admin' })]])
    expect(r.ok, said(r)).toBe(true)
    expect(accountById(ACCT.osprey)!.role).toBe('admin')
  })
})
