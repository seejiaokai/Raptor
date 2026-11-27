// @vitest-environment jsdom
/* PIECE B'S TABLES (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §4.4): the reading rule
   (units-model.ts grantOn — his D2203, D2243: a right ends at the start of the day its man's squadron changes, and never
   holds again), the one dated check for homes and places (datedRowsBreach), the restore's leave-out body (perms.ts
   restoreLeavesOut — guardrails 1 and 2, as a pure function; its wiring into the Undo is helper "undo & roles"'), R7 (a
   Plan holder made a member only by a master admin, his Plan going in that command) and "moves tomorrow" for gives and
   raises only (Fable 4, Opus L3). The first two on rows built by hand; the rest in the shared world
   (test-support/msq-world.ts — Wed 15 Jul 26, 142's war loaded). */
import { describe, expect, it } from 'vitest'
import { grantOn, levelFrom, datedRowsBreach, type UnitRows, type Grant, type Home } from './units-model'
import { useMsqWorld, PID, ACCT, signInAs, moveMan, at } from '../test-support/msq-world'
import { setGrant, removeGrant, unitsLoad, unitRows, grantOfOn } from './units'
import { updateAccount, levelIn, accountById, ACCOUNT_PFX } from './accounts'
import { restoreLeavesOut } from './perms'
import { GRANT_PFX } from './units-model'
import { store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'
import type { Change } from '../command/types'

const U = (id: string) => ({ id, num: id.slice(1), kind: 'sqn' as const })
const rows = (homes: Home[], grants: Grant[], unitplaces: UnitRows['unitplaces'] = []): UnitRows =>
  ({ units: [U('u142'), U('u149'), U('u150')], places: [{ id: 'p1', name: 'Home', tz: 'Australia/Perth' }, { id: 'p2', name: 'Det', tz: 'Australia/Perth' }], unitplaces, grants, homes })
const h = (id: string, pid: string, unit: string, from: string): Home => ({ id, pid, unit, from })
const view150 = (from?: string): Grant => ({ id: 'g1', account: 'a1', unit: 'u150', level: 'view', ...(from ? { from } : {}) })
const who = { id: 'a1', pid: 'p1', pidFrom: undefined as string | undefined }

describe('grantOn — the reading rule', () => {
  const holds = (r: UnitRows, iso: string, acct = who) => !!grantOn(r, acct, 'u150', iso, 'u142')
  it('no move: from its day on, never before it', () => {
    const r = rows([], [view150('2026-07-15')])
    expect([holds(r, '2026-07-14'), holds(r, '2026-07-15'), holds(r, '2026-07-30')]).toEqual([false, true, true])
  })
  it('a move from 16 Jul: holds the 15th, never from the move day on', () => {
    const r = rows([h('h0', 'p1', 'u142', '2026-07-15'), h('h1', 'p1', 'u149', '2026-07-16')], [view150('2026-07-15')])
    expect([holds(r, '2026-07-15'), holds(r, '2026-07-16'), holds(r, '2026-07-17')]).toEqual([true, false, false])
  })
  it('a move and back: ended at the move, never again', () => {
    const r = rows([h('h0', 'p1', 'u142', '2026-07-15'), h('h1', 'p1', 'u149', '2026-07-16'), h('h2', 'p1', 'u142', '2026-07-17')], [view150('2026-07-15')])
    expect([holds(r, '2026-07-15'), holds(r, '2026-07-16'), holds(r, '2026-07-18')]).toEqual([true, false, false])
  })
  it('a transfer months ahead: holds to the day before it (D2160)', () => {
    const r = rows([h('h0', 'p1', 'u142', '2026-07-15'), h('h1', 'p1', 'u149', '2026-11-01')], [view150('2026-07-15')])
    expect([holds(r, '2026-10-31'), holds(r, '2026-11-01')]).toEqual([true, false])
  })
  it('his baseline row, a same-day take-back and a first placing are no move', () => {
    expect(holds(rows([h('h0', 'p1', 'u142', '2026-07-15')], [view150('2026-07-15')]), '2026-07-16'), 'the baseline row').toBe(true)
    /* (setHome's take-back: his baseline row, and the move's row of that date replaced — the same id — by his squadron) */
    expect(holds(rows([h('h0', 'p1', 'u142', '2026-07-15'), h('h1', 'p1', 'u142', '2026-07-16')], [view150('2026-07-15')]), '2026-07-17'), 'taken back the same day').toBe(true)
    expect(holds(rows([h('h1', 'p1', 'u149', '2026-07-15')], [view150('2026-07-15')], ), '2026-07-20'), 'a first placing').toBe(true)
  })
  it('a right with no day counts from always (D56) and ends at any move', () => {
    expect(holds(rows([], [view150()]), '2026-07-20')).toBe(true)
    expect(holds(rows([h('h0', 'p1', 'u142', '2026-07-01'), h('h1', 'p1', 'u149', '2026-07-16')], [view150()]), '2026-07-20')).toBe(false)
  })
  it('a re-linked account: its rights count from the link day, past the new man\'s earlier move', () => {
    const r = rows([h('h0', 'p2', 'u142', '2026-01-01'), h('h1', 'p2', 'u149', '2026-07-10')], [view150('2026-07-15')])
    const relinked = { id: 'a1', pid: 'p2', pidFrom: '2026-07-18' }
    expect([holds(r, '2026-07-17', relinked), holds(r, '2026-07-18', relinked), holds(r, '2026-07-25', relinked)]).toEqual([false, true, true])
  })
  it('an ended row beside a new one: the one that holds is read', () => {
    const r = rows([h('h0', 'p1', 'u142', '2026-07-01'), h('h1', 'p1', 'u149', '2026-07-12')],
      [{ ...view150('2026-07-10'), id: 'g0' }, { id: 'g2', account: 'a1', unit: 'u150', level: 'admin', from: '2026-07-13' }])
    expect(grantOn(r, who, 'u150', '2026-07-15', 'u142')?.id).toBe('g2')
  })
  it('Plan is an admin\'s: an admin right on a member\'s account reads as none (PA2); View reads as View', () => {
    const r = rows([], [{ id: 'g1', account: 'a1', unit: 'u150', level: 'admin', from: '2026-07-15' }])
    expect(levelFrom({ ...who, role: 'main' }, 'u150', '2026-07-16', r, 'u142')).toBeNull()
    expect(levelFrom({ ...who, role: 'admin' }, 'u150', '2026-07-16', r, 'u142')).toBe('admin')
    expect(levelFrom({ ...who, role: 'main' }, 'u150', '2026-07-16', rows([], [view150('2026-07-15')]), 'u142')).toBe('view')
  })
})

describe('datedRowsBreach — one check for homes and places', () => {
  const today = '2026-07-15'
  const B = rows([h('h0', 'p1', 'u142', '2026-01-01')], [], [{ id: 'up1', unit: 'u142', place: 'p1', from: '2000-01-01' }])
  const move = (from: string, extra: Home[] = []) => rows([h('h0', 'p1', 'u142', '2026-01-01'), h('hx', 'p1', 'u149', from), ...extra], [], B.unitplaces)
  const check = (after: UnitRows, opts: Partial<Parameters<typeof datedRowsBreach>[3]> = {}) =>
    datedRowsBreach(B, after, today, { pids: ['p1'], units: [], adminOn: () => true, fallback: 'u142', ...opts })
  it('a man\'s squadron: a day begun refused, tomorrow and later allowed', () => {
    expect(check(move('2026-07-14'))?.code).toBe('begun')
    expect(check(move('2026-07-15'))?.code).toBe('begun')
    expect(check(move('2026-07-16'))).toBeNull()
    expect(check(move('2026-08-01'))).toBeNull()
  })
  it('who: an admin of the squadron he leaves; nobody moves himself (R1)', () => {
    expect(check(move('2026-07-16'), { adminOn: u => u !== 'u142' })).toMatchObject({ code: 'leaves', unit: 'u142' })
    expect(check(move('2026-07-16'), { self: 'p1' })).toMatchObject({ code: 'self', who: 'p1' })
  })
  it('a first placing from today, never before it; a man this command makes is not judged here', () => {
    const none = rows([], [], B.unitplaces)
    expect(datedRowsBreach(none, rows([h('h9', 'p9', 'u149', today)], [], B.unitplaces), today, { pids: ['p9'], units: [], fallback: null })).toBeNull()
    expect(datedRowsBreach(none, rows([h('h9', 'p9', 'u149', '2026-07-10')], [], B.unitplaces), today, { pids: ['p9'], units: [], fallback: null })?.code).toBe('first-past')
    expect(datedRowsBreach(none, rows([h('h9', 'p9', 'u149', '2026-07-10')], [], B.unitplaces), today, { pids: ['p9'], units: [], made: new Set(['p9']), fallback: null })).toBeNull()
  })
  it('a take-back of tomorrow\'s move: allowed, by an admin of the squadron he would have left', () => {
    const before = move('2026-07-16')
    expect(datedRowsBreach(before, B, today, { pids: ['p1'], units: [], adminOn: () => true, fallback: 'u142' })).toBeNull()
  })
  it('a squadron\'s place (K1): back-dated or a past row removed refused; from tomorrow allowed; a squadron new in the command not judged', () => {
    const placed = (from: string) => rows(B.homes, [], [...B.unitplaces, { id: 'up2', unit: 'u142', place: 'p2', from }])
    expect(check(placed('2026-01-01'), { pids: [], units: ['u142'] })?.code).toBe('begun')
    expect(check(placed('2026-07-16'), { pids: [], units: ['u142'] })).toBeNull()
    expect(datedRowsBreach(placed('2026-07-02'), B, today, { pids: [], units: ['u142'], fallback: 'u142' })?.code).toBe('begun')
    const noUnit: UnitRows = { ...B, units: B.units.filter(u => u.id !== 'u150') }
    expect(datedRowsBreach(noUnit, rows([], [], [{ id: 'up9', unit: 'u150', place: 'p1', from: today }]), today, { pids: [], units: ['u150'], fallback: 'u142' })).toBeNull()
  })
})

describe('in the shared world', () => {
  useMsqWorld()
  const grantChange = (g: any, op: 'put' | 'delete' = 'put'): Change => ({ op, collection: 'settings', id: 'grant:' + g.id, before: op === 'delete' ? g : null, after: op === 'delete' ? null : g })

  describe('restoreLeavesOut — the restore\'s one body (guardrails 1 and 2)', () => {
    const plan = { id: 'gz1', account: ACCT.hunter, unit: 'u149', level: 'admin', from: '2026-07-15' }
    const hunter = { id: ACCT.hunter, pid: PID.hunter, pidFrom: undefined }
    it('not a grant row: never left out', () => {
      expect(restoreLeavesOut({ op: 'put', collection: 'settings', id: 'account:x', before: null, after: {} }, { relink: true })).toBe(false)
    })
    it('3. it never removes a row not stored', () => {
      expect(restoreLeavesOut(grantChange(plan, 'delete'), { relink: false, stored: false })).toBe(true)
      expect(restoreLeavesOut(grantChange(plan, 'delete'), { relink: false, stored: true })).toBe(false)
    })
    it('1. a step that changed an account\'s man puts back no right', () => {
      expect(restoreLeavesOut(grantChange(plan), { relink: true, holder: hunter })).toBe(true)
    })
    /* (RE-POINTED AT U2: these two read rule 2 on a Plan row, so each now says the presser may give it — `mayPlan: true` —
       since rule 4 fails closed when not asked; what they pin, the man and his move, is unchanged) */
    it('2. put back for the man it named, no move since its start: kept; another man now on the sign-in: left out', () => {
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter, mayPlan: true })).toBe(false)
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: { ...hunter, pid: PID.ranger }, mayPlan: true })).toBe(true)
    })
    it('2. his move since its start: left out — judged as it stood when taken off, not as an earlier restore re-dated it', () => {
      expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })   // saved 15 Jul, from 16 Jul
      at('2026-07-17'); unitsLoad()
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter, mayPlan: true })).toBe(true)
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter, stood: { ...plan, from: '2026-07-17' }, mayPlan: true }), 'a row dated after his move').toBe(false)
    })
    /* (his D2250 — chat 129): a restore made by one who may not give Plan never puts a Plan row back — the Undo of an
       admin's making a Plan holder a member gives back the role only. RE-POINTED AT U2 (the brief §8): "is he a master
       admin" became "may he give Plan of that row's squadron" (`mayPlan` — his D2626), and it fails closed: not asked is
       left out, no longer "as before" */
    it('4. a Plan row put back by one who may not give it: left out; by one who may, or a View row: as before; not asked: left out', () => {
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter, mayPlan: false }), 'may not').toBe(true)
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter, mayPlan: true }), 'may').toBe(false)
      expect(restoreLeavesOut(grantChange({ ...plan, level: 'view' }), { relink: false, holder: hunter, mayPlan: false }), 'a View').toBe(false)
      expect(restoreLeavesOut(grantChange(plan), { relink: false, holder: hunter }), 'not asked: left out').toBe(true)
    })
  })

  /* his D2250 (21 Nov 26, "Yes let the admin downgrade") replaced D2248's "only a master admin": an admin of the man's own
     squadron — at home there, by Plan of it, or a master admin — may make him a member; his Plan goes in the same command,
     the last-admin check still guarding the squadron he held it of (D2247) */
  describe('R7 — a Plan holder made a member by an admin of his own squadron, his Plan going in that command (D2250, D2199)', () => {
    const planOfHunter = () => grantOfOn({ id: ACCT.hunter, pid: PID.hunter, pidFrom: accountById(ACCT.hunter)?.pidFrom }, 'u149')
    const givePlan = () => {
      signInAs('saber')
      expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
      expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    }
    it('Ranger, made a plain admin of 142, makes Hunter (Plan of 149) a member: allowed, and the Plan goes with it', () => {
      givePlan()
      signInAs('ranger')
      expect(updateAccount(ACCT.hunter, { role: 'main' }), "his own squadron's admin may").toBeNull()
      unitsLoad()
      expect(accountById(ACCT.hunter)?.role).toBe('main')
      expect(planOfHunter(), 'his Plan went in the same command').toBeUndefined()
      expect(unitRows().grants.some(g => g.account === ACCT.hunter && g.level === 'admin')).toBe(false)
    })
    it("Kestrel, 149's admin, may not — Hunter is not of his squadron; the Plan stands", () => {
      givePlan()
      signInAs('kestrel')
      expect(updateAccount(ACCT.hunter, { role: 'main' })).toBe("He is 142's. Only an admin of 142 can change his account.")
      unitsLoad()
      expect(accountById(ACCT.hunter)?.role).toBe('admin')
      expect(planOfHunter()?.level, 'his Plan stands').toBe('admin')
    })
    it('(control) Saber, the master admin, makes him a member: the Plan goes with it', () => {
      givePlan()
      expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
      unitsLoad()
      expect(planOfHunter()).toBeUndefined()
    })
    /* past the door, as a forged command would (the gate the backstop — perms.ts, the member's drop): it passes a Plan
       row only, and only beside the same account made a member in that command */
    const forged = (fn: () => void) => commitSettingsIntent('account.update', null, fn) as any
    it('past the door: his View of 149 dropped beside his making a member is refused; his Plan dropped alone is refused', () => {
      signInAs('saber')
      expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
      expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
      unitsLoad()
      const view = planOfHunter()!
      expect(view.level).toBe('view')
      signInAs('ranger')
      const row = store.get(ACCOUNT_PFX + ACCT.hunter, null)
      expect(row?.role).toBe('admin')
      const r1 = forged(() => { store.set(ACCOUNT_PFX + ACCT.hunter, { ...row, role: 'main' }); store.set(GRANT_PFX + view.id, null) })
      unitsLoad()
      expect(r1.ok, 'a View is not the member\'s drop').toBe(false)
      expect(planOfHunter()?.level).toBe('view')
      givePlan()
      unitsLoad()
      const plan = planOfHunter()!
      expect(plan.level).toBe('admin')
      signInAs('ranger')
      const r2 = forged(() => { store.set(GRANT_PFX + plan.id, null) })
      unitsLoad()
      expect(r2.ok, 'his Plan taken with his account kept an admin').toBe(false)
      expect(planOfHunter()?.level).toBe('admin')
    })
  })

  describe('"moves tomorrow" — for a giving or a raising only (Fable 4, Opus L3)', () => {
    it('on the day Hunter\'s move is saved: lowering Plan to View passes; giving and raising are refused; a removal passes', () => {
      signInAs('saber')
      expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
      expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
      /* Ranger, now an admin's sign-in, moves to 149 from tomorrow; his rights in 150 do not exist — Hunter's are read */
      expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
      signInAs('saber')
      expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter), 'a lowering').toMatchObject({ ok: true })
      expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter), 'a raising').toMatchObject({ ok: false, message: 'He moves squadron tomorrow — give this after the move' })
      expect(removeGrant(ACCT.hunter, 'u149').ok, 'a removal').toBe(true)
      expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter), 'a giving').toMatchObject({ ok: false, message: 'He moves squadron tomorrow — give this after the move' })
      /* (helper "kinds", K3 — his D2160: he joins as a member; was 'admin', the role read in any home) */
      expect(levelIn(ACCT.hunter, 'u149', '2026-07-16'), 'his own squadron from tomorrow — no right of 149 is his then, and he joins as a member').toBe('member')
    })
  })
})
