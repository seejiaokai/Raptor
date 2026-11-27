// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS B: THE SQUADRON'S PLAN LINES (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §4's last row, §5 "Pass B", §8 "The lines (V10)" and the gate's
   "Forged Plan lines"; the plan docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §19.2 "The bell").
   His rulings: D2626 — Plan of a squadron given or ended, its admins told on the bell; D2654 E6 — who is told: everyone who
   already gets that squadron's admin lines, never the one who pressed, the man himself only his own account's line; D2654
   E9l — an ending the app makes is told, the line saying why; D2808 — the four endings (archive, overseas posting, delete,
   made a master admin) are U2L's step, so today they write no squadron line (pinned here).
   The words (§4, drawn s2-33, s2-34): "Given Plan of 149" · "Plan of 149 ended" · "Plan of 149 ended: made a member" ·
   "Plan of 149 ended: he moved to 150" — under the man's name, signed "· Kestrel", the move's unsigned (the app's).
   The agent's reading, named in the report: View raised to Plan reads "Given Plan of 149"; Plan lowered to View reads
   "Plan of 149 ended".
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter is 142's admin holding Plan of 149 and
   View of 150; Kestrel 149's own admin; Mako 150's own admin; Saber the master admin (home 142); Ranger 142's member, View
   of 149 and 150; Osprey 149's member. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, PID, ACCT, third, moveMan, pastMidnight, on, mem } from '../test-support/msq-world'
import { NOTICESEEN_PFX, noticeSeenLoad } from './noticeseen'
import { NOTICES, noticesFor, noticeWords, type Notice } from './notices'
import { saveAccess, updateAccount, setMaster, accountsLoad, levelIn } from './accounts'
import { setGrant, unitsLoad, todayIso, unitRows } from './units'
import { commitSettingsIntent } from './people-settings-commit'
import { commitProjection } from '../command'
import { HOOKS, store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { globalUndo, globalRedo } from '../undo/timeline'
import { archivePerson, postOut, runPoArchive } from '../leavewar/sync'
import { deletePerson } from './person-delete'

withThird()
beforeEach(() => { NOTICES.length = 0 })

const cs = (pid: string): string => String((PEOPLE as any)[pid]?.cs ?? pid)
const reload = () => { unitsLoad(); accountsLoad() }
const isSq = (n: Notice): boolean => ((n.what || [])[0] as any)?.k === 'sqplan'
/* every squadron Plan line stored, as "<reader> ← <the man> · <what> · <who>", sorted */
const sq = (): string[] => NOTICES.filter(isSq).map(n => {
  const w = noticeWords(n)
  return `${cs(n.to)} ← ${w.name} · ${w.what}${w.who ? ` · ${w.who}` : ''}`
}).sort()
/* his own account's lines, as "<to> · <what>" */
const own = (pid: string): string[] => NOTICES.filter(n => String(n.to) === pid && !isSq(n)).map(n => noticeWords(n).what)

describe('V10 — each of the four lines reaches the squadron\'s admins, never the one who pressed (D2626, D2654 E6)', () => {
  it('"Given Plan of 149": Kestrel gives Mako Plan of 149 — Hunter (a Plan holder) and Saber (a master admin) told; Kestrel and Mako not', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    expect(sq()).toEqual(['Hunter ← Mako · Given Plan of 149 · Kestrel', 'Saber ← Mako · Given Plan of 149 · Kestrel'])
    /* (stamped with its squadron — the bell's switch, its number and its tap read it) */
    expect(NOTICES.filter(isSq).every(n => n.u === 'u149' && n.iid === '' && n.by === PID.kestrel)).toBe(true)
    /* the man himself: his own account's line only (D2654 E6) */
    expect(own(PID.mako)).toEqual(['Given Plan of 149: full access to 149'])
    expect(NOTICES.filter(n => isSq(n) && (String(n.to) === PID.mako || String(n.to) === PID.kestrel))).toEqual([])
  })
  it('"Given Plan of 149" on a raise too (the agent\'s reading): Mako\'s View of 149 raised to Plan', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'view' } })).toBeNull()
    expect(sq(), 'pin: a View given tells the squadron\'s admins nothing').toEqual([])
    on(15, 10)
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
    expect(sq()).toEqual(['Hunter ← Mako · Given Plan of 149 · Kestrel', 'Saber ← Mako · Given Plan of 149 · Kestrel'])
  })
  it('"Plan of 149 ended": Kestrel ends Hunter\'s Plan — Mako (a Plan holder since) and Saber told; Hunter his own line only', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull()
    expect(sq()).toEqual(['Mako ← Hunter · Plan of 149 ended · Kestrel', 'Saber ← Hunter · Plan of 149 ended · Kestrel'])
    expect(own(PID.hunter)).toEqual(['Plan of 149 ended'])
  })
  it('"Plan of 149 ended" on a lowering too (the agent\'s reading): Hunter\'s Plan lowered to View', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(sq()).toEqual(['Saber ← Hunter · Plan of 149 ended · Kestrel'])
    expect(own(PID.hunter)).toEqual(['Plan of 149 ended', 'Given View of 149'])
  })
  it('"Plan of 149 ended: made a member": Saber makes Hunter a member — Kestrel told, signed Saber', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(sq()).toEqual(['Kestrel ← Hunter · Plan of 149 ended: made a member · Saber'])
  })
  it('…and by 142\'s own admin who may not give Plan of 149 (D2250): Ranger, made an admin, makes Hunter a member — Kestrel and Saber told', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    NOTICES.length = 0
    on(15, 10)
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(sq()).toEqual(['Kestrel ← Hunter · Plan of 149 ended: made a member · Ranger', 'Saber ← Hunter · Plan of 149 ended: made a member · Ranger'])
  })
  it('"Plan of 149 ended: he moved to 150": Hunter moved to 150 — on the move\'s day the app tells 149\'s admins, unsigned, once', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    expect(sq(), 'a move saved today ends nothing today').toEqual([])
    pastMidnight()
    expect(sq()).toEqual(['Kestrel ← Hunter · Plan of 149 ended: he moved to 150', 'Saber ← Hunter · Plan of 149 ended: he moved to 150'])
    expect(NOTICES.filter(isSq).every(n => n.by == null && n.u === 'u149')).toBe(true)
    /* on Kestrel's bell (149 his home) */
    expect(noticesFor(PID.kestrel).filter(isSq).map(n => noticeWords(n).what)).toEqual(['Plan of 149 ended: he moved to 150'])
    /* a second wake writes nothing */
    window.dispatchEvent(new Event('focus'))
    expect(NOTICES.filter(isSq).length).toBe(2)
  })
})

