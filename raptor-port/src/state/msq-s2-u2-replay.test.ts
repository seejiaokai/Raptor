// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS A: THE UNDO AND REDO OF PLAN, AND THE REFUSED UNDO (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §3 R3, R4 and §8 "Replay (V7)", "The refused Undo (D2807)").
   His rulings: D2626 — Plan of a squadron given and ended by its own admins or a master admin; D2730 Q10 — one who can
   still sign in; D2730 Q11 — an Undo or Redo is asked of its presser as he stands today, refused whole in today's words;
   D2807 — the Undo of making a 149 admin a member, by one who may not make an admin of 149, refused saying why; D2250 —
   the Undo of "made a member" by one who may make him an admin again but not give the Plan: the role comes back, not the
   Plan. The world: withThird (his D2630), Wed 15 Jul 26.
   Sessions: a person's sign-in held on his device (the Undo list is his, and kept) while another admin acts on another
   (setSession + setMe, as state/midnight-swap-undo.test.ts does) — signInAs would start a fresh list. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT, third } from '../test-support/msq-world'
import {
  signIn, sessionFor, saveAccess, updateAccount, addAccount, accountById, accountOfPid, accountsLoad, levelIn,
  makeAdminUndoWords,
} from './accounts'
import { unitsLoad, todayIso, setGrant, removeGrant, unitRows } from './units'
import { GRANT_PFX } from './units-model'
import { setSession, setMe, SESSION } from './auth'
import { enterSquadron } from './store'
import { restoreLeavesOut } from './perms'
import * as wire from './undo-wire'
import { globalUndo, globalRedo } from '../undo/timeline'
import { invariants } from '../command/harness'
import { NOTICES } from './notices'
import { archivePerson } from '../leavewar/sync'
import { rosterOf } from '../engine/roster'
import { PEOPLE } from '../engine/people'

withThird()

const OUT_OF_BAND = 'Something else changed this after your action — it can’t be undone now.'
const NAMES: Record<string, [string, string, string]> = {
  saber: ['ad', 'a', 'stiff'], hunter: ['ad2', 'a2', 'prowler'], ranger: ['us', 'us', 'bane'],
  kestrel: ['ad9', 'a9', 'kes9'], osprey: ['us9', 'us9', 'osp9'],
}
/* another device: sign in there and act, the Undo list of the one held left as it stands */
const as = (who: keyof typeof NAMES | 'mako') => {
  const [n, p, pid] = who === 'mako' ? ['mako', 'x', PID.mako] : NAMES[who]!
  const s = sessionFor(signIn(n, p))
  setSession(s); setMe(pid)
  return s
}
const back = (s: any, pid: string) => { setSession(s); setMe(pid); reload() }
const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const grants = () => { reload(); return JSON.stringify(unitRows().grants) }
const bells = () => JSON.stringify(NOTICES)
const WHO = /Plan given, changed or taken by one who may not give it/
/* the gate's own reasons, as it gives them, while `fn` runs (the 'member-writes-own' invariant, read as it refuses) */
function gateSays(fn: () => void): string[] {
  const inv: any = invariants().find(i => i.id === 'member-writes-own')
  const orig = inv.check
  const seen: string[] = []
  inv.check = (env: any) => { const r = orig(env); if (r) seen.push(String(r)); return r }
  try { fn() } finally { inv.check = orig }
  return seen
}

/* Kestrel's own session, his older step first: Osprey made an admin of 149 (so 149 keeps an admin of its own when Kestrel
   loses his right — the last-admin lock would answer instead) */
function kestrelWithOlderStep(): any {
  signInAs('kestrel')
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
  reload()
  return SESSION
}
/* the session the device holds now (a live binding) */
const sessionNow = () => SESSION

/* the four kinds of Kestrel's step */
const kinds: Array<[string, () => void, () => string | null]> = [
  ['a give (Mako, Plan of 149)', () => {}, () => setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok ? null : 'refused'],
  ['a raise (Ranger, made 142\'s admin by Saber: View of 149 to Plan)', () => {
    const k = sessionNow(); as('saber'); expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull(); back(k, PID.kestrel)
  }, () => setGrant(ACCT.ranger, 'u149', 'admin', PID.ranger).ok ? null : 'refused'],
  ['an end (Hunter\'s Plan of 149)', () => {}, () => removeGrant(ACCT.hunter, 'u149').ok ? null : 'refused'],
  ['a lowering (Hunter\'s Plan of 149 to View)', () => {}, () => setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok ? null : 'refused'],
]
/* the four ways Kestrel loses the right, his session still open on his device */
const losses: Array<[string, (k: any) => void]> = [
  ['moved to 142, holding only Plan of 149', (k) => {
    as('saber')
    expect(moveMan(PID.kestrel, 'u142')).toMatchObject({ ok: true })
    on(16); reload()
    as('saber')
    expect(saveAccess(ACCT.kestrel, { role: 'admin', grants: { u149: 'plan' } }), 'Saber re-makes him 142\'s admin with Plan of 149').toBeNull()
    back(k, PID.kestrel)
    expect(level(ACCT.kestrel, 'u149'), 'a Plan holder of 149, not its own admin').toBe('admin')
  }],
  ['made a member (by Osprey, 149\'s admin)', (k) => {
    as('osprey')
    expect(updateAccount(ACCT.kestrel, { role: 'main' })).toBeNull()
    back(k, PID.kestrel)
  }],
  ['switched off', (k) => {
    as('saber')
    expect(updateAccount(ACCT.kestrel, { on: false })).toBeNull()
    back(k, PID.kestrel)
  }],
  ['archived', (k) => {
    as('saber')
    expect(archivePerson(PID.kestrel).bad).toBeNull()
    back(k, PID.kestrel)
  }],
]

describe('V7 — Kestrel\'s own steps, Undo and Redo (D2626, D2730 Q11)', () => {
  it('Kestrel gives Mako Plan of 149, Undo, Redo: each saved', () => {
    signInAs('kestrel')
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
    expect(level(ACCT.mako, 'u149')).toBe('admin')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(level(ACCT.mako, 'u149')).toBeNull()
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(level(ACCT.mako, 'u149')).toBe('admin')
  })
})

describe('V7 — Kestrel loses the right: his Undo of each kind is refused whole (R3)', () => {
  for (const [kind, pre, step] of kinds) {
    for (const [loss, lose] of losses) {
      it(`${kind}, then ${loss}: Undo refused, the Plan as it stands, no line struck, the next press takes the older step`, () => {
        kestrelWithOlderStep()
        pre()
        expect(step(), 'Kestrel\'s step saved').toBeNull()
        const k = sessionNow()
        lose(k)
        const g0 = grants(), b0 = bells()
        const first = globalUndo()
        expect(first.ok, 'refused').toBe(false)
        expect(grants(), 'nothing written').toBe(g0)
        expect(bells(), 'no line struck').toBe(b0)
        expect((first as any).reason, 'the next press named').toMatch(/ Press Undo again for: /)
        const second = globalUndo()
        expect(second.ok || (second as any).reason !== (first as any).reason, 'the next press takes the older step').toBe(true)
      })
    }
  }
})

describe('V7 — Kestrel loses the right: his Redo of each kind is refused whole (R3)', () => {
  for (const [kind, pre, step] of kinds) {
    for (const [loss, lose] of losses) {
      it(`${kind}, undone, then ${loss}: Redo refused, the Plan as it stands, no line struck`, () => {
        kestrelWithOlderStep()
        pre()
        expect(step(), 'Kestrel\'s step saved').toBeNull()
        const u = globalUndo()
        expect(u.ok, `setup: Kestrel's Undo ${JSON.stringify(u)}`).toBe(true)
        const k = sessionNow()
        lose(k)
        const g0 = grants(), b0 = bells()
        const r = globalRedo()
        expect(r.ok, 'refused').toBe(false)
        expect(grants(), 'nothing written').toBe(g0)
        expect(bells(), 'no line struck').toBe(b0)
      })
    }
  }
})