describe('V10 — an Undo takes them back, a Redo puts them back (D1693)', () => {
  it('Kestrel gives Mako Plan of 149, Undo: the admins\' lines gone; Redo: back', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    const made = JSON.stringify(NOTICES.filter(isSq))
    expect(sq().length).toBe(2)
    expect(globalUndo().ok).toBe(true)
    expect(sq()).toEqual([])
    expect(globalRedo().ok).toBe(true)
    expect(JSON.stringify(NOTICES.filter(isSq)), 'the same lines put back').toBe(made)
  })
  it('the Undo of a make-member by 142\'s admin who may not give Plan of 149: the role back, no Plan, both "ended" lines stand (R3 (c))', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    const lines = JSON.stringify(NOTICES.filter(isSq))
    expect(sq().length).toBe(2)
    const r = globalUndo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'no Plan of 149 put back').toBeNull()
    expect(JSON.stringify(NOTICES.filter(isSq)), 'the squadron\'s "ended: made a member" lines stand').toBe(lines)
  })
  it('…and Hunter, who had read his own lines: told "Made an admin of 142" alone, nothing given back of 149, his "Plan of 149 ended" standing (the opposite line after a restore — the plan l.2566–2570, proven either way)', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(own(PID.hunter)).toEqual(['Made a member', 'Plan of 149 ended'])
    on(15, 10)
    /* he has read everything on his bell (his own read record, as his tap writes it — seeded as msq-acct-lines does) */
    mem[`sqn142_${NOTICESEEN_PFX}${PID.hunter}`] = JSON.stringify({ upto: Date.now(), ids: [] }); noticeSeenLoad()
    const r = globalUndo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(own(PID.hunter)).toEqual(['Plan of 149 ended', 'Made an admin of 142'])
  })
  it('the same Undo by Saber: the role and the Plan back, the admins\' lines taken back', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(sq().length).toBe(1)
    expect(globalUndo().ok).toBe(true)
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('admin')
    expect(sq()).toEqual([])
  })
})