describe('V7 — refused whole, the context, the gate alone', () => {
  it('one Save lowering Hunter\'s Plan of 149 and giving him View of 150 (Kestrel holding Plan of 150): its Undo after Kestrel is switched off refused whole', () => {
    as('mako')
    expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'none' } }), 'setup: Mako ends Hunter\'s View of 150').toBeNull()
    expect(saveAccess(ACCT.kestrel, { grants: { [third.u150]: 'plan' } }), 'setup: Mako gives Kestrel Plan of 150').toBeNull()
    kestrelWithOlderStep()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view', [third.u150]: 'view' } }), 'Kestrel\'s one Save').toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('view')
    expect(level(ACCT.hunter, third.u150)).toBe('view')
    const k = sessionNow()
    losses.find(([n]) => n === 'switched off')![1](k)
    const g0 = grants()
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(grants(), 'neither row put back: Hunter keeps View of 150 and View of 149').toBe(g0)
  })
  it('a context with nothing handed in: no Plan row is put back (fails closed)', () => {
    const c: any = { collection: 'settings', id: GRANT_PFX + 'gz', op: 'put', before: null, after: { id: 'gz', account: ACCT.mako, unit: 'u149', level: 'admin', from: todayIso() } }
    expect(restoreLeavesOut(c, { relink: false })).toBe(true)
    expect(restoreLeavesOut(c, { relink: false, mayPlan: false })).toBe(true)
    expect(restoreLeavesOut(c, { relink: false, mayPlan: true, stored: false })).toBe(false)
  })
  /* (a give's Undo — an end of Plan: a put-back is left out by the restore's own rule 4 before the gate sees it, so the
     timeline already blocks that one in today's words; an end reaches the gate) */
  it('the gate alone, the timeline\'s two Plan checks taken out: Kestrel\'s Undo of his give of Plan of 149 to Mako, after his move, refused by name', () => {
    kestrelWithOlderStep()
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
    const k = sessionNow()
    losses[0]![1](k)
    const g0 = grants()
    ;(wire as any)._planChecks?.(false)
    try {
      let r: any
      const said = gateSays(() => { r = globalUndo() })
      expect(r.ok).toBe(false)
      expect(grants()).toBe(g0)
      expect(said.join(' | '), `the press said: ${r.reason}`).toMatch(WHO)
    } finally { (wire as any)._planChecks?.(true) }
  })
  it('pin: Saber\'s Undo of Kestrel\'s step is refused as today (D148): the Plan Kestrel gave stands', () => {
    signInAs('kestrel')
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
    as('saber')
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(level(ACCT.mako, 'u149')).toBe('admin')
  })
})