describe('pin: D2808\'s four endings write no line to the squadron\'s admins today (U2L, the next step)', () => {
  it('archived', () => {
    signInAs('saber')
    expect(archivePerson(PID.hunter).bad).toBeNull()
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'the premise: his Plan ended').toBeNull()
    expect(sq()).toEqual([])
  })
  it('posted overseas', () => {
    signInAs('saber')
    expect(postOut(PID.hunter, todayIso(), 'overseas')).toBe(true)
    runPoArchive()
    reload()
    expect((PEOPLE as any)[PID.hunter].archived, 'the premise: the posting ran').toBe(true)
    expect(sq()).toEqual([])
  })
  it('deleted', () => {
    signInAs('saber')
    expect(deletePerson(PID.hunter)).toBeNull()
    expect(sq()).toEqual([])
  })
  it('made a master admin', () => {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(own(PID.hunter)).toContain('Plan of 149 ended: master admin covers every squadron')
    expect(sq()).toEqual([])
  })
})

/* ---- the gate: a Plan line only as its change owes it (the brief §5 "state/perms.ts adminOwnerViolation"; the plan
   §19.2's security S2) ---- */
let seq = 0
function sqLine(to: string, by: string | null, who: string, c: string, extra: Record<string, unknown> = {}): Notice {
  return { id: 'sqf' + (++seq), to, by, at: Date.now(), iid: '', name: cs(who), day: todayIso(), what: [{ k: 'sqplan', who, c, num: '149' } as any], u: 'u149', ...extra } as Notice
}
/* a hand-built command as Admin → Users' doors build it: the rows written, then the lines */
function forge(rows: Array<[string, unknown]>, lines: Notice[], type = 'grant.set', meta: unknown = null): string | null {
  const r = commitSettingsIntent(type, meta, (txn: any) => {
    for (const [k, v] of rows) store.set(k, v)
    HOOKS.bellEnlist(txn)
    for (const n of lines) NOTICES.push(n)
    HOOKS.bellEnd()
  })
  return (r as any).ok === false ? String((r as any).message ?? (r as any).reason) : null
}
/* every forged line below is refused by the Plan lines' own rule, by name */
const PL = /a squadron's Plan line/
const planRow = (id: string, account: string, unit = 'u149') => [`grant:${id}`, { id, account, unit, level: 'admin', from: todayIso(), fromAt: Date.now() }] as [string, unknown]
/* the id of the right an account holds in a squadron today (a raise rewrites that row) */
const grantId = (account: string, unit: string): string => {
  const g = unitRows().grants.find(x => x.account === account && x.unit === unit)
  expect(g, 'the premise: the right is there').toBeTruthy()
  return String(g!.id)
}

describe('the gate: forged Plan lines are refused', () => {
  it('(control) the honest line a hand-built give owes: saved', () => {
    signInAs('kestrel')
    expect(forge([planRow('gk1', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'given'), sqLine(PID.hunter, PID.kestrel, PID.mako, 'given')])).toBeNull()
  })
  it('no row changed', () => {
    signInAs('kestrel')
    expect(forge([], [sqLine(PID.saber, PID.kestrel, PID.mako, 'given')])).toMatch(PL)
    expect(sq()).toEqual([])
  })
  it('another account\'s row: Mako given, the line about Ranger', () => {
    signInAs('kestrel')
    expect(forge([planRow('gk2', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.ranger, 'given')])).toMatch(PL)
  })
  it('another squadron\'s row: Hunter\'s View of 150 raised by Mako, the line stamped 149', () => {
    signInAs('mako')
    expect(forge([planRow(grantId(ACCT.hunter, third.u150), ACCT.hunter, third.u150)], [sqLine(PID.kestrel, PID.mako, PID.hunter, 'given')])).toMatch(PL)
  })
  it('unsigned, or signed as another', () => {
    signInAs('kestrel')
    expect(forge([planRow('gk4', ACCT.mako)], [sqLine(PID.saber, null, PID.mako, 'given')])).toMatch(PL)
    expect(forge([planRow('gk5', ACCT.mako)], [sqLine(PID.saber, PID.hunter, PID.mako, 'given')])).toMatch(PL)
  })
  it('a reader outside the audience: Osprey (149\'s member), the presser himself, the man himself', () => {
    signInAs('kestrel')
    expect(forge([planRow('gk6', ACCT.mako)], [sqLine(PID.osprey, PID.kestrel, PID.mako, 'given')])).toMatch(PL)
    expect(forge([planRow('gk7', ACCT.mako)], [sqLine(PID.kestrel, PID.kestrel, PID.mako, 'given')])).toMatch(PL)
    expect(forge([planRow('gk8', ACCT.mako)], [sqLine(PID.mako, PID.kestrel, PID.mako, 'given')])).toMatch(PL)
  })
  it('two lines to one reader', () => {
    signInAs('kestrel')
    expect(forge([planRow('gk9', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'given'), sqLine(PID.saber, PID.kestrel, PID.mako, 'given')])).toMatch(PL)
  })
  it('words that do not match the change: "ended" for a give, "made a member" where no one was made one, "moved" from a person', () => {
    signInAs('kestrel')
    expect(forge([planRow('gka', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'ended')])).toMatch(PL)
    expect(forge([planRow('gkb', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'member')])).toMatch(PL)
    expect(forge([planRow('gkc', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'moved', { what: [{ k: 'sqplan', who: PID.mako, c: 'moved', num: '149', mv: '150' }] })])).toMatch(PL)
  })
  it('stamped with another squadron', () => {
    signInAs('kestrel')
    expect(forge([planRow('gkd', ACCT.mako)], [sqLine(PID.saber, PID.kestrel, PID.mako, 'given', { u: 'u142' })])).toMatch(PL)
  })
  it('by a member\'s command', () => {
    signInAs('osprey')
    /* (a command type a member may raise — his own read mark's — carrying the line) */
    expect(forge([], [sqLine(PID.kestrel, PID.osprey, PID.hunter, 'ended')], 'notices.seen', { owner: PID.osprey })).toMatch(PL)
  })
  it('the app\'s own writer for a move that never happened', () => {
    const r = commitProjection({ type: 'account.told', scope: { module: 'inputs' }, apply: (txn: any) => {
      HOOKS.bellEnlist(txn)
      NOTICES.push(sqLine(PID.kestrel, null, PID.hunter, 'moved', { id: `sqplan:mv:${ACCT.hunter}:${todayIso()}:u149:${PID.kestrel}`, what: [{ k: 'sqplan', who: PID.hunter, c: 'moved', num: '149', mv: '150' }] }))
      HOOKS.bellEnd()
    } })
    expect((r as any).ok).toBe(false)
    expect(String((r as any).message)).toMatch(PL)
    expect(sq()).toEqual([])
  })
})