describe('V7 — the Undo of "made a member" (D2250, D2807)', () => {
  it('pin: Saber makes Hunter a member (his Plan of 149 dropped); Undo: both back; Redo: the Plan dropped again', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBeNull()
    expect(globalUndo().ok).toBe(true)
    reload()
    expect(accountById(ACCT.hunter)!.role).toBe('admin')
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(globalRedo().ok).toBe(true)
    reload()
    expect(accountById(ACCT.hunter)!.role).toBe('main')
    expect(level(ACCT.hunter, 'u149'), 'the make-member Redo drops the Plan again').toBeNull()
  })
  it('pin: Ranger, made 142\'s admin, makes Hunter a member; his Undo: the role back, no Plan of 149, Hunter\'s own "ended" line stands', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    reload()
    expect(level(ACCT.hunter, 'u149')).toBeNull()
    const ended0 = JSON.stringify(NOTICES.filter(n => String(n.to) === PID.hunter && (n as any).what?.[0]?.u === 'u149'))
    const r = globalUndo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    reload()
    expect(accountById(ACCT.hunter)!.role).toBe('admin')
    expect(level(ACCT.hunter, 'u149'), 'the Plan is not put back by one who may not give it').toBeNull()
    expect(JSON.stringify(NOTICES.filter(n => String(n.to) === PID.hunter && (n as any).what?.[0]?.u === 'u149')), 'his own line about 149 stands').toBe(ended0)
  })
  it('Kestrel, holding Plan of 142, makes Hunter a member; his Undo: refused in D2807\'s words for 142 (he may not make an admin of 142)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { grants: { u142: 'plan' } }), 'setup: Saber gives Kestrel Plan of 142').toBeNull()
    signInAs('kestrel')
    enterSquadron('u142'); reload()
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    reload()
    const g0 = grants()
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(String((r as any).reason)).toContain(makeAdminUndoWords('u142'))
    expect(accountById(ACCT.hunter)!.role).toBe('main')
    expect(grants()).toBe(g0)
  })
})

describe('The refused Undo (D2807)', () => {
  /* Hunter, holding Plan of 149, with 149 picked: his older step ends Ranger's View of 149; Kestrel (another device) makes
     Osprey an admin of 149; Hunter makes Osprey a member (D2250 lets him) */
  function setup(): void {
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'none' } }), 'Hunter\'s older step').toBeNull()
    const h = sessionNow()
    as('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    back(h, PID.hunter)
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'Hunter makes Osprey a member').toBeNull()
    reload()
    expect(accountById(ACCT.osprey)!.role).toBe('main')
  }
  it('Hunter\'s Undo: refused in D2807\'s sentence, then " Press Undo again for: …"; Osprey still a member; nothing struck; a second press takes the older step', () => {
    setup()
    const b0 = bells()
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(String((r as any).reason)).toMatch(new RegExp(`^${makeAdminUndoWords('u149').replace(/[.*+?^${}()|[\]\\]/g, (m) => '\\' + m)} Press Undo again for: `))
    reload()
    expect(accountById(ACCT.osprey)!.role).toBe('main')
    expect(bells(), 'nothing struck').toBe(b0)
    const r2 = globalUndo()
    expect(r2.ok, JSON.stringify(r2)).toBe(true)
    expect(level(ACCT.ranger, 'u149'), 'the older step: Ranger\'s View of 149 back').toBe('view')
  })
  it('the same restore at the gate, the timeline\'s checks taken out: refused by name', () => {
    setup()
    ;(wire as any)._planChecks?.(false)
    try {
      let r: any
      const said = gateSays(() => { r = globalUndo() })
      expect(r.ok).toBe(false)
      reload()
      expect(accountById(ACCT.osprey)!.role).toBe('main')
      expect(said.join(' | ')).toMatch(/a man made an admin of u149 by one who may not give its Plan/)
    } finally { (wire as any)._planChecks?.(true) }
  })
  it('the Redo stand-in, in today\'s words — changes when the Redo\'s words are ruled', () => {
    kestrelWithOlderStep()
    /* Kestrel's Undo: Osprey a member again; then an extra 149 admin by Saber, so Kestrel can lose the right */
    expect(globalUndo().ok).toBe(true)
    reload()
    expect(accountById(ACCT.osprey)!.role).toBe('main')
    const ks = sessionNow()
    as('saber')
    enterSquadron('u149'); reload()
    const free = rosterOf('u149', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)
    expect(free, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(addAccount('extra@mail', free!, 'admin'), 'setup: Saber adds an extra 149 admin').toBeNull()
    back(ks, PID.kestrel)
    losses[0]![1](ks)
    const g0 = grants()
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(String((r as any).reason).startsWith(OUT_OF_BAND)).toBe(true)
    reload()
    expect(accountById(ACCT.osprey)!.role).toBe('main')
    expect(grants()).toBe(g0)
  })
})
